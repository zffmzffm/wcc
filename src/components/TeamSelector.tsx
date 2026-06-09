'use client';
import { useMemo, memo } from 'react';
import { Team } from '@/types';
import FlagIcon from './FlagIcon';
import DropdownSelect from './DropdownSelect';

interface TeamSelectorProps {
    teams: Team[];
    selectedTeam: string | null;
    onSelect: (teamCode: string | null) => void;
}

// Group by key
const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
};

const TeamSelector = memo(function TeamSelector({ teams, selectedTeam, onSelect }: TeamSelectorProps) {
    const groupedTeams = useMemo(() => groupBy(teams, 'group'), [teams]);
    const sortedGroups = useMemo(() => Object.keys(groupedTeams).sort(), [groupedTeams]);
    const dropdownGroups = useMemo(() => (
        sortedGroups.map(group => ({
            label: `Group ${group}`,
            items: groupedTeams[group].map(team => ({
                value: team.code,
                label: team.name,
            })),
        }))
    ), [groupedTeams, sortedGroups]);

    // Get current selected team info
    const selectedTeamInfo = selectedTeam ? teams.find(t => t.code === selectedTeam) : null;

    return (
        <div className="team-selector" role="search">
            <label htmlFor="team-select" className="visually-hidden">
                Select team
            </label>
            <DropdownSelect
                id="team-select"
                ariaLabel="Select team"
                wrapperClassName="team-select-wrapper"
                selectClassName="team-select"
                placeholder="TEAM"
                selectedValue={selectedTeam}
                groups={dropdownGroups}
                icon={selectedTeamInfo ? (
                    <span className="select-flag" aria-hidden="true">
                        <FlagIcon code={selectedTeamInfo.code} size={18} />
                    </span>
                ) : (
                    <span className="select-icon" aria-hidden="true">⚽</span>
                )}
                onSelect={onSelect}
            />
        </div>
    );
});

export default TeamSelector;
