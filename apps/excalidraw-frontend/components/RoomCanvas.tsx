"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { useRouter } from "next/navigation";
import isUser from "@/auth/isUser";
import toast from "react-hot-toast";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const userExits = isUser(token);
    if (!userExits) {
      toast.error("Access Denied : User is not logged in");
      router.push("/signup");
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({ type: "join_room", roomId: Number(roomId) }));
      toast.success("You have joined the room");
    };
  }, []);

  if (!socket) return <div>Connecting to server</div>;

  return <Canvas roomId={roomId} socket={socket} />;
}
