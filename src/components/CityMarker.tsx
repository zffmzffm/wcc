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
}

export default function CityMarker({ city, onClick, isDimmed = false, isSelected = false }: CityMarkerProps) {
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
        const flashStyles = isFlashing ? `
            animation: markerFlash 0.5s ease-in-out 3;
        ` : '';

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <style>
                    @keyframes markerFlash {
                        0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
                        50% { transform: scale(1.4); box-shadow: 0 0 20px 8px ${color}88; }
                    }
                </style>
                <div style="
                    background: ${color};
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    cursor: pointer;
                    transition: transform 0.2s ease, opacity 0.3s ease;
                    opacity: ${opacity};
                    ${flashStyles}
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
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#2D5A3D' }}>{city.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{city.venue}</div>
            </Tooltip>
        </Marker>
    );
}
