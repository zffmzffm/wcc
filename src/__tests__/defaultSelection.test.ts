import { describe, expect, it } from 'vitest';
import {
    getDefaultInitialMatchDay,
    getDefaultSelectionDate,
    MatchScheduleEvent,
} from '@/utils/defaultSelection';

const scheduleEvents: MatchScheduleEvent[] = [
    { datetime: '2026-06-11T15:00:00-04:00' },
    { datetime: '2026-06-12T15:00:00-04:00' },
    { datetime: '2026-06-15T15:00:00-04:00' },
    { datetime: '2026-07-19T15:00:00-04:00' },
];

describe('defaultSelection', () => {
    describe('getDefaultSelectionDate', () => {
        it('keeps the previous EDT date before the 2am refresh', () => {
            expect(getDefaultSelectionDate(new Date('2026-06-13T01:59:00-04:00')))
                .toBe('2026-06-12');
        });

        it('uses the current EDT date at the 2am refresh', () => {
            expect(getDefaultSelectionDate(new Date('2026-06-13T02:00:00-04:00')))
                .toBe('2026-06-13');
        });
    });

    describe('getDefaultInitialMatchDay', () => {
        it('selects the current match day during the tournament', () => {
            expect(getDefaultInitialMatchDay(scheduleEvents, new Date('2026-06-12T10:00:00-04:00')))
                .toBe('2026-06-12');
        });

        it('selects the next match day when the current EDT day has no matches', () => {
            expect(getDefaultInitialMatchDay(scheduleEvents, new Date('2026-06-13T10:00:00-04:00')))
                .toBe('2026-06-15');
        });

        it('selects the first match day before the tournament starts', () => {
            expect(getDefaultInitialMatchDay(scheduleEvents, new Date('2026-06-10T10:00:00-04:00')))
                .toBe('2026-06-11');
        });

        it('keeps the final match day while the final is still live', () => {
            expect(getDefaultInitialMatchDay(scheduleEvents, new Date('2026-07-19T16:59:00-04:00')))
                .toBe('2026-07-19');
        });

        it('returns null after the final live window has ended', () => {
            expect(getDefaultInitialMatchDay(scheduleEvents, new Date('2026-07-19T17:00:00-04:00')))
                .toBeNull();
        });
    });
});
