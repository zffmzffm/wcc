import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const projectRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(projectRoot, 'scripts/update-match-score.mjs');
const sourceMatchesPath = path.join(projectRoot, 'src/data/matches.json');
const tempDirs: string[] = [];

function createTempMatchesFile() {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'wcc-score-'));
    tempDirs.push(tempDir);

    const matchesPath = path.join(tempDir, 'matches.json');
    copyFileSync(sourceMatchesPath, matchesPath);
    return matchesPath;
}

function runScoreCli(matchesPath: string, args: string[]) {
    return execFileSync(process.execPath, [scriptPath, '--file', matchesPath, ...args], {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}

function runScoreCliFailure(matchesPath: string, args: string[]) {
    try {
        runScoreCli(matchesPath, args);
    } catch (error) {
        return String((error as { stderr?: Buffer | string }).stderr ?? '');
    }

    throw new Error('Expected score CLI to fail.');
}

afterEach(() => {
    while (tempDirs.length > 0) {
        const tempDir = tempDirs.pop();
        if (tempDir) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    }
});

describe('update match score CLI', () => {
    it('updates one match by ID and writes the inline score shape', () => {
        const matchesPath = createTempMatchesFile();

        const output = runScoreCli(matchesPath, ['9', '2-1']);
        const rawMatches = readFileSync(matchesPath, 'utf8');
        const matches = JSON.parse(rawMatches);

        expect(output).toContain('Updated match #9');
        expect(matches.find((match: { id: number }) => match.id === 9).score).toEqual({
            left: 2,
            right: 1,
        });
        expect(rawMatches).toContain('"score": { "left": 2, "right": 1 }');
    });

    it('rejects date updates for matches outside the selected date', () => {
        const matchesPath = createTempMatchesFile();

        const stderr = runScoreCliFailure(matchesPath, ['2026-06-14', '1=2-1']);

        expect(stderr).toContain('Match #1 is not scheduled on 2026-06-14');
    });
});
