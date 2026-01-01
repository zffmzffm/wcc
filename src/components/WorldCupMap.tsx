'use client';
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CityMarker from './CityMarker';
import TeamFlightPath from './TeamFlightPath';
import MapLegendControl from './MapLegendControl';
import MatchDayLabels from './MatchDayLabels';
import { useMapViewControl } from '@/hooks/useMapViewControl';
import { useLayerVisibility } from '@/contexts/LayerVisibilityContext';
import { City, Match, Team } from '@/types';
import { cities, matches, teams, knockoutVenues } from '@/data';
import { knockoutPathTemplates, thirdPlacePathTemplates } from '@/data/knockoutBracket';
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
    canGoBack?: boolean;
    onBack?: () => void;
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
    // Get current team for knockout path calculation
    const currentTeam = teams.find(t => t.code === selectedTeam);

    // Get layer visibility
    const { visibility } = useLayerVisibility();

    // Calculate knockout path cities based on visible layers
    const knockoutCityIds = useMemo(() => {
        if (!selectedTeam || !currentTeam) return new Set<string>();

        const groupId = currentTeam.group;
        const allKnockoutVenues = matchRepository.getKnockoutVenues();
        const venueMap = new Map(allKnockoutVenues.map(v => [v.matchId, v]));

        const cityIds = new Set<string>();

        // Get templates for this group
        const mainTemplates = knockoutPathTemplates.filter(t => t.groupId === groupId);
        const thirdTemplate = thirdPlacePathTemplates.find(t => t.groupId === groupId);

        // Add cities for 1st place path if visible
        if (visibility.firstPlace) {
            const template = mainTemplates.find(t => t.position === 1);
            template?.path.forEach(matchId => {
                const venue = venueMap.get(matchId);
                if (venue) cityIds.add(venue.cityId);
            });
        }

        // Add cities for 2nd place path if visible
        if (visibility.secondPlace) {
            const template = mainTemplates.find(t => t.position === 2);
            template?.path.forEach(matchId => {
                const venue = venueMap.get(matchId);
                if (venue) cityIds.add(venue.cityId);
            });
        }

        // Add cities for 3rd place path if visible
        if (visibility.thirdPlace && thirdTemplate) {
            thirdTemplate.path.forEach(matchId => {
                const venue = venueMap.get(matchId);
                if (venue) cityIds.add(venue.cityId);
            });
        }

        return cityIds;
    }, [selectedTeam, currentTeam, visibility.firstPlace, visibility.secondPlace, visibility.thirdPlace]);

    // Combine all highlighted city IDs
    const allHighlightedCityIds = useMemo(() => {
        const combined = new Set<string>();
        teamCityIds.forEach(id => combined.add(id));
        knockoutCityIds.forEach(id => combined.add(id));
        return combined;
    }, [teamCityIds, knockoutCityIds, selectedTeam]);

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
                        (selectedTeam !== null && !allHighlightedCityIds.has(city.id)) ||
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
    timezone = DEFAULT_TIMEZONE,
    canGoBack = false,
    onBack
}: WorldCupMapProps) {
    // Ref for map container element
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Toggle fullscreen for map container
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                if (mapContainerRef.current) {
                    await mapContainerRef.current.requestFullscreen();
                }
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    }, []);

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

    // Wrapper for city selection that exits fullscreen
    const handleCitySelect = useCallback((city: City | null) => {
        // Exit fullscreen if currently in fullscreen mode
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        }
        onCitySelect(city);
    }, [onCitySelect]);

    return (
        <div
            ref={mapContainerRef}
            className="map-fullscreen-wrapper"
            style={{ height: '100%', width: '100%', position: 'relative' }}
        >
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
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap, &copy; CartoDB'
                />
                <MapContent
                    selectedTeam={selectedTeam}
                    selectedCity={selectedCity}
                    selectedDay={selectedDay}
                    dayMatches={dayMatches}
                    dayKnockoutVenues={dayKnockoutVenues}
                    onCitySelect={handleCitySelect}
                    isSidebarOpen={isSidebarOpen}
                    isMobile={isMobile}
                    teamCityIds={teamCityIds}
                    dayCityIds={dayCityIds}
                    timezone={timezone}
                />
            </MapContainer>
            {/* Back button overlay */}
            {canGoBack && onBack && (
                <button
                    className="map-back-button"
                    onClick={onBack}
                    aria-label="Go back to previous selection"
                    title="返回上一步"
                >
                    ↩
                </button>
            )}
            {/* Fullscreen toggle button */}
            <button
                className="map-fullscreen-button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "退出全屏" : "全屏显示"}
            >
                {isFullscreen ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 1H1V5" />
                        <path d="M11 1H15V5" />
                        <path d="M5 15H1V11" />
                        <path d="M11 15H15V11" />
                        <rect x="6" y="6" width="4" height="4" fill="currentColor" stroke="none" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 5V1H5" />
                        <path d="M15 5V1H11" />
                        <path d="M1 11V15H5" />
                        <path d="M15 11V15H11" />
                    </svg>
                )}
            </button>
        </div>
    );
}
