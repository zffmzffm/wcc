'use client';
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CityMarker from './CityMarker';
import TeamFlightPath from './TeamFlightPath';
import MapLegendControl from './MapLegendControl';
import { LayerVisibilityProvider } from '@/contexts/LayerVisibilityContext';
import { useMapViewControl } from '@/hooks/useMapViewControl';
import { City } from '@/types';
import { cities, matches, teams, knockoutVenues } from '@/data';
import { matchRepository } from '@/repositories';
import { MAP_CONFIG, MAP_BOUNDS } from '@/constants';

// Fix Leaflet default icon path issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

/**
 * Inner component that uses the map context for view control
 */
function MapViewController({
    selectedTeam,
    selectedCity,
    isSidebarOpen,
    isMobile
}: {
    selectedTeam: string | null;
    selectedCity: City | null;
    isSidebarOpen: boolean;
    isMobile: boolean;
}) {
    // Use consolidated hook for all map view adjustments
    useMapViewControl({
        selectedTeam,
        selectedCity,
        isSidebarOpen,
        isMobile
    });

    return null;
}

interface WorldCupMapProps {
    selectedTeam: string | null;
    selectedCity: City | null;
    onCitySelect: (city: City | null) => void;
    isSidebarOpen?: boolean;
    isMobile?: boolean;
}

/**
 * Inner map content component wrapped with LayerVisibilityProvider
 */
function MapContent({
    selectedTeam,
    selectedCity,
    onCitySelect,
    isSidebarOpen,
    isMobile,
    teamCityIds
}: {
    selectedTeam: string | null;
    selectedCity: City | null;
    onCitySelect: (city: City | null) => void;
    isSidebarOpen: boolean;
    isMobile: boolean;
    teamCityIds: Set<string>;
}) {
    return (
        <LayerVisibilityProvider>
            {/* Consolidated map view controller */}
            <MapViewController
                selectedTeam={selectedTeam}
                selectedCity={selectedCity}
                isSidebarOpen={isSidebarOpen}
                isMobile={isMobile}
            />

            {/* City markers */}
            {cities.map(city => (
                <CityMarker
                    key={city.id}
                    city={city}
                    onClick={() => onCitySelect(city)}
                    isDimmed={selectedTeam !== null && !teamCityIds.has(city.id)}
                />
            ))}

            {/* Team flight path */}
            {selectedTeam && (
                <TeamFlightPath
                    teamCode={selectedTeam}
                    matches={matches}
                    cities={cities}
                    teams={teams}
                    knockoutVenues={matchRepository.getKnockoutVenues()}
                />
            )}

            {/* Path legend as Leaflet control */}
            {selectedTeam && <MapLegendControl />}
        </LayerVisibilityProvider>
    );
}

export default function WorldCupMap({
    selectedTeam,
    selectedCity,
    onCitySelect,
    isSidebarOpen = false,
    isMobile = false
}: WorldCupMapProps) {
    // Calculate which cities are relevant for the selected team
    const teamCityIds = useMemo(() => {
        if (!selectedTeam) return new Set<string>();
        const teamMatches = matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam);
        return new Set(teamMatches.map(m => m.cityId));
    }, [selectedTeam]);

    return (
        <MapContainer
            center={MAP_CONFIG.defaultCenter}
            zoom={MAP_CONFIG.defaultZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            minZoom={MAP_CONFIG.minZoom}
            maxZoom={MAP_CONFIG.maxZoom}
            maxBounds={MAP_BOUNDS.default}
            maxBoundsViscosity={MAP_BOUNDS.default ? MAP_CONFIG.boundsViscosity : 0}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap, &copy; CartoDB'
            />
            <MapContent
                selectedTeam={selectedTeam}
                selectedCity={selectedCity}
                onCitySelect={onCitySelect}
                isSidebarOpen={isSidebarOpen}
                isMobile={isMobile}
                teamCityIds={teamCityIds}
            />
        </MapContainer>
    );
}


