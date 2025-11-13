import WebSocket, { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => {
  console.log("WebSocket server is listening on ws://localhost:8080");
});

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

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (!decoded || !decoded.userId) {
    ws.close();
    return;
  }

  ws.on("message", (data: string) => {
    const parsedData = JSON.parse(data);
    ws.send("Pong");
  });

  ws.on("close", () => {
    console.log("Disconnected");
  });
});
