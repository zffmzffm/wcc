import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const projectRoot = path.resolve(__dirname, '../..');
const scriptPath = path.join(projectRoot, 'scripts/update-knockout-results.mjs');
const sourceTeamsPath = path.join(projectRoot, 'src/data/teams.json');
const sourceKnockoutPath = path.join(projectRoot, 'src/data/knockoutVenues.json');
const tempDirs: string[] = [];

function createTempResultsFile() {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'wcc-knockout-'));
    tempDirs.push(tempDir);
    mkdirSync(path.join(tempDir, 'data'), { recursive: true });
    const resultsPath = path.join(tempDir, 'data', 'knockoutResults.json');
    writeFileSync(resultsPath, '{\n    "groups": {},\n    "thirdPlaceSlots": {}\n}\n', 'utf8');
    return resultsPath;
}

function runKnockoutCli(resultsPath: string, args: string[]) {
    return execFileSync(process.execPath, [
        scriptPath,
        '--file', resultsPath,
        '--teams-file', sourceTeamsPath,
        '--knockout-file', sourceKnockoutPath,
        ...args,
    ], {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}

function runKnockoutCliFailure(resultsPath: string, args: string[]) {
    try {
        runKnockoutCli(resultsPath, args);
    } catch (error) {
        return String((error as { stderr?: Buffer | string }).stderr ?? '');
    }

    throw new Error('Expected knockout CLI to fail.');
}

afterEach(() => {
    while (tempDirs.length > 0) {
        const tempDir = tempDirs.pop();
        if (tempDir) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    }
});

describe('update knockout results CLI', () => {
    it('records a completed group and prints resolved R32 slots', () => {
        const resultsPath = createTempResultsFile();

        const output = runKnockoutCli(resultsPath, ['group', 'B', '1=CAN', '2=SUI', 'out=QAT']);
        const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

        expect(output).toContain('Updated group B: first=CAN second=SUI eliminated=QAT');
        expect(output).toContain('R32_73: 2A vs SUI');
        expect(output).toContain('R32_85: CAN vs 3EFGIJ');
        expect(results.groups.B).toEqual({
            first: 'CAN',
            second: 'SUI',
            eliminated: ['QAT'],
        });
    });

    it('rejects a third-place team that does not fit the R32 candidate slot', () => {
        const resultsPath = createTempResultsFile();
        runKnockoutCli(resultsPath, ['group', 'B', '1=CAN', '2=SUI', 'out=QAT']);

        const stderr = runKnockoutCliFailure(resultsPath, ['thirds', 'R32_79=BIH']);

        expect(stderr).toContain('R32_79');
        expect(stderr).toContain('only accepts C/E/F/H/I');
    });
});
