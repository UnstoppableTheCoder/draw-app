import { getExistingShapes } from "../helper/fetchData";
import { Shape } from "@/types/shape";
import { Dispatch, SetStateAction } from "react";
import { getShapePosition, hitTest } from "@/helper/hitTest";
import { Tool } from "@/types/tools";
import { getPosition } from "@/helper/getPosition";
import getSize from "@/helper/getSize";

export class CanvasPainter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  private startX: number = 0;
  private startY: number = 0;
  private selectedTool: Tool = "select";
  private selectedShapeId: string | null = null;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private selectedColor = "#689B8A";
  private selectedLineThickness = 3;
  private setSelectedTool: Dispatch<SetStateAction<Tool>>;
  private zoomPercentage: number;
  private setZoomPercentage: Dispatch<SetStateAction<number>>;
  private viewport = {
    scale: 1,
    originX: 0,
    originY: 0,
  };

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    selectedTool: Tool,
    setSelectedTool: Dispatch<SetStateAction<Tool>>,
    zoomPercentage: number,
    setZoomPercentage: Dispatch<SetStateAction<number>>
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.selectedTool = selectedTool;
    this.setSelectedTool = setSelectedTool;
    this.setZoomPercentage = setZoomPercentage;
    this.zoomPercentage = zoomPercentage || this.viewport.scale * 100;

    this.init();
    this.getSocketMessages();
    this.initPointerHandlers();
  }

  setTool(
    tool: "circle" | "rect" | "pencil" | "line" | "select" | "text" | "ellipse"
  ) {
    this.selectedTool = tool;
  }

  getSelectedShapeId() {
    return this.selectedShapeId;
  }

  getSelectedShape() {
    const shape = this.existingShapes.find(
      (shape) => shape.id === this.selectedShapeId
    );
    if (!shape) return;
    return JSON.parse(JSON.stringify(shape));
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.renderShape();
  }

  renderShape = () => {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const size = window.innerHeight + window.innerWidth;
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(
      this.viewport.originX,
      this.viewport.originY,
      size / this.viewport.scale,
      size / this.viewport.scale
    );

    this.existingShapes.forEach((shape) => {
      let selectedColor, selectedThickness;
      if (shape.id === this.selectedShapeId) {
        selectedColor = this.selectedColor;
        selectedThickness = this.selectedLineThickness;
      } else {
        selectedColor = shape.color;
        selectedThickness = shape.thickness;
      }

      this.ctx.strokeStyle = selectedColor;
      this.ctx.lineWidth = selectedThickness;

      switch (shape.type) {
        case "rect": {
          const { x, y, width, height } = shape.data;
          this.ctx.strokeRect(x, y, width, height);
          break;
        }
        case "circle": {
          const { centerX, centerY, radius } = shape.data;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, Math.abs(radius), 0, 2 * Math.PI);
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        }
        case "pencil": {
          const { points } = shape.data;
          this.drawStroke(this.ctx, points);
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
          const { text, x, y, width, height } = shape.data;
          const lines = text.split("\n");

          this.ctx.font = "40px Arial";
          this.ctx.fillStyle = selectedColor;
          this.ctx.textBaseline = "top";

          lines.forEach((line, index) => {
            this.ctx.fillText(line, x, y + index * height, width);
          });
          break;
        }
        case "ellipse": {
          const { centerX, centerY, radiusX, radiusY } = shape.data;
          this.ctx.beginPath();
          this.ctx.ellipse(
            centerX,
            centerY,
            radiusX,
            radiusY,
            0,
            0,
            2 * Math.PI
          );
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
    });
  };

  getSocketMessages() {
    this.socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "shape:add") {
        const shape = parsedData.shape;
        this.existingShapes.push(shape);
        this.renderShape();
      } else if (parsedData.type === "shape:delete") {
        const { shape } = parsedData;
        const index = this.existingShapes.findIndex((s) => s.id === shape.id);
        this.existingShapes.splice(index, 1);
        this.renderShape();
      } else if (parsedData.type === "shape:update") {
        const { shape } = parsedData;
        const index = this.existingShapes.findIndex((s) => s.id === shape.id);
        this.existingShapes[index] = shape;
        this.renderShape();
      } else if (parsedData.type === "shape:duplicate") {
        const shape = parsedData.shape;
        this.selectedShapeId = shape.id;
        this.existingShapes.push(shape);
        this.renderShape();
      }
    };
  }

  initPointerHandlers() {
    this.canvas.addEventListener("pointerdown", this.pointerDownHandler);
    document.addEventListener("pointerup", this.pointerUpHandler);
    this.canvas.addEventListener("pointermove", this.pointerMoveHandler);
    this.canvas.addEventListener("wheel", this.wheelHandler);
    this.canvas.addEventListener("pointerenter", this.pointerEnterHandler);
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.pointerDownHandler);
    document.removeEventListener("pointerup", this.pointerUpHandler);
    this.canvas.removeEventListener("pointermove", this.pointerMoveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler);
  }

  pointerUpHandler = (e: PointerEvent) => {
    document.body.style.cursor = "auto";

    this.clicked = false;
    const { width, height } = getSize(e, this.canvas, this.startX, this.startY);
    const { x: endX, y: endY } = getPosition(e, this.canvas);
    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    // Edit the shape
    if (this.isDragging && this.selectedShapeId) {
      // Get the shape & delete from existingShapes
      const index = this.existingShapes.findIndex(
        (shape) => shape.id === this.selectedShapeId
      );

      const shape = this.existingShapes[index];
      this.socket.send(
        JSON.stringify({
          type: "shape:update",
          shape,
          roomId: parseInt(this.roomId),
        })
      );
    }

    this.isDragging = false;

    // Create the shape
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
      const lastShape = this.existingShapes.pop();
      if (!lastShape) return;
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
    } else if (selectedTool === "ellipse") {
      const dx = endX - this.startX;
      const dy = endY - this.startY;
      const rx = dx / 2;
      const ry = dy / 2;
      const cx = this.startX + rx;
      const cy = this.startY + ry;
      shape = {
        type: "ellipse",
        data: {
          centerX: cx,
          centerY: cy,
          radiusX: Math.abs(rx),
          radiusY: Math.abs(ry),
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

    if (
      selectedTool === "rect" ||
      selectedTool === "circle" ||
      selectedTool === "line" ||
      selectedTool === "ellipse"
    ) {
      this.setSelectedTool("select");
    }

    if (this.selectedTool === "select") {
      document.body.style.cursor = "auto";
    } else {
      //   document.body.style.cursor = "crosshair";
    }
  };

  pointerDownHandler = (e: PointerEvent) => {
    e.stopPropagation();

    this.clicked = true;
    const { x, y } = getPosition(e, this.canvas);
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
    } else if (this.selectedTool === "select") {
      let isShapeSelected = false;
      for (let i = this.existingShapes.length - 1; i >= 0; i--) {
        if (hitTest(x, y, this.existingShapes[i])) {
          this.selectedShapeId = this.existingShapes[i].id!;
          const shapePos = getShapePosition(this.existingShapes[i]);
          this.dragOffset = {
            x: x - shapePos!.x,
            y: y - shapePos!.y,
          };

          this.isDragging = true;
          this.canvas.setPointerCapture(e.pointerId); // Keeps events during drag
          isShapeSelected = true;
          break;
        }
      }

      if (!isShapeSelected) {
        this.selectedShapeId = null;
      }

      this.renderShape();
      return;
    }

    this.selectedShapeId = null;
  };

  pointerMoveHandler = (e: PointerEvent) => {
    if (!this.clicked) return;

    if (this.selectedTool !== "select") {
      document.body.style.cursor = "crosshair";
    }

    const { width, height } = getSize(e, this.canvas, this.startX, this.startY);
    const { startX, startY } = this;
    const { x: endX, y: endY } = getPosition(e, this.canvas);
    const selectedTool = this.selectedTool;

    this.renderShape();

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "white";

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
      this.renderShape();
    } else if (selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (selectedTool === "ellipse") {
      const dx = endX - startX;
      const dy = endY - startY;
      const rx = dx / 2;
      const ry = dy / 2;
      const cx = startX + rx;
      const cy = startY + ry;
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (
      selectedTool === "select" &&
      this.isDragging &&
      this.selectedShapeId
    ) {
      document.body.style.cursor = "move";

      const shape = this.existingShapes.find(
        (s) => s.id === this.selectedShapeId
      );
      if (!shape) return;

      // New Position
      const newX = endX - this.dragOffset.x;
      const newY = endY - this.dragOffset.y;

      this.moveShape(shape, newX, newY);
    }
  };

  pointerEnterHandler = () => {
    if (this.selectedTool === "select") {
      document.body.style.cursor = "auto";
    } else {
      document.body.style.cursor = "crosshair";
    }
  };

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();

    const { x, y } = getPosition(e, this.canvas);

    // +10% for wheel up, -10% for wheel down
    const scroll = e.deltaY < 0 ? 1 : -1; // just sign
    const deltaPercent = scroll > 0 ? 10 : -10;

    // update zoom percentage and clamp
    this.zoomPercentage += deltaPercent;
    this.zoomPercentage = Math.max(10, Math.min(400, this.zoomPercentage));

    this.zoomInAndOut(x, y, this.zoomPercentage);

    // keep React/UI state in sync if needed
    this.setZoomPercentage(this.zoomPercentage);
  };

  zoomInAndOut(x: number, y: number, zoomPercentage: number) {
    // compute new scale from percentage
    const newScale = zoomPercentage / 100;

    // compute zoom factor relative to current scale
    const zoom = newScale / this.viewport.scale; // e.g. from 1.0 to 1.1 -> 1.1

    // apply camera transform
    this.ctx.translate(this.viewport.originX, this.viewport.originY);

    // Formula
    this.viewport.originX -=
      x / (this.viewport.scale * zoom) - x / this.viewport.scale;
    this.viewport.originY -=
      y / (this.viewport.scale * zoom) - y / this.viewport.scale;

    this.ctx.scale(zoom, zoom);
    this.ctx.translate(-this.viewport.originX, -this.viewport.originY);

    // finally store the new scale
    this.viewport.scale = newScale;

    this.renderShape();
  }

  moveShape = (shape: Shape, newX: number, newY: number) => {
    const { x: oldX, y: oldY } = getShapePosition(shape);
    const dx = newX - oldX;
    const dy = newY - oldY;

    switch (shape.type) {
      case "rect":
        shape.data.x += dx;
        shape.data.y += dy;
        break;
      case "circle":
        shape.data.centerX += dx;
        shape.data.centerY += dy;
        break;
      case "text":
        shape.data.x += dx;
        shape.data.y += dy;
        break;
      case "line":
        shape.data.startX += dx;
        shape.data.startY += dy;
        shape.data.endX += dx;
        shape.data.endY += dy;
        break;
      case "pencil":
        const { points } = shape.data;
        points.forEach((point) => {
          point.x += dx;
          point.y += dy;
        });
        break;
      case "ellipse":
        shape.data.centerX += dx;
        shape.data.centerY += dy;
        break;
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

    // ctx.strokeStyle = "#ffffff";
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
}
