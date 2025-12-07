'use client';
import { Match, Team, City } from '@/types';
import { formatDateTime, getTeamDisplay } from '@/utils/formatters';
import FlagIcon from './FlagIcon';

interface TeamScheduleSidebarProps {
    team: Team | null;
    matches: Match[];
    teams: Team[];
    cities: City[];
    onClose: () => void;
}

const getCityName = (cityId: string, cities: City[]): string => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : cityId;
};

export default function TeamScheduleSidebar({ team, matches, teams, cities, onClose }: TeamScheduleSidebarProps) {
    if (!team) {
        return (
            <aside className="sidebar sidebar-right" role="complementary" aria-label="球队信息侧边栏">
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
        <aside className="sidebar sidebar-right" role="complementary" aria-label={`${team.name} 球队行程`}>
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
                    <ul className="match-list" role="list">
                        {sortedMatches.map((match, index) => {
                            const team1 = getTeamDisplay(match.team1, teams);
                            const team2 = getTeamDisplay(match.team2, teams);
                            const { date, time } = formatDateTime(match.datetime);
                            const cityName = getCityName(match.cityId, cities);
                            const isHomeTeam = match.team1 === team.code;

                            return (
                                <li key={match.id} className="match-item schedule-item" role="listitem">
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
