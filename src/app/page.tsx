'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TeamSelector from '@/components/TeamSelector';
import CitySelector from '@/components/CitySelector';
import MatchDaySelector from '@/components/MatchDaySelector';
import TimezoneSelector from '@/components/TimezoneSelector';
import CitySidebar from '@/components/CitySidebar';
import TeamScheduleSidebar from '@/components/TeamScheduleSidebar';
import Footer from '@/components/Footer';
import MapErrorBoundary from '@/components/MapErrorBoundary';
import { LayerVisibilityProvider } from '@/contexts/LayerVisibilityContext';
import { HoverMatchProvider } from '@/contexts/HoverMatchContext';
import { City } from '@/types';
import { teams, matches, cities } from '@/data';
import { JsonMatchRepository } from '@/repositories/JsonMatchRepository';
import { BREAKPOINTS, DEFAULT_TIMEZONE } from '@/constants';

// Get knockout venues singleton
const matchRepository = new JsonMatchRepository();
const knockoutVenues = matchRepository.getKnockoutVenues();

// Helper to extract match day from ISO datetime
// Matches before 6am EDT are considered part of the previous day's schedule
function getMatchDay(datetime: string): string {
  const date = new Date(datetime);
  // Format in EDT timezone
  const edtFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false
  });
  const parts = edtFormatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);

  // If before 6am EDT, count as previous day
  if (hour < 6) {
    const prevDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    const prevParts = edtFormatter.formatToParts(prevDate);
    const prevYear = prevParts.find(p => p.type === 'year')?.value;
    const prevMonth = prevParts.find(p => p.type === 'month')?.value;
    const prevDay = prevParts.find(p => p.type === 'day')?.value;
    return `${prevYear}-${prevMonth}-${prevDay}`;
  }

  return `${year}-${month}-${day}`;
}

const WorldCupMap = dynamic(() => import('@/components/WorldCupMap'), {
  ssr: false, // Leaflet doesn't support SSR
  loading: () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading map...</p>
    </div>
  )
});

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= BREAKPOINTS.mobile);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-aware city selection: close team sidebar and clear day when selecting city
  const handleCitySelect = useCallback((city: City | null) => {
    setSelectedCity(city);
    if (city) {
      setSelectedDay(null);  // City and day are mutually exclusive
      if (isMobile) {
        setSelectedTeam(null);
      }
    }
  }, [isMobile]);

  // Mobile-aware team selection: close city sidebar when selecting team
  const handleTeamSelect = useCallback((teamCode: string | null) => {
    setSelectedTeam(teamCode);
    if (isMobile && teamCode) {
      setSelectedCity(null);
      setSelectedDay(null);
    }
  }, [isMobile]);

  // Day selection: clear city and team selection when selecting a day
  const handleDaySelect = useCallback((day: string | null) => {
    setSelectedDay(day);
    if (day) {
      setSelectedCity(null);  // Day and city are mutually exclusive
      setSelectedTeam(null);  // Day and team are mutually exclusive
    }
  }, []);

  // Get selected team info
  const selectedTeamInfo = selectedTeam
    ? teams.find(t => t.code === selectedTeam)
    : null;

  // Get matches for selected city
  const cityMatches = selectedCity
    ? matches.filter(m => m.cityId === selectedCity.id)
    : [];

  // Get knockout matches for selected city
  const cityKnockoutVenues = selectedCity
    ? knockoutVenues.filter(v => v.cityId === selectedCity.id)
    : [];

  // Get matches for selected day
  const dayMatches = selectedDay
    ? matches.filter(m => getMatchDay(m.datetime) === selectedDay)
    : [];

  // Get knockout matches for selected day
  const dayKnockoutVenues = selectedDay
    ? knockoutVenues.filter(v => getMatchDay(v.datetime) === selectedDay)
    : [];

  // Get matches for selected team
  const teamMatches = selectedTeam
    ? matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam)
    : [];

  // Timezone for display, use default if not selected
  const displayTimezone = selectedTimezone || DEFAULT_TIMEZONE;

  // Determine which matches to show in CitySidebar
  const sidebarMatches = selectedCity ? cityMatches : dayMatches;
  const sidebarKnockoutVenues = selectedCity ? cityKnockoutVenues : dayKnockoutVenues;

  // Close handler for CitySidebar
  const handleSidebarClose = useCallback(() => {
    setSelectedCity(null);
    setSelectedDay(null);
  }, []);

  return (
    <LayerVisibilityProvider>
      <HoverMatchProvider>
        <main className="main-container">
          {/* Skip navigation link for keyboard users */}
          <a href="#main-map" className="skip-link">
            Skip to map
          </a>
          <Header>
            <TimezoneSelector
              selectedTimezone={selectedTimezone}
              onSelect={setSelectedTimezone}
            />
            <MatchDaySelector
              matches={matches}
              knockoutVenues={knockoutVenues}
              selectedDay={selectedDay}
              onSelect={handleDaySelect}
            />
            <CitySelector
              cities={cities}
              selectedCity={selectedCity}
              onSelect={handleCitySelect}
            />
            <TeamSelector
              teams={teams}
              selectedTeam={selectedTeam}
              onSelect={handleTeamSelect}
            />
          </Header>

          <div className="content-wrapper">
            <CitySidebar
              city={selectedCity}
              matches={sidebarMatches}
              knockoutVenues={sidebarKnockoutVenues}
              teams={teams}
              cities={cities}
              timezone={displayTimezone}
              selectedDay={selectedDay}
              onClose={handleSidebarClose}
            />
            <div id="main-map" className="map-container" role="application" aria-label="2026 World Cup Venue Map">
              <MapErrorBoundary>
                <WorldCupMap
                  selectedTeam={selectedTeam}
                  selectedCity={selectedCity}
                  selectedDay={selectedDay}
                  dayMatches={dayMatches}
                  dayKnockoutVenues={dayKnockoutVenues}
                  onCitySelect={handleCitySelect}
                  isSidebarOpen={!!selectedCity || !!selectedTeam || !!selectedDay}
                  isMobile={isMobile}
                  timezone={displayTimezone}
                />
              </MapErrorBoundary>
            </div>
            <div className="right-column">
              <TeamScheduleSidebar
                team={selectedTeamInfo || null}
                matches={teamMatches}
                teams={teams}
                cities={cities}
                timezone={displayTimezone}
                knockoutVenues={new JsonMatchRepository().getKnockoutVenues()}
                onClose={() => setSelectedTeam(null)}
              />
              <Footer />
            </div>
          </div>
        </main>
      </HoverMatchProvider>
    </LayerVisibilityProvider>
  );
}
