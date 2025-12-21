'use client';
import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CityMarker from './CityMarker';
import TeamFlightPath from './TeamFlightPath';
import MapLegendControl from './MapLegendControl';
import MatchDayLabels from './MatchDayLabels';
import { useMapViewControl } from '@/hooks/useMapViewControl';
import { City, Match, Team } from '@/types';
import { cities, matches, teams, knockoutVenues } from '@/data';
import { matchRepository } from '@/repositories';
import { KnockoutVenue } from '@/repositories/types';
import { MAP_CONFIG, MAP_BOUNDS, DEFAULT_TIMEZONE } from '@/constants';

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
    selectedDay,
    dayCityIds,
    isSidebarOpen,
    isMobile
}: {
    selectedTeam: string | null;
    selectedCity: City | null;
    selectedDay: string | null;
    dayCityIds: Set<string>;
    isSidebarOpen: boolean;
    isMobile: boolean;
}) {
    // Use consolidated hook for all map view adjustments
    useMapViewControl({
        selectedTeam,
        selectedCity,
        selectedDay,
        dayCityIds,
        isSidebarOpen,
        isMobile
    });

    return null;
}

interface WorldCupMapProps {
    selectedTeam: string | null;
    selectedCity: City | null;
    selectedDay?: string | null;
    dayMatches?: Match[];
    dayKnockoutVenues?: KnockoutVenue[];
    onCitySelect: (city: City | null) => void;
    isSidebarOpen?: boolean;
    isMobile?: boolean;
    timezone?: string;
}

/**
 * Inner map content component wrapped with LayerVisibilityProvider
 */
function MapContent({
    selectedTeam,
    selectedCity,
    selectedDay,
    dayMatches,
    dayKnockoutVenues,
    onCitySelect,
    isSidebarOpen,
    isMobile,
    teamCityIds,
    dayCityIds,
    timezone
}: {
    selectedTeam: string | null;
    selectedCity: City | null;
    selectedDay: string | null;
    dayMatches: Match[];
    dayKnockoutVenues: KnockoutVenue[];
    onCitySelect: (city: City | null) => void;
    isSidebarOpen: boolean;
    isMobile: boolean;
    teamCityIds: Set<string>;
    dayCityIds: Set<string>;
    timezone: string;
}) {
    return (
        <>
            {/* Consolidated map view controller */}
            <MapViewController
                selectedTeam={selectedTeam}
                selectedCity={selectedCity}
                selectedDay={selectedDay}
                dayCityIds={dayCityIds}
                isSidebarOpen={isSidebarOpen}
                isMobile={isMobile}
            />

            {/* City markers */}
            {cities.map(city => (
                <CityMarker
                    key={city.id}
                    city={city}
                    onClick={() => onCitySelect(city)}
                    isDimmed={
                        (selectedTeam !== null && !teamCityIds.has(city.id)) ||
                        (selectedDay !== null && !dayCityIds.has(city.id))
                    }
                    isSelected={selectedCity?.id === city.id}
                />
            ))}

            {/* Match day labels */}
            {selectedDay && !selectedTeam && (
                <MatchDayLabels
                    matches={dayMatches}
                    knockoutVenues={dayKnockoutVenues}
                    cities={cities}
                    teams={teams}
                    timezone={timezone}
                />
            )}

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
        </>
    );
}

export default function WorldCupMap({
    selectedTeam,
    selectedCity,
    selectedDay = null,
    dayMatches = [],
    dayKnockoutVenues = [],
    onCitySelect,
    isSidebarOpen = false,
    isMobile = false,
    timezone = DEFAULT_TIMEZONE
}: WorldCupMapProps) {
    // Calculate which cities are relevant for the selected team
    const teamCityIds = useMemo(() => {
        if (!selectedTeam) return new Set<string>();
        const teamMatches = matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam);
        return new Set(teamMatches.map(m => m.cityId));
    }, [selectedTeam]);

    // Calculate which cities are relevant for the selected day
    const dayCityIds = useMemo(() => {
        if (!selectedDay) return new Set<string>();
        const matchCities = dayMatches.map(m => m.cityId);
        const knockoutCities = dayKnockoutVenues.map(v => v.cityId);
        return new Set([...matchCities, ...knockoutCities]);
    }, [selectedDay, dayMatches, dayKnockoutVenues]);

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
                selectedDay={selectedDay}
                dayMatches={dayMatches}
                dayKnockoutVenues={dayKnockoutVenues}
                onCitySelect={onCitySelect}
                isSidebarOpen={isSidebarOpen}
                isMobile={isMobile}
                teamCityIds={teamCityIds}
                dayCityIds={dayCityIds}
                timezone={timezone}
            />
        </MapContainer>
    );
}
