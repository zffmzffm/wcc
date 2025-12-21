'use client';
import { useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { City, Match, Team } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { getCountryCode, formatDateTimeWithTimezone } from '@/utils/formatters';
import SidebarLayout from './SidebarLayout';
import MatchItem from './MatchItem';
import FlagIcon from './FlagIcon';

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

// Stage display names
const stageNames: Record<string, string> = {
    'R32': 'Round of 32',
    'R16': 'Round of 16',
    'QF': 'Quarter-Final',
    'SF': 'Semi-Final',
    'F': 'Final',
    '3P': 'Third Place'
};

interface CitySidebarProps {
    city: City | null;
    matches: Match[];
    knockoutVenues?: KnockoutVenue[];
    teams: Team[];
    timezone: string;
    onClose: () => void;
}

export default function CitySidebar({ city, matches, knockoutVenues = [], teams, timezone, onClose }: CitySidebarProps) {
    // Ref to the sidebar container for scroll reset
    const sidebarRef = useRef<HTMLElement>(null);

    // Reset scroll position to top when city changes
    useEffect(() => {
        if (city && sidebarRef.current) {
            sidebarRef.current.scrollTop = 0;
        }
    }, [city?.id]);

    // Memoize sorted group stage matches to avoid re-sorting on every render
    const sortedMatches = useMemo(() => {
        return [...matches].sort((a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
    }, [matches]);

    // Memoize sorted knockout matches
    const sortedKnockoutVenues = useMemo(() => {
        return [...knockoutVenues].sort((a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
    }, [knockoutVenues]);

    const countryCode = city ? getCountryCode(city.country) : '';

    return (
        <SidebarLayout
            ref={sidebarRef}
            position="left"
            ariaLabel={city ? `${city.name} City Information` : 'City Information'}
            iconCode={countryCode}
            title={city?.name || ''}
            showPlaceholder={!city}
            placeholder={{
                icon: '🏟️',
                line1: 'Click a city on the map',
                line2: 'to view venue and match info'
            }}
            onClose={onClose}
        >
            {city && (
                <>
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

                    {/* Group Stage Matches */}
                    {sortedMatches.length > 0 && (
                        <div className="sidebar-matches">
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
                        </div>
                    )}

                    {/* Knockout Stage Matches */}
                    {sortedKnockoutVenues.length > 0 && (
                        <div className="sidebar-matches">
                            <ul className="match-list" role="list">
                                {sortedKnockoutVenues.map(venue => {
                                    const { date, time } = formatDateTimeWithTimezone(venue.datetime, timezone);
                                    return (
                                        <li key={venue.matchId} className="match-item" role="listitem">
                                            <div className="match-header">
                                                <span className="match-group knockout-stage">
                                                    {stageNames[venue.stage] || venue.stage}
                                                </span>
                                                <span className="match-datetime">
                                                    <span className="match-date">{date}</span>
                                                    <span className="match-time">{time}</span>
                                                </span>
                                            </div>
                                            <div className="match-teams">
                                                <span className="team">
                                                    <FlagIcon code="TBD" size={20} />
                                                    <span className="team-name">TBD</span>
                                                </span>
                                                <span className="vs">VS</span>
                                                <span className="team">
                                                    <FlagIcon code="TBD" size={20} />
                                                    <span className="team-name">TBD</span>
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* No matches message */}
                    {sortedMatches.length === 0 && sortedKnockoutVenues.length === 0 && (
                        <div className="sidebar-matches">
                            <p className="no-matches">No match data available</p>
                        </div>
                    )}
                </>
            )}
        </SidebarLayout>
    );
}
