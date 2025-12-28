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
    siteName: "Cup26Map",
    url: 'https://cup26map.com',
    images: [
      {
        url: 'https://cup26map.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '2026 World Cup: The Travel Disparity - Compare Team Journeys & Explore Host Cities',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visualize 2026 Soccer - One Map for All Matches & Cities",
    description: "Interactive map & schedule for 2026 Soccer in USA, Mexico & Canada",
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
  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: "Soccer Fan Guide '26",
    description: 'Your ultimate guide to 2026 FIFA World Cup in USA, Mexico & Canada. Interactive map with host cities, stadiums, match schedules, team flight paths, and timezone converter.',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web',
    keywords: '2026 FIFA World Cup, World Cup 2026, FIFA World Cup 2026, World Cup Schedule, World Cup Map, Soccer, Football',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    about: {
      '@type': 'SportsEvent',
      name: '2026 FIFA World Cup',
      startDate: '2026-06-11',
      endDate: '2026-07-19',
      location: {
        '@type': 'Place',
        name: 'United States, Mexico, Canada',
      },
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
