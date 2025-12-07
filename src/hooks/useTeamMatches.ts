import { useMemo } from 'react';
import { Match, City, MatchWithCoords, FlightSegment } from '@/types';
import { LatLngTuple } from 'leaflet';

/**
 * 根据球队代码获取该球队的所有比赛及坐标
 */
export function useTeamMatches(
    teamCode: string,
    matches: Match[],
    cities: City[]
): MatchWithCoords[] {
    return useMemo(() => {
        return matches
            .filter(m => m.team1 === teamCode || m.team2 === teamCode)
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            .map(match => {
                const city = cities.find(c => c.id === match.cityId);
                return city ? {
                    match,
                    coords: [city.lat, city.lng] as LatLngTuple,
                    city
                } : null;
            })
            .filter((item): item is MatchWithCoords => item !== null);
    }, [teamCode, matches, cities]);
}

/**
 * 根据球队比赛列表计算飞行路段
 */
export function useFlightSegments(teamMatches: MatchWithCoords[]): FlightSegment[] {
    return useMemo(() => {
        const segments: FlightSegment[] = [];
        const pathMap = new Map<string, number>();

        for (let i = 0; i < teamMatches.length - 1; i++) {
            const from = teamMatches[i].coords;
            const to = teamMatches[i + 1].coords;

            const fromKey = `${from[0].toFixed(4)},${from[1].toFixed(4)}`;
            const toKey = `${to[0].toFixed(4)},${to[1].toFixed(4)}`;

            const isSameCity = fromKey === toKey;
            const pathKey = [fromKey, toKey].sort().join('|');

            const existingCount = pathMap.get(pathKey) || 0;
            const isReturn = existingCount > 0 && !isSameCity;
            pathMap.set(pathKey, existingCount + 1);

            segments.push({
                from,
                to,
                segmentIndex: i,
                isReturn,
                isSameCity
            });
        }

        return segments;
    }, [teamMatches]);
}
