'use client';
import { useMemo, useEffect, useCallback } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Match, City, Team } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { formatDateTimeWithTimezone, getTeamDisplay } from '@/utils/formatters';
import { getDayDifference } from '@/utils/dateUtils';
import { getScoreDisplay } from '@/utils/score';
import { useHoverMatch } from '@/contexts/HoverMatchContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMapRefresh } from '@/hooks/useMapRefresh';

interface MatchDayLabelsProps {
    matches: Match[];
    knockoutVenues: KnockoutVenue[];
    cities: City[];
    teams: Team[];
    timezone: string;
}

type LabelRect = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

type LabelMetrics = {
    width: number;
    headerHeight: number;
    contentPaddingHeight: number;
    rowHeight: number;
    moreHeight: number;
    markerRadius: number;
    gap: number;
    mapPadding: number;
};

type CandidatePlacement = {
    key: string;
    dx: number;
    dy: number;
    preference: number;
};

type CityLabelEntry = {
    cityId: string;
    city: City;
    sortedMatches: Match[];
    sortedKnockout: KnockoutVenue[];
    matchCount: number;
    width: number;
    height: number;
    point: L.Point;
    nearestNeighborDistance: number;
    placement: {
        iconAnchor: [number, number];
        bounds: LabelRect;
    };
};

const LABEL_METRICS = {
    desktop: {
        width: 190,
        headerHeight: 34,
        contentPaddingHeight: 14,
        rowHeight: 28,
        moreHeight: 22,
        markerRadius: 18,
        gap: 18,
        mapPadding: 8
    },
    mobile: {
        width: 132,
        headerHeight: 24,
        contentPaddingHeight: 10,
        rowHeight: 20,
        moreHeight: 15,
        markerRadius: 15,
        gap: 15,
        mapPadding: 6
    }
} as const satisfies Record<string, LabelMetrics>;

const CITY_PLACEMENT_PREFERENCES: Record<string, string[]> = {
    atlanta: ['right-top', 'top', 'left-top', 'right-middle', 'left-middle', 'right-bottom', 'bottom', 'left-bottom'],
    miami: ['left-bottom', 'bottom', 'right-bottom', 'left-middle', 'left-top', 'top', 'right-middle', 'right-top'],
    boston: ['right-top', 'right-middle', 'top', 'right-bottom', 'left-top', 'left-middle', 'bottom', 'left-bottom'],
    new_york: ['right-bottom', 'right-middle', 'bottom', 'right-top', 'left-bottom', 'top', 'left-middle', 'left-top'],
    philadelphia: ['right-bottom', 'bottom', 'left-bottom', 'right-middle', 'left-middle', 'right-top', 'top', 'left-top'],
    seattle: ['right-bottom', 'right-middle', 'bottom', 'right-top', 'top', 'left-bottom', 'left-middle', 'left-top'],
    vancouver: ['top', 'right-top', 'left-top', 'right-middle', 'left-middle', 'right-bottom', 'bottom', 'left-bottom'],
    los_angeles: ['left-top', 'left-middle', 'left-bottom', 'top', 'bottom', 'right-top', 'right-bottom', 'right-middle'],
    san_francisco: ['left-bottom', 'left-middle', 'left-top', 'bottom', 'top', 'right-bottom', 'right-top', 'right-middle'],
    guadalajara: ['left-top', 'left-middle', 'top', 'left-bottom', 'bottom', 'right-top', 'right-middle', 'right-bottom'],
    mexico_city: ['right-bottom', 'right-middle', 'bottom', 'right-top', 'top', 'left-bottom', 'left-middle', 'left-top']
};

const DEFAULT_PLACEMENT_ORDER = [
    'right-top',
    'right-bottom',
    'top',
    'bottom',
    'left-top',
    'left-bottom',
    'right-middle',
    'left-middle'
];

const getLabelHeight = (
    renderedRows: number,
    hasMoreRow: boolean,
    metrics: LabelMetrics
) => (
    metrics.headerHeight +
    metrics.contentPaddingHeight +
    renderedRows * metrics.rowHeight +
    (hasMoreRow ? metrics.moreHeight : 0)
);

const createBounds = (
    point: L.Point,
    width: number,
    height: number,
    dx: number,
    dy: number
): LabelRect => ({
    left: point.x + dx,
    top: point.y + dy,
    right: point.x + dx + width,
    bottom: point.y + dy + height
});

const padBounds = (rect: LabelRect, padding: number): LabelRect => ({
    left: rect.left - padding,
    top: rect.top - padding,
    right: rect.right + padding,
    bottom: rect.bottom + padding
});

const getIntersectionArea = (a: LabelRect, b: LabelRect): number => {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
};

const getOverflowPenalty = (
    rect: LabelRect,
    mapSize: L.Point,
    padding: number
): number => {
    const overflowLeft = Math.max(0, padding - rect.left);
    const overflowTop = Math.max(0, padding - rect.top);
    const overflowRight = Math.max(0, rect.right - (mapSize.x - padding));
    const overflowBottom = Math.max(0, rect.bottom - (mapSize.y - padding));

    return overflowLeft + overflowTop + overflowRight + overflowBottom;
};

const createMarkerBounds = (point: L.Point, radius: number): LabelRect => ({
    left: point.x - radius,
    top: point.y - radius,
    right: point.x + radius,
    bottom: point.y + radius
});

const getCandidatePlacements = (
    cityId: string,
    width: number,
    height: number,
    gap: number
): CandidatePlacement[] => {
    const candidates: Record<string, Omit<CandidatePlacement, 'preference'>> = {
        'right-top': { key: 'right-top', dx: gap, dy: -height - gap },
        'right-bottom': { key: 'right-bottom', dx: gap, dy: gap },
        'right-middle': { key: 'right-middle', dx: gap, dy: -height / 2 },
        top: { key: 'top', dx: -width / 2, dy: -height - gap },
        bottom: { key: 'bottom', dx: -width / 2, dy: gap },
        'left-top': { key: 'left-top', dx: -width - gap, dy: -height - gap },
        'left-bottom': { key: 'left-bottom', dx: -width - gap, dy: gap },
        'left-middle': { key: 'left-middle', dx: -width - gap, dy: -height / 2 }
    };
    const order = CITY_PLACEMENT_PREFERENCES[cityId] || DEFAULT_PLACEMENT_ORDER;

    return Object.values(candidates)
        .map(candidate => {
            const orderIndex = order.indexOf(candidate.key);
            const preference = orderIndex >= 0
                ? orderIndex * 3
                : DEFAULT_PLACEMENT_ORDER.indexOf(candidate.key) * 3 + 30;

            return { ...candidate, preference };
        })
        .sort((a, b) => a.preference - b.preference);
};

const scorePlacement = ({
    bounds,
    candidate,
    placedBounds,
    markerBounds,
    mapSize,
    metrics
}: {
    bounds: LabelRect;
    candidate: CandidatePlacement;
    placedBounds: LabelRect[];
    markerBounds: LabelRect[];
    mapSize: L.Point;
    metrics: LabelMetrics;
}): number => {
    const labelOverlap = placedBounds.reduce(
        (score, placed) => score + getIntersectionArea(bounds, padBounds(placed, metrics.gap)),
        0
    );
    const markerOverlap = markerBounds.reduce(
        (score, marker) => score + getIntersectionArea(bounds, marker),
        0
    );
    const overflow = getOverflowPenalty(bounds, mapSize, metrics.mapPadding);

    return (
        candidate.preference +
        labelOverlap * 20 +
        markerOverlap * 12 +
        overflow * 80
    );
};



/**
 * Component that renders match information labels on the map for a selected day
 */
export default function MatchDayLabels({
    matches,
    knockoutVenues,
    cities,
    teams,
    timezone
}: MatchDayLabelsProps) {
    const map = useMap();
    const mapRefreshKey = useMapRefresh();
    const { setHoveredMatchId } = useHoverMatch();
    const isMobile = useIsMobile();

    // Handle hover events on match rows in the labels
    const handleMouseOver = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const matchRow = target.closest('[data-match-id]') as HTMLElement;
        if (matchRow) {
            const matchId = parseInt(matchRow.dataset.matchId || '', 10);
            if (!isNaN(matchId)) {
                setHoveredMatchId(matchId);
            }
        }
    }, [setHoveredMatchId]);

    const handleMouseOut = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const matchRow = target.closest('[data-match-id]') as HTMLElement;
        if (matchRow) {
            setHoveredMatchId(null);
        }
    }, [setHoveredMatchId]);

    // Setup event delegation on the map container
    useEffect(() => {
        const container = map.getContainer();
        container.addEventListener('mouseover', handleMouseOver);
        container.addEventListener('mouseout', handleMouseOut);

        return () => {
            container.removeEventListener('mouseover', handleMouseOver);
            container.removeEventListener('mouseout', handleMouseOut);
        };
    }, [map, handleMouseOver, handleMouseOut]);

    // Group matches by city
    const matchesByCity = useMemo(() => {
        const grouped: Record<string, { matches: Match[]; knockoutVenues: KnockoutVenue[] }> = {};

        matches.forEach(m => {
            if (!grouped[m.cityId]) {
                grouped[m.cityId] = { matches: [], knockoutVenues: [] };
            }
            grouped[m.cityId].matches.push(m);
        });

        knockoutVenues.forEach(v => {
            if (!grouped[v.cityId]) {
                grouped[v.cityId] = { matches: [], knockoutVenues: [] };
            }
            grouped[v.cityId].knockoutVenues.push(v);
        });

        return grouped;
    }, [matches, knockoutVenues]);

    const labelEntries = useMemo<CityLabelEntry[]>(() => {
        const metrics = isMobile ? LABEL_METRICS.mobile : LABEL_METRICS.desktop;
        const mapSize = map.getSize();

        const entries = Object.entries(matchesByCity)
            .reduce<CityLabelEntry[]>((acc, [cityId, cityMatches]) => {
                const city = cities.find(c => c.id === cityId);
                if (!city) return acc;

                const sortedMatches = [...cityMatches.matches].sort(
                    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                );
                const sortedKnockout = [...cityMatches.knockoutVenues].sort(
                    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                );
                const matchCount = sortedMatches.length + sortedKnockout.length;
                const renderedRows = Math.min(sortedMatches.length, 3) + Math.min(sortedKnockout.length, 2);
                const height = getLabelHeight(renderedRows, matchCount > 3, metrics);
                const point = map.latLngToContainerPoint([city.lat, city.lng]);

                acc.push({
                    cityId,
                    city,
                    sortedMatches,
                    sortedKnockout,
                    matchCount,
                    width: metrics.width,
                    height,
                    point,
                    nearestNeighborDistance: Number.POSITIVE_INFINITY,
                    placement: {
                        iconAnchor: [0, 0] as [number, number],
                        bounds: createBounds(point, metrics.width, height, metrics.gap, -height - metrics.gap)
                    }
                });

                return acc;
            }, []);
        const markerBounds = entries.map(entry => createMarkerBounds(entry.point, metrics.markerRadius));

        entries.forEach(entry => {
            entry.nearestNeighborDistance = entries.reduce((nearest, other) => {
                if (other.cityId === entry.cityId) return nearest;
                return Math.min(nearest, entry.point.distanceTo(other.point));
            }, Number.POSITIVE_INFINITY);
        });

        const sortedEntries = [...entries].sort((a, b) => {
            if (a.nearestNeighborDistance !== b.nearestNeighborDistance) {
                return a.nearestNeighborDistance - b.nearestNeighborDistance;
            }
            if (a.point.y !== b.point.y) return a.point.y - b.point.y;
            return a.point.x - b.point.x;
        });

        const placedBounds: LabelRect[] = [];
        const placements = new Map<string, CityLabelEntry['placement']>();

        sortedEntries.forEach(entry => {
            const bestPlacement = getCandidatePlacements(entry.cityId, entry.width, entry.height, metrics.gap)
                .map(candidate => {
                    const bounds = createBounds(entry.point, entry.width, entry.height, candidate.dx, candidate.dy);
                    return {
                        candidate,
                        bounds,
                        score: scorePlacement({
                            bounds,
                            candidate,
                            placedBounds,
                            markerBounds,
                            mapSize,
                            metrics
                        })
                    };
                })
                .sort((a, b) => a.score - b.score)[0];

            const placement = {
                iconAnchor: [-bestPlacement.candidate.dx, -bestPlacement.candidate.dy] as [number, number],
                bounds: bestPlacement.bounds
            };

            placements.set(entry.cityId, placement);
            placedBounds.push(bestPlacement.bounds);
        });

        return entries.map(entry => ({
            ...entry,
            placement: placements.get(entry.cityId) || entry.placement
        }));
    }, [cities, isMobile, map, mapRefreshKey, matchesByCity]);

    // Create labels for each city with matches
    return (
        <>
            {labelEntries.map((entry) => {
                const { cityId, city, sortedMatches, sortedKnockout, matchCount, width, height, placement } = entry;
                const labelIcon = L.divIcon({
                    className: 'custom-match-label',
                    html: `
                        <div class="match-day-label-container" style="width: ${width}px;">
                            <!-- Header with city name -->
                            <div class="match-day-label-header">
                                <span>📍</span>
                                <div>${city.name}</div>
                            </div>
                            
                            <!-- Match list -->
                            <div class="match-day-label-content">
                                ${sortedMatches.slice(0, 3).map(m => {
                        const team1 = getTeamDisplay(m.team1, teams);
                        const team2 = getTeamDisplay(m.team2, teams);
                        const { time } = formatDateTimeWithTimezone(m.datetime, timezone);
                        const dayDiff = getDayDifference(m.datetime, timezone);
                        const timeDisplay = dayDiff !== 0 ? `${time} (${dayDiff > 0 ? '+' : ''}${dayDiff})` : time;
                        const scoreDisplay = getScoreDisplay(m.score);
                        const scoreClassName = `match-day-label-vs${scoreDisplay.isScored ? ' is-scored' : ''}`;
                        return `
                                    <div data-match-id="${m.id}" class="match-day-label-row">
                                        <span class="match-day-label-time">${timeDisplay}</span>
                                        <span class="match-day-label-teams">
                                            <span class="match-day-label-team-code">${team1.code}</span>
                                            <span class="${scoreClassName}" aria-label="${scoreDisplay.ariaLabel}">${scoreDisplay.label}</span>
                                            <span class="match-day-label-team-code">${team2.code}</span>
                                        </span>
                                    </div>
                                `;
                    }).join('')}
                                ${sortedKnockout.slice(0, 2).map(v => {
                        const { time } = formatDateTimeWithTimezone(v.datetime, timezone);
                        const dayDiff = getDayDifference(v.datetime, timezone);
                        const timeDisplay = dayDiff !== 0 ? `${time} (${dayDiff > 0 ? '+' : ''}${dayDiff})` : time;
                        const matchupParts = (v.matchup || 'TBD vs TBD').split(' vs ');
                        const scoreDisplay = getScoreDisplay(v.score);
                        const scoreClassName = `match-day-label-vs${scoreDisplay.isScored ? ' is-scored' : ''}`;
                        return `
                                    <div class="match-day-label-row">
                                        <span class="match-day-label-time">${timeDisplay}</span>
                                        <span class="match-day-label-teams">
                                            <span class="match-day-label-team-code">${matchupParts[0] || 'TBD'}</span>
                                            <span class="${scoreClassName}" aria-label="${scoreDisplay.ariaLabel}">${scoreDisplay.label}</span>
                                            <span class="match-day-label-team-code">${matchupParts[1] || 'TBD'}</span>
                                        </span>
                                    </div>
                                `;
                    }).join('')}
                                ${matchCount > 3 ? `
                                    <div style="font-size: 9px; color: #8A9B8A; font-weight: 500; margin-top: 2px; padding-top: 2px; border-top: 1px dashed rgba(45,90,61,0.1);">
                                        +${matchCount - 3} more
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `,
                    iconSize: [width, height],
                    iconAnchor: placement.iconAnchor,
                });

                return (
                    <Marker
                        key={`label-${cityId}`}
                        position={[city.lat, city.lng]}
                        icon={labelIcon}
                        zIndexOffset={2000}
                        eventHandlers={{}}
                    />
                );
            })}
        </>
    );
}
