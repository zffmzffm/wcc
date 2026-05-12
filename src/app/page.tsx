'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TeamSelector from '@/components/TeamSelector';
import CitySelector from '@/components/CitySelector';
import MatchDaySelector from '@/components/MatchDaySelector';
import TimezoneSelector from '@/components/TimezoneSelector';
import CitySidebar from '@/components/CitySidebar';
import TeamScheduleSidebar from '@/components/TeamScheduleSidebar';
import Footer from '@/components/Footer';
import SeoContent from '@/components/SeoContent';
import MapErrorBoundary from '@/components/MapErrorBoundary';
import { LayerVisibilityProvider } from '@/contexts/LayerVisibilityContext';
import { HoverMatchProvider } from '@/contexts/HoverMatchContext';
import { City } from '@/types';
import { teams, matches, cities } from '@/data';
import { JsonMatchRepository } from '@/repositories/JsonMatchRepository';
import { useUrlState } from '@/hooks/useUrlState';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getMatchDay } from '@/utils/dateUtils';
import { BREAKPOINTS, DEFAULT_TIMEZONE } from '@/constants';

// Get knockout venues singleton
const matchRepository = new JsonMatchRepository();
const knockoutVenues = matchRepository.getKnockoutVenues();

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
  const isMobile = useIsMobile();

  // URL-synchronized state management
  const {
    selectedTeam,
    selectedCity,
    selectedDay,
    selectedTimezone,
    setSelectedTeam,
    setSelectedCity,
    setSelectedDay,
    handleTeamSelect,
    handleCitySelect,
    handleDaySelect,
    handleTimezoneSelect,
    canGoBack,
    handleBack,
  } = useUrlState({ cities, isMobile });

  // Get selected team info - memoized to avoid unnecessary lookups
  const selectedTeamInfo = useMemo(() =>
    selectedTeam ? teams.find(t => t.code === selectedTeam) : null,
    [selectedTeam]
  );

  // Get matches for selected city - memoized to avoid filtering on every render
  const cityMatches = useMemo(() =>
    selectedCity ? matches.filter(m => m.cityId === selectedCity.id) : [],
    [selectedCity]
  );

  // Get knockout matches for selected city
  const cityKnockoutVenues = useMemo(() =>
    selectedCity ? knockoutVenues.filter(v => v.cityId === selectedCity.id) : [],
    [selectedCity]
  );

  // Get matches for selected day
  const dayMatches = useMemo(() =>
    selectedDay ? matches.filter(m => getMatchDay(m.datetime) === selectedDay) : [],
    [selectedDay]
  );

  // Get knockout matches for selected day
  const dayKnockoutVenues = useMemo(() =>
    selectedDay ? knockoutVenues.filter(v => getMatchDay(v.datetime) === selectedDay) : [],
    [selectedDay]
  );

  // Get matches for selected team
  const teamMatches = useMemo(() =>
    selectedTeam ? matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam) : [],
    [selectedTeam]
  );

  // Timezone for display, use default if not selected
  const displayTimezone = selectedTimezone || DEFAULT_TIMEZONE;

  // Determine which matches to show in CitySidebar - memoized
  const sidebarMatches = useMemo(() =>
    selectedCity ? cityMatches : dayMatches,
    [selectedCity, cityMatches, dayMatches]
  );
  const sidebarKnockoutVenues = useMemo(() =>
    selectedCity ? cityKnockoutVenues : dayKnockoutVenues,
    [selectedCity, cityKnockoutVenues, dayKnockoutVenues]
  );

  // Close handler for CitySidebar
  const handleSidebarClose = useCallback(() => {
    setSelectedCity(null);
    setSelectedDay(null);
  }, [setSelectedCity, setSelectedDay]);

  // City selection by ID (for clicking city names in sidebar)
  const handleCitySelectById = useCallback((cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    if (city) {
      handleCitySelect(city);
    }
  }, [handleCitySelect]);

  // Reset all selections
  const handleReset = useCallback(() => {
    setSelectedCity(null);
    setSelectedTeam(null);
    setSelectedDay(null);
  }, [setSelectedCity, setSelectedTeam, setSelectedDay]);

  return (
    <LayerVisibilityProvider>
      <HoverMatchProvider>
        <main className="main-container">
          {/* Skip navigation link for keyboard users */}
          <a href="#main-map" className="skip-link">
            Skip to map
          </a>
          <Header onReset={handleReset}>
            <TimezoneSelector
              selectedTimezone={selectedTimezone}
              onSelect={handleTimezoneSelect}
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
              onTeamSelect={handleTeamSelect}
              onCitySelect={handleCitySelectById}
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
                  canGoBack={canGoBack}
                  onBack={handleBack}
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
                knockoutVenues={knockoutVenues}
                onClose={() => setSelectedTeam(null)}
              />
              <Footer />
            </div>
          </div>
          <SeoContent />
        </main>
      </HoverMatchProvider>
    </LayerVisibilityProvider>
  );
}
