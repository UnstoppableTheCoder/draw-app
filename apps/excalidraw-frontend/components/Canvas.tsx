"use client";

import {
  ChangeEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Game } from "@/draw/Game";
import { TopBar } from "./TopBar";
import { LogOut } from "lucide-react";
import { IconButton } from "./IconButton";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export enum Tools {
  Circle = "circle",
  Pencil = "pencil",
  Rect = "rect",
  Line = "line",
  Pointer = "pointer",
  Text = "text",
}

export type Tool = "circle" | "pencil" | "rect" | "line" | "pointer" | "text";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>(Tools.Pointer);
  const [game, setGame] = useState<Game>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function getPos(e: ReactMouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: e.clientX - rect?.left,
      y: e.clientY - rect?.top,
    };
  }

  function renderInput(e: ReactMouseEvent<HTMLCanvasElement>) {
    const pos = getPos(e);
    if (!pos || !inputRef.current) return;

    setPosition({ ...pos });
    const { x, y } = pos;
    inputRef.current.style.display = "block";
    inputRef.current.style.left = `${x}px`;
    inputRef.current.style.top = `${y - 14}px`;

    inputRef.current.focus();
  }

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      //   initDraw(canvasRef.current, roomId, socket);
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  const handleDoubleClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    setIsInputVisible(true);
    renderInput(e);
    setSelectedTool("text");
  };

  const handleClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "text") {
      setIsInputVisible(true);
      renderInput(e);

      // Send data to ws-server
      if (inputVal) {
        socket.send(
          JSON.stringify({
            type: "shape:add",
            shape: {
              type: "text",
              data: { text: inputVal, ...position },
              color: "white",
              thickness: 2,
            },
            roomId: Number(roomId),
          })
        );

        setSelectedTool("pointer");
      }
    }

    if (!inputRef.current) return;
    if (isInputVisible) {
      inputRef.current.style.display = "none";
      setIsInputVisible(false);
    }

    setInputVal("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const handleLeaveRoom = () => {
    try {
      socket.send(
        JSON.stringify({
          type: "leave_room",
          roomId,
        })
      );
      router.push("/room");
      toast.success("Left the room");
    } catch (error: any) {
      console.log("Error leaving the room: ", error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <div className="relative h-screen w-screen">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          className="touch-none absolute"
          onDoubleClick={handleDoubleClick}
          onClick={handleClick}
        ></canvas>

        <input
          ref={inputRef}
          className={`absolute text-white placeholder:text-white text-[40px] outline-none`}
          type="text"
          value={inputVal}
          onChange={handleChange}
        />

        <div className="absolute top-2 right-5">
          <IconButton icon={<LogOut />} onClick={handleLeaveRoom} />
        </div>
      </div>
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}
