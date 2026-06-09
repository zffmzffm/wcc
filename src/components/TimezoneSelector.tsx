'use client';
import { memo, useMemo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import DropdownSelect from './DropdownSelect';

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

const TimezoneSelector = memo(function TimezoneSelector({ selectedTimezone, onSelect }: TimezoneSelectorProps) {
    const isMobile = useIsMobile();
    const dropdownGroups = useMemo(() => [
        {
            label: 'North America',
            items: timezones
                .filter(tz =>
                    tz.value.startsWith('America/') &&
                    !tz.value.includes('Sao_Paulo') &&
                    !tz.value.includes('Buenos_Aires')
                )
                .map(tz => ({ value: tz.value, label: tz.label })),
        },
        {
            label: 'South America',
            items: timezones
                .filter(tz =>
                    tz.value.includes('Sao_Paulo') ||
                    tz.value.includes('Buenos_Aires')
                )
                .map(tz => ({ value: tz.value, label: tz.label })),
        },
        {
            label: 'Europe',
            items: timezones
                .filter(tz => tz.value.startsWith('Europe/'))
                .map(tz => ({ value: tz.value, label: tz.label })),
        },
        {
            label: 'Asia',
            items: timezones
                .filter(tz => tz.value.startsWith('Asia/'))
                .map(tz => ({ value: tz.value, label: tz.label })),
        },
        {
            label: 'Oceania',
            items: timezones
                .filter(tz => tz.value.startsWith('Australia/') || tz.value.startsWith('Pacific/'))
                .map(tz => ({ value: tz.value, label: tz.label })),
        },
    ], []);
    const placeholder = isMobile ? 'TIME' : 'TIME ZONE';

    return (
        <div className="timezone-selector" role="search">
            <label htmlFor="timezone-select" className="visually-hidden">
                Select timezone
            </label>
            <DropdownSelect
                id="timezone-select"
                ariaLabel="Select timezone"
                wrapperClassName="timezone-select-wrapper"
                selectClassName="timezone-select"
                placeholder={placeholder}
                selectedValue={selectedTimezone}
                groups={dropdownGroups}
                icon={<span className="select-icon" aria-hidden="true">🕐</span>}
                onSelect={onSelect}
            />
        </div>
    );
});

export default TimezoneSelector;

export { timezones };
