"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export default function ChatRoomClient({
  messages,
  id,
}: {
  messages: any[];
  id: number;
}) {
  const { socket, loading } = useSocket();
  //   const [socket, setSocket] = useState<WebSocket>();
  const [chats, setChats] = useState(messages);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "join_room",
            roomId: id, 
          })
        );
      };

      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);

        console.log("Message Received: - client", parsedData.type);
        console.log(parsedData);

        if (parsedData.type === "chat") {
          setChats((c) => [...c, parsedData]);
        }
      };

      // return () => {
      //   socket?.close();
      // };
    }
  }, []);

  return (
    <div>
      {chats.map((m, index) => (
        <div key={index}>{m.message}</div>
      ))}

      <input
        type="text"
        value={currentMessage}
        onChange={(e) => {
          setCurrentMessage(e.target.value);
        }}
      />
      <button
        onClick={() => {
          socket?.send(
            JSON.stringify({
              type: "chat",
              roomId: id,
              message: currentMessage,
            })
          );
          setCurrentMessage("");
        }}
      >
        Send Message
      </button>
    </div>
  );
}
