import { ReactNode } from "react";

export function IconButton({
  icon,
  onClick,
  activated,
}: {
  icon: ReactNode;
  onClick: () => void;
  activated?: boolean;
}) {
  return (
    <div
      className={`pointer rounded-full border p-2 bg-black hover:bg-gray-600 cursor-pointer`}
      onClick={onClick}
    >
      <div className={`${activated ? "text-red-400" : "text-white"}`}>
        {icon}
      </div>
    </div>
  );
}
