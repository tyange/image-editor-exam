import { useRef } from "react";
import EditorPanel from "./EditorPanel";

const NewEditor = () => {
  const blurLayerRef = useRef<HTMLCanvasElement | null>(null);
  const originImageLayerRef = useRef<HTMLCanvasElement | null>(null);
  const dragLayerRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <div className="w-2/3 border h-4/5 rounded-md flex flex-col">
      <EditorPanel />
      <div className="flex-1 flex flex-col justify-center items-center">
        <div
          className={`w-full h-full flex flex-col gap-3 justify-center items-center`}
        >
          <input
            id="fileInput"
            type="file"
            className="p-3 hidden"
            accept="image/png, image/jpeg, image/jpg"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            Select File
          </label>
          <div className="relative w-full h-full flex justify-center items-center">
            <canvas ref={blurLayerRef} />
            <canvas ref={originImageLayerRef} />
            <canvas ref={dragLayerRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEditor;
