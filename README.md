# Cup26Map 🗺️⚽

Visualize 2026 Soccer - One Map for All Matches & Cities. An interactive web application for the 2026 FIFA World Cup in USA, Mexico, and Canada.

🌐 **Live Demo**: [cup26map.com](https://cup26map.com)

## Features

- **Interactive World Map**: Explore all 16 host cities across USA, Mexico, and Canada with clickable markers
- **Team Selector**: Choose any of the 48 participating teams to view group-stage and knockout travel scenarios
- **Team Flight Paths**: Visualize travel routes between match venues with distance calculations
- **Match Schedules**: View group-stage and knockout matches by city or by team
- **Timezone Converter**: Convert match times to your local timezone
- **Knockout Stage Brackets**: Replace group placeholders with real qualifiers while keeping impossible scenarios greyed out
- **Responsive Design**: Fully optimized for both desktop and mobile devices

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16
- **Language**: TypeScript
- **Map Library**: [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/)
- **Styling**: Tailwind CSS entrypoint with modular CSS stylesheets
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- npm. On Windows/PowerShell, use `npm.cmd` for the commands below; on macOS/Linux, `npm` is fine.

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd wcc

# Install dependencies
npm.cmd install
```

### Development

```bash
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm.cmd run build
```

This project uses Next.js static export (`output: 'export'`). The build output is
written to `out/` for static hosting such as Cloudflare Pages. `next start` is
not the right local preview command for this export mode.

### Score Updates

Daily score updates should usually be one short command.

```bash
# 1. Find the match IDs for the day
npm.cmd run score -- 2026-06-14

# 2. Update one match
npm.cmd run score -- 9 2-1

# 3. Or update multiple matches from that day
npm.cmd run score -- 2026-06-14 9=2-1 11=0-0
```

Scores are stored as `{ "left": homeSideGoals, "right": awaySideGoals }`, where
`left` matches `team1` and `right` matches `team2`. To check the data without
editing it, run `npm.cmd run score -- check`.

### Knockout Updates

After each group finishes, update the real qualifiers with one command:

```bash
npm.cmd run knockout -- group B 1=CAN 2=SUI out=QAT
```

This writes `src/data/knockoutResults.json`, resolves placeholders such as
`1B` and `2B` to real teams, and keeps impossible knockout scenarios visible but
greyed out. Teams listed in `out=` have all knockout scenarios greyed out.

If a command was typed incorrectly, rerun the same group with the corrected
values. The latest valid command overwrites that group's `first`, `second`, and
`eliminated` values:

```bash
npm.cmd run knockout -- group B 1=CAN 2=SUI out=QAT
npm.cmd run knockout -- show B
npm.cmd run knockout -- check
```

After all groups are complete, fill the eight third-place Round of 32 slots with
the exact official assignments:

```bash
npm.cmd run knockout -- thirds R32_79=CZE R32_74=SUI
```

Third-place updates must use specific R32 slots such as `R32_79=CZE`; the app
does not infer the bracket from only the eight third-place team names.

Validate after any knockout update:

```bash
npm.cmd run knockout -- check
```

Keep `src/data/knockoutVenues.json` unchanged because its seed strings drive
path generation.

### Testing

```bash
# Run tests
npm.cmd run test

# Run tests with coverage
npm.cmd run test:coverage
```

### Linting

```bash
npm.cmd run lint
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── WorldCupMap.tsx
│   ├── TeamSelector.tsx
│   ├── CitySidebar.tsx
│   ├── TeamScheduleSidebar.tsx
│   ├── TimezoneSelector.tsx
│   ├── TeamFlightPath/
│   └── ...
├── data/                 # Static tournament data
│   ├── cities.json       # Host city information
│   ├── teams.json        # Participating teams
│   ├── matches.json      # Group-stage schedule and scores
│   ├── knockoutVenues.json
│   ├── knockoutResults.json
│   ├── knockoutBracket.ts
│   └── pathDistances.json
├── hooks/                # Custom React hooks
├── repositories/         # Data access layer
├── styles/               # CSS stylesheets
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
scripts/
├── update-match-score.mjs
├── update-knockout-results.mjs
└── calculatePathDistances.js
public/                   # Static images, venue photos, headers, and Cloudflare _headers
```

## License

This project is private and not licensed for public distribution.

## Acknowledgments

- Match data and schedules are based on official 2026 FIFA World Cup information
- Flag icons are loaded from Flagcdn; team and host-city data are maintained in `src/data/`
