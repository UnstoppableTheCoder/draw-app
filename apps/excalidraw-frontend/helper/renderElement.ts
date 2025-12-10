import { MouseEvent, RefObject } from "react";
import { getPosition } from "./getPosition";

export function renderElement(
  e: MouseEvent<HTMLCanvasElement>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  elementRef: RefObject<HTMLTextAreaElement | HTMLDivElement | null>
) {
  if (!canvasRef.current) return;
  const pos = getPosition(e, canvasRef.current);
  if (!pos || !elementRef.current) return;

  const { x, y } = pos;
  elementRef.current.style.display = "block";
  elementRef.current.style.left = `${x}px`;
  elementRef.current.style.top = `${y - 7}px`;

  elementRef.current.focus();
}
