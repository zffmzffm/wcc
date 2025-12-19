'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TeamSelector from '@/components/TeamSelector';
import TimezoneSelector from '@/components/TimezoneSelector';
import CitySidebar from '@/components/CitySidebar';
import TeamScheduleSidebar from '@/components/TeamScheduleSidebar';
import Footer from '@/components/Footer';
import MapErrorBoundary from '@/components/MapErrorBoundary';
import PathLegend from '@/components/PathLegend';
import { City } from '@/types';
import { teams, matches, cities } from '@/data';
import { BREAKPOINTS, DEFAULT_TIMEZONE } from '@/constants';


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
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= BREAKPOINTS.mobile);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-aware city selection: close team sidebar when selecting city
  const handleCitySelect = useCallback((city: City | null) => {
    setSelectedCity(city);
    if (isMobile && city) {
      setSelectedTeam(null);
    }
  }, [isMobile]);

  // Mobile-aware team selection: close city sidebar when selecting team
  const handleTeamSelect = useCallback((teamCode: string | null) => {
    setSelectedTeam(teamCode);
    if (isMobile && teamCode) {
      setSelectedCity(null);
    }
  }, [isMobile]);

  // Get selected team info
  const selectedTeamInfo = selectedTeam
    ? teams.find(t => t.code === selectedTeam)
    : null;

  // Get matches for selected city
  const cityMatches = selectedCity
    ? matches.filter(m => m.cityId === selectedCity.id)
    : [];

  // Get matches for selected team
  const teamMatches = selectedTeam
    ? matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam)
    : [];

  // Timezone for display, use default if not selected
  const displayTimezone = selectedTimezone || DEFAULT_TIMEZONE;

  return (
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
        <TeamSelector
          teams={teams}
          selectedTeam={selectedTeam}
          onSelect={handleTeamSelect}
        />
      </Header>

      <div className="content-wrapper">
        <CitySidebar
          city={selectedCity}
          matches={cityMatches}
          teams={teams}
          timezone={displayTimezone}
          onClose={() => setSelectedCity(null)}
        />
        <div id="main-map" className="map-container" role="application" aria-label="2026 World Cup Venue Map">
          <MapErrorBoundary>
            <WorldCupMap
              selectedTeam={selectedTeam}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelect}
              isSidebarOpen={!!selectedCity || !!selectedTeam}
              isMobile={isMobile}
            />
          </MapErrorBoundary>
          {/* Show path legend when team is selected */}
          {selectedTeam && <PathLegend />}
        </div>
        <div className="right-column">
          <TeamScheduleSidebar
            team={selectedTeamInfo || null}
            matches={teamMatches}
            teams={teams}
            cities={cities}
            timezone={displayTimezone}
            onClose={() => setSelectedTeam(null)}
          />
          <Footer />
        </div>
      </div>
    </main>
  );
}
