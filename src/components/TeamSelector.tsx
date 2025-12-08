'use client';
import { Team } from '@/types';
import FlagIcon from './FlagIcon';

interface TeamSelectorProps {
    teams: Team[];
    selectedTeam: string | null;
    onSelect: (teamCode: string | null) => void;
}

// 按小组分组
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

export default function TeamSelector({ teams, selectedTeam, onSelect }: TeamSelectorProps) {
    const groupedTeams = groupBy(teams, 'group');
    const sortedGroups = Object.keys(groupedTeams).sort();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onSelect(value === '' ? null : value);
    };

    // 获取当前选中球队的信息
    const selectedTeamInfo = selectedTeam ? teams.find(t => t.code === selectedTeam) : null;

    return (
        <div className="team-selector" role="search">
            <label htmlFor="team-select" className="visually-hidden">
                选择球队
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
                        <optgroup key={group} label={`小组 ${group}`}>
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
}
