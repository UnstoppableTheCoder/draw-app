import { Dispatch, SetStateAction } from "react";

export default function ZoomPercentage({
  zoomPercentage,
  setZoomPercentage,
}: {
  zoomPercentage: number;
  setZoomPercentage: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="absolute bottom-5 left-5 bg-gray-800 rounded-lg flex gap-5 items-center justify-center">
      <button
        onClick={() => setZoomPercentage((p) => p - 5)}
        className="hover:bg-gray-700 px-4 py-2 rounded-lg text-xl font-bold cursor-pointer"
      >
        -
      </button>

      <div>{Math.trunc(zoomPercentage)}%</div>
      <button
        onClick={() => setZoomPercentage((p) => p + 5)}
        className="hover:bg-gray-700 px-4 py-2 rounded-lg text-xl font-bold cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
