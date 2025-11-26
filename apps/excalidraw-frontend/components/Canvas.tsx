import { initDraw } from "@/draw";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";

enum Tools {
  Circle = "circle",
  Pencil = "pencil",
  Rect = "rect",
}

type Shape = Tools.Circle | Tools.Pencil | Tools.Rect;

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Shape>(Tools.Circle);

  useEffect(() => {
    //@ts-ignore
    window.selectedTool = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    if (canvasRef.current) {
      initDraw(canvasRef.current, roomId, socket);
    }
  }, [canvasRef]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

function TopBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: string;
  setSelectedTool: Dispatch<SetStateAction<Shape>>;
}) {
  return (
    <div className="absolute top-0 left-0 flex gap-3 p-2">
      <IconButton
        activated={selectedTool === Tools.Pencil}
        icon={<Pencil />}
        onClick={() => {
          setSelectedTool(Tools.Pencil);
        }}
      />
      <IconButton
        activated={selectedTool === Tools.Rect}
        icon={<RectangleHorizontalIcon />}
        onClick={() => {
          setSelectedTool(Tools.Rect);
        }}
      />
      <IconButton
        activated={selectedTool === Tools.Circle}
        icon={<Circle />}
        onClick={() => {
          setSelectedTool(Tools.Circle);
        }}
      />
    </div>
  );
}
