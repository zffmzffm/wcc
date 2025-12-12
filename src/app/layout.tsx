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
  title: "SOCCER FAN GUIDE '26",
  description: "Soccer Fan Guide '26 - Interactive map showing host cities, match schedules, and team flight paths for 2026 FIFA World Cup.",
  keywords: ["Soccer Fan Guide", "World Cup 2026", "FIFA World Cup 2026", "2026 World Cup Schedule", "World Cup Map", "Soccer", "Football"],
  openGraph: {
    title: "SOCCER FAN GUIDE '26",
    description: "Soccer Fan Guide '26 - Interactive map for 2026 FIFA World Cup",
    type: "website",
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
    description: 'Interactive map showing host cities, match schedules, and team flight paths for 2026 FIFA World Cup.',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web',
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
