'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLayerVisibility, LayerVisibility } from '@/contexts/LayerVisibilityContext';

/**
 * MapLegendControl - Leaflet custom control for path legend with visibility toggles
 * 
 * Renders the legend as a native Leaflet control in the top-right corner,
 * with checkboxes to control each layer's visibility.
 */

interface LegendItem {
    key: keyof LayerVisibility;
    color: string;
    label: string;
    isDashed?: boolean;
    isChevron?: boolean;  // For group stage chevron arrows
}

const LEGEND_ITEMS: LegendItem[] = [
    { key: 'groupStage', color: '#2D5A3D', label: 'Group Stage', isChevron: true },
    { key: 'firstPlace', color: '#10B981', label: '1st Place Path', isChevron: true },
    { key: 'secondPlace', color: '#3B82F6', label: '2nd Place Path', isChevron: true },
    { key: 'thirdPlace', color: '#F59E0B', label: '3rd Place Path', isChevron: true },
];

/**
 * Renders the legend line/icon for each layer type
 */
function LegendIcon({ item, isVisible }: { item: LegendItem; isVisible: boolean }) {
    const opacity = isVisible ? 1 : 0.4;

    // Chevron style for group stage (matches the V-shaped arrows on map)
    if (item.isChevron) {
        return (
            <svg
                width="24"
                height="12"
                viewBox="0 0 24 12"
                className="legend-icon"
                style={{ opacity }}
            >
                {/* Draw 3 chevron arrows */}
                <path
                    d="M 1 2 L 4 6 L 1 10"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M 9 2 L 12 6 L 9 10"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M 17 2 L 20 6 L 17 10"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    // Dashed line for knockout paths
    if (item.isDashed) {
        return (
            <span
                className="legend-line"
                style={{
                    background: `repeating-linear-gradient(90deg, ${item.color} 0px, ${item.color} 6px, transparent 6px, transparent 10px)`,
                    opacity,
                }}
            />
        );
    }

    // Default solid line
    return (
        <span
            className="legend-line"
            style={{
                backgroundColor: item.color,
                opacity,
            }}
        />
    );
}

export default function MapLegendControl() {
    const map = useMap();
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const { visibility, toggleLayer } = useLayerVisibility();

    useEffect(() => {
        // Create custom Leaflet control
        const LegendControl = L.Control.extend({
            onAdd: function () {
                const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar map-legend-control');
                // Prevent map interactions when clicking on legend
                L.DomEvent.disableClickPropagation(div);
                L.DomEvent.disableScrollPropagation(div);
                return div;
            },
            onRemove: function () {
                setContainer(null);
            }
        });

        // Add control to map (top-right position)
        const control = new LegendControl({ position: 'topright' });
        control.addTo(map);

        // Get the container element and trigger re-render
        const containerEl = control.getContainer();
        if (containerEl) {
            setContainer(containerEl as HTMLDivElement);
        }

        return () => {
            control.remove();
        };
    }, [map]);

    // Render legend content via portal into the Leaflet control container
    if (!container) {
        return null;
    }

    return createPortal(
        <div className="map-legend-content">
            {LEGEND_ITEMS.map(item => (
                <label key={item.key} className="legend-item legend-item-clickable">
                    <input
                        type="checkbox"
                        className="legend-checkbox"
                        checked={visibility[item.key]}
                        onChange={() => toggleLayer(item.key)}
                    />
                    <LegendIcon item={item} isVisible={visibility[item.key]} />
                    <span
                        className="legend-text"
                        style={{ opacity: visibility[item.key] ? 1 : 0.5 }}
                    >
                        {item.label}
                    </span>
                </label>
            ))}
        </div>,
        container
    );
}


