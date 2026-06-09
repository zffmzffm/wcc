import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import LiveMatchStack from '@/components/LiveMatchStack';
import { City, Match, Team } from '@/types';

const cities: City[] = [
    { id: 'mexico_city', name: 'Mexico City', country: 'Mexico', countryCode: 'MEX', lat: 19.3029, lng: -99.1505, venue: 'Estadio Azteca', capacity: 87523 },
    { id: 'toronto', name: 'Toronto', country: 'Canada', countryCode: 'CAN', lat: 43.6332, lng: -79.4185, venue: 'BMO Field', capacity: 45736 },
    { id: 'los_angeles', name: 'Los Angeles', country: 'USA', countryCode: 'USA', lat: 33.9535, lng: -118.339, venue: 'SoFi Stadium', capacity: 70240 },
    { id: 'guadalajara', name: 'Guadalajara', country: 'Mexico', countryCode: 'MEX', lat: 20.702, lng: -103.3918, venue: 'Estadio Akron', capacity: 49850 },
];

const teams: Team[] = [
    { code: 'MEX', name: 'Mexico', group: 'A', flag: '' },
    { code: 'RSA', name: 'South Africa', group: 'A', flag: '' },
    { code: 'CAN', name: 'Canada', group: 'B', flag: '' },
    { code: 'BIH', name: 'Bosnia and Herzegovina', group: 'B', flag: '' },
    { code: 'USA', name: 'United States', group: 'D', flag: '' },
    { code: 'PAR', name: 'Paraguay', group: 'D', flag: '' },
    { code: 'KOR', name: 'Korea Republic', group: 'A', flag: '' },
    { code: 'CZE', name: 'Czechia', group: 'A', flag: '' },
    { code: 'BRA', name: 'Brazil', group: 'C', flag: '' },
    { code: 'MAR', name: 'Morocco', group: 'C', flag: '' },
];

const matches: Match[] = [
    { id: 99, group: 'Z', team1: 'BRA', team2: 'MAR', cityId: 'los_angeles', datetime: '2026-06-11T12:00:00-04:00', stage: 'Group' },
    { id: 1, group: 'A', team1: 'MEX', team2: 'RSA', cityId: 'mexico_city', datetime: '2026-06-11T15:00:00-04:00', stage: 'Group' },
    { id: 2, group: 'A', team1: 'KOR', team2: 'CZE', cityId: 'guadalajara', datetime: '2026-06-11T16:30:00-04:00', stage: 'Group' },
    { id: 3, group: 'B', team1: 'CAN', team2: 'BIH', cityId: 'toronto', datetime: '2026-06-11T18:00:00-04:00', stage: 'Group' },
    { id: 4, group: 'D', team1: 'USA', team2: 'PAR', cityId: 'los_angeles', datetime: '2026-06-11T21:00:00-04:00', stage: 'Group' },
    { id: 5, group: 'C', team1: 'BRA', team2: 'MAR', cityId: 'los_angeles', datetime: '2026-06-12T12:00:00-04:00', stage: 'Group' },
];

describe('LiveMatchStack', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('renders the live match and next three upcoming matches', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-11T15:30:00-04:00'));

        render(
            <LiveMatchStack
                matches={matches}
                knockoutVenues={[]}
                cities={cities}
                teams={teams}
                timezone="America/Toronto"
            />
        );

        const cards = screen.getAllByRole('button');

        expect(cards).toHaveLength(4);
        expect(screen.getByText('LIVE')).toBeInTheDocument();
        expect(screen.getByText('MEX')).toBeInTheDocument();
        expect(screen.getByText('RSA')).toBeInTheDocument();
        expect(screen.queryByText('BRA')).not.toBeInTheDocument();
    });

    it('selects the event city when a match card is clicked', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-11T14:00:00-04:00'));
        const onCitySelect = vi.fn();

        render(
            <LiveMatchStack
                matches={matches}
                knockoutVenues={[]}
                cities={cities}
                teams={teams}
                timezone="America/Toronto"
                onCitySelect={onCitySelect}
            />
        );

        fireEvent.click(screen.getAllByRole('button')[0]);

        expect(onCitySelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'mexico_city' }));
    });
});
