'use client';
import { useMemo, useEffect, useState } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { City } from '@/types';
import { getCountryColor } from '@/utils/formatters';

interface CityMarkerProps {
    city: City;
    onClick: () => void;
    isDimmed?: boolean;
    isSelected?: boolean;
    showLabel?: boolean;
}
// Custom label directions for crowded city clusters to avoid overlap
const labelConfig: Record<string, { direction: 'top' | 'bottom' | 'left' | 'right'; offset: [number, number] }> = {
    // Vancouver & Seattle cluster — spread vertically
    'vancouver':     { direction: 'top',    offset: [0, -4] },
    'seattle':       { direction: 'right',  offset: [4, 0] },
    // Boston / New York / Philadelphia cluster — spread in different directions
    'boston':         { direction: 'right',  offset: [4, 0] },
    'new_york':      { direction: 'right',  offset: [4, 0] },
    'philadelphia':  { direction: 'bottom', offset: [0, 4] },
    // Guadalajara & Mexico City cluster
    'guadalajara':   { direction: 'left',   offset: [-4, 0] },
    'mexico_city':   { direction: 'right',  offset: [4, 0] },
};

const defaultLabelConfig = { direction: 'top' as const, offset: [0, -4] as [number, number] };

export default function CityMarker({ city, onClick, isDimmed = false, isSelected = false, showLabel = false }: CityMarkerProps) {
    const color = getCountryColor(city.country);
    const opacity = isDimmed ? 0.25 : 1;

    // Flash animation state - triggers when isSelected becomes true
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
        if (isSelected) {
            setIsFlashing(true);
            // Reset flash after animation completes
            const timer = setTimeout(() => setIsFlashing(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [isSelected]);

    // Memoize icon creation to avoid recreating on every render
    const customIcon = useMemo(() => {
        const flashClass = isFlashing ? 'marker-flashing' : '';

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="${flashClass}" style="
                    background: ${color};
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    cursor: pointer;
                    transition: transform 0.2s ease, opacity 0.3s ease;
                    opacity: ${opacity};
                "></div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });
    }, [color, opacity, isFlashing]);

    return (
        <Marker
            position={[city.lat, city.lng]}
            icon={customIcon}
            eventHandlers={{ click: onClick }}
            zIndexOffset={1000}  // Ensure markers appear above SVG paths
        >
            {showLabel && !isDimmed && (() => {
                const cfg = labelConfig[city.id] || defaultLabelConfig;
                return (
                    <Tooltip
                        direction={cfg.direction}
                        offset={cfg.offset}
                        permanent
                        className="city-permanent-label"
                    >
                        {city.name}
                    </Tooltip>
                );
            })()}
            {!showLabel && !isDimmed && (
                <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#2D5A3D' }}>{city.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{city.venue}</div>
                </Tooltip>
            )}
        </Marker>
    );
}
