import { getPosition } from "./getPosition";

export default function getSize(
  e: PointerEvent,
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number
) {
  const { x, y } = getPosition(e, canvas);
  return {
    width: x - startX,
    height: y - startY,
  };
}
