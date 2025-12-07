import { Team } from '@/types';

/**
 * 格式化日期时间为中文显示格式
 */
export const formatDateTime = (datetime: string): { date: string; time: string } => {
    const d = new Date(datetime);
    const date = d.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
    const time = d.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return { date, time };
};

/**
 * 格式化日期时间为短格式（用于飞行路线弹窗）
 */
export const formatDateTimeShort = (datetime: string): { date: string; time: string } => {
    const d = new Date(datetime);
    const date = d.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
    });
    const time = d.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return { date, time };
};

/**
 * 获取球队显示信息
 */
export const getTeamDisplay = (
    teamCode: string,
    teams: Team[]
): { name: string; code: string; flag: string } => {
    const team = teams.find(t => t.code === teamCode);
    return team
        ? { name: team.name, code: team.code, flag: team.flag }
        : { name: teamCode, code: teamCode, flag: '🏳️' };
};

/**
 * 根据国家名获取国旗 emoji
 */
export const getCountryFlag = (country: string): string => {
    switch (country) {
        case 'USA':
            return '🇺🇸';
        case 'Mexico':
            return '🇲🇽';
        case 'Canada':
            return '🇨🇦';
        default:
            return '🏳️';
    }
};

/**
 * 根据国家名获取国家代码
 */
export const getCountryCode = (country: string): string => {
    switch (country) {
        case 'USA':
            return 'USA';
        case 'Mexico':
            return 'MEX';
        case 'Canada':
            return 'CAN';
        default:
            return country;
    }
};

/**
 * 根据国家名获取主题颜色
 */
export const getCountryColor = (country: string): string => {
    switch (country) {
        case 'USA':
            return '#1e40af';
        case 'Mexico':
            return '#166534';
        case 'Canada':
            return '#dc2626';
        default:
            return '#6b7280';
    }
};
