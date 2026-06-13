/**
 * Repository Interface Definitions
 * Defines the data access abstraction layer for future API/database implementations.
 */
import { Match, City, Team, ScoreLine } from '@/types';

/**
 * Knockout venue information.
 * Contains venue and schedule data only; opponent details follow FIFA's bracket rules.
 */
export interface KnockoutVenue {
    matchId: string;
    stage: 'R32' | 'R16' | 'QF' | 'SF' | 'F' | '3P';
    cityId: string;
    datetime: string;
    matchup?: string;  // e.g., "1A vs 3CEFHI" - indicates home/away positions
    score?: ScoreLine;
}

/**
 * Data repository interface.
 * Abstracts data access; currently uses JSON, can be swapped to API.
 */
export interface IMatchRepository {
    getGroupMatches(): Match[];
    getKnockoutVenues(): KnockoutVenue[];
    getCities(): City[];
    getTeams(): Team[];
}
