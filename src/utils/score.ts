import type { ScoreLine } from '@/types';

export interface ScoreDisplay {
    label: string;
    ariaLabel: string;
    isScored: boolean;
}

export function isScoreLine(score: ScoreLine | null | undefined): score is ScoreLine {
    return (
        typeof score?.left === 'number' &&
        typeof score?.right === 'number' &&
        Number.isInteger(score.left) &&
        Number.isInteger(score.right) &&
        score.left >= 0 &&
        score.right >= 0
    );
}

export function getScoreDisplay(
    score: ScoreLine | null | undefined,
    fallbackLabel = 'VS'
): ScoreDisplay {
    if (!isScoreLine(score)) {
        return {
            label: fallbackLabel,
            ariaLabel: 'versus',
            isScored: false,
        };
    }

    return {
        label: `${score.left}-${score.right}`,
        ariaLabel: `${score.left} to ${score.right}`,
        isScored: true,
    };
}

export function flipScore(score: ScoreLine | null | undefined): ScoreLine | undefined {
    if (!isScoreLine(score)) {
        return undefined;
    }

    return {
        left: score.right,
        right: score.left,
    };
}
