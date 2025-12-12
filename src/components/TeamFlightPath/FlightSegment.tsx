'use client';
import { useMemo, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { MatchWithCoords, FlightSegment } from '@/types';
import { FLIGHT_PATH_CONFIG } from '@/constants';
import { generateArcPath, generateChevronPath, generateLoopPath, generateLoopChevronPath } from '@/utils/pathGenerators';

interface FlightSegmentProps {
    segment: FlightSegment;
    isNew: boolean;
    animationKey: number;
    index: number;
}

/**
 * Renders a single flight segment with arc path and chevron arrows
 */
export default function FlightSegmentComponent({ segment, isNew, animationKey, index }: FlightSegmentProps) {
    const map = useMap();

    // Convert lat/lng to pixel coordinates
    const latLngToPixel = useCallback((coords: [number, number]): { x: number; y: number } => {
        const point = map.latLngToContainerPoint(coords);
        return { x: point.x, y: point.y };
    }, [map]);

    const startPixel = latLngToPixel(segment.from);
    const endPixel = latLngToPixel(segment.to);

    // Same city: draw small loop
    if (segment.isSameCity) {
        const loopGlowPath = generateLoopPath(startPixel, FLIGHT_PATH_CONFIG.loopRadius);
        const loopChevronPath = generateLoopChevronPath(
            startPixel,
            FLIGHT_PATH_CONFIG.loopRadius,
            FLIGHT_PATH_CONFIG.loopChevronSpacing
        );

        return (
            <g
                key={`segment-${animationKey}-${index}`}
                className={isNew ? 'segment-fade-in' : ''}
            >
                {/* Loop path base (glow effect) */}
                <path
                    d={loopGlowPath}
                    className="flight-path-glow"
                />
                {/* Loop main path - arrows only */}
                <path
                    d={loopChevronPath}
                    className="flight-path-chevron"
                    markerMid="url(#chevron-marker)"
                />
            </g>
        );
    }

    // Normal flight path
    const glowPathD = generateArcPath(startPixel, endPixel, FLIGHT_PATH_CONFIG.curvature);
    const chevronPathD = generateChevronPath(
        startPixel,
        endPixel,
        FLIGHT_PATH_CONFIG.curvature,
        FLIGHT_PATH_CONFIG.chevronSpacing
    );

    return (
        <g
            key={`segment-${animationKey}-${index}`}
            className={isNew ? 'segment-fade-in' : ''}
        >
            {/* Path base (glow effect) */}
            <path
                d={glowPathD}
                className="flight-path-glow"
            />
            {/* Main path - use chevron arrows to indicate direction */}
            <path
                d={chevronPathD}
                className="flight-path-chevron"
                markerMid="url(#chevron-marker)"
            />
        </g>
    );
}
