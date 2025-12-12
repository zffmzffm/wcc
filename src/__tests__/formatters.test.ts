import { describe, it, expect } from 'vitest';
import {
    formatDateTime,
    formatDateTimeWithTimezone,
    formatDateTimeShort,
    getTeamDisplay,
    getCountryFlag,
    getCountryCode,
    getCountryColor,
} from '@/utils/formatters';

describe('formatters', () => {
    describe('formatDateTime', () => {
        it('should return date and time object', () => {
            const datetime = '2026-06-11T14:30:00-04:00';
            const result = formatDateTime(datetime);

            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('time');
            expect(result.date).toBeTruthy();
            expect(result.time).toBeTruthy();
        });

        it('should format date with month and day', () => {
            const datetime = '2026-06-11T14:30:00-04:00';
            const result = formatDateTime(datetime);

            expect(result.date).toContain('Jun');
        });
    });

    describe('formatDateTimeWithTimezone', () => {
        it('should return date and time object', () => {
            const datetime = '2026-06-11T14:30:00-04:00';
            const result = formatDateTimeWithTimezone(datetime, 'America/New_York');

            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('time');
        });

        it('should handle different timezones', () => {
            const datetime = '2026-06-11T12:00:00-04:00';
            const nyResult = formatDateTimeWithTimezone(datetime, 'America/New_York');
            const laResult = formatDateTimeWithTimezone(datetime, 'America/Los_Angeles');

            // Both should contain the month
            expect(nyResult.date).toContain('Jun');
            expect(laResult.date).toContain('Jun');
        });
    });

    describe('formatDateTimeShort', () => {
        it('should return date and time object', () => {
            const datetime = '2026-06-11T14:30:00-04:00';
            const result = formatDateTimeShort(datetime);

            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('time');
        });

        it('should return short month format', () => {
            const datetime = '2026-06-11T14:30:00-04:00';
            const result = formatDateTimeShort(datetime);

            // Short month format
            expect(result.date).toContain('Jun');
        });
    });

    describe('getTeamDisplay', () => {
        const teams = [
            { code: 'USA', name: 'United States', group: 'A', flag: '🇺🇸' },
            { code: 'MEX', name: 'Mexico', group: 'A', flag: '🇲🇽' },
        ];

        it('should return team info for known team', () => {
            const result = getTeamDisplay('USA', teams);
            expect(result.name).toBe('United States');
            expect(result.code).toBe('USA');
            expect(result.flag).toBe('🇺🇸');
        });

        it('should return fallback for unknown team', () => {
            const result = getTeamDisplay('UNKNOWN', teams);
            expect(result.code).toBe('UNKNOWN');
            expect(result.flag).toBe('🏳️');
        });
    });

    describe('getCountryFlag', () => {
        it('should return US flag for USA', () => {
            expect(getCountryFlag('USA')).toBe('🇺🇸');
        });

        it('should return MX flag for Mexico', () => {
            expect(getCountryFlag('Mexico')).toBe('🇲🇽');
        });

        it('should return CA flag for Canada', () => {
            expect(getCountryFlag('Canada')).toBe('🇨🇦');
        });

        it('should return default flag for unknown', () => {
            expect(getCountryFlag('Unknown')).toBe('🏳️');
        });
    });

    describe('getCountryCode', () => {
        it('should return USA for USA', () => {
            expect(getCountryCode('USA')).toBe('USA');
        });

        it('should return MEX for Mexico', () => {
            expect(getCountryCode('Mexico')).toBe('MEX');
        });

        it('should return CAN for Canada', () => {
            expect(getCountryCode('Canada')).toBe('CAN');
        });

        it('should return input for unknown country', () => {
            expect(getCountryCode('Germany')).toBe('Germany');
        });
    });

    describe('getCountryColor', () => {
        it('should return blue for USA', () => {
            expect(getCountryColor('USA')).toBe('#1e40af');
        });

        it('should return green for Mexico', () => {
            expect(getCountryColor('Mexico')).toBe('#166534');
        });

        it('should return red for Canada', () => {
            expect(getCountryColor('Canada')).toBe('#dc2626');
        });

        it('should return default gray for unknown country', () => {
            expect(getCountryColor('Unknown')).toBe('#6b7280');
        });
    });
});
