'use client';

import { useEffect, useMemo, useState } from 'react';
import { City, Match, ScoreLine, Team } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { formatDateTimeWithTimezone, getTeamDisplay } from '@/utils/formatters';
import { getMatchTimingStatus, MatchTimingStatus } from '@/utils/matchStatus';
import { getScoreDisplay } from '@/utils/score';

interface LiveMatchStackProps {
    matches: Match[];
    knockoutVenues: KnockoutVenue[];
    cities: City[];
    teams: Team[];
    timezone: string;
    onCitySelect?: (city: City) => void;
}

type MatchStackEvent = {
    id: string;
    datetime: string;
    city: City;
    team1: string;
    team2: string;
    stageLabel: string;
    stageBadgeLabel: string;
    score?: ScoreLine;
    status: MatchTimingStatus;
};

const MAX_VISIBLE_MATCHES = 4;
const TICK_INTERVAL_MS = 60 * 1000;

function splitMatchup(matchup?: string): [string, string] {
    const [left, right] = (matchup || 'TBD vs TBD').split(' vs ');
    return [left || 'TBD', right || 'TBD'];
}

function getStageLabel(event: Match | KnockoutVenue): string {
    if ('group' in event) {
        return `Group ${event.group}`;
    }

    return event.stage === '3P' ? 'Third Place' : event.stage;
}

function getStageBadgeLabel(event: Match | KnockoutVenue): string {
    if ('group' in event) {
        return event.group;
    }

    if (event.stage === 'R32') return '32';
    if (event.stage === 'R16') return '16';

    return event.stage;
}

export default function LiveMatchStack({
    matches,
    knockoutVenues,
    cities,
    teams,
    timezone,
    onCitySelect,
}: LiveMatchStackProps) {
    const [now, setNow] = useState(() => new Date());
    const [isMatchStackOpen, setIsMatchStackOpen] = useState(false);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNow(new Date());
        }, TICK_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    const visibleEvents = useMemo<MatchStackEvent[]>(() => {
        const cityById = new Map(cities.map(city => [city.id, city]));
        const groupEvents = matches.map(match => ({
            id: `group-${match.id}`,
            datetime: match.datetime,
            city: cityById.get(match.cityId),
            team1: getTeamDisplay(match.team1, teams).code,
            team2: getTeamDisplay(match.team2, teams).code,
            stageLabel: getStageLabel(match),
            stageBadgeLabel: getStageBadgeLabel(match),
            score: match.score,
        }));
        const knockoutEvents = knockoutVenues.map(venue => {
            const [team1, team2] = splitMatchup(venue.matchup);

            return {
                id: `knockout-${venue.matchId}`,
                datetime: venue.datetime,
                city: cityById.get(venue.cityId),
                team1,
                team2,
                stageLabel: getStageLabel(venue),
                stageBadgeLabel: getStageBadgeLabel(venue),
                score: venue.score,
            };
        });

        return [...groupEvents, ...knockoutEvents]
            .flatMap(event => {
                if (!event.city) return [];

                const status = getMatchTimingStatus(event.datetime, now);
                if (status.kind === 'past') return [];

                return [{ ...event, city: event.city, status }];
            })
            .sort((a, b) => {
                if (a.status.kind !== b.status.kind) {
                    return a.status.kind === 'live' ? -1 : 1;
                }

                const timeDiff = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
                if (timeDiff !== 0) return timeDiff;

                return a.id.localeCompare(b.id);
            })
            .slice(0, MAX_VISIBLE_MATCHES);
    }, [cities, knockoutVenues, matches, now, teams]);

    if (visibleEvents.length === 0) {
        return null;
    }

    return (
        <aside
            className={`live-match-stack${isMatchStackOpen ? ' is-mobile-expanded' : ''}`}
            aria-label="Live and upcoming matches"
        >
            <div className="live-match-stack-header">
                <span className="live-match-stack-title">Now / Next</span>
                <span className="live-match-stack-count">{visibleEvents.length} matches</span>
            </div>
            <button
                type="button"
                className="live-match-stack-toggle"
                aria-expanded={isMatchStackOpen}
                aria-controls="live-match-stack-list"
                aria-label={isMatchStackOpen ? 'Collapse next matches' : 'Expand next matches'}
                onClick={() => setIsMatchStackOpen(open => !open)}
            >
                <span className="live-match-stack-title">Now / Next</span>
                <span className="live-match-stack-count">{visibleEvents.length} matches</span>
                <span className="live-match-toggle-chevron" aria-hidden="true" />
            </button>
            <div className="live-match-stack-list" id="live-match-stack-list">
                {visibleEvents.map(event => {
                    const { time } = formatDateTimeWithTimezone(event.datetime, timezone);
                    const isLive = event.status.kind === 'live';
                    const scoreDisplay = getScoreDisplay(event.score);
                    const matchupAriaLabel = `${event.team1} ${scoreDisplay.ariaLabel} ${event.team2}`;

                    return (
                        <button
                            key={event.id}
                            className="live-match-card"
                            type="button"
                            onClick={() => onCitySelect?.(event.city)}
                            aria-label={`${event.stageLabel}: ${matchupAriaLabel} in ${event.city.name}`}
                        >
                            <span className="live-match-stage-badge" aria-hidden="true">
                                {event.stageBadgeLabel}
                            </span>
                            <span className={`live-match-status ${isLive ? 'is-live' : 'is-upcoming'}`}>
                                {event.status.label}
                            </span>
                            <span className="live-match-main">
                                <span className="live-match-teams">
                                    <span>{event.team1}</span>
                                    <span
                                        className={`live-match-vs${scoreDisplay.isScored ? ' is-scored' : ''}`}
                                        aria-label={scoreDisplay.ariaLabel}
                                    >
                                        {scoreDisplay.label}
                                    </span>
                                    <span>{event.team2}</span>
                                </span>
                                <span className="live-match-meta">
                                    <span>{time}</span>
                                    <span className="live-match-dot" aria-hidden="true" />
                                    <span>{event.city.name}</span>
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
