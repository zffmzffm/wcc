'use client';
import { useMemo, useEffect, useCallback } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Match, City, Team } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { formatDateTimeWithTimezone, getTeamDisplay } from '@/utils/formatters';
import { useHoverMatch } from '@/contexts/HoverMatchContext';

interface MatchDayLabelsProps {
    matches: Match[];
    knockoutVenues: KnockoutVenue[];
    cities: City[];
    teams: Team[];
    timezone: string;
}

// Stage display names
const stageNames: Record<string, string> = {
    'R32': 'R32',
    'R16': 'R16',
    'QF': 'QF',
    'SF': 'SF',
    'F': 'Final',
    '3P': '3P'
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
    const { setHoveredMatchId } = useHoverMatch();

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

    // Create labels for each city with matches
    return (
        <>
            {Object.entries(matchesByCity).map(([cityId, cityMatches]) => {
                const city = cities.find(c => c.id === cityId);
                if (!city) return null;

                // Sort matches by time
                const sortedMatches = [...cityMatches.matches].sort(
                    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                );
                const sortedKnockout = [...cityMatches.knockoutVenues].sort(
                    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                );

                // Create custom icon with match info
                const matchCount = sortedMatches.length + sortedKnockout.length;
                const labelIcon = L.divIcon({
                    className: 'match-day-label',
                    html: `
                        <div style="
                            position: relative;
                            background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,247,245,0.9) 100%);
                            backdrop-filter: blur(12px);
                            -webkit-backdrop-filter: blur(12px);
                            border-radius: 12px;
                            padding: 0;
                            box-shadow: 
                                0 8px 32px rgba(45,90,61,0.15),
                                0 2px 8px rgba(0,0,0,0.08),
                                inset 0 1px 0 rgba(255,255,255,0.8);
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            min-width: 160px;
                            overflow: hidden;
                            border: 1px solid rgba(45,90,61,0.12);
                        ">
                            <!-- Header with city name -->
                            <div style="
                                padding: 6px 10px 5px;
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                background: #E8EDE8;
                                border-bottom: 1px solid rgba(45,90,61,0.12);
                            ">
                                <span style="font-size: 16px;">📍</span>
                                <div style="
                                    font-weight: 700;
                                    font-size: 14px;
                                    color: #2D3A2D;
                                    letter-spacing: -0.3px;
                                ">${city.name}</div>
                            </div>
                            
                            <!-- Match list -->
                            <div style="padding: 5px 10px 6px;">
                                ${sortedMatches.slice(0, 3).map(m => {
                        const team1 = getTeamDisplay(m.team1, teams);
                        const team2 = getTeamDisplay(m.team2, teams);
                        const { time } = formatDateTimeWithTimezone(m.datetime, timezone);
                        return `
                                    <div 
                                        data-match-id="${m.id}"
                                        class="match-label-row"
                                        style="
                                            font-size: 11px;
                                            color: #2D3A2D;
                                            margin-bottom: 3px;
                                            display: flex;
                                            align-items: center;
                                            gap: 8px;
                                            padding: 3px 4px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            transition: background 0.15s ease;
                                        "
                                    >
                                        <span style="
                                            color: #3D7A53;
                                            font-weight: 700;
                                            font-size: 11px;
                                            min-width: 42px;
                                            padding: 2px 6px;
                                            background: rgba(45,90,61,0.08);
                                            border-radius: 4px;
                                            text-align: center;
                                        ">${time}</span>
                                        <span style="
                                            font-weight: 600;
                                            color: #5A6B5A;
                                            display: flex;
                                            align-items: center;
                                            gap: 6px;
                                        ">
                                            <span style="color: #2D3A2D;">${team1.code}</span>
                                            <span style="
                                                font-size: 9px;
                                                color: #8A9B8A;
                                                font-weight: 700;
                                                padding: 1px 4px;
                                                background: rgba(45,90,61,0.06);
                                                border-radius: 3px;
                                            ">VS</span>
                                            <span style="color: #2D3A2D;">${team2.code}</span>
                                        </span>
                                    </div>
                                `;
                    }).join('')}
                                ${sortedKnockout.slice(0, 2).map(v => {
                        const { time } = formatDateTimeWithTimezone(v.datetime, timezone);
                        return `
                                    <div style="
                                        font-size: 11px;
                                        color: #2D3A2D;
                                        margin-bottom: 3px;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                    ">
                                        <span style="
                                            color: #3D7A53;
                                            font-weight: 700;
                                            font-size: 11px;
                                            min-width: 42px;
                                            padding: 2px 6px;
                                            background: rgba(45,90,61,0.08);
                                            border-radius: 4px;
                                            text-align: center;
                                        ">${time}</span>
                                        <span style="
                                            font-weight: 700;
                                            font-size: 11px;
                                            color: white;
                                            padding: 2px 8px;
                                            background: linear-gradient(135deg, #2D5A3D 0%, #3D7A53 100%);
                                            border-radius: 4px;
                                            letter-spacing: 0.3px;
                                        ">${stageNames[v.stage] || v.stage}</span>
                                    </div>
                                `;
                    }).join('')}
                                ${matchCount > 3 ? `
                                    <div style="
                                        font-size: 9px;
                                        color: #8A9B8A;
                                        font-weight: 500;
                                        margin-top: 2px;
                                        padding-top: 4px;
                                        border-top: 1px dashed rgba(45,90,61,0.1);
                                    ">+${matchCount - 3} more</div>
                                ` : ''}
                            </div>
                        </div>
                    `,
                    iconSize: [180, 100],
                    iconAnchor: [-20, 50],  // Offset to the right of the city marker
                });

                return (
                    <Marker
                        key={`label-${cityId}`}
                        position={[city.lat, city.lng]}
                        icon={labelIcon}
                        eventHandlers={{}}
                    />
                );
            })}
        </>
    );
}
