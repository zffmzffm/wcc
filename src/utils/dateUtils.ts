import { TOURNAMENT_START } from '@/constants';

/**
 * Extract match day from ISO datetime string (YYYY-MM-DD).
 * Matches before 6am EDT are considered part of the previous day's schedule.
 */
export function getMatchDay(datetime: string): string {
    const date = new Date(datetime);
    // Format in EDT timezone
    const edtFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
    });
    const parts = edtFormatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);

    // If before 6am EDT, count as previous day
    if (hour < 6) {
        const prevDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
        const prevParts = edtFormatter.formatToParts(prevDate);
        const prevYear = prevParts.find(p => p.type === 'year')?.value;
        const prevMonth = prevParts.find(p => p.type === 'month')?.value;
        const prevDay = prevParts.find(p => p.type === 'day')?.value;
        return `${prevYear}-${prevMonth}-${prevDay}`;
    }

    return `${year}-${month}-${day}`;
}

/**
 * Calculate tournament day number from a date string.
 * June 11, 2026 = Day 1.
 */
export function getTournamentDayNum(dateStr: string): number {
    const [year, month, day] = dateStr.split('-').map(Number);
    const startParts = TOURNAMENT_START.split('-').map(Number);
    const startDate = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);
    const currentDate = Date.UTC(year, month - 1, day);
    return Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Calculate the difference in calendar days between the local timezone date and the official tournament match day.
 * Returns +1 if local is tomorrow, -1 if local is yesterday, 0 if same day.
 */
export function getDayDifference(datetime: string, timezone: string): number {
    const matchDayStr = getMatchDay(datetime);
    
    const tzFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    // Some engines format en-CA differently (it should be YYYY-MM-DD)
    const parts = tzFormatter.formatToParts(new Date(datetime));
    const tzYear = parts.find(p => p.type === 'year')?.value;
    const tzMonth = parts.find(p => p.type === 'month')?.value;
    const tzDay = parts.find(p => p.type === 'day')?.value;
    const localDateStr = `${tzYear}-${tzMonth}-${tzDay}`;
    
    if (localDateStr === matchDayStr) return 0;
    
    const [mYear, mMonth, mDay] = matchDayStr.split('-').map(Number);
    const [lYear, lMonth, lDay] = localDateStr.split('-').map(Number);
    
    const mDate = Date.UTC(mYear, mMonth - 1, mDay);
    const lDate = Date.UTC(lYear, lMonth - 1, lDay);
    
    return Math.round((lDate - mDate) / (1000 * 60 * 60 * 24));
}
