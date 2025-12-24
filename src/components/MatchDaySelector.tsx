'use client';
import { useMemo } from 'react';
import { Match } from '@/types';
import { KnockoutVenue } from '@/repositories/types';

interface MatchDaySelectorProps {
    matches: Match[];
    knockoutVenues: KnockoutVenue[];
    selectedDay: string | null;
    onSelect: (day: string | null) => void;
}

// Tournament start date for Day X calculation (June 11, 2026)
const TOURNAMENT_START_STR = '2026-06-11';

// Format a date for display: "June 11, Day 1"
function formatMatchDay(dateStr: string): { display: string; dayNum: number } {
    // Parse the date parts directly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);

    // Get month name
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];

    // Calculate tournament day number
    // Start is 2026-06-11, so June 11 = Day 1, June 12 = Day 2, etc.
    const startParts = TOURNAMENT_START_STR.split('-').map(Number);
    const startDate = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);
    const currentDate = Date.UTC(year, month - 1, day);
    const dayNum = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    return {
        display: `${monthName} ${day}, Day ${dayNum}`,
        dayNum
    };
}

// Extract match day from ISO datetime string (YYYY-MM-DD)
// Matches before 6am EDT are considered part of the previous day's schedule
function getMatchDay(datetime: string): string {
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

export default function MatchDaySelector({
    matches,
    knockoutVenues,
    selectedDay,
    onSelect
}: MatchDaySelectorProps) {
    // Generate sorted unique match days
    const matchDays = useMemo(() => {
        const dateSet = new Set<string>();

        // Add group stage match dates
        matches.forEach(m => dateSet.add(getMatchDay(m.datetime)));

        // Add knockout match dates
        knockoutVenues.forEach(v => dateSet.add(getMatchDay(v.datetime)));

        // Sort dates chronologically and create display objects
        return Array.from(dateSet)
            .sort()
            .map(dateStr => ({
                value: dateStr,
                ...formatMatchDay(dateStr)
            }));
    }, [matches, knockoutVenues]);

    // Group by month for optgroups
    const groupedByMonth = useMemo(() => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const groups: Record<string, typeof matchDays> = {};
        matchDays.forEach(day => {
            const month = parseInt(day.value.split('-')[1], 10);
            const monthName = monthNames[month - 1];
            if (!groups[monthName]) groups[monthName] = [];
            groups[monthName].push(day);
        });
        return groups;
    }, [matchDays]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onSelect(value === '' ? null : value);
    };

    // Get selected day display info
    const selectedDayInfo = selectedDay
        ? matchDays.find(d => d.value === selectedDay)
        : null;

    return (
        <div className="matchday-selector" role="search">
            <label htmlFor="matchday-select" className="visually-hidden">
                Select match day
            </label>
            <div className="matchday-select-wrapper">
                <span className="select-icon" aria-hidden="true">
                    {selectedDayInfo ? '📅' : '📆'}
                </span>
                <select
                    id="matchday-select"
                    value={selectedDay || ''}
                    onChange={handleChange}
                    className="matchday-select"
                    aria-expanded={!!selectedDay}
                >
                    <option value="">DAY</option>
                    {Object.entries(groupedByMonth).map(([month, days]) => (
                        <optgroup key={month} label={month}>
                            {days.map(day => (
                                <option key={day.value} value={day.value}>
                                    {day.display}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>
        </div>
    );
}
