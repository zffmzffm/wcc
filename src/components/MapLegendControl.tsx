'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLayerVisibility } from '@/contexts/LayerVisibilityContext';
import type { KnockoutPath } from '@/hooks/useKnockoutPaths';
import { isGrayKnockoutPathState } from '@/utils/knockoutResults';
import type { KnockoutPathDisplayState } from '@/utils/knockoutResults';

/**
 * MapLegendControl - Leaflet custom control for path legend with visibility toggles
 * 
 * Renders the legend as a native Leaflet control in the top-right corner,
 * with checkboxes to control each layer's visibility.
 */

interface LegendItem {
    key: string;
    color: string;
    label: string;
    isDashed?: boolean;
    isChevron?: boolean;  // For group stage chevron arrows
    displayState?: KnockoutPathDisplayState;
}

interface MapLegendControlProps {
    knockoutPaths: KnockoutPath[];
}

/**
 * Renders the legend line/icon for each layer type
 */
function LegendIcon({ item, isVisible }: { item: LegendItem; isVisible: boolean }) {
    const isGrayState = item.displayState ? isGrayKnockoutPathState(item.displayState) : false;
    const opacity = isVisible ? (isGrayState ? 0.55 : 1) : 0.4;
    const chevronStrokeWidth = isGrayState ? 1.6 : 2;

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
                    strokeWidth={chevronStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M 9 2 L 12 6 L 9 10"
                    fill="none"
                    stroke={item.color}
                    strokeWidth={chevronStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M 17 2 L 20 6 L 17 10"
                    fill="none"
                    stroke={item.color}
                    strokeWidth={chevronStrokeWidth}
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

export default function MapLegendControl({ knockoutPaths }: MapLegendControlProps) {
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
        let containerTimer: number | undefined;
        const containerEl = control.getContainer();
        if (containerEl) {
            containerTimer = window.setTimeout(() => {
                setContainer(containerEl as HTMLDivElement);
            }, 0);
        }

        return () => {
            if (containerTimer !== undefined) {
                window.clearTimeout(containerTimer);
            }
            control.remove();
        };
    }, [map]);

    // Render legend content via portal into the Leaflet control container
    if (!container) {
        return null;
    }

    const legendItems: LegendItem[] = [
        { key: 'groupStage', color: '#2D5A3D', label: 'Group Stage', isChevron: true },
        ...knockoutPaths.map(path => ({
            key: path.scenarioId,
            color: path.color,
            label: path.label,
            isChevron: true,
            displayState: path.displayState,
        })),
    ];

    return createPortal(
        <div className="map-legend-content">
            {legendItems.map(item => {
                const isVisible = item.key === 'groupStage'
                    ? visibility.groupStage
                    : visibility.scenarios[item.key] ?? false;

                return (
                    <label
                        key={item.key}
                        className={[
                            'legend-item',
                            'legend-item-clickable',
                            item.displayState && item.displayState !== 'open' ? `is-${item.displayState}` : '',
                        ].filter(Boolean).join(' ')}
                    >
                        <input
                            type="checkbox"
                            className="legend-checkbox"
                            checked={isVisible}
                            onChange={() => toggleLayer(item.key)}
                        />
                        <LegendIcon item={item} isVisible={isVisible} />
                        <span
                            className="legend-text"
                            style={{ opacity: isVisible ? 1 : 0.5 }}
                        >
                            {item.label}
                        </span>
                    </label>
                );
            })}
        </div>,
        container
    );
}


