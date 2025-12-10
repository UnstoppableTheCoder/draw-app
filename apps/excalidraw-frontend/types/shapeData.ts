export interface RectData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleData {
  centerX: number;
  centerY: number;
  radius: number;
  startAngel?: number;
  endAngle?: number;
}

export interface PencilData {
  points: { x: number; y: number }[];
}

export interface LineData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TextData {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EllipseData {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  rotation?: number;
  startAngle?: number;
  endAngle?: number;
}
