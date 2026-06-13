import { describe, expect, it } from 'vitest';
import { flipScore, getScoreDisplay } from '@/utils/score';

describe('score helpers', () => {
    it('falls back to VS when no score is available', () => {
        expect(getScoreDisplay(undefined)).toEqual({
            label: 'VS',
            ariaLabel: 'versus',
            isScored: false,
        });
    });

    it('formats scores in left-right order', () => {
        expect(getScoreDisplay({ left: 2, right: 1 })).toEqual({
            label: '2-1',
            ariaLabel: '2 to 1',
            isScored: true,
        });
    });

    it('can flip a score when the displayed team order is flipped', () => {
        expect(flipScore({ left: 2, right: 1 })).toEqual({ left: 1, right: 2 });
    });
});
