import {
  useState,
  DragEventHandler,
  useEffect,
  useRef,
  MouseEvent,
} from "react";
import EditorPanel from "./EditorPanel";

import { IconFilePlus } from "@tabler/icons-react";

const Editor = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [rectStartX, setRectStartX] = useState<number | undefined>(undefined);
  const [rectStartY, setRectStartY] = useState<number | undefined>(undefined);

  const handleDragEnter: DragEventHandler = (e): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave: DragEventHandler = (e): void => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  };

  const handleDragOver: DragEventHandler = (e): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer!.files) {
      setIsDragging(true);
    }
  };

  const handleDrop: DragEventHandler = (e): void => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.dataTransfer.files[0].type !== "image/png" &&
      e.dataTransfer.files[0].type !== "image/jpg" &&
      e.dataTransfer.files[0].type !== "image/jpeg"
    ) {
      alert("파일 형식이 올바르지 않습니다");
      setIsDragging(false);
      return;
    }

    setFile(e.dataTransfer.files[0]);
    setIsDragging(false);
  };

  const handleFileChange = (e: any) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const getPoint = (e: MouseEvent) => {
    const canvas = canvasRef.current;

    const canvasPosition = canvas!.getBoundingClientRect();

    return {
      px: e.clientX - canvasPosition.left,
      py: e.clientY - canvasPosition.top,
    };
  };

  const mouseDown = (e: MouseEvent) => {
    e.preventDefault();

    console.log("mouse down");

    const { px, py } = getPoint(e);

    setRectStartX(px);
    setRectStartY(py);

    setIsSelecting(true);
  };

  const mouseUp = (e: MouseEvent) => {
    e.preventDefault();

    setIsSelecting(false);
  };

  useEffect(() => {
    if (file) {
      const canvasCurrent = canvasRef.current;
      const ctx = canvasCurrent?.getContext("2d");

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        ctx?.drawImage(img, 0, 0, canvasCurrent!.width, canvasCurrent!.height);
      };
    }
  }, [file]);

  return (
    <div className="w-2/3 border h-4/5 rounded-md flex flex-col">
      <EditorPanel />
      <div
        className="flex-1 flex flex-col justify-center items-center"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          className={`w-full h-full flex flex-col gap-3 justify-center items-center`}
        >
          <input
            id="fileInput"
            type="file"
            className="p-3 hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            Select File
          </label>
          <div className="relative w-full h-full flex justify-center items-center">
            {isDragging && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <IconFilePlus stroke={2} size={48} />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`w-5/6 h-5/6 shadow-md ${
                isDragging && "bg-slate-300"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
