import "dotenv/config";

import WebSocket, { WebSocketServer } from "ws";
import { prisma } from "@repo/db_pencil/client";

const wss = new WebSocketServer({ port: 4000 });

wss.on("listening", () => {
  console.log("Web Socket Server is listening on http://localhost:4000");
});

wss.on("connection", (ws: WebSocket) => {
  ws.on("error", (err) => {
    console.log("Error while connecting: ", err);
  });

  ws.on("message", async (data: string) => {
    const parsedData = JSON.parse(data);
    try {
      const data = await prisma.pencil.create({ data: parsedData });
      console.log(data);
    } catch (error) {
      console.log("Error saving the data: ", error);
    }

    ws.send(JSON.stringify(data));
  });

  ws.on("close", () => {
    console.log("Connection disconnected");
  });
});
