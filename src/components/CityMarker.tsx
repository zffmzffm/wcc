'use client';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

export interface City {
    id: string;
    name: string;
    country: string;
    countryCode: string;
    lat: number;
    lng: number;
    venue: string;
    capacity: number;
}

interface CityMarkerProps {
    city: City;
    onClick: () => void;
}

const getCountryColor = (country: string): string => {
    switch (country) {
        case 'USA':
            return '#1e40af'; // 蓝色
        case 'Mexico':
            return '#166534'; // 绿色
        case 'Canada':
            return '#dc2626'; // 红色
        default:
            return '#6b7280';
    }
};

export default function CityMarker({ city, onClick }: CityMarkerProps) {
    const color = getCountryColor(city.country);

    const customIcon = L.divIcon({
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
    });

    return (
        <Marker
            position={[city.lat, city.lng]}
            icon={customIcon}
            eventHandlers={{ click: onClick }}
        >
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{city.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{city.venue}</div>
            </Tooltip>
        </Marker>
    );
}
