'use client';
import { useMemo } from 'react';
import { City, Match, Team } from '@/types';
import { getCountryCode } from '@/utils/formatters';
import FlagIcon from './FlagIcon';
import MatchItem from './MatchItem';
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
    // Memoize sorted matches to avoid re-sorting on every render
    const sortedMatches = useMemo(() => {
        return [...matches].sort((a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
    }, [matches]);

    if (!city) {
        return (
            <aside className="sidebar" role="complementary" aria-label="City Information">
                <div className="sidebar-placeholder">
                    <span className="sidebar-placeholder-icon">🏟️</span>
                    <p>Click a city on the map</p>
                    <p>to view venue and match info</p>
                </div>
            </aside>
        );
    }

    const countryCode = getCountryCode(city.country);

    return (
        <aside className="sidebar" role="complementary" aria-label={`${city.name} City Information`}>
            {/* Header */}
            <div className="sidebar-header sidebar-header-compact">
                <div className="sidebar-title">
                    <FlagIcon code={countryCode} size={28} />
                    <h2 style={{ color: '#2D3A2D' }}>{city.name}</h2>
                </div>
                <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
                    ✕
                </button>
            </div>

            {/* Venue Card - Info + Image merged */}
            <div className="sidebar-venue-card">
                <div className="sidebar-venue">
                    <span className="venue-name">🏟️ {city.venue}</span>
                    <span className="venue-capacity">{city.capacity.toLocaleString()} seats</span>
                </div>
                {venueImages[city.id] && (
                    <div className="sidebar-venue-image">
                        <Image
                            src={venueImages[city.id]}
                            alt={`${city.venue} Stadium`}
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
                {sortedMatches.length === 0 ? (
                    <p className="no-matches">No match data available</p>
                ) : (
                    <ul className="match-list" role="list">
                        {sortedMatches.map(match => (
                            <MatchItem
                                key={match.id}
                                match={match}
                                teams={teams}
                                timezone={timezone}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}

