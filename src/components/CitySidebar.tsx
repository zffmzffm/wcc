'use client';
import { City, Match, Team } from '@/types';
import { formatDateTimeWithTimezone, getTeamDisplay, getCountryCode } from '@/utils/formatters';
import FlagIcon from './FlagIcon';
import Image from 'next/image';

// Map city IDs to venue images (when available)
const venueImages: Record<string, string> = {
    'atlanta': '/venues/atlanta.jpg',
    'boston': '/venues/boston.jpg',
    'dallas': '/venues/dallas.jpg',
    'guadalajara': '/venues/guadalajara.jpg',
    'houston': '/venues/houston.jpg',
    'kansas_city': '/venues/kansas_city.jpg',
    'los_angeles': '/venues/los_angeles.jpg',
    'mexico_city': '/venues/mexico_city.jpg',
    'miami': '/venues/miami.jpg',
    'monterrey': '/venues/monterrey.jpg',
    'new_york': '/venues/new_york.jpg',
    'philadelphia': '/venues/philadelphia.jpg',
    'san_francisco': '/venues/san_francisco.jpg',
    'seattle': '/venues/seattle.jpg',
    'toronto': '/venues/toronto.jpg',
    'vancouver': '/venues/vancouver.jpg',
};

interface CitySidebarProps {
    city: City | null;
    matches: Match[];
    teams: Team[];
    timezone: string;
    onClose: () => void;
}

export default function CitySidebar({ city, matches, teams, timezone, onClose }: CitySidebarProps) {
    if (!city) {
        return (
            <aside className="sidebar" role="complementary" aria-label="城市信息侧边栏">
                <div className="sidebar-placeholder">
                    <span className="sidebar-placeholder-icon">🏟️</span>
                    <p>点击地图上的城市</p>
                    <p>查看场馆和比赛信息</p>
                </div>
            </aside>
        );
    }

    const countryCode = getCountryCode(city.country);

    return (
        <aside className="sidebar" role="complementary" aria-label={`${city.name} 城市信息`}>
            {/* Header */}
            <div className="sidebar-header sidebar-header-compact">
                <div className="sidebar-title">
                    <FlagIcon code={countryCode} size={28} />
                    <h2>{city.name}</h2>
                </div>
                <button className="sidebar-close" onClick={onClose} aria-label="关闭侧边栏">
                    ✕
                </button>
            </div>

            {/* Venue Card - Info + Image merged */}
            <div className="sidebar-venue-card">
                <div className="sidebar-venue">
                    <span className="venue-name">🏟️ {city.venue}</span>
                    <span className="venue-capacity">{city.capacity.toLocaleString()} 人</span>
                </div>
                {venueImages[city.id] && (
                    <div className="sidebar-venue-image">
                        <Image
                            src={venueImages[city.id]}
                            alt={`${city.venue} 体育场`}
                            width={600}
                            height={360}
                            style={{ width: '100%', height: 'auto' }}
                            priority={false}
                        />
                    </div>
                )}
            </div>
            {/* Matches List */}
            <div className="sidebar-matches">
                {matches.length === 0 ? (
                    <p className="no-matches">暂无比赛数据</p>
                ) : (
                    <ul className="match-list" role="list">
                        {[...matches].sort((a, b) =>
                            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
                        ).map(match => {
                            const team1 = getTeamDisplay(match.team1, teams);
                            const team2 = getTeamDisplay(match.team2, teams);
                            const { date, time } = formatDateTimeWithTimezone(match.datetime, timezone);

                            return (
                                <li key={match.id} className="match-item" role="listitem">
                                    <div className="match-header">
                                        <span className="match-group">小组 {match.group}</span>
                                        <span className="match-datetime">
                                            <span className="match-date">{date}</span>
                                            <span className="match-time">{time}</span>
                                        </span>
                                    </div>
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
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}
