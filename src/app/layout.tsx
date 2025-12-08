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
  title: "WORLD CUP '26 TRACKER",
  description: "World Cup '26 Tracker - Interactive map showing host cities, match schedules, and team flight paths for 2026 FIFA World Cup.",
  keywords: ["World Cup 26 Tracker", "World Cup 2026", "FIFA World Cup 2026", "2026 World Cup Schedule", "World Cup Map", "Soccer", "Football"],
  openGraph: {
    title: "WORLD CUP '26 TRACKER",
    description: "World Cup '26 Tracker - Interactive map for 2026 FIFA World Cup",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-darkreader-mode="disabled"
      data-darkreader-scheme="light"
      style={{ colorScheme: 'light only', filter: 'none' }}
    >
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <meta name="darkreader-lock" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        data-darkreader-mode="disabled"
        style={{
          backgroundColor: '#F5F7F5',
          color: '#2D3A2D',
          filter: 'none',
          colorScheme: 'light only'
        }}
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
