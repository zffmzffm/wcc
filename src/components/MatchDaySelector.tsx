'use client';
import { useMemo } from 'react';
import { Match } from '@/types';
import { KnockoutVenue } from '@/repositories/types';
import { getMatchDay } from '@/utils/dateUtils';
import { TOURNAMENT_START } from '@/constants';
import DropdownSelect from './DropdownSelect';

interface MatchDaySelectorProps {
    matches: Match[];
    knockoutVenues: KnockoutVenue[];
    selectedDay: string | null;
    onSelect: (day: string | null) => void;
}

// Format a date for display: "June 11, Day 1"
function formatMatchDay(dateStr: string): { display: string; dayNum: number } {
    // Parse the date parts directly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);

    // Get month name
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];

    // Calculate tournament day number
    const startParts = TOURNAMENT_START.split('-').map(Number);
    const startDate = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);
    const currentDate = Date.UTC(year, month - 1, day);
    const dayNum = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    return {
        display: `${monthName} ${day}, Day ${dayNum}`,
        dayNum
    };
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

    // Group by month for menu sections
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

    // Get selected day display info
    const selectedDayInfo = selectedDay
        ? matchDays.find(d => d.value === selectedDay)
        : null;
    const dropdownGroups = useMemo(() => (
        Object.entries(groupedByMonth).map(([month, days]) => ({
            label: month,
            items: days.map(day => ({
                value: day.value,
                label: day.display,
            })),
        }))
    ), [groupedByMonth]);

    return (
        <div className="matchday-selector" role="search">
            <label htmlFor="matchday-select" className="visually-hidden">
                Select match day
            </label>
            <DropdownSelect
                id="matchday-select"
                ariaLabel="Select match day"
                wrapperClassName="matchday-select-wrapper"
                selectClassName="matchday-select"
                placeholder="DAY"
                selectedValue={selectedDay}
                groups={dropdownGroups}
                icon={(
                    <span className="select-icon" aria-hidden="true">
                        {selectedDayInfo ? '📅' : '🗓️'}
                    </span>
                )}
                onSelect={onSelect}
            />
        </div>
    );
}
