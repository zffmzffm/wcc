import type { Metadata } from 'next';
import Link from 'next/link';
import { cities, matches, teams } from '@/data';
import FlagIcon from '@/components/FlagIcon';
import { getScoreDisplay } from '@/utils/score';
import { cityIdToSlug, teamNameToSlug } from '@/utils/slugs';
import '@/styles/landing.css';

/**
 * Generate static params for all 48 teams
 */
export function generateStaticParams() {
    return teams.map((team) => ({
        slug: teamNameToSlug(team.name),
    }));
}

/**
 * Find team by slug (reverse lookup)
 */
function findTeamBySlug(slug: string) {
    return teams.find((t) => teamNameToSlug(t.name) === slug);
}

/**
 * Generate SEO metadata per team
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const team = findTeamBySlug(slug);

    if (!team) {
        return { title: 'Team Not Found | Cup26Map' };
    }

    const teamMatches = matches.filter((m) => m.team1 === team.code || m.team2 === team.code);
    const matchCount = teamMatches.length;
    const citiesPlayed = new Set(teamMatches.map((m) => m.cityId));

    const title = `${team.name} World Cup 2026 Schedule – Group ${team.group} Matches | Cup26Map`;
    const description = `${team.name}'s complete World Cup 2026 group stage schedule. ${matchCount} matches in Group ${team.group} across ${citiesPlayed.size} cities. View kickoff times, opponents, venues, and travel path on Cup26Map.`;

    return {
        title,
        description,
        keywords: [
            `${team.name} World Cup 2026`,
            `${team.name} World Cup schedule`,
            `${team.name} Group ${team.group}`,
            `${team.name} World Cup 2026 fixtures`,
            `${team.name} FIFA World Cup`,
            `World Cup 2026 Group ${team.group}`,
            'Cup26Map',
        ],
        alternates: {
            canonical: `/team/${teamNameToSlug(team.name)}`,
        },
        openGraph: {
            title: `${team.name} – World Cup 2026 Schedule | Cup26Map`,
            description,
            type: 'website',
            siteName: 'Cup26Map',
            url: `https://cup26map.com/team/${teamNameToSlug(team.name)}`,
            images: [
                {
                    url: 'https://cup26map.com/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: `${team.name} World Cup 2026 group stage schedule`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${team.name} World Cup 2026 Schedule – Group ${team.group} | Cup26Map`,
            description,
        },
    };
}

/**
 * Format a datetime string
 */
function formatMatchDate(datetime: string): { month: string; day: string; time: string; fullDate: string } {
    const d = new Date(datetime);
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return {
        month: monthsShort[d.getMonth()],
        day: d.getDate().toString(),
        time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' }),
        fullDate: `${monthsFull[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    };
}

/**
 * Get team name from code
 */
function getTeamName(code: string): string {
    const team = teams.find((t) => t.code === code);
    return team ? team.name : code;
}

function TeamFlagLabel({ code, name, size = 18 }: { code: string; name?: string; size?: number }) {
    return (
        <span className="landing-team-label">
            <FlagIcon code={code} size={size} />
            <span>{name ?? getTeamName(code)}</span>
        </span>
    );
}

/**
 * Get city name by ID
 */
function getCityName(cityId: string): string {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.name : cityId;
}

/**
 * Get venue name by city ID
 */
function getVenueName(cityId: string): string {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.venue : '';
}

export default async function TeamLandingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const team = findTeamBySlug(slug);

    if (!team) {
        return (
            <div className="landing-page">
                <div className="landing-content">
                    <h1>Team not found</h1>
                    <p>
                        <Link href="/">← Back to Cup26Map</Link>
                    </p>
                </div>
            </div>
        );
    }

    const teamMatches = matches
        .filter((m) => m.team1 === team.code || m.team2 === team.code)
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    // Cities this team travels to (in order)
    const travelCities: string[] = [];
    teamMatches.forEach((m) => {
        if (!travelCities.includes(m.cityId)) {
            travelCities.push(m.cityId);
        }
    });

    // Group mates
    const groupTeams = teams.filter((t) => t.group === team.group && t.code !== team.code);

    // Structured data
    const eventsJsonLd = teamMatches.map((m) => ({
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: `${getTeamName(m.team1)} vs ${getTeamName(m.team2)} – World Cup 2026`,
        startDate: m.datetime,
        location: {
            '@type': 'Place',
            name: getVenueName(m.cityId),
            address: {
                '@type': 'PostalAddress',
                addressLocality: getCityName(m.cityId),
            },
        },
        homeTeam: { '@type': 'SportsTeam', name: getTeamName(m.team1) },
        awayTeam: { '@type': 'SportsTeam', name: getTeamName(m.team2) },
        eventStatus: 'https://schema.org/EventScheduled',
        organizer: { '@type': 'Organization', name: 'FIFA' },
    }));

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Cup26Map', item: 'https://cup26map.com' },
            { '@type': 'ListItem', position: 2, name: team.name, item: `https://cup26map.com/team/${teamNameToSlug(team.name)}` },
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
                        <span>Teams</span>
                        <span>›</span>
                        <span>{team.name}</span>
                    </nav>
                    <span className="landing-flag" aria-label={`${team.name} flag`}>
                        <FlagIcon code={team.code} size={64} />
                    </span>
                    <h1>{team.name} – World Cup 2026 Schedule</h1>
                    <p className="landing-hero-subtitle">
                        Group {team.group} · {teamMatches.length} group stage matches across {travelCities.length} cities
                    </p>
                    <div className="landing-hero-meta">
                        <span className="landing-hero-meta-item">
                            <span className="landing-hero-meta-icon">⚽</span>
                            Group {team.group}
                        </span>
                        <span className="landing-hero-meta-item">
                            <span className="landing-hero-meta-icon">📅</span>
                            {teamMatches.length} matches
                        </span>
                        <span className="landing-hero-meta-item">
                            <span className="landing-hero-meta-icon">🗺️</span>
                            {travelCities.length} cities
                        </span>
                    </div>
                    <Link href={`/?team=${team.code}`} className="landing-cta">
                        View on Interactive Map
                        <span className="landing-cta-arrow">→</span>
                    </Link>
                </div>
            </section>

            {/* Match schedule */}
            <div className="landing-content">
                <section className="landing-section">
                    <h2>{team.name} Match Schedule</h2>
                    <p className="landing-section-desc">
                        {team.name}&#39;s complete World Cup 2026 group stage schedule in Group {team.group}.
                        Times shown in Eastern Time (ET).
                    </p>
                    <div className="landing-matches">
                        {teamMatches.map((m) => {
                            const date = formatMatchDate(m.datetime);
                            const opponent = m.team1 === team.code ? m.team2 : m.team1;
                            const isHome = m.team1 === team.code;
                            const scoreDisplay = getScoreDisplay(m.score);
                            return (
                                <article key={m.id} className="landing-match-card">
                                    <div className="landing-match-date">
                                        <div className="landing-match-date-month">{date.month}</div>
                                        <div className="landing-match-date-day">{date.day}</div>
                                    </div>
                                    <div className="landing-match-divider" />
                                    <div className="landing-match-info">
                                        <div className="landing-match-teams">
                                            {isHome ? (
                                                <>
                                                    <TeamFlagLabel code={team.code} name={team.name} />
                                                    <span
                                                        className={`landing-match-vs${scoreDisplay.isScored ? ' is-scored' : ''}`}
                                                        aria-label={scoreDisplay.ariaLabel}
                                                    >
                                                        {scoreDisplay.label}
                                                    </span>
                                                    <TeamFlagLabel code={opponent} />
                                                </>
                                            ) : (
                                                <>
                                                    <TeamFlagLabel code={m.team1} />
                                                    <span
                                                        className={`landing-match-vs${scoreDisplay.isScored ? ' is-scored' : ''}`}
                                                        aria-label={scoreDisplay.ariaLabel}
                                                    >
                                                        {scoreDisplay.label}
                                                    </span>
                                                    <TeamFlagLabel code={team.code} name={team.name} />
                                                </>
                                            )}
                                        </div>
                                        <div className="landing-match-detail">
                                            {date.time} ET · {getCityName(m.cityId)} · {getVenueName(m.cityId)}
                                        </div>
                                    </div>
                                    <span className="landing-match-group">Group {m.group}</span>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* Travel path */}
                <section className="landing-section">
                    <h2>{team.name}&#39;s Travel Path</h2>
                    <p className="landing-section-desc">
                        {team.name} travels across {travelCities.length} cities during the group stage. View their flight path on Cup26Map&#39;s interactive map.
                    </p>
                    <div className="landing-cities-list">
                        {travelCities.map((cityId, i) => (
                            <Link
                                key={cityId}
                                href={`/city/${cityIdToSlug(cityId)}`}
                                className="landing-city-tag"
                            >
                                {i > 0 && '→ '}📍 {getCityName(cityId)}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Group mates */}
                <section className="landing-section">
                    <h2>Group {team.group} Teams</h2>
                    <p className="landing-section-desc">
                        {team.name} is drawn in Group {team.group} alongside {groupTeams.map(t => t.name).join(', ')}.
                    </p>
                    <div className="landing-cities-list">
                        {groupTeams.map((t) => (
                            <Link
                                key={t.code}
                                href={`/team/${teamNameToSlug(t.name)}`}
                                className="landing-city-tag"
                            >
                                <FlagIcon code={t.code} size={18} />
                                <span>{t.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            {/* Bottom CTA */}
            <section className="landing-bottom-cta">
                <h2>Track {team.name}&#39;s World Cup 2026 Journey</h2>
                <p>View flight paths, match schedule, and timezone converter on the interactive map.</p>
                <Link href={`/?team=${team.code}`} className="landing-cta">
                    View {team.name} on Cup26Map
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
