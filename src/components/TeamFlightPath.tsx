'use client';
import { useState, useEffect, useMemo } from 'react';
import { Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Match, Team } from './CityPopup';
import { City } from './CityMarker';
import { LatLngTuple } from 'leaflet';

interface TeamFlightPathProps {
    teamCode: string;
    matches: Match[];
    cities: City[];
    teams: Team[];
}

interface MatchWithCoords {
    match: Match;
    coords: LatLngTuple;
    city: City;
}

// 格式化日期时间
const formatDateTime = (datetime: string): { date: string; time: string } => {
    const d = new Date(datetime);
    const date = d.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
    });
    const time = d.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return { date, time };
};

// 获取对手球队信息
const getOpponent = (match: Match, teamCode: string, teams: Team[]): { name: string; flag: string } => {
    const opponentCode = match.team1 === teamCode ? match.team2 : match.team1;
    const team = teams.find(t => t.code === opponentCode);
    return team ? { name: team.name, flag: team.flag } : { name: opponentCode, flag: '🏳️' };
};

export default function TeamFlightPath({ teamCode, matches, cities, teams }: TeamFlightPathProps) {
    const [visibleCount, setVisibleCount] = useState(0);
    const map = useMap();

    // 计算球队的比赛，按时间排序
    const teamMatches: MatchWithCoords[] = useMemo(() => {
        return matches
            .filter(m => m.team1 === teamCode || m.team2 === teamCode)
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            .map(match => {
                const city = cities.find(c => c.id === match.cityId);
                return city ? {
                    match,
                    coords: [city.lat, city.lng] as LatLngTuple,
                    city
                } : null;
            })
            .filter((item): item is MatchWithCoords => item !== null);
    }, [teamCode, matches, cities]);

    // 获取当前球队信息
    const currentTeam = useMemo(() => teams.find(t => t.code === teamCode), [teams, teamCode]);

    // 当球队改变时重置动画
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset state when teamCode prop changes
        setVisibleCount(0);
    }, [teamCode]);

    // 调整地图视角
    useEffect(() => {
        if (teamMatches.length === 0) return;

        const bounds = teamMatches.map(m => m.coords);
        if (bounds.length > 0) {
            try {
                map.fitBounds(bounds, { padding: [80, 80], maxZoom: 5 });
            } catch (e) {
                console.warn('Failed to fit bounds:', e);
            }
        }
    }, [teamCode, teamMatches, map]);

    // 动画逐步展示
    useEffect(() => {
        if (teamMatches.length === 0) return;

        if (visibleCount < teamMatches.length) {
            const timer = setTimeout(() => {
                setVisibleCount(prev => prev + 1);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [teamMatches.length, visibleCount]);

    if (teamMatches.length === 0) {
        return null;
    }

    // 获取可见的坐标
    const visiblePath = teamMatches.slice(0, visibleCount).map(m => m.coords);

    return (
        <>
            {/* 飞行路线 - 虚线效果 */}
            {visiblePath.length > 1 && (
                <Polyline
                    positions={visiblePath}
                    pathOptions={{
                        color: '#f59e0b',
                        weight: 4,
                        dashArray: '10, 8',
                        opacity: 0.85
                    }}
                />
            )}

            {/* 比赛落脚点 */}
            {visiblePath.map((pos, i) => {
                const matchInfo = teamMatches[i];
                if (!matchInfo) return null;

                const { match, city } = matchInfo;
                const opponent = getOpponent(match, teamCode, teams);
                const { date, time } = formatDateTime(match.datetime);
                const isLatest = i === visibleCount - 1;

                return (
                    <CircleMarker
                        key={`marker-${match.id}`}
                        center={pos}
                        radius={isLatest ? 14 : 10}
                        pathOptions={{
                            color: '#fff',
                            weight: 3,
                            fillColor: isLatest ? '#f59e0b' : '#7c3aed',
                            fillOpacity: 0.95
                        }}
                    >
                        <Popup className="match-popup">
                            <div className="flight-popup">
                                <div className="flight-popup-header">
                                    <span className="match-number">比赛 {i + 1}</span>
                                    <span className="match-group-badge">小组 {match.group}</span>
                                </div>
                                <div className="flight-popup-venue">
                                    🏟️ {city.name} - {city.venue}
                                </div>
                                <div className="flight-popup-teams">
                                    <span className="team-info">
                                        <span className="team-flag">{currentTeam?.flag}</span>
                                        <span className="team-name">{currentTeam?.name}</span>
                                    </span>
                                    <span className="vs">VS</span>
                                    <span className="team-info">
                                        <span className="team-flag">{opponent.flag}</span>
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
            })}
        </>
    );
}
