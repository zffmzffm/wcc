'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TeamSelector from '@/components/TeamSelector';
import TimezoneSelector from '@/components/TimezoneSelector';
import CitySidebar from '@/components/CitySidebar';
import TeamScheduleSidebar from '@/components/TeamScheduleSidebar';
import { Team, Match, City } from '@/types';
import teamsData from '@/data/teams.json';
import matchesData from '@/data/matches.json';
import citiesData from '@/data/cities.json';

const teams: Team[] = teamsData as Team[];
const matches: Match[] = matchesData as Match[];
const cities: City[] = citiesData as City[];

const WorldCupMap = dynamic(() => import('@/components/WorldCupMap'), {
  ssr: false, // Leaflet 不支持 SSR
  loading: () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>加载地图中...</p>
    </div>
  )
});

// Mobile breakpoint (matches CSS)
const MOBILE_BREAKPOINT = 600;

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
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

  // 获取选中球队的信息
  const selectedTeamInfo = selectedTeam
    ? teams.find(t => t.code === selectedTeam)
    : null;

  // 获取选中城市的比赛
  const cityMatches = selectedCity
    ? matches.filter(m => m.cityId === selectedCity.id)
    : [];

  // 获取选中球队的比赛
  const teamMatches = selectedTeam
    ? matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam)
    : [];

  // 用于显示的时区，未选择时使用默认值
  const displayTimezone = selectedTimezone || 'America/Toronto';

  return (
    <main className="main-container">
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
        <div className="map-container" role="application" aria-label="2026 世界杯场馆地图">
          <WorldCupMap
            selectedTeam={selectedTeam}
            onCitySelect={handleCitySelect}
          />
        </div>
        <TeamScheduleSidebar
          team={selectedTeamInfo || null}
          matches={teamMatches}
          teams={teams}
          cities={cities}
          timezone={displayTimezone}
          onClose={() => setSelectedTeam(null)}
        />
      </div>
    </main>
  );
}
