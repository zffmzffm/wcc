/**
 * Repository Exports
 * Unified export of data repository instances and type definitions
 */
import { JsonMatchRepository } from './JsonMatchRepository';
import { IMatchRepository } from './types';

// Default to JSON implementation; can be swapped to API implementation in the future
// Only modify this file to switch data sources globally
export const matchRepository: IMatchRepository = new JsonMatchRepository();

// Re-export type definitions
export * from './types';
