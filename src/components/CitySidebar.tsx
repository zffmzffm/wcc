'use client';
import { useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { City, Match, Team } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { getCountryCode, formatDateTimeWithTimezone } from '@/utils/formatters';
import { getDayDifference, formatMatchDayDate, getTodayOrTargetMatchDay } from '@/utils/dateUtils';
import { getScoreDisplay } from '@/utils/score';
import { resolveKnockoutMatchup, isTeamKnockoutEliminated } from '@/utils/knockoutResults';
import { STAGE_NAMES, TOURNAMENT_START } from '@/constants';
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



// Format match day display
function formatMatchDayHeader(dateStr: string): { dateDisplay: string; dayNum: number } {
    // Parse the date parts directly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dateDisplay = `${monthNames[month - 1]} ${day}`;

    // Calculate tournament day number
    const startParts = TOURNAMENT_START.split('-').map(Number);
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
    allMatchDays?: string[];
    onClose: () => void;
    onTeamSelect?: (teamCode: string) => void;
    onCitySelect?: (cityId: string) => void;
    onDaySelect?: (day: string) => void;
}

export default function CitySidebar({
    city,
    matches,
    knockoutVenues = [],
    teams,
    cities = [],
    timezone,
    selectedDay,
    allMatchDays = [],
    onClose,
    onTeamSelect,
    onCitySelect,
    onDaySelect
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

    // Handle Escape key to close
    useEffect(() => {
        if (!hasContent) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [hasContent, onClose]);

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

    const teamsByCode = useMemo(() => new Map(teams.map(team => [team.code, team])), [teams]);

    // Get city name by ID helper
    const getCityName = (cityId: string): string => {
        const foundCity = cities.find(c => c.id === cityId);
        return foundCity?.name || cityId;
    };

    const renderKnockoutSide = (side?: string, handleTeamSelect?: (code: string) => void) => {
        const label = side || 'TBD';
        const resolvedTeam = teamsByCode.get(label);
        const isClickable = !!resolvedTeam && !!handleTeamSelect;

        return (
            <span
                className={`team${isClickable ? ' team-clickable' : ''}`}
                onClick={isClickable ? (e) => { e.stopPropagation(); handleTeamSelect!(resolvedTeam!.code); } : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
            >
                {resolvedTeam && <FlagIcon code={resolvedTeam.code} size={18} />}
                <span className="team-name">{resolvedTeam?.name || label}</span>
            </span>
        );
    };

    const countryCode = city ? getCountryCode(city.country) : '';

    // Match day mode header info
    const matchDayInfo = selectedDay ? formatMatchDayHeader(selectedDay) : null;

    const currentDayIndex = selectedDay ? allMatchDays.indexOf(selectedDay) : -1;
    const prevDay = currentDayIndex > 0 ? allMatchDays[currentDayIndex - 1] : null;
    const nextDay = currentDayIndex >= 0 && currentDayIndex < allMatchDays.length - 1 ? allMatchDays[currentDayIndex + 1] : null;

    const matchDayTitleNode = matchDayInfo ? (
        <div className="matchday-title-nav">
            {onDaySelect && (
                <button
                    className="matchday-nav-btn"
                    onClick={() => prevDay && onDaySelect(prevDay)}
                    disabled={!prevDay}
                    aria-label="Previous match day"
                >
                    ◀
                </button>
            )}
            <span>{matchDayInfo.dateDisplay}</span>
            {onDaySelect && (
                <button
                    className="matchday-nav-btn"
                    onClick={() => nextDay && onDaySelect(nextDay)}
                    disabled={!nextDay}
                    aria-label="Next match day"
                >
                    ▶
                </button>
            )}
        </div>
    ) : '';

    // Determine sidebar props based on mode
    const sidebarProps = isMatchDayMode ? {
        ariaLabel: `Match Day ${matchDayInfo?.dayNum} Information`,
        iconCode: undefined,
        title: matchDayTitleNode,
        badge: onDaySelect ? (
            <button
                type="button"
                className="team-group-badge back-to-today-btn"
                onClick={() => {
                    const targetDay = getTodayOrTargetMatchDay(allMatchDays);
                    if (targetDay) onDaySelect(targetDay);
                }}
                title="Back to Today"
            >
                Back to Today
            </button>
        ) : <span className="team-group-badge">Day {matchDayInfo?.dayNum}</span>,
        showClose: false,
        showPlaceholder: false,
    } : {
        ariaLabel: city ? `${city.name} City Information` : 'City Information',
        iconCode: countryCode,
        title: city?.name || '',
        badge: undefined,
        showClose: true,
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
            showClose={sidebarProps.showClose}
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
                                        onTeamSelect={onTeamSelect}
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
                                    const { date: tzDate, time } = formatDateTimeWithTimezone(venue.datetime, timezone);
                                    const dayDiff = getDayDifference(venue.datetime, timezone);
                                    const timeDisplay = dayDiff !== 0 ? `${time} (${dayDiff > 0 ? '+' : ''}${dayDiff})` : time;
                                    const date = dayDiff !== 0 ? formatMatchDayDate(venue.datetime) : tzDate;
                                    const parts = resolveKnockoutMatchup(venue.matchId, venue.matchup);
                                    const scoreDisplay = getScoreDisplay(venue.score);
                                    // Only gray future (unplayed) matches involving eliminated teams
                                    const isEliminated = !scoreDisplay.isScored && parts.some(p => isTeamKnockoutEliminated(p));

                                    return (
                                        <li key={venue.matchId} className={`match-item${isEliminated ? ' match-item-eliminated' : ''}`} role="listitem">
                                            <div className="match-header">
                                                <span className="match-group knockout-stage">
                                                    {STAGE_NAMES.full[venue.stage as keyof typeof STAGE_NAMES.full] || venue.stage}
                                                </span>
                                                <span className="match-datetime">
                                                    <span className="match-date">{date}</span>
                                                    <span className="match-time">{timeDisplay}</span>
                                                </span>
                                            </div>
                                            <div className="match-teams">
                                                {renderKnockoutSide(parts[0], onTeamSelect)}
                                                <span
                                                    className={`vs${scoreDisplay.isScored ? ' is-scored' : ''}`}
                                                    aria-label={scoreDisplay.ariaLabel}
                                                >
                                                    {scoreDisplay.label}
                                                </span>
                                                {renderKnockoutSide(parts[1], onTeamSelect)}
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
                                        cityId={match.cityId}
                                        onTeamSelect={onTeamSelect}
                                        onCitySelect={onCitySelect}
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
                                    const dayDiff = getDayDifference(venue.datetime, timezone);
                                    const timeDisplay = dayDiff !== 0 ? `${time} (${dayDiff > 0 ? '+' : ''}${dayDiff})` : time;
                                    const parts = resolveKnockoutMatchup(venue.matchId, venue.matchup);
                                    const scoreDisplay = getScoreDisplay(venue.score);
                                    // Only gray future (unplayed) matches involving eliminated teams
                                    const isEliminated = !scoreDisplay.isScored && parts.some(p => isTeamKnockoutEliminated(p));
                                    return (
                                        <li key={venue.matchId} className={`match-item${isEliminated ? ' match-item-eliminated' : ''}`} role="listitem">
                                            <div className="match-header">
                                                <span className="match-group knockout-stage">
                                                    {STAGE_NAMES.full[venue.stage as keyof typeof STAGE_NAMES.full] || venue.stage}
                                                </span>
                                                <span className="match-datetime">
                                                    <span className="match-venue">📍 {getCityName(venue.cityId)}</span>
                                                    <span className="match-time">{timeDisplay}</span>
                                                </span>
                                            </div>
                                            <div className="match-teams">
                                                {(() => {
                                                    const parts = resolveKnockoutMatchup(venue.matchId, venue.matchup);
                                                    const scoreDisplay = getScoreDisplay(venue.score);
                                                    return (
                                                        <>
                                                            {renderKnockoutSide(parts[0], onTeamSelect)}
                                                            <span
                                                                className={`vs${scoreDisplay.isScored ? ' is-scored' : ''}`}
                                                                aria-label={scoreDisplay.ariaLabel}
                                                            >
                                                                {scoreDisplay.label}
                                                            </span>
                                                            {renderKnockoutSide(parts[1], onTeamSelect)}
                                                        </>
                                                    );
                                                })()}
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
