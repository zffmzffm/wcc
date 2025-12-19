/**
 * Repository Interface Definitions
 * 定义数据访问抽象层，支持未来切换到 API/数据库实现
 */
import { Match, City, Team } from '@/types';

/**
 * 淘汰赛场地信息
 * 只包含场地和时间，不包含对手（因 FIFA 尚未公布完整配对规则）
 */
export interface KnockoutVenue {
    matchId: string;
    stage: 'R32' | 'R16' | 'QF' | 'SF' | 'F' | '3P';
    cityId: string;
    datetime: string;
}

/**
 * 数据仓库接口
 * 抽象化数据访问，当前使用 JSON 实现，未来可切换到 API
 */
export interface IMatchRepository {
    getGroupMatches(): Match[];
    getKnockoutVenues(): KnockoutVenue[];
    getCities(): City[];
    getTeams(): Team[];
}
