/**
 * Centralized data exports
 * All JSON data is loaded and typed here to avoid duplicate imports across components
 */
import { City, Match, Team } from '@/types';
import citiesData from './cities.json';
import matchesData from './matches.json';
import teamsData from './teams.json';

export const cities: City[] = citiesData as City[];
export const matches: Match[] = matchesData as Match[];
export const teams: Team[] = teamsData as Team[];
