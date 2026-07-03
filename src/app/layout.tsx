import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "World Cup 2026 Schedule & Map – All 104 Matches, 16 Cities | Cup26Map",
  description: "Cup26Map is your interactive World Cup 2026 schedule map with all 104 matches across 16 host cities in USA, Mexico & Canada. Filter by team, city, or match day. View stadiums, kickoff times with timezone converter, and team travel paths. The ultimate 2026 World Cup fan guide.",
  keywords: [
    // Brand Keywords
    "Cup26Map",
    "cup26map.com",
    // Primary Target Keywords (highest search volume)
    "World Cup Schedule 2026",
    "World Cup 2026 Map",
    "World Cup Schedule 2026 Map",
    "2026 World Cup Schedule",
    // Core Keywords
    "World Cup 2026",
    "FIFA World Cup 2026",
    "World Cup Match Schedule",
    "World Cup 2026 Fixtures",
    // Map & Interactive Keywords
    "World Cup Map",
    "World Cup Interactive Map",
    "World Cup 2026 Interactive Map",
    "World Cup Venue Map",
    "World Cup Cities Map",
    // Feature Keywords
    "World Cup 2026 Venues",
    "World Cup 2026 Cities",
    "World Cup 2026 Stadiums",
    "World Cup 2026 Match Finder",
    "World Cup Team Tracker",
    "World Cup Flight Paths",
    // Location Keywords
    "USA Mexico Canada World Cup",
    "North America World Cup 2026",
    "World Cup Host Cities 2026",
    // Fan & Travel Keywords
    "World Cup Travel Guide",
    "World Cup Fan Guide 2026",
    "World Cup Planner 2026",
    "World Cup Games Schedule",
    // Tool Keywords
    "World Cup Timezone Converter",
    "World Cup Kickoff Times",
    // General Sports
    "Soccer",
    "Football",

  ],
  metadataBase: new URL('https://cup26map.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "World Cup 2026 Schedule & Map – All 104 Matches in 16 Cities | Cup26Map",
    description: "Interactive World Cup 2026 schedule map with all matches across 16 host cities in USA, Mexico & Canada. Filter by team, city, or match day with timezone converter.",
    type: "website",
    locale: "en_US",
    siteName: "Cup26Map",
    url: 'https://cup26map.com',
    images: [
      {
        url: 'https://cup26map.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'World Cup 2026 Schedule Map – Interactive map showing all 16 host cities and match schedules across USA, Mexico, and Canada',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 Schedule & Map – All 104 Matches, 16 Cities",
    description: "Interactive map & schedule for World Cup 2026 in USA, Mexico & Canada. Find matches by team, city, or date.",
    creator: "@duo_yj",
    images: ['https://cup26map.com/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data for SEO - WebApplication
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Cup26Map – World Cup 2026 Schedule & Map',
    description: 'Interactive World Cup 2026 schedule map with all 104 matches across 16 host cities in USA, Mexico & Canada. Filter by team, city, or match day with timezone converter.',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web',
    url: 'https://cup26map.com',
    keywords: 'World Cup Schedule 2026, World Cup 2026 Map, World Cup Schedule 2026 Map, World Cup Interactive Map, 2026 World Cup',
    screenshot: 'https://cup26map.com/og-image.jpg',
    featureList: 'Interactive map of 16 host cities, Full 104-match schedule, Team schedule tracker, Match day filter, Timezone converter, Team flight path visualization, Stadium information with images',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  // Structured data for SEO - SportsEvent with venues
  const sportsEventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: '2026 World Cup',
    description: 'The 23rd edition of the World Cup, hosted jointly by United States, Mexico, and Canada featuring 48 teams.',
    image: 'https://cup26map.com/og-image.jpg',
    startDate: '2026-06-11',
    endDate: '2026-07-19',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    organizer: {
      '@type': 'Organization',
      name: 'FIFA',
      url: 'https://www.fifa.com',
    },
    location: [
      // USA Venues
      { '@type': 'Place', name: 'MetLife Stadium', address: { '@type': 'PostalAddress', addressLocality: 'New York/New Jersey', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'SoFi Stadium', address: { '@type': 'PostalAddress', addressLocality: 'Los Angeles', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'AT&T Stadium', address: { '@type': 'PostalAddress', addressLocality: 'Dallas', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'NRG Stadium', address: { '@type': 'PostalAddress', addressLocality: 'Houston', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'Hard Rock Stadium', address: { '@type': 'PostalAddress', addressLocality: 'Miami', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'Mercedes-Benz Stadium', address: { '@type': 'PostalAddress', addressLocality: 'Atlanta', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'Lincoln Financial Field', address: { '@type': 'PostalAddress', addressLocality: 'Philadelphia', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'Lumen Field', address: { '@type': 'PostalAddress', addressLocality: 'Seattle', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'Levi\'s Stadium', address: { '@type': 'PostalAddress', addressLocality: 'San Francisco', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'Gillette Stadium', address: { '@type': 'PostalAddress', addressLocality: 'Boston', addressCountry: 'USA' } },
      { '@type': 'Place', name: 'Arrowhead Stadium', address: { '@type': 'PostalAddress', addressLocality: 'Kansas City', addressCountry: 'USA' } },
      // Mexico Venues
      { '@type': 'Place', name: 'Estadio Azteca', address: { '@type': 'PostalAddress', addressLocality: 'Mexico City', addressCountry: 'Mexico' } },
      { '@type': 'Place', name: 'Estadio BBVA', address: { '@type': 'PostalAddress', addressLocality: 'Monterrey', addressCountry: 'Mexico' } },
      { '@type': 'Place', name: 'Estadio Akron', address: { '@type': 'PostalAddress', addressLocality: 'Guadalajara', addressCountry: 'Mexico' } },
      // Canada Venues
      { '@type': 'Place', name: 'BC Place', address: { '@type': 'PostalAddress', addressLocality: 'Vancouver', addressCountry: 'Canada' } },
      { '@type': 'Place', name: 'BMO Field', address: { '@type': 'PostalAddress', addressLocality: 'Toronto', addressCountry: 'Canada' } },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Theme color for browser UI */}
        <meta name="theme-color" content="#2D5A3D" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />

        {/* Preconnect for frequently used CDNs */}
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventJsonLd) }}
        />
      </head>
      <body
        className={`antialiased ${inter.variable}`}
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
