'use client';
import { useMemo, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { MatchWithCoords } from '@/types';
import { CITY_LABEL_CONFIG } from '@/constants';

interface CityLabelProps {
    matchInfo: MatchWithCoords;
    markerIndex: number;
    teamMatches: MatchWithCoords[];
    animationKey: string;
}

/**
 * Renders a city name label with smart positioning to avoid overlapping with flight paths
 * Shows match sequence numbers before city name (e.g., "12Vancouver" for matches 1 and 2)
 */
export default function CityLabel({ matchInfo, markerIndex, teamMatches, animationKey }: CityLabelProps) {
    const map = useMap();

    const { city, coords } = matchInfo;


    // Calculate match numbers for this city (1-indexed)
    const matchNumbers = useMemo(() => {
        const nums: number[] = [];
        teamMatches.forEach((m, idx) => {
            if (m.city.id === city.id) {
                nums.push(idx + 1); // 1-indexed
            }
        });
        return nums;
    }, [teamMatches, city.id]);


    // Convert lat/lng to pixel coordinates
    const latLngToPixel = useCallback((c: [number, number]): { x: number; y: number } => {
        const point = map.latLngToContainerPoint(c);
        return { x: point.x, y: point.y };
    }, [map]);

    const pixel = latLngToPixel(coords);

    // Get all OTHER city positions for collision detection
    const otherCityPixels = useMemo(() => {
        const seenCities = new Set<string>();
        const pixels: { x: number; y: number }[] = [];
        teamMatches.forEach((m) => {
            if (m.city.id !== city.id && !seenCities.has(m.city.id)) {
                seenCities.add(m.city.id);
                pixels.push(latLngToPixel(m.coords));
            }
        });
        return pixels;
    }, [teamMatches, city.id, latLngToPixel]);


    // Calculate label position based on flight path directions
    const labelPosition = useMemo(() => {
        // Collect all path directions from this city
        const pathDirections: { dx: number; dy: number }[] = [];

        // Check incoming path (from previous city)
        if (markerIndex > 0) {
            const prevMatch = teamMatches[markerIndex - 1];
            if (prevMatch) {
                const prevPixel = latLngToPixel(prevMatch.coords);
                pathDirections.push({
                    dx: pixel.x - prevPixel.x,
                    dy: pixel.y - prevPixel.y
                });
            }
        }

        // Check outgoing path (to next city)
        if (markerIndex < teamMatches.length - 1) {
            const nextMatch = teamMatches[markerIndex + 1];
            if (nextMatch) {
                const nextPixel = latLngToPixel(nextMatch.coords);
                pathDirections.push({
                    dx: nextPixel.x - pixel.x,
                    dy: nextPixel.y - pixel.y
                });
            }
        }

        // Also add directions TO other cities as blocked directions
        otherCityPixels.forEach(mp => {
            pathDirections.push({
                dx: mp.x - pixel.x,
                dy: mp.y - pixel.y
            });
        });

        let labelX = pixel.x;
        let labelY = pixel.y;
        let textAnchor: 'start' | 'end' | 'middle' = 'start';
        const labelOffset = CITY_LABEL_CONFIG.offset;

        if (pathDirections.length > 0) {
            // Convert path directions to angles (in radians)
            const pathAngles: number[] = pathDirections.map(dir => {
                return Math.atan2(dir.dy, dir.dx);
            });

            // Add arc offset angles to avoid the curved portions
            const allBlockedAngles: number[] = [];
            pathAngles.forEach(angle => {
                allBlockedAngles.push(angle);
                allBlockedAngles.push(angle - Math.PI / 4);
                allBlockedAngles.push(angle + Math.PI / 4);
            });

            // Normalize all angles to [0, 2π)
            const normalizedAngles = allBlockedAngles.map(a => {
                let norm = a % (2 * Math.PI);
                if (norm < 0) norm += 2 * Math.PI;
                return norm;
            }).sort((a, b) => a - b);

            // Find the largest angular gap
            let maxGap = 0;
            let bestAngle = 0;

            for (let i = 0; i < normalizedAngles.length; i++) {
                const current = normalizedAngles[i];
                const next = normalizedAngles[(i + 1) % normalizedAngles.length];
                let gap = next - current;
                if (gap <= 0) gap += 2 * Math.PI;

                if (gap > maxGap) {
                    maxGap = gap;
                    bestAngle = current + gap / 2;
                }
            }

            // If no clear gap found, go opposite
            if (maxGap < Math.PI / 4 && pathAngles.length > 0) {
                const avgAngle = pathAngles.reduce((a, b) => a + b, 0) / pathAngles.length;
                bestAngle = avgAngle + Math.PI;
            }

            // Calculate label position
            const labelDx = Math.cos(bestAngle);
            const labelDy = Math.sin(bestAngle);

            labelX = pixel.x + labelDx * labelOffset;
            labelY = pixel.y + labelDy * labelOffset + 5;

            // Adjust text anchor based on label position
            if (labelDx < -0.3) {
                textAnchor = 'end';
            } else if (labelDx > 0.3) {
                textAnchor = 'start';
            } else {
                textAnchor = 'middle';
            }
        } else {
            // Default: place to the right
            labelX = pixel.x + labelOffset;
            labelY = pixel.y + 6;
        }

        return { labelX, labelY, textAnchor };
    }, [pixel, markerIndex, teamMatches, latLngToPixel, otherCityPixels]);

    // SVG-drawn circled numbers: each badge is a filled circle + white number
    const badgeRadius = 7;
    const badgeSpacing = 16; // center-to-center distance between badges
    const badgeToTextGap = 3; // gap between last badge and city name
    const totalBadgesWidth = matchNumbers.length * badgeSpacing;

    // Calculate badge start offset based on text anchor
    let badgeStartX = labelPosition.labelX;
    if (labelPosition.textAnchor === 'end') {
        badgeStartX = labelPosition.labelX - (city.name.length * 9) - totalBadgesWidth - badgeToTextGap;
    } else if (labelPosition.textAnchor === 'middle') {
        badgeStartX = labelPosition.labelX - ((city.name.length * 9) + totalBadgesWidth + badgeToTextGap) / 2;
    }

    // City name text starts after all badges
    const cityNameX = badgeStartX + totalBadgesWidth + badgeToTextGap;

    return (
        <g
            key={`label-${animationKey}-${markerIndex}`}
            className="city-label"
            style={{ pointerEvents: 'none' }}
        >
            {/* Match number badges */}
            {matchNumbers.map((num, i) => {
                const cx = badgeStartX + i * badgeSpacing + badgeRadius;
                const cy = labelPosition.labelY - 5; // vertically center with text
                return (
                    <g key={`badge-${i}`}>
                        {/* White outline circle */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={badgeRadius + 1.5}
                            fill="white"
                        />
                        {/* Filled circle */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={badgeRadius}
                            fill={CITY_LABEL_CONFIG.fillColor}
                        />
                        {/* Number text */}
                        <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{
                                fill: 'white',
                                fontSize: '9px',
                                fontWeight: 800,
                                pointerEvents: 'none',
                            }}
                        >
                            {num}
                        </text>
                    </g>
                );
            })}
            {/* City name */}
            <text
                x={cityNameX}
                y={labelPosition.labelY}
                textAnchor="start"
                style={{
                    fill: CITY_LABEL_CONFIG.fillColor,
                    fontSize: '15px',
                    fontWeight: CITY_LABEL_CONFIG.fontWeight,
                    stroke: CITY_LABEL_CONFIG.strokeColor,
                    strokeWidth: CITY_LABEL_CONFIG.strokeWidth,
                    paintOrder: 'stroke fill',
                    pointerEvents: 'none',
                }}
            >
                {city.name}
            </text>
        </g>
    );
}
