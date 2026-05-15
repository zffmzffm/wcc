const fs = require('fs');
const path = require('path');

// Load data files
const cities = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/cities.json'), 'utf-8'));
const teams = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/teams.json'), 'utf-8'));
const matches = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/matches.json'), 'utf-8'));
const knockoutVenues = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/knockoutVenues.json'), 'utf-8'));

// Create city lookup by id
const cityById = {};
cities.forEach(city => { cityById[city.id] = city; });

const knockoutVenueByMatchId = {};
Object.values(knockoutVenues).flat().forEach(match => { knockoutVenueByMatchId[match.matchId] = match; });

function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getGroupStageMatchesForTeam(teamCode) {
    return matches
        .filter(m => m.stage === 'group' && (m.team1 === teamCode || m.team2 === teamCode))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
}

function getGroupStageCitySequence(teamCode) {
    return getGroupStageMatchesForTeam(teamCode).map(m => m.cityId);
}

const knockoutPathTemplates = [
    { groupId: "A", position: 1, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "A", position: 2, path: ["R32_73", "R16_90", "QF_97", "SF_101", "F_104"] },
    { groupId: "A", position: 3, path: ["R32_82", "R16_94", "QF_98", "SF_101", "F_104"] },
    { groupId: "B", position: 1, path: ["R32_85", "R16_96", "QF_100", "SF_102", "F_104"] },
    { groupId: "B", position: 2, path: ["R32_73", "R16_90", "QF_97", "SF_101", "F_104"] },
    { groupId: "B", position: 3, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"] },
    { groupId: "C", position: 1, path: ["R32_76", "R16_91", "QF_99", "SF_102", "F_104"] },
    { groupId: "C", position: 2, path: ["R32_75", "R16_90", "QF_97", "SF_101", "F_104"] },
    { groupId: "C", position: 3, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "D", position: 1, path: ["R32_81", "R16_94", "QF_98", "SF_101", "F_104"] },
    { groupId: "D", position: 2, path: ["R32_88", "R16_95", "QF_100", "SF_102", "F_104"] },
    { groupId: "D", position: 3, path: ["R32_77", "R16_89", "QF_97", "SF_101", "F_104"] },
    { groupId: "E", position: 1, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"] },
    { groupId: "E", position: 2, path: ["R32_78", "R16_91", "QF_99", "SF_102", "F_104"] },
    { groupId: "E", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "F", position: 1, path: ["R32_75", "R16_90", "QF_97", "SF_101", "F_104"] },
    { groupId: "F", position: 2, path: ["R32_76", "R16_91", "QF_99", "SF_102", "F_104"] },
    { groupId: "F", position: 3, path: ["R32_74", "R16_89", "QF_97", "SF_101", "F_104"] },
    { groupId: "G", position: 1, path: ["R32_82", "R16_94", "QF_98", "SF_101", "F_104"] },
    { groupId: "G", position: 2, path: ["R32_88", "R16_95", "QF_100", "SF_102", "F_104"] },
    { groupId: "G", position: 3, path: ["R32_85", "R16_96", "QF_100", "SF_102", "F_104"] },
    { groupId: "H", position: 1, path: ["R32_84", "R16_93", "QF_98", "SF_101", "F_104"] },
    { groupId: "H", position: 2, path: ["R32_86", "R16_95", "QF_100", "SF_102", "F_104"] },
    { groupId: "H", position: 3, path: ["R32_79", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "I", position: 1, path: ["R32_77", "R16_89", "QF_97", "SF_101", "F_104"] },
    { groupId: "I", position: 2, path: ["R32_78", "R16_91", "QF_99", "SF_102", "F_104"] },
    { groupId: "I", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "J", position: 1, path: ["R32_86", "R16_95", "QF_100", "SF_102", "F_104"] },
    { groupId: "J", position: 2, path: ["R32_84", "R16_93", "QF_98", "SF_101", "F_104"] },
    { groupId: "J", position: 3, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"] },
    { groupId: "K", position: 1, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"] },
    { groupId: "K", position: 2, path: ["R32_83", "R16_93", "QF_98", "SF_101", "F_104"] },
    { groupId: "K", position: 3, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "L", position: 1, path: ["R32_80", "R16_92", "QF_99", "SF_102", "F_104"] },
    { groupId: "L", position: 2, path: ["R32_83", "R16_93", "QF_98", "SF_101", "F_104"] },
    { groupId: "L", position: 3, path: ["R32_87", "R16_96", "QF_100", "SF_102", "F_104"] },
];

function calculateTotalDistance(citySequence) {
    let dist = 0;
    for (let i = 0; i < citySequence.length - 1; i++) {
        const c1 = cityById[citySequence[i]];
        const c2 = cityById[citySequence[i + 1]];
        if (c1 && c2) dist += haversineDistance(c1.lat, c1.lng, c2.lat, c2.lng);
    }
    return dist;
}

const results = [];
teams.forEach(team => {
    const groupId = team.group;
    const groupStageCities = getGroupStageCitySequence(team.code);

    for (let position = 1; position <= 3; position++) {
        const knockoutPath = knockoutPathTemplates.find(t => t.groupId === groupId && t.position === position);
        if (!knockoutPath) continue;

        const knockoutCities = knockoutPath.path.map(id => knockoutVenueByMatchId[id]?.cityId).filter(Boolean);
        const fullCitySequence = [...groupStageCities, ...knockoutCities];

        const groupStageDistance = calculateTotalDistance(groupStageCities);
        
        // Include the transition flight in the knockout distance
        // The distance from the last group stage match to the first knockout match
        const transitionDistance = calculateTotalDistance([groupStageCities[groupStageCities.length - 1], knockoutCities[0]]);
        const knockoutDistance = calculateTotalDistance(knockoutCities) + transitionDistance;
        const totalDistance = calculateTotalDistance(fullCitySequence);

        const cityNames = fullCitySequence.map(id => cityById[id]?.name || id);

        results.push({
            teamCode: team.code,
            teamName: team.name,
            teamFlag: team.flag,
            group: groupId,
            position: position,
            pathLabel: position === 1 ? '1st' : position === 2 ? '2nd' : '3rd',
            totalDistance: Math.round(totalDistance),
            groupStageDistance: Math.round(groupStageDistance),
            knockoutDistance: Math.round(knockoutDistance),
            transitionDistance: Math.round(transitionDistance),
            citySequence: cityNames.join(' → '),
            numCities: fullCitySequence.length
        });
    }
});

results.sort((a, b) => a.totalDistance - b.totalDistance);

let md = '# 2026 FIFA World Cup 夺冠路径距离排名\n\n';
md += '所有144条夺冠路径（48支球队 × 3个名次路径），按照大圆线距离从短到长排序。\n\n';
md += '## 📊 统计概要\n\n';
md += '| 指标 | 数值 |\n|------|------|\n';
md += `| 总路径数 | ${results.length} |\n`;
md += `| 最短路径 | ${results[0].teamName} (${results[0].pathLabel}) - ${results[0].totalDistance.toLocaleString()} km |\n`;
md += `| 最长路径 | ${results[results.length - 1].teamName} (${results[results.length - 1].pathLabel}) - ${results[results.length - 1].totalDistance.toLocaleString()} km |\n`;
md += `| 平均距离 | ${Math.round(results.reduce((sum, r) => sum + r.totalDistance, 0) / results.length).toLocaleString()} km |\n\n`;

md += '---\n\n## 🏆 完整排名表\n\n';
md += '| 排名 | 球队 | 小组 | 名次 | 总距离(km) | 小组赛(km) | 淘汰赛(km) | 转场里程*(km) | 路径 |\n';
md += '|:----:|:-----|:----:|:----:|----------:|----------:|----------:|-------------:|:-----|\n';

results.forEach((r, i) => {
    const teamCol = `${r.teamFlag} ${r.teamCode} (${r.teamName})`;
    md += `| ${i + 1} | ${teamCol} | ${r.group} | ${r.pathLabel} | **${r.totalDistance.toLocaleString()}** | ${r.groupStageDistance.toLocaleString()} | ${r.knockoutDistance.toLocaleString()} | ${r.transitionDistance.toLocaleString()} | ${r.citySequence} |\n`;
});

md += '\n---\n\n## 📈 关键洞察\n\n';
md += '### 最短路径 Top 10\n';
for (let i = 0; i < 10; i++) {
    const r = results[i];
    md += `${i + 1}. ${r.teamFlag} **${r.teamName}** (小组第${r.position}) - ${r.totalDistance.toLocaleString()} km\n`;
}

md += '\n### 最长路径 Bottom 5\n';
for (let i = results.length - 5; i < results.length; i++) {
    const r = results[i];
    md += `${results.length - (results.length - i) + 1}. ${r.teamFlag} **${r.teamName}** (小组第${r.position}) - ${r.totalDistance.toLocaleString()} km\n`;
}

const avg1st = Math.round(results.filter(r => r.position === 1).reduce((s, r) => s + r.totalDistance, 0) / 48);
const avg2nd = Math.round(results.filter(r => r.position === 2).reduce((s, r) => s + r.totalDistance, 0) / 48);
const avg3rd = Math.round(results.filter(r => r.position === 3).reduce((s, r) => s + r.totalDistance, 0) / 48);

md += '\n### 路径分析要点\n';
md += `- **小组第1名平均距离**: ~${Math.round(avg1st / 100) * 100} km\n`;
md += `- **小组第2名平均距离**: ~${Math.round(avg2nd / 100) * 100} km\n`;
md += `- **小组第3名平均距离**: ~${Math.round(avg3rd / 100) * 100} km\n\n`;

md += '> [!IMPORTANT]\n> *转场里程指的是从最后一场小组赛城市飞往首场淘汰赛城市的距离。此转场距离现在已正确计入淘汰赛(km)中。\\n> 小组第2名的路径通常比第1名和第3名更长，因为淘汰赛对阵安排导致需要横跨更多地理区域。\n\n';
md += '---\n\n*数据生成时间: ' + new Date().toISOString().split('T')[0] + '*\n';
md += '*距离计算方法: 大圆线 (Haversine 公式)*\n';

fs.writeFileSync(path.join(__dirname, '../docs/championship_paths_table.md'), md);
console.log("Markdown updated successfully!");
