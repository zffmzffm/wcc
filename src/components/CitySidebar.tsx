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

// Tournament start date for Day X calculation (June 11, 2026)
const TOURNAMENT_START_STR = '2026-06-11';

// Format match day display
function formatMatchDayHeader(dateStr: string): { dateDisplay: string; dayNum: number } {
    // Parse the date parts directly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dateDisplay = `${monthNames[month - 1]} ${day}`;

    // Calculate tournament day number
    const startParts = TOURNAMENT_START_STR.split('-').map(Number);
    const startDate = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);
    const currentDate = Date.UTC(year, month - 1, day);
    const dayNum = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    return { dateDisplay, dayNum };
}

interface CitySidebarProps {
    city: City | null;
    matches: Match[];
    knockoutVenues?: KnockoutVenue[];
    teams: Team[];
    cities?: City[];  // For match day mode - to show venue names
    timezone: string;
    selectedDay?: string | null;  // ISO date string for match day mode
    onClose: () => void;
}

export default function CitySidebar({
    city,
    matches,
    knockoutVenues = [],
    teams,
    cities = [],
    timezone,
    selectedDay,
    onClose
}: CitySidebarProps) {
    // Ref to the sidebar container for scroll reset
    const sidebarRef = useRef<HTMLElement>(null);

    // Determine mode
    const isMatchDayMode = !!selectedDay && !city;
    const hasContent = city || isMatchDayMode;

    // Reset scroll position to top when city or day changes
    useEffect(() => {
        if (hasContent && sidebarRef.current) {
            sidebarRef.current.scrollTop = 0;
        }
    }, [city?.id, selectedDay, hasContent]);

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

    // Get city name by ID helper
    const getCityName = (cityId: string): string => {
        const foundCity = cities.find(c => c.id === cityId);
        return foundCity?.name || cityId;
    };

    const countryCode = city ? getCountryCode(city.country) : '';

    // Match day mode header info
    const matchDayInfo = selectedDay ? formatMatchDayHeader(selectedDay) : null;

    // Determine sidebar props based on mode
    const sidebarProps = isMatchDayMode ? {
        ariaLabel: `Match Day ${matchDayInfo?.dayNum} Information`,
        iconCode: undefined,
        title: matchDayInfo?.dateDisplay || '',
        badge: <span className="team-group-badge">Day {matchDayInfo?.dayNum}</span>,
        showPlaceholder: false,
    } : {
        ariaLabel: city ? `${city.name} City Information` : 'City Information',
        iconCode: countryCode,
        title: city?.name || '',
        badge: undefined,
        showPlaceholder: !city,
    };

    return (
        <SidebarLayout
            ref={sidebarRef}
            position="left"
            ariaLabel={sidebarProps.ariaLabel}
            iconCode={sidebarProps.iconCode}
            title={sidebarProps.title}
            showPlaceholder={sidebarProps.showPlaceholder}
            badge={sidebarProps.badge}
            placeholder={{
                icon: '🏟️',
                line1: 'Select a city or match day',
                line2: 'to view the schedule'
            }}
            onClose={onClose}
        >
            {/* City Mode Content */}
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

            {/* Match Day Mode Content */}
            {isMatchDayMode && (
                <>
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
                                        cityName={getCityName(match.cityId)}
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
                                    const { time } = formatDateTimeWithTimezone(venue.datetime, timezone);
                                    return (
                                        <li key={venue.matchId} className="match-item" role="listitem">
                                            <div className="match-header">
                                                <span className="match-group knockout-stage">
                                                    {stageNames[venue.stage] || venue.stage}
                                                </span>
                                                <span className="match-datetime">
                                                    <span className="match-venue">📍 {getCityName(venue.cityId)}</span>
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
                            <p className="no-matches">No matches on this day</p>
                        </div>
                    )}
                </>
            )}
        </SidebarLayout>
    );
}
