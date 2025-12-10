import { IconButton } from "../canvas/IconButton";
import {
  Circle,
  Minus,
  MousePointer2,
  Pencil,
  RectangleHorizontalIcon,
  TypeOutline,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { Tool, Tools } from "@/types/tools";

export function TopBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: string;
  setSelectedTool: Dispatch<SetStateAction<Tool>>;
}) {
  const icons = [
    { selectedTool: Tools.Select, icon: <MousePointer2 /> },
    { selectedTool: Tools.Text, icon: <TypeOutline /> },
    { selectedTool: Tools.Line, icon: <Minus /> },
    { selectedTool: Tools.Pencil, icon: <Pencil /> },
    { selectedTool: Tools.Rect, icon: <RectangleHorizontalIcon /> },
    { selectedTool: Tools.Circle, icon: <Circle /> },
    {
      selectedTool: Tools.Ellipse,
      icon: (
        <Image
          className="dark:invert"
          src="/ellipse.svg"
          alt="Ellipse logo"
          width={25}
          height={25}
          priority
        />
      ),
    },
  ];
  return (
    <div className={`absolute top-0 left-0 flex gap-3 p-2`}>
      {icons.map((i, index) => (
        <IconButton
          key={index}
          activated={selectedTool === i.selectedTool}
          icon={i.icon}
          onClick={() => {
            setSelectedTool(i.selectedTool);
          }}
        />
      ))}
    </div>
  );
}
