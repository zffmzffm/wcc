import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cup26Map is being fixed",
  description:
    "Cup26Map is temporarily paused while we correct a bug and validate the fix.",
  metadataBase: new URL("https://cup26map.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cup26Map is being fixed",
    description:
      "We found a bug, paused the live experience, and are actively correcting it.",
    type: "website",
    locale: "en_US",
    siteName: "Cup26Map",
    url: "https://cup26map.com",
    images: [
      {
        url: "https://cup26map.com/maintenance-player.png",
        width: 1024,
        height: 1024,
        alt: "Sweating soccer ball character running",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cup26Map is being fixed",
    description:
      "Cup26Map is temporarily paused while we correct a bug and validate the fix.",
    images: ["https://cup26map.com/maintenance-player.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2D5A3D" />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily:
            "Inter, Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
