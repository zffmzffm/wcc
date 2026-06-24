import type { KnockoutPosition } from '@/data/knockoutBracket';
import knockoutResultsData from '@/data/knockoutResults.json';

export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type KnockoutPathDisplayState =
    | 'open'
    | 'actual'
    | 'pending'
    | 'impossible'
    | 'eliminated';

export interface GroupKnockoutResult {
    first?: string;
    second?: string;
    eliminated?: string[];
}

export interface KnockoutResults {
    groups?: Partial<Record<GroupId, GroupKnockoutResult>>;
    thirdPlaceSlots?: Record<string, string>;
}

export const GRAY_KNOCKOUT_PATH_COLOR = '#AAB1BA';

const results = knockoutResultsData as KnockoutResults;

function normalizeTeamCode(teamCode?: string): string {
    return String(teamCode || '').trim().toUpperCase();
}

export function getKnockoutResults(): KnockoutResults {
    return results;
}

export function getGroupResult(groupId: string, source: KnockoutResults = results): GroupKnockoutResult | undefined {
    return source.groups?.[groupId as GroupId];
}

export function resolveKnockoutSide(
    matchId: string,
    side: string,
    source: KnockoutResults = results
): string {
    const value = side.trim();
    const seededMatch = value.match(/^([12])([A-L])$/);

    if (seededMatch) {
        const groupResult = getGroupResult(seededMatch[2], source);
        const resolved = seededMatch[1] === '1' ? groupResult?.first : groupResult?.second;
        return normalizeTeamCode(resolved) || value;
    }

    if (/^3[A-L]+$/.test(value)) {
        return normalizeTeamCode(source.thirdPlaceSlots?.[matchId]) || value;
    }

    return value;
}

export function resolveKnockoutMatchup(
    matchId: string,
    matchup?: string,
    source: KnockoutResults = results
): [string, string] {
    const [left, right] = (matchup || 'TBD vs TBD').split(/\s+vs\s+/);

    return [
        resolveKnockoutSide(matchId, left || 'TBD', source),
        resolveKnockoutSide(matchId, right || 'TBD', source),
    ];
}

export function getKnockoutPathDisplayState({
    teamCode,
    groupId,
    position,
    r32MatchId,
    source = results,
}: {
    teamCode?: string;
    groupId: string;
    position: KnockoutPosition;
    r32MatchId: string;
    source?: KnockoutResults;
}): KnockoutPathDisplayState {
    const normalizedTeam = normalizeTeamCode(teamCode);
    if (!normalizedTeam) {
        return 'open';
    }

    const groupResult = getGroupResult(groupId, source);
    const thirdPlaceTeamForPath = normalizeTeamCode(source.thirdPlaceSlots?.[r32MatchId]);

    if (thirdPlaceTeamForPath === normalizedTeam) {
        return position === 3 ? 'actual' : 'impossible';
    }

    if (!groupResult) {
        return 'open';
    }

    const first = normalizeTeamCode(groupResult.first);
    const second = normalizeTeamCode(groupResult.second);
    const eliminated = new Set((groupResult.eliminated || []).map(normalizeTeamCode));

    if (eliminated.has(normalizedTeam)) {
        return 'eliminated';
    }

    if (first === normalizedTeam) {
        return position === 1 ? 'actual' : 'impossible';
    }

    if (second === normalizedTeam) {
        return position === 2 ? 'actual' : 'impossible';
    }

    if (first && second) {
        return position === 3 ? 'pending' : 'impossible';
    }

    return 'open';
}

export function isGrayKnockoutPathState(state: KnockoutPathDisplayState): boolean {
    return state === 'impossible' || state === 'eliminated';
}

export function getDisplayColor(baseColor: string, state: KnockoutPathDisplayState): string {
    return isGrayKnockoutPathState(state)
        ? GRAY_KNOCKOUT_PATH_COLOR
        : baseColor;
}
