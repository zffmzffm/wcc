// Calculate flight distances for all 48 teams during group stage
const cities = require('../src/data/cities.json');
const matches = require('../src/data/matches.json');
const teams = require('../src/data/teams.json');

// Haversine formula to calculate distance between two coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Create city lookup map
const cityMap = {};
cities.forEach(city => {
    cityMap[city.id] = city;
});

// Create team lookup map
const teamMap = {};
teams.forEach(team => {
    teamMap[team.code] = team;
});

// Get all group stage matches for each team, sorted by datetime
function getTeamMatches(teamCode) {
    return matches
        .filter(m => m.stage === 'group' && (m.team1 === teamCode || m.team2 === teamCode))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
}

// Calculate total flight distance for a team
function calculateTeamDistance(teamCode) {
    const teamMatches = getTeamMatches(teamCode);

    if (teamMatches.length === 0) {
        return { team: teamCode, distance: 0, route: [] };
    }

    let totalDistance = 0;
    const route = [];

    for (let i = 0; i < teamMatches.length; i++) {
        const city = cityMap[teamMatches[i].cityId];
        route.push(city.name);

        if (i > 0) {
            const prevCity = cityMap[teamMatches[i - 1].cityId];
            const distance = haversineDistance(
                prevCity.lat, prevCity.lng,
                city.lat, city.lng
            );
            totalDistance += distance;
        }
    }

    return {
        team: teamCode,
        teamName: teamMap[teamCode]?.name || teamCode,
        group: teamMap[teamCode]?.group || 'Unknown',
        distance: Math.round(totalDistance),
        route: route
    };
}

// Calculate distances for all teams
const results = teams.map(team => calculateTeamDistance(team.code));

// Sort by distance (descending)
results.sort((a, b) => b.distance - a.distance);

const fs = require('fs');

// Build markdown output
let output = '# 2026世界杯小组赛各队飞行里程\n\n';
output += '| 排名 | 球队 | 小组 | 飞行里程 (km) | 行程路线 |\n';
output += '|------|------|------|---------------|----------|\n';

results.forEach((result, index) => {
    const routeStr = result.route.join(' → ');
    output += `| ${index + 1} | ${result.teamName} | ${result.group} | ${result.distance.toLocaleString()} | ${routeStr} |\n`;
});

// Summary stats
output += '\n## 统计摘要\n\n';
output += `- **球队总数**: ${results.length}\n`;
output += `- **最长飞行里程**: ${Math.max(...results.map(r => r.distance)).toLocaleString()} km (${results[0].teamName})\n`;
output += `- **最短飞行里程**: ${Math.min(...results.map(r => r.distance)).toLocaleString()} km (${results[results.length - 1].teamName})\n`;
output += `- **平均飞行里程**: ${Math.round(results.reduce((sum, r) => sum + r.distance, 0) / results.length).toLocaleString()} km\n`;

// Write to file
fs.writeFileSync('flight-distances-report.md', output, 'utf8');
console.log('Report saved to flight-distances-report.md');

// Also output to console
console.log('\n' + output);
