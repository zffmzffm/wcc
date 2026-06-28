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
import { isGrayKnockoutPathState, GRAY_KNOCKOUT_PATH_COLOR } from '@/utils/knockoutResults';

interface KnockoutFlightPathProps {
    groupId: string;
    teamCode: string;
    knockoutVenues: KnockoutVenue[];
    cities: City[];
    lastGroupMatchCoords: [number, number] | null;
    groupStageCityIds?: Set<string>; // Cities already labeled by group stage
}

function getKnockoutPathStrokeStyle(displayState: KnockoutPath['displayState']) {
    const isGray = isGrayKnockoutPathState(displayState);

    return {
        chevronOpacity: isGray ? 0.42 : 1,
        chevronStrokeWidth: isGray ? 1.6 : 2,
        glowOpacity: isGray ? 0.04 : 0.15,
    };
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
    teamCode,
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
    const knockoutPaths = useKnockoutPaths(groupId, knockoutVenues, cities, teamCode);

    // Filter paths based on visibility
    const visiblePaths = knockoutPaths.filter(path => visibility.scenarios[path.scenarioId] ?? false);
    const activeLabelPath = visiblePaths.find(path => path.scenarioId === selectedKnockoutPath);
    const visiblePathRenderOrder = [...visiblePaths].sort((a, b) =>
        Number(isGrayKnockoutPathState(b.displayState))
        - Number(isGrayKnockoutPathState(a.displayState))
    );

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
                    {visiblePathRenderOrder.flatMap(path => {
                        const strokeStyle = getKnockoutPathStrokeStyle(path.displayState);
                        const normalMarker = (
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
                                    strokeWidth={strokeStyle.chevronStrokeWidth}
                                    strokeOpacity={strokeStyle.chevronOpacity}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </marker>
                        );
                        // For knocked-out paths, also define a gray marker for post-elimination segments
                        if (path.eliminationMatchIndex !== undefined) {
                            const grayMarker = (
                                <marker
                                    key={`chevron-marker-${path.id}-gray`}
                                    id={`chevron-marker-${path.id}-gray`}
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
                                        stroke={GRAY_KNOCKOUT_PATH_COLOR}
                                        strokeWidth={1.6}
                                        strokeOpacity={0.42}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </marker>
                            );
                            return [normalMarker, grayMarker];
                        }
                        return [normalMarker];
                    })}
                </defs>

                {/* Render each visible knockout path - PATHS ONLY */}
                {visiblePathRenderOrder.map((path) => (
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
    const { matches, color, displayState } = path;
    const strokeStyle = getKnockoutPathStrokeStyle(displayState);

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

                // For knocked-out paths, segments after the elimination match are grayed
                // segment[0] goes TO matches[0], segment[k] goes TO matches[k]
                const isGraySegment = path.eliminationMatchIndex !== undefined
                    && idx > path.eliminationMatchIndex;
                const segColor = isGraySegment ? GRAY_KNOCKOUT_PATH_COLOR : color;
                const segGlowOpacity = isGraySegment ? 0.04 : strokeStyle.glowOpacity;
                const segMarkerId = isGraySegment
                    ? `url(#chevron-marker-${path.id}-gray)`
                    : markerId;

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
                            stroke={segColor}
                            strokeWidth={8}
                            strokeOpacity={segGlowOpacity}
                            strokeLinecap="round"
                        />
                        {/* Chevron path */}
                        <path
                            d={chevronPathD}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={3}
                            markerMid={segMarkerId}
                        />
                    </g>
                );
            })}

            {/* Knockout stage markers with city labels - only render in labels mode */}
            {renderMode === 'labels' && (() => {
                // Track unique cities for this path to avoid duplicate labels
                // Also track which match numbers occur at each city
                const cityMatchNums = new Map<string, number[]>();

                // First pass: collect all match numbers for each city
                // Knockout matches are numbered starting from 4 (after 3 group stage matches)
                matches.forEach((matchInfo, idx) => {
                    const cityId = matchInfo.city?.id;
                    if (cityId) {
                        const matchNumber = idx + 4; // R32=4, R16=5, QF=6, SF=7, F=8
                        if (!cityMatchNums.has(cityId)) {
                            cityMatchNums.set(cityId, []);
                        }
                        cityMatchNums.get(cityId)!.push(matchNumber);
                    }
                });

                const seenCities = new Set<string>();
                // Track the match index (within matches[]) for each label entry to determine gray
                const labelEntries = matches.reduce<{
                    key: string;
                    cityId: string;
                    cityName: string;
                    label: string;
                    matchNums: number[];
                    pixel: { x: number; y: number };
                    isAlreadyLabeled: boolean;
                    firstMatchIdx: number; // first match index at this city
                }[]>((entries, matchInfo, idx) => {
                    const cityId = matchInfo.city?.id;
                    const cityName = matchInfo.city?.name;
                    if (!cityId || !cityName || seenCities.has(cityId)) {
                        return entries;
                    }

                    seenCities.add(cityId);
                    const nums = cityMatchNums.get(cityId) || [];
                    // Estimate width for placement algorithm: badges take ~16px each + 3px gap
                    const badgeWidthEstimate = nums.length > 0 ? nums.length * 16 + 3 : 0;
                    const fakePrefix = 'X'.repeat(Math.ceil(badgeWidthEstimate / 12));
                    entries.push({
                        key: `marker-${path.id}-${idx}`,
                        cityId,
                        cityName,
                        label: `${fakePrefix}${cityName}`,
                        matchNums: nums,
                        pixel: latLngToPixel(matchInfo.coords),
                        isAlreadyLabeled: groupStageCityIds.has(cityId),
                        firstMatchIdx: idx,
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

                const badgeRadius = 7;
                const badgeSpacing = 16;
                const badgeToTextGap = 3;

                return placedLabels.map(entry => {
                    // For knocked-out paths, labels after the elimination match are grayed
                    const isGrayLabel = path.eliminationMatchIndex !== undefined
                        && entry.firstMatchIdx > path.eliminationMatchIndex;
                    const labelColor = isGrayLabel ? GRAY_KNOCKOUT_PATH_COLOR : color;

                    const totalBadgesWidth = entry.matchNums.length * badgeSpacing;

                    // Calculate badge start offset based on text anchor
                    let badgeStartX = entry.placement.x;
                    if (entry.placement.anchor === 'end') {
                        badgeStartX = entry.placement.x - (entry.cityName.length * 9) - totalBadgesWidth - badgeToTextGap;
                    } else if (entry.placement.anchor === 'middle') {
                        badgeStartX = entry.placement.x - ((entry.cityName.length * 9) + totalBadgesWidth + badgeToTextGap) / 2;
                    }

                    const cityNameX = badgeStartX + totalBadgesWidth + badgeToTextGap;

                    return (
                        <g key={entry.key} style={{ pointerEvents: 'none' }}>
                            {/* Match number badges */}
                            {entry.matchNums.map((num, i) => {
                                const cx = badgeStartX + i * badgeSpacing + badgeRadius;
                                const cy = entry.placement.y - 5;
                                return (
                                    <g key={`badge-${i}`}>
                                        <circle cx={cx} cy={cy} r={badgeRadius + 1.5} fill="white" />
                                        <circle cx={cx} cy={cy} r={badgeRadius} fill={labelColor} />
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
                                y={entry.placement.y}
                                textAnchor="start"
                                fontSize="15"
                                fontWeight={700}
                                fill={labelColor}
                                stroke="white"
                                strokeWidth="4"
                                paintOrder="stroke fill"
                                style={{ pointerEvents: 'none' }}
                            >
                                {entry.cityName}
                            </text>
                        </g>
                    );
                });
            })()}
        </g>
    );
}
