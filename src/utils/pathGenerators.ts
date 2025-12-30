/**
 * SVG Path Generation Utilities
 * Functions for generating arc paths, chevron paths, and loop paths for flight visualizations
 */

/**
 * Generate arc path SVG
 * @param curvature > 0: bend right (relative to start-to-end direction), < 0: bend left
 * @param trimEnds pixels to trim from start and end of path (to leave room for markers)
 */
export const generateArcPath = (
    startPixel: { x: number; y: number },
    endPixel: { x: number; y: number },
    curvature: number = 0.3,
    trimEnds: number = 0 // Pixels to trim from each end
): string => {
    const dx = endPixel.x - startPixel.x;
    const dy = endPixel.y - startPixel.y;

    // Distance
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) {
        // Points too close, return straight line
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

    // If no trimming needed, return simple path
    if (trimEnds <= 0 || trimEnds * 2 >= distance) {
        return `M ${startPixel.x} ${startPixel.y} Q ${controlX} ${controlY} ${endPixel.x} ${endPixel.y}`;
    }

    // Calculate trimmed start and end points on the Bezier curve
    // We need to find t values that correspond to trimEnds distance from each end
    // Approximation: use ratio of trimEnds to total distance
    const tStart = trimEnds / distance * 0.7; // Slightly less than linear to account for curve
    const tEnd = 1 - (trimEnds / distance * 0.7);

    // Calculate points on quadratic Bezier at t values
    // B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const trimmedStartX = (1 - tStart) * (1 - tStart) * startPixel.x + 2 * (1 - tStart) * tStart * controlX + tStart * tStart * endPixel.x;
    const trimmedStartY = (1 - tStart) * (1 - tStart) * startPixel.y + 2 * (1 - tStart) * tStart * controlY + tStart * tStart * endPixel.y;
    const trimmedEndX = (1 - tEnd) * (1 - tEnd) * startPixel.x + 2 * (1 - tEnd) * tEnd * controlX + tEnd * tEnd * endPixel.x;
    const trimmedEndY = (1 - tEnd) * (1 - tEnd) * startPixel.y + 2 * (1 - tEnd) * tEnd * controlY + tEnd * tEnd * endPixel.y;

    // For a quadratic Bezier sub-curve from tStart to tEnd, the new control point is:
    // The point at t=(tStart+tEnd)/2 on the derivative scaled appropriately
    // Simpler approach: interpolate on the original control point
    const tMid = (tStart + tEnd) / 2;
    // Point on curve at tMid
    const midCurveX = (1 - tMid) * (1 - tMid) * startPixel.x + 2 * (1 - tMid) * tMid * controlX + tMid * tMid * endPixel.x;
    const midCurveY = (1 - tMid) * (1 - tMid) * startPixel.y + 2 * (1 - tMid) * tMid * controlY + tMid * tMid * endPixel.y;

    // For a quadratic Bezier, Q1 = 2*B(0.5) - 0.5*(P0+P2)
    // For sub-curve: new control = 2*midPoint - 0.5*(newStart + newEnd)
    const newControlX = 2 * midCurveX - 0.5 * (trimmedStartX + trimmedEndX);
    const newControlY = 2 * midCurveY - 0.5 * (trimmedStartY + trimmedEndY);

    return `M ${trimmedStartX} ${trimmedStartY} Q ${newControlX} ${newControlY} ${trimmedEndX} ${trimmedEndY}`;
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
