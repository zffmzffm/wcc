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
  title: "WORLD CUP '26 TRACKER | 2026世界杯赛程追踪",
  description: "World Cup '26 Tracker - Interactive map showing host cities, match schedules, and team flight paths for 2026 FIFA World Cup. 2026世界杯赛程追踪，实时展示比赛场馆、赛程和球队行程路线。",
  keywords: ["World Cup 26 Tracker", "World Cup 2026", "FIFA World Cup 2026", "世界杯2026", "2026 World Cup Schedule", "World Cup Map", "比赛赛程", "足球", "Soccer", "Football"],
  openGraph: {
    title: "WORLD CUP '26 TRACKER | 2026世界杯赛程追踪",
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
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          跳转到主要内容
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
