'use client';
import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CityMarker, { City } from './CityMarker';
import CityPopup, { Match, Team } from './CityPopup';
import TeamFlightPath from './TeamFlightPath';

import citiesData from '@/data/cities.json';
import matchesData from '@/data/matches.json';
import teamsData from '@/data/teams.json';

// 修复 Leaflet 默认图标路径问题
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

export const cities: City[] = citiesData as City[];
export const matches: Match[] = matchesData as Match[];
export const teams: Team[] = teamsData as Team[];

interface WorldCupMapProps {
    selectedTeam: string | null;
}

export default function WorldCupMap({ selectedTeam }: WorldCupMapProps) {
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    const handleCityClick = (city: City) => {
        setSelectedCity(city);
    };

    const handleClosePopup = () => {
        setSelectedCity(null);
    };

    // 获取选中城市的比赛
    const cityMatches = selectedCity
        ? matches.filter(m => m.cityId === selectedCity.id)
        : [];

    return (
        <>
            <MapContainer
                center={[39.8283, -98.5795]} // 北美中心点
                zoom={4}
                style={{ height: '100vh', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap, &copy; CartoDB'
                />

                {/* 城市标记 */}
                {cities.map(city => (
                    <CityMarker
                        key={city.id}
                        city={city}
                        onClick={() => handleCityClick(city)}
                    />
                ))}

                {/* 球队飞行路线 */}
                {selectedTeam && (
                    <TeamFlightPath
                        teamCode={selectedTeam}
                        matches={matches}
                        cities={cities}
                        teams={teams}
                    />
                )}
            </MapContainer>

            {/* 城市弹窗 */}
            {selectedCity && (
                <CityPopup
                    city={selectedCity}
                    matches={cityMatches}
                    teams={teams}
                    onClose={handleClosePopup}
                />
            )}
        </>
    );
}
