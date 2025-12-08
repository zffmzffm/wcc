/**
 * SVG Path Generation Utilities
 * Functions for generating arc paths, chevron paths, and loop paths for flight visualizations
 */

/**
 * Generate arc path SVG
 * @param curvature > 0: bend right (relative to start-to-end direction), < 0: bend left
 */
export const generateArcPath = (
    startPixel: { x: number; y: number },
    endPixel: { x: number; y: number },
    curvature: number = 0.3
): string => {
    const dx = endPixel.x - startPixel.x;
    const dy = endPixel.y - startPixel.y;

    // Midpoint
    const midX = (startPixel.x + endPixel.x) / 2;
    const midY = (startPixel.y + endPixel.y) / 2;

    // Distance
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) {
        // Points too close, return straight line
        return `M ${startPixel.x} ${startPixel.y} L ${endPixel.x} ${endPixel.y}`;
    }

    // Offset (using absolute curvature ratio)
    const offset = distance * Math.abs(curvature);

    // Perpendicular vector (always use consistent direction: positive is right, negative is left)
    // Curvature sign controls bend direction
    const sign = curvature >= 0 ? 1 : -1;
    const perpX = (-dy / distance) * sign;
    const perpY = (dx / distance) * sign;

    // Control point
    const controlX = midX + perpX * offset;
    const controlY = midY + perpY * offset;

    return `M ${startPixel.x} ${startPixel.y} Q ${controlX} ${controlY} ${endPixel.x} ${endPixel.y}`;
};

/**
 * Generate arc path with multiple points for chevron arrows display
 * Sample Bezier curve into multiple segments so marker-mid can display at each node
 */
export const generateChevronPath = (
    startPixel: { x: number; y: number },
    endPixel: { x: number; y: number },
    curvature: number = 0.3,
    segmentLength: number = 20 // Spacing between arrows (pixels)
): string => {
    const dx = endPixel.x - startPixel.x;
    const dy = endPixel.y - startPixel.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) {
        return `M ${startPixel.x} ${startPixel.y} L ${endPixel.x} ${endPixel.y}`;
    }

    // Calculate control point
    const midX = (startPixel.x + endPixel.x) / 2;
    const midY = (startPixel.y + endPixel.y) / 2;
    const offset = distance * Math.abs(curvature);
    const sign = curvature >= 0 ? 1 : -1;
    const perpX = (-dy / distance) * sign;
    const perpY = (dx / distance) * sign;
    const controlX = midX + perpX * offset;
    const controlY = midY + perpY * offset;

    // Determine sample count based on path length
    const numSegments = Math.max(3, Math.floor(distance / segmentLength));

    // Sample points on Bezier curve
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        // Quadratic Bezier curve formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
        const x = (1 - t) * (1 - t) * startPixel.x + 2 * (1 - t) * t * controlX + t * t * endPixel.x;
        const y = (1 - t) * (1 - t) * startPixel.y + 2 * (1 - t) * t * controlY + t * t * endPixel.y;
        points.push({ x, y });
    }

    // Generate multi-segment path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
};

/**
 * Generate small loop path for same-city matches
 */
export const generateLoopPath = (
    centerPixel: { x: number; y: number },
    radius: number = 25
): string => {
    // Start from upper right, draw small arc back to near starting point
    const startX = centerPixel.x + radius * 0.7;
    const startY = centerPixel.y - radius * 0.7;

    // Control points above
    const ctrl1X = centerPixel.x + radius * 1.5;
    const ctrl1Y = centerPixel.y - radius * 1.8;
    const ctrl2X = centerPixel.x - radius * 1.5;
    const ctrl2Y = centerPixel.y - radius * 1.8;

    // End point at upper left
    const endX = centerPixel.x - radius * 0.7;
    const endY = centerPixel.y - radius * 0.7;

    return `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y} ${ctrl2X} ${ctrl2Y} ${endX} ${endY}`;
};

/**
 * Generate loop path with sample points - for chevron arrows display
 */
export const generateLoopChevronPath = (
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

    // Estimate curve length
    const approxLength = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    ) * 1.5;
    const numSegments = Math.max(4, Math.floor(approxLength / segmentLength));

    // Sample points on cubic Bezier curve
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        // Cubic Bezier curve formula
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

    // Generate multi-segment path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
};
