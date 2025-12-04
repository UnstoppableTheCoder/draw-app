import { IconButton } from "./IconButton";
import {
  Circle,
  Minus,
  MousePointer2,
  Pencil,
  RectangleHorizontalIcon,
  TypeOutline,
} from "lucide-react";
import { Tool, Tools } from "./Canvas";
import { Dispatch, SetStateAction } from "react";

export function TopBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: string;
  setSelectedTool: Dispatch<SetStateAction<Tool>>;
}) {
  return (
    <div className="absolute top-0 left-0 flex gap-3 p-2">
      <IconButton
        activated={selectedTool === Tools.Select}
        icon={<MousePointer2 />}
        onClick={() => {
          setSelectedTool(Tools.Select);
        }}
      />
      <IconButton
        activated={selectedTool === Tools.Text}
        icon={<TypeOutline />}
        onClick={() => {
          setSelectedTool(Tools.Text);
        }}
      />
      <IconButton
        activated={selectedTool === Tools.Line}
        icon={<Minus />}
        onClick={() => {
          setSelectedTool(Tools.Line);
        }}
      />
      <IconButton
        activated={selectedTool === Tools.Pencil}
        icon={<Pencil />}
        onClick={() => {
          setSelectedTool(Tools.Pencil);
        }}
      />
      <IconButton
        activated={selectedTool === Tools.Rect}
        icon={<RectangleHorizontalIcon />}
        onClick={() => {
          setSelectedTool(Tools.Rect);
        }}
      />
      <IconButton
        activated={selectedTool === Tools.Circle}
        icon={<Circle />}
        onClick={() => {
          setSelectedTool(Tools.Circle);
        }}
      />
    </div>
  );
}
