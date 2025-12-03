"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";

type Pencil = {
  startX: number;
  startY: number;
  mouseX: number;
  mouseY: number;
};

export default function Pencil() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isPaintingRef = useRef(false);
  const coordsRef = useRef({ x: 0, y: 0 });
  const thicknessRef = useRef(2);
  const [size, setSize] = useState({ width: 500, height: 500 });
  const [pencilData, setPencilData] = useState<Pencil>();

  const renderPencil = (
    startX: number,
    startY: number,
    mouseX: number,
    mouseY: number,
    ctx: CanvasRenderingContext2D
  ) => {
    let x1 = mouseX;
    let y1 = mouseY;
    let x2 = startX;
    let y2 = startY;

    const steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
    if (steep) {
      [x1, y1] = [y1, x1];
      [x2, y2] = [y2, x2];
    }

    if (x1 > x2) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }

    const dx = x2 - x1;
    const dy = Math.abs(y2 - y1);
    const de = dy / dx;
    let error = 0;
    const yStep = y1 < y2 ? 1 : -1;
    let y = y1;

    // const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    // let thickness = 5 - len / 10;
    // if (thickness < 1) thickness = 1;
    // thicknessRef.current = thickness;

    for (let x = x1; x < x2; x++) {
      ctx.fillStyle = "#fff";
      if (steep) {
        ctx.fillRect(y, x, thicknessRef.current, thicknessRef.current);
      } else {
        ctx.fillRect(x, y, thicknessRef.current, thicknessRef.current);
      }

      error += de;
      if (error >= 0.5) {
        y += yStep;
        error -= 1;
      }
    }

    coordsRef.current = { x: mouseX, y: mouseY };
  };

  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:4000");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      setPencilData(JSON.parse(event.data));
    };
  };

  const assignContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    if (!ctx) return;
  };

  const getPencilData = async (ctx: CanvasRenderingContext2D) => {
    try {
      const res = await axios.get("http://localhost:4001/pencil-data");
      const data = res.data.data;

      data.forEach(
        ({
          startX,
          startY,
          mouseX,
          mouseY,
        }: {
          startX: number;
          startY: number;
          mouseX: number;
          mouseY: number;
        }) => {
          renderPencil(startX, startY, mouseX, mouseY, ctx);
        }
      );
    } catch (error) {
      console.log("Error fetching the data: ", error);
    }
  };

  useEffect(() => {
    const setVal = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    setVal();
    connectWebSocket();
    assignContext(); // assign ctx to ctxRef.current
    getPencilData(ctxRef.current!); // Get the pencil data & render
    window.addEventListener("resize", setVal);

    return () => {
      wsRef.current!.close();
      window.removeEventListener("resize", setVal);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    // ctx.fillStyle = "#000"; // background
    // ctx.fillRect(0, 0, size.width, size.height);

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      isPaintingRef.current = true;
      ctx.fillStyle = "#fff";
      coordsRef.current = getPos(e);
    };

    const handleMouseUp = () => {
      isPaintingRef.current = false;
    };

    const handleMouseMove = async (e: MouseEvent) => {
      if (!isPaintingRef.current) return;

      const { x: mouseX, y: mouseY } = getPos(e);
      const { x: startX, y: startY } = coordsRef.current;

      try {
        wsRef.current!.send(
          JSON.stringify({
            startX,
            startY,
            mouseX,
            mouseY,
          })
        );
      } catch (error) {
        console.log("Error saving the data: ", error);
      }

      renderPencil(startX, startY, mouseX, mouseY, ctx);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [size]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (!pencilData) return;

    const { startX, startY, mouseX, mouseY } = pencilData;
    // renderPencil(startX, startY, mouseX, mouseY, ctx);
  }, [pencilData]);

  return (
    <div className="w-screen h-scree">
      <canvas ref={canvasRef} width={size.width} height={size.height} />
    </div>
  );
}
