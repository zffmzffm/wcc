'use client';
import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { City, Team, MatchWithCoords } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { useKnockoutPaths, KnockoutPath, getStageLabel } from '@/hooks/useKnockoutPaths';
import { useLayerVisibility } from '@/contexts/LayerVisibilityContext';
import { SVG_CONFIG, FLIGHT_PATH_CONFIG } from '@/constants';
import { generateArcPath, generateLoopPath, generateChevronPath, generateLoopChevronPath } from '@/utils/pathGenerators';

interface KnockoutFlightPathProps {
    groupId: string;
    knockoutVenues: KnockoutVenue[];
    cities: City[];
    lastGroupMatchCoords: [number, number] | null;
}

/**
 * KnockoutFlightPath - Renders three hypothetical knockout stage paths
 * 
 * Shows the potential journey from group stage to the final for:
 * - 1st place finish (green dashed line)
 * - 2nd place finish (blue dashed line)  
 * - 3rd place finish (orange dashed line)
 */
export default function KnockoutFlightPath({
    groupId,
    knockoutVenues,
    cities,
    lastGroupMatchCoords
}: KnockoutFlightPathProps) {
    const map = useMap();
    const [, forceUpdate] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const { visibility } = useLayerVisibility();

    // Get knockout paths for this group
    const knockoutPaths = useKnockoutPaths(groupId, knockoutVenues, cities);

    // Filter paths based on visibility
    const visiblePaths = knockoutPaths.filter(path => {
        if (path.position === 1) return visibility.firstPlace;
        if (path.position === 2) return visibility.secondPlace;
        if (path.position === 3) return visibility.thirdPlace;
        return true;
    });

    // Coordinate conversion function
    const latLngToPixel = useCallback((coords: [number, number]): { x: number; y: number } => {
        const point = map.latLngToContainerPoint(coords);
        return { x: point.x, y: point.y };
    }, [map]);

    // Delay knockout paths display to wait for group stage animation
    // Group stage has 3 matches: first shows 2 markers + 1 segment (600ms), 
    // then 1 more marker + 1 segment (600ms) = ~1200ms total
    // Adding extra delay for better visual rhythm
    useEffect(() => {
        setIsVisible(false); // Reset on groupId change
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2200); // Wait for group stage animation + rhythm pause
        return () => clearTimeout(timer);
    }, [groupId]);

    // Listen for map move/zoom to update SVG paths
    useEffect(() => {
        const handleMoveEnd = () => forceUpdate({});
        map.on('move', handleMoveEnd);
        map.on('zoom', handleMoveEnd);
        return () => {
            map.off('move', handleMoveEnd);
            map.off('zoom', handleMoveEnd);
        };
    }, [map]);

    if (!groupId || visiblePaths.length === 0 || !isVisible) {
        return null;
    }

    const mapSize = map.getSize();

    // Colors for each position's chevron marker
    const positionColors: { [key: number]: string } = {
        1: '#10B981',  // 1st place - green
        2: '#3B82F6',  // 2nd place - blue
        3: '#F59E0B',  // 3rd place - orange
    };

    return (
        <svg
            className="knockout-path-svg"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: mapSize.x,
                height: mapSize.y,
                pointerEvents: 'none',
                zIndex: SVG_CONFIG.zIndex  // Same level as group stage path
            }}
        >
            {/* Define chevron markers for each position */}
            <defs>
                {[1, 2, 3].map(pos => (
                    <marker
                        key={`chevron-marker-pos${pos}`}
                        id={`chevron-marker-pos${pos}`}
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
                            stroke={positionColors[pos]}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </marker>
                ))}
            </defs>

            {/* Render each visible knockout path */}
            {visiblePaths.map((path) => (
                <KnockoutPathLine
                    key={`knockout-path-${path.position}`}
                    path={path}
                    lastGroupMatchCoords={lastGroupMatchCoords}
                    latLngToPixel={latLngToPixel}
                />
            ))}
        </svg>
    );
}

interface KnockoutPathLineProps {
    path: KnockoutPath;
    lastGroupMatchCoords: [number, number] | null;
    latLngToPixel: (coords: [number, number]) => { x: number; y: number };
}

/**
 * Renders a single knockout path as a dashed line
 */
function KnockoutPathLine({ path, lastGroupMatchCoords, latLngToPixel }: KnockoutPathLineProps) {
    const { matches, color, position } = path;

    if (matches.length === 0) return null;

    // Build path segments from last group match through all knockout stages
    // Each segment knows if it's same-city
    const segments: { from: { x: number; y: number }; to: { x: number; y: number }; isSameCity: boolean }[] = [];

    // First segment: from last group match to R32
    if (lastGroupMatchCoords && matches.length > 0) {
        const startPixel = latLngToPixel(lastGroupMatchCoords);
        const endPixel = latLngToPixel(matches[0].coords);
        const distance = Math.sqrt(
            Math.pow(endPixel.x - startPixel.x, 2) +
            Math.pow(endPixel.y - startPixel.y, 2)
        );
        segments.push({ from: startPixel, to: endPixel, isSameCity: distance < 5 });
    }

    // Remaining segments between knockout stages
    for (let i = 0; i < matches.length - 1; i++) {
        const startPixel = latLngToPixel(matches[i].coords);
        const endPixel = latLngToPixel(matches[i + 1].coords);
        const distance = Math.sqrt(
            Math.pow(endPixel.x - startPixel.x, 2) +
            Math.pow(endPixel.y - startPixel.y, 2)
        );
        segments.push({ from: startPixel, to: endPixel, isSameCity: distance < 5 });
    }

    // Use chevron markers for this position
    const markerId = `url(#chevron-marker-pos${position})`;

    return (
        <g className={`knockout-path knockout-path-${position}`}>
            {segments.map((segment, idx) => {
                // Same city: skip rendering (numbered labels now indicate consecutive matches)
                if (segment.isSameCity) {
                    return null;
                }

                // Normal segment: draw arc with chevrons
                const glowPathD = generateArcPath(segment.from, segment.to, FLIGHT_PATH_CONFIG.curvature * 0.8);
                const chevronPathD = generateChevronPath(
                    segment.from,
                    segment.to,
                    FLIGHT_PATH_CONFIG.curvature * 0.8,
                    FLIGHT_PATH_CONFIG.chevronSpacing
                );

                return (
                    <g key={`segment-${position}-${idx}`}>
                        {/* Glow effect */}
                        <path
                            d={glowPathD}
                            fill="none"
                            stroke={color}
                            strokeWidth={8}
                            strokeOpacity={0.15}
                            strokeLinecap="round"
                        />
                        {/* Chevron path */}
                        <path
                            d={chevronPathD}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={3}
                            markerMid={markerId}
                        />
                    </g>
                );
            })}

            {/* Knockout stage markers with city labels */}
            {(() => {
                // Convert number to circled digit (➊➋➌➍➎➏➐➑)
                const toCircledDigit = (n: number): string => {
                    const circledDigits = ['➊', '➋', '➌', '➍', '➎', '➏', '➐', '➑'];
                    return n >= 1 && n <= 8 ? circledDigits[n - 1] : String(n);
                };

                // Track unique cities for this path to avoid duplicate labels
                // Also track which match numbers occur at each city
                const cityMatchNumbers = new Map<string, string[]>();

                // First pass: collect all match numbers for each city
                // Knockout matches are numbered starting from 4 (after 3 group stage matches)
                matches.forEach((matchInfo, idx) => {
                    const cityId = matchInfo.city?.id;
                    if (cityId) {
                        const matchNumber = idx + 4; // R32=4, R16=5, QF=6, SF=7, F=8
                        if (!cityMatchNumbers.has(cityId)) {
                            cityMatchNumbers.set(cityId, []);
                        }
                        cityMatchNumbers.get(cityId)!.push(toCircledDigit(matchNumber));
                    }
                });

                const seenCities = new Set<string>();

                return matches.map((matchInfo, idx) => {
                    const pixel = latLngToPixel(matchInfo.coords);
                    const stage = matchInfo.match.stage;
                    const cityId = matchInfo.city?.id;
                    const cityName = matchInfo.city?.name;

                    // Check if we've already labeled this city
                    const shouldShowLabel = cityId && !seenCities.has(cityId);
                    if (cityId) {
                        seenCities.add(cityId);
                    }

                    // Get match numbers prefix for this city (using circled digits)
                    const matchNumbersPrefix = cityId ? (cityMatchNumbers.get(cityId) || []).join('') : '';

                    return (
                        <g key={`marker-${position}-${idx}`}>
                            {/* Small circle marker */}
                            <circle
                                cx={pixel.x}
                                cy={pixel.y}
                                r={6}
                                fill={color}
                                fillOpacity={0.8}
                                stroke="white"
                                strokeWidth={2}
                            />
                            {/* City name label with match numbers - positioned below marker to avoid overlap with group stage labels */}
                            {shouldShowLabel && cityName && (
                                <text
                                    x={pixel.x + 12}
                                    y={pixel.y + 25}
                                    textAnchor="start"
                                    fontSize="15"
                                    fontWeight={700}
                                    fill={color}
                                    stroke="white"
                                    strokeWidth="4"
                                    paintOrder="stroke fill"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {matchNumbersPrefix}{cityName}
                                </text>
                            )}
                        </g>
                    );
                });
            })()}
        </g>
    );
}
