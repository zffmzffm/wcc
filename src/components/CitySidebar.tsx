'use client';
import { City } from './CityMarker';
import { Match, Team } from './CityPopup';
import FlagIcon from './FlagIcon';

interface CitySidebarProps {
    city: City | null;
    matches: Match[];
    teams: Team[];
    onClose: () => void;
}

const getTeamDisplay = (teamCode: string, teams: Team[]): { name: string; code: string } => {
    const team = teams.find(t => t.code === teamCode);
    return team ? { name: team.name, code: team.code } : { name: teamCode, code: teamCode };
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

export default function CitySidebar({ city, matches, teams, onClose }: CitySidebarProps) {
    if (!city) {
        return (
            <aside className="sidebar">
                <div className="sidebar-placeholder">
                    <span className="sidebar-placeholder-icon">🏟️</span>
                    <p>点击地图上的城市</p>
                    <p>查看场馆和比赛信息</p>
                </div>
            </aside>
        );
    }

    const countryCode = city.country === 'USA' ? 'USA' : city.country === 'Mexico' ? 'MEX' : 'CAN';

    return (
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-title">
                    <FlagIcon code={countryCode} size={28} />
                    <h2>{city.name}</h2>
                </div>
                <button className="sidebar-close" onClick={onClose} aria-label="关闭">
                    ✕
                </button>
            </div>

            {/* Venue Info */}
            <div className="sidebar-venue">
                <div className="venue-name">🏟️ {city.venue}</div>
                <div className="venue-capacity">容量: {city.capacity.toLocaleString()} 人</div>
            </div>

            {/* Matches List */}
            <div className="sidebar-matches">
                <h3>小组赛比赛 ({matches.length} 场)</h3>
                {matches.length === 0 ? (
                    <p className="no-matches">暂无比赛数据</p>
                ) : (
                    <ul className="match-list">
                        {[...matches].sort((a, b) =>
                            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                        ).map(match => {
                            const team1 = getTeamDisplay(match.team1, teams);
                            const team2 = getTeamDisplay(match.team2, teams);
                            const { date, time } = formatDateTime(match.datetime);

                            return (
                                <li key={match.id} className="match-item">
                                    <div className="match-group">小组 {match.group}</div>
                                    <div className="match-teams">
                                        <span className="team">
                                            <FlagIcon code={team1.code} size={20} />
                                            <span className="team-name">{team1.name}</span>
                                        </span>
                                        <span className="vs">VS</span>
                                        <span className="team">
                                            <FlagIcon code={team2.code} size={20} />
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
        </aside>
    );
}
