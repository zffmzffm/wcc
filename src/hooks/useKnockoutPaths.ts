/**
 * useKnockoutPaths Hook
 *
 * Builds the available knockout scenarios for a team's group:
 * 1st, 2nd, and every third-place variant derived from R32 matchup placeholders.
 */
import { useMemo } from 'react';
import { MatchWithCoords, City, Match } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { getGroupPaths, KnockoutPosition } from '@/data/knockoutBracket';
import { STAGE_NAMES } from '@/constants';

export interface KnockoutPath {
    id: string;
    scenarioId: string;
    position: KnockoutPosition;
    label: string;
    variantIndex: number;
    r32MatchId: string;
    color: string;
    matchIds: string[];
    matches: MatchWithCoords[];
}

/**
 * Get all knockout advancement paths for a given group.
 *
 * @param groupId - Group ID (A-L)
 * @param knockoutVenues - Flattened knockout venue data
 * @param cities - City data
 * @returns Advancement paths for 1st, 2nd, and all possible third-place slots
 */
export function useKnockoutPaths(
    groupId: string,
    knockoutVenues: KnockoutVenue[],
    cities: City[]
): KnockoutPath[] {
    return useMemo(() => {
        if (!groupId) return [];

        const templates = getGroupPaths(groupId);
        const venueMap = new Map(knockoutVenues.map(v => [v.matchId, v]));
        const cityMap = new Map(cities.map(c => [c.id, c]));

        return templates.map(template => {
            const matches: MatchWithCoords[] = template.path
                .map(matchId => {
                    const venue = venueMap.get(matchId);
                    if (!venue) return null;

                    const city = cityMap.get(venue.cityId);
                    if (!city) return null;

                    const matchupParts = (venue.matchup || 'TBD vs TBD').split(' vs ');
                    const matchNumber = Number(matchId.split('_')[1]) || 0;
                    const match: Match = {
                        id: matchNumber,
                        group: '',
                        team1: matchupParts[0] || 'TBD',
                        team2: matchupParts[1] || 'TBD',
                        cityId: venue.cityId,
                        datetime: venue.datetime,
                        stage: venue.stage,
                        matchup: venue.matchup,
                        score: venue.score,
                    };

                    return {
                        match,
                        coords: [city.lat, city.lng] as [number, number],
                        city,
                    };
                })
                .filter((match): match is MatchWithCoords => match !== null);

            return {
                id: template.id,
                scenarioId: template.scenarioId,
                position: template.position,
                label: template.label,
                variantIndex: template.variantIndex,
                r32MatchId: template.r32MatchId,
                color: template.color,
                matchIds: template.path,
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
