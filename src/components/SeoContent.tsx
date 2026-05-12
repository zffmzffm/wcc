'use client';
import { memo } from 'react';

/**
 * SEO Content Section
 * 
 * This component provides crawlable, keyword-rich text content for search engines.
 * It's placed below the main interactive content (map) so it doesn't interfere
 * with the user experience, but is fully visible and indexable by crawlers.
 * 
 * Target keywords: "world cup schedule 2026 map", "world cup 2026 map",
 * "2026 world cup schedule"
 * 
 * Note: "FIFA" usage is minimized to 1 factual mention to avoid trademark concerns.
 * "World Cup 2026" alone carries the primary SEO weight.
 */
const SeoContent = memo(function SeoContent() {
    return (
        <section className="seo-content" aria-label="About the World Cup 2026 Schedule Map">
            <h2>World Cup 2026 Schedule &amp; Interactive Map</h2>
            <p>
                Cup26Map is a free, unofficial fan-made interactive map and complete schedule for the
                2026 World Cup, hosted across the United States, Mexico, and Canada. Browse all 104 matches
                in 16 host cities, filter by team or match day, and convert kickoff times to your local
                timezone — all on one map.
            </p>

            <div className="seo-grid">
                <div>
                    <h3>Complete World Cup 2026 Match Schedule</h3>
                    <p>
                        The 2026 World Cup runs from June 11 to July 19, 2026, featuring an expanded
                        48-team format across 12 groups. With 104 total matches — including group stage,
                        Round of 32, Round of 16, Quarter-finals, Semi-finals, and the Final — this is the
                        largest World Cup in history. Use the match day selector to view the full schedule
                        day-by-day, or select a team to see their complete group stage fixture list.
                    </p>
                </div>

                <div>
                    <h3>16 Host Cities Across North America</h3>
                    <p>
                        The 2026 World Cup venues span three countries and four time zones. Click any city
                        on the map to see its stadium, capacity, and complete match schedule:
                    </p>
                    <ul>
                        <li><strong>USA (11 cities):</strong> New York/New Jersey (MetLife Stadium), Los Angeles (Rose Bowl), Dallas (AT&amp;T Stadium), Houston (NRG Stadium), Miami (Hard Rock Stadium), Atlanta (Mercedes-Benz Stadium), Philadelphia (Lincoln Financial Field), Seattle (Lumen Field), San Francisco (Levi&apos;s Stadium), Boston (Gillette Stadium), Kansas City (Arrowhead Stadium)</li>
                        <li><strong>Mexico (3 cities):</strong> Mexico City (Estadio Azteca), Monterrey (Estadio BBVA), Guadalajara (Estadio Akron)</li>
                        <li><strong>Canada (2 cities):</strong> Vancouver (BC Place), Toronto (BMO Field)</li>
                    </ul>
                </div>

                <div>
                    <h3>Interactive Map Features</h3>
                    <p>
                        This World Cup 2026 map lets you explore the tournament visually. Key features include:
                    </p>
                    <ul>
                        <li>Interactive map with all 16 host city markers and stadium details</li>
                        <li>Filter matches by team, host city, or match day</li>
                        <li>Timezone converter for kickoff times across all time zones</li>
                        <li>Team flight path visualization showing travel distances</li>
                        <li>Stadium photos and seating capacity for every venue</li>
                        <li>Knockout stage bracket with venue assignments</li>
                    </ul>
                </div>
            </div>

            <p style={{ fontSize: '0.82rem', marginTop: '1rem', fontStyle: 'italic', opacity: 0.7 }}>
                This website is an unofficial fan project and is not affiliated with, endorsed by, or
                associated with FIFA or any official tournament organizers.
            </p>
        </section>
    );
});

export default SeoContent;
