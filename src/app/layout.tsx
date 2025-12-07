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
  title: "2026 FIFA World Cup Map | 世界杯赛程地图",
  description: "Interactive map showing host cities, match schedules, and team flight paths for FIFA World Cup 2026 in USA, Mexico, and Canada. 2026年FIFA世界杯交互式地图，展示美国、加拿大、墨西哥的比赛场馆、赛程和球队行程路线。",
  keywords: ["FIFA World Cup 2026", "世界杯2026", "World Cup Map", "比赛赛程", "足球", "Soccer", "Football"],
  openGraph: {
    title: "2026 FIFA World Cup Map | 世界杯赛程地图",
    description: "Interactive map for FIFA World Cup 2026 - USA, Mexico, Canada",
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
