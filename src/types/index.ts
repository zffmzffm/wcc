// 统一类型定义 - 消除各组件中的重复定义

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
