'use client';
import { CircleMarker, Popup } from 'react-leaflet';
import { Match, Team, City } from '@/types';
import { formatDateTimeShort, getCountryColor } from '@/utils/formatters';
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
    animationKey: number;
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
    animationKey
}: MatchMarkerProps) {
    const opponent = getOpponent(match, teamCode, teams);
    const { date, time } = formatDateTimeShort(match.datetime);
    const countryColor = getCountryColor(city.country);

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
                        <span className="vs">VS</span>
                        <span className="team-info">
                            <FlagIcon code={opponent.code} size={18} />
                            <span className="team-name">{opponent.name}</span>
                        </span>
                    </div>
                    <div className="flight-popup-datetime">
                        <span className="date">📅 {date}</span>
                        <span className="time">⏰ {time}</span>
                    </div>
                </div>
            </Popup>
        </CircleMarker>
    );
}
