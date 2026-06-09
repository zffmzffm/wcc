/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const pathDistances = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../src/data/pathDistances.json'), 'utf-8')
);

const requiredFields = [
    'teamCode',
    'teamName',
    'teamFlag',
    'group',
    'scenarioId',
    'pathId',
    'pathLabel',
    'r32MatchId',
    'totalDistance',
    'groupStageDistance',
    'transitionDistance',
    'knockoutLegDistance',
    'knockoutDistance',
    'citySequence',
];

for (const [index, result] of pathDistances.entries()) {
    for (const field of requiredFields) {
        if (!(field in result)) {
            throw new Error(`Path distance row ${index + 1} is missing ${field}. Run scripts/calculatePathDistances.js first.`);
        }
    }
}

const results = [...pathDistances].sort((a, b) => a.totalDistance - b.totalDistance);
const average = Math.round(results.reduce((sum, result) => sum + result.totalDistance, 0) / results.length);
const firstPaths = results.filter(result => result.position === 1);
const secondPaths = results.filter(result => result.position === 2);
const thirdPaths = results.filter(result => result.position === 3);
const avg1st = Math.round(firstPaths.reduce((sum, result) => sum + result.totalDistance, 0) / firstPaths.length);
const avg2nd = Math.round(secondPaths.reduce((sum, result) => sum + result.totalDistance, 0) / secondPaths.length);
const avg3rd = Math.round(thirdPaths.reduce((sum, result) => sum + result.totalDistance, 0) / thirdPaths.length);

const scenarioCountsByGroup = Object.entries(
    results.reduce((groups, result) => {
        if (!groups[result.group]) {
            groups[result.group] = new Set();
        }
        groups[result.group].add(result.scenarioId);
        return groups;
    }, {})
).sort(([groupA], [groupB]) => groupA.localeCompare(groupB));

let md = '# 2026 FIFA World Cup Championship Path Distance Ranking\n\n';
md += `All ${results.length} championship paths, sorted by great-circle travel distance.\n\n`;
md += '## Summary\n\n';
md += '| Metric | Value |\n|------|------|\n';
md += `| Total paths | ${results.length} |\n`;
md += `| Shortest path | ${results[0].teamName} (${results[0].pathLabel}) - ${results[0].totalDistance.toLocaleString()} km |\n`;
md += `| Longest path | ${results[results.length - 1].teamName} (${results[results.length - 1].pathLabel}) - ${results[results.length - 1].totalDistance.toLocaleString()} km |\n`;
md += `| Average distance | ${average.toLocaleString()} km |\n\n`;

md += '## Scenario Coverage\n\n';
md += '| Group | Scenario count | Scenarios |\n';
md += '|:----:|---------------:|:----------|\n';
for (const [group, scenarios] of scenarioCountsByGroup) {
    const sortedScenarios = [...scenarios].sort((a, b) => {
        const order = { '1st': 1, '2nd': 2 };
        return (order[a] || 3) - (order[b] || 3) || a.localeCompare(b);
    });
    md += `| ${group} | ${sortedScenarios.length} | ${sortedScenarios.join(', ')} |\n`;
}

md += '\n## Full Ranking\n\n';
md += '| Rank | Team | Group | Scenario | Total km | Group km | Transition km | Knockout legs km | Knockout km | R32 match | Path id | Path |\n';
md += '|:----:|:-----|:----:|:----:|---------:|---------:|--------------:|-----------------:|------------:|:----------|:--------|:-----|\n';

results.forEach((result, index) => {
    const teamCol = `${result.teamFlag} ${result.teamCode} (${result.teamName})`;
    md += `| ${index + 1} | ${teamCol} | ${result.group} | ${result.pathLabel} | **${result.totalDistance.toLocaleString()}** | ${result.groupStageDistance.toLocaleString()} | ${result.transitionDistance.toLocaleString()} | ${result.knockoutLegDistance.toLocaleString()} | ${result.knockoutDistance.toLocaleString()} | ${result.r32MatchId} | ${result.pathId} | ${result.citySequence} |\n`;
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

md += '> Transition km is the flight from the final group-stage city to the first knockout city.\n';
md += '> Knockout km is Transition km plus the movement between knockout-round host cities.\n\n';
md += `Generated: ${new Date().toISOString().split('T')[0]}\n`;
md += 'Distance method: great-circle Haversine formula.\n';

fs.writeFileSync(path.join(__dirname, '../docs/championship_paths_table.md'), md);
console.log('Markdown updated successfully.');
