'use client';

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { City } from '@/types';
import { DEFAULT_TIMEZONE } from '@/constants';

/**
 * URL parameter keys used for state synchronization
 */
const URL_PARAMS = {
    team: 'team',
    city: 'city',
    day: 'day',
    timezone: 'tz',
} as const;

const INITIAL_TEAM_CODE = 'CAN';
const INITIAL_CITY_ID = 'toronto';
const SERVER_SEARCH_SNAPSHOT = '__SERVER_SEARCH_SNAPSHOT__';

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

const EMPTY_URL_STATE: UrlState = {
    selectedTeam: null,
    selectedCity: null,
    selectedDay: null,
    selectedTimezone: null,
};

/** Build URL search string from state */
const buildUrlSearchString = (state: UrlState): string => {
    const params = new URLSearchParams();
    if (state.selectedTeam) params.set(URL_PARAMS.team, state.selectedTeam);
    if (state.selectedCity) params.set(URL_PARAMS.city, state.selectedCity.id);
    if (state.selectedDay) params.set(URL_PARAMS.day, state.selectedDay);
    if (state.selectedTimezone) params.set(URL_PARAMS.timezone, state.selectedTimezone);
    const str = params.toString();
    return str ? `?${str}` : '';
};

const urlChangeListeners = new Set<() => void>();

const emitUrlChange = () => {
    urlChangeListeners.forEach(listener => listener());
};

const getServerSearchSnapshot = () => SERVER_SEARCH_SNAPSHOT;

const getInitialUrlState = (cities: City[]): UrlState => ({
    selectedTeam: INITIAL_TEAM_CODE,
    selectedCity: cities.find(c => c.id === INITIAL_CITY_ID) || null,
    selectedDay: null,
    selectedTimezone: DEFAULT_TIMEZONE,
});

/** Parse URL search params into state values */
const parseUrlState = (cities: City[], search: string, useInitialDefaults: boolean): UrlState => {
    if (search === SERVER_SEARCH_SNAPSHOT) {
        return EMPTY_URL_STATE;
    }

    const params = new URLSearchParams(search);
    if (useInitialDefaults && Array.from(params.keys()).length === 0) {
        return getInitialUrlState(cities);
    }

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
};

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
    // Track how many history entries we've pushed (for canGoBack)
    const historyDepthRef = useRef(0);
    const searchSnapshotRef = useRef<string | null>(null);
    const [useInitialDefaults, setUseInitialDefaults] = useState(
        () => typeof window !== 'undefined' && window.location.search === ''
    );
    const [canGoBack, setCanGoBack] = useState(false);

    const getSearchSnapshot = useCallback(() => {
        if (searchSnapshotRef.current !== null) {
            return searchSnapshotRef.current;
        }
        return typeof window === 'undefined' ? '' : window.location.search;
    }, []);

    const subscribeToUrlChanges = useCallback((onStoreChange: () => void) => {
        if (typeof window === 'undefined') {
            return () => {};
        }

        const handlePopstate = () => {
            searchSnapshotRef.current = null;
            historyDepthRef.current = Math.max(0, historyDepthRef.current - 1);
            setCanGoBack(historyDepthRef.current > 0);
            onStoreChange();
        };

        urlChangeListeners.add(onStoreChange);
        window.addEventListener('popstate', handlePopstate);

        return () => {
            urlChangeListeners.delete(onStoreChange);
            window.removeEventListener('popstate', handlePopstate);
        };
    }, []);

    const currentSearch = useSyncExternalStore(
        subscribeToUrlChanges,
        getSearchSnapshot,
        getServerSearchSnapshot
    );

    const {
        selectedTeam,
        selectedCity,
        selectedDay,
        selectedTimezone,
    } = useMemo(
        () => parseUrlState(cities, currentSearch, useInitialDefaults),
        [cities, currentSearch, useInitialDefaults]
    );

    const pushUrlState = useCallback((state: UrlState) => {
        if (typeof window === 'undefined') return;

        const newSearch = buildUrlSearchString(state);
        if (!newSearch) {
            setUseInitialDefaults(false);
        }

        if (newSearch === currentSearch) return;

        const newUrl = window.location.pathname + newSearch;
        window.history.pushState(null, '', newUrl);
        searchSnapshotRef.current = newSearch;
        historyDepthRef.current++;
        setCanGoBack(true);
        emitUrlChange();
    }, [currentSearch]);

    const setSelectedTeam = useCallback((teamCode: string | null) => {
        pushUrlState({
            selectedTeam: teamCode,
            selectedCity,
            selectedDay,
            selectedTimezone,
        });
    }, [pushUrlState, selectedCity, selectedDay, selectedTimezone]);

    const setSelectedCity = useCallback((city: City | null) => {
        pushUrlState({
            selectedTeam,
            selectedCity: city,
            selectedDay,
            selectedTimezone,
        });
    }, [pushUrlState, selectedTeam, selectedDay, selectedTimezone]);

    const setSelectedDay = useCallback((day: string | null) => {
        pushUrlState({
            selectedTeam,
            selectedCity,
            selectedDay: day,
            selectedTimezone,
        });
    }, [pushUrlState, selectedTeam, selectedCity, selectedTimezone]);

    const handleTeamSelect = useCallback((teamCode: string | null) => {
        const nextCity = isMobile && teamCode ? null : selectedCity;
        const nextDay = isMobile && teamCode ? null : selectedDay;

        pushUrlState({
            selectedTeam: teamCode,
            selectedCity: nextCity,
            selectedDay: nextDay,
            selectedTimezone,
        });
    }, [isMobile, pushUrlState, selectedCity, selectedDay, selectedTimezone]);

    const handleCitySelect = useCallback((city: City | null) => {
        const nextTeam = city && isMobile ? null : selectedTeam;
        const nextDay = city ? null : selectedDay;

        pushUrlState({
            selectedTeam: nextTeam,
            selectedCity: city,
            selectedDay: nextDay,
            selectedTimezone,
        });
    }, [isMobile, pushUrlState, selectedTeam, selectedDay, selectedTimezone]);

    const handleDaySelect = useCallback((day: string | null) => {
        pushUrlState({
            selectedTeam: day ? null : selectedTeam,
            selectedCity: day ? null : selectedCity,
            selectedDay: day,
            selectedTimezone,
        });
    }, [pushUrlState, selectedTeam, selectedCity, selectedTimezone]);

    const handleTimezoneSelect = useCallback((tz: string | null) => {
        pushUrlState({
            selectedTeam,
            selectedCity,
            selectedDay,
            selectedTimezone: tz,
        });
    }, [pushUrlState, selectedTeam, selectedCity, selectedDay]);

    const resetSelections = useCallback(() => {
        setUseInitialDefaults(false);
        pushUrlState(EMPTY_URL_STATE);
    }, [pushUrlState]);

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
        resetSelections,

        // Navigation
        canGoBack,
        handleBack,
    };
}
