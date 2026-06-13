import type { Match } from '@/types';
import type { KnockoutVenue } from '@/repositories/types';
import { getMatchDay } from './dateUtils';
import { MATCH_LIVE_WINDOW_MINUTES } from './matchStatus';

export type MatchScheduleEvent = Pick<Match, 'datetime'> | Pick<KnockoutVenue, 'datetime'>;

export const DEFAULT_MATCH_DAY_REFRESH_HOUR_EDT = 2;

const EASTERN_TIME_ZONE = 'America/New_York';
const MINUTE_MS = 60 * 1000;

function getEasternDateParts(date: Date): { dateStr: string; hour: number } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: EASTERN_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = Number(parts.find(p => p.type === 'hour')?.value ?? '0');

    return {
        dateStr: `${year}-${month}-${day}`,
        hour,
    };
}

function addUtcDays(dateStr: string, daysToAdd: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + daysToAdd, 12, 0, 0));

    return date.toISOString().slice(0, 10);
}

export function getDefaultSelectionDate(now: Date = new Date()): string {
    const { dateStr, hour } = getEasternDateParts(now);

    return hour < DEFAULT_MATCH_DAY_REFRESH_HOUR_EDT
        ? addUtcDays(dateStr, -1)
        : dateStr;
}

export function getDefaultInitialMatchDay(
    scheduleEvents: MatchScheduleEvent[],
    now: Date = new Date(),
    liveWindowMinutes = MATCH_LIVE_WINDOW_MINUTES
): string | null {
    const eventStartTimes = scheduleEvents
        .map(event => new Date(event.datetime).getTime())
        .filter(Number.isFinite);

    if (eventStartTimes.length === 0) {
        return null;
    }

    const tournamentEndTime = Math.max(...eventStartTimes) + liveWindowMinutes * MINUTE_MS;
    if (now.getTime() >= tournamentEndTime) {
        return null;
    }

    const matchDays = Array.from(
        new Set(scheduleEvents.map(event => getMatchDay(event.datetime)))
    ).sort();
    const defaultDate = getDefaultSelectionDate(now);

    return matchDays.find(matchDay => matchDay >= defaultDate) ?? null;
}
