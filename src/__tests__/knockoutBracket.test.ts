import { describe, expect, it } from 'vitest';
import {
    allKnockoutPathTemplates,
    getGroupPaths,
    getThirdPlacePathTemplates,
} from '@/data/knockoutBracket';

const expectedThirdPlaceCounts: Record<string, number> = {
    A: 2,
    B: 2,
    C: 3,
    D: 3,
    E: 6,
    F: 5,
    G: 2,
    H: 4,
    I: 6,
    J: 5,
    K: 1,
    L: 1,
};

function thirdPlaceLabels(count: number): string[] {
    return Array.from({ length: count }, (_, index) =>
        `3rd-${String.fromCharCode('a'.charCodeAt(0) + index)}`
    );
}

describe('knockout bracket path generation', () => {
    it('derives the official third-place candidate count per group from R32 matchups', () => {
        for (const [groupId, expectedCount] of Object.entries(expectedThirdPlaceCounts)) {
            expect(getThirdPlacePathTemplates(groupId)).toHaveLength(expectedCount);
        }
    });

    it('labels group scenarios as 1st, 2nd, and 3rd variants', () => {
        for (const [groupId, thirdPlaceCount] of Object.entries(expectedThirdPlaceCounts)) {
            expect(getGroupPaths(groupId).map(path => path.label)).toEqual([
                '1st',
                '2nd',
                ...thirdPlaceLabels(thirdPlaceCount),
            ]);
        }
    });

    it('traces every generated path from its R32 slot to the final', () => {
        for (const path of allKnockoutPathTemplates) {
            expect(path.path[0]).toBe(path.r32MatchId);
            expect(path.path[path.path.length - 1]).toBe('F_104');
        }
    });

    it('keeps path ids unique within each group for rendering keys and markers', () => {
        for (const groupId of Object.keys(expectedThirdPlaceCounts)) {
            const paths = getGroupPaths(groupId);
            expect(new Set(paths.map(path => path.id)).size).toBe(paths.length);
        }
    });
});
