import { RefObject } from "react";

export function removeElement(
  ref: RefObject<HTMLTextAreaElement | HTMLDivElement | null>
) {
  if (!ref.current) return;
  ref.current.style.display = "none";
}
