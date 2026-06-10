import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/constants';

const isMobileViewport = () => window.innerWidth <= BREAKPOINTS.mobile;

const isCompactSelectionViewport = () => (
    window.innerWidth <= BREAKPOINTS.mobile ||
    (window.innerWidth <= BREAKPOINTS.tablet && window.innerHeight >= window.innerWidth)
);

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && isMobileViewport()
    );

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(isMobileViewport());
        };
        
        // Initial check
        checkMobile();
        
        // Event listener
        window.addEventListener('resize', checkMobile);
        
        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

export function useIsCompactSelectionMode() {
    const [isCompactSelectionMode, setIsCompactSelectionMode] = useState(
        () => typeof window !== 'undefined' && isCompactSelectionViewport()
    );

    useEffect(() => {
        const checkCompactSelectionMode = () => {
            setIsCompactSelectionMode(isCompactSelectionViewport());
        };

        checkCompactSelectionMode();
        window.addEventListener('resize', checkCompactSelectionMode);

        return () => window.removeEventListener('resize', checkCompactSelectionMode);
    }, []);

    return isCompactSelectionMode;
}
