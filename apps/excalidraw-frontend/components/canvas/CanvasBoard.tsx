import { CanvasPainter } from "@/draw/CanvasPainter";
import { getPosition } from "@/helper/getPosition";
import { removeElement } from "@/helper/removeElement";
import { renderElement } from "@/helper/renderElement";
import { getTextDimension } from "@/helper/textDimensions";
import { Tool } from "@/types/tools";
import {
  Dispatch,
  MouseEvent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

export default function CanvasBoard({
  socket,
  roomId,
  canvasPainter,
  setCanvasPainter,
  selectedTool,
  setSelectedTool,
  inputRef,
  contextMenuRef,
  inputVal,
  setInputVal,
  zoomPercentage,
  setZoomPercentage,
}: {
  socket: WebSocket;
  roomId: string;
  canvasPainter: CanvasPainter | undefined;
  setCanvasPainter: Dispatch<SetStateAction<CanvasPainter | undefined>>;
  selectedTool: Tool;
  setSelectedTool: Dispatch<SetStateAction<Tool>>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  contextMenuRef: RefObject<HTMLDivElement | null>;
  inputVal: string;
  setInputVal: Dispatch<SetStateAction<string>>;
  zoomPercentage: number;
  setZoomPercentage: Dispatch<SetStateAction<number>>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInputVisible, setIsInputVisible] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const cp = new CanvasPainter(
        canvasRef.current,
        roomId,
        socket,
        selectedTool,
        setSelectedTool,
        zoomPercentage,
        setZoomPercentage
      );
      setCanvasPainter(cp);

      return () => {
        cp.destroy();
      };
    }
  }, [canvasRef]);

  const handleDoubleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const pos = getPosition(e, canvasRef.current);
    if (!pos) return;

    setPosition({ ...pos });
    setIsInputVisible(true);
    renderElement(e, canvasRef, inputRef);
    setSelectedTool("text");
  };

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    if (!canvasRef.current) return;
    const pos = getPosition(e, canvasRef.current);
    if (!pos) return;

    if (selectedTool === "text") {
      setPosition({ ...pos }); // Why do I need to set it here
      setIsInputVisible(true);
      renderElement(e, canvasRef, inputRef);
      setSelectedTool("select");
    }

    // Send data to ws-server
    if (inputVal) {
      const { width, height } = getTextDimension(ctx, "40px Arial", inputVal);
      socket.send(
        JSON.stringify({
          type: "shape:add",
          shape: {
            type: "text",
            data: { text: inputVal, ...position, width, height },
            color: "white",
            thickness: 2,
          },
          roomId: Number(roomId),
        })
      );
    }

    if (!inputRef.current) return;
    if (isInputVisible) {
      removeElement(inputRef);
      setIsInputVisible(false);
    }

    setInputVal("");

    if (!contextMenuRef.current) return;
    removeElement(contextMenuRef);
  };

  const handleRightClick = (e: MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (canvasPainter?.getSelectedShapeId()) {
      renderElement(e, canvasRef, contextMenuRef);
    } else {
      removeElement(contextMenuRef);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="touch-none absolute"
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onContextMenu={handleRightClick}
    ></canvas>
  );
}
