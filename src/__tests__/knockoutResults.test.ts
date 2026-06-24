import { describe, expect, it } from 'vitest';
import {
    getKnockoutPathDisplayState,
    resolveKnockoutMatchup,
    type KnockoutResults,
} from '@/utils/knockoutResults';

const source: KnockoutResults = {
    groups: {
        B: {
            first: 'CAN',
            second: 'SUI',
            eliminated: ['QAT'],
        },
    },
    thirdPlaceSlots: {},
};

describe('knockout results resolution', () => {
    it('resolves first and second group seeds without changing unresolved tokens', () => {
        expect(resolveKnockoutMatchup('R32_73', '2A vs 2B', source)).toEqual(['2A', 'SUI']);
        expect(resolveKnockoutMatchup('R32_85', '1B vs 3EFGIJ', source)).toEqual(['CAN', '3EFGIJ']);
        expect(resolveKnockoutMatchup('R16_93', 'W83 vs W84', source)).toEqual(['W83', 'W84']);
    });

    it('marks actual, pending, and eliminated paths for a completed group', () => {
        expect(getKnockoutPathDisplayState({
            teamCode: 'CAN',
            groupId: 'B',
            position: 1,
            r32MatchId: 'R32_85',
            source,
        })).toBe('actual');

        expect(getKnockoutPathDisplayState({
            teamCode: 'CAN',
            groupId: 'B',
            position: 2,
            r32MatchId: 'R32_73',
            source,
        })).toBe('impossible');

        expect(getKnockoutPathDisplayState({
            teamCode: 'BIH',
            groupId: 'B',
            position: 3,
            r32MatchId: 'R32_81',
            source,
        })).toBe('pending');

        expect(getKnockoutPathDisplayState({
            teamCode: 'QAT',
            groupId: 'B',
            position: 3,
            r32MatchId: 'R32_81',
            source,
        })).toBe('eliminated');
    });
});
