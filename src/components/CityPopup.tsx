'use client';
import { City, Match, Team } from '@/types';
import { formatDateTime, getTeamDisplay, getCountryFlag } from '@/utils/formatters';

interface CityPopupProps {
    city: City;
    matches: Match[];
    teams: Team[];
    onClose: () => void;
}

export default function CityPopup({ city, matches, teams, onClose }: CityPopupProps) {
    const countryFlag = getCountryFlag(city.country);

    return (
        <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="popup-title">
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="popup-header">
                    <div className="popup-title">
                        <span className="popup-flag">{countryFlag}</span>
                        <h2 id="popup-title">{city.name}</h2>
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
                        <ul className="match-list" role="list">
                            {matches.map(match => {
                                const team1 = getTeamDisplay(match.team1, teams);
                                const team2 = getTeamDisplay(match.team2, teams);
                                const { date, time } = formatDateTime(match.datetime);

                                return (
                                    <li key={match.id} className="match-item" role="listitem">
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
