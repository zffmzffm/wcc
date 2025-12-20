/**
 * Calculate Championship Path Distances
 * 
 * This script calculates the total travel distance for each team's championship path
 * using great circle (Haversine) formula for distance calculations.
 * 
 * Output: A sorted table of 144 paths (48 teams × 3 paths each)
 */

const fs = require('fs');
const path = require('path');

// Load data files
const cities = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/cities.json'), 'utf-8'));
const teams = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/teams.json'), 'utf-8'));
const matches = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/matches.json'), 'utf-8'));
const knockoutVenues = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/knockoutVenues.json'), 'utf-8'));

// Create city lookup by id
const cityById = {};
cities.forEach(city => {
    cityById[city.id] = city;
});

// Create a lookup for knockout venue by matchId
const knockoutVenueByMatchId = {};
Object.values(knockoutVenues).flat().forEach(match => {
    knockoutVenueByMatchId[match.matchId] = match;
});

// Haversine formula for great circle distance
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get group stage matches for a team, sorted by datetime
function getGroupStageMatchesForTeam(teamCode) {
    return matches
        .filter(m => m.stage === 'group' && (m.team1 === teamCode || m.team2 === teamCode))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
}

// Get city sequence for group stage
function getGroupStageCitySequence(teamCode) {
    const teamMatches = getGroupStageMatchesForTeam(teamCode);
    return teamMatches.map(m => m.cityId);
}

// Knockout path templates (from knockoutBracket.ts)
const knockoutPathTemplates = [
    // Group A
    { groupId: "A", position: 1, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "A", position: 2, path: ["R32_73", "R16_90", "QF_97", "SF_101", "F_104"] },
    { groupId: "A", position: 3, path: ["R32_82", "R16_94", "QF_98", "SF_101", "F_104"] },
    // Group B
    { groupId: "B", position: 1, path: ["R32_85", "R16_96", "QF_100", "SF_102", "F_104"] },
    { groupId: "B", position: 2, path: ["R32_73", "R16_90", "QF_97", "SF_101", "F_104"] },
    { groupId: "B", position: 3, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"] },
    // Group C
    { groupId: "C", position: 1, path: ["R32_76", "R16_91", "QF_99", "SF_102", "F_104"] },
    { groupId: "C", position: 2, path: ["R32_75", "R16_90", "QF_97", "SF_101", "F_104"] },
    { groupId: "C", position: 3, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"] },
    // Group D  
    { groupId: "D", position: 1, path: ["R32_81", "R16_94", "QF_98", "SF_101", "F_104"] },
    { groupId: "D", position: 2, path: ["R32_88", "R16_95", "QF_100", "SF_102", "F_104"] },
    { groupId: "D", position: 3, path: ["R32_77", "R16_89", "QF_97", "SF_101", "F_104"] },
    // Group E
    { groupId: "E", position: 1, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"] },
    { groupId: "E", position: 2, path: ["R32_78", "R16_91", "QF_99", "SF_102", "F_104"] },
    { groupId: "E", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"] },
    // Group F
    { groupId: "F", position: 1, path: ["R32_75", "R16_90", "QF_97", "SF_101", "F_104"] },
    { groupId: "F", position: 2, path: ["R32_76", "R16_91", "QF_99", "SF_102", "F_104"] },
    { groupId: "F", position: 3, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"] },
    // Group G
    { groupId: "G", position: 1, path: ["R32_82", "R16_94", "QF_98", "SF_101", "F_104"] },
    { groupId: "G", position: 2, path: ["R32_88", "R16_95", "QF_100", "SF_102", "F_104"] },
    { groupId: "G", position: 3, path: ["R32_85", "R16_96", "QF_100", "SF_102", "F_104"] },
    // Group H
    { groupId: "H", position: 1, path: ["R32_84", "R16_93", "QF_98", "SF_101", "F_104"] },
    { groupId: "H", position: 2, path: ["R32_86", "R16_95", "QF_100", "SF_102", "F_104"] },
    { groupId: "H", position: 3, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"] },
    // Group I
    { groupId: "I", position: 1, path: ["R32_77", "R16_89", "QF_97", "SF_101", "F_104"] },
    { groupId: "I", position: 2, path: ["R32_78", "R16_91", "QF_99", "SF_102", "F_104"] },
    { groupId: "I", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"] },
    // Group J
    { groupId: "J", position: 1, path: ["R32_86", "R16_95", "QF_100", "SF_102", "F_104"] },
    { groupId: "J", position: 2, path: ["R32_84", "R16_93", "QF_98", "SF_101", "F_104"] },
    { groupId: "J", position: 3, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"] },
    // Group K
    { groupId: "K", position: 1, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"] },
    { groupId: "K", position: 2, path: ["R32_83", "R16_93", "QF_98", "SF_101", "F_104"] },
    { groupId: "K", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"] },
    // Group L
    { groupId: "L", position: 1, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "L", position: 2, path: ["R32_83", "R16_93", "QF_98", "SF_101", "F_104"] },
    { groupId: "L", position: 3, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"] },
];

// Get knockout path for a group and position
function getKnockoutPath(groupId, position) {
    return knockoutPathTemplates.find(t => t.groupId === groupId && t.position === position);
}

// Get knockout stage city sequence from matchIds
function getKnockoutCitySequence(matchIds) {
    return matchIds.map(matchId => {
        const venue = knockoutVenueByMatchId[matchId];
        return venue ? venue.cityId : null;
    }).filter(Boolean);
}

// Calculate total distance for a city sequence
function calculateTotalDistance(citySequence) {
    let totalDistance = 0;
    for (let i = 0; i < citySequence.length - 1; i++) {
        const city1 = cityById[citySequence[i]];
        const city2 = cityById[citySequence[i + 1]];
        if (city1 && city2) {
            totalDistance += haversineDistance(city1.lat, city1.lng, city2.lat, city2.lng);
        }
    }
    return totalDistance;
}

// Main calculation
const results = [];

teams.forEach(team => {
    const groupId = team.group;

    // Get group stage cities
    const groupStageCities = getGroupStageCitySequence(team.code);

    // Calculate for each position (1st, 2nd, 3rd)
    for (let position = 1; position <= 3; position++) {
        const knockoutPath = getKnockoutPath(groupId, position);
        if (!knockoutPath) continue;

        const knockoutCities = getKnockoutCitySequence(knockoutPath.path);

        // Full city sequence: group stage + knockout stage
        const fullCitySequence = [...groupStageCities, ...knockoutCities];

        // Calculate distances
        const groupStageDistance = calculateTotalDistance(groupStageCities);
        const knockoutDistance = calculateTotalDistance(knockoutCities);
        const totalDistance = calculateTotalDistance(fullCitySequence);

        // Get city names for display
        const cityNames = fullCitySequence.map(cityId => {
            const city = cityById[cityId];
            return city ? city.name : cityId;
        });

        results.push({
            teamCode: team.code,
            teamName: team.name,
            group: groupId,
            position: position,
            pathLabel: position === 1 ? '1st Place' : position === 2 ? '2nd Place' : '3rd Place',
            totalDistance: Math.round(totalDistance),
            groupStageDistance: Math.round(groupStageDistance),
            knockoutDistance: Math.round(knockoutDistance),
            citySequence: cityNames.join(' → '),
            numCities: fullCitySequence.length
        });
    }
});

// Sort by total distance (shortest first)
results.sort((a, b) => a.totalDistance - b.totalDistance);

// Output as table
console.log('\n=== 2026 World Cup Championship Path Distances (Sorted by Distance) ===\n');
console.log('Rank | Team | Group | Position | Total Distance (km) | Group Stage (km) | Knockout (km) | Path');
console.log('-----|------|-------|----------|---------------------|------------------|---------------|-----');

results.forEach((r, index) => {
    console.log(`${(index + 1).toString().padStart(4)} | ${r.teamCode.padEnd(4)} | ${r.group.padEnd(5)} | ${r.pathLabel.padEnd(8)} | ${r.totalDistance.toString().padStart(19)} | ${r.groupStageDistance.toString().padStart(16)} | ${r.knockoutDistance.toString().padStart(13)} | ${r.citySequence}`);
});

// Also output as JSON for further use
const outputPath = path.join(__dirname, '../src/data/pathDistances.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\n\nResults saved to: ${outputPath}`);

// Summary statistics
console.log('\n=== Summary Statistics ===');
console.log(`Total paths calculated: ${results.length}`);
console.log(`Shortest path: ${results[0].teamCode} (${results[0].pathLabel}) - ${results[0].totalDistance} km`);
console.log(`Longest path: ${results[results.length - 1].teamCode} (${results[results.length - 1].pathLabel}) - ${results[results.length - 1].totalDistance} km`);
console.log(`Average distance: ${Math.round(results.reduce((sum, r) => sum + r.totalDistance, 0) / results.length)} km`);
