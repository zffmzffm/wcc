import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visualize 2026 Soccer - One Map for All Matches & Cities | Cup26Map",
  description: "Your ultimate guide to 2026 FIFA World Cup in USA, Mexico & Canada. Interactive map with host cities, stadiums, match schedules, team flight paths, and timezone converter. Plan your World Cup journey now!",
  keywords: [
    // Core Keywords
    "2026 FIFA World Cup",
    "World Cup 2026",
    "FIFA World Cup 2026",
    "Soccer Fan Guide",
    "World Cup Schedule 2026",
    "World Cup Match Schedule",
    // Feature Keywords
    "World Cup 2026 venues",
    "World Cup 2026 cities",
    "World Cup 2026 stadiums",
    "World Cup 2026 match finder",
    "World Cup team tracker",
    "World Cup flight paths",
    // Location Keywords
    "USA Mexico Canada World Cup",
    "North America World Cup 2026",
    "World Cup host cities 2026",
    // Fan & Travel Keywords
    "World Cup travel guide",
    "World Cup fan guide",
    "World Cup planner 2026",
    "World Cup games schedule",
    // Tool Keywords
    "World Cup map",
    "World Cup interactive map",
    "World Cup timezone converter",
    // General Sports
    "Soccer",
    "Football",
    "FIFA",
  ],
  metadataBase: new URL('https://cup26map.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Visualize 2026 Soccer - One Map for All Matches & Cities | Cup26Map",
    description: "Your ultimate guide to 2026 Soccer in USA, Mexico & Canada. Interactive map with host cities, stadiums, match schedules, team flight paths, and timezone converter.",
    type: "website",
    locale: "en_US",
    siteName: "Cup26Map",
    url: 'https://cup26map.com',
    images: [
      {
        url: 'https://cup26map.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '2026 World Cup: The Travel Disparity - Compare Team Journeys & Explore Host Cities',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visualize 2026 Soccer - One Map for All Matches & Cities",
    description: "Interactive map & schedule for 2026 Soccer in USA, Mexico & Canada",
    creator: "@duo_yj",
    images: ['https://cup26map.com/og-image.jpg'],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏆</text></svg>",
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
    name: 'Cup26Map',
    description: 'Your ultimate guide to 2026 FIFA World Cup in USA, Mexico & Canada. Interactive map with host cities, stadiums, match schedules, team flight paths, and timezone converter.',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web',
    url: 'https://cup26map.com',
    keywords: '2026 FIFA World Cup, World Cup 2026, FIFA World Cup 2026, World Cup Schedule, World Cup Map, Soccer, Football',
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
    name: '2026 FIFA World Cup',
    description: 'The 23rd FIFA World Cup, hosted jointly by United States, Mexico, and Canada featuring 48 teams.',
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
      { '@type': 'Place', name: 'Rose Bowl Stadium', address: { '@type': 'PostalAddress', addressLocality: 'Los Angeles', addressCountry: 'USA' } },
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

  // Structured data for SEO - FAQPage
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'When does the 2026 FIFA World Cup start?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 2026 FIFA World Cup starts on June 11, 2026, and ends on July 19, 2026.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which countries are hosting the 2026 World Cup?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 2026 FIFA World Cup will be jointly hosted by the United States, Mexico, and Canada, featuring 16 host cities across the three countries.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many teams will participate in the 2026 World Cup?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 2026 World Cup will feature an expanded format with 48 teams, up from the previous 32-team format.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the host cities for the 2026 World Cup?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 16 host cities are: USA - New York/New Jersey, Los Angeles, Dallas, Houston, Miami, Atlanta, Philadelphia, Seattle, San Francisco, Boston, Kansas City; Mexico - Mexico City, Monterrey, Guadalajara; Canada - Vancouver, Toronto.',
        },
      },
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

        {/* Preconnect for fonts (existing) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preconnect for frequently used CDNs */}
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="anonymous" />

        {/* Load fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Inter', sans-serif" }}
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
