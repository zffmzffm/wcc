import type { Metadata } from 'next';
import Link from 'next/link';
import { cities, matches, teams } from '@/data';
import knockoutVenuesData from '@/data/knockoutVenues.json';
import type { Match } from '@/types';
import type { KnockoutVenue } from '@/repositories/types';
import { getScoreDisplay } from '@/utils/score';
import { cityIdToSlug, slugToCityId, teamNameToSlug } from '@/utils/slugs';
import '@/styles/landing.css';

const knockoutVenues = Object.values(knockoutVenuesData).flat() as KnockoutVenue[];

type CityScheduleEvent =
    | { kind: 'group'; id: string; datetime: string; match: Match }
    | { kind: 'knockout'; id: string; datetime: string; venue: KnockoutVenue };

const stageLabels: Record<KnockoutVenue['stage'], string> = {
    R32: 'Round of 32',
    R16: 'Round of 16',
    QF: 'Quarter-final',
    SF: 'Semi-final',
    F: 'Final',
    '3P': 'Third-place playoff',
};

function getKnockoutStageLabel(stage: KnockoutVenue['stage']): string {
    return stageLabels[stage];
}

function getCityScheduleEvents(cityId: string): CityScheduleEvent[] {
    const groupEvents: CityScheduleEvent[] = matches
        .filter((m) => m.cityId === cityId)
        .map((match) => ({
            kind: 'group',
            id: `group-${match.id}`,
            datetime: match.datetime,
            match,
        }));

    const knockoutEvents: CityScheduleEvent[] = knockoutVenues
        .filter((venue) => venue.cityId === cityId)
        .map((venue) => ({
            kind: 'knockout',
            id: `knockout-${venue.matchId}`,
            datetime: venue.datetime,
            venue,
        }));

    return [...groupEvents, ...knockoutEvents]
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

function formatCityMatchSummary(groupMatchCount: number, knockoutMatchCount: number): string {
    if (knockoutMatchCount === 0) {
        return `${groupMatchCount} group stage matches`;
    }

    const totalMatchCount = groupMatchCount + knockoutMatchCount;
    return `${totalMatchCount} matches (${groupMatchCount} group stage, ${knockoutMatchCount} knockout)`;
}

/**
 * Generate static params for all 16 cities
 */
export function generateStaticParams() {
    return cities.map((city) => ({
        slug: cityIdToSlug(city.id),
    }));
}

/**
 * Generate SEO metadata per city
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const cityId = slugToCityId(slug);
    const city = cities.find((c) => c.id === cityId);

    if (!city) {
        return { title: 'City Not Found | Cup26Map' };
    }

    const groupMatchCount = matches.filter((m) => m.cityId === city.id).length;
    const knockoutMatchCount = knockoutVenues.filter((v) => v.cityId === city.id).length;
    const matchCount = groupMatchCount + knockoutMatchCount;
    const matchSummary = formatCityMatchSummary(groupMatchCount, knockoutMatchCount);

    const title = `World Cup 2026 in ${city.name} – ${matchCount} Matches at ${city.venue} | Cup26Map`;
    const description = `View all ${matchCount} World Cup 2026 matches at ${city.venue} in ${city.name}, ${city.country}: ${matchSummary}. Kickoff times, teams, bracket placeholders, and interactive map on Cup26Map.`;

    return {
        title,
        description,
        keywords: [
            `World Cup 2026 ${city.name}`,
            `${city.venue} World Cup`,
            `World Cup matches ${city.name}`,
            `${city.name} World Cup 2026 schedule`,
            `${city.venue} schedule 2026`,
            `FIFA World Cup ${city.name}`,
            'Cup26Map',
        ],
        alternates: {
            canonical: `/city/${cityIdToSlug(city.id)}`,
        },
        openGraph: {
            title: `World Cup 2026 in ${city.name} – ${city.venue} Schedule`,
            description,
            type: 'website',
            siteName: 'Cup26Map',
            url: `https://cup26map.com/city/${cityIdToSlug(city.id)}`,
            images: [
                {
                    url: 'https://cup26map.com/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: `World Cup 2026 matches in ${city.name} at ${city.venue}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `World Cup 2026 in ${city.name} – ${matchCount} Matches | Cup26Map`,
            description,
        },
    };
}

/**
 * Format a datetime string to a human-readable date
 */
function formatMatchDate(datetime: string): { month: string; day: string; time: string; fullDate: string } {
    const d = new Date(datetime);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return {
        month: months[d.getMonth()],
        day: d.getDate().toString(),
        time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' }),
        fullDate: `${monthsFull[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    };
}

/**
 * Get the country flag emoji
 */
function getCountryFlag(countryCode: string): string {
    const flags: Record<string, string> = {
        'USA': '🇺🇸',
        'MEX': '🇲🇽',
        'CAN': '🇨🇦',
    };
    return flags[countryCode] || '🏟️';
}

/**
 * Get team name from code
 */
function getTeamName(code: string): string {
    const team = teams.find((t) => t.code === code);
    return team ? team.name : code;
}

/**
 * Get team flag from code
 */
function getTeamFlag(code: string): string {
    const team = teams.find((t) => t.code === code);
    return team ? team.flag : '';
}

export default async function CityLandingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cityId = slugToCityId(slug);
    const city = cities.find((c) => c.id === cityId);

    if (!city) {
        return (
            <div className="landing-page">
                <div className="landing-content">
                    <h1>City not found</h1>
                    <p>
                        <Link href="/">← Back to Cup26Map</Link>
                    </p>
                </div>
            </div>
        );
    }

    const cityGroupMatches = matches
        .filter((m) => m.cityId === city.id)
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    const cityKnockoutVenues = knockoutVenues
        .filter((v) => v.cityId === city.id)
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    const cityScheduleEvents = getCityScheduleEvents(city.id);
    const matchSummary = formatCityMatchSummary(cityGroupMatches.length, cityKnockoutVenues.length);

    // Unique teams playing in this city
    const teamCodes = new Set<string>();
    cityGroupMatches.forEach((m) => {
        teamCodes.add(m.team1);
        teamCodes.add(m.team2);
    });

    // Unique groups
    const groupSet = new Set(cityGroupMatches.map((m) => m.group));

    // Structured data: SportsEvent for each match
    const eventsJsonLd = cityScheduleEvents.map((event) => {
        const baseEvent = {
            '@context': 'https://schema.org',
            '@type': 'SportsEvent',
            startDate: event.datetime,
            location: {
                '@type': 'Place',
                name: city.venue,
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: city.name,
                    addressCountry: city.country,
                },
            },
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            organizer: { '@type': 'Organization', name: 'FIFA', url: 'https://www.fifa.com' },
        };

        if (event.kind === 'group') {
            return {
                ...baseEvent,
                name: `${getTeamName(event.match.team1)} vs ${getTeamName(event.match.team2)} – World Cup 2026`,
                homeTeam: { '@type': 'SportsTeam', name: getTeamName(event.match.team1) },
                awayTeam: { '@type': 'SportsTeam', name: getTeamName(event.match.team2) },
            };
        }

        return {
            ...baseEvent,
            name: `${getKnockoutStageLabel(event.venue.stage)}: ${event.venue.matchup || 'TBD'} – World Cup 2026`,
        };
    });

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Cup26Map', item: 'https://cup26map.com' },
            { '@type': 'ListItem', position: 2, name: city.name, item: `https://cup26map.com/city/${cityIdToSlug(city.id)}` },
        ],
    };

    return (
        <div className="landing-page">
            {/* Structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Hero */}
            <section className="landing-hero">
                <div className="landing-hero-inner">
                    <nav className="landing-breadcrumb" aria-label="Breadcrumb">
                        <Link href="/">Cup26Map</Link>
                        <span>›</span>
                        <span>Cities</span>
                        <span>›</span>
                        <span>{city.name}</span>
                    </nav>
                    <span className="landing-flag" role="img" aria-label={`${city.country} flag`}>
                        {getCountryFlag(city.countryCode)}
                    </span>
                    <h1>World Cup 2026 in {city.name}</h1>
                    <p className="landing-hero-subtitle">
                        {matchSummary} at {city.venue}
                        {teamCodes.size > 0 && ` — featuring ${teamCodes.size} national teams across ${groupSet.size} groups`}
                    </p>
                    <div className="landing-hero-meta">
                        <span className="landing-hero-meta-item">
                            <span className="landing-hero-meta-icon">🏟️</span>
                            {city.venue}
                        </span>
                        <span className="landing-hero-meta-item">
                            <span className="landing-hero-meta-icon">💺</span>
                            {city.capacity.toLocaleString()} capacity
                        </span>
                        <span className="landing-hero-meta-item">
                            <span className="landing-hero-meta-icon">📍</span>
                            {city.name}, {city.country}
                        </span>
                    </div>
                    <Link href={`/?city=${city.id}`} className="landing-cta">
                        View on Interactive Map
                        <span className="landing-cta-arrow">→</span>
                    </Link>
                </div>
            </section>

            {/* Match schedule */}
            <div className="landing-content">
                <section className="landing-section">
                    <h2>Match Schedule at {city.venue}</h2>
                    <p className="landing-section-desc">
                        All {cityScheduleEvents.length} World Cup 2026 matches scheduled at {city.venue} in {city.name}, including group stage and knockout fixtures where assigned.
                        Times shown in Eastern Time (ET).
                    </p>
                    <div className="landing-matches">
                        {cityScheduleEvents.map((event) => {
                            const date = formatMatchDate(event.datetime);
                            const scoreDisplay = getScoreDisplay(event.kind === 'group' ? event.match.score : event.venue.score);
                            const knockoutParts = event.kind === 'knockout'
                                ? (event.venue.matchup || 'TBD vs TBD').split(' vs ')
                                : null;
                            return (
                                <article key={event.id} className="landing-match-card">
                                    <div className="landing-match-date">
                                        <div className="landing-match-date-month">{date.month}</div>
                                        <div className="landing-match-date-day">{date.day}</div>
                                    </div>
                                    <div className="landing-match-divider" />
                                    <div className="landing-match-info">
                                        <div className="landing-match-teams">
                                            {event.kind === 'group' ? (
                                                <>
                                                    {getTeamFlag(event.match.team1)} {getTeamName(event.match.team1)}
                                                    <span
                                                        className={`landing-match-vs${scoreDisplay.isScored ? ' is-scored' : ''}`}
                                                        aria-label={scoreDisplay.ariaLabel}
                                                    >
                                                        {scoreDisplay.label}
                                                    </span>
                                                    {getTeamFlag(event.match.team2)} {getTeamName(event.match.team2)}
                                                </>
                                            ) : (
                                                <>
                                                    {getKnockoutStageLabel(event.venue.stage)}
                                                    <span className="landing-match-vs">·</span>
                                                    <span>{knockoutParts?.[0] || 'TBD'}</span>
                                                    <span
                                                        className={`landing-match-vs${scoreDisplay.isScored ? ' is-scored' : ''}`}
                                                        aria-label={scoreDisplay.ariaLabel}
                                                    >
                                                        {scoreDisplay.label}
                                                    </span>
                                                    <span>{knockoutParts?.[1] || 'TBD'}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="landing-match-detail">
                                            {date.time} ET · {date.fullDate}
                                        </div>
                                    </div>
                                    <span className="landing-match-group">
                                        {event.kind === 'group' ? `Group ${event.match.group}` : event.venue.stage}
                                    </span>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* Venue info */}
                <section className="landing-section">
                    <h2>About {city.venue}</h2>
                    <div className="landing-venue-card">
                        <span className="landing-venue-icon">🏟️</span>
                        <div className="landing-venue-info">
                            <h3>{city.venue}</h3>
                            <p>{city.name}, {city.country}</p>
                            <p>Capacity: {city.capacity.toLocaleString()} spectators</p>
                            <p>Hosting {cityScheduleEvents.length} World Cup 2026 matches</p>
                        </div>
                    </div>
                </section>

                {/* Teams playing here */}
                <section className="landing-section">
                    <h2>Teams Playing in {city.name}</h2>
                    <p className="landing-section-desc">
                        {teamCodes.size} national teams have confirmed group stage matches scheduled at {city.venue}. Knockout round participants will be determined during the tournament.
                    </p>
                    <div className="landing-cities-list">
                        {Array.from(teamCodes).map((code) => (
                            <Link
                                key={code}
                                href={`/team/${teamNameToSlug(getTeamName(code))}`}
                                className="landing-city-tag"
                            >
                                {getTeamFlag(code)} {getTeamName(code)}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            {/* Bottom CTA */}
            <section className="landing-bottom-cta">
                <h2>Explore the Full World Cup 2026 Schedule</h2>
                <p>Interactive map with all 104 matches across 16 host cities. Filter by team, city, or match day.</p>
                <Link href={`/?city=${city.id}`} className="landing-cta">
                    Open {city.name} on Cup26Map
                    <span className="landing-cta-arrow">→</span>
                </Link>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>
                    Presented by <a href="https://duoyj.ca" target="_blank" rel="noopener noreferrer">duoyj.ca</a> | © 2026 <Link href="/">Cup26Map</Link>. Unofficial fan project.
                </p>
            </footer>
        </div>
    );
}
