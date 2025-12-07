'use client';
import { Team } from './CityPopup';
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
        <div className="team-selector">
            <div className="team-select-wrapper">
                {selectedTeamInfo && (
                    <span className="select-flag">
                        <FlagIcon code={selectedTeamInfo.code} size={18} />
                    </span>
                )}
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
                                    {team.name}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>
            {selectedTeamInfo && (
                <>
                    <button
                        className="clear-selection"
                        onClick={() => onSelect(null)}
                        aria-label="清除选择"
                    >
                        ✕
                    </button>
                    <span className="team-group-badge">小组 {selectedTeamInfo.group}</span>
                </>
            )}
        </div>
    );
}
