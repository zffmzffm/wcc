'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { City } from '@/types';

/**
 * URL parameter keys used for state synchronization
 */
const URL_PARAMS = {
    team: 'team',
    city: 'city',
    day: 'day',
    timezone: 'tz',
} as const;

interface UrlState {
    selectedTeam: string | null;
    selectedCity: City | null;
    selectedDay: string | null;
    selectedTimezone: string | null;
}

interface UseUrlStateOptions {
    cities: City[];
    isMobile: boolean;
}

/**
 * Custom hook that synchronizes app selection state with URL search params.
 *
 * Features:
 * - On mount: reads URL params and initializes state
 * - On state change: pushes new URL entry (enables browser back/forward)
 * - On popstate: restores state from URL (browser back/forward)
 * - Shareable URLs: e.g. ?team=BRA&city=miami&day=2026-06-14&tz=Asia/Tokyo
 */
export function useUrlState({ cities, isMobile }: UseUrlStateOptions) {
    // Track whether we're currently handling a popstate event
    const isPopstateRef = useRef(false);
    // Track whether initial URL has been read
    const initializedRef = useRef(false);
    // Track previous URL string to avoid duplicate pushState calls
    const lastUrlRef = useRef('');
    // Track how many history entries we've pushed (for canGoBack)
    const historyDepthRef = useRef(0);

    // Reactive canGoBack state (updates when historyDepth changes)
    const [canGoBack, setCanGoBack] = useState(false);

    // --- State ---
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);

    // --- Helpers ---

    /** Build URL search string from state */
    const buildSearchString = useCallback((state: UrlState): string => {
        const params = new URLSearchParams();
        if (state.selectedTeam) params.set(URL_PARAMS.team, state.selectedTeam);
        if (state.selectedCity) params.set(URL_PARAMS.city, state.selectedCity.id);
        if (state.selectedDay) params.set(URL_PARAMS.day, state.selectedDay);
        if (state.selectedTimezone) params.set(URL_PARAMS.timezone, state.selectedTimezone);
        const str = params.toString();
        return str ? `?${str}` : '';
    }, []);

    /** Parse URL search params into state values */
    const parseUrl = useCallback((): UrlState => {
        const params = new URLSearchParams(window.location.search);
        const teamCode = params.get(URL_PARAMS.team);
        const cityId = params.get(URL_PARAMS.city);
        const day = params.get(URL_PARAMS.day);
        const tz = params.get(URL_PARAMS.timezone);

        return {
            selectedTeam: teamCode || null,
            selectedCity: cityId ? cities.find(c => c.id === cityId) || null : null,
            selectedDay: day || null,
            selectedTimezone: tz || null,
        };
    }, [cities]);

    /** Apply a parsed state to all state setters */
    const applyState = useCallback((state: UrlState) => {
        setSelectedTeam(state.selectedTeam);
        setSelectedCity(state.selectedCity);
        setSelectedDay(state.selectedDay);
        setSelectedTimezone(state.selectedTimezone);
    }, []);

    // --- Initialize from URL on mount ---
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const state = parseUrl();
        applyState(state);
        lastUrlRef.current = buildSearchString(state);
    }, [parseUrl, applyState, buildSearchString]);

    // --- Push URL when state changes ---
    useEffect(() => {
        // Skip during initialization and popstate handling
        if (!initializedRef.current || isPopstateRef.current) return;

        const state: UrlState = { selectedTeam, selectedCity, selectedDay, selectedTimezone };
        const newSearch = buildSearchString(state);

        // Only push if URL actually changed
        if (newSearch !== lastUrlRef.current) {
            const newUrl = window.location.pathname + newSearch;
            window.history.pushState(null, '', newUrl);
            lastUrlRef.current = newSearch;
            historyDepthRef.current++;
            setCanGoBack(true);
        }
    }, [selectedTeam, selectedCity, selectedDay, selectedTimezone, buildSearchString]);

    // --- Listen for popstate (browser back/forward) ---
    useEffect(() => {
        const handlePopstate = () => {
            isPopstateRef.current = true;
            const state = parseUrl();
            applyState(state);
            lastUrlRef.current = buildSearchString(state);

            // Update depth tracking
            historyDepthRef.current = Math.max(0, historyDepthRef.current - 1);
            setCanGoBack(historyDepthRef.current > 0);

            // Reset the flag after React processes the state updates
            requestAnimationFrame(() => {
                isPopstateRef.current = false;
            });
        };

        window.addEventListener('popstate', handlePopstate);
        return () => window.removeEventListener('popstate', handlePopstate);
    }, [parseUrl, applyState, buildSearchString]);

    // --- Selection handlers with mutual exclusion logic ---

    const handleTeamSelect = useCallback((teamCode: string | null) => {
        setSelectedTeam(teamCode);
        if (isMobile && teamCode) {
            setSelectedCity(null);
            setSelectedDay(null);
        }
    }, [isMobile]);

    const handleCitySelect = useCallback((city: City | null) => {
        setSelectedCity(city);
        if (city) {
            setSelectedDay(null); // City and day are mutually exclusive
            if (isMobile) {
                setSelectedTeam(null);
            }
        }
    }, [isMobile]);

    const handleDaySelect = useCallback((day: string | null) => {
        setSelectedDay(day);
        if (day) {
            setSelectedCity(null);  // Day and city are mutually exclusive
            setSelectedTeam(null);  // Day and team are mutually exclusive
        }
    }, []);

    const handleTimezoneSelect = useCallback((tz: string | null) => {
        setSelectedTimezone(tz);
    }, []);

    // canGoBack is already reactive state (updated when history depth changes)

    const handleBack = useCallback(() => {
        window.history.back();
    }, []);

    return {
        // State
        selectedTeam,
        selectedCity,
        selectedDay,
        selectedTimezone,

        // Direct setters (for closing sidebars etc.)
        setSelectedTeam,
        setSelectedCity,
        setSelectedDay,

        // Selection handlers (with mutual exclusion)
        handleTeamSelect,
        handleCitySelect,
        handleDaySelect,
        handleTimezoneSelect,

        // Navigation
        canGoBack,
        handleBack,
    };
}
