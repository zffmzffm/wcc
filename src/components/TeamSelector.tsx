'use client';
import { useMemo, memo } from 'react';
import { Team } from '@/types';
import FlagIcon from './FlagIcon';

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

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onSelect(value === '' ? null : value);
    };

    // Get current selected team info
    const selectedTeamInfo = selectedTeam ? teams.find(t => t.code === selectedTeam) : null;

    return (
        <div className="team-selector" role="search">
            <label htmlFor="team-select" className="visually-hidden">
                Select team
            </label>
            <div className="team-select-wrapper">
                {selectedTeamInfo ? (
                    <span className="select-flag" aria-hidden="true">
                        <FlagIcon code={selectedTeamInfo.code} size={18} />
                    </span>
                ) : (
                    <span className="select-icon" aria-hidden="true">⚽</span>
                )}
                <select
                    id="team-select"
                    value={selectedTeam || ''}
                    onChange={handleChange}
                    className="team-select"
                    aria-expanded={!!selectedTeam}
                >
                    <option value="">TEAM</option>
                    {sortedGroups.map(group => (
                        <optgroup key={group} label={`Group ${group}`}>
                            {groupedTeams[group].map(team => (
                                <option key={team.code} value={team.code}>
                                    {team.name}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>
        </div>
    );
});

export default TeamSelector;
