'use client';
import { useMemo, useState } from 'react';
import { Match, Team, City } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { useKnockoutPaths, getStageLabel } from '@/hooks/useKnockoutPaths';
import { formatDateTimeWithTimezone } from '@/utils/formatters';
import SidebarLayout from './SidebarLayout';
import MatchItem from './MatchItem';

interface TeamScheduleSidebarProps {
    team: Team | null;
    matches: Match[];
    teams: Team[];
    cities: City[];
    timezone: string;
    knockoutVenues?: KnockoutVenue[];
    onClose: () => void;
}

export default function TeamScheduleSidebar({ team, matches, teams, cities, timezone, knockoutVenues = [], onClose }: TeamScheduleSidebarProps) {
    // State for selected knockout path tab
    const [selectedPathIndex, setSelectedPathIndex] = useState(0);

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

    // Get knockout paths for the team's group
    const knockoutPaths = useKnockoutPaths(team?.group || '', knockoutVenues, cities);

    // Get the currently selected path
    const selectedPath = knockoutPaths[selectedPathIndex] || knockoutPaths[0];

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
                line2: 'to view match schedule'
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
                    {/* Group Stage Section */}
                    <h3 className="schedule-section-title">Group Stage</h3>
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

                    {/* Knockout Stage Section with Tabs */}
                    {knockoutPaths.length > 0 && (
                        <>
                            <h3 className="schedule-section-title knockout-title">Knockout Stage (Hypothetical)</h3>

                            {/* Tab Buttons - Index Card Style */}
                            <div className="knockout-tabs" role="tablist">
                                {knockoutPaths.map((path, index) => {
                                    const tabLabel = `Q-${path.position === 1 ? '1st' : path.position === 2 ? '2nd' : '3rd'}`;
                                    return (
                                        <button
                                            key={path.position}
                                            role="tab"
                                            aria-selected={selectedPathIndex === index}
                                            className={`knockout-tab ${selectedPathIndex === index ? 'active' : ''}`}
                                            onClick={() => setSelectedPathIndex(index)}
                                            style={{
                                                '--tab-color': path.color,
                                            } as React.CSSProperties}
                                        >
                                            <span className="knockout-tab-label">{tabLabel}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Selected Path Content */}
                            {selectedPath && (
                                <div className="knockout-path-content" role="tabpanel">
                                    <ul className="match-list knockout-match-list" role="list">
                                        {selectedPath.matches.map((matchInfo, idx) => {
                                            // Determine if selected team is home or away based on matchup
                                            const matchup = matchInfo.match.matchup || '';
                                            const [leftSide] = matchup.split(' vs ');

                                            let isHome = false;

                                            if (idx === 0) {
                                                // First match (R32): check group position marker
                                                const positionMarker = `${selectedPath.position}${team.group}`;
                                                isHome = leftSide.includes(positionMarker);
                                            } else {
                                                // Subsequent matches: check if previous match winner is on left side
                                                const prevMatchId = selectedPath.matches[idx - 1].match.id.toString();
                                                const winnerMarker = `W${prevMatchId}`;
                                                isHome = leftSide.includes(winnerMarker);
                                            }

                                            const knockoutMatch: Match = {
                                                ...matchInfo.match,
                                                team1: isHome ? team.code : 'TBD',
                                                team2: isHome ? 'TBD' : team.code,
                                            };
                                            const cityName = matchInfo.city?.name || matchInfo.match.cityId;
                                            const matchNumber = sortedMatches.length + idx;

                                            return (
                                                <MatchItem
                                                    key={`${selectedPath.position}-${idx}`}
                                                    match={knockoutMatch}
                                                    teams={teams}
                                                    timezone={timezone}
                                                    highlightTeamCode={team.code}
                                                    variant="schedule"
                                                    matchIndex={matchNumber}
                                                    cityName={cityName}
                                                />
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </SidebarLayout>
    );
}

