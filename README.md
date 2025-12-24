# Soccer Fan Guide '26 ⚽🏆

An interactive web application for the 2026 FIFA World Cup, providing fans with an easy-to-use map, match schedules, and team tracking features.

🌐 **Live Demo**: [soccerfanguide26.duoyj.ca](https://soccerfanguide26.duoyj.ca)

## Features

- **Interactive World Map**: Explore all 16 host cities across USA, Mexico, and Canada with clickable markers
- **Team Selector**: Choose any of the 48 participating teams to view their group stage journey
- **Team Flight Paths**: Visualize travel routes between match venues with distance calculations
- **Match Schedules**: View all group stage matches by city or by team
- **Timezone Converter**: Convert match times to your local timezone
- **Knockout Stage Brackets**: Explore hypothetical knockout stage paths for each group position
- **Responsive Design**: Fully optimized for both desktop and mobile devices

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16
- **Language**: TypeScript
- **Map Library**: [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd wc

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm run start
```

### Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── WorldCupMap.tsx
│   ├── TeamSelector.tsx
│   ├── CitySidebar.tsx
│   ├── TeamScheduleSidebar.tsx
│   ├── TimezoneSelector.tsx
│   ├── TeamFlightPath/
│   └── ...
├── data/             # Static data files
│   ├── cities.json   # Host city information
│   ├── teams.json    # Participating teams
│   ├── matches.json  # Match schedules
│   └── knockoutBracket.ts
├── hooks/            # Custom React hooks
├── repositories/     # Data access layer
├── styles/           # CSS stylesheets
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## License

This project is private and not licensed for public distribution.

## Acknowledgments

- Match data and schedules are based on the official 2026 FIFA World Cup information
- Flag icons and team data sourced from public FIFA resources
