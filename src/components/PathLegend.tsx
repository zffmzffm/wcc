'use client';

/**
 * PathLegend - Color legend for flight path types
 * 
 * Shows the meaning of different path colors:
 * - Group stage (solid green)
 * - 1st place knockout path (green dashed)
 * - 2nd place knockout path (blue dashed)
 * - 3rd place knockout path (orange dashed)
 */

interface LegendItem {
    color: string;
    label: string;
    isDashed?: boolean;
}

const LEGEND_ITEMS: LegendItem[] = [
    { color: '#2D5A3D', label: 'Group Stage' },
    { color: '#D4AF37', label: '1st Place Path', isDashed: true },
    { color: '#A0B8A0', label: '2nd Place Path', isDashed: true },
    { color: '#D08080', label: '3rd Place Path', isDashed: true },
];

export default function PathLegend() {
    return (
        <div className="path-legend" role="region" aria-label="Path Legend">
            {LEGEND_ITEMS.map(item => (
                <div key={item.label} className="legend-item">
                    <span
                        className="legend-color"
                        style={item.isDashed
                            ? {
                                background: `repeating-linear-gradient(90deg, ${item.color} 0px, ${item.color} 6px, transparent 6px, transparent 10px)`,
                                backgroundColor: 'transparent'
                            }
                            : { backgroundColor: item.color }
                        }
                        aria-hidden="true"
                    />
                    <span className="legend-label">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

