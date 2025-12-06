'use client';
import { Team } from './CityPopup';

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

    return (
        <div className="team-selector">
            <select
                value={selectedTeam || ''}
                onChange={handleChange}
                className="team-select"
            >
                <option value="">🌍 选择球队查看行程</option>
                {sortedGroups.map(group => (
                    <optgroup key={group} label={`小组 ${group}`}>
                        {groupedTeams[group].map(team => (
                            <option key={team.code} value={team.code}>
                                {team.flag} {team.name}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
            {selectedTeam && (
                <button
                    className="clear-selection"
                    onClick={() => onSelect(null)}
                    aria-label="清除选择"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
