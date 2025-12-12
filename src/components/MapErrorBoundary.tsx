'use client';
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary for the Map component
 * Catches errors in the map rendering and displays a fallback UI
 */
export default class MapErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Map Error Boundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="map-error-container" role="alert">
                    <div className="map-error-content">
                        <span className="map-error-icon">🗺️</span>
                        <h2>Map Failed to Load</h2>
                        <p>Sorry, we encountered an error while loading the map.</p>
                        <p className="map-error-details">
                            {this.state.error?.message || 'Unknown error'}
                        </p>
                        <button
                            className="map-error-retry"
                            onClick={this.handleRetry}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
