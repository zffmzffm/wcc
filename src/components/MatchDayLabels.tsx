'use client';
import { useMemo, useEffect, useCallback } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Match, City, Team } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { formatDateTimeWithTimezone, getTeamDisplay } from '@/utils/formatters';
import { getDayDifference } from '@/utils/dateUtils';
import { useHoverMatch } from '@/contexts/HoverMatchContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { STAGE_NAMES } from '@/constants';

interface MatchDayLabelsProps {
    matches: Match[];
    knockoutVenues: KnockoutVenue[];
    cities: City[];
    teams: Team[];
    timezone: string;
}



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

                const matchCount = sortedMatches.length + sortedKnockout.length;
                
                const labelIcon = L.divIcon({
                    className: 'custom-match-label',
                    html: `
                        <div class="match-day-label-container">
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
                        return `
                                    <div data-match-id="${m.id}" class="match-day-label-row">
                                        <span class="match-day-label-time">${timeDisplay}</span>
                                        <span class="match-day-label-teams">
                                            <span class="match-day-label-team-code">${team1.code}</span>
                                            <span class="match-day-label-vs">VS</span>
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
                        return `
                                    <div class="match-day-label-row">
                                        <span class="match-day-label-time">${timeDisplay}</span>
                                        <span class="match-day-label-teams">
                                            <span class="match-day-label-team-code">${matchupParts[0] || 'TBD'}</span>
                                            <span class="match-day-label-vs">VS</span>
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
                    iconSize: [0, 0], // CSS handles size
                    iconAnchor: isMobile ? [-10, 35] : [-20, 50],
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
