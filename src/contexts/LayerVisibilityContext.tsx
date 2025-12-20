'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Layer visibility state management
 * Controls which flight path layers are visible on the map
 */

export interface LayerVisibility {
    groupStage: boolean;
    firstPlace: boolean;
    secondPlace: boolean;
    thirdPlace: boolean;
}

interface LayerVisibilityContextType {
    visibility: LayerVisibility;
    toggleLayer: (layer: keyof LayerVisibility) => void;
    setAllLayers: (visible: boolean) => void;
    setVisibility: (newVisibility: Partial<LayerVisibility>) => void;
    // Selected knockout path for map bounds fitting (0=1st, 1=2nd, 2=3rd, null=none)
    selectedKnockoutPath: number | null;
    fitBoundsTrigger: number; // Increments to trigger bounds fit
    selectKnockoutPath: (pathIndex: number) => void;
    resetToFirstPath: () => void; // Reset to default: Group Stage + 1st Place only
}

// Default visibility: Only Group Stage and 1st Place Path
const defaultVisibility: LayerVisibility = {
    groupStage: true,
    firstPlace: true,
    secondPlace: false,
    thirdPlace: false,
};

const LayerVisibilityContext = createContext<LayerVisibilityContextType | null>(null);

export function LayerVisibilityProvider({ children }: { children: ReactNode }) {
    const [visibility, setVisibilityState] = useState<LayerVisibility>(defaultVisibility);
    const [selectedKnockoutPath, setSelectedKnockoutPath] = useState<number | null>(0); // Default to 1st path
    const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);

    const toggleLayer = (layer: keyof LayerVisibility) => {
        setVisibilityState(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    const setAllLayers = (visible: boolean) => {
        setVisibilityState({
            groupStage: visible,
            firstPlace: visible,
            secondPlace: visible,
            thirdPlace: visible,
        });
    };

    const setVisibility = (newVisibility: Partial<LayerVisibility>) => {
        setVisibilityState(prev => ({ ...prev, ...newVisibility }));
    };

    const selectKnockoutPath = (pathIndex: number) => {
        setSelectedKnockoutPath(pathIndex);
        setFitBoundsTrigger(prev => prev + 1); // Trigger bounds fit
    };

    // Reset to default state: Group Stage + 1st Place Path only, Q-1st active
    const resetToFirstPath = () => {
        setVisibilityState({
            groupStage: true,
            firstPlace: true,
            secondPlace: false,
            thirdPlace: false,
        });
        setSelectedKnockoutPath(0);
    };

    return (
        <LayerVisibilityContext.Provider value={{
            visibility,
            toggleLayer,
            setAllLayers,
            setVisibility,
            selectedKnockoutPath,
            fitBoundsTrigger,
            selectKnockoutPath,
            resetToFirstPath
        }}>
            {children}
        </LayerVisibilityContext.Provider>
    );
}

export function useLayerVisibility() {
    const context = useContext(LayerVisibilityContext);
    if (!context) {
        throw new Error('useLayerVisibility must be used within a LayerVisibilityProvider');
    }
    return context;
}
