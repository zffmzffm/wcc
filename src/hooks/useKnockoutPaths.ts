/**
 * useKnockoutPaths Hook
 * 
 * Generates three hypothetical knockout advancement paths based on a team's group:
 * - 🟢 Group Winner path (1st place)
 * - 🔵 Group Runner-up path (2nd place)
 * - 🟠 Best 3rd Place path (3rd place)
 */
import { useMemo } from 'react';
import { MatchWithCoords, City, Match } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { knockoutPathTemplates, thirdPlacePathTemplates } from '@/data/knockoutBracket';
import { STAGE_NAMES } from '@/constants';

export interface KnockoutPath {
    position: 1 | 2 | 3;
    label: string;
    color: string;
    matches: MatchWithCoords[];
}

// Path color scheme
const PATH_COLORS = {
    1: '#D4AF37',  // Gold - 1st place (Champion's glory)
    2: '#A0B8A0',  // Sage green - 2nd place
    3: '#D08080',  // Coral - 3rd place
} as const;

// Path labels
const PATH_LABELS = {
    1: 'Group Winner',
    2: 'Group Runner-up',
    3: 'Best 3rd Place',
} as const;

/**
 * Get all knockout advancement paths for a given group.
 * 
 * @param groupId - Group ID (A-L)
 * @param knockoutVenues - Knockout venue data
 * @param cities - City data
 * @returns Three advancement paths (1st, 2nd, 3rd place)
 */
export function useKnockoutPaths(
    groupId: string,
    knockoutVenues: KnockoutVenue[],
    cities: City[]
): KnockoutPath[] {
    return useMemo(() => {
        if (!groupId) return [];

        // Get path templates for this group (1st and 2nd place)
        const mainTemplates = knockoutPathTemplates.filter(t => t.groupId === groupId);
        // Get 3rd place path
        const thirdTemplate = thirdPlacePathTemplates.find(t => t.groupId === groupId);

        // Merge all templates
        const allTemplates = thirdTemplate
            ? [...mainTemplates, thirdTemplate]
            : mainTemplates;

        // Create venue and city lookup maps
        const venueMap = new Map(knockoutVenues.map(v => [v.matchId, v]));
        const cityMap = new Map(cities.map(c => [c.id, c]));

        return allTemplates.map(template => {
            // Convert path template matchId sequence to matches with coordinates
            const matches: MatchWithCoords[] = template.path
                .map(matchId => {
                    const venue = venueMap.get(matchId);
                    if (!venue) return null;

                    const city = cityMap.get(venue.cityId);
                    if (!city) return null;

                    // Parse matchup to get team labels
                    const matchupParts = (venue.matchup || 'TBD vs TBD').split(' vs ');

                    // Construct Match object for knockout match
                    const match: Match = {
                        id: parseInt(matchId.split('_')[1]) || 0,
                        group: '',  // knockout matches have no group
                        team1: matchupParts[0] || 'TBD',
                        team2: matchupParts[1] || 'TBD',
                        cityId: venue.cityId,
                        datetime: venue.datetime,
                        stage: venue.stage,
                        matchup: venue.matchup,  // Include matchup for home/away determination
                    };

                    return {
                        match,
                        coords: [city.lat, city.lng] as [number, number],
                        city,
                    };
                })
                .filter((m): m is MatchWithCoords => m !== null);

            return {
                position: template.position,
                label: PATH_LABELS[template.position],
                color: PATH_COLORS[template.position],
                matches,
            };
        });
    }, [groupId, knockoutVenues, cities]);
}

/**
 * Format a knockout stage name for display.
 */
export function getStageLabel(stage: string): string {
    const stageKey = stage as keyof typeof STAGE_NAMES.full;
    return STAGE_NAMES.full[stageKey] || stage;
}
