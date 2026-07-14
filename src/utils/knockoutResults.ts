import type { KnockoutPosition } from '@/data/knockoutBracket';
import knockoutResultsData from '@/data/knockoutResults.json';
import knockoutVenuesData from '@/data/knockoutVenues.json';

export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type KnockoutPathDisplayState =
    | 'open'
    | 'actual'
    | 'pending'
    | 'impossible'
    | 'eliminated'    // group-stage eliminated
    | 'knocked-out';  // eliminated in a knockout round (partial path shown)

export interface GroupKnockoutResult {
    first?: string;
    second?: string;
    eliminated?: string[];
}

export interface KnockoutResults {
    groups?: Partial<Record<GroupId, GroupKnockoutResult>>;
    thirdPlaceSlots?: Record<string, string>;
    knockoutWinners?: Record<string, string>; // matchId -> winner team code, e.g. "R32_73" -> "CAN"
    knockoutEliminatedAt?: Record<string, string>; // team code -> matchId where they were eliminated, e.g. "RSA" -> "R32_73"
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

    // Winner token e.g. "W73" -> look up match R32_73 winner
    const winnerMatch = value.match(/^W(\d+)$/);
    if (winnerMatch) {
        const matchNumber = winnerMatch[1];
        // Search for a match with this number across all stages
        const matchIdSuffix = `_${matchNumber}`;
        const stages = ['R32', 'R16', 'QF', 'SF', 'F'] as const;
        for (const stage of stages) {
            const candidateId = `${stage}${matchIdSuffix}`;
            const winner = normalizeTeamCode(source.knockoutWinners?.[candidateId]);
            if (winner) return winner;
        }
        return value;
    }

    // Loser token e.g. "L101" -> look up match SF_101 loser (the team that did NOT win)
    const loserMatch = value.match(/^L(\d+)$/);
    if (loserMatch) {
        const matchNumber = loserMatch[1];
        const matchIdSuffix = `_${matchNumber}`;
        const stages = ['R32', 'R16', 'QF', 'SF', 'F'] as const;
        for (const stage of stages) {
            const candidateId = `${stage}${matchIdSuffix}`;
            const winner = normalizeTeamCode(source.knockoutWinners?.[candidateId]);
            if (winner) {
                // Find the venue to get the matchup, then resolve both sides
                const allVenues = Object.values(knockoutVenuesData).flat() as { matchId: string; matchup?: string }[];
                const venue = allVenues.find(v => v.matchId === candidateId);
                if (venue?.matchup) {
                    const [leftSide, rightSide] = venue.matchup.split(/\s+vs\s+/);
                    const resolvedLeft = resolveKnockoutSide(candidateId, leftSide || '', source);
                    const resolvedRight = resolveKnockoutSide(candidateId, rightSide || '', source);
                    // Return whichever side is NOT the winner
                    if (normalizeTeamCode(resolvedLeft) === winner) return resolvedRight;
                    if (normalizeTeamCode(resolvedRight) === winner) return resolvedLeft;
                }
            }
        }
        return value;
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

    // Determine if this team was knocked out mid-tournament.
    // This only changes the result for the path they ACTUALLY took (would be 'actual').
    // Paths that would be 'impossible' remain 'impossible' (strikethrough still shown).
    const eliminatedAtMatchId = source.knockoutEliminatedAt?.[normalizedTeam];

    const groupResult = getGroupResult(groupId, source);
    const thirdPlaceTeamForPath = normalizeTeamCode(source.thirdPlaceSlots?.[r32MatchId]);

    if (thirdPlaceTeamForPath === normalizedTeam) {
        if (position === 3) {
            return eliminatedAtMatchId ? 'knocked-out' : 'actual';
        }
        return 'impossible';
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
        if (position === 1) {
            return eliminatedAtMatchId ? 'knocked-out' : 'actual';
        }
        return 'impossible';
    }

    if (second === normalizedTeam) {
        if (position === 2) {
            return eliminatedAtMatchId ? 'knocked-out' : 'actual';
        }
        return 'impossible';
    }

    if (first && second) {
        if (position !== 3) {
            return 'impossible';
        }
        // All third-place slots are now decided. If this r32 slot is already
        // taken by another team, this path is impossible for the current team.
        if (thirdPlaceTeamForPath) {
            return 'impossible';
        }
        // Check if the team's actual r32 slot is known (assigned elsewhere).
        // If found in any slot, every other path is impossible.
        const teamSlotMatchId = Object.entries(source.thirdPlaceSlots || {}).find(
            ([, code]) => normalizeTeamCode(code) === normalizedTeam
        )?.[0];
        if (teamSlotMatchId) {
            // Team is assigned to a different r32 match — this path is not it.
            return 'impossible';
        }
        // Team's third-place fate is not yet determined.
        return 'pending';
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

/**
 * Returns true if the given team code has been eliminated mid-tournament
 * (i.e. lost in a knockout stage match rather than the group stage).
 */
export function isTeamKnockoutEliminated(teamCode: string, source: KnockoutResults = results): boolean {
    const normalized = normalizeTeamCode(teamCode);
    return !!source.knockoutEliminatedAt?.[normalized];
}

/**
 * Returns the matchId (e.g. "R32_73") where the team was knocked out mid-tournament,
 * or undefined if the team was not knocked out mid-tournament.
 */
export function getKnockoutEliminationMatchId(
    teamCode: string,
    source: KnockoutResults = results
): string | undefined {
    const normalized = normalizeTeamCode(teamCode);
    return source.knockoutEliminatedAt?.[normalized] || undefined;
}
