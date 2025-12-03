interface RectData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CircleData {
  centerX: number;
  centerY: number;
  radius: number;
}

interface PencilData {
  points: { x: number; y: number }[];
}

interface LineData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface TextData {
  text: string;
  x: number;
  y: number;
}

interface BaseShape {
  color: string;
  thickness: number;
}

interface RectShape extends BaseShape {
  type: "rect";
  data: RectData;
}

interface CircleShape extends BaseShape {
  type: "circle";
  data: CircleData;
}

interface PencilShape extends BaseShape {
  type: "pencil";
  data: PencilData;
}

interface LineShape extends BaseShape {
  type: "line";
  data: LineData;
}

interface TextShape extends BaseShape {
  type: "text";
  data: TextData;
}

export type Shape =
  | RectShape
  | CircleShape
  | PencilShape
  | LineShape
  | TextShape;
