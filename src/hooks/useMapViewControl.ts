import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { City, Match } from '@/types';
import {
    MAP_CONFIG,
    MAP_BOUNDS,
    TEAM_VIEW_CONFIG,
    SIDEBAR_VIEW_CONFIG,
    BREAKPOINTS
} from '@/constants';
import { cities, matches } from '@/data';

interface UseMapViewControlProps {
    selectedTeam: string | null;
    selectedCity: City | null;
    isSidebarOpen: boolean;
    isMobile: boolean;
}

/**
 * Consolidated hook for all map view control logic
 * Handles team selection view adjustments, sidebar open/close, and mobile responsiveness
 */
export function useMapViewControl({
    selectedTeam,
    selectedCity,
    isSidebarOpen,
    isMobile
}: UseMapViewControlProps) {
    const map = useMap();
    const prevTeam = useRef<string | null>(null);
    const initialAdjustmentDone = useRef(false);

    // Initial view adjustment for mobile
    useEffect(() => {
        if (isMobile && !initialAdjustmentDone.current) {
            map.setView(
                MAP_CONFIG.defaultCenter,
                MAP_CONFIG.mobileZoom,
                { animate: false }
            );
            initialAdjustmentDone.current = true;
        }
    }, [map, isMobile]);

    // Handle team selection - fit to team's cities
    useEffect(() => {
        // Only adjust when team selection changes
        if (selectedTeam === prevTeam.current) return;
        prevTeam.current = selectedTeam;

        if (!selectedTeam) {
            // When team is deselected, reset to default view
            map.setView(
                MAP_CONFIG.defaultCenter,
                isMobile ? MAP_CONFIG.mobileZoom : MAP_CONFIG.defaultZoom,
                { animate: true }
            );
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

        // Calculate actual span of cities
        const latSpan = maxLat - minLat;
        const lngSpan = maxLng - minLng;

        // Ensure minimum bounds span to prevent over-zooming
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        const effectiveLatSpan = Math.max(latSpan, TEAM_VIEW_CONFIG.minLatSpan);
        const effectiveLngSpan = Math.max(lngSpan, TEAM_VIEW_CONFIG.minLngSpan);

        const bounds: [[number, number], [number, number]] = [
            [
                centerLat - effectiveLatSpan / 2 - TEAM_VIEW_CONFIG.latPadding,
                centerLng - effectiveLngSpan / 2 - TEAM_VIEW_CONFIG.lngPadding
            ],
            [
                centerLat + effectiveLatSpan / 2 + TEAM_VIEW_CONFIG.latPadding,
                centerLng + effectiveLngSpan / 2 + TEAM_VIEW_CONFIG.lngPadding
            ]
        ];

        // Small delay to ensure map is ready
        setTimeout(() => {
            map.invalidateSize();

            // Fit map to team's cities with pixel padding
            const paddingOptions = isMobile
                ? { paddingTopLeft: [20, 20] as [number, number], paddingBottomRight: [20, 200] as [number, number] }
                : { padding: [40, 40] as [number, number] };

            map.fitBounds(bounds, {
                ...paddingOptions,
                maxZoom: TEAM_VIEW_CONFIG.maxZoom,
                animate: true
            });

            // Ensure minimum zoom level after fitBounds
            if (map.getZoom() < TEAM_VIEW_CONFIG.minZoomLevel) {
                map.setZoom(TEAM_VIEW_CONFIG.minZoomLevel, { animate: true });
            }
        }, TEAM_VIEW_CONFIG.adjustDelay);
    }, [selectedTeam, map, isMobile]);

    // Handle sidebar open/close and city selection
    useEffect(() => {
        if (!isMobile || !isSidebarOpen) {
            // On desktop or when sidebar is closed, use default bounds
            map.setMaxBounds(MAP_BOUNDS.default);
            return;
        }

        // On mobile with sidebar open
        const timeoutId = setTimeout(() => {
            map.invalidateSize();
            map.setMaxBounds(MAP_BOUNDS.mobileSidebar);

            // Only pan to city if no team is selected
            if (selectedCity && !selectedTeam) {
                const cityLat = selectedCity.lat;
                const cityLng = selectedCity.lng;

                const currentZoom = map.getZoom();
                const targetZoom = Math.max(currentZoom, SIDEBAR_VIEW_CONFIG.cityZoomLevel);

                // Calculate offset to position city in upper portion of map
                const mapHeight = map.getSize().y;
                const offsetLat = (mapHeight * 0.15) / Math.pow(2, targetZoom) * 0.5;

                map.setView([cityLat + offsetLat, cityLng], targetZoom, { animate: true });
            }
        }, SIDEBAR_VIEW_CONFIG.adjustDelay);

        return () => clearTimeout(timeoutId);
    }, [map, isSidebarOpen, isMobile, selectedCity, selectedTeam]);

    return null;
}
