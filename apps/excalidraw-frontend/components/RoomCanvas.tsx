"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlNmNjMWI3ZC00OWMxLTQ2NmYtYWM4MC1jYmNhMjVkMWM3ZGEiLCJpYXQiOjE3NjM5NzU5NTN9.kXCn_q6zBhQkWRRwDALtqw8nFpAUWj2Rcm-ifQGQU7I`
    );

    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({ type: "join_room", roomId: Number(roomId) }));
    };
  }, []);

  if (!socket) return <div>Connecting to server</div>;

  return <Canvas roomId={roomId} socket={socket} />;
}
