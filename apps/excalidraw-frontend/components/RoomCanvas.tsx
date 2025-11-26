"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMDViYTJmNC05MjUxLTQwYTQtODQzNS0xYmFiYWI2M2MxYzEiLCJpYXQiOjE3NjQxMzQ4MDF9.3C4W5kySrsJ3SUB5sFRRPLtbjpFGU3SnprXrHONHrNk`
    );

    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({ type: "join_room", roomId: Number(roomId) }));
    };
  }, []);

  if (!socket) return <div>Connecting to server</div>;

  return <Canvas roomId={roomId} socket={socket} />;
}
