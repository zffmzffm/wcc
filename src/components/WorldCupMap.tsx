'use client';
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CityMarker from './CityMarker';
import TeamFlightPath from './TeamFlightPath';
import MapLegendControl from './MapLegendControl';
import MatchDayLabels from './MatchDayLabels';
import LiveMatchStack from './LiveMatchStack';
import { useMapViewControl } from '@/hooks/useMapViewControl';
import { useLayerVisibility } from '@/contexts/LayerVisibilityContext';
import { useKnockoutPaths } from '@/hooks/useKnockoutPaths';
import { City, Match } from '@/types';
import { cities, matches, teams } from '@/data';
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

/**
 * Component to invalidate map size when container size changes (for CSS fullscreen on iOS)
 */
function MapSizeInvalidator({ isFullscreen }: { isFullscreen: boolean }) {
    const map = useMap();

    useEffect(() => {
        // Small delay to allow CSS transition to complete
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => clearTimeout(timer);
    }, [map, isFullscreen]);

    return null;
}

function MapInstanceTracker({ onMapReady }: { onMapReady: (map: L.Map | null) => void }) {
    const map = useMap();

    useEffect(() => {
        onMapReady(map);

        return () => onMapReady(null);
    }, [map, onMapReady]);

    return null;
}

interface MapControlStackProps {
    map: L.Map | null;
    canGoBack: boolean;
    onBack?: () => void;
    isFullscreen: boolean;
    onFullscreenToggle: () => void | Promise<void>;
    onShare: () => void | Promise<void>;
    shareState: 'idle' | 'copied';
}

function MapControlIconButton({
    children,
    label,
    title,
    onClick,
    disabled = false,
    className = ''
}: {
    children: React.ReactNode;
    label: string;
    title: string;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            className={`map-control-button ${className}`.trim()}
            onClick={() => { void onClick(); }}
            aria-label={label}
            title={title}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

function MapControlStack({
    map,
    canGoBack,
    onBack,
    isFullscreen,
    onFullscreenToggle,
    onShare,
    shareState
}: MapControlStackProps) {
    const [zoom, setZoom] = useState<number | null>(null);

    useEffect(() => {
        if (!map) {
            return;
        }

        const updateZoom = () => setZoom(map.getZoom());
        map.on('zoomend zoomlevelschange', updateZoom);

        return () => {
            map.off('zoomend zoomlevelschange', updateZoom);
        };
    }, [map]);

    const currentZoom = map?.getZoom() ?? zoom;
    const canZoomIn = !!map && currentZoom !== null && currentZoom < map.getMaxZoom();
    const canZoomOut = !!map && currentZoom !== null && currentZoom > map.getMinZoom();

    return (
        <div className="map-control-stack" aria-label="Map controls">
            <div className="map-control-group" role="group" aria-label="Zoom controls">
                <MapControlIconButton
                    label="Zoom in"
                    title="Zoom in"
                    onClick={() => {
                        map?.zoomIn();
                    }}
                    disabled={!canZoomIn}
                    className="map-control-zoom-in"
                >
                    <span aria-hidden="true">+</span>
                </MapControlIconButton>
                <MapControlIconButton
                    label="Zoom out"
                    title="Zoom out"
                    onClick={() => {
                        map?.zoomOut();
                    }}
                    disabled={!canZoomOut}
                    className="map-control-zoom-out"
                >
                    <span aria-hidden="true">-</span>
                </MapControlIconButton>
            </div>

            {canGoBack && onBack && (
                <MapControlIconButton
                    label="Go back to previous selection"
                    title="Go back"
                    onClick={() => {
                        onBack?.();
                    }}
                    className="map-control-back"
                >
                    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M8 5L4 9L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 9H12.5C14.7 9 16 10.3 16 12.1C16 13.9 14.7 15.2 12.5 15.2H10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </MapControlIconButton>
            )}

            <MapControlIconButton
                label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                onClick={onFullscreenToggle}
                className="map-control-fullscreen"
            >
                {isFullscreen ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M6.5 2.5H2.5V6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11.5 2.5H15.5V6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.5 15.5H2.5V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11.5 15.5H15.5V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M2.5 6.5V2.5H6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.5 6.5V2.5H11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.5 11.5V15.5H6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.5 11.5V15.5H11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </MapControlIconButton>

            <MapControlIconButton
                label="Share current map view"
                title={shareState === 'copied' ? 'Link copied' : 'Share'}
                onClick={onShare}
                className={`map-control-share ${shareState === 'copied' ? 'is-copied' : ''}`}
            >
                {shareState === 'copied' ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M3.5 9.2L7.2 12.9L14.8 5.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <circle cx="5" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="13" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="13" cy="13.5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M6.9 7.9L11.1 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M6.9 10.1L11.1 12.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                )}
            </MapControlIconButton>
        </div>
    );
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
    allKnockoutVenues,
    timezone,
    isFullscreen
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
    allKnockoutVenues: KnockoutVenue[];
    timezone: string;
    isFullscreen: boolean;
}) {
    // Get current team for knockout path calculation
    const currentTeam = teams.find(t => t.code === selectedTeam);

    // Get layer visibility
    const { visibility } = useLayerVisibility();
    const knockoutPaths = useKnockoutPaths(currentTeam?.group || '', allKnockoutVenues, cities, selectedTeam || undefined);

    // Calculate knockout path cities based on visible layers
    const knockoutCityIds = useMemo(() => {
        if (!selectedTeam || !currentTeam) return new Set<string>();

        const cityIds = new Set<string>();
        knockoutPaths
            .filter(path => visibility.scenarios[path.scenarioId] ?? false)
            .forEach(path => {
                path.matches.forEach(matchInfo => cityIds.add(matchInfo.city.id));
            });

        return cityIds;
    }, [selectedTeam, currentTeam, knockoutPaths, visibility.scenarios]);

    // Combine all highlighted city IDs
    const allHighlightedCityIds = useMemo(() => {
        const combined = new Set<string>();
        teamCityIds.forEach(id => combined.add(id));
        knockoutCityIds.forEach(id => combined.add(id));
        return combined;
    }, [teamCityIds, knockoutCityIds]);

    return (
        <>
            {/* Invalidate map size when fullscreen state changes (for iOS CSS fullscreen) */}
            <MapSizeInvalidator isFullscreen={isFullscreen} />
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
                        selectedTeam !== null
                            ? !allHighlightedCityIds.has(city.id)
                            : (selectedDay !== null && !dayCityIds.has(city.id))
                    }
                    isSelected={selectedCity?.id === city.id}
                    showLabel={selectedTeam === null && selectedDay === null}
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
                    key={selectedTeam}
                    teamCode={selectedTeam}
                    matches={matches}
                    cities={cities}
                    teams={teams}
                    knockoutVenues={allKnockoutVenues}
                    timezone={timezone}
                />
            )}

            {/* Path legend as Leaflet control */}
            {selectedTeam && <MapLegendControl knockoutPaths={knockoutPaths} />}
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
    const shareFeedbackTimerRef = useRef<number | null>(null);

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

    // Detect if device is iOS (doesn't support Fullscreen API)
    const isIOS = useMemo(() => {
        if (typeof navigator === 'undefined') return false;
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }, []);

    // Listen for fullscreen changes (for non-iOS devices)
    useEffect(() => {
        if (isIOS) return; // iOS uses CSS-based fullscreen

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [isIOS]);

    // Toggle fullscreen - uses native API on supported platforms, CSS on iOS
    const toggleFullscreen = useCallback(async () => {
        if (isIOS) {
            // iOS: use CSS-based fullscreen
            setIsFullscreen(prev => !prev);
        } else {
            // Other platforms: use native Fullscreen API
            try {
                if (!document.fullscreenElement) {
                    if (mapContainerRef.current) {
                        await mapContainerRef.current.requestFullscreen();
                    }
                } else {
                    await document.exitFullscreen();
                }
            } catch (error) {
                // Fallback to CSS if native fails
                console.warn('Native fullscreen failed, using CSS fallback:', error);
                setIsFullscreen(prev => !prev);
            }
        }
    }, [isIOS]);

    useEffect(() => {
        return () => {
            if (shareFeedbackTimerRef.current !== null) {
                window.clearTimeout(shareFeedbackTimerRef.current);
            }
        };
    }, []);

    const showShareCopied = useCallback(() => {
        setShareState('copied');

        if (shareFeedbackTimerRef.current !== null) {
            window.clearTimeout(shareFeedbackTimerRef.current);
        }

        shareFeedbackTimerRef.current = window.setTimeout(() => {
            setShareState('idle');
            shareFeedbackTimerRef.current = null;
        }, 1500);
    }, []);

    const copyShareUrl = useCallback(async (url: string) => {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textarea);
        }
    }, []);

    const handleShare = useCallback(async () => {
        const url = window.location.href;
        const title = document.title || 'Cup26Map';

        try {
            if (navigator.share) {
                await navigator.share({ title, url });
                return;
            }

            await copyShareUrl(url);
            showShareCopied();
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            try {
                await copyShareUrl(url);
                showShareCopied();
            } catch (clipboardError) {
                console.warn('Share failed:', clipboardError);
            }
        }
    }, [copyShareUrl, showShareCopied]);

    // Shared knockout venue schedule for paths and the match status stack
    const allKnockoutVenues = useMemo(() => matchRepository.getKnockoutVenues(), []);

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
        if (isIOS) {
            if (isFullscreen) setIsFullscreen(false);
        } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        }
        onCitySelect(city);
    }, [onCitySelect, isIOS, isFullscreen]);

    // Determine if CSS fullscreen class should be applied (iOS only)
    const cssFullscreenClass = isIOS && isFullscreen ? 'map-css-fullscreen' : '';

    return (
        <div
            ref={mapContainerRef}
            className={`map-fullscreen-wrapper ${cssFullscreenClass}`}
            style={{ height: '100%', width: '100%', position: 'relative' }}
        >
            <MapContainer
                center={MAP_CONFIG.defaultCenter}
                zoom={MAP_CONFIG.defaultZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                minZoom={MAP_CONFIG.minZoom}
                maxZoom={MAP_CONFIG.maxZoom}
                maxBounds={MAP_BOUNDS.default}
                maxBoundsViscosity={MAP_BOUNDS.default ? MAP_CONFIG.boundsViscosity : 0}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap, &copy; CartoDB'
                />
                <MapInstanceTracker onMapReady={setMapInstance} />
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
                    allKnockoutVenues={allKnockoutVenues}
                    timezone={timezone}
                    isFullscreen={isFullscreen}
                />
            </MapContainer>
            <LiveMatchStack
                matches={matches}
                knockoutVenues={allKnockoutVenues}
                cities={cities}
                teams={teams}
                timezone={timezone}
                onCitySelect={handleCitySelect}
            />
            <MapControlStack
                map={mapInstance}
                canGoBack={canGoBack}
                onBack={onBack}
                isFullscreen={isFullscreen}
                onFullscreenToggle={toggleFullscreen}
                onShare={handleShare}
                shareState={shareState}
            />
        </div>
    );
}
