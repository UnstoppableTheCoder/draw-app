import "dotenv/config";
import WebSocket, { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
import { v4 as uuidv4 } from "uuid";

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

    console.log("message - parsedData - ", parsedData);

    if (parsedData.type === "join_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user?.rooms.includes(parsedData.roomId)) {
        user?.rooms.push(parsedData.roomId);
      }
      ws.send(JSON.stringify({ message: `You have joined a room` }));
    } else if (parsedData.type === "leave_room") {
      const user = users.find((u) => u.ws === ws);
      if (!user) {
        console.log("No User found");
        return;
      }

      user.rooms = user.rooms.filter((r) => r !== parsedData.roomId);
      ws.send(JSON.stringify({ message: "You have left the room" }));
    } else if (parsedData.type === "shape:add") {
      const { roomId, shape } = parsedData;
      try {
        // Use queues in here
        const newShape = await prismaClient.shape.create({
          data: { roomId, ...shape, createdBy: userId },
        });

        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "shape:add",
                shape: newShape,
                roomId,
              })
            );
          }
        });
      } catch (error) {
        console.log("Error saving chat: ", error);
      }
    } else if (parsedData.type === "shape:update") {
      const { shape, roomId } = parsedData;
      const updatedShape = await prismaClient.shape.update({
        where: {
          id: shape.id,
        },
        data: shape,
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "shape:update",
              shape: updatedShape,
              roomId,
            })
          );
        }
      });
    } else if (parsedData.type === "shape:duplicate") {
      const { roomId, shape } = parsedData;
      try {
        // Use queues in here
        const duplicatedShape = await prismaClient.shape.create({
          data: { roomId, ...shape, createdBy: userId },
        });

        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "shape:duplicate",
                shape: duplicatedShape,
                roomId,
              })
            );
          }
        });
      } catch (error) {
        console.log("Error saving chat: ", error);
      }
    } else if (parsedData.type === "shape:delete") {
      const { shapeId, roomId } = parsedData;
      try {
        const deletedShape = await prismaClient.shape.delete({
          where: { id: shapeId, roomId },
        });

        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "shape:delete",
                shape: deletedShape,
                roomId,
              })
            );
          }
        });
      } catch (error) {
        console.log("Error deleting the shape: ", error);
      }
    }

    console.log("message - users - ", users);
  });

  ws.on("close", () => {
    users = users.filter((u) => u.ws !== ws);
    console.log("Disconnected");
  });
});
