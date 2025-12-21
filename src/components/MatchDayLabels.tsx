'use client';
import { useMemo } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Match, City, Team } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { formatDateTimeWithTimezone, getTeamDisplay } from '@/utils/formatters';

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
                            background: white;
                            border-radius: 12px;
                            padding: 8px 12px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            min-width: 140px;
                            border-left: 4px solid #2D5A3D;
                        ">
                            <div style="font-weight: 700; font-size: 13px; color: #2D5A3D; margin-bottom: 6px;">
                                📍 ${city.name}
                            </div>
                            ${sortedMatches.slice(0, 3).map(m => {
                        const team1 = getTeamDisplay(m.team1, teams);
                        const team2 = getTeamDisplay(m.team2, teams);
                        const { time } = formatDateTimeWithTimezone(m.datetime, timezone);
                        return `
                                    <div style="font-size: 11px; color: #444; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                                        <span style="color: #888; font-weight: 600; min-width: 40px;">${time}</span>
                                        <span>${team1.code} vs ${team2.code}</span>
                                    </div>
                                `;
                    }).join('')}
                            ${sortedKnockout.slice(0, 2).map(v => {
                        const { time } = formatDateTimeWithTimezone(v.datetime, timezone);
                        return `
                                    <div style="font-size: 11px; color: #444; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                                        <span style="color: #888; font-weight: 600; min-width: 40px;">${time}</span>
                                        <span style="color: #9333ea;">${stageNames[v.stage] || v.stage}</span>
                                    </div>
                                `;
                    }).join('')}
                            ${matchCount > 3 ? `<div style="font-size: 10px; color: #888;">+${matchCount - 3} more</div>` : ''}
                        </div>
                    `,
                    iconSize: [160, 80],
                    iconAnchor: [-15, 40],  // Offset to the right of the city marker
                });

                return (
                    <Marker
                        key={`label-${cityId}`}
                        position={[city.lat, city.lng]}
                        icon={labelIcon}
                        interactive={false}
                    />
                );
            })}
        </>
    );
}
