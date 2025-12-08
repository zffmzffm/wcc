'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CircleMarker, Popup, useMap } from 'react-leaflet';
import { Match, Team, City, MatchWithCoords, FlightSegment } from '@/types';
import { formatDateTimeShort } from '@/utils/formatters';
import { generateArcPath, generateChevronPath, generateLoopPath, generateLoopChevronPath } from '@/utils/pathGenerators';
import FlagIcon from './FlagIcon';
import { LatLngTuple } from 'leaflet';

interface TeamFlightPathProps {
    teamCode: string;
    matches: Match[];
    cities: City[];
    teams: Team[];
}

// Get opponent team info
const getOpponent = (match: Match, teamCode: string, teams: Team[]): { name: string; code: string } => {
    const opponentCode = match.team1 === teamCode ? match.team2 : match.team1;
    const team = teams.find(t => t.code === opponentCode);
    return team ? { name: team.name, code: team.code } : { name: opponentCode, code: opponentCode };
};


export default function TeamFlightPath({ teamCode, matches, cities, teams }: TeamFlightPathProps) {
    const [visibleCount, setVisibleCount] = useState(0);
    const svgRef = useRef<SVGSVGElement>(null);
    const map = useMap();
    const [, forceUpdate] = useState({});

    // Calculate team matches, sorted by time
    const teamMatches: MatchWithCoords[] = useMemo(() => {
        return matches
            .filter(m => m.team1 === teamCode || m.team2 === teamCode)
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            .map(match => {
                const city = cities.find(c => c.id === match.cityId);
                return city ? {
                    match,
                    coords: [city.lat, city.lng] as LatLngTuple,
                    city
                } : null;
            })
            .filter((item): item is MatchWithCoords => item !== null);
    }, [teamCode, matches, cities]);

    // Calculate flight segments, detect duplicate paths
    const flightSegments: FlightSegment[] = useMemo(() => {
        const segments: FlightSegment[] = [];
        const pathMap = new Map<string, number>(); // Track paths that have appeared

        for (let i = 0; i < teamMatches.length - 1; i++) {
            const from = teamMatches[i].coords;
            const to = teamMatches[i + 1].coords;

            // Create path key (directionless) - always sort by coordinates for consistency
            const fromKey = `${from[0].toFixed(4)},${from[1].toFixed(4)}`;
            const toKey = `${to[0].toFixed(4)},${to[1].toFixed(4)}`;

            // Detect if in same city
            const isSameCity = fromKey === toKey;

            const pathKey = [fromKey, toKey].sort().join('|');

            const existingCount = pathMap.get(pathKey) || 0;
            const isReturn = existingCount > 0 && !isSameCity;
            pathMap.set(pathKey, existingCount + 1);

            segments.push({
                from,
                to,
                segmentIndex: i,
                isReturn,
                isSameCity
            });
        }

        return segments;
    }, [teamMatches]);


    // Get current team info
    const currentTeam = useMemo(() => teams.find(t => t.code === teamCode), [teams, teamCode]);

    // Coordinate conversion function
    const latLngToPixel = useCallback((coords: LatLngTuple): { x: number; y: number } => {
        const point = map.latLngToContainerPoint(coords);
        return { x: point.x, y: point.y };
    }, [map]);

    // Use cumulative method: maintain list of rendered segments instead of slicing each time
    const [renderedSegments, setRenderedSegments] = useState<{ segment: FlightSegment; isNew: boolean }[]>([]);
    const [renderedMarkers, setRenderedMarkers] = useState<number[]>([]);
    const animationKeyRef = useRef(0);

    // Reset animation when team changes
    useEffect(() => {
        // Reset animation state
        animationKeyRef.current += 1;
        setRenderedSegments([]);
        setRenderedMarkers([]);
        setVisibleCount(0);
    }, [teamCode]);


    // Adjust map view
    useEffect(() => {
        if (teamMatches.length === 0) return;

        const bounds = teamMatches.map(m => m.coords);
        if (bounds.length > 0) {
            try {
                map.fitBounds(bounds, { padding: [80, 80], maxZoom: 5 });
            } catch (e) {
                console.warn('Failed to fit bounds:', e);
            }
        }
    }, [teamCode, teamMatches, map]);

    // Animation reveal - cumulative addition, won't trigger re-render of already rendered content
    useEffect(() => {
        if (teamMatches.length === 0) return;

        if (visibleCount < teamMatches.length) {
            const timer = setTimeout(() => {
                // First time: show first two markers and first flight segment simultaneously
                if (visibleCount === 0 && teamMatches.length >= 2) {
                    setRenderedMarkers([0, 1]);
                    if (flightSegments[0]) {
                        setRenderedSegments([{ segment: flightSegments[0], isNew: true }]);
                    }
                    setVisibleCount(2);
                } else {
                    // Subsequent: add one marker and one flight segment at a time
                    setRenderedMarkers(prev => [...prev, visibleCount]);

                    if (flightSegments[visibleCount - 1]) {
                        setRenderedSegments(prev => {
                            const updated = prev.map(item => ({ ...item, isNew: false }));
                            return [...updated, { segment: flightSegments[visibleCount - 1], isNew: true }];
                        });
                    }

                    setVisibleCount(prev => prev + 1);
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [teamMatches.length, visibleCount, flightSegments]);

    // Listen for map move/zoom, update SVG paths
    useEffect(() => {
        const handleMoveEnd = () => forceUpdate({});
        map.on('move', handleMoveEnd);
        map.on('zoom', handleMoveEnd);
        return () => {
            map.off('move', handleMoveEnd);
            map.off('zoom', handleMoveEnd);
        };
    }, [map]);

    if (teamMatches.length === 0) {
        return null;
    }

    // Get map container size
    const mapSize = map.getSize();

    return (
        <>
            {/* SVG flight path overlay */}
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
                    zIndex: 400
                }}
            >
                {/* Define chevron marker - similar to > shape */}
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
                            stroke="#2D5A3D"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </marker>
                </defs>
                {/* Render each flight path */}
                {renderedSegments.map(({ segment, isNew }, idx) => {
                    const startPixel = latLngToPixel(segment.from);
                    const endPixel = latLngToPixel(segment.to);

                    // Same city: draw small loop - use same arrow style as normal paths
                    if (segment.isSameCity) {
                        const loopGlowPath = generateLoopPath(startPixel, 20);
                        const loopChevronPath = generateLoopChevronPath(startPixel, 20, 12);

                        return (
                            <g
                                key={`segment-${animationKeyRef.current}-${idx}`}
                                className={isNew ? 'segment-fade-in' : ''}
                            >
                                {/* Loop path base (glow effect) */}
                                <path
                                    d={loopGlowPath}
                                    className="flight-path-glow"
                                />
                                {/* Loop main path - arrows only */}
                                <path
                                    d={loopChevronPath}
                                    className="flight-path-chevron"
                                    markerMid="url(#chevron-marker)"
                                />
                            </g>
                        );
                    }

                    // Normal flight path
                    const curvature = 0.4;
                    const glowPathD = generateArcPath(startPixel, endPixel, curvature);
                    const chevronPathD = generateChevronPath(startPixel, endPixel, curvature, 18);

                    return (
                        <g
                            key={`segment-${animationKeyRef.current}-${idx}`}
                            className={isNew ? 'segment-fade-in' : ''}
                        >
                            {/* Path base (glow effect) */}
                            <path
                                d={glowPathD}
                                className="flight-path-glow"
                            />
                            {/* Main path - use chevron arrows to indicate direction */}
                            <path
                                d={chevronPathD}
                                className="flight-path-chevron"
                                markerMid="url(#chevron-marker)"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Match markers */}
            {renderedMarkers.map((markerIndex) => {
                const matchInfo = teamMatches[markerIndex];
                if (!matchInfo) return null;

                const { match, city, coords } = matchInfo;
                const opponent = getOpponent(match, teamCode, teams);
                const { date, time } = formatDateTimeShort(match.datetime);
                const isLatest = markerIndex === renderedMarkers[renderedMarkers.length - 1];

                return (
                    <CircleMarker
                        key={`marker-${animationKeyRef.current}-${match.id}`}
                        center={coords}
                        radius={isLatest ? 14 : 10}
                        pathOptions={{
                            color: '#fff',
                            weight: 3,
                            fillColor: isLatest ? '#D88A8A' : '#2D5A3D',
                            fillOpacity: 0.95
                        }}
                    >
                        <Popup className="match-popup">
                            <div className="flight-popup">
                                <div className="flight-popup-header">
                                    <span className="match-number">Match {markerIndex + 1}</span>
                                    <span className="match-group-badge">Group {match.group}</span>
                                </div>
                                <div className="flight-popup-venue">
                                    🏟️ {city.name} - {city.venue}
                                </div>
                                <div className="flight-popup-teams">
                                    <span className="team-info">
                                        <FlagIcon code={currentTeam?.code || teamCode} size={18} />
                                        <span className="team-name">{currentTeam?.name}</span>
                                    </span>
                                    <span className="vs">VS</span>
                                    <span className="team-info">
                                        <FlagIcon code={opponent.code} size={18} />
                                        <span className="team-name">{opponent.name}</span>
                                    </span>
                                </div>
                                <div className="flight-popup-datetime">
                                    <span className="date">📅 {date}</span>
                                    <span className="time">⏰ {time}</span>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
}
