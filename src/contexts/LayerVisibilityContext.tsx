'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

/**
 * Layer visibility state management.
 * Controls group-stage visibility plus dynamic knockout scenario ids.
 */

export interface LayerVisibility {
    groupStage: boolean;
    scenarios: Record<string, boolean>;
}

interface LayerVisibilityContextType {
    visibility: LayerVisibility;
    toggleLayer: (layer: string) => void;
    setAllLayers: (visible: boolean, scenarioIds?: string[]) => void;
    setVisibility: (newVisibility: Partial<LayerVisibility>) => void;
    selectedKnockoutPath: string | null;
    fitBoundsTrigger: number;
    selectKnockoutPath: (scenarioId: string) => void;
    resetToFirstPath: () => void;
}

const FIRST_SCENARIO_ID = '1st';

const defaultVisibility: LayerVisibility = {
    groupStage: true,
    scenarios: {
        [FIRST_SCENARIO_ID]: true,
    },
};

const LayerVisibilityContext = createContext<LayerVisibilityContextType | null>(null);

export function LayerVisibilityProvider({ children }: { children: ReactNode }) {
    const [visibility, setVisibilityState] = useState<LayerVisibility>(defaultVisibility);
    const [selectedKnockoutPath, setSelectedKnockoutPath] = useState<string | null>(FIRST_SCENARIO_ID);
    const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);

    const toggleLayer = useCallback((layer: string) => {
        setVisibilityState(prev => {
            if (layer === 'groupStage') {
                return { ...prev, groupStage: !prev.groupStage };
            }

            return {
                ...prev,
                scenarios: {
                    ...prev.scenarios,
                    [layer]: !(prev.scenarios[layer] ?? false),
                },
            };
        });
    }, []);

    const setAllLayers = useCallback((visible: boolean, scenarioIds?: string[]) => {
        setVisibilityState(prev => {
            const ids = scenarioIds || Object.keys(prev.scenarios);
            return {
                groupStage: visible,
                scenarios: Object.fromEntries(ids.map(id => [id, visible])),
            };
        });
    }, []);

    const setVisibility = useCallback((newVisibility: Partial<LayerVisibility>) => {
        setVisibilityState(prev => ({
            groupStage: newVisibility.groupStage ?? prev.groupStage,
            scenarios: newVisibility.scenarios
                ? { ...newVisibility.scenarios }
                : prev.scenarios,
        }));
    }, []);

    const selectKnockoutPath = useCallback((scenarioId: string) => {
        setSelectedKnockoutPath(scenarioId);
        setFitBoundsTrigger(prev => prev + 1);
    }, []);

    const resetToFirstPath = useCallback(() => {
        setVisibilityState(defaultVisibility);
        setSelectedKnockoutPath(FIRST_SCENARIO_ID);
    }, []);

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
