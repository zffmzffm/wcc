import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlState } from '@/hooks/useUrlState';
import { City } from '@/types';

// Mock cities data for tests
const mockCities: City[] = [
    { id: 'new_york', name: 'New York/New Jersey', country: 'USA', countryCode: 'USA', lat: 40.8136, lng: -74.0744, venue: 'MetLife Stadium', capacity: 82500 },
    { id: 'los_angeles', name: 'Los Angeles', country: 'USA', countryCode: 'USA', lat: 33.9534, lng: -118.3387, venue: 'SoFi Stadium', capacity: 70240 },
    { id: 'toronto', name: 'Toronto', country: 'Canada', countryCode: 'CAN', lat: 43.6332, lng: -79.4186, venue: 'BMO Field', capacity: 45736 },
];

describe('useUrlState', () => {
    // Save original object methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    // Spies
    let pushStateSpy: any;
    let replaceStateSpy: any;

    beforeEach(() => {
        // Reset URL to base
        Object.defineProperty(window, 'location', {
            value: new URL('http://localhost:3000/'),
            writable: true
        });

        // Setup spies
        pushStateSpy = vi.fn();
        replaceStateSpy = vi.fn();
        window.history.pushState = pushStateSpy;
        window.history.replaceState = replaceStateSpy;
    });

    afterEach(() => {
        // Restore
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
        vi.restoreAllMocks();
    });

    it('should initialize with null state when URL has no params', () => {
        window.location.search = '';
        
        const { result } = renderHook(() => useUrlState({ cities: mockCities, isMobile: false }));

        expect(result.current.selectedTeam).toBeNull();
        expect(result.current.selectedCity).toBeNull();
        expect(result.current.selectedDay).toBeNull();
        expect(result.current.selectedTimezone).toBeNull();
        expect(result.current.canGoBack).toBe(false);
    });

    it('should initialize correctly from URL with valid params', () => {
        window.location.search = '?team=USA&city=new_york&day=2026-06-11&tz=America/New_York';
        
        const { result } = renderHook(() => useUrlState({ cities: mockCities, isMobile: false }));

        expect(result.current.selectedTeam).toBe('USA');
        expect(result.current.selectedCity?.id).toBe('new_york');
        expect(result.current.selectedDay).toBe('2026-06-11');
        expect(result.current.selectedTimezone).toBe('America/New_York');
    });

    it('should ignore invalid city param', () => {
        window.location.search = '?city=atlantis';
        
        const { result } = renderHook(() => useUrlState({ cities: mockCities, isMobile: false }));

        expect(result.current.selectedCity).toBeNull();
    });

    it('should push state to URL when updates happen', () => {
        window.location.search = '';
        
        const { result } = renderHook(() => useUrlState({ cities: mockCities, isMobile: false }));

        act(() => {
            result.current.handleTeamSelect('BRA');
        });

        expect(result.current.selectedTeam).toBe('BRA');
        expect(pushStateSpy).toHaveBeenCalledTimes(1);
        
        // Output from new URLSearchParams('?team=BRA') could vary slightly in query notation, just verify the string includes it
        const pushedUrl = pushStateSpy.mock.calls[0][2];
        expect(pushedUrl).toContain('team=BRA');
        expect(result.current.canGoBack).toBe(true);
    });

    it('should handle clearing a param (setting to null)', () => {
        window.location.search = '?team=FRA&city=toronto';
        
        const { result } = renderHook(() => useUrlState({ cities: mockCities, isMobile: false }));

        expect(result.current.selectedTeam).toBe('FRA');
        expect(result.current.selectedCity?.id).toBe('toronto');

        act(() => {
            result.current.handleTeamSelect(null);
        });

        expect(result.current.selectedTeam).toBeNull();
        expect(result.current.selectedCity?.id).toBe('toronto');
        
        const pushedUrl = pushStateSpy.mock.calls[pushStateSpy.mock.calls.length - 1][2];
        expect(pushedUrl).not.toContain('team=FRA');
        expect(pushedUrl).toContain('city=toronto');
    });

    it('should handle popstate events (browser back/forward)', () => {
        window.location.search = '?team=ARG';
        
        const { result } = renderHook(() => useUrlState({ cities: mockCities, isMobile: false }));

        expect(result.current.selectedTeam).toBe('ARG');

        // Simulate user clicking back button to an empty query
        act(() => {
            window.location.search = '';
            const event = new PopStateEvent('popstate');
            window.dispatchEvent(event);
        });

        // The state should be updated to null because search is now empty
        expect(result.current.selectedTeam).toBeNull();
    });
});
