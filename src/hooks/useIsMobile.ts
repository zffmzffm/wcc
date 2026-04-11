import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/constants';

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= BREAKPOINTS.mobile);
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
