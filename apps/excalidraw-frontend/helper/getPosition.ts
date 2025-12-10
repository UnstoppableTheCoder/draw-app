import { MouseEvent } from "react";

export function getPosition(
  e: MouseEvent<HTMLCanvasElement> | PointerEvent | WheelEvent,
  canvas: HTMLCanvasElement
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect?.left,
    y: e.clientY - rect?.top,
  };
}
