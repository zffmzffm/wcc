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

    // Detect mobile for compact styles
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

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
                // Use compact styles on mobile
                const matchCount = sortedMatches.length + sortedKnockout.length;
                const styles = {
                    container: {
                        borderRadius: isMobile ? '8px' : '12px',
                        minWidth: isMobile ? '110px' : '160px',
                    },
                    header: {
                        padding: isMobile ? '4px 6px 3px' : '6px 10px 5px',
                        gap: isMobile ? '4px' : '6px',
                    },
                    headerIcon: isMobile ? '11px' : '16px',
                    headerText: isMobile ? '10px' : '14px',
                    content: {
                        padding: isMobile ? '3px 6px 4px' : '5px 10px 6px',
                    },
                    row: {
                        fontSize: isMobile ? '9px' : '11px',
                        gap: isMobile ? '4px' : '8px',
                        padding: isMobile ? '2px 3px' : '3px 4px',
                        marginBottom: isMobile ? '2px' : '3px',
                    },
                    time: {
                        fontSize: isMobile ? '8px' : '11px',
                        minWidth: isMobile ? '32px' : '42px',
                        padding: isMobile ? '1px 4px' : '2px 6px',
                    },
                    teams: {
                        gap: isMobile ? '3px' : '6px',
                    },
                    vs: {
                        fontSize: isMobile ? '7px' : '9px',
                        padding: isMobile ? '0px 2px' : '1px 4px',
                    },
                };

                const labelIcon = L.divIcon({
                    className: 'match-day-label',
                    html: `
                        <div style="
                            position: relative;
                            background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,247,245,0.9) 100%);
                            backdrop-filter: blur(12px);
                            -webkit-backdrop-filter: blur(12px);
                            border-radius: ${styles.container.borderRadius};
                            padding: 0;
                            box-shadow: 
                                0 8px 32px rgba(45,90,61,0.15),
                                0 2px 8px rgba(0,0,0,0.08),
                                inset 0 1px 0 rgba(255,255,255,0.8);
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            min-width: ${styles.container.minWidth};
                            overflow: hidden;
                            border: 1px solid rgba(45,90,61,0.12);
                        ">
                            <!-- Header with city name -->
                            <div style="
                                padding: ${styles.header.padding};
                                display: flex;
                                align-items: center;
                                gap: ${styles.header.gap};
                                background: #E8EDE8;
                                border-bottom: 1px solid rgba(45,90,61,0.12);
                            ">
                                <span style="font-size: ${styles.headerIcon};">📍</span>
                                <div style="
                                    font-weight: 700;
                                    font-size: ${styles.headerText};
                                    color: #2D3A2D;
                                    letter-spacing: -0.3px;
                                ">${city.name}</div>
                            </div>
                            
                            <!-- Match list -->
                            <div style="padding: ${styles.content.padding};">
                                ${sortedMatches.slice(0, 3).map(m => {
                        const team1 = getTeamDisplay(m.team1, teams);
                        const team2 = getTeamDisplay(m.team2, teams);
                        const { time } = formatDateTimeWithTimezone(m.datetime, timezone);
                        return `
                                    <div 
                                        data-match-id="${m.id}"
                                        class="match-label-row"
                                        style="
                                            font-size: ${styles.row.fontSize};
                                            color: #2D3A2D;
                                            margin-bottom: ${styles.row.marginBottom};
                                            display: flex;
                                            align-items: center;
                                            gap: ${styles.row.gap};
                                            padding: ${styles.row.padding};
                                            border-radius: 4px;
                                            cursor: pointer;
                                            transition: background 0.15s ease;
                                        "
                                    >
                                        <span style="
                                            color: #3D7A53;
                                            font-weight: 700;
                                            font-size: ${styles.time.fontSize};
                                            min-width: ${styles.time.minWidth};
                                            padding: ${styles.time.padding};
                                            background: rgba(45,90,61,0.08);
                                            border-radius: 4px;
                                            text-align: center;
                                        ">${time}</span>
                                        <span style="
                                            font-weight: 600;
                                            color: #5A6B5A;
                                            display: flex;
                                            align-items: center;
                                            gap: ${styles.teams.gap};
                                        ">
                                            <span style="color: #2D3A2D;">${team1.code}</span>
                                            <span style="
                                                font-size: ${styles.vs.fontSize};
                                                color: #8A9B8A;
                                                font-weight: 700;
                                                padding: ${styles.vs.padding};
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
                                        font-size: ${styles.row.fontSize};
                                        color: #2D3A2D;
                                        margin-bottom: ${styles.row.marginBottom};
                                        display: flex;
                                        align-items: center;
                                        gap: ${styles.row.gap};
                                    ">
                                        <span style="
                                            color: #3D7A53;
                                            font-weight: 700;
                                            font-size: ${styles.time.fontSize};
                                            min-width: ${styles.time.minWidth};
                                            padding: ${styles.time.padding};
                                            background: rgba(45,90,61,0.08);
                                            border-radius: 4px;
                                            text-align: center;
                                        ">${time}</span>
                                        <span style="
                                            font-weight: 700;
                                            font-size: ${styles.time.fontSize};
                                            color: white;
                                            padding: ${styles.time.padding};
                                            background: linear-gradient(135deg, #2D5A3D 0%, #3D7A53 100%);
                                            border-radius: 4px;
                                            letter-spacing: 0.3px;
                                        ">${stageNames[v.stage] || v.stage}</span>
                                    </div>
                                `;
                    }).join('')}
                                ${matchCount > 3 ? `
                                    <div style="
                                        font-size: ${styles.vs.fontSize};
                                        color: #8A9B8A;
                                        font-weight: 500;
                                        margin-top: 2px;
                                        padding-top: ${isMobile ? '2px' : '4px'};
                                        border-top: 1px dashed rgba(45,90,61,0.1);
                                    ">+${matchCount - 3} more</div>
                                ` : ''}
                            </div>
                        </div>
                    `,
                    iconSize: isMobile ? [120, 70] : [180, 100],
                    iconAnchor: isMobile ? [-10, 35] : [-20, 50],  // Offset to the right of the city marker
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
