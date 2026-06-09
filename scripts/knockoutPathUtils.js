const FINAL_MATCH_ID = 'F_104';
const GROUP_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const SCENARIO_COLORS = {
    '1st': '#D4AF37',
    '2nd': '#2F855A',
};

const THIRD_PLACE_COLORS = [
    '#E4572E',
    '#0077B6',
    '#8E44AD',
    '#00897B',
    '#C2185B',
    '#5F6CAF',
];

function flattenKnockoutVenues(knockoutVenuesData) {
    return Object.values(knockoutVenuesData).flat();
}

function getMatchNumber(matchId) {
    const match = matchId.match(/_(\d+)$/);
    return match ? match[1] : null;
}

function getWinnerToken(matchId) {
    const matchNumber = getMatchNumber(matchId);
    return matchNumber ? `W${matchNumber}` : null;
}

function parseMatchupSides(matchup) {
    return (matchup || '')
        .split(/\s+vs\s+/)
        .map(side => side.trim())
        .filter(Boolean);
}

function getThirdPlaceLabel(variantIndex) {
    return `3rd-${String.fromCharCode('a'.charCodeAt(0) + variantIndex)}`;
}

function getScenarioColor(scenarioId) {
    if (SCENARIO_COLORS[scenarioId]) {
        return SCENARIO_COLORS[scenarioId];
    }

    const match = scenarioId.match(/^3rd-([a-z])$/);
    if (!match) {
        return '#666666';
    }

    const variantIndex = match[1].charCodeAt(0) - 'a'.charCodeAt(0);
    return THIRD_PLACE_COLORS[variantIndex % THIRD_PLACE_COLORS.length];
}

function traceWinnerPath(r32MatchId, venues) {
    const path = [r32MatchId];
    const seenMatchIds = new Set(path);
    let currentMatchId = r32MatchId;

    while (currentMatchId !== FINAL_MATCH_ID) {
        const winnerToken = getWinnerToken(currentMatchId);
        if (!winnerToken) {
            break;
        }

        const nextVenue = venues.find(venue =>
            venue.matchId !== currentMatchId &&
            parseMatchupSides(venue.matchup).includes(winnerToken)
        );

        if (!nextVenue || seenMatchIds.has(nextVenue.matchId)) {
            break;
        }

        path.push(nextVenue.matchId);
        seenMatchIds.add(nextVenue.matchId);
        currentMatchId = nextVenue.matchId;
    }

    return path;
}

function createTemplate(groupId, position, variantIndex, r32MatchId, venues) {
    const scenarioId = position === 1
        ? '1st'
        : position === 2
            ? '2nd'
            : getThirdPlaceLabel(variantIndex);
    const path = traceWinnerPath(r32MatchId, venues);
    const finalMatchId = path[path.length - 1];

    if (finalMatchId !== FINAL_MATCH_ID) {
        throw new Error(`Knockout path ${groupId} ${scenarioId} does not reach ${FINAL_MATCH_ID}`);
    }

    return {
        id: `${groupId}-${scenarioId}`,
        scenarioId,
        groupId,
        position,
        label: scenarioId,
        variantIndex,
        r32MatchId,
        color: getScenarioColor(scenarioId),
        path,
    };
}

function buildKnockoutPathTemplates(knockoutVenuesData) {
    const venues = flattenKnockoutVenues(knockoutVenuesData);
    const thirdPlaceVariantCounts = new Map();
    const templates = [];

    for (const venue of venues.filter(item => item.stage === 'R32')) {
        for (const side of parseMatchupSides(venue.matchup)) {
            const seededMatch = side.match(/^([12])([A-L])$/);
            if (seededMatch) {
                templates.push(createTemplate(
                    seededMatch[2],
                    Number(seededMatch[1]),
                    0,
                    venue.matchId,
                    venues
                ));
                continue;
            }

            const thirdPlaceMatch = side.match(/^3([A-L]+)$/);
            if (!thirdPlaceMatch) {
                continue;
            }

            for (const groupId of thirdPlaceMatch[1].split('')) {
                const variantIndex = thirdPlaceVariantCounts.get(groupId) || 0;
                templates.push(createTemplate(groupId, 3, variantIndex, venue.matchId, venues));
                thirdPlaceVariantCounts.set(groupId, variantIndex + 1);
            }
        }
    }

    return GROUP_IDS.flatMap(groupId =>
        templates
            .filter(template => template.groupId === groupId)
            .sort((a, b) => a.position - b.position || a.variantIndex - b.variantIndex)
    );
}

module.exports = {
    buildKnockoutPathTemplates,
    flattenKnockoutVenues,
    getScenarioColor,
    getThirdPlaceLabel,
    traceWinnerPath,
};
