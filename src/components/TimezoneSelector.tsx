'use client';
import { useState, useEffect } from 'react';

interface TimezoneSelectorProps {
    selectedTimezone: string | null;
    onSelect: (timezone: string | null) => void;
}

// Timezone list - Daylight Saving Time offsets during 2026 World Cup (June 11 - July 19)
// Northern Hemisphere: Uses DST
// Southern Hemisphere: Uses standard time (winter)
const timezones = [
    // North America - DST period
    { value: 'America/New_York', label: 'Eastern Time (EDT, UTC-4)', offset: '-4' },
    { value: 'America/Chicago', label: 'Central Time (CDT, UTC-5)', offset: '-5' },
    { value: 'America/Denver', label: 'Mountain Time (MDT, UTC-6)', offset: '-6' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PDT, UTC-7)', offset: '-7' },
    { value: 'America/Mexico_City', label: 'Mexico City (CST, UTC-6)', offset: '-6' }, // Mexico abolished DST in 2022
    { value: 'America/Toronto', label: 'Toronto (EDT, UTC-4)', offset: '-4' },
    { value: 'America/Vancouver', label: 'Vancouver (PDT, UTC-7)', offset: '-7' },
    // South America - June-July is winter in Southern Hemisphere, uses standard time
    { value: 'America/Sao_Paulo', label: 'Brasília (BRT, UTC-3)', offset: '-3' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART, UTC-3)', offset: '-3' },
    // Europe - DST period
    { value: 'Europe/London', label: 'British Summer (BST, UTC+1)', offset: '+1' },
    { value: 'Europe/Paris', label: 'Central European (CEST, UTC+2)', offset: '+2' }, // Paris/Berlin/Madrid/Rome
    // Asia - No DST
    { value: 'Asia/Tokyo', label: 'Tokyo (JST, UTC+9)', offset: '+9' },
    { value: 'Asia/Shanghai', label: 'Beijing (CST, UTC+8)', offset: '+8' },
    { value: 'Asia/Seoul', label: 'Seoul (KST, UTC+9)', offset: '+9' },
    // Oceania - June-July is winter in Southern Hemisphere, uses standard time
    { value: 'Australia/Sydney', label: 'Sydney (AEST, UTC+10)', offset: '+10' },
    { value: 'Pacific/Auckland', label: 'New Zealand (NZST, UTC+12)', offset: '+12' },
];

export default function TimezoneSelector({ selectedTimezone, onSelect }: TimezoneSelectorProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 600);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onSelect(value === '' ? null : value);
    };

    return (
        <div className="timezone-selector" role="search">
            <label htmlFor="timezone-select" className="visually-hidden">
                Select timezone
            </label>
            <div className="timezone-select-wrapper">
                <span className="select-icon" aria-hidden="true">🕐</span>
                <select
                    id="timezone-select"
                    value={selectedTimezone || ''}
                    onChange={handleChange}
                    className="timezone-select"
                    aria-label="Select timezone"
                >
                    <option value="">{isMobile ? 'TIME' : 'TIME ZONE'}</option>
                    <optgroup label="North America">
                        {timezones.filter(tz =>
                            tz.value.startsWith('America/') &&
                            !tz.value.includes('Sao_Paulo') &&
                            !tz.value.includes('Buenos_Aires')
                        ).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="South America">
                        {timezones.filter(tz =>
                            tz.value.includes('Sao_Paulo') ||
                            tz.value.includes('Buenos_Aires')
                        ).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Europe">
                        {timezones.filter(tz => tz.value.startsWith('Europe/')).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Asia">
                        {timezones.filter(tz => tz.value.startsWith('Asia/')).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Oceania">
                        {timezones.filter(tz => tz.value.startsWith('Australia/') || tz.value.startsWith('Pacific/')).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                </select>
            </div>
        </div>
    );
}

export { timezones };
