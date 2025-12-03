import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";
import { Shape } from "@/types/shape";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  private startX: number = 0;
  private startY: number = 0;
  private selectedTool: Tool = "pointer";

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;

    this.init();
    this.getSocketMessages();
    this.initPointerHandlers();
  }

  setTool(tool: "circle" | "rect" | "pencil" | "line" | "pointer" | "text") {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.existingShapes.map((shape) => {
      this.renderShape(this.ctx, shape);
    });
  }

  renderShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.thickness;

    switch (shape.type) {
      case "rect": {
        const { x, y, width, height } = shape.data;
        ctx.strokeRect(x, y, width, height);
        break;
      }
      case "circle": {
        const { centerX, centerY, radius } = shape.data;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.abs(radius), 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        break;
      }
      case "pencil": {
        const { points } = shape.data;
        this.drawStroke(ctx, points);
        break;
      }
      case "line": {
        const { startX, startY, endX, endY } = shape.data;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.closePath();
        break;
      }
      case "text": {
        const { text, x, y } = shape.data;
        this.ctx.font = "40px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(text, x, y);
        break;
      }
      default:
        break;
    }
  };

  getSocketMessages() {
    this.socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "shape:add") {
        const shape = parsedData.shape;
        this.existingShapes.push(shape);
        this.clearCanvas();
      }
    };
  }

  initPointerHandlers() {
    this.canvas.addEventListener("pointerdown", this.pointerDownHandler);

    // this.canvas.addEventListener("pointerleave", this.pointerUpHandler);

    this.canvas.addEventListener("pointerup", this.pointerUpHandler);

    this.canvas.addEventListener("pointermove", this.pointerMoveHandler);
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.pointerDownHandler);
    // this.canvas.removeEventListener("pointerleave", this.pointerUpHandler);
    this.canvas.removeEventListener("pointerup", this.pointerUpHandler);
    this.canvas.removeEventListener("pointermove", this.pointerMoveHandler);
  }

  pointerUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const { width, height } = this.getSize(e);
    const { x: endX, y: endY } = this.getPos(e);
    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: selectedTool,
        data: {
          x: this.startX,
          y: this.startY,
          width,
          height,
        },
        color: "#ffffff",
        thickness: 2,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        data: {
          radius: radius,
          centerX: this.startX + radius,
          centerY: this.startY + radius,
        },
        color: "#ffffff",
        thickness: 2,
      };
    } else if (selectedTool === "pencil") {
      const lastShape = this.existingShapes[this.existingShapes.length - 1];
      shape = lastShape;
    } else if (selectedTool === "line") {
      shape = {
        type: "line",
        data: {
          startX: this.startX,
          startY: this.startY,
          endX,
          endY,
        },
        color: "#ffffff",
        thickness: 2,
      };
    }

    if (!shape) return;
    this.socket.send(
      JSON.stringify({
        type: "shape:add",
        shape,
        roomId: Number(this.roomId),
      })
    );
  };

  pointerDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const { x, y } = this.getPos(e);
    this.startX = x;
    this.startY = y;

    if (this.selectedTool === "pencil") {
      this.existingShapes.push({
        type: "pencil",
        data: {
          points: [],
        },
        color: "#ffffff",
        thickness: 2,
      });
    }
  };

  pointerMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      const { width, height } = this.getSize(e);
      const { startX, startY } = this;
      const { x: endX, y: endY } = this.getPos(e);
      const selectedTool = this.selectedTool;

      this.clearCanvas();

      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 2;
      if (selectedTool === "rect") {
        this.ctx.strokeRect(startX, startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = startX + radius;
        const centerY = startY + radius;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "pencil") {
        const lastShape = this.existingShapes[this.existingShapes.length - 1];
        if (lastShape.type === "pencil") {
          lastShape.data.points.push({
            x: endX,
            y: endY,
          });
        }
        this.clearCanvas();
      } else if (selectedTool === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  };

  //   drawLine = (points) => {
  //     let x1 = endX;
  //     let y1 = endY;
  //     let x2 = startX;
  //     let y2 = startY;

  //     const steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  //     if (steep) {
  //       [x1, y1] = [y1, x1];
  //       [x2, y2] = [y2, x2];
  //     }

  //     if (x1 > x2) {
  //       [x1, x2] = [x2, x1];
  //       [y1, y2] = [y2, y1];
  //     }

  //     const dx = x2 - x1;
  //     const dy = Math.abs(y2 - y1);
  //     const de = dy / dx;
  //     let error = 0;
  //     const yStep = y1 < y2 ? 1 : -1;
  //     let y = y1;

  //     // const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  //     // let thickness = 5 - len / 10;
  //     // if (thickness < 1) thickness = 1;
  //     // thicknessRef.current = thickness;

  //     for (let x = x1; x < x2; x++) {
  //       this.ctx.fillStyle = "white";
  //       if (steep) {
  //         this.ctx.fillRect(y, x, this.lineThickness, this.lineThickness);
  //       } else {
  //         this.ctx.fillRect(x, y, this.lineThickness, this.lineThickness);
  //       }

  //       error += de;
  //       if (error >= 0.5) {
  //         y += yStep;
  //         error -= 1;
  //       }
  //     }

  //     this.startX = endX;
  //     this.startY = endY;
  //   };

  drawStroke = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[]
  ) => {
    if (points.length < 2) return;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
  };

  getPos = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  getSize = (e: MouseEvent) => {
    const { x, y } = this.getPos(e);
    return {
      width: x - this.startX,
      height: y - this.startY,
    };
  };
}
