/**
 * useKnockoutPaths Hook
 * 
 * 根据球队所在小组生成三条淘汰赛假设性晋级路径：
 * - 🟢 小组第1名出线路径
 * - 🔵 小组第2名出线路径  
 * - 🟠 最佳第3名出线路径
 */
import { useMemo } from 'react';
import { MatchWithCoords, City, Match } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { knockoutPathTemplates, thirdPlacePathTemplates } from '@/data/knockoutBracket';

export interface KnockoutPath {
    position: 1 | 2 | 3;
    label: string;
    labelEn: string;
    color: string;
    matches: MatchWithCoords[];
}

// 路径颜色方案
const PATH_COLORS = {
    1: '#10B981',  // 翠绿 - 第1名
    2: '#3B82F6',  // 天蓝 - 第2名
    3: '#F59E0B',  // 橙色 - 第3名
} as const;

// 路径标签（中文）
const PATH_LABELS = {
    1: '小组第1出线',
    2: '小组第2出线',
    3: '最佳第3名出线',
} as const;

// 路径标签（英文）
const PATH_LABELS_EN = {
    1: 'Group Winner',
    2: 'Group Runner-up',
    3: 'Best 3rd Place',
} as const;

/**
 * 获取指定小组的所有淘汰赛晋级路径
 * 
 * @param groupId - 小组 ID (A-L)
 * @param knockoutVenues - 淘汰赛场地数据
 * @param cities - 城市数据
 * @returns 三条晋级路径（第1名、第2名、第3名）
 */
export function useKnockoutPaths(
    groupId: string,
    knockoutVenues: KnockoutVenue[],
    cities: City[]
): KnockoutPath[] {
    return useMemo(() => {
        if (!groupId) return [];

        // 获取该小组的所有路径模板（第1名和第2名）
        const mainTemplates = knockoutPathTemplates.filter(t => t.groupId === groupId);
        // 获取第3名路径
        const thirdTemplate = thirdPlacePathTemplates.find(t => t.groupId === groupId);

        // 合并所有模板
        const allTemplates = thirdTemplate
            ? [...mainTemplates, thirdTemplate]
            : mainTemplates;

        // 创建场地查找映射
        const venueMap = new Map(knockoutVenues.map(v => [v.matchId, v]));
        const cityMap = new Map(cities.map(c => [c.id, c]));

        return allTemplates.map(template => {
            // 将路径模板中的 matchId 序列转换为带坐标的比赛列表
            const matches: MatchWithCoords[] = template.path
                .map(matchId => {
                    const venue = venueMap.get(matchId);
                    if (!venue) return null;

                    const city = cityMap.get(venue.cityId);
                    if (!city) return null;

                    // 构造 Match 对象（淘汰赛比赛）
                    const match: Match = {
                        id: parseInt(matchId.split('_')[1]) || 0,
                        group: '',  // 淘汰赛没有小组
                        team1: 'TBD',
                        team2: 'TBD',
                        cityId: venue.cityId,
                        datetime: venue.datetime,
                        stage: venue.stage,
                        matchup: venue.matchup,  // Include matchup for home/away determination
                    };

                    return {
                        match,
                        coords: [city.lat, city.lng] as [number, number],
                        city,
                    };
                })
                .filter((m): m is MatchWithCoords => m !== null);

            return {
                position: template.position,
                label: PATH_LABELS[template.position],
                labelEn: PATH_LABELS_EN[template.position],
                color: PATH_COLORS[template.position],
                matches,
            };
        });
    }, [groupId, knockoutVenues, cities]);
}

/**
 * 格式化淘汰赛阶段名称
 */
export function getStageLabel(stage: string, lang: 'zh' | 'en' = 'zh'): string {
    const labels: Record<string, { zh: string; en: string }> = {
        'R32': { zh: '32强赛', en: 'Round of 32' },
        'R16': { zh: '16强赛', en: 'Round of 16' },
        'QF': { zh: '四分之一决赛', en: 'Quarter-final' },
        'SF': { zh: '半决赛', en: 'Semi-final' },
        'F': { zh: '决赛', en: 'Final' },
        '3P': { zh: '季军赛', en: 'Third Place' },
    };
    return labels[stage]?.[lang] || stage;
}
