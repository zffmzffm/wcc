'use client';
import { Match, Team, City } from '@/types';
import { formatDateTimeWithTimezone, getTeamDisplay } from '@/utils/formatters';
import FlagIcon from './FlagIcon';

interface TeamScheduleSidebarProps {
    team: Team | null;
    matches: Match[];
    teams: Team[];
    cities: City[];
    timezone: string;
    onClose: () => void;
}

const getCityName = (cityId: string, cities: City[]): string => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : cityId;
};

export default function TeamScheduleSidebar({ team, matches, teams, cities, timezone, onClose }: TeamScheduleSidebarProps) {
    if (!team) {
        return (
            <aside className="sidebar sidebar-right" role="complementary" aria-label="Team Information">
                <div className="sidebar-placeholder">
                    <span className="sidebar-placeholder-icon">⚽</span>
                    <p>Select a team above</p>
                    <p>to view group stage schedule</p>
                </div>
            </aside>
        );
    }

    // Sort matches by datetime
    const sortedMatches = [...matches].sort((a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    return (
        <aside className="sidebar sidebar-right" role="complementary" aria-label={`${team.name} Schedule`}>
            {/* Header */}
            <div className="sidebar-header sidebar-header-compact">
                <div className="sidebar-title">
                    <FlagIcon code={team.code} size={28} />
                    <h2>{team.name}</h2>
                </div>
                <div className="sidebar-header-actions">
                    <span className="team-group-badge" aria-label={`Group ${team.group}`}>
                        {team.group}
                    </span>
                    <button className="sidebar-close" onClick={onClose} aria-label="Clear selection">
                        ✕
                    </button>
                </div>
            </div>

            {/* Schedule */}
            <div className="sidebar-matches">
                {sortedMatches.length === 0 ? (
                    <p className="no-matches">No match data available</p>
                ) : (
                    <ul className="match-list" role="list">
                        {sortedMatches.map((match, index) => {
                            const team1 = getTeamDisplay(match.team1, teams);
                            const team2 = getTeamDisplay(match.team2, teams);
                            const { date, time } = formatDateTimeWithTimezone(match.datetime, timezone);
                            const cityName = getCityName(match.cityId, cities);
                            const isHomeTeam = match.team1 === team.code;

                            return (
                                <li key={match.id} className="match-item schedule-item" role="listitem">
                                    <div className="match-info-row">
                                        <span className="match-number">Match {index + 1}</span>
                                        <span className="match-datetime-inline">
                                            <span className="match-date">{date}</span>
                                            <span className="match-time">{time}</span>
                                        </span>
                                        <span className="match-venue">{cityName}</span>
                                    </div>
                                    <div className="match-teams">
                                        <span className={`team ${isHomeTeam ? 'highlight-team' : ''}`}>
                                            <FlagIcon code={team1.code} size={18} />
                                            <span className="team-name">{team1.name}</span>
                                        </span>
                                        <span className="vs">VS</span>
                                        <span className={`team ${!isHomeTeam ? 'highlight-team' : ''}`}>
                                            <FlagIcon code={team2.code} size={18} />
                                            <span className="team-name">{team2.name}</span>
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}
