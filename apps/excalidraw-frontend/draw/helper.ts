import {
  CircleShape,
  LineShape,
  PencilShape,
  RectShape,
  Shape,
  TextShape,
} from "@/types/shape";

export function pointInRect(
  x: number,
  y: number,
  shape: RectShape | TextShape
): boolean {
  const { x: rx, y: ry, width, height } = shape.data;

  return x >= rx && x <= rx + width && y >= ry && y <= ry + height;
}

export function pointInCircle(
  x: number,
  y: number,
  circle: CircleShape
): boolean {
  const dx = x - circle.data.centerX;
  const dy = y - circle.data.centerY;

  return dx * dx + dy * dy <= circle.data.radius * circle.data.radius; // Formula to know PointInCircle
}

export function pointInText(
  x: number,
  y: number,
  textShape: TextShape
): boolean {
  const HIT_TOLERANCE = 8; // pixels

  const { x: textX, y: textY, width, height, text } = textShape.data;

  if (!text) {
    // No text, no hit
    return false;
  }

  // Split by newline to get lines
  const lines = text.split("\n");

  // Check each line's bounding box (stacked vertically)
  for (let i = 0; i < lines.length; i++) {
    const lineTop = textY + i * height;

    if (
      x >= textX - HIT_TOLERANCE &&
      x <= textX + width + HIT_TOLERANCE &&
      y >= lineTop - HIT_TOLERANCE &&
      y <= lineTop + height + HIT_TOLERANCE
    ) {
      return true;
    }
  }

  return false;
}

export function pointInLine(
  x: number,
  y: number,
  lineShape: LineShape
): boolean {
  const HIT_TOLERANCE = 8; // pixels - adjust based on your stroke width
  const { startX, startY, endX, endY } = lineShape.data;
  const distance = distanceToLineSegment(x, y, startX, startY, endX, endY);
  return distance <= HIT_TOLERANCE;
}

export function pointInPencil(
  x: number,
  y: number,
  pencilShape: PencilShape
): boolean {
  const HIT_TOLERANCE = 8; // pixels

  const { points } = pencilShape.data;

  // Need at least 2 points to form a segment
  if (!points || points.length < 2) return false;

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    const distance = distanceToLineSegment(
      x,
      y,
      start.x,
      start.y,
      end.x,
      end.y
    );

    if (distance <= HIT_TOLERANCE) {
      return true;
    }
  }

  return false;
}

function distanceToLineSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  if (lenSq === 0) return Math.sqrt(A * A + B * B); // start == end

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  const xx = x1 + param * C;
  const yy = y1 + param * D;

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function hitTest(x: number, y: number, shape: Shape): boolean {
  switch (shape.type) {
    case "rect":
      return pointInRect(x, y, shape);
    case "circle":
      return pointInCircle(x, y, shape);
    case "text":
      return pointInText(x, y, shape);
    case "line":
      return pointInLine(x, y, shape);
    case "pencil":
      return pointInPencil(x, y, shape);
    default:
      return false;
  }
}

export function getShapePosition(shape: Shape) {
  switch (shape.type) {
    case "rect": {
      const { x, y } = shape.data;
      return { x, y };
    }
    case "circle": {
      const { centerX, centerY, radius } = shape.data;
      return { x: centerX - radius, y: centerY - radius };
    }
    case "text": {
      const { x, y } = shape.data;
      return { x, y };
    }
    case "line": {
      const { startX, startY } = shape.data;
      return { x: startX, y: startY };
    }
    case "pencil":
      const { points } = shape.data;
      const { x, y } = points[0];
      return { x, y };
  }
}
