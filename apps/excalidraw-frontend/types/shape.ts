import {
  CircleData,
  EllipseData,
  LineData,
  PencilData,
  RectData,
  TextData,
} from "./shapeData";

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

export interface EllipseShape extends BaseShape {
  type: "ellipse";
  data: EllipseData;
}

export type Data =
  | RectData
  | CircleData
  | PencilData
  | LineData
  | TextData
  | EllipseData;

export type Shape =
  | RectShape
  | CircleShape
  | PencilShape
  | LineShape
  | TextShape
  | EllipseShape;
