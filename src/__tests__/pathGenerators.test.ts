import { describe, it, expect } from 'vitest';
import {
    generateArcPath,
    generateChevronPath,
    generateLoopPath,
    generateLoopChevronPath,
} from '@/utils/pathGenerators';

describe('pathGenerators', () => {
    describe('generateArcPath', () => {
        it('should generate valid SVG path', () => {
            const start = { x: 0, y: 0 };
            const end = { x: 100, y: 100 };
            const result = generateArcPath(start, end, 0.3);

            expect(result).toContain('M'); // Move command
            expect(result).toContain('Q'); // Quadratic curve command
        });

        it('should include start and end points', () => {
            const start = { x: 10, y: 20 };
            const end = { x: 150, y: 200 };
            const result = generateArcPath(start, end, 0.3);

            expect(result).toContain('M 10 20');
            expect(result).toContain('150 200');
        });

        it('should handle zero curvature', () => {
            const start = { x: 0, y: 0 };
            const end = { x: 100, y: 100 };
            const result = generateArcPath(start, end, 0);

            expect(result).toBeTruthy();
        });

        it('should handle negative curvature', () => {
            const start = { x: 0, y: 0 };
            const end = { x: 100, y: 100 };
            const result = generateArcPath(start, end, -0.3);

            expect(result).toBeTruthy();
        });
    });

    describe('generateChevronPath', () => {
        it('should generate segmented path with multiple points', () => {
            const start = { x: 0, y: 0 };
            const end = { x: 200, y: 200 };
            const result = generateChevronPath(start, end, 0.3, 20);

            expect(result).toContain('M'); // Move command
            expect(result).toContain('L'); // Line commands
        });

        it('should return move-only path for very short distance', () => {
            const start = { x: 0, y: 0 };
            const end = { x: 5, y: 5 };
            const result = generateChevronPath(start, end, 0.3, 20);

            // Should at least start with M command
            expect(result.startsWith('M')).toBe(true);
        });
    });

    describe('generateLoopPath', () => {
        it('should generate cubic bezier path', () => {
            const center = { x: 100, y: 100 };
            const result = generateLoopPath(center, 20);

            expect(result).toContain('M'); // Move command
            expect(result).toContain('C'); // Cubic bezier command
        });

        it('should create valid path string', () => {
            const center = { x: 100, y: 100 };
            const result = generateLoopPath(center, 20);

            // Should be a non-empty string
            expect(result.length).toBeGreaterThan(10);
        });
    });

    describe('generateLoopChevronPath', () => {
        it('should generate segmented loop path', () => {
            const center = { x: 100, y: 100 };
            const result = generateLoopChevronPath(center, 20, 10);

            expect(result).toContain('M'); // Move command
        });

        it('should have multiple line segments', () => {
            const center = { x: 100, y: 100 };
            const result = generateLoopChevronPath(center, 30, 8);

            // Should contain multiple line segments
            const lineCount = (result.match(/L/g) || []).length;
            expect(lineCount).toBeGreaterThan(0);
        });
    });
});
