'use client';
import Image from 'next/image';
import { useState, memo, useEffect } from 'react';

interface FlagIconProps {
    code: string;
    size?: number;
    className?: string;
}

// Convert FIFA/team codes and host-country codes to flagcdn-compatible codes.
const codeToISO2: Record<string, string> = {
    // North America hosts
    'USA': 'us',
    'MEX': 'mx',
    'CAN': 'ca',

    // Qualified teams
    'RSA': 'za',
    'KOR': 'kr',
    'BRA': 'br',
    'MAR': 'ma',
    'SCO': 'gb-sct',
    'HAI': 'ht',
    'PAR': 'py',
    'AUS': 'au',
    'GER': 'de',
    'ECU': 'ec',
    'CIV': 'ci',
    'CUW': 'cw',
    'NED': 'nl',
    'JPN': 'jp',
    'TUN': 'tn',
    'BEL': 'be',
    'IRN': 'ir',
    'EGY': 'eg',
    'NZL': 'nz',
    'ESP': 'es',
    'URU': 'uy',
    'KSA': 'sa',
    'CPV': 'cv',
    'FRA': 'fr',
    'SEN': 'sn',
    'NOR': 'no',
    'ARG': 'ar',
    'ALG': 'dz',
    'AUT': 'at',
    'JOR': 'jo',
    'POR': 'pt',
    'UZB': 'uz',
    'COL': 'co',
    'ENG': 'gb-eng',
    'CRO': 'hr',
    'GHA': 'gh',
    'PAN': 'pa',
    'QAT': 'qa',
    'SUI': 'ch',

    // Playoff placeholders
    'BIH': 'ba',
    'SWE': 'se',
    'TUR': 'tr',
    'CZE': 'cz',
    'COD': 'cd',
    'IRQ': 'iq',
    'TBD': 'xx',
};

const failedFlags = new Set<string>();
const preloadedFlags: string[] = ['us', 'mx', 'ca'];

export function getISO2Code(code: string): string {
    if (code.length === 2) {
        return code.toLowerCase();
    }

    return codeToISO2[code] || code.toLowerCase().slice(0, 2);
}

export function usePreloadFlags() {
    useEffect(() => {
        preloadedFlags.forEach(code => {
            const img = new window.Image();
            img.src = `https://flagcdn.com/w40/${code}.png`;
        });
    }, []);
}

const FlagIcon = memo(function FlagIcon({ code, size = 20, className = '' }: FlagIconProps) {
    const [hasError, setHasError] = useState(false);
    const iso2 = getISO2Code(code);
    const wasPreviouslyFailed = failedFlags.has(iso2);
    const flagUrl = `https://flagcdn.com/w40/${iso2}.png`;
    const height = Math.round(size * 0.75);

    const handleError = () => {
        failedFlags.add(iso2);
        setHasError(true);
    };

    if (hasError || wasPreviouslyFailed) {
        const fallbackLabel = code.toUpperCase();

        return (
            <span
                className={`flag-icon flag-fallback ${className}`}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: size,
                    height: height,
                    padding: '0 2px',
                    fontSize: size * 0.45,
                    fontWeight: 700,
                    lineHeight: 1,
                    borderRadius: '2px',
                    backgroundColor: '#f3f4f6',
                }}
                aria-label={`${code} flag`}
            >
                {fallbackLabel}
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
            unoptimized
            onError={handleError}
        />
    );
});

export default FlagIcon;
