'use client';
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CityMarker from './CityMarker';
import TeamFlightPath from './TeamFlightPath';
import { City } from '@/types';
import { cities, matches, teams } from '@/data';

// Fix Leaflet default icon path issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

// Default bounds for the map - very relaxed for flexible viewing
const DEFAULT_BOUNDS: L.LatLngBoundsExpression = [
    [-15, -160], // Southwest corner (very relaxed)
    [65, -40]    // Northeast corner (relaxed)
];

// Adjusted bounds when sidebar is open on mobile
const MOBILE_SIDEBAR_BOUNDS: L.LatLngBoundsExpression = [
    [0, -160],  // Southwest corner - relaxed to equator
    [65, -40]   // Northeast corner (same as default)
];

// Component to adjust map view when a team is selected - fit to team's cities
function TeamViewAdjuster({
    selectedTeam,
    isMobile,
    isSidebarOpen
}: {
    selectedTeam: string | null;
    isMobile: boolean;
    isSidebarOpen: boolean;
}) {
    const map = useMap();
    const prevTeam = useRef<string | null>(null);

    useEffect(() => {
        // Only adjust when team selection changes (not on every render)
        if (selectedTeam === prevTeam.current) return;
        prevTeam.current = selectedTeam;

        if (!selectedTeam) {
            // When team is deselected, reset to default view
            map.setView([35, -100], isMobile ? 3 : 4, { animate: true });
            return;
        }

        // Find all cities this team will visit
        const teamMatches = matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam);
        const teamCityIds = new Set(teamMatches.map(m => m.cityId));
        const teamCities = cities.filter(c => teamCityIds.has(c.id));

        if (teamCities.length === 0) return;

        // Create bounds that encompass all team cities
        const lats = teamCities.map(c => c.lat);
        const lngs = teamCities.map(c => c.lng);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Add padding to the bounds (in degrees)
        const latPadding = Math.max((maxLat - minLat) * 0.3, 2); // At least 2 degrees
        const lngPadding = Math.max((maxLng - minLng) * 0.3, 3); // At least 3 degrees

        const bounds: L.LatLngBoundsExpression = [
            [minLat - latPadding, minLng - lngPadding],
            [maxLat + latPadding, maxLng + lngPadding]
        ];

        // Small delay to ensure map is ready
        setTimeout(() => {
            map.invalidateSize();
            // Fit map to team's cities with some padding
            // On mobile with sidebar, add extra bottom padding
            const paddingOptions = isMobile && isSidebarOpen
                ? { paddingTopLeft: [20, 20] as L.PointTuple, paddingBottomRight: [20, 150] as L.PointTuple }
                : { padding: [30, 30] as L.PointTuple };

            map.fitBounds(bounds, {
                ...paddingOptions,
                maxZoom: 6, // Don't zoom in too much
                animate: true
            });
        }, 100);
    }, [selectedTeam, map, isMobile, isSidebarOpen]);

    return null;
}

// Component to dynamically adjust map view based on sidebar state and mobile
function MapViewAdjuster({
    isSidebarOpen,
    isMobile,
    selectedCity,
    selectedTeam
}: {
    isSidebarOpen: boolean;
    isMobile: boolean;
    selectedCity: City | null;
    selectedTeam: string | null;
}) {
    const map = useMap();
    const initialAdjustmentDone = useRef(false);

    // Initial view adjustment for mobile - zoom out to show all venues
    useEffect(() => {
        if (isMobile && !initialAdjustmentDone.current) {
            // On mobile, zoom out to show all 16 venues
            // Center slightly south to better frame all cities
            map.setView([35, -100], 3, { animate: false });
            initialAdjustmentDone.current = true;
        }
    }, [map, isMobile]);

    // Handle sidebar open/close and city selection
    useEffect(() => {
        if (!isMobile || !isSidebarOpen) {
            // On desktop or when sidebar is closed, use default bounds
            map.setMaxBounds(DEFAULT_BOUNDS);
            return;
        }

        // On mobile with sidebar open
        // Small delay to allow DOM to update
        const timeoutId = setTimeout(() => {
            // Recalculate map size
            map.invalidateSize();

            // Use tighter bounds that account for sidebar covering bottom
            map.setMaxBounds(MOBILE_SIDEBAR_BOUNDS);

            // Only pan to city if no team is selected (team selection handles its own view)
            if (selectedCity && !selectedTeam) {
                // When a city is selected, pan to ensure it's visible in the TOP portion
                // of the map (above where the sidebar will be)
                const cityLat = selectedCity.lat;
                const cityLng = selectedCity.lng;

                // Get current zoom or use a reasonable zoom level
                const currentZoom = map.getZoom();
                const targetZoom = Math.max(currentZoom, 5); // Zoom in a bit if needed

                // Calculate an offset to position the city in the upper 1/3 of the map
                // This ensures it stays visible even with sidebar covering bottom half
                const mapHeight = map.getSize().y;
                const offsetLat = (mapHeight * 0.15) / Math.pow(2, targetZoom) * 0.5;

                // Pan to the city with offset so it appears in upper portion
                map.setView([cityLat + offsetLat, cityLng], targetZoom, { animate: true });
            }
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [map, isSidebarOpen, isMobile, selectedCity, selectedTeam]);

    return null;
}

interface WorldCupMapProps {
    selectedTeam: string | null;
    selectedCity: City | null;
    onCitySelect: (city: City | null) => void;
    isSidebarOpen?: boolean;
    isMobile?: boolean;
}

export default function WorldCupMap({ selectedTeam, selectedCity, onCitySelect, isSidebarOpen = false, isMobile = false }: WorldCupMapProps) {
    // Calculate which cities are relevant for the selected team
    const teamCityIds = React.useMemo(() => {
        if (!selectedTeam) return new Set<string>();
        const teamMatches = matches.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam);
        return new Set(teamMatches.map(m => m.cityId));
    }, [selectedTeam]);

    return (
        <MapContainer
            center={[39.8283, -98.5795]} // North America center
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            minZoom={2}
            maxZoom={10}
            maxBounds={DEFAULT_BOUNDS}
            maxBoundsViscosity={0.3} // Very elastic bounds
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap, &copy; CartoDB'
            />

            {/* Dynamic view adjuster for mobile sidebar */}
            <MapViewAdjuster isSidebarOpen={isSidebarOpen} isMobile={isMobile} selectedCity={selectedCity} selectedTeam={selectedTeam} />

            {/* Team view adjuster - fits map to team's cities */}
            <TeamViewAdjuster selectedTeam={selectedTeam} isMobile={isMobile} isSidebarOpen={isSidebarOpen} />

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
                />
            )}
        </MapContainer>
    );
}
