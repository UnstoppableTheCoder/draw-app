export const getTextDimension = (
  ctx: CanvasRenderingContext2D,
  font: string,
  text: string
): { width: number; height: number } => {
  ctx.font = font;
  const lines = text.split("\n");
  const dims = {
    width: Math.max(...lines.map((line) => ctx.measureText(line).width)),
    height: parseInt(font) * 1.2,
  };

  return dims;
};
