'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface HoverMatchContextType {
    hoveredMatchId: number | null;
    setHoveredMatchId: (id: number | null) => void;
}

const HoverMatchContext = createContext<HoverMatchContextType | undefined>(undefined);

export function HoverMatchProvider({ children }: { children: ReactNode }) {
    const [hoveredMatchId, setHoveredMatchIdState] = useState<number | null>(null);

    const setHoveredMatchId = useCallback((id: number | null) => {
        setHoveredMatchIdState(id);
    }, []);

    return (
        <HoverMatchContext.Provider value={{ hoveredMatchId, setHoveredMatchId }}>
            {children}
        </HoverMatchContext.Provider>
    );
}

export function useHoverMatch() {
    const context = useContext(HoverMatchContext);
    if (context === undefined) {
        throw new Error('useHoverMatch must be used within a HoverMatchProvider');
    }
    return context;
}
