import { CanvasPainter } from "@/draw/CanvasPainter";
import duplicateShape from "@/helper/duplicateShape";
import { removeElement } from "@/helper/removeElement";
import { RefObject } from "react";

export default function CanvasContextMenu({
  contextMenuRef,
  canvasPainter,
  socket,
  roomId,
}: {
  contextMenuRef: RefObject<HTMLDivElement | null>;
  canvasPainter: CanvasPainter;
  socket: WebSocket;
  roomId: string;
}) {
  const handleDeleteShape = () => {
    const selectedShapeId = canvasPainter?.getSelectedShapeId();

    try {
      socket.send(
        JSON.stringify({
          type: "shape:delete",
          shapeId: selectedShapeId,
          roomId: Number(roomId),
        })
      );
    } catch (error) {
      console.log("Error deleting the shape: ", error);
    }

    removeElement(contextMenuRef);
  };

  const handleDuplicateShape = () => {
    const selectedShape = canvasPainter.getSelectedShape();
    if (!selectedShape) return;

    const duplicatedShape = duplicateShape(selectedShape);
    const { type, data, color, thickness } = duplicatedShape;

    try {
      socket.send(
        JSON.stringify({
          type: "shape:duplicate",
          shape: { type, data, color, thickness },
          roomId: Number(roomId),
        })
      );
    } catch (error) {
      console.log("Error duplicating the shape: ", error);
    }

    removeElement(contextMenuRef);
  };

  return (
    <div ref={contextMenuRef} className="absolute hidden">
      <div className="bg-gray-600 w-50 h-min flex flex-col gap-3 rounded-lg pt-3">
        <h2 className="text-xl text-white px-3">Options</h2>
        <div>
          <button
            onClick={handleDuplicateShape}
            className="text-white w-full py-3 px-2 cursor-pointer hover:bg-blue-500 rounded-lg"
          >
            Duplicate
          </button>
          <button
            onClick={handleDeleteShape}
            className="text-red-500 hover:bg-red-500 hover:text-white w-full py-3 px-2 cursor-pointer rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
