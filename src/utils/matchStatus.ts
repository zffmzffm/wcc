export const MATCH_LIVE_WINDOW_MINUTES = 120;

export type MatchTimingStatus =
    | {
        kind: 'live';
        label: 'LIVE';
    }
    | {
        kind: 'upcoming';
        label: string;
        minutesUntilStart: number;
    }
    | {
        kind: 'past';
        label: null;
    };

const MINUTE_MS = 60 * 1000;
const HOUR_MINUTES = 60;
const DAY_MINUTES = 24 * HOUR_MINUTES;

export function formatCountdownLabel(minutesUntilStart: number): string {
    const safeMinutes = Math.max(1, Math.ceil(minutesUntilStart));
    const days = Math.floor(safeMinutes / DAY_MINUTES);
    const hours = Math.floor((safeMinutes % DAY_MINUTES) / HOUR_MINUTES);
    const minutes = safeMinutes % HOUR_MINUTES;

    if (days > 0) {
        return `in ${days}D ${hours}H ${minutes}M`;
    }

    if (hours > 0) {
        return `in ${hours}H ${minutes}M`;
    }

    return `in ${minutes}M`;
}

export function getMatchTimingStatus(
    datetime: string,
    now: Date = new Date(),
    liveWindowMinutes = MATCH_LIVE_WINDOW_MINUTES
): MatchTimingStatus {
    const startTime = new Date(datetime).getTime();
    const nowTime = now.getTime();
    const elapsedMinutes = (nowTime - startTime) / MINUTE_MS;

    if (elapsedMinutes >= 0 && elapsedMinutes < liveWindowMinutes) {
        return {
            kind: 'live',
            label: 'LIVE',
        };
    }

    if (elapsedMinutes >= liveWindowMinutes) {
        return {
            kind: 'past',
            label: null,
        };
    }

    const minutesUntilStart = Math.ceil((startTime - nowTime) / MINUTE_MS);

    return {
        kind: 'upcoming',
        label: formatCountdownLabel(minutesUntilStart),
        minutesUntilStart,
    };
}
