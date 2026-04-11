/**
 * JSON-based Match Repository Implementation
 * Currently uses local JSON files as the data source.
 * Can be replaced with ApiMatchRepository to connect to a remote API.
 */
import { IMatchRepository, KnockoutVenue } from './types';
import { Match, City, Team } from '@/types';
import matchesData from '@/data/matches.json';
import citiesData from '@/data/cities.json';
import teamsData from '@/data/teams.json';
import knockoutVenuesData from '@/data/knockoutVenues.json';

export class JsonMatchRepository implements IMatchRepository {
    getGroupMatches(): Match[] {
        return matchesData as Match[];
    }

    getKnockoutVenues(): KnockoutVenue[] {
        // Flatten knockout venue data from all stages
        return Object.values(knockoutVenuesData).flat() as KnockoutVenue[];
    }

    getCities(): City[] {
        return citiesData as City[];
    }

    getTeams(): Team[] {
        return teamsData as Team[];
    }
}
