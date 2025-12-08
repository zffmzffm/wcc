'use client';

interface TimezoneSelectorProps {
    selectedTimezone: string;
    onSelect: (timezone: string) => void;
}

// 常用时区列表 - 2026世界杯期间 (6月11日-7月19日) 的夏令时偏移
// 北半球：使用夏令时 (DST)
// 南半球：使用标准时间 (冬季)
const timezones = [
    // 北美 - 夏令时期间
    { value: 'America/New_York', label: '美东夏令时 (EDT, UTC-4)', offset: '-4' },
    { value: 'America/Chicago', label: '美中夏令时 (CDT, UTC-5)', offset: '-5' },
    { value: 'America/Denver', label: '美山夏令时 (MDT, UTC-6)', offset: '-6' },
    { value: 'America/Los_Angeles', label: '美西夏令时 (PDT, UTC-7)', offset: '-7' },
    { value: 'America/Mexico_City', label: '墨西哥城时间 (CST, UTC-6)', offset: '-6' }, // 墨西哥2022年取消夏令时
    { value: 'America/Toronto', label: '多伦多夏令时 (EDT, UTC-4)', offset: '-4' },
    { value: 'America/Vancouver', label: '温哥华夏令时 (PDT, UTC-7)', offset: '-7' },
    // 南美 - 6-7月是南半球冬季，使用标准时间
    { value: 'America/Sao_Paulo', label: '巴西利亚时间 (BRT, UTC-3)', offset: '-3' },
    { value: 'America/Argentina/Buenos_Aires', label: '布宜诺斯艾利斯时间 (ART, UTC-3)', offset: '-3' },
    // 欧洲 - 夏令时期间
    { value: 'Europe/London', label: '英国夏令时 (BST, UTC+1)', offset: '+1' },
    { value: 'Europe/Paris', label: '中欧夏令时 (CEST, UTC+2)', offset: '+2' }, // 巴黎/柏林/马德里/罗马
    // 亚洲 - 无夏令时
    { value: 'Asia/Tokyo', label: '东京时间 (JST, UTC+9)', offset: '+9' },
    { value: 'Asia/Shanghai', label: '北京时间 (CST, UTC+8)', offset: '+8' },
    { value: 'Asia/Seoul', label: '首尔时间 (KST, UTC+9)', offset: '+9' },
    // 大洋洲 - 6-7月是南半球冬季，使用标准时间
    { value: 'Australia/Sydney', label: '悉尼标准时 (AEST, UTC+10)', offset: '+10' },
    { value: 'Pacific/Auckland', label: '新西兰标准时 (NZST, UTC+12)', offset: '+12' },
];

// 获取时区显示名称
const getTimezoneLabel = (value: string): string => {
    const tz = timezones.find(t => t.value === value);
    return tz ? tz.label : value;
};

export default function TimezoneSelector({ selectedTimezone, onSelect }: TimezoneSelectorProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSelect(e.target.value);
    };

    return (
        <div className="timezone-selector" role="search">
            <label htmlFor="timezone-select" className="visually-hidden">
                选择时区
            </label>
            <div className="timezone-select-wrapper">
                <span className="select-icon" aria-hidden="true">🕐</span>
                <select
                    id="timezone-select"
                    value={selectedTimezone}
                    onChange={handleChange}
                    className="timezone-select"
                    aria-label="选择时区"
                >
                    <optgroup label="北美">
                        {timezones.filter(tz =>
                            tz.value.startsWith('America/') &&
                            !tz.value.includes('Sao_Paulo') &&
                            !tz.value.includes('Buenos_Aires')
                        ).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="南美">
                        {timezones.filter(tz =>
                            tz.value.includes('Sao_Paulo') ||
                            tz.value.includes('Buenos_Aires')
                        ).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="欧洲">
                        {timezones.filter(tz => tz.value.startsWith('Europe/')).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="亚洲">
                        {timezones.filter(tz => tz.value.startsWith('Asia/')).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="大洋洲">
                        {timezones.filter(tz => tz.value.startsWith('Australia/') || tz.value.startsWith('Pacific/')).map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </optgroup>
                </select>
            </div>
        </div>
    );
}

export { timezones, getTimezoneLabel };
