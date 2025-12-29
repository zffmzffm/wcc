'use client';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

/**
 * useMapRefresh Hook
 * 
 * Forces a component re-render when the map moves or zooms.
 * This is commonly needed for SVG overlays that need to update
 * their pixel coordinates when the map view changes.
 * 
 * @returns A counter that increments on each map move/zoom
 */
export function useMapRefresh(): number {
    const map = useMap();
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const handleRefresh = () => setRefreshKey(prev => prev + 1);

        map.on('move', handleRefresh);
        map.on('zoom', handleRefresh);

        return () => {
            map.off('move', handleRefresh);
            map.off('zoom', handleRefresh);
        };
    }, [map]);

    return refreshKey;
}
