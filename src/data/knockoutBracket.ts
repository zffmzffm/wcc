/**
 * Knockout Bracket Path Templates
 * 
 * Defines the knockout advancement path for each group position.
 * Paths are precisely extracted from the recorded knockout match data.
 * 
 * Path logic:
 * - R32 matchup shows which group positions participate
 * - R16 matchup shows R32 winners pairing
 * - And so on through to the Final
 */

export interface KnockoutPathTemplate {
    groupId: string;
    position: 1 | 2 | 3;
    path: string[];  // matchId sequence
    description: string;  // Path description
}

/**
 * Deterministic paths for 1st and 2nd place finishers.
 * 3rd place paths depend on which 8 third-place teams qualify.
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
 * Third-place advancement path mapping
 * 
 * Third-place paths depend on which 8 third-place teams qualify (from 12 groups).
 * FIFA has detailed pairing rules for this.
 * 
 * Possible R32 entries for each group's 3rd place team:
 * - 3A: R32_74 or R32_82
 * - 3B: R32_74 or R32_81
 * - 3C: R32_74, R32_77, or R32_79
 * - 3D: R32_77, R32_81, or R32_87
 * - 3E: R32_74, R32_79, R32_80, R32_81, or R32_85
 * - 3F: R32_74, R32_77, R32_79, R32_81, or R32_85
 * - 3G: R32_77, R32_82, or R32_85
 * - 3H: R32_77, R32_79, R32_80, or R32_82
 * - 3I: R32_77, R32_79, R32_80, R32_81, R32_82, R32_85, or R32_87
 * - 3J: R32_80, R32_81, R32_82, R32_85, or R32_87
 * - 3K: R32_80 or R32_87
 * - 3L: R32_87
 * 
 * Due to the complexity of combinations, we provide the most likely path
 * (based on a typical qualification scenario).
 */
export const thirdPlacePathTemplates: KnockoutPathTemplate[] = [
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
 * Get the knockout path for a specific group and position.
 */
export function getKnockoutPath(groupId: string, position: 1 | 2 | 3): KnockoutPathTemplate | undefined {
    if (position === 3) {
        return thirdPlacePathTemplates.find(t => t.groupId === groupId && t.position === position);
    }
    return knockoutPathTemplates.find(t => t.groupId === groupId && t.position === position);
}

/**
 * Get all possible knockout paths for a given group.
 */
export function getGroupPaths(groupId: string): KnockoutPathTemplate[] {
    const mainPaths = knockoutPathTemplates.filter(t => t.groupId === groupId);
    const thirdPath = thirdPlacePathTemplates.find(t => t.groupId === groupId);
    return thirdPath ? [...mainPaths, thirdPath] : mainPaths;
}
