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
    selectedDay: string | null;
    dayCityIds: Set<string>;
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
    selectedDay,
    dayCityIds,
    isSidebarOpen,
    isMobile
}: UseMapViewControlProps) {
    const map = useMap();
    const prevTeam = useRef<string | null>(null);
    const prevDay = useRef<string | null>(null);
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

    // Handle match day selection - fit to day's cities
    useEffect(() => {
        // Only adjust when day selection changes
        if (selectedDay === prevDay.current) return;
        prevDay.current = selectedDay;

        // Don't adjust if team is selected (team view takes precedence)
        if (selectedTeam) return;

        if (!selectedDay || dayCityIds.size === 0) {
            // When day is deselected, reset to default view
            if (!selectedCity) {
                map.setView(
                    MAP_CONFIG.defaultCenter,
                    isMobile ? MAP_CONFIG.mobileZoom : MAP_CONFIG.defaultZoom,
                    { animate: true }
                );
            }
            return;
        }

        // Find all cities with matches on this day
        const dayCities = cities.filter(c => dayCityIds.has(c.id));

        if (dayCities.length === 0) return;

        // Create bounds that encompass all day's cities
        const lats = dayCities.map(c => c.lat);
        const lngs = dayCities.map(c => c.lng);

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
                centerLat - effectiveLatSpan / 2 - 1,  // Reduced padding for tighter fit
                centerLng - effectiveLngSpan / 2 - 2
            ],
            [
                centerLat + effectiveLatSpan / 2 + 1,
                centerLng + effectiveLngSpan / 2 + 2
            ]
        ];

        // Small delay to ensure map is ready
        setTimeout(() => {
            map.invalidateSize();

            // Use symmetric padding to center cities in the map view
            // The sidebar overlays the map but we want cities centered in the visible area
            const padding = isMobile ? 40 : 80;

            map.fitBounds(bounds, {
                padding: [padding, padding] as [number, number],
                maxZoom: 8,  // Allow closer zoom for day view
                animate: true
            });
        }, TEAM_VIEW_CONFIG.adjustDelay);
    }, [selectedDay, selectedTeam, selectedCity, dayCityIds, map, isMobile]);

    // Handle city selection - zoom to city when selected (desktop and mobile)
    useEffect(() => {
        // Only zoom if city selected and team/day is not (team view takes precedence)
        if (!selectedCity || selectedTeam || selectedDay) return;

        const timeoutId = setTimeout(() => {
            map.invalidateSize();

            if (isMobile && isSidebarOpen) {
                // Mobile with sidebar - adjust bounds and position city in upper portion
                map.setMaxBounds(MAP_BOUNDS.mobileSidebar);

                const cityLat = selectedCity.lat;
                const cityLng = selectedCity.lng;

                const currentZoom = map.getZoom();
                const targetZoom = Math.max(currentZoom, SIDEBAR_VIEW_CONFIG.cityZoomLevel);

                // Calculate offset to position city in upper portion of map
                const mapHeight = map.getSize().y;
                const offsetLat = (mapHeight * 0.15) / Math.pow(2, targetZoom) * 0.5;

                map.setView([cityLat + offsetLat, cityLng], targetZoom, { animate: true });
            } else {
                // Desktop - zoom to city center
                map.setMaxBounds(MAP_BOUNDS.default);
                map.setView(
                    [selectedCity.lat, selectedCity.lng],
                    SIDEBAR_VIEW_CONFIG.cityZoomLevel + 1,  // Slightly more zoom on desktop
                    { animate: true }
                );
            }
        }, SIDEBAR_VIEW_CONFIG.adjustDelay);

        return () => clearTimeout(timeoutId);
    }, [map, selectedCity, selectedTeam, isSidebarOpen, isMobile]);

    // Handle sidebar close - reset bounds
    useEffect(() => {
        if (!isSidebarOpen && isMobile) {
            map.setMaxBounds(MAP_BOUNDS.default);
        }
    }, [map, isSidebarOpen, isMobile]);

    return null;
}
