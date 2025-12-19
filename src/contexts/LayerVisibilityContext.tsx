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
}

const defaultVisibility: LayerVisibility = {
    groupStage: true,
    firstPlace: true,
    secondPlace: true,
    thirdPlace: true,
};

const LayerVisibilityContext = createContext<LayerVisibilityContextType | null>(null);

export function LayerVisibilityProvider({ children }: { children: ReactNode }) {
    const [visibility, setVisibility] = useState<LayerVisibility>(defaultVisibility);

    const toggleLayer = (layer: keyof LayerVisibility) => {
        setVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    const setAllLayers = (visible: boolean) => {
        setVisibility({
            groupStage: visible,
            firstPlace: visible,
            secondPlace: visible,
            thirdPlace: visible,
        });
    };

    return (
        <LayerVisibilityContext.Provider value={{ visibility, toggleLayer, setAllLayers }}>
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
