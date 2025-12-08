'use client';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CityMarker from './CityMarker';
import TeamFlightPath from './TeamFlightPath';
import { City, Match, Team } from '@/types';

import citiesData from '@/data/cities.json';
import matchesData from '@/data/matches.json';
import teamsData from '@/data/teams.json';

// Fix Leaflet default icon path issue
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
    onCitySelect: (city: City | null) => void;
}

export default function WorldCupMap({ selectedTeam, onCitySelect }: WorldCupMapProps) {
    return (
        <MapContainer
            center={[39.8283, -98.5795]} // North America center
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            minZoom={3}
            maxZoom={10}
            maxBounds={[
                [10, -140], // Southwest corner (relaxed)
                [58, -56]   // Northeast corner (relaxed)
            ]}
            maxBoundsViscosity={1.0} // Restrict to bounds completely
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap, &copy; CartoDB'
            />

            {/* City markers */}
            {cities.map(city => (
                <CityMarker
                    key={city.id}
                    city={city}
                    onClick={() => onCitySelect(city)}
                />
            ))}

            {/* Team flight path */}
            {selectedTeam && (
                <TeamFlightPath
                    teamCode={selectedTeam}
                    matches={matches}
                    cities={cities}
                    teams={teams}
                />
            )}
        </MapContainer>
    );
}
