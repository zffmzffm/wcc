'use client';
import { useMemo } from 'react';
import { Match, Team, City } from '@/types';
import SidebarLayout from './SidebarLayout';
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

    return (
        <SidebarLayout
            position="right"
            ariaLabel={team ? `${team.name} Schedule` : 'Team Information'}
            iconCode={team?.code}
            title={team?.name || ''}
            showPlaceholder={!team}
            placeholder={{
                icon: '⚽',
                line1: 'Select a team above',
                line2: 'to view group stage schedule'
            }}
            badge={team && (
                <span className="team-group-badge" aria-label={`Group ${team.group}`}>
                    {team.group}
                </span>
            )}
            onClose={onClose}
        >
            {team && (
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
            )}
        </SidebarLayout>
    );
}
