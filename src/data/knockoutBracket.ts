/**
 * Knockout Bracket Path Templates
 * 
 * 定义每个小组各名次球队的淘汰赛晋级路径
 * 路径基于已录入的淘汰赛数据精确提取
 * 
 * 路径逻辑：
 * - R32 matchup 显示哪些组别/名次参与
 * - R16 matchup 显示 R32 的胜者配对
 * - 以此类推直到决赛
 */

export interface KnockoutPathTemplate {
    groupId: string;
    position: 1 | 2 | 3;
    path: string[];  // matchId 序列
    description: string;  // 路径描述
}

/**
 * 第1名和第2名的确定性路径
 * 第3名路径取决于哪8支第3名球队晋级，这里提供可能的路径
 */
export const knockoutPathTemplates: KnockoutPathTemplate[] = [
    // ============ Group A ============
    // 1A: R32_79 (1A vs 3CEFHI) → R16_92 (W79 vs W80) → QF_99 (W91 vs W92) → SF_102 (W99 vs W100) → F_104
    { groupId: "A", position: 1, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"], description: "1A → Mexico City → Mexico City → Miami → Atlanta → New York" },
    // 2A: R32_73 (2A vs 2B) → R16_90 (W73 vs W75) → QF_97 (W89 vs W90) → SF_101 (W97 vs W98) → F_104
    { groupId: "A", position: 2, path: ["R32_73", "R16_90", "QF_97", "SF_101", "F_104"], description: "2A → Los Angeles → Houston → Boston → Dallas → New York" },

    // ============ Group B ============
    // 1B: R32_85 (1B vs 3EFGIJ) → R16_96 (W85 vs W87) → QF_100 (W95 vs W96) → SF_102 (W99 vs W100) → F_104
    { groupId: "B", position: 1, path: ["R32_85", "R16_96", "QF_100", "SF_102", "F_104"], description: "1B → Vancouver → Vancouver → Kansas City → Atlanta → New York" },
    // 2B: R32_73 (2A vs 2B) → R16_90 (W73 vs W75) → QF_97 (W89 vs W90) → SF_101 (W97 vs W98) → F_104
    { groupId: "B", position: 2, path: ["R32_73", "R16_90", "QF_97", "SF_101", "F_104"], description: "2B → Los Angeles → Houston → Boston → Dallas → New York" },

    // ============ Group C ============
    // 1C: R32_76 (1C vs 2F) → R16_91 (W76 vs W78) → QF_99 (W91 vs W92) → SF_102 (W99 vs W100) → F_104
    { groupId: "C", position: 1, path: ["R32_76", "R16_91", "QF_99", "SF_102", "F_104"], description: "1C → Houston → New York → Miami → Atlanta → New York" },
    // 2C: R32_75 (1F vs 2C) → R16_90 (W73 vs W75) → QF_97 (W89 vs W90) → SF_101 (W97 vs W98) → F_104
    { groupId: "C", position: 2, path: ["R32_75", "R16_90", "QF_97", "SF_101", "F_104"], description: "2C → Monterrey → Houston → Boston → Dallas → New York" },

    // ============ Group D ============
    // 1D: R32_81 (1D vs 3BEFIJ) → R16_94 (W81 vs W82) → QF_98 (W93 vs W94) → SF_101 (W97 vs W98) → F_104
    { groupId: "D", position: 1, path: ["R32_81", "R16_94", "QF_98", "SF_101", "F_104"], description: "1D → San Francisco → Seattle → Los Angeles → Dallas → New York" },
    // 2D: R32_88 (2D vs 2G) → R16_95 (W86 vs W88) → QF_100 (W95 vs W96) → SF_102 (W99 vs W100) → F_104
    { groupId: "D", position: 2, path: ["R32_88", "R16_95", "QF_100", "SF_102", "F_104"], description: "2D → Dallas → Atlanta → Kansas City → Atlanta → New York" },

    // ============ Group E ============
    // 1E: R32_74 (1E vs 3ABCDF) → R16_89 (W74 vs W77) → QF_97 (W89 vs W90) → SF_101 (W97 vs W98) → F_104
    { groupId: "E", position: 1, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"], description: "1E → Boston → Philadelphia → Boston → Dallas → New York" },
    // 2E: R32_78 (2E vs 2I) → R16_91 (W76 vs W78) → QF_99 (W91 vs W92) → SF_102 (W99 vs W100) → F_104
    { groupId: "E", position: 2, path: ["R32_78", "R16_91", "QF_99", "SF_102", "F_104"], description: "2E → Dallas → New York → Miami → Atlanta → New York" },

    // ============ Group F ============
    // 1F: R32_75 (1F vs 2C) → R16_90 (W73 vs W75) → QF_97 (W89 vs W90) → SF_101 (W97 vs W98) → F_104
    { groupId: "F", position: 1, path: ["R32_75", "R16_90", "QF_97", "SF_101", "F_104"], description: "1F → Monterrey → Houston → Boston → Dallas → New York" },
    // 2F: R32_76 (1C vs 2F) → R16_91 (W76 vs W78) → QF_99 (W91 vs W92) → SF_102 (W99 vs W100) → F_104
    { groupId: "F", position: 2, path: ["R32_76", "R16_91", "QF_99", "SF_102", "F_104"], description: "2F → Houston → New York → Miami → Atlanta → New York" },

    // ============ Group G ============
    // 1G: R32_82 (1G vs 3AEHIJ) → R16_94 (W81 vs W82) → QF_98 (W93 vs W94) → SF_101 (W97 vs W98) → F_104
    { groupId: "G", position: 1, path: ["R32_82", "R16_94", "QF_98", "SF_101", "F_104"], description: "1G → Seattle → Seattle → Los Angeles → Dallas → New York" },
    // 2G: R32_88 (2D vs 2G) → R16_95 (W86 vs W88) → QF_100 (W95 vs W96) → SF_102 (W99 vs W100) → F_104
    { groupId: "G", position: 2, path: ["R32_88", "R16_95", "QF_100", "SF_102", "F_104"], description: "2G → Dallas → Atlanta → Kansas City → Atlanta → New York" },

    // ============ Group H ============
    // 1H: R32_84 (1H vs 2J) → R16_93 (W83 vs W84) → QF_98 (W93 vs W94) → SF_101 (W97 vs W98) → F_104
    { groupId: "H", position: 1, path: ["R32_84", "R16_93", "QF_98", "SF_101", "F_104"], description: "1H → Los Angeles → Dallas → Los Angeles → Dallas → New York" },
    // 2H: R32_86 (1J vs 2H) → R16_95 (W86 vs W88) → QF_100 (W95 vs W96) → SF_102 (W99 vs W100) → F_104
    { groupId: "H", position: 2, path: ["R32_86", "R16_95", "QF_100", "SF_102", "F_104"], description: "2H → Miami → Atlanta → Kansas City → Atlanta → New York" },

    // ============ Group I ============
    // 1I: R32_77 (1I vs 3CDFGH) → R16_89 (W74 vs W77) → QF_97 (W89 vs W90) → SF_101 (W97 vs W98) → F_104
    { groupId: "I", position: 1, path: ["R32_77", "R16_89", "QF_97", "SF_101", "F_104"], description: "1I → New York → Philadelphia → Boston → Dallas → New York" },
    // 2I: R32_78 (2E vs 2I) → R16_91 (W76 vs W78) → QF_99 (W91 vs W92) → SF_102 (W99 vs W100) → F_104
    { groupId: "I", position: 2, path: ["R32_78", "R16_91", "QF_99", "SF_102", "F_104"], description: "2I → Dallas → New York → Miami → Atlanta → New York" },

    // ============ Group J ============
    // 1J: R32_86 (1J vs 2H) → R16_95 (W86 vs W88) → QF_100 (W95 vs W96) → SF_102 (W99 vs W100) → F_104
    { groupId: "J", position: 1, path: ["R32_86", "R16_95", "QF_100", "SF_102", "F_104"], description: "1J → Miami → Atlanta → Kansas City → Atlanta → New York" },
    // 2J: R32_84 (1H vs 2J) → R16_93 (W83 vs W84) → QF_98 (W93 vs W94) → SF_101 (W97 vs W98) → F_104
    { groupId: "J", position: 2, path: ["R32_84", "R16_93", "QF_98", "SF_101", "F_104"], description: "2J → Los Angeles → Dallas → Los Angeles → Dallas → New York" },

    // ============ Group K ============
    // 1K: R32_87 (1K vs 3DEIJL) → R16_96 (W85 vs W87) → QF_100 (W95 vs W96) → SF_102 (W99 vs W100) → F_104
    { groupId: "K", position: 1, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"], description: "1K → Kansas City → Vancouver → Kansas City → Atlanta → New York" },
    // 2K: R32_83 (2K vs 2L) → R16_93 (W83 vs W84) → QF_98 (W93 vs W94) → SF_101 (W97 vs W98) → F_104
    { groupId: "K", position: 2, path: ["R32_83", "R16_93", "QF_98", "SF_101", "F_104"], description: "2K → Toronto → Dallas → Los Angeles → Dallas → New York" },

    // ============ Group L ============
    // 1L: R32_80 (1L vs 3EHIJK) → R16_92 (W79 vs W80) → QF_99 (W91 vs W92) → SF_102 (W99 vs W100) → F_104
    { groupId: "L", position: 1, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"], description: "1L → Atlanta → Mexico City → Miami → Atlanta → New York" },
    // 2L: R32_83 (2K vs 2L) → R16_93 (W83 vs W84) → QF_98 (W93 vs W94) → SF_101 (W97 vs W98) → F_104
    { groupId: "L", position: 2, path: ["R32_83", "R16_93", "QF_98", "SF_101", "F_104"], description: "2L → Toronto → Dallas → Los Angeles → Dallas → New York" },
];

/**
 * 第3名晋级路径映射
 * 
 * 第3名的路径取决于哪8支第3名球队晋级（从12组中选8支）
 * FIFA 官方有详细的配对规则表
 * 
 * 以下是各组第3名可能进入的 R32 比赛：
 * - 3A: 可能进入 R32_74 或 R32_82
 * - 3B: 可能进入 R32_74 或 R32_81
 * - 3C: 可能进入 R32_74, R32_77, R32_79
 * - 3D: 可能进入 R32_77, R32_81, R32_87
 * - 3E: 可能进入 R32_74, R32_79, R32_80, R32_81, R32_85
 * - 3F: 可能进入 R32_74, R32_77, R32_79, R32_81, R32_85
 * - 3G: 可能进入 R32_77, R32_82, R32_85
 * - 3H: 可能进入 R32_77, R32_79, R32_80, R32_82
 * - 3I: 可能进入 R32_77, R32_79, R32_80, R32_81, R32_82, R32_85, R32_87
 * - 3J: 可能进入 R32_80, R32_81, R32_82, R32_85, R32_87
 * - 3K: 可能进入 R32_80, R32_87
 * - 3L: 可能进入 R32_87
 * 
 * 由于组合复杂，此处提供最可能的路径（基于典型晋级组合）
 */
export const thirdPlacePathTemplates: KnockoutPathTemplate[] = [
    // 示例：假设 ABCDEF 组的第3名晋级（一种常见组合）
    { groupId: "A", position: 3, path: ["R32_82", "R16_94", "QF_98", "SF_101", "F_104"], description: "3A → Seattle → Seattle → Los Angeles → Dallas → New York" },
    { groupId: "B", position: 3, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"], description: "3B → Boston → Philadelphia → Boston → Dallas → New York" },
    { groupId: "C", position: 3, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"], description: "3C → Mexico City → Mexico City → Miami → Atlanta → New York" },
    { groupId: "D", position: 3, path: ["R32_77", "R16_89", "QF_97", "SF_101", "F_104"], description: "3D → New York → Philadelphia → Boston → Dallas → New York" },
    { groupId: "E", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"], description: "3E → Atlanta → Mexico City → Miami → Atlanta → New York" },
    { groupId: "F", position: 3, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"], description: "3F → Boston → Philadelphia → Boston → Dallas → New York" },
    { groupId: "G", position: 3, path: ["R32_85", "R16_96", "QF_100", "SF_102", "F_104"], description: "3G → Vancouver → Vancouver → Kansas City → Atlanta → New York" },
    { groupId: "H", position: 3, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"], description: "3H → Mexico City → Mexico City → Miami → Atlanta → New York" },
    { groupId: "I", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"], description: "3I → Atlanta → Mexico City → Miami → Atlanta → New York" },
    { groupId: "J", position: 3, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"], description: "3J → Kansas City → Vancouver → Kansas City → Atlanta → New York" },
    { groupId: "K", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"], description: "3K → Atlanta → Mexico City → Miami → Atlanta → New York" },
    { groupId: "L", position: 3, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"], description: "3L → Kansas City → Vancouver → Kansas City → Atlanta → New York" },
];

/**
 * 获取指定小组和名次的晋级路径
 */
export function getKnockoutPath(groupId: string, position: 1 | 2 | 3): KnockoutPathTemplate | undefined {
    if (position === 3) {
        return thirdPlacePathTemplates.find(t => t.groupId === groupId && t.position === position);
    }
    return knockoutPathTemplates.find(t => t.groupId === groupId && t.position === position);
}

/**
 * 获取指定小组所有可能的晋级路径
 */
export function getGroupPaths(groupId: string): KnockoutPathTemplate[] {
    const mainPaths = knockoutPathTemplates.filter(t => t.groupId === groupId);
    const thirdPath = thirdPlacePathTemplates.find(t => t.groupId === groupId);
    return thirdPath ? [...mainPaths, thirdPath] : mainPaths;
}
