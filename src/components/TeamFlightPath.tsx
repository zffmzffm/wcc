'use client';
import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { CircleMarker, Popup, useMap } from 'react-leaflet';
import { Match, Team, City, MatchWithCoords, FlightSegment } from '@/types';
import { formatDateTimeShort, getTeamDisplay } from '@/utils/formatters';
import FlagIcon from './FlagIcon';
import { LatLngTuple } from 'leaflet';

interface TeamFlightPathProps {
    teamCode: string;
    matches: Match[];
    cities: City[];
    teams: Team[];
}

// 获取对手球队信息
const getOpponent = (match: Match, teamCode: string, teams: Team[]): { name: string; code: string } => {
    const opponentCode = match.team1 === teamCode ? match.team2 : match.team1;
    const team = teams.find(t => t.code === opponentCode);
    return team ? { name: team.name, code: team.code } : { name: opponentCode, code: opponentCode };
};

// 生成弧形路径的SVG path
// curvature > 0: 向右弯曲（相对于从起点看向终点）
// curvature < 0: 向左弯曲
const generateArcPath = (
    startPixel: { x: number; y: number },
    endPixel: { x: number; y: number },
    curvature: number = 0.3
): string => {
    const dx = endPixel.x - startPixel.x;
    const dy = endPixel.y - startPixel.y;

    // 中点
    const midX = (startPixel.x + endPixel.x) / 2;
    const midY = (startPixel.y + endPixel.y) / 2;

    // 距离
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) {
        // 两点太近，返回直线
        return `M ${startPixel.x} ${startPixel.y} L ${endPixel.x} ${endPixel.y}`;
    }

    // 偏移量（使用绝对值的弧度比例）
    const offset = distance * Math.abs(curvature);

    // 垂直向量（始终使用一致的方向：向右为正，向左为负）
    // 通过 curvature 的符号来控制弯曲方向
    const sign = curvature >= 0 ? 1 : -1;
    const perpX = (-dy / distance) * sign;
    const perpY = (dx / distance) * sign;

    // 控制点
    const controlX = midX + perpX * offset;
    const controlY = midY + perpY * offset;

    return `M ${startPixel.x} ${startPixel.y} Q ${controlX} ${controlY} ${endPixel.x} ${endPixel.y}`;
};

// 生成带有多个点的弧线路径，用于显示 》》》》 箭头
// 将贝塞尔曲线采样成多个线段，这样 marker-mid 可以在每个节点显示
const generateChevronPath = (
    startPixel: { x: number; y: number },
    endPixel: { x: number; y: number },
    curvature: number = 0.3,
    segmentLength: number = 20 // 每个箭头之间的间距（像素）
): string => {
    const dx = endPixel.x - startPixel.x;
    const dy = endPixel.y - startPixel.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) {
        return `M ${startPixel.x} ${startPixel.y} L ${endPixel.x} ${endPixel.y}`;
    }

    // 计算控制点
    const midX = (startPixel.x + endPixel.x) / 2;
    const midY = (startPixel.y + endPixel.y) / 2;
    const offset = distance * Math.abs(curvature);
    const sign = curvature >= 0 ? 1 : -1;
    const perpX = (-dy / distance) * sign;
    const perpY = (dx / distance) * sign;
    const controlX = midX + perpX * offset;
    const controlY = midY + perpY * offset;

    // 根据路径长度确定采样点数量
    const numSegments = Math.max(3, Math.floor(distance / segmentLength));

    // 采样贝塞尔曲线上的点
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        // 二次贝塞尔曲线公式: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
        const x = (1 - t) * (1 - t) * startPixel.x + 2 * (1 - t) * t * controlX + t * t * endPixel.x;
        const y = (1 - t) * (1 - t) * startPixel.y + 2 * (1 - t) * t * controlY + t * t * endPixel.y;
        points.push({ x, y });
    }

    // 生成多线段路径
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
};

// 生成原地待命的小环形路径
const generateLoopPath = (
    centerPixel: { x: number; y: number },
    radius: number = 25
): string => {
    // 从右上方开始，画一个小圆弧回到起点附近
    const startX = centerPixel.x + radius * 0.7;
    const startY = centerPixel.y - radius * 0.7;

    // 控制点在上方
    const ctrl1X = centerPixel.x + radius * 1.5;
    const ctrl1Y = centerPixel.y - radius * 1.8;
    const ctrl2X = centerPixel.x - radius * 1.5;
    const ctrl2Y = centerPixel.y - radius * 1.8;

    // 终点在左上方
    const endX = centerPixel.x - radius * 0.7;
    const endY = centerPixel.y - radius * 0.7;

    return `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y} ${ctrl2X} ${ctrl2Y} ${endX} ${endY}`;
};

// 生成带采样点的小环形路径 - 用于显示 》》》》 箭头
const generateLoopChevronPath = (
    centerPixel: { x: number; y: number },
    radius: number = 25,
    segmentLength: number = 12
): string => {
    const startX = centerPixel.x + radius * 0.7;
    const startY = centerPixel.y - radius * 0.7;
    const ctrl1X = centerPixel.x + radius * 1.5;
    const ctrl1Y = centerPixel.y - radius * 1.8;
    const ctrl2X = centerPixel.x - radius * 1.5;
    const ctrl2Y = centerPixel.y - radius * 1.8;
    const endX = centerPixel.x - radius * 0.7;
    const endY = centerPixel.y - radius * 0.7;

    // 估算曲线长度
    const approxLength = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    ) * 1.5;
    const numSegments = Math.max(4, Math.floor(approxLength / segmentLength));

    // 采样三次贝塞尔曲线上的点
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        // 三次贝塞尔曲线公式
        const x = Math.pow(1 - t, 3) * startX +
            3 * Math.pow(1 - t, 2) * t * ctrl1X +
            3 * (1 - t) * Math.pow(t, 2) * ctrl2X +
            Math.pow(t, 3) * endX;
        const y = Math.pow(1 - t, 3) * startY +
            3 * Math.pow(1 - t, 2) * t * ctrl1Y +
            3 * (1 - t) * Math.pow(t, 2) * ctrl2Y +
            Math.pow(t, 3) * endY;
        points.push({ x, y });
    }

    // 生成多线段路径
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
};

// 计算小环形路径的箭头位置
const getLoopArrowTransform = (
    centerPixel: { x: number; y: number },
    radius: number = 25
): { x: number; y: number; angle: number } => {
    // 箭头在弧线的左上角位置，指向左下
    return {
        x: centerPixel.x - radius * 0.5,
        y: centerPixel.y - radius * 1.5,
        angle: -135 // 指向左下
    };
};

// 计算箭头位置和角度
const getArrowTransform = (
    startPixel: { x: number; y: number },
    endPixel: { x: number; y: number },
    curvature: number = 0.3
): { x: number; y: number; angle: number } => {
    const dx = endPixel.x - startPixel.x;
    const dy = endPixel.y - startPixel.y;

    const midX = (startPixel.x + endPixel.x) / 2;
    const midY = (startPixel.y + endPixel.y) / 2;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) {
        return { x: midX, y: midY, angle: Math.atan2(dy, dx) * 180 / Math.PI };
    }

    // 使用与 generateArcPath 相同的逻辑
    const offset = distance * Math.abs(curvature);
    const sign = curvature >= 0 ? 1 : -1;
    const perpX = (-dy / distance) * sign;
    const perpY = (dx / distance) * sign;

    const controlX = midX + perpX * offset;
    const controlY = midY + perpY * offset;

    // 曲线中点（t=0.5时的贝塞尔曲线点）
    const t = 0.5;
    const x = (1 - t) * (1 - t) * startPixel.x + 2 * (1 - t) * t * controlX + t * t * endPixel.x;
    const y = (1 - t) * (1 - t) * startPixel.y + 2 * (1 - t) * t * controlY + t * t * endPixel.y;

    // 计算切线方向（贝塞尔曲线在t点的导数）
    const tangentX = 2 * (1 - t) * (controlX - startPixel.x) + 2 * t * (endPixel.x - controlX);
    const tangentY = 2 * (1 - t) * (controlY - startPixel.y) + 2 * t * (endPixel.y - controlY);

    const angle = Math.atan2(tangentY, tangentX) * 180 / Math.PI;

    return { x, y, angle };
};


export default function TeamFlightPath({ teamCode, matches, cities, teams }: TeamFlightPathProps) {
    const [visibleCount, setVisibleCount] = useState(0);
    const svgRef = useRef<SVGSVGElement>(null);
    const map = useMap();
    const [, forceUpdate] = useState({});

    // 计算球队的比赛，按时间排序
    const teamMatches: MatchWithCoords[] = useMemo(() => {
        return matches
            .filter(m => m.team1 === teamCode || m.team2 === teamCode)
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            .map(match => {
                const city = cities.find(c => c.id === match.cityId);
                return city ? {
                    match,
                    coords: [city.lat, city.lng] as LatLngTuple,
                    city
                } : null;
            })
            .filter((item): item is MatchWithCoords => item !== null);
    }, [teamCode, matches, cities]);

    // 计算飞行路段，检测重复路径
    const flightSegments: FlightSegment[] = useMemo(() => {
        const segments: FlightSegment[] = [];
        const pathMap = new Map<string, number>(); // 记录已经出现过的路径

        for (let i = 0; i < teamMatches.length - 1; i++) {
            const from = teamMatches[i].coords;
            const to = teamMatches[i + 1].coords;

            // 创建路径key（无方向）- 始终按坐标排序确保一致性
            const fromKey = `${from[0].toFixed(4)},${from[1].toFixed(4)}`;
            const toKey = `${to[0].toFixed(4)},${to[1].toFixed(4)}`;

            // 检测是否在同一城市
            const isSameCity = fromKey === toKey;

            const pathKey = [fromKey, toKey].sort().join('|');

            const existingCount = pathMap.get(pathKey) || 0;
            const isReturn = existingCount > 0 && !isSameCity;
            pathMap.set(pathKey, existingCount + 1);

            segments.push({
                from,
                to,
                segmentIndex: i,
                isReturn,
                isSameCity
            });
        }

        return segments;
    }, [teamMatches]);


    // 获取当前球队信息
    const currentTeam = useMemo(() => teams.find(t => t.code === teamCode), [teams, teamCode]);

    // 坐标转换函数
    const latLngToPixel = useCallback((coords: LatLngTuple): { x: number; y: number } => {
        const point = map.latLngToContainerPoint(coords);
        return { x: point.x, y: point.y };
    }, [map]);

    // 使用累积式方法：维护已渲染的路段列表，而不是每次重新slice
    const [renderedSegments, setRenderedSegments] = useState<{ segment: FlightSegment; isNew: boolean }[]>([]);
    const [renderedMarkers, setRenderedMarkers] = useState<number[]>([]);
    const animationKeyRef = useRef(0);

    // 当球队改变时重置动画
    useEffect(() => {
        // 重置动画状态
        animationKeyRef.current += 1;
        setRenderedSegments([]);
        setRenderedMarkers([]);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reset state when teamCode prop changes
        setVisibleCount(0);
    }, [teamCode]);

    // 调整地图视角
    useEffect(() => {
        if (teamMatches.length === 0) return;

        const bounds = teamMatches.map(m => m.coords);
        if (bounds.length > 0) {
            try {
                map.fitBounds(bounds, { padding: [80, 80], maxZoom: 5 });
            } catch (e) {
                console.warn('Failed to fit bounds:', e);
            }
        }
    }, [teamCode, teamMatches, map]);

    // 动画逐步展示 - 累积添加，不会触发已渲染内容的重新渲染
    useEffect(() => {
        if (teamMatches.length === 0) return;

        if (visibleCount < teamMatches.length) {
            const timer = setTimeout(() => {
                // 第一次：同时显示前两个标记和第一段航线
                if (visibleCount === 0 && teamMatches.length >= 2) {
                    setRenderedMarkers([0, 1]);
                    if (flightSegments[0]) {
                        setRenderedSegments([{ segment: flightSegments[0], isNew: true }]);
                    }
                    setVisibleCount(2);
                } else {
                    // 后续：每次添加一个标记和一段航线
                    setRenderedMarkers(prev => [...prev, visibleCount]);

                    if (flightSegments[visibleCount - 1]) {
                        setRenderedSegments(prev => {
                            const updated = prev.map(item => ({ ...item, isNew: false }));
                            return [...updated, { segment: flightSegments[visibleCount - 1], isNew: true }];
                        });
                    }

                    setVisibleCount(prev => prev + 1);
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [teamMatches.length, visibleCount, flightSegments]);

    // 监听地图移动/缩放，更新SVG路径
    useEffect(() => {
        const handleMoveEnd = () => forceUpdate({});
        map.on('move', handleMoveEnd);
        map.on('zoom', handleMoveEnd);
        return () => {
            map.off('move', handleMoveEnd);
            map.off('zoom', handleMoveEnd);
        };
    }, [map]);

    if (teamMatches.length === 0) {
        return null;
    }

    // 获取地图容器尺寸
    const mapSize = map.getSize();

    return (
        <>
            {/* SVG 飞行路线覆盖层 */}
            <svg
                ref={svgRef}
                className="flight-path-svg"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: mapSize.x,
                    height: mapSize.y,
                    pointerEvents: 'none',
                    zIndex: 400
                }}
            >
                {/* 定义箭头 marker - 类似 》 的形状 */}
                <defs>
                    <marker
                        id="chevron-marker"
                        markerWidth="8"
                        markerHeight="8"
                        refX="4"
                        refY="4"
                        orient="auto"
                        markerUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 1 1 L 6 4 L 1 7"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </marker>
                </defs>
                {/* 渲染每条飞行路径 */}
                {renderedSegments.map(({ segment, isNew }, idx) => {
                    const startPixel = latLngToPixel(segment.from);
                    const endPixel = latLngToPixel(segment.to);

                    // 同城情况：画小环形 - 使用与普通路径相同的箭头样式
                    if (segment.isSameCity) {
                        const loopGlowPath = generateLoopPath(startPixel, 20);
                        const loopChevronPath = generateLoopChevronPath(startPixel, 20, 12);

                        return (
                            <g
                                key={`segment-${animationKeyRef.current}-${idx}`}
                                className={isNew ? 'segment-fade-in' : ''}
                            >
                                {/* 小环形路径底色（发光效果） */}
                                <path
                                    d={loopGlowPath}
                                    className="flight-path-glow"
                                />
                                {/* 小环形主路径 - 只显示箭头 */}
                                <path
                                    d={loopChevronPath}
                                    className="flight-path-chevron"
                                    markerMid="url(#chevron-marker)"
                                />
                            </g>
                        );
                    }

                    // 正常飞行路径
                    const curvature = 0.4;
                    const glowPathD = generateArcPath(startPixel, endPixel, curvature);
                    const chevronPathD = generateChevronPath(startPixel, endPixel, curvature, 18);

                    return (
                        <g
                            key={`segment-${animationKeyRef.current}-${idx}`}
                            className={isNew ? 'segment-fade-in' : ''}
                        >
                            {/* 路径底色（发光效果） */}
                            <path
                                d={glowPathD}
                                className="flight-path-glow"
                            />
                            {/* 主路径 - 使用 》》》》 箭头表示方向 */}
                            <path
                                d={chevronPathD}
                                className="flight-path-chevron"
                                markerMid="url(#chevron-marker)"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* 比赛落脚点 */}
            {renderedMarkers.map((markerIndex) => {
                const matchInfo = teamMatches[markerIndex];
                if (!matchInfo) return null;

                const { match, city, coords } = matchInfo;
                const opponent = getOpponent(match, teamCode, teams);
                const { date, time } = formatDateTimeShort(match.datetime);
                const isLatest = markerIndex === renderedMarkers[renderedMarkers.length - 1];

                return (
                    <CircleMarker
                        key={`marker-${animationKeyRef.current}-${match.id}`}
                        center={coords}
                        radius={isLatest ? 14 : 10}
                        pathOptions={{
                            color: '#fff',
                            weight: 3,
                            fillColor: isLatest ? '#f59e0b' : '#7c3aed',
                            fillOpacity: 0.95
                        }}
                    >
                        <Popup className="match-popup">
                            <div className="flight-popup">
                                <div className="flight-popup-header">
                                    <span className="match-number">比赛 {markerIndex + 1}</span>
                                    <span className="match-group-badge">小组 {match.group}</span>
                                </div>
                                <div className="flight-popup-venue">
                                    🏟️ {city.name} - {city.venue}
                                </div>
                                <div className="flight-popup-teams">
                                    <span className="team-info">
                                        <FlagIcon code={currentTeam?.code || teamCode} size={18} />
                                        <span className="team-name">{currentTeam?.name}</span>
                                    </span>
                                    <span className="vs">VS</span>
                                    <span className="team-info">
                                        <FlagIcon code={opponent.code} size={18} />
                                        <span className="team-name">{opponent.name}</span>
                                    </span>
                                </div>
                                <div className="flight-popup-datetime">
                                    <span className="date">📅 {date}</span>
                                    <span className="time">⏰ {time}</span>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
}
