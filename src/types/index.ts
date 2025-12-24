// Unified type definitions - eliminating duplicate definitions across components

export interface City {
    id: string;
    name: string;
    country: string;
    countryCode: string;
    lat: number;
    lng: number;
    venue: string;
    capacity: number;
}

export interface Match {
    id: number;
    group: string;
    team1: string;
    team2: string;
    cityId: string;
    datetime: string;
    stage: string;
    matchup?: string;  // For knockout matches, e.g., "1A vs 3CEFHI"
}

export interface Team {
    code: string;
    name: string;
    group: string;
    flag: string;
}

export interface MatchWithCoords {
    match: Match;
    coords: [number, number];
    city: City;
}

export interface FlightSegment {
    from: [number, number];
    to: [number, number];
    segmentIndex: number;
    isReturn: boolean;
    isSameCity: boolean;
}

// Knockout stage types for elimination rounds
// 3P = Third Place Match (季军赛)
export type KnockoutStage = 'R32' | 'R16' | 'QF' | 'SF' | 'F' | '3P';
