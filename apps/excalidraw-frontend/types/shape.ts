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

interface BaseShape {
  id?: string;
  color: string;
  thickness: number;
}

export interface RectShape extends BaseShape {
  type: "rect";
  data: RectData;
}

export interface CircleShape extends BaseShape {
  type: "circle";
  data: CircleData;
}

export interface PencilShape extends BaseShape {
  type: "pencil";
  data: PencilData;
}

export interface LineShape extends BaseShape {
  type: "line";
  data: LineData;
}

export interface TextShape extends BaseShape {
  type: "text";
  data: TextData;
}

export type Shape =
  | RectShape
  | CircleShape
  | PencilShape
  | LineShape
  | TextShape;
