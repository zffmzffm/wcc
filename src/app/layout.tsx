import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOCCER FAN GUIDE '26 | 2026 FIFA World Cup Interactive Map & Schedule",
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
  metadataBase: new URL('https://soccerfanguide26.duoyj.ca'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SOCCER FAN GUIDE '26 | 2026 FIFA World Cup Interactive Map & Schedule",
    description: "Your ultimate guide to 2026 FIFA World Cup in USA, Mexico & Canada. Interactive map with host cities, stadiums, match schedules, team flight paths, and timezone converter.",
    type: "website",
    siteName: "Soccer Fan Guide '26",
    url: 'https://soccerfanguide26.duoyj.ca',
  },
  twitter: {
    card: "summary_large_image",
    title: "SOCCER FAN GUIDE '26 | 2026 FIFA World Cup",
    description: "Interactive map & schedule for 2026 FIFA World Cup in USA, Mexico & Canada",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
