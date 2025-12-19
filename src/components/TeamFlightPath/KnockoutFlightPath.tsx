'use client';
import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { City, Team, MatchWithCoords } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { useKnockoutPaths, KnockoutPath, getStageLabel } from '@/hooks/useKnockoutPaths';
import { SVG_CONFIG, FLIGHT_PATH_CONFIG } from '@/constants';
import { generateArcPath, generateLoopPath } from '@/utils/pathGenerators';

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

    // Get knockout paths for this group
    const knockoutPaths = useKnockoutPaths(groupId, knockoutVenues, cities);

    // Coordinate conversion function
    const latLngToPixel = useCallback((coords: [number, number]): { x: number; y: number } => {
        const point = map.latLngToContainerPoint(coords);
        return { x: point.x, y: point.y };
    }, [map]);

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

    if (!groupId || knockoutPaths.length === 0) {
        return null;
    }

    const mapSize = map.getSize();

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
            {/* Render each knockout path */}
            {knockoutPaths.map((path) => (
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

    // Generate dashed path styles based on position
    const dashArray = position === 3 ? '8,6' : '10,5';  // Slightly different dash patterns
    const opacity = 0.7;

    return (
        <g className={`knockout-path knockout-path-${position}`}>
            {segments.map((segment, idx) => {
                // Same city: draw small loop arc (like group stage)
                if (segment.isSameCity) {
                    const loopPath = generateLoopPath(segment.from, FLIGHT_PATH_CONFIG.loopRadius);

                    return (
                        <g key={`segment-${position}-${idx}`}>
                            {/* Glow effect */}
                            <path
                                d={loopPath}
                                fill="none"
                                stroke={color}
                                strokeWidth={6}
                                strokeOpacity={0.2}
                                strokeDasharray={dashArray}
                                strokeLinecap="round"
                            />
                            {/* Main path */}
                            <path
                                d={loopPath}
                                fill="none"
                                stroke={color}
                                strokeWidth={2.5}
                                strokeOpacity={opacity}
                                strokeDasharray={dashArray}
                                strokeLinecap="round"
                            />
                        </g>
                    );
                }

                // Normal segment: draw arc
                const pathD = generateArcPath(segment.from, segment.to, FLIGHT_PATH_CONFIG.curvature * 0.8);

                return (
                    <g key={`segment-${position}-${idx}`}>
                        {/* Glow effect */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke={color}
                            strokeWidth={6}
                            strokeOpacity={0.2}
                            strokeDasharray={dashArray}
                            strokeLinecap="round"
                        />
                        {/* Main path */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke={color}
                            strokeWidth={2.5}
                            strokeOpacity={opacity}
                            strokeDasharray={dashArray}
                            strokeLinecap="round"
                        />
                    </g>
                );
            })}

            {/* Knockout stage markers */}
            {matches.map((matchInfo, idx) => {
                const pixel = latLngToPixel(matchInfo.coords);
                const stage = matchInfo.match.stage;

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
                        {/* Stage label for final */}
                        {stage === 'F' && (
                            <text
                                x={pixel.x}
                                y={pixel.y - 12}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="600"
                                fill={color}
                                stroke="white"
                                strokeWidth="3"
                                paintOrder="stroke"
                            >
                                ★ Final
                            </text>
                        )}
                    </g>
                );
            })}
        </g>
    );
}
