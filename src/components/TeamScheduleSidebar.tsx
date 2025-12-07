'use client';
import { Match, Team } from './CityPopup';
import FlagIcon from './FlagIcon';

interface City {
    id: string;
    name: string;
    country: string;
    venue: string;
}

interface TeamScheduleSidebarProps {
    team: Team | null;
    matches: Match[];
    teams: Team[];
    cities: City[];
    onClose: () => void;
}

const getTeamDisplay = (teamCode: string, teams: Team[]): { name: string; code: string } => {
    const team = teams.find(t => t.code === teamCode);
    return team ? { name: team.name, code: team.code } : { name: teamCode, code: teamCode };
};

const getCityName = (cityId: string, cities: City[]): string => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : cityId;
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

export default function TeamScheduleSidebar({ team, matches, teams, cities, onClose }: TeamScheduleSidebarProps) {
    if (!team) {
        return (
            <aside className="sidebar sidebar-right">
                <div className="sidebar-placeholder">
                    <span className="sidebar-placeholder-icon">⚽</span>
                    <p>在顶部选择球队</p>
                    <p>查看小组赛行程</p>
                </div>
            </aside>
        );
    }

    // Sort matches by datetime
    const sortedMatches = [...matches].sort((a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );

    return (
        <aside className="sidebar sidebar-right">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-title">
                    <FlagIcon code={team.code} size={28} />
                    <div>
                        <h2>{team.name}</h2>
                        <span className="sidebar-subtitle">小组 {team.group}</span>
                    </div>
                </div>
                <button className="sidebar-close" onClick={onClose} aria-label="清除选择">
                    ✕
                </button>
            </div>

            {/* Schedule */}
            <div className="sidebar-matches">
                <h3>小组赛行程 ({sortedMatches.length} 场)</h3>
                {sortedMatches.length === 0 ? (
                    <p className="no-matches">暂无比赛数据</p>
                ) : (
                    <ul className="match-list">
                        {sortedMatches.map((match, index) => {
                            const team1 = getTeamDisplay(match.team1, teams);
                            const team2 = getTeamDisplay(match.team2, teams);
                            const { date, time } = formatDateTime(match.datetime);
                            const cityName = getCityName(match.cityId, cities);
                            const isHomeTeam = match.team1 === team.code;

                            return (
                                <li key={match.id} className="match-item schedule-item">
                                    <div className="match-header">
                                        <span className="match-number">第 {index + 1} 场</span>
                                        <span className="match-venue">📍 {cityName}</span>
                                    </div>
                                    <div className="match-teams">
                                        <span className={`team ${isHomeTeam ? 'highlight-team' : ''}`}>
                                            <FlagIcon code={team1.code} size={20} />
                                            <span className="team-name">{team1.name}</span>
                                        </span>
                                        <span className="vs">VS</span>
                                        <span className={`team ${!isHomeTeam ? 'highlight-team' : ''}`}>
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
