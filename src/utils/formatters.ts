import { Team } from '@/types';

/**
 * Format datetime for display
 */
export const formatDateTime = (datetime: string): { date: string; time: string } => {
    const d = new Date(datetime);
    const date = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
    const time = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return { date, time };
};

/**
 * Format datetime for specified timezone
 * @param datetime ISO format datetime string
 * @param timezone IANA timezone name, e.g. 'America/New_York'
 */
export const formatDateTimeWithTimezone = (
    datetime: string,
    timezone: string
): { date: string; time: string } => {
    const d = new Date(datetime);
    const date = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        timeZone: timezone
    });
    const time = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone
    });
    return { date, time };
};

/**
 * Format datetime for short display (used in flight path popups)
 */
export const formatDateTimeShort = (datetime: string): { date: string; time: string } => {
    const d = new Date(datetime);
    const date = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
    const time = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return { date, time };
};

/**
 * Get team display information
 */
export const getTeamDisplay = (
    teamCode: string,
    teams: Team[]
): { name: string; code: string; flag: string } => {
    const team = teams.find(t => t.code === teamCode);
    return team
        ? { name: team.name, code: team.code, flag: team.flag }
        : { name: teamCode, code: teamCode, flag: '🏳️' };
};

/**
 * Get country flag emoji by country name
 */
export const getCountryFlag = (country: string): string => {
    switch (country) {
        case 'USA':
            return '🇺🇸';
        case 'Mexico':
            return '🇲🇽';
        case 'Canada':
            return '🇨🇦';
        default:
            return '🏳️';
    }
};

/**
 * Get country code by country name
 */
export const getCountryCode = (country: string): string => {
    switch (country) {
        case 'USA':
            return 'USA';
        case 'Mexico':
            return 'MEX';
        case 'Canada':
            return 'CAN';
        default:
            return country;
    }
};

/**
 * Get theme color by country name
 */
export const getCountryColor = (country: string): string => {
    switch (country) {
        case 'USA':
            return '#1e40af';
        case 'Mexico':
            return '#166534';
        case 'Canada':
            return '#dc2626';
        default:
            return '#6b7280';
    }
};
