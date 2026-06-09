/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Calculate championship path distances.
 *
 * Outputs every available team path:
 * 48 teams x (1st, 2nd, and all group-specific third-place variants).
 */

const fs = require('fs');
const path = require('path');
const { buildKnockoutPathTemplates } = require('./knockoutPathUtils');

const cities = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/cities.json'), 'utf-8'));
const teams = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/teams.json'), 'utf-8'));
const matches = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/matches.json'), 'utf-8'));
const knockoutVenues = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/knockoutVenues.json'), 'utf-8'));

const cityById = Object.fromEntries(cities.map(city => [city.id, city]));
const knockoutVenueByMatchId = Object.fromEntries(
    Object.values(knockoutVenues).flat().map(venue => [venue.matchId, venue])
);
const knockoutPathTemplates = buildKnockoutPathTemplates(knockoutVenues);

function haversineDistance(lat1, lng1, lat2, lng2) {
    const radiusKm = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radiusKm * c;
}

function getGroupStageMatchesForTeam(teamCode) {
    return matches
        .filter(match => match.stage === 'group' && (match.team1 === teamCode || match.team2 === teamCode))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
}

function getGroupStageCitySequence(teamCode) {
    return getGroupStageMatchesForTeam(teamCode).map(match => match.cityId);
}

function getKnockoutCitySequence(matchIds) {
    return matchIds
        .map(matchId => knockoutVenueByMatchId[matchId]?.cityId)
        .filter(Boolean);
}

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

function getPathLabel(template) {
    return template.label;
}

const results = [];

for (const team of teams) {
    const groupStageCities = getGroupStageCitySequence(team.code);
    const groupTemplates = knockoutPathTemplates.filter(template => template.groupId === team.group);

    for (const knockoutPath of groupTemplates) {
        const knockoutCities = getKnockoutCitySequence(knockoutPath.path);
        const fullCitySequence = [...groupStageCities, ...knockoutCities];
        const transitionCitySequence = [
            groupStageCities[groupStageCities.length - 1],
            knockoutCities[0],
        ].filter(Boolean);

        const groupStageDistance = calculateTotalDistance(groupStageCities);
        const transitionDistance = calculateTotalDistance(transitionCitySequence);
        const knockoutLegDistance = calculateTotalDistance(knockoutCities);
        const knockoutDistance = transitionDistance + knockoutLegDistance;
        const totalDistance = groupStageDistance + knockoutDistance;
        const cityNames = fullCitySequence.map(cityId => cityById[cityId]?.name || cityId);

        results.push({
            teamCode: team.code,
            teamName: team.name,
            teamFlag: team.flag,
            group: team.group,
            position: knockoutPath.position,
            scenarioId: knockoutPath.scenarioId,
            pathId: knockoutPath.id,
            pathLabel: getPathLabel(knockoutPath),
            r32MatchId: knockoutPath.r32MatchId,
            totalDistance: Math.round(totalDistance),
            groupStageDistance: Math.round(groupStageDistance),
            knockoutDistance: Math.round(knockoutDistance),
            transitionDistance: Math.round(transitionDistance),
            knockoutLegDistance: Math.round(knockoutLegDistance),
            citySequence: cityNames.join(' -> '),
            numCities: fullCitySequence.length,
        });
    }
}

results.sort((a, b) => a.totalDistance - b.totalDistance);

console.log('\n=== 2026 World Cup Championship Path Distances (Sorted by Distance) ===\n');
console.log('Rank | Team | Group | Scenario | Total Distance (km) | Group Stage (km) | Knockout (km) | Transition (km) | Knockout Legs (km) | Path');
console.log('-----|------|-------|----------|---------------------|------------------|---------------|-----------------|--------------------|-----');

results.forEach((result, index) => {
    console.log(`${(index + 1).toString().padStart(4)} | ${result.teamCode.padEnd(4)} | ${result.group.padEnd(5)} | ${result.pathLabel.padEnd(8)} | ${result.totalDistance.toString().padStart(19)} | ${result.groupStageDistance.toString().padStart(16)} | ${result.knockoutDistance.toString().padStart(13)} | ${result.transitionDistance.toString().padStart(15)} | ${result.knockoutLegDistance.toString().padStart(18)} | ${result.citySequence}`);
});

const outputPath = path.join(__dirname, '../src/data/pathDistances.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\n\nResults saved to: ${outputPath}`);

console.log('\n=== Summary Statistics ===');
console.log(`Total paths calculated: ${results.length}`);
console.log(`Shortest path: ${results[0].teamCode} (${results[0].pathLabel}) - ${results[0].totalDistance} km`);
console.log(`Longest path: ${results[results.length - 1].teamCode} (${results[results.length - 1].pathLabel}) - ${results[results.length - 1].totalDistance} km`);
console.log(`Average distance: ${Math.round(results.reduce((sum, result) => sum + result.totalDistance, 0) / results.length)} km`);
