import WebSocket, { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
import "dotenv/config";
import { parse } from "dotenv";

const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => {
  console.log("WebSocket server is listening on ws://localhost:8080");
});

interface User {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

let users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    return null;
  }
}

wss.on("connection", (ws: WebSocket, request) => {
  ws.on("error", (err) => {
    console.error("Error occurred: ", err.message);
  });

  // Sending the token in request to validate the user
  const url = request.url; // ws://localhost:8080?token=123123
  if (!url) return;

  // Use this class to get search params
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? "";

  const userId = checkUser(token);
  if (!userId) {
    return ws.close();
  }

  users.push({ userId, rooms: [], ws });

  console.log("Connection - users - ", users);

  ws.on("message", async (data: string) => {
    const parsedData = JSON.parse(data);

    console.log("message - server - ", parsedData);

    if (parsedData.type === "join_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user?.rooms.includes(parsedData.roomId)) {
        user?.rooms.push(parsedData.roomId);
      }
      ws.send(`You have joined a room`);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) {
        console.log("No User found");
        return;
      }

      user.rooms = user.rooms.filter((r) => r !== parsedData.roomId);
      ws.send("You have left the room");
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      // Use queues in here
      await prismaClient.chat.create({
        data: {
          roomId,
          message,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({ type: "chat", message, roomId }));
        }
      });
    }

    console.log("message - users - ", users);
  });

  ws.on("close", () => {
    users = users.filter((u) => u.ws !== ws);
    console.log("Disconnected");
  });
});

// Fixes ->
// Persisting in db
// Authentication
