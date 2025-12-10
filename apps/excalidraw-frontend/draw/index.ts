// // This file is not being used
// // Instead of this - we are using Game class

// import { HTTP_BACKEND } from "@/config";
// import { Shape } from "@/types/shape";
// import axios from "axios";

// export async function initDraw(
//   canvas: HTMLCanvasElement,
//   roomId: string,
//   socket: WebSocket
// ) {
//   const ctx = canvas.getContext("2d");

//   const existingShapes: Shape[] = await getExistingShapes(roomId);

//   if (!ctx) return;
//   clearCanvas(existingShapes, canvas, ctx);

//   let clicked = false;
//   let startX = 0;
//   let startY = 0;

//   socket.onmessage = (event) => {
//     const parsedData = JSON.parse(event.data);

//     if (parsedData.type === "chat") {
//       const parsedShape = JSON.parse(parsedData.message);
//       existingShapes.push(parsedShape);
//       clearCanvas(existingShapes, canvas, ctx);
//     }
//   };

//   canvas.addEventListener("mouseup", (e) => {
//     clicked = false;
//     const width = e.clientX - startX;
//     const height = e.clientY - startY;

//     // @ts-ignore
//     const selectedTool = window.selectedTool;
//     console.log(selectedTool);
//     let shape: Shape | null = null;

//     if (selectedTool === "rect") {
//       shape = {
//         type: selectedTool,
//         x: startX,
//         y: startY,
//         width,
//         height,
//       };
//     } else if (selectedTool === "circle") {
//       const radius = Math.max(width, height) / 2;
//       shape = {
//         type: "circle",
//         radius: radius,
//         centerX: startX + radius,
//         centerY: startY + radius,
//       };
//     }

//     if (!shape) return;

//     existingShapes.push(shape);

//     socket.send(
//       JSON.stringify({
//         type: "chat",
//         message: JSON.stringify(shape),
//         roomId: Number(roomId),
//       })
//     );
//   });

//   canvas.addEventListener("mousedown", (e) => {
//     clicked = true;
//     startX = e.clientX;
//     startY = e.clientY;
//   });

//   canvas.addEventListener("mousemove", (e) => {
//     if (clicked) {
//       const width = e.clientX - startX;
//       const height = e.clientY - startY;
//       clearCanvas(existingShapes, canvas, ctx);
//       //@ts-ignore
//       const selectedTool = window.selectedTool;
//       if (selectedTool === "rect") {
//         ctx.strokeStyle = "rgba(255, 255, 255)";
//         ctx.strokeRect(startX, startY, width, height);
//       } else if (selectedTool === "circle") {
//         const radius = Math.max(width, height) / 2;
//         const centerX = startX + radius;
//         const centerY = startY + radius;

//         ctx.beginPath();
//         ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.closePath();
//       }
//     }
//   });
// }

// function clearCanvas(
//   existingShapes: Shape[],
//   canvas: HTMLCanvasElement,
//   ctx: CanvasRenderingContext2D
// ) {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = "rgba(0, 0, 0)";

//   existingShapes.map((shape) => {
//     if (shape.type === "rect") {
//       ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//       ctx.strokeStyle = "rgba(255, 255, 255)";
//     } else if (shape.type === "circle") {
//       ctx.beginPath();
//       ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
//       ctx.stroke();
//       ctx.closePath();
//     }
//   });
// }

// async function getExistingShapes(roomId: string) {
//   const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
//   const messages = res.data.messages;

//   const shapes = messages.map((x: { message: string }) => {
//     const messageData = JSON.parse(x.message);
//     return messageData;
//   });

//   return shapes;
// }
