import { Shape } from "@/types/shape";

export default function duplicateShape(shape: Shape): Shape {
  const offSet = 10;
  switch (shape.type) {
    case "rect":
      shape.data.x += offSet;
      shape.data.y += offSet;
      break;
    case "circle":
      shape.data.centerX += offSet;
      shape.data.centerY += offSet;
      break;
    case "pencil":
      shape.data.points.forEach((point) => (point.x += offSet));
      shape.data.points.forEach((point) => (point.y += offSet));
      break;
    case "line":
      shape.data.startX += offSet;
      shape.data.startY += offSet;
      break;
    case "text":
      shape.data.x += offSet;
      shape.data.y += offSet;
      break;
    case "ellipse":
      shape.data.centerX += offSet;
      shape.data.centerY += offSet;
      break;
    default:
      break;
  }

  return shape;
}
