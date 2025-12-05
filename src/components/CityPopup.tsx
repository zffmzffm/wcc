'use client';
import { City } from './CityMarker';

export interface Match {
    id: number;
    group: string;
    team1: string;
    team2: string;
    cityId: string;
    datetime: string;
    stage: string;
}

export interface Team {
    code: string;
    name: string;
    group: string;
    flag: string;
}

interface CityPopupProps {
    city: City;
    matches: Match[];
    teams: Team[];
    onClose: () => void;
}

const getTeamDisplay = (teamCode: string, teams: Team[]): { name: string; flag: string } => {
    const team = teams.find(t => t.code === teamCode);
    return team ? { name: team.name, flag: team.flag } : { name: teamCode, flag: '🏳️' };
};

const formatDateTime = (datetime: string): { date: string; time: string } => {
    const d = new Date(datetime);
    const date = d.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
    const time = d.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return { date, time };
};

export default function CityPopup({ city, matches, teams, onClose }: CityPopupProps) {
    const countryFlag = city.country === 'USA' ? '🇺🇸' : city.country === 'Mexico' ? '🇲🇽' : '🇨🇦';

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="popup-header">
                    <div className="popup-title">
                        <span className="popup-flag">{countryFlag}</span>
                        <h2>{city.name}</h2>
                    </div>
                    <button className="popup-close" onClick={onClose} aria-label="关闭">
                        ✕
                    </button>
                </div>

                {/* Venue Info */}
                <div className="popup-venue">
                    <div className="venue-name">🏟️ {city.venue}</div>
                    <div className="venue-capacity">容量: {city.capacity.toLocaleString()} 人</div>
                </div>

                {/* Matches List */}
                <div className="popup-matches">
                    <h3>小组赛比赛 ({matches.length} 场)</h3>
                    {matches.length === 0 ? (
                        <p className="no-matches">暂无比赛数据</p>
                    ) : (
                        <ul className="match-list">
                            {matches.map(match => {
                                const team1 = getTeamDisplay(match.team1, teams);
                                const team2 = getTeamDisplay(match.team2, teams);
                                const { date, time } = formatDateTime(match.datetime);

                                return (
                                    <li key={match.id} className="match-item">
                                        <div className="match-group">小组 {match.group}</div>
                                        <div className="match-teams">
                                            <span className="team">
                                                <span className="team-flag">{team1.flag}</span>
                                                <span className="team-name">{team1.name}</span>
                                            </span>
                                            <span className="vs">VS</span>
                                            <span className="team">
                                                <span className="team-flag">{team2.flag}</span>
                                                <span className="team-name">{team2.name}</span>
                                            </span>
                                        </div>
                                        <div className="match-datetime">
                                            <span className="match-date">{date}</span>
                                            <span className="match-time">{time}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
