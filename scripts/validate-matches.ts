/**
 * Match Data Validation Script
 * Validates matches.json against cities.json and teams.json for consistency
 * 
 * Run with: npx tsx scripts/validate-matches.ts
 */

import cities from '../src/data/cities.json';
import matches from '../src/data/matches.json';
import teams from '../src/data/teams.json';

interface ValidationError {
    matchId: number;
    field: string;
    value: string;
    message: string;
}

interface ValidationSummary {
    totalMatches: number;
    errors: ValidationError[];
    warnings: string[];
}

// Build lookup sets for fast validation
const validCityIds = new Set(cities.map(c => c.id));
const validTeamCodes = new Set(teams.map(t => t.code));
const teamGroups = new Map(teams.map(t => [t.code, t.group]));

function validateMatches(): ValidationSummary {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    const matchIds = new Set<number>();
    const groupMatchCounts = new Map<string, number>();

    for (const match of matches) {
        // Check for duplicate IDs
        if (matchIds.has(match.id)) {
            errors.push({
                matchId: match.id,
                field: 'id',
                value: String(match.id),
                message: 'Duplicate match ID'
            });
        }
        matchIds.add(match.id);

        // Validate cityId
        if (!validCityIds.has(match.cityId)) {
            errors.push({
                matchId: match.id,
                field: 'cityId',
                value: match.cityId,
                message: `Invalid cityId: "${match.cityId}" not found in cities.json`
            });
        }

        // Validate team1
        if (!validTeamCodes.has(match.team1)) {
            errors.push({
                matchId: match.id,
                field: 'team1',
                value: match.team1,
                message: `Invalid team1: "${match.team1}" not found in teams.json`
            });
        }

        // Validate team2
        if (!validTeamCodes.has(match.team2)) {
            errors.push({
                matchId: match.id,
                field: 'team2',
                value: match.team2,
                message: `Invalid team2: "${match.team2}" not found in teams.json`
            });
        }

        // Validate group consistency for group stage matches
        if (match.stage === 'group') {
            const team1Group = teamGroups.get(match.team1);
            const team2Group = teamGroups.get(match.team2);

            if (team1Group && team1Group !== match.group) {
                errors.push({
                    matchId: match.id,
                    field: 'group',
                    value: match.group,
                    message: `Group mismatch: team1 "${match.team1}" belongs to group "${team1Group}", not "${match.group}"`
                });
            }

            if (team2Group && team2Group !== match.group) {
                errors.push({
                    matchId: match.id,
                    field: 'group',
                    value: match.group,
                    message: `Group mismatch: team2 "${match.team2}" belongs to group "${team2Group}", not "${match.group}"`
                });
            }

            // Count matches per group
            const count = groupMatchCounts.get(match.group) || 0;
            groupMatchCounts.set(match.group, count + 1);
        }

        // Validate datetime format
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
        if (!dateRegex.test(match.datetime)) {
            errors.push({
                matchId: match.id,
                field: 'datetime',
                value: match.datetime,
                message: 'Invalid datetime format (expected ISO 8601 with timezone)'
            });
        }

        // Validate stage
        const validStages = ['group', 'round_of_32', 'round_of_16', 'quarter', 'semi', 'third', 'final'];
        if (!validStages.includes(match.stage)) {
            errors.push({
                matchId: match.id,
                field: 'stage',
                value: match.stage,
                message: `Invalid stage: "${match.stage}"`
            });
        }
    }

    // Check group match counts (should be 6 per group for 12 groups)
    const expectedGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    for (const group of expectedGroups) {
        const count = groupMatchCounts.get(group) || 0;
        if (count !== 6) {
            warnings.push(`Group ${group} has ${count} matches (expected 6)`);
        }
    }

    // Check total group stage matches
    const groupStageMatches = matches.filter(m => m.stage === 'group').length;
    if (groupStageMatches !== 72) {
        warnings.push(`Total group stage matches: ${groupStageMatches} (expected 72)`);
    }

    return {
        totalMatches: matches.length,
        errors,
        warnings
    };
}

// Run validation
console.log('='.repeat(60));
console.log('Match Data Validation Report');
console.log('='.repeat(60));
console.log();

const result = validateMatches();

console.log(`Total matches: ${result.totalMatches}`);
console.log();

if (result.errors.length === 0) {
    console.log('✅ No errors found!');
} else {
    console.log(`❌ Found ${result.errors.length} error(s):`);
    console.log();

    for (const error of result.errors) {
        console.log(`  Match #${error.matchId} [${error.field}]: ${error.message}`);
    }
}

console.log();

if (result.warnings.length > 0) {
    console.log(`⚠️  Warnings (${result.warnings.length}):`);
    for (const warning of result.warnings) {
        console.log(`  - ${warning}`);
    }
}

console.log();
console.log('='.repeat(60));

// Exit with error code if validation failed
if (result.errors.length > 0) {
    process.exit(1);
}
