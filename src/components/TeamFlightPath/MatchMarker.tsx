'use client';
import { CircleMarker, Popup } from 'react-leaflet';
import { Match, Team, City } from '@/types';
import { formatDateTimeWithTimezone } from '@/utils/formatters';
import { getDayDifference, formatMatchDayDate } from '@/utils/dateUtils';
import { flipScore, getScoreDisplay } from '@/utils/score';
import { FLIGHT_PATH_CONFIG } from '@/constants';
import FlagIcon from '../FlagIcon';

interface MatchMarkerProps {
    match: Match;
    city: City;
    coords: [number, number];
    teamCode: string;
    currentTeam: Team | undefined;
    teams: Team[];
    markerIndex: number;
    isLatest: boolean;
    animationKey: string;
    timezone: string;
}

/**
 * Get opponent team info
 */
const getOpponent = (match: Match, teamCode: string, teams: Team[]): { name: string; code: string } => {
    const opponentCode = match.team1 === teamCode ? match.team2 : match.team1;
    const team = teams.find(t => t.code === opponentCode);
    return team ? { name: team.name, code: team.code } : { name: opponentCode, code: opponentCode };
};

/**
 * Renders a match marker with popup showing match details
 */
export default function MatchMarker({
    match,
    city,
    coords,
    teamCode,
    currentTeam,
    teams,
    markerIndex,
    isLatest,
    animationKey,
    timezone
}: MatchMarkerProps) {
    const opponent = getOpponent(match, teamCode, teams);
    const { date: tzDate, time } = formatDateTimeWithTimezone(match.datetime, timezone);
    const dayDiff = getDayDifference(match.datetime, timezone);
    const timeDisplay = dayDiff !== 0 ? `${time} (${dayDiff > 0 ? '+' : ''}${dayDiff})` : time;
    const date = dayDiff !== 0 ? formatMatchDayDate(match.datetime) : tzDate;
    const displayScore = match.team1 === teamCode ? match.score : flipScore(match.score);
    const scoreDisplay = getScoreDisplay(displayScore);

    return (
        <CircleMarker
            key={`marker-${animationKey}-${match.id}`}
            center={coords}
            radius={isLatest ? FLIGHT_PATH_CONFIG.activeMarkerRadius : FLIGHT_PATH_CONFIG.markerRadius}
            pathOptions={{
                color: 'transparent',  // Invisible stroke - CityMarker provides the visual
                weight: 0,
                fillColor: 'transparent',  // Invisible fill - CityMarker provides the visual
                fillOpacity: 0
            }}
        >
            <Popup className="match-popup">
                <div className="flight-popup">
                    <div className="flight-popup-header">
                        <span className="match-number">Match {markerIndex + 1}</span>
                        <span className="match-group-badge">Group {match.group}</span>
                    </div>
                    <div className="flight-popup-venue">
                        🏟️ {city.name} - {city.venue}
                    </div>
                    <div className="flight-popup-teams">
                        <span className="team-info">
                            <FlagIcon code={currentTeam?.code || teamCode} size={18} />
                            <span className="team-name">{currentTeam?.name}</span>
                        </span>
                        <span
                            className={`vs${scoreDisplay.isScored ? ' is-scored' : ''}`}
                            aria-label={scoreDisplay.ariaLabel}
                        >
                            {scoreDisplay.label}
                        </span>
                        <span className="team-info">
                            <FlagIcon code={opponent.code} size={18} />
                            <span className="team-name">{opponent.name}</span>
                        </span>
                    </div>
                    <div className="flight-popup-datetime">
                        <span className="date">📅 {date}</span>
                        <span className="time">⏰ {timeDisplay}</span>
                    </div>
                </div>
            </Popup>
        </CircleMarker>
    );
}

