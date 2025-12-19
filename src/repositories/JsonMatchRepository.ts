/**
 * JSON-based Match Repository Implementation
 * 当前使用本地 JSON 文件作为数据源
 * 未来可替换为 ApiMatchRepository 接入远程 API
 */
import { IMatchRepository, KnockoutVenue } from './types';
import { Match, City, Team } from '@/types';
import matchesData from '@/data/matches.json';
import citiesData from '@/data/cities.json';
import teamsData from '@/data/teams.json';
// Note: knockoutVenues.json will be created in Phase 2
// import knockoutVenuesData from '@/data/knockoutVenues.json';

// Temporary empty data until Phase 2
const knockoutVenuesData: Record<string, KnockoutVenue[]> = {};

export class JsonMatchRepository implements IMatchRepository {
    getGroupMatches(): Match[] {
        return matchesData as Match[];
    }

    getKnockoutVenues(): KnockoutVenue[] {
        // 扁平化所有阶段的场地数据
        return Object.values(knockoutVenuesData).flat();
    }

    getCities(): City[] {
        return citiesData as City[];
    }

    getTeams(): Team[] {
        return teamsData as Team[];
    }
}
