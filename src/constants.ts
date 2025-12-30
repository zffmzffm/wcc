/**
 * Application Constants
 * Centralized configuration for magic numbers and common values
 */

// =============================================================================
// Breakpoints
// =============================================================================
export const BREAKPOINTS = {
    mobile: 600,
    tablet: 1024,
} as const;

// =============================================================================
// Map Configuration
// =============================================================================
export const MAP_CONFIG = {
    defaultCenter: [39.8283, -98.5795] as [number, number],  // North America center
    defaultZoom: 4,
    minZoom: 2,
    maxZoom: 10,
    mobileZoom: 3,
    boundsViscosity: 0.3,
} as const;

export const MAP_BOUNDS = {
    // Default bounds for the map - very relaxed for flexible viewing
    default: [
        [-15, -160],  // Southwest corner (very relaxed)
        [65, -40]     // Northeast corner (relaxed)
    ] as [[number, number], [number, number]],

    // Adjusted bounds when sidebar is open on mobile
    mobileSidebar: [
        [0, -160],   // Southwest corner - relaxed to equator
        [65, -40]    // Northeast corner (same as default)
    ] as [[number, number], [number, number]],
} as const;

export const TEAM_VIEW_CONFIG = {
    minLatSpan: 5,     // Minimum 5 degrees latitude span (reduced from 12 for tighter zoom)
    minLngSpan: 7,     // Minimum 7 degrees longitude span (reduced from 15 for tighter zoom)
    latPadding: 1.5,   // Latitude padding (reduced from 2)
    lngPadding: 2,     // Longitude padding (reduced from 3)
    maxZoom: 6,        // Limit max zoom for consistency (increased from 5)
    minZoomLevel: 3,   // Minimum zoom level after fitBounds
    adjustDelay: 100,  // Delay before adjusting view (ms)
} as const;

export const SIDEBAR_VIEW_CONFIG = {
    adjustDelay: 150,  // Delay for sidebar open/close adjustments (ms)
    cityZoomLevel: 5,  // Zoom level when focusing on city
} as const;

// =============================================================================
// Animation Configuration
// =============================================================================
export const ANIMATION_CONFIG = {
    segmentDelay: 600,       // Delay between revealing flight segments (ms)
    fadeInDuration: 300,     // CSS fade-in animation duration (ms)
} as const;

// =============================================================================
// Flight Path Configuration
// =============================================================================
export const FLIGHT_PATH_CONFIG = {
    curvature: 0.4,           // Arc curvature for flight paths
    chevronSpacing: 18,       // Spacing between chevron arrows (pixels)
    loopRadius: 20,           // Radius for same-city loop paths
    loopChevronSpacing: 12,   // Chevron spacing for loop paths

    // Marker sizes
    markerRadius: 10,
    activeMarkerRadius: 14,
    markerWeight: 3,

    // Colors
    pathColor: '#2D5A3D',
    glowColor: 'rgba(45, 90, 61, 0.3)',
} as const;

// =============================================================================
// City Label Configuration
// =============================================================================
export const CITY_LABEL_CONFIG = {
    offset: 20,           // Distance from marker center (pixels)
    fontSize: '18px',
    fontWeight: 700,
    fillColor: '#2D5A3D',
    strokeColor: '#fff',
    strokeWidth: '4px',
} as const;

// =============================================================================
// Padding Configuration
// =============================================================================
export const PADDING_CONFIG = {
    desktop: [40, 40] as [number, number],
    mobileTop: [20, 20] as [number, number],
    mobileBottom: [20, 200] as [number, number],
    fitBounds: [80, 80] as [number, number],
} as const;

// =============================================================================
// Timezone Defaults
// =============================================================================
export const DEFAULT_TIMEZONE = 'America/Toronto';

// =============================================================================
// SVG Configuration
// =============================================================================
export const SVG_CONFIG = {
    zIndex: 400,
    // Note: Leaflet map-pane uses z-index 400, so all our overlays must be higher
    groupPathZIndex: 401,    // Group stage paths (above map, bottom of our layers)
    knockoutPathZIndex: 405, // Knockout paths (above group stage)
    knockoutLabelZIndex: 408, // Knockout labels (above knockout paths)
    labelZIndex: 412,        // Group stage labels (top layer, above knockout labels)
} as const;

// =============================================================================
// Stage Names - Knockout stage display labels
// =============================================================================
export const STAGE_NAMES = {
    // Full names for sidebars and detailed views
    full: {
        'R32': 'Round of 32',
        'R16': 'Round of 16',
        'QF': 'Quarter-Final',
        'SF': 'Semi-Final',
        'F': 'Final',
        '3P': 'Third Place'
    },
    // Short names for map labels and compact views
    short: {
        'R32': 'R32',
        'R16': 'R16',
        'QF': 'QF',
        'SF': 'SF',
        'F': 'Final',
        '3P': '3P'
    },
    // Chinese names for localization
    zh: {
        'R32': '32强赛',
        'R16': '16强赛',
        'QF': '四分之一决赛',
        'SF': '半决赛',
        'F': '决赛',
        '3P': '季军赛'
    }
} as const;
