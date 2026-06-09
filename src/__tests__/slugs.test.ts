import { describe, expect, it } from 'vitest';
import { cityIdToSlug, slugToCityId, teamNameToSlug } from '@/utils/slugs';

describe('slugs', () => {
    it('creates stable team slugs for names with accents and punctuation', () => {
        expect(teamNameToSlug('Türkiye')).toBe('turkiye');
        expect(teamNameToSlug("Côte d'Ivoire")).toBe('cote-divoire');
        expect(teamNameToSlug('Curaçao')).toBe('curacao');
    });

    it('converts between city ids and URL slugs', () => {
        expect(cityIdToSlug('new_york')).toBe('new-york');
        expect(cityIdToSlug('mexico_city')).toBe('mexico-city');
        expect(slugToCityId('san-francisco')).toBe('san_francisco');
    });
});
