'use client';
import { useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { City } from '@/types';
import { getCountryColor } from '@/utils/formatters';

interface CityMarkerProps {
    city: City;
    onClick: () => void;
}

export default function CityMarker({ city, onClick }: CityMarkerProps) {
    const color = getCountryColor(city.country);

    // Memoize icon creation to avoid recreating on every render
    const customIcon = useMemo(() => L.divIcon({
        className: 'custom-marker',
        html: `<div style="
      background: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      cursor: pointer;
      transition: transform 0.2s ease;
    "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    }), [color]);

    return (
        <Marker
            position={[city.lat, city.lng]}
            icon={customIcon}
            eventHandlers={{ click: onClick }}
        >
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#2D5A3D' }}>{city.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{city.venue}</div>
            </Tooltip>
        </Marker>
    );
}

// Re-export City type for backward compatibility
export type { City } from '@/types';
