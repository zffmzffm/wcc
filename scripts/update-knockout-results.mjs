#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const DEFAULT_RESULTS_FILE = resolve(projectRoot, 'src/data/knockoutResults.json');
const DEFAULT_TEAMS_FILE = resolve(projectRoot, 'src/data/teams.json');
const DEFAULT_KNOCKOUT_FILE = resolve(projectRoot, 'src/data/knockoutVenues.json');
const GROUP_IDS = 'ABCDEFGHIJKL'.split('');

class CliError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CliError';
    }
}

function usage() {
    return [
        'Usage:',
        '  npm run knockout -- group <GROUP> 1=<TEAM> 2=<TEAM> out=<TEAM[,TEAM...]>',
        '  npm run knockout -- thirds <R32_MATCH_ID=TEAM> [R32_MATCH_ID=TEAM...]',
        '  npm run knockout -- check',
        '  npm run knockout -- show [GROUP]',
        '',
        'Examples:',
        '  npm run knockout -- group B 1=CAN 2=SUI out=QAT',
        '  npm run knockout -- thirds R32_79=CZE R32_74=SUI',
        '',
        'Options:',
        '  --dry-run                 Validate and print without writing knockoutResults.json.',
        '  --file <path>             Use a different knockout results file.',
        '  --teams-file <path>       Use a different teams.json file.',
        '  --knockout-file <path>    Use a different knockoutVenues.json file.',
        '  --help                    Show this help.',
    ].join('\n');
}

function parseArgs(argv) {
    const options = {
        command: undefined,
        values: [],
        dryRun: false,
        help: false,
        resultsFile: DEFAULT_RESULTS_FILE,
        teamsFile: DEFAULT_TEAMS_FILE,
        knockoutFile: DEFAULT_KNOCKOUT_FILE,
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
        } else if (arg === '--file' || arg.startsWith('--file=')) {
            options.resultsFile = resolve(process.cwd(), readValue('--file'));
        } else if (arg === '--teams-file' || arg.startsWith('--teams-file=')) {
            options.teamsFile = resolve(process.cwd(), readValue('--teams-file'));
        } else if (arg === '--knockout-file' || arg.startsWith('--knockout-file=')) {
            options.knockoutFile = resolve(process.cwd(), readValue('--knockout-file'));
        } else if (!arg.startsWith('--') && !options.command) {
            options.command = arg;
        } else if (!arg.startsWith('--')) {
            options.values.push(arg);
        } else {
            throw new CliError(`Unknown option: ${arg}`);
        }
    }

    return options;
}

function loadJson(filePath, label, fallback) {
    try {
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch (error) {
        if (fallback !== undefined && error.code === 'ENOENT') {
            return fallback;
        }
        throw new CliError(`Could not read ${label} at ${filePath}: ${error.message}`);
    }
}

function normalizeTeamCode(value) {
    return String(value || '').trim().toUpperCase();
}

function normalizeGroupId(value) {
    return String(value || '').trim().toUpperCase();
}

function parseAssignment(value) {
    const match = String(value).match(/^([^=]+)=(.+)$/);
    if (!match) {
        throw new CliError(`Invalid assignment "${value}". Expected key=value.`);
    }
    return [match[1].trim(), match[2].trim()];
}

function parseTeamList(value) {
    return String(value || '')
        .split(',')
        .map(normalizeTeamCode)
        .filter(Boolean);
}

function flattenKnockoutVenues(knockoutVenuesData) {
    return Object.values(knockoutVenuesData).flat();
}

function parseMatchupSides(matchup) {
    return String(matchup || '')
        .split(/\s+vs\s+/)
        .map(side => side.trim())
        .filter(Boolean);
}

function getThirdPlaceCandidateMap(knockoutVenuesData) {
    const candidates = new Map();

    for (const venue of flattenKnockoutVenues(knockoutVenuesData)) {
        if (venue.stage !== 'R32') continue;

        for (const side of parseMatchupSides(venue.matchup)) {
            const match = side.match(/^3([A-L]+)$/);
            if (match) {
                candidates.set(venue.matchId, new Set(match[1].split('')));
            }
        }
    }

    return candidates;
}

function createTeamContext(teams) {
    const validTeamCodes = new Set();
    const teamGroups = new Map();

    for (const team of teams) {
        const code = normalizeTeamCode(team.code);
        validTeamCodes.add(code);
        teamGroups.set(code, team.group);
    }

    return { validTeamCodes, teamGroups };
}

function ensureResultsShape(results) {
    return {
        groups: results && typeof results.groups === 'object' && !Array.isArray(results.groups)
            ? { ...results.groups }
            : {},
        thirdPlaceSlots: results && typeof results.thirdPlaceSlots === 'object' && !Array.isArray(results.thirdPlaceSlots)
            ? { ...results.thirdPlaceSlots }
            : {},
    };
}

function validateTeamInGroup({ code, groupId, field, validTeamCodes, teamGroups, errors }) {
    if (!validTeamCodes.has(code)) {
        errors.push(`${field}: unknown team "${code}".`);
        return;
    }

    const actualGroup = teamGroups.get(code);
    if (actualGroup !== groupId) {
        errors.push(`${field}: team "${code}" belongs to group ${actualGroup}, not group ${groupId}.`);
    }
}

function validateResults(results, teams, knockoutVenuesData) {
    const errors = [];
    const warnings = [];
    const { validTeamCodes, teamGroups } = createTeamContext(teams);
    const thirdPlaceCandidates = getThirdPlaceCandidateMap(knockoutVenuesData);
    const normalized = ensureResultsShape(results);

    for (const [groupId, groupResult] of Object.entries(normalized.groups)) {
        if (!GROUP_IDS.includes(groupId)) {
            errors.push(`groups.${groupId}: invalid group id.`);
            continue;
        }

        const seen = new Set();
        const first = normalizeTeamCode(groupResult.first);
        const second = normalizeTeamCode(groupResult.second);
        const eliminated = Array.isArray(groupResult.eliminated)
            ? groupResult.eliminated.map(normalizeTeamCode).filter(Boolean)
            : [];

        for (const [field, code] of [['first', first], ['second', second]]) {
            if (!code) continue;
            validateTeamInGroup({ code, groupId, field: `groups.${groupId}.${field}`, validTeamCodes, teamGroups, errors });
            if (seen.has(code)) {
                errors.push(`groups.${groupId}: duplicate team "${code}".`);
            }
            seen.add(code);
        }

        for (const code of eliminated) {
            validateTeamInGroup({ code, groupId, field: `groups.${groupId}.eliminated`, validTeamCodes, teamGroups, errors });
            if (seen.has(code)) {
                errors.push(`groups.${groupId}: duplicate team "${code}".`);
            }
            seen.add(code);
        }
    }

    const thirdPlaceTeams = new Set();
    for (const [matchId, rawTeamCode] of Object.entries(normalized.thirdPlaceSlots)) {
        const teamCode = normalizeTeamCode(rawTeamCode);
        const candidateGroups = thirdPlaceCandidates.get(matchId);

        if (!candidateGroups) {
            errors.push(`thirdPlaceSlots.${matchId}: match is not a R32 third-place slot.`);
            continue;
        }

        if (!validTeamCodes.has(teamCode)) {
            errors.push(`thirdPlaceSlots.${matchId}: unknown team "${teamCode}".`);
            continue;
        }

        const groupId = teamGroups.get(teamCode);
        if (!candidateGroups.has(groupId)) {
            errors.push(`thirdPlaceSlots.${matchId}: ${teamCode} is from group ${groupId}, but this slot only accepts ${[...candidateGroups].join('/')}.`);
        }

        const groupResult = normalized.groups[groupId] || {};
        if (normalizeTeamCode(groupResult.first) === teamCode || normalizeTeamCode(groupResult.second) === teamCode) {
            errors.push(`thirdPlaceSlots.${matchId}: ${teamCode} is already recorded as first or second in group ${groupId}.`);
        }

        const eliminated = new Set(Array.isArray(groupResult.eliminated) ? groupResult.eliminated.map(normalizeTeamCode) : []);
        if (eliminated.has(teamCode)) {
            errors.push(`thirdPlaceSlots.${matchId}: ${teamCode} is recorded as eliminated in group ${groupId}.`);
        }

        if (thirdPlaceTeams.has(teamCode)) {
            errors.push(`thirdPlaceSlots: duplicate third-place team "${teamCode}".`);
        }
        thirdPlaceTeams.add(teamCode);
    }

    if (Object.keys(normalized.thirdPlaceSlots).length > 0 && Object.keys(normalized.thirdPlaceSlots).length !== 8) {
        warnings.push(`thirdPlaceSlots has ${Object.keys(normalized.thirdPlaceSlots).length} entries; final update should have 8.`);
    }

    return { errors, warnings, normalized };
}

function applyGroupUpdate(results, values) {
    const [rawGroup, ...assignments] = values;
    const groupId = normalizeGroupId(rawGroup);
    if (!GROUP_IDS.includes(groupId)) {
        throw new CliError(`Invalid group "${rawGroup}".`);
    }

    const next = ensureResultsShape(results);
    const groupResult = { ...(next.groups[groupId] || {}) };

    for (const assignment of assignments) {
        const [key, value] = parseAssignment(assignment);
        const normalizedKey = key.toLowerCase();

        if (normalizedKey === '1' || normalizedKey === 'first') {
            groupResult.first = normalizeTeamCode(value);
        } else if (normalizedKey === '2' || normalizedKey === 'second') {
            groupResult.second = normalizeTeamCode(value);
        } else if (normalizedKey === 'out' || normalizedKey === 'eliminated') {
            groupResult.eliminated = parseTeamList(value);
        } else {
            throw new CliError(`Unknown group assignment key "${key}".`);
        }
    }

    if (!groupResult.first || !groupResult.second) {
        throw new CliError('Group updates require both 1=<TEAM> and 2=<TEAM>.');
    }

    if (!Array.isArray(groupResult.eliminated)) {
        groupResult.eliminated = [];
    }

    next.groups[groupId] = groupResult;
    return { results: next, message: `Updated group ${groupId}: first=${groupResult.first} second=${groupResult.second} eliminated=${groupResult.eliminated.join(',') || 'none'}` };
}

function applyThirdsUpdate(results, values) {
    if (values.length === 0) {
        throw new CliError('Third-place updates require at least one R32_MATCH_ID=TEAM assignment.');
    }

    const next = ensureResultsShape(results);
    next.thirdPlaceSlots = { ...next.thirdPlaceSlots };

    for (const assignment of values) {
        const [matchId, teamCode] = parseAssignment(assignment);
        next.thirdPlaceSlots[matchId] = normalizeTeamCode(teamCode);
    }

    return { results: next, message: `Updated ${values.length} third-place slot(s).` };
}

function resolveSide(matchId, side, results) {
    const value = side.trim();
    const seededMatch = value.match(/^([12])([A-L])$/);
    if (seededMatch) {
        const groupResult = results.groups[seededMatch[2]] || {};
        return seededMatch[1] === '1' ? (groupResult.first || value) : (groupResult.second || value);
    }

    if (/^3[A-L]+$/.test(value)) {
        return results.thirdPlaceSlots[matchId] || value;
    }

    return value;
}

function printResolvedR32(results, knockoutVenuesData) {
    const venues = flattenKnockoutVenues(knockoutVenuesData)
        .filter(venue => venue.stage === 'R32')
        .sort((left, right) => Number(left.matchId.split('_')[1]) - Number(right.matchId.split('_')[1]));

    console.log('Resolved R32:');
    for (const venue of venues) {
        const [left, right] = parseMatchupSides(venue.matchup).map(side => resolveSide(venue.matchId, side, results));
        console.log(`  ${venue.matchId}: ${left || 'TBD'} vs ${right || 'TBD'}`);
    }
}

function printValidationResult(result) {
    if (result.errors.length === 0) {
        console.log('Knockout results validation passed.');
    } else {
        console.error(`Knockout results validation failed with ${result.errors.length} error(s):`);
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

function writeResults(filePath, results) {
    writeFileSync(filePath, `${JSON.stringify(results, null, 4)}\n`, 'utf8');
}

function main() {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
        console.log(usage());
        return;
    }

    const teams = loadJson(options.teamsFile, 'teams.json');
    const knockoutVenuesData = loadJson(options.knockoutFile, 'knockoutVenues.json');
    const currentResults = loadJson(options.resultsFile, 'knockoutResults.json', { groups: {}, thirdPlaceSlots: {} });

    if (!options.command) {
        throw new CliError('Choose a command. Use --help for examples.');
    }

    if (options.command === 'check') {
        const validation = validateResults(currentResults, teams, knockoutVenuesData);
        printValidationResult(validation);
        printResolvedR32(validation.normalized, knockoutVenuesData);
        if (validation.errors.length > 0) process.exitCode = 1;
        return;
    }

    if (options.command === 'show') {
        const validation = validateResults(currentResults, teams, knockoutVenuesData);
        printValidationResult(validation);
        if (options.values[0]) {
            const groupId = normalizeGroupId(options.values[0]);
            console.log(JSON.stringify(validation.normalized.groups[groupId] || {}, null, 4));
        }
        printResolvedR32(validation.normalized, knockoutVenuesData);
        if (validation.errors.length > 0) process.exitCode = 1;
        return;
    }

    let update;
    if (options.command === 'group') {
        update = applyGroupUpdate(currentResults, options.values);
    } else if (options.command === 'thirds') {
        update = applyThirdsUpdate(currentResults, options.values);
    } else {
        throw new CliError(`Unknown command "${options.command}".`);
    }

    const validation = validateResults(update.results, teams, knockoutVenuesData);
    if (validation.errors.length > 0) {
        printValidationResult(validation);
        process.exitCode = 1;
        return;
    }

    console.log(update.message);
    printResolvedR32(validation.normalized, knockoutVenuesData);

    if (options.dryRun) {
        console.log(`Dry run only. ${options.resultsFile} was not changed.`);
    } else {
        writeResults(options.resultsFile, validation.normalized);
        console.log(`Wrote ${options.resultsFile}.`);
    }

    if (validation.warnings.length > 0) {
        printValidationResult(validation);
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
