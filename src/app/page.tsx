'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import TeamSelector from '@/components/TeamSelector';
import { Team } from '@/components/CityPopup';
import teamsData from '@/data/teams.json';

const teams: Team[] = teamsData as Team[];

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

  // 获取选中球队的信息
  const selectedTeamInfo = selectedTeam
    ? teams.find(t => t.code === selectedTeam)
    : null;

  return (
    <main className="main-container">
      <Header
        selectedTeam={selectedTeamInfo ? {
          name: selectedTeamInfo.name,
          flag: selectedTeamInfo.flag,
          group: selectedTeamInfo.group
        } : null}
      >
        <TeamSelector
          teams={teams}
          selectedTeam={selectedTeam}
          onSelect={setSelectedTeam}
        />
      </Header>

      <div className="map-container">
        <WorldCupMap selectedTeam={selectedTeam} />
      </div>
    </main>
  );
}
