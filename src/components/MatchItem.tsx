'use client';
import { memo } from 'react';
import { Match, Team } from '@/types';
import { formatDateTimeWithTimezone, getTeamDisplay } from '@/utils/formatters';
import { useHoverMatch } from '@/contexts/HoverMatchContext';
import FlagIcon from './FlagIcon';

interface MatchItemProps {
    match: Match;
    teams: Team[];
    timezone: string;
    highlightTeamCode?: string;
    variant?: 'default' | 'schedule';
    matchIndex?: number;
    cityName?: string;
}

/**
 * Memoized match item component to prevent unnecessary re-renders
 * when timezone or other props haven't changed.
 */
const MatchItem = memo(function MatchItem({
    match,
    teams,
    timezone,
    highlightTeamCode,
    variant = 'default',
    matchIndex,
    cityName
}: MatchItemProps) {
    const team1 = getTeamDisplay(match.team1, teams);
    const team2 = getTeamDisplay(match.team2, teams);
    const { date, time } = formatDateTimeWithTimezone(match.datetime, timezone);
    const isTeam1Highlighted = highlightTeamCode === match.team1;
    const isTeam2Highlighted = highlightTeamCode === match.team2;

    // Hover state from context
    const { hoveredMatchId, setHoveredMatchId } = useHoverMatch();
    const isHovered = hoveredMatchId === match.id;

    const handleMouseEnter = () => setHoveredMatchId(match.id);
    const handleMouseLeave = () => setHoveredMatchId(null);

    if (variant === 'schedule') {
        return (
            <li
                className={`match-item schedule-item ${isHovered ? 'match-item-hovered' : ''}`}
                role="listitem"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="match-info-row">
                    <span className="match-number">Match {(matchIndex ?? 0) + 1}</span>
                    <span className="match-datetime-inline">
                        <span className="match-date">{date}</span>
                        <span className="match-time">{time}</span>
                    </span>
                    {cityName && <span className="match-venue">{cityName}</span>}
                </div>
                <div className="match-teams">
                    <span className={`team ${isTeam1Highlighted ? 'highlight-team' : ''}`}>
                        <FlagIcon code={team1.code} size={18} />
                        <span className="team-name">{team1.name}</span>
                    </span>
                    <span className="vs">VS</span>
                    <span className={`team ${isTeam2Highlighted ? 'highlight-team' : ''}`}>
                        <FlagIcon code={team2.code} size={18} />
                        <span className="team-name">{team2.name}</span>
                    </span>
                </div>
            </li>
        );
    }

    return (
        <li
            className={`match-item ${isHovered ? 'match-item-hovered' : ''}`}
            role="listitem"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="match-header">
                <span className="match-group">Group {match.group}</span>
                <span className="match-datetime">
                    {cityName && <span className="match-venue">📍 {cityName}</span>}
                    <span className="match-time">{time}</span>
                </span>
            </div>
            <div className="match-teams">
                <span className="team">
                    <FlagIcon code={team1.code} size={20} />
                    <span className="team-name">{team1.name}</span>
                </span>
                <span className="vs">VS</span>
                <span className="team">
                    <FlagIcon code={team2.code} size={20} />
                    <span className="team-name">{team2.name}</span>
                </span>
            </div>
        </li>
    );
});

export default MatchItem;
