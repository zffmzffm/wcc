/* eslint-disable @typescript-eslint/no-require-imports */
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

function calculateTotalDistance(citySequence) {
    let distance = 0;
    for (let i = 0; i < citySequence.length - 1; i++) {
        const city1 = cityById[citySequence[i]];
        const city2 = cityById[citySequence[i + 1]];
        if (city1 && city2) {
            distance += haversineDistance(city1.lat, city1.lng, city2.lat, city2.lng);
        }
    }
    return distance;
}

function getPathLabel(template) {
    if (template.position === 1) return '1st';
    if (template.position === 2) return '2nd';
    return template.label;
}

const results = [];

for (const team of teams) {
    const groupStageCities = getGroupStageCitySequence(team.code);
    const groupTemplates = knockoutPathTemplates.filter(template => template.groupId === team.group);

    for (const knockoutPath of groupTemplates) {
        const knockoutCities = knockoutPath.path
            .map(matchId => knockoutVenueByMatchId[matchId]?.cityId)
            .filter(Boolean);
        const fullCitySequence = [...groupStageCities, ...knockoutCities];
        const transitionDistance = calculateTotalDistance([
            groupStageCities[groupStageCities.length - 1],
            knockoutCities[0],
        ]);

        const groupStageDistance = calculateTotalDistance(groupStageCities);
        const knockoutDistance = calculateTotalDistance(knockoutCities) + transitionDistance;
        const totalDistance = calculateTotalDistance(fullCitySequence);
        const cityNames = fullCitySequence.map(cityId => cityById[cityId]?.name || cityId);

        results.push({
            teamCode: team.code,
            teamName: team.name,
            teamFlag: team.flag,
            group: team.group,
            position: knockoutPath.position,
            scenarioId: knockoutPath.scenarioId,
            pathLabel: getPathLabel(knockoutPath),
            totalDistance: Math.round(totalDistance),
            groupStageDistance: Math.round(groupStageDistance),
            knockoutDistance: Math.round(knockoutDistance),
            transitionDistance: Math.round(transitionDistance),
            citySequence: cityNames.join(' -> '),
            numCities: fullCitySequence.length,
        });
    }
}

results.sort((a, b) => a.totalDistance - b.totalDistance);

const average = Math.round(results.reduce((sum, result) => sum + result.totalDistance, 0) / results.length);
const firstPaths = results.filter(result => result.position === 1);
const secondPaths = results.filter(result => result.position === 2);
const thirdPaths = results.filter(result => result.position === 3);
const avg1st = Math.round(firstPaths.reduce((sum, result) => sum + result.totalDistance, 0) / firstPaths.length);
const avg2nd = Math.round(secondPaths.reduce((sum, result) => sum + result.totalDistance, 0) / secondPaths.length);
const avg3rd = Math.round(thirdPaths.reduce((sum, result) => sum + result.totalDistance, 0) / thirdPaths.length);

let md = '# 2026 FIFA World Cup Championship Path Distance Ranking\n\n';
md += `All ${results.length} championship paths, sorted by great-circle travel distance.\n\n`;
md += '## Summary\n\n';
md += '| Metric | Value |\n|------|------|\n';
md += `| Total paths | ${results.length} |\n`;
md += `| Shortest path | ${results[0].teamName} (${results[0].pathLabel}) - ${results[0].totalDistance.toLocaleString()} km |\n`;
md += `| Longest path | ${results[results.length - 1].teamName} (${results[results.length - 1].pathLabel}) - ${results[results.length - 1].totalDistance.toLocaleString()} km |\n`;
md += `| Average distance | ${average.toLocaleString()} km |\n\n`;

md += '## Full Ranking\n\n';
md += '| Rank | Team | Group | Scenario | Total km | Group km | Knockout km | Transition km | Path |\n';
md += '|:----:|:-----|:----:|:----:|----------:|----------:|----------:|-------------:|:-----|\n';

results.forEach((result, index) => {
    const teamCol = `${result.teamFlag} ${result.teamCode} (${result.teamName})`;
    md += `| ${index + 1} | ${teamCol} | ${result.group} | ${result.pathLabel} | **${result.totalDistance.toLocaleString()}** | ${result.groupStageDistance.toLocaleString()} | ${result.knockoutDistance.toLocaleString()} | ${result.transitionDistance.toLocaleString()} | ${result.citySequence} |\n`;
});

md += '\n## Highlights\n\n';
md += '### Shortest Paths: Top 10\n';
for (let i = 0; i < 10; i++) {
    const result = results[i];
    md += `${i + 1}. ${result.teamFlag} **${result.teamName}** (${result.pathLabel}) - ${result.totalDistance.toLocaleString()} km\n`;
}

md += '\n### Longest Paths: Bottom 5\n';
for (let i = results.length - 5; i < results.length; i++) {
    const result = results[i];
    md += `${i + 1}. ${result.teamFlag} **${result.teamName}** (${result.pathLabel}) - ${result.totalDistance.toLocaleString()} km\n`;
}

md += '\n### Scenario Averages\n';
md += `- **1st average distance**: ~${Math.round(avg1st / 100) * 100} km\n`;
md += `- **2nd average distance**: ~${Math.round(avg2nd / 100) * 100} km\n`;
md += `- **Third-place variant average distance**: ~${Math.round(avg3rd / 100) * 100} km\n\n`;

md += '> Transition km is the flight from the final group-stage city to the first knockout city.\n\n';
md += `Generated: ${new Date().toISOString().split('T')[0]}\n`;
md += 'Distance method: great-circle Haversine formula.\n';

fs.writeFileSync(path.join(__dirname, '../docs/championship_paths_table.md'), md);
console.log('Markdown updated successfully.');
