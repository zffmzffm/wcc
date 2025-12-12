import { useState, useEffect, useRef } from 'react';
import { FlightSegment, MatchWithCoords } from '@/types';
import { ANIMATION_CONFIG } from '@/constants';

interface RenderedSegment {
    segment: FlightSegment;
    isNew: boolean;
}

interface UseFlightAnimationReturn {
    renderedSegments: RenderedSegment[];
    renderedMarkers: number[];
    animationKey: number;
}

/**
 * Hook to manage the animated reveal of flight segments and markers
 * Handles cumulative addition without triggering re-render of already rendered content
 */
export function useFlightAnimation(
    teamCode: string,
    teamMatches: MatchWithCoords[],
    flightSegments: FlightSegment[]
): UseFlightAnimationReturn {
    const [visibleCount, setVisibleCount] = useState(0);
    const [renderedSegments, setRenderedSegments] = useState<RenderedSegment[]>([]);
    const [renderedMarkers, setRenderedMarkers] = useState<number[]>([]);
    const animationKeyRef = useRef(0);

    // Reset animation when team changes
    useEffect(() => {
        animationKeyRef.current += 1;
        setRenderedSegments([]);
        setRenderedMarkers([]);
        setVisibleCount(0);
    }, [teamCode]);

    // Animation reveal - cumulative addition
    useEffect(() => {
        if (teamMatches.length === 0) return;

        if (visibleCount < teamMatches.length) {
            const timer = setTimeout(() => {
                // First time: show first two markers and first flight segment simultaneously
                if (visibleCount === 0 && teamMatches.length >= 2) {
                    setRenderedMarkers([0, 1]);
                    if (flightSegments[0]) {
                        setRenderedSegments([{ segment: flightSegments[0], isNew: true }]);
                    }
                    setVisibleCount(2);
                } else {
                    // Subsequent: add one marker and one flight segment at a time
                    setRenderedMarkers(prev => [...prev, visibleCount]);

                    if (flightSegments[visibleCount - 1]) {
                        setRenderedSegments(prev => {
                            const updated = prev.map(item => ({ ...item, isNew: false }));
                            return [...updated, { segment: flightSegments[visibleCount - 1], isNew: true }];
                        });
                    }

                    setVisibleCount(prev => prev + 1);
                }
            }, ANIMATION_CONFIG.segmentDelay);

            return () => clearTimeout(timer);
        }
    }, [teamMatches.length, visibleCount, flightSegments]);

    return {
        renderedSegments,
        renderedMarkers,
        animationKey: animationKeyRef.current
    };
}
