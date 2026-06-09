/**
 * Knockout bracket path generation.
 *
 * R32 participants are read from knockoutVenues.json. Later rounds are traced
 * by following winner tokens such as W73 -> W90 -> W97 -> W101 -> F_104.
 */
import type { KnockoutVenue } from '@/repositories/types';
import knockoutVenuesData from './knockoutVenues.json';

export type KnockoutPosition = 1 | 2 | 3;

export interface KnockoutPathTemplate {
    id: string;
    scenarioId: string;
    groupId: string;
    position: KnockoutPosition;
    label: string;
    variantIndex: number;
    r32MatchId: string;
    color: string;
    path: string[];
    description: string;
}

const FINAL_MATCH_ID = 'F_104';
const GROUP_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

const SCENARIO_COLORS: Record<string, string> = {
    '1st': '#D4AF37',
    '2nd': '#2F855A',
};

const THIRD_PLACE_COLORS = [
    '#E4572E',
    '#0077B6',
    '#8E44AD',
    '#00897B',
    '#C2185B',
    '#5F6CAF',
];

const allKnockoutVenues = Object.values(knockoutVenuesData).flat() as KnockoutVenue[];

function getMatchNumber(matchId: string): string | null {
    const match = matchId.match(/_(\d+)$/);
    return match ? match[1] : null;
}

function getWinnerToken(matchId: string): string | null {
    const matchNumber = getMatchNumber(matchId);
    return matchNumber ? `W${matchNumber}` : null;
}

function parseMatchupSides(matchup?: string): string[] {
    return (matchup || '')
        .split(/\s+vs\s+/)
        .map(side => side.trim())
        .filter(Boolean);
}

export function getScenarioColor(scenarioId: string): string {
    if (SCENARIO_COLORS[scenarioId]) {
        return SCENARIO_COLORS[scenarioId];
    }

    const thirdPlaceMatch = scenarioId.match(/^3rd-([a-z])$/);
    if (!thirdPlaceMatch) {
        return '#666666';
    }

    const variantIndex = thirdPlaceMatch[1].charCodeAt(0) - 'a'.charCodeAt(0);
    return THIRD_PLACE_COLORS[variantIndex % THIRD_PLACE_COLORS.length];
}

export function getThirdPlaceLabel(variantIndex: number): string {
    return `3rd-${String.fromCharCode('a'.charCodeAt(0) + variantIndex)}`;
}

export function traceWinnerPath(
    r32MatchId: string,
    venues: KnockoutVenue[] = allKnockoutVenues
): string[] {
    const path = [r32MatchId];
    const seenMatchIds = new Set(path);
    let currentMatchId = r32MatchId;

    while (currentMatchId !== FINAL_MATCH_ID) {
        const winnerToken = getWinnerToken(currentMatchId);
        if (!winnerToken) {
            break;
        }

        const nextVenue = venues.find(venue =>
            venue.matchId !== currentMatchId &&
            parseMatchupSides(venue.matchup).includes(winnerToken)
        );

        if (!nextVenue || seenMatchIds.has(nextVenue.matchId)) {
            break;
        }

        path.push(nextVenue.matchId);
        seenMatchIds.add(nextVenue.matchId);
        currentMatchId = nextVenue.matchId;
    }

    return path;
}

function createTemplate(
    groupId: string,
    position: KnockoutPosition,
    variantIndex: number,
    r32MatchId: string
): KnockoutPathTemplate {
    const scenarioId = position === 1
        ? '1st'
        : position === 2
            ? '2nd'
            : getThirdPlaceLabel(variantIndex);
    const path = traceWinnerPath(r32MatchId);
    const finalMatchId = path[path.length - 1];

    if (finalMatchId !== FINAL_MATCH_ID) {
        throw new Error(`Knockout path ${groupId} ${scenarioId} does not reach ${FINAL_MATCH_ID}`);
    }

    return {
        id: `${groupId}-${scenarioId}`,
        scenarioId,
        groupId,
        position,
        label: scenarioId,
        variantIndex,
        r32MatchId,
        color: getScenarioColor(scenarioId),
        path,
        description: `${position}${groupId} ${scenarioId} path: ${path.join(' -> ')}`,
    };
}

function buildKnockoutPathTemplates(): KnockoutPathTemplate[] {
    const thirdPlaceVariantCounts = new Map<string, number>();
    const templates: KnockoutPathTemplate[] = [];

    for (const venue of allKnockoutVenues.filter(venue => venue.stage === 'R32')) {
        for (const side of parseMatchupSides(venue.matchup)) {
            const seededMatch = side.match(/^([12])([A-L])$/);
            if (seededMatch) {
                templates.push(createTemplate(
                    seededMatch[2],
                    Number(seededMatch[1]) as 1 | 2,
                    0,
                    venue.matchId
                ));
                continue;
            }

            const thirdPlaceMatch = side.match(/^3([A-L]+)$/);
            if (!thirdPlaceMatch) {
                continue;
            }

            for (const groupId of thirdPlaceMatch[1].split('')) {
                const variantIndex = thirdPlaceVariantCounts.get(groupId) || 0;
                templates.push(createTemplate(groupId, 3, variantIndex, venue.matchId));
                thirdPlaceVariantCounts.set(groupId, variantIndex + 1);
            }
        }
    }

    return GROUP_IDS.flatMap(groupId =>
        templates
            .filter(template => template.groupId === groupId)
            .sort((a, b) => a.position - b.position || a.variantIndex - b.variantIndex)
    );
}

export const allKnockoutPathTemplates: KnockoutPathTemplate[] = buildKnockoutPathTemplates();

/**
 * Deterministic first- and second-place paths.
 * Third-place variants are available through getThirdPlacePathTemplates/getGroupPaths.
 */
export const knockoutPathTemplates: KnockoutPathTemplate[] =
    allKnockoutPathTemplates.filter(template => template.position !== 3);

export function getThirdPlacePathTemplates(groupId?: string): KnockoutPathTemplate[] {
    return allKnockoutPathTemplates.filter(template =>
        template.position === 3 && (!groupId || template.groupId === groupId)
    );
}

export function getKnockoutPath(
    groupId: string,
    position: KnockoutPosition,
    scenarioId?: string
): KnockoutPathTemplate | undefined {
    return allKnockoutPathTemplates.find(template =>
        template.groupId === groupId &&
        template.position === position &&
        (!scenarioId || template.scenarioId === scenarioId)
    );
}

export function getGroupPaths(groupId: string): KnockoutPathTemplate[] {
    return allKnockoutPathTemplates.filter(template => template.groupId === groupId);
}
