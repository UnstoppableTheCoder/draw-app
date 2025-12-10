"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasPainter } from "@/draw/CanvasPainter";
import { TopBar } from "../canvas/TopBar";
import { Tool, Tools } from "@/types/tools";
import CanvasContextMenu from "./CanvasContextMenu";
import LeaveRoom from "../canvas/LeaveRoom";
import CanvasInputBox from "./CanvasInputBox";
import CanvasBoard from "./CanvasBoard";
import ZoomPercentage from "./ZoomPercentage";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const [inputVal, setInputVal] = useState("");
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>(Tools.Select);
  const [canvasPainter, setCanvasPainter] = useState<CanvasPainter>();
  const [zoomPercentage, setZoomPercentage] = useState(100);

  useEffect(() => {
    canvasPainter?.setTool(selectedTool);
  }, [selectedTool, canvasPainter]);

  useEffect(() => {
    canvasPainter?.zoomInAndOut(
      window.innerWidth / 2,
      window.innerHeight / 2,
      zoomPercentage
    );
  }, [zoomPercentage]);

  return (
    <div>
      <div className="relative h-screen w-screen">
        <CanvasBoard
          socket={socket}
          roomId={roomId}
          canvasPainter={canvasPainter}
          setCanvasPainter={setCanvasPainter}
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          inputRef={inputRef}
          contextMenuRef={contextMenuRef}
          inputVal={inputVal}
          setInputVal={setInputVal}
          zoomPercentage={zoomPercentage}
          setZoomPercentage={setZoomPercentage}
        />

        <ZoomPercentage
          zoomPercentage={zoomPercentage}
          setZoomPercentage={setZoomPercentage}
        />

        <CanvasInputBox
          inputRef={inputRef}
          inputVal={inputVal}
          setInputVal={setInputVal}
        />

        <CanvasContextMenu
          contextMenuRef={contextMenuRef}
          canvasPainter={canvasPainter!}
          socket={socket}
          roomId={roomId}
        />

        <LeaveRoom socket={socket} roomId={roomId} />
      </div>

      {/* Top Bar */}
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}
