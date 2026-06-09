import { describe, expect, it } from 'vitest';
import { formatCountdownLabel, getMatchTimingStatus } from '@/utils/matchStatus';

describe('matchStatus', () => {
    it('formats countdowns with days, hours, and minutes', () => {
        expect(formatCountdownLabel(3015)).toBe('in 2D 2H 15M');
        expect(formatCountdownLabel(125)).toBe('in 2H 5M');
        expect(formatCountdownLabel(18)).toBe('in 18M');
    });

    it('treats matches inside the live window as live', () => {
        const status = getMatchTimingStatus(
            '2026-06-11T15:00:00-04:00',
            new Date('2026-06-11T16:30:00-04:00')
        );

        expect(status.kind).toBe('live');
        expect(status.label).toBe('LIVE');
    });

    it('treats matches after the live window as past', () => {
        const status = getMatchTimingStatus(
            '2026-06-11T15:00:00-04:00',
            new Date('2026-06-11T17:01:00-04:00')
        );

        expect(status.kind).toBe('past');
        expect(status.label).toBeNull();
    });

    it('rounds upcoming countdowns up to the next minute', () => {
        const status = getMatchTimingStatus(
            '2026-06-11T15:00:00-04:00',
            new Date('2026-06-11T14:59:10-04:00')
        );

        expect(status.kind).toBe('upcoming');
        expect(status.label).toBe('in 1M');
    });
});
