'use client';
import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { Match, Team, City } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { useTeamMatches, useFlightSegments } from '@/hooks/useTeamMatches';
import { useMapRefresh } from '@/hooks/useMapRefresh';
import { useFlightAnimation } from './useFlightAnimation';
import { useLayerVisibility } from '@/contexts/LayerVisibilityContext';
import { useKnockoutPaths } from '@/hooks/useKnockoutPaths';
import { SVG_CONFIG, FLIGHT_PATH_CONFIG, PADDING_CONFIG } from '@/constants';
import FlightSegment from './FlightSegment';
import CityLabel from './CityLabel';
import MatchMarker from './MatchMarker';
import KnockoutFlightPath from './KnockoutFlightPath';

interface TeamFlightPathProps {
    teamCode: string;
    matches: Match[];
    cities: City[];
    teams: Team[];
    knockoutVenues?: KnockoutVenue[];
    timezone: string;
}

/**
 * TeamFlightPath - Renders the flight path visualization for a selected team
 * 
 * Displays animated flight paths between match cities with:
 * - Curved arc paths with chevron direction indicators
 * - City name labels with smart positioning
 * - Match location markers with popup details
 */
export default function TeamFlightPath({ teamCode, matches, cities, teams, knockoutVenues = [], timezone }: TeamFlightPathProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const map = useMap();
    const { visibility, fitBoundsTrigger, selectedKnockoutPath } = useLayerVisibility();

    // Force re-render on map move/zoom for SVG path updates
    useMapRefresh();

    // Use centralized hooks for data
    const teamMatches = useTeamMatches(teamCode, matches, cities);
    const flightSegments = useFlightSegments(teamMatches);

    // Get current team info
    const currentTeam = teams.find(t => t.code === teamCode);

    // Get last group match coordinates for knockout path connection
    const lastGroupMatchCoords = teamMatches.length > 0
        ? teamMatches[teamMatches.length - 1].coords
        : null;

    // Use animation hook
    const { renderedSegments, renderedMarkers, animationKey } = useFlightAnimation(
        teamCode,
        teamMatches,
        flightSegments
    );

    // Get knockout path selection for bounds fitting
    const knockoutPaths = useKnockoutPaths(currentTeam?.group || '', knockoutVenues, cities);

    // Calculate group stage city IDs for knockout path label offset
    const groupStageCityIds = useMemo(() => {
        return new Set(teamMatches.map(m => m.city.id));
    }, [teamMatches]);

    // Note: Map view adjustment for team selection is handled by useMapViewControl hook
    // Do not add fitBounds here to avoid conflicts

    // Fit bounds when knockout tab is clicked
    useEffect(() => {
        if (fitBoundsTrigger === 0 || selectedKnockoutPath === null) return;

        const selectedPath = knockoutPaths.find(path => path.scenarioId === selectedKnockoutPath);
        if (!selectedPath) return;

        // Collect all coordinates: group stage + selected knockout path
        const allCoords: [number, number][] = [
            ...teamMatches.map(m => m.coords),
            ...selectedPath.matches.map(match => match.coords)
        ];

        if (allCoords.length > 0) {
            try {
                map.fitBounds(allCoords, {
                    padding: PADDING_CONFIG.fitBounds,
                    maxZoom: 5,
                    animate: true
                });
            } catch (e) {
                console.warn('Failed to fit knockout bounds:', e);
            }
        }
    }, [fitBoundsTrigger, selectedKnockoutPath, knockoutPaths, teamMatches, map]);

    if (teamMatches.length === 0) {
        return null;
    }

    // Get map container size
    const mapSize = map.getSize();

    // Deduplicate cities for labels (each city labeled only once)
    const uniqueCityMarkers = (() => {
        const seenCities = new Set<string>();
        return renderedMarkers.filter((markerIndex) => {
            const cityId = teamMatches[markerIndex]?.city?.id;
            if (!cityId || seenCities.has(cityId)) return false;
            seenCities.add(cityId);
            return true;
        });
    })();

    return (
        <>
            {/* SVG flight path overlay - only show if group stage is visible */}
            {visibility.groupStage && (
                <svg
                    ref={svgRef}
                    className="flight-path-svg"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: mapSize.x,
                        height: mapSize.y,
                        pointerEvents: 'none',
                        zIndex: SVG_CONFIG.groupPathZIndex  // Group stage paths (bottom layer)
                    }}
                >
                    {/* Define chevron marker */}
                    <defs>
                        <marker
                            id="chevron-marker"
                            markerWidth="8"
                            markerHeight="8"
                            refX="4"
                            refY="4"
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 1 1 L 6 4 L 1 7"
                                fill="none"
                                stroke={FLIGHT_PATH_CONFIG.pathColor}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </marker>
                    </defs>

                    {/* Render each flight path */}
                    {renderedSegments.map(({ segment, isNew }, idx) => (
                        <FlightSegment
                            key={`segment-${animationKey}-${idx}`}
                            segment={segment}
                            isNew={isNew}
                            animationKey={animationKey}
                            index={idx}
                        />
                    ))}
                </svg>
            )}

            {/* City name labels - separate SVG with higher z-index to appear above knockout paths */}
            {visibility.groupStage && (
                <svg
                    className="city-labels-svg"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: mapSize.x,
                        height: mapSize.y,
                        pointerEvents: 'none',
                        zIndex: SVG_CONFIG.labelZIndex  // Above knockout paths
                    }}
                >
                    {uniqueCityMarkers.map((markerIndex) => {
                        const matchInfo = teamMatches[markerIndex];
                        if (!matchInfo) return null;

                        return (
                            <CityLabel
                                key={`label-${animationKey}-${markerIndex}`}
                                matchInfo={matchInfo}
                                markerIndex={markerIndex}
                                teamMatches={teamMatches}
                                animationKey={animationKey}
                            />
                        );
                    })}
                </svg>
            )}

            {/* Match markers - only show if group stage is visible */}
            {visibility.groupStage && renderedMarkers.map((markerIndex) => {
                const matchInfo = teamMatches[markerIndex];
                if (!matchInfo) return null;

                const { match, city, coords } = matchInfo;
                const isLatest = markerIndex === renderedMarkers[renderedMarkers.length - 1];

                return (
                    <MatchMarker
                        key={`marker-${animationKey}-${match.id}`}
                        match={match}
                        city={city}
                        coords={coords}
                        teamCode={teamCode}
                        currentTeam={currentTeam}
                        teams={teams}
                        markerIndex={markerIndex}
                        isLatest={isLatest}
                        animationKey={animationKey}
                        timezone={timezone}
                    />
                );
            })}

            {/* Knockout stage paths (hypothetical) */}
            {knockoutVenues.length > 0 && currentTeam && (
                <KnockoutFlightPath
                    groupId={currentTeam.group}
                    knockoutVenues={knockoutVenues}
                    cities={cities}
                    lastGroupMatchCoords={lastGroupMatchCoords}
                    groupStageCityIds={groupStageCityIds}
                />
            )}
        </>
    );
}
