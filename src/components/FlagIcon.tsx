'use client';
import Image from 'next/image';
import { useState, memo, useEffect } from 'react';

interface FlagIconProps {
    code: string; // ISO 3166-1 alpha-2 country code (e.g., "US", "MX", "CA")
    size?: number; // Size in pixels (width)
    className?: string;
}

// Convert 3-letter or special codes to 2-letter ISO codes
const codeToISO2: Record<string, string> = {
    // North America (host countries - most common)
    'USA': 'us',
    'MEX': 'mx',
    'CAN': 'ca',
    // Participating countries
    'RSA': 'za', // South Africa
    'KOR': 'kr', // South Korea
    'BRA': 'br', // Brazil
    'MAR': 'ma', // Morocco
    'SCO': 'gb-sct', // Scotland
    'HAI': 'ht', // Haiti
    'PAR': 'py', // Paraguay
    'AUS': 'au', // Australia
    'GER': 'de', // Germany
    'ECU': 'ec', // Ecuador
    'CIV': 'ci', // Ivory Coast
    'CUW': 'cw', // Curaçao
    'NED': 'nl', // Netherlands
    'JPN': 'jp', // Japan
    'TUN': 'tn', // Tunisia
    'BEL': 'be', // Belgium
    'IRN': 'ir', // Iran
    'EGY': 'eg', // Egypt
    'NZL': 'nz', // New Zealand
    'ESP': 'es', // Spain
    'URU': 'uy', // Uruguay
    'KSA': 'sa', // Saudi Arabia
    'CPV': 'cv', // Cape Verde
    'FRA': 'fr', // France
    'SEN': 'sn', // Senegal
    'NOR': 'no', // Norway
    'ARG': 'ar', // Argentina
    'ALG': 'dz', // Algeria
    'AUT': 'at', // Austria
    'JOR': 'jo', // Jordan
    'POR': 'pt', // Portugal
    'UZB': 'uz', // Uzbekistan
    'COL': 'co', // Colombia
    'ENG': 'gb-eng', // England
    'CRO': 'hr', // Croatia
    'GHA': 'gh', // Ghana
    'PAN': 'pa', // Panama
    'QAT': 'qa', // Qatar
    'SUI': 'ch', // Switzerland
    // Playoff placeholders
    'PO_A': 'eu',
    'PO_B': 'eu',
    'PO_C': 'eu',
    'PO_D': 'eu',
    'PO_F1': 'un',
    'PO_F2': 'un',
};

// Cache for failed flags to avoid repeated load attempts
const failedFlags = new Set<string>();

// Preload common host country flags on module load
const preloadedFlags: string[] = ['us', 'mx', 'ca'];

export function getISO2Code(code: string): string {
    // Check if already a 2-letter code
    if (code.length === 2) {
        return code.toLowerCase();
    }
    // Find mapping
    return codeToISO2[code] || code.toLowerCase().slice(0, 2);
}

/**
 * Hook to preload flag images for common countries
 */
export function usePreloadFlags() {
    useEffect(() => {
        preloadedFlags.forEach(code => {
            const img = new window.Image();
            img.src = `https://flagcdn.com/w40/${code}.png`;
        });
    }, []);
}

/**
 * Memoized FlagIcon component to prevent unnecessary re-renders
 * Uses flagcdn.com CDN for flag images with fallback to emoji
 */
const FlagIcon = memo(function FlagIcon({ code, size = 20, className = '' }: FlagIconProps) {
    const [hasError, setHasError] = useState(false);
    const iso2 = getISO2Code(code);

    // Check cache for previously failed flags
    const wasPreviouslyFailed = failedFlags.has(iso2);

    // Use flagcdn.com CDN to get flag images
    const flagUrl = `https://flagcdn.com/w40/${iso2}.png`;
    const height = Math.round(size * 0.75);

    // Handle error and cache it
    const handleError = () => {
        failedFlags.add(iso2);
        setHasError(true);
    };

    // Fallback to emoji if image fails to load or was previously failed
    if (hasError || wasPreviouslyFailed) {
        return (
            <span
                className={`flag-icon flag-fallback ${className}`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size,
                    height: height,
                    fontSize: size * 0.8,
                    borderRadius: '2px',
                    backgroundColor: '#f3f4f6',
                }}
                aria-label={`${code} flag`}
            >
                🏳️
            </span>
        );
    }

    return (
        <Image
            src={flagUrl}
            alt={`${code} flag`}
            width={size}
            height={height}
            className={`flag-icon ${className}`}
            style={{
                objectFit: 'contain',
                verticalAlign: 'middle',
                borderRadius: '2px',
            }}
            loading="lazy"
            unoptimized // CDN images don't need Next.js optimization
            onError={handleError}
        />
    );
});

export default FlagIcon;
