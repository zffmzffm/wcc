#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const DEFAULT_MATCHES_FILE = resolve(projectRoot, 'src/data/matches.json');
const DEFAULT_CITIES_FILE = resolve(projectRoot, 'src/data/cities.json');
const DEFAULT_TEAMS_FILE = resolve(projectRoot, 'src/data/teams.json');

const validStages = new Set([
    'group',
    'round_of_32',
    'round_of_16',
    'quarter',
    'semi',
    'third',
    'final',
]);

const maxScoreValue = 99;

class CliError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CliError';
    }
}

function usage() {
    return [
        'Usage:',
        '  npm run score -- <matchId> <left-right>',
        '  npm run score -- <YYYY-MM-DD>',
        '  npm run score -- <YYYY-MM-DD> <matchId=left-right> [matchId=left-right...]',
        '  npm run score -- check',
        '',
        'Examples:',
        '  npm run score -- 9 2-1',
        '  npm run score -- 2026-06-14',
        '  npm run score -- 2026-06-14 9=2-1 11=0-0',
        '',
        'Options:',
        '  --dry-run      Validate and print the planned change without writing matches.json.',
        '  --help         Show this help.',
    ].join('\n');
}

function parseArgs(argv) {
    const options = {
        scoreArgs: [],
        positional: [],
        dryRun: false,
        validateOnly: false,
        help: false,
        matchesFile: DEFAULT_MATCHES_FILE,
        citiesFile: DEFAULT_CITIES_FILE,
        teamsFile: DEFAULT_TEAMS_FILE,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];

        const readValue = (name) => {
            const inlinePrefix = `${name}=`;
            if (arg.startsWith(inlinePrefix)) {
                return arg.slice(inlinePrefix.length);
            }

            const value = argv[index + 1];
            if (!value || value.startsWith('--')) {
                throw new CliError(`Missing value for ${name}.`);
            }
            index += 1;
            return value;
        };

        if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else if (arg === '--dry-run') {
            options.dryRun = true;
        } else if (arg === '--validate-only') {
            options.validateOnly = true;
        } else if (arg === '--id' || arg.startsWith('--id=')) {
            options.id = parseMatchId(readValue('--id'));
        } else if (arg === '--date' || arg.startsWith('--date=')) {
            options.date = parseDate(readValue('--date'));
        } else if (arg === '--score' || arg.startsWith('--score=')) {
            options.scoreArgs.push(readValue('--score'));
        } else if (arg === '--scores' || arg.startsWith('--scores=')) {
            options.scoreArgs.push(...readValue('--scores').split(','));
        } else if (arg === '--file' || arg.startsWith('--file=')) {
            options.matchesFile = resolve(process.cwd(), readValue('--file'));
        } else if (!arg.startsWith('--')) {
            options.positional.push(arg);
        } else {
            throw new CliError(`Unknown option: ${arg}`);
        }
    }

    applyPositionalArgs(options);

    if (options.id !== undefined && options.date !== undefined) {
        throw new CliError('Use either --id or --date, not both.');
    }

    return options;
}

function applyPositionalArgs(options) {
    const [first, second, ...rest] = options.positional;

    if (!first) {
        return;
    }

    if (options.id !== undefined || options.date !== undefined || options.scoreArgs.length > 0 || options.validateOnly) {
        throw new CliError('Use short positional input or long --id/--date options, not both.');
    }

    if (first === 'check' || first === 'validate') {
        if (second || rest.length > 0) {
            throw new CliError(`"${first}" does not take extra values.`);
        }
        options.validateOnly = true;
        return;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(first)) {
        options.date = parseDate(first);
        options.scoreArgs.push(...[second, ...rest].filter(Boolean));
        return;
    }

    options.id = parseMatchId(first);

    if (!second || rest.length > 0) {
        throw new CliError('Single-match updates use: npm run score -- <matchId> <left-right>');
    }

    options.scoreArgs.push(second);
}

function parseDate(value) {
    const date = String(value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new CliError(`Invalid date "${value}". Expected YYYY-MM-DD.`);
    }
    return date;
}

function parseMatchId(value) {
    const id = Number(String(value).trim());
    if (!Number.isInteger(id) || id <= 0) {
        throw new CliError(`Invalid match ID "${value}". Expected a positive integer.`);
    }
    return id;
}

function parseScoreLine(value) {
    const text = String(value).trim();
    const match = text.match(/^(\d{1,2})\s*[-:]\s*(\d{1,2})$/);

    if (!match) {
        throw new CliError(`Invalid score "${value}". Expected left-right, e.g. 2-1.`);
    }

    const score = {
        left: Number(match[1]),
        right: Number(match[2]),
    };

    if (!isValidScore(score)) {
        throw new CliError(`Invalid score "${value}". Scores must be integers from 0 to ${maxScoreValue}.`);
    }

    return score;
}

function parseScoreAssignment(value) {
    const text = String(value).trim();
    if (!text) {
        throw new CliError('Empty score assignment.');
    }

    const assignmentMatch = text.match(/^(\d+)\s*=\s*(.+)$/);
    if (assignmentMatch) {
        return {
            id: parseMatchId(assignmentMatch[1]),
            score: parseScoreLine(assignmentMatch[2]),
        };
    }

    return {
        id: undefined,
        score: parseScoreLine(text),
    };
}

function loadJson(filePath, label) {
    try {
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch (error) {
        throw new CliError(`Could not read ${label} at ${filePath}: ${error.message}`);
    }
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidScore(score) {
    return (
        isPlainObject(score) &&
        Number.isInteger(score.left) &&
        Number.isInteger(score.right) &&
        score.left >= 0 &&
        score.right >= 0 &&
        score.left <= maxScoreValue &&
        score.right <= maxScoreValue
    );
}

function validateMatchData(matches, cities, teams) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(matches)) {
        return {
            errors: ['matches.json must contain an array.'],
            warnings,
        };
    }

    const validCityIds = new Set(Array.isArray(cities) ? cities.map((city) => city.id) : []);
    const validTeamCodes = new Set(Array.isArray(teams) ? teams.map((team) => team.code) : []);
    const teamGroups = new Map(Array.isArray(teams) ? teams.map((team) => [team.code, team.group]) : []);
    const matchIds = new Set();
    const groupMatchCounts = new Map();

    for (const match of matches) {
        const idLabel = isPlainObject(match) && match.id !== undefined ? `Match #${match.id}` : 'Match with missing ID';

        if (!isPlainObject(match)) {
            errors.push(`${idLabel}: entry must be an object.`);
            continue;
        }

        if (!Number.isInteger(match.id) || match.id <= 0) {
            errors.push(`${idLabel}: id must be a positive integer.`);
        } else if (matchIds.has(match.id)) {
            errors.push(`${idLabel}: duplicate match ID.`);
        } else {
            matchIds.add(match.id);
        }

        if (!validCityIds.has(match.cityId)) {
            errors.push(`${idLabel}: invalid cityId "${match.cityId}".`);
        }

        if (!validTeamCodes.has(match.team1)) {
            errors.push(`${idLabel}: invalid team1 "${match.team1}".`);
        }

        if (!validTeamCodes.has(match.team2)) {
            errors.push(`${idLabel}: invalid team2 "${match.team2}".`);
        }

        if (match.stage === 'group') {
            const team1Group = teamGroups.get(match.team1);
            const team2Group = teamGroups.get(match.team2);

            if (team1Group && team1Group !== match.group) {
                errors.push(`${idLabel}: team1 "${match.team1}" belongs to group "${team1Group}", not "${match.group}".`);
            }

            if (team2Group && team2Group !== match.group) {
                errors.push(`${idLabel}: team2 "${match.team2}" belongs to group "${team2Group}", not "${match.group}".`);
            }

            groupMatchCounts.set(match.group, (groupMatchCounts.get(match.group) || 0) + 1);
        }

        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(match.datetime || '')) {
            errors.push(`${idLabel}: datetime must be ISO 8601 with timezone, e.g. 2026-06-11T15:00:00-04:00.`);
        }

        if (!validStages.has(match.stage)) {
            errors.push(`${idLabel}: invalid stage "${match.stage}".`);
        }

        if (match.score !== undefined && !isValidScore(match.score)) {
            errors.push(`${idLabel}: score must be { "left": 0-${maxScoreValue}, "right": 0-${maxScoreValue} }.`);
        }
    }

    const expectedGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    for (const group of expectedGroups) {
        const count = groupMatchCounts.get(group) || 0;
        if (count !== 6) {
            warnings.push(`Group ${group} has ${count} matches; expected 6.`);
        }
    }

    const groupStageMatches = matches.filter((match) => match.stage === 'group').length;
    if (groupStageMatches !== 72) {
        warnings.push(`Group stage has ${groupStageMatches} matches; expected 72.`);
    }

    return { errors, warnings };
}

function buildUpdates(options, matches) {
    if (options.validateOnly) {
        return new Map();
    }

    if (options.id === undefined && options.date === undefined) {
        throw new CliError('Choose --id or --date. Use --help for examples.');
    }

    const assignments = options.scoreArgs.map(parseScoreAssignment);

    if (options.id !== undefined) {
        if (assignments.length !== 1) {
            throw new CliError('ID mode requires exactly one --score value.');
        }

        const assignment = assignments[0];
        if (assignment.id !== undefined && assignment.id !== options.id) {
            throw new CliError(`Score assignment is for match #${assignment.id}, but --id is ${options.id}.`);
        }

        return new Map([[options.id, assignment.score]]);
    }

    const matchesOnDate = matches
        .filter((match) => match.datetime?.slice(0, 10) === options.date)
        .sort((left, right) => left.datetime.localeCompare(right.datetime) || left.id - right.id);

    if (matchesOnDate.length === 0) {
        throw new CliError(`No matches found on ${options.date}.`);
    }

    if (assignments.length === 0) {
        printDateMatches(options.date, matchesOnDate);
        return undefined;
    }

    const dateMatchIds = new Set(matchesOnDate.map((match) => match.id));
    const updates = new Map();

    for (const assignment of assignments) {
        let assignmentId = assignment.id;

        if (assignmentId === undefined) {
            if (matchesOnDate.length !== 1) {
                throw new CliError(`Date mode needs match IDs because ${options.date} has ${matchesOnDate.length} matches.`);
            }
            assignmentId = matchesOnDate[0].id;
        }

        if (!dateMatchIds.has(assignmentId)) {
            throw new CliError(`Match #${assignmentId} is not scheduled on ${options.date}.`);
        }

        if (updates.has(assignmentId)) {
            throw new CliError(`Duplicate score assignment for match #${assignmentId}.`);
        }

        updates.set(assignmentId, assignment.score);
    }

    return updates;
}

function applyUpdates(matches, updates) {
    const matchesById = new Map(matches.map((match) => [match.id, match]));
    const changed = [];

    for (const [id, score] of updates) {
        const match = matchesById.get(id);
        if (!match) {
            throw new CliError(`No match found with ID ${id}.`);
        }

        const previous = match.score;
        match.score = score;

        changed.push({
            match,
            previous,
            next: score,
            changed: formatScore(previous) !== formatScore(score),
        });
    }

    return changed;
}

function formatScore(score) {
    return isValidScore(score) ? `${score.left}-${score.right}` : 'not set';
}

function describeMatch(match) {
    return [
        `#${match.id}`,
        match.datetime,
        `${match.team1} vs ${match.team2}`,
        `city=${match.cityId}`,
        `score=${formatScore(match.score)}`,
    ].join(' | ');
}

function printDateMatches(date, matchesOnDate) {
    console.log(`Matches on ${date}:`);
    for (const match of matchesOnDate) {
        console.log(`  ${describeMatch(match)}`);
    }
    console.log();
    console.log(`Update example: npm run score -- ${date} ${matchesOnDate[0].id}=2-1`);
}

function printValidationResult(result) {
    if (result.errors.length === 0) {
        console.log('Match data validation passed.');
    } else {
        console.error(`Match data validation failed with ${result.errors.length} error(s):`);
        for (const error of result.errors) {
            console.error(`  - ${error}`);
        }
    }

    if (result.warnings.length > 0) {
        console.warn(`Warnings (${result.warnings.length}):`);
        for (const warning of result.warnings) {
            console.warn(`  - ${warning}`);
        }
    }
}

function formatJsonValue(value, indent) {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    return JSON.stringify(value, null, 4).replace(/\n/g, `\n${indent}`);
}

function serializeMatch(match) {
    const entries = Object.entries(match).filter(([, value]) => value !== undefined);

    const lines = entries.map(([key, value], index) => {
        const comma = index === entries.length - 1 ? '' : ',';

        if (key === 'score') {
            return `        "score": { "left": ${value.left}, "right": ${value.right} }${comma}`;
        }

        return `        ${JSON.stringify(key)}: ${formatJsonValue(value, '        ')}${comma}`;
    });

    return `    {\n${lines.join('\n')}\n    }`;
}

function serializeMatches(matches) {
    return `[\n${matches.map(serializeMatch).join(',\n')}\n]\n`;
}

function main() {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
        console.log(usage());
        return;
    }

    const matches = loadJson(options.matchesFile, 'matches.json');
    const cities = loadJson(options.citiesFile, 'cities.json');
    const teams = loadJson(options.teamsFile, 'teams.json');

    const beforeValidation = validateMatchData(matches, cities, teams);
    if (beforeValidation.errors.length > 0) {
        printValidationResult(beforeValidation);
        process.exitCode = 1;
        return;
    }

    const updates = buildUpdates(options, matches);
    if (updates === undefined) {
        return;
    }

    if (updates.size === 0) {
        printValidationResult(beforeValidation);
        return;
    }

    const changed = applyUpdates(matches, updates);
    const afterValidation = validateMatchData(matches, cities, teams);
    if (afterValidation.errors.length > 0) {
        printValidationResult(afterValidation);
        process.exitCode = 1;
        return;
    }

    for (const item of changed) {
        console.log(
            `${options.dryRun ? 'Would update' : 'Updated'} match #${item.match.id}: ` +
                `${item.match.team1} ${formatScore(item.previous)} ${item.match.team2} -> ` +
                `${item.match.team1} ${formatScore(item.next)} ${item.match.team2}`
        );
    }

    if (options.dryRun) {
        console.log(`Dry run only. ${options.matchesFile} was not changed.`);
    } else {
        writeFileSync(options.matchesFile, serializeMatches(matches), 'utf8');
        console.log(`Wrote ${options.matchesFile}.`);
    }

    if (afterValidation.warnings.length > 0) {
        printValidationResult(afterValidation);
    }
}

try {
    main();
} catch (error) {
    if (error instanceof CliError) {
        console.error(error.message);
        console.error();
        console.error(usage());
        process.exitCode = 1;
    } else {
        throw error;
    }
}
