'use client';

interface FlagIconProps {
    code: string; // ISO 3166-1 alpha-2 country code (e.g., "US", "MX", "CA")
    size?: number; // Size in pixels (width)
    className?: string;
}

// 将 3 字母或特殊代码转换为 2 字母 ISO 代码
const codeToISO2: Record<string, string> = {
    // 北美三国
    'USA': 'us',
    'MEX': 'mx',
    'CAN': 'ca',
    // 参赛国家
    'RSA': 'za', // South Africa
    'KOR': 'kr', // South Korea
    'BRA': 'br', // Brazil
    'MAR': 'ma', // Morocco
    'SCO': 'gb-sct', // Scotland
    'HAI': 'ht', // Haiti
    'PAR': 'py', // Paraguay
    'AUS': 'au', // Australia
    'GER': 'de', // Germany
    'ECU': 'ec', // Ecuador
    'CIV': 'ci', // Ivory Coast
    'CUW': 'cw', // Curaçao
    'NED': 'nl', // Netherlands
    'JPN': 'jp', // Japan
    'TUN': 'tn', // Tunisia
    'BEL': 'be', // Belgium
    'IRN': 'ir', // Iran
    'EGY': 'eg', // Egypt
    'NZL': 'nz', // New Zealand
    'ESP': 'es', // Spain
    'URU': 'uy', // Uruguay
    'KSA': 'sa', // Saudi Arabia
    'CPV': 'cv', // Cape Verde
    'FRA': 'fr', // France
    'SEN': 'sn', // Senegal
    'NOR': 'no', // Norway
    'ARG': 'ar', // Argentina
    'ALG': 'dz', // Algeria
    'AUT': 'at', // Austria
    'JOR': 'jo', // Jordan
    'POR': 'pt', // Portugal
    'UZB': 'uz', // Uzbekistan
    'COL': 'co', // Colombia
    'ENG': 'gb-eng', // England
    'CRO': 'hr', // Croatia
    'GHA': 'gh', // Ghana
    'PAN': 'pa', // Panama
    'QAT': 'qa', // Qatar
    'SUI': 'ch', // Switzerland
    // Playoff placeholders
    'PO_A': 'eu',
    'PO_B': 'eu',
    'PO_C': 'eu',
    'PO_D': 'eu',
    'PO_F1': 'un',
    'PO_F2': 'un',
};

export function getISO2Code(code: string): string {
    // 检查是否已经是 2 字母代码
    if (code.length === 2) {
        return code.toLowerCase();
    }
    // 查找映射
    return codeToISO2[code] || code.toLowerCase().slice(0, 2);
}

export default function FlagIcon({ code, size = 20, className = '' }: FlagIconProps) {
    const iso2 = getISO2Code(code);

    // 使用 flagcdn.com CDN 获取国旗图片
    const flagUrl = `https://flagcdn.com/w40/${iso2}.png`;

    return (
        <img
            src={flagUrl}
            alt={`${code} flag`}
            width={size}
            height={Math.round(size * 0.75)} // 4:3 aspect ratio
            className={`flag-icon ${className}`}
            style={{
                objectFit: 'contain',
                verticalAlign: 'middle',
                borderRadius: '2px',
            }}
            loading="lazy"
        />
    );
}
