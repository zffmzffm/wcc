'use client';
import { useCallback, useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { City } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { useKnockoutPaths, KnockoutPath } from '@/hooks/useKnockoutPaths';
import { useMapRefresh } from '@/hooks/useMapRefresh';
import { useLayerVisibility } from '@/contexts/LayerVisibilityContext';
import { SVG_CONFIG, FLIGHT_PATH_CONFIG } from '@/constants';
import { generateArcPath, generateChevronPath } from '@/utils/pathGenerators';

interface KnockoutFlightPathProps {
    groupId: string;
    knockoutVenues: KnockoutVenue[];
    cities: City[];
    lastGroupMatchCoords: [number, number] | null;
    groupStageCityIds?: Set<string>; // Cities already labeled by group stage
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
    lastGroupMatchCoords,
    groupStageCityIds = new Set()
}: KnockoutFlightPathProps) {
    const map = useMap();
    const [isVisible, setIsVisible] = useState(false);
    const { visibility, selectedKnockoutPath } = useLayerVisibility();

    // Force re-render on map move/zoom for SVG path updates
    useMapRefresh();

    // Get knockout paths for this group
    const knockoutPaths = useKnockoutPaths(groupId, knockoutVenues, cities);

    // Filter paths based on visibility
    const visiblePaths = knockoutPaths.filter(path => visibility.scenarios[path.scenarioId] ?? false);
    const activeLabelPath = visiblePaths.find(path => path.scenarioId === selectedKnockoutPath);

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

    if (!groupId || visiblePaths.length === 0 || !isVisible) {
        return null;
    }

    const mapSize = map.getSize();

    return (
        <>
            {/* Paths layer - above group stage but below labels */}
            <svg
                className="knockout-path-svg"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: mapSize.x,
                    height: mapSize.y,
                    pointerEvents: 'none',
                    zIndex: SVG_CONFIG.knockoutPathZIndex  // Above group stage paths
                }}
            >
                {/* Define chevron markers for each visible path */}
                <defs>
                    {visiblePaths.map(path => (
                        <marker
                            key={`chevron-marker-${path.id}`}
                            id={`chevron-marker-${path.id}`}
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
                                stroke={path.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </marker>
                    ))}
                </defs>

                {/* Render each visible knockout path - PATHS ONLY */}
                {visiblePaths.map((path) => (
                    <KnockoutPathLine
                        key={`knockout-path-${path.id}`}
                        path={path}
                        lastGroupMatchCoords={lastGroupMatchCoords}
                        latLngToPixel={latLngToPixel}
                        groupStageCityIds={groupStageCityIds}
                        renderMode="paths"
                    />
                ))}
            </svg>

            {/* Labels layer - higher z-index to stay above paths */}
            <svg
                className="knockout-label-svg"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: mapSize.x,
                    height: mapSize.y,
                    pointerEvents: 'none',
                    zIndex: SVG_CONFIG.knockoutLabelZIndex  // Below group stage labels
                }}
            >
                {/* Render labels only for the active scenario to reduce map overlap */}
                {activeLabelPath && (
                    <KnockoutPathLine
                        key={`knockout-labels-${activeLabelPath.id}`}
                        path={activeLabelPath}
                        lastGroupMatchCoords={lastGroupMatchCoords}
                        latLngToPixel={latLngToPixel}
                        groupStageCityIds={groupStageCityIds}
                        renderMode="labels"
                    />
                )}
            </svg>
        </>
    );
}

interface KnockoutPathLineProps {
    path: KnockoutPath;
    lastGroupMatchCoords: [number, number] | null;
    latLngToPixel: (coords: [number, number]) => { x: number; y: number };
    groupStageCityIds: Set<string>;
    renderMode: 'paths' | 'labels';
}

type TextAnchor = 'start' | 'end' | 'middle';

type LabelBounds = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

type KnockoutLabelCandidate = {
    dx: number;
    dy: number;
    anchor: TextAnchor;
    preference: number;
};

type KnockoutLabelPlacement = {
    x: number;
    y: number;
    anchor: TextAnchor;
    bounds: LabelBounds;
};

const KNOCKOUT_LABEL_HEIGHT = 20;
const KNOCKOUT_LABEL_VERTICAL_PAD = 5;

const estimateKnockoutLabelWidth = (label: string): number => {
    let width = 0;
    for (const char of label) {
        if (char.charCodeAt(0) > 255) {
            width += 12;
        } else if (char === ' ') {
            width += 5;
        } else {
            width += 9;
        }
    }
    return Math.max(42, width);
};

const createTextBounds = (
    x: number,
    y: number,
    width: number,
    anchor: TextAnchor
): LabelBounds => {
    let left = x;
    let right = x + width;

    if (anchor === 'end') {
        left = x - width;
        right = x;
    } else if (anchor === 'middle') {
        left = x - width / 2;
        right = x + width / 2;
    }

    return {
        left,
        top: y - KNOCKOUT_LABEL_HEIGHT,
        right,
        bottom: y + KNOCKOUT_LABEL_VERTICAL_PAD
    };
};

const padBounds = (bounds: LabelBounds, padding: number): LabelBounds => ({
    left: bounds.left - padding,
    top: bounds.top - padding,
    right: bounds.right + padding,
    bottom: bounds.bottom + padding
});

const getIntersectionArea = (a: LabelBounds, b: LabelBounds): number => {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
};

const getKnockoutLabelCandidates = (isAlreadyLabeled: boolean): KnockoutLabelCandidate[] => {
    if (isAlreadyLabeled) {
        return [
            { dx: 16, dy: 36, anchor: 'start', preference: 0 },
            { dx: -16, dy: 36, anchor: 'end', preference: 4 },
            { dx: 18, dy: 52, anchor: 'start', preference: 8 },
            { dx: -18, dy: 52, anchor: 'end', preference: 12 },
            { dx: 16, dy: -28, anchor: 'start', preference: 18 },
            { dx: -16, dy: -28, anchor: 'end', preference: 22 }
        ];
    }

    return [
        { dx: 12, dy: 25, anchor: 'start', preference: 0 },
        { dx: 14, dy: -20, anchor: 'start', preference: 4 },
        { dx: -14, dy: 25, anchor: 'end', preference: 8 },
        { dx: -14, dy: -20, anchor: 'end', preference: 12 },
        { dx: 0, dy: 36, anchor: 'middle', preference: 16 },
        { dx: 0, dy: -30, anchor: 'middle', preference: 20 }
    ];
};

const createSameCityGroupLabelBlocker = (
    pixel: { x: number; y: number },
    labelWidth: number
): LabelBounds => ({
    left: pixel.x - Math.max(96, labelWidth + 28),
    top: pixel.y - 42,
    right: pixel.x + Math.max(96, labelWidth + 28),
    bottom: pixel.y + 14
});

const chooseKnockoutLabelPlacement = ({
    pixel,
    label,
    isAlreadyLabeled,
    placedBounds
}: {
    pixel: { x: number; y: number };
    label: string;
    isAlreadyLabeled: boolean;
    placedBounds: LabelBounds[];
}): KnockoutLabelPlacement => {
    const labelWidth = estimateKnockoutLabelWidth(label);
    const groupStageBlockers = isAlreadyLabeled
        ? [createSameCityGroupLabelBlocker(pixel, labelWidth)]
        : [];

    return getKnockoutLabelCandidates(isAlreadyLabeled)
        .map(candidate => {
            const x = pixel.x + candidate.dx;
            const y = pixel.y + candidate.dy;
            const bounds = createTextBounds(x, y, labelWidth, candidate.anchor);
            const placedOverlap = placedBounds.reduce(
                (score, placed) => score + getIntersectionArea(bounds, padBounds(placed, 10)),
                0
            );
            const groupOverlap = groupStageBlockers.reduce(
                (score, blocker) => score + getIntersectionArea(bounds, blocker),
                0
            );

            return {
                x,
                y,
                anchor: candidate.anchor,
                bounds,
                score: candidate.preference + placedOverlap * 20 + groupOverlap * 30
            };
        })
        .sort((a, b) => a.score - b.score)[0];
};

/**
 * Renders a single knockout path as a dashed line
 */
function KnockoutPathLine({ path, lastGroupMatchCoords, latLngToPixel, groupStageCityIds, renderMode }: KnockoutPathLineProps) {
    const { matches, color } = path;

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
    const markerId = `url(#chevron-marker-${path.id})`;

    return (
        <g className={`knockout-path knockout-path-${path.id}`}>
            {/* Path segments - only render in paths mode */}
            {renderMode === 'paths' && segments.map((segment, idx) => {
                // Same city: skip rendering (numbered labels now indicate consecutive matches)
                if (segment.isSameCity) {
                    return null;
                }

                // Normal segment: draw arc with chevrons
                const glowPathD = generateArcPath(segment.from, segment.to, FLIGHT_PATH_CONFIG.curvature * 0.8, 18);
                const chevronPathD = generateChevronPath(
                    segment.from,
                    segment.to,
                    FLIGHT_PATH_CONFIG.curvature * 0.8,
                    FLIGHT_PATH_CONFIG.chevronSpacing
                );

                return (
                    <g key={`segment-${path.id}-${idx}`}>
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

            {/* Knockout stage markers with city labels - only render in labels mode */}
            {renderMode === 'labels' && (() => {
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
                const labelEntries = matches.reduce<{
                    key: string;
                    cityId: string;
                    cityName: string;
                    label: string;
                    pixel: { x: number; y: number };
                    isAlreadyLabeled: boolean;
                }[]>((entries, matchInfo, idx) => {
                    const cityId = matchInfo.city?.id;
                    const cityName = matchInfo.city?.name;
                    if (!cityId || !cityName || seenCities.has(cityId)) {
                        return entries;
                    }

                    seenCities.add(cityId);
                    const matchNumbersPrefix = (cityMatchNumbers.get(cityId) || []).join('');
                    entries.push({
                        key: `marker-${path.id}-${idx}`,
                        cityId,
                        cityName,
                        label: `${matchNumbersPrefix}${cityName}`,
                        pixel: latLngToPixel(matchInfo.coords),
                        isAlreadyLabeled: groupStageCityIds.has(cityId)
                    });
                    return entries;
                }, []);

                const placedBounds: LabelBounds[] = [];
                const placedLabels = [...labelEntries]
                    .sort((a, b) => Number(b.isAlreadyLabeled) - Number(a.isAlreadyLabeled))
                    .map(entry => {
                        const placement = chooseKnockoutLabelPlacement({
                            pixel: entry.pixel,
                            label: entry.label,
                            isAlreadyLabeled: entry.isAlreadyLabeled,
                            placedBounds
                        });
                        placedBounds.push(placement.bounds);
                        return { ...entry, placement };
                    });

                return placedLabels.map(entry => (
                    <g key={entry.key}>
                        <text
                            x={entry.placement.x}
                            y={entry.placement.y}
                            textAnchor={entry.placement.anchor}
                            fontSize="15"
                            fontWeight={700}
                            fill={color}
                            stroke="white"
                            strokeWidth="4"
                            paintOrder="stroke fill"
                            style={{ pointerEvents: 'none' }}
                        >
                            {entry.label}
                        </text>
                    </g>
                ));
            })()}
        </g>
    );
}
