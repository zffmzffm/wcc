'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TeamSelector from '@/components/TeamSelector';
import CitySidebar from '@/components/CitySidebar';
import TeamScheduleSidebar from '@/components/TeamScheduleSidebar';
import { Team, Match } from '@/components/CityPopup';
import { City } from '@/components/CityMarker';
import teamsData from '@/data/teams.json';
import matchesData from '@/data/matches.json';
import citiesData from '@/data/cities.json';

const teams: Team[] = teamsData as Team[];
const matches: Match[] = matchesData as Match[];
const cities = citiesData;

const WorldCupMap = dynamic(() => import('@/components/WorldCupMap'), {
  ssr: false, // Leaflet 不支持 SSR
  loading: () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>加载地图中...</p>
    </div>
  )
});

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

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

  return (
    <main className="main-container">
      <Header>
        <TeamSelector
          teams={teams}
          selectedTeam={selectedTeam}
          onSelect={setSelectedTeam}
        />
      </Header>

      <div className="content-wrapper">
        <CitySidebar
          city={selectedCity}
          matches={cityMatches}
          teams={teams}
          onClose={() => setSelectedCity(null)}
        />
        <div className="map-container">
          <WorldCupMap
            selectedTeam={selectedTeam}
            onCitySelect={setSelectedCity}
          />
        </div>
        <TeamScheduleSidebar
          team={selectedTeamInfo || null}
          matches={teamMatches}
          teams={teams}
          cities={cities}
          onClose={() => setSelectedTeam(null)}
        />
      </div>
    </main>
  );
}
