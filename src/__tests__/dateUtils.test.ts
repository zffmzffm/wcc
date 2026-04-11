import { describe, it, expect } from 'vitest';
import { getMatchDay, getTournamentDayNum } from '@/utils/dateUtils';
import { TOURNAMENT_START } from '@/constants';

describe('dateUtils', () => {
    describe('getMatchDay', () => {
        it('should return the correct local match day for standard afternoon matches (EDT)', () => {
            // 2PM EDT
            const result = getMatchDay('2026-06-11T14:00:00-04:00');
            expect(result).toBe('2026-06-11');
        });

        it('should assign a 1AM EDT match to the previous day', () => {
            // 1AM EDT is technically the next calendar day in EDT, but should be mapped to the previous match day
            const result = getMatchDay('2026-06-12T01:00:00-04:00');
            expect(result).toBe('2026-06-11');
        });

        it('should assign a 10PM PDT match (next day 1AM EDT) to the previous day', () => {
            // 10PM PDT on June 11 is 1AM EDT on June 12
            // Since it's before 6AM EDT, it should be mapped to June 11
            const result = getMatchDay('2026-06-11T22:00:00-07:00');
            expect(result).toBe('2026-06-11');
        });

        it('should assign a match exactly at the 6AM EDT cutoff to the new day', () => {
            // Exactly 6AM EDT
            const result = getMatchDay('2026-06-12T06:00:00-04:00');
            expect(result).toBe('2026-06-12');
        });

        it('should assign a match precisely before the 6AM EDT cutoff to the previous day', () => {
            // 5:59:59 AM EDT
            const result = getMatchDay('2026-06-12T05:59:59-04:00');
            expect(result).toBe('2026-06-11');
        });

        it('should handle dates crossing month boundaries backwards', () => {
            // July 1 at 1AM EDT -> Should map to June 30
            const result = getMatchDay('2026-07-01T01:00:00-04:00');
            expect(result).toBe('2026-06-30');
        });
    });

    describe('getTournamentDayNum', () => {
        it('should return Day 1 for the tournament start date', () => {
            expect(getTournamentDayNum(TOURNAMENT_START)).toBe(1);
        });

        it('should return Day 2 for the second day', () => {
            expect(getTournamentDayNum('2026-06-12')).toBe(2);
        });

        it('should return Day 39 for the final day (July 19)', () => {
            expect(getTournamentDayNum('2026-07-19')).toBe(39);
        });

        it('should return negative values for dates before tournament start', () => {
            // June 10, 2026 (1 day before)
            expect(getTournamentDayNum('2026-06-10')).toBe(0);
            
            // June 9, 2026 (2 days before)
            expect(getTournamentDayNum('2026-06-09')).toBe(-1);
        });
    });
});
