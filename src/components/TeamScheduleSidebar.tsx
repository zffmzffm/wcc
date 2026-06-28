'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Match, Team, City } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { useKnockoutPaths } from '@/hooks/useKnockoutPaths';
import { useLayerVisibility } from '@/contexts/LayerVisibilityContext';
import { isGrayKnockoutPathState } from '@/utils/knockoutResults';
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
    const prevTeamCodeRef = useRef<string | null>(null);

    // Get layer visibility controls
    const { setVisibility, selectKnockoutPath } = useLayerVisibility();

    // Get knockout paths for the team's group
    const knockoutPaths = useKnockoutPaths(team?.group || '', knockoutVenues, cities, team?.code);

    // Reset to the actual path when known, while keeping gray alternatives visible.
    useEffect(() => {
        if (!team) {
            prevTeamCodeRef.current = null;
            return;
        }

        if (knockoutPaths.length === 0) {
            return;
        }

        const actualIndex = knockoutPaths.findIndex(path => path.displayState === 'actual' || path.displayState === 'knocked-out');
        const pendingIndex = knockoutPaths.findIndex(path => path.displayState === 'pending');
        const nextIndex = actualIndex >= 0 ? actualIndex : pendingIndex >= 0 ? pendingIndex : 0;
        const hasResolvedState = knockoutPaths.some(path => path.displayState !== 'open');

        const resetTimer = window.setTimeout(() => {
            setSelectedPathIndex(nextIndex);
        }, 0);
        setVisibility({
            groupStage: true,
            scenarios: Object.fromEntries(
                knockoutPaths.map(path => [path.scenarioId, hasResolvedState || path.scenarioId === knockoutPaths[nextIndex].scenarioId])
            ),
        });
        selectKnockoutPath(knockoutPaths[nextIndex].scenarioId);
        prevTeamCodeRef.current = team.code;

        return () => {
            window.clearTimeout(resetTimer);
        };
    }, [team, knockoutPaths, selectKnockoutPath, setVisibility]);

    // Handle Escape key to close
    useEffect(() => {
        if (!team) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [team, onClose]);

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


    // Get the currently selected path
    const selectedPath = knockoutPaths[selectedPathIndex] || knockoutPaths[0];

    // Handle tab click: set visibility, update selected index, and trigger map bounds fit
    const handleTabClick = (index: number) => {
        const clickedPath = knockoutPaths[index];
        if (!clickedPath) return;

        setSelectedPathIndex(index);
        const hasResolvedState = knockoutPaths.some(path => path.displayState !== 'open');

        setVisibility({
            groupStage: true,
            scenarios: Object.fromEntries(
                knockoutPaths.map(path => [path.scenarioId, hasResolvedState || path.scenarioId === clickedPath.scenarioId])
            ),
        });
        selectKnockoutPath(clickedPath.scenarioId);
    };

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
                            <h3 className="schedule-section-title knockout-title">Knockout Stage (Scenarios)</h3>

                            {/* Tab Buttons - Index Card Style */}
                            <div
                                className="knockout-tabs"
                                role="tablist"
                                data-tab-count={knockoutPaths.length}
                                style={{
                                    '--tab-count': knockoutPaths.length,
                                } as React.CSSProperties}
                            >
                                {knockoutPaths.map((path, index) => (
                                    <button
                                        key={path.id}
                                        role="tab"
                                        aria-selected={selectedPathIndex === index}
                                        className={[
                                            'knockout-tab',
                                            selectedPathIndex === index ? 'active' : '',
                                            path.displayState !== 'open' ? `is-${path.displayState}` : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => handleTabClick(index)}
                                        style={{
                                            '--tab-color': path.color,
                                        } as React.CSSProperties}
                                    >
                                        <span className="knockout-tab-label">{path.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Path Content */}
                            {selectedPath && (
                                <div
                                    className={[
                                        'knockout-path-content',
                                        isGrayKnockoutPathState(selectedPath.displayState) ? `is-${selectedPath.displayState}` : '',
                                    ].filter(Boolean).join(' ')}
                                    role="tabpanel"
                                >
                                    <ul className="match-list knockout-match-list" role="list">
                                        {selectedPath.matches.map((matchInfo, idx) => {
                                            // Determine if selected team is home or away based on matchup
                                            const matchup = matchInfo.match.matchup || '';
                                            const [leftSide] = matchup.split(' vs ');

                                            let isHome = false;

                                            if (idx === 0) {
                                                // First match (R32): check group position marker
                                                const leftSideMarker = leftSide.trim();
                                                if (selectedPath.position === 3) {
                                                    const thirdPlaceMarker = leftSideMarker.match(/^3([A-L]+)$/);
                                                    isHome = !!thirdPlaceMarker?.[1].includes(team.group);
                                                } else {
                                                    const positionMarker = `${selectedPath.position}${team.group}`;
                                                    isHome = leftSideMarker === positionMarker;
                                                }
                                            } else {
                                                // Subsequent matches: check if previous match winner is on left side
                                                const prevMatchId = selectedPath.matches[idx - 1].match.id.toString();
                                                const winnerMarker = `W${prevMatchId}`;
                                                isHome = leftSide.includes(winnerMarker);
                                            }

                                            // Get opponent descriptor from matchup
                                            const opponentLabel = isHome
                                                ? (matchInfo.match.team2 || 'TBD')
                                                : (matchInfo.match.team1 || 'TBD');

                                            const knockoutMatch: Match = {
                                                ...matchInfo.match,
                                                team1: isHome ? team.code : opponentLabel,
                                                team2: isHome ? opponentLabel : team.code,
                                            };
                                            const cityName = matchInfo.city?.name || matchInfo.match.cityId;
                                            const matchNumber = sortedMatches.length + idx;

                                            return (
                                                <MatchItem
                                                    key={`${selectedPath.id}-${idx}`}
                                                    match={knockoutMatch}
                                                    teams={teams}
                                                    timezone={timezone}
                                                    highlightTeamCode={team.code}
                                                    variant="schedule"
                                                    matchIndex={matchNumber}
                                                    cityName={cityName}
                                                    grayed={
                                                        selectedPath.eliminationMatchIndex !== undefined
                                                        && idx > selectedPath.eliminationMatchIndex
                                                    }
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

