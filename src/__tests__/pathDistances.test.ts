import { describe, expect, it } from 'vitest';
import pathDistances from '@/data/pathDistances.json';
import { allKnockoutPathTemplates } from '@/data/knockoutBracket';

type PathDistance = {
    group: string;
    scenarioId: string;
    pathId: string;
    r32MatchId: string;
    totalDistance: number;
    groupStageDistance: number;
    transitionDistance: number;
    knockoutLegDistance: number;
    knockoutDistance: number;
};

const distances = pathDistances as PathDistance[];

const expectedThirdPlaceCounts: Record<string, number> = {
    A: 2,
    B: 2,
    C: 3,
    D: 3,
    E: 6,
    F: 5,
    G: 2,
    H: 4,
    I: 6,
    J: 5,
    K: 1,
    L: 1,
};

const expectedScenarioCounts = Object.fromEntries(
    Object.entries(expectedThirdPlaceCounts).map(([groupId, thirdPlaceCount]) => [
        groupId,
        thirdPlaceCount + 2,
    ])
) as Record<string, number>;

describe('championship path distance data', () => {
    it('contains every team scenario using the dynamic third-place variants', () => {
        expect(distances).toHaveLength(256);

        for (const [groupId, expectedCount] of Object.entries(expectedScenarioCounts)) {
            const scenarios = new Set(
                distances
                    .filter(distance => distance.group === groupId)
                    .map(distance => distance.scenarioId)
            );

            expect(scenarios.size).toBe(expectedCount);
            expect(scenarios.has('1st')).toBe(true);
            expect(scenarios.has('2nd')).toBe(true);
        }
    });

    it('keeps the generated third-place variant count per group', () => {
        for (const [groupId, expectedCount] of Object.entries(expectedThirdPlaceCounts)) {
            const thirdPlaceScenarios = new Set(
                distances
                    .filter(distance => distance.group === groupId)
                    .map(distance => distance.scenarioId)
                    .filter(scenarioId => scenarioId.startsWith('3rd-'))
            );

            expect(thirdPlaceScenarios.size).toBe(expectedCount);
        }
    });

    it('includes traceable knockout path identifiers for every distance row', () => {
        const templatesByPathId = new Map(
            allKnockoutPathTemplates.map(template => [template.id, template])
        );

        for (const distance of distances) {
            expect(distance.pathId).toBeTruthy();
            expect(distance.scenarioId).toBeTruthy();
            expect(distance.r32MatchId).toBeTruthy();

            const template = templatesByPathId.get(distance.pathId);
            expect(template).toBeDefined();
            expect(template?.r32MatchId).toBe(distance.r32MatchId);
            expect(template?.path[0]).toBe(distance.r32MatchId);
            expect(template?.path[template.path.length - 1]).toBe('F_104');
        }
    });

    it('keeps transition distance included in knockout and total distance', () => {
        for (const distance of distances) {
            expect(Math.abs(
                distance.knockoutDistance -
                (distance.transitionDistance + distance.knockoutLegDistance)
            )).toBeLessThanOrEqual(1);

            expect(Math.abs(
                distance.totalDistance -
                (distance.groupStageDistance + distance.knockoutDistance)
            )).toBeLessThanOrEqual(1);
        }
    });
});
