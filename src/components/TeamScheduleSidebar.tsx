'use client';
import { useMemo } from 'react';
import { Match, Team, City } from '@/types';
import FlagIcon from './FlagIcon';
import MatchItem from './MatchItem';

interface TeamScheduleSidebarProps {
    team: Team | null;
    matches: Match[];
    teams: Team[];
    cities: City[];
    timezone: string;
    onClose: () => void;
}

export default function TeamScheduleSidebar({ team, matches, teams, cities, timezone, onClose }: TeamScheduleSidebarProps) {
    // Memoize sorted matches to avoid re-sorting on every render
    const sortedMatches = useMemo(() => {
        return [...matches].sort((a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
    }, [matches]);

    // Memoize city lookup map for O(1) lookups
    const cityMap = useMemo(() => {
        return new Map(cities.map(c => [c.id, c.name]));
    }, [cities]);

    if (!team) {
        return (
            <aside className="sidebar sidebar-right" role="complementary" aria-label="Team Information">
                <div className="sidebar-placeholder">
                    <span className="sidebar-placeholder-icon">⚽</span>
                    <p>Select a team above</p>
                    <p>to view group stage schedule</p>
                </div>
            </aside>
        );
    }

    return (
        <aside className="sidebar sidebar-right" role="complementary" aria-label={`${team.name} Schedule`}>
            {/* Header */}
            <div className="sidebar-header sidebar-header-compact">
                <div className="sidebar-title">
                    <FlagIcon code={team.code} size={28} />
                    <h2>{team.name}</h2>
                </div>
                <div className="sidebar-header-actions">
                    <span className="team-group-badge" aria-label={`Group ${team.group}`}>
                        {team.group}
                    </span>
                    <button className="sidebar-close" onClick={onClose} aria-label="Clear selection">
                        ✕
                    </button>
                </div>
            </div>

            {/* Schedule */}
            <div className="sidebar-matches">
                {sortedMatches.length === 0 ? (
                    <p className="no-matches">No match data available</p>
                ) : (
                    <ul className="match-list" role="list">
                        {sortedMatches.map((match, index) => (
                            <MatchItem
                                key={match.id}
                                match={match}
                                teams={teams}
                                timezone={timezone}
                                highlightTeamCode={team.code}
                                variant="schedule"
                                matchIndex={index}
                                cityName={cityMap.get(match.cityId) || match.cityId}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}

