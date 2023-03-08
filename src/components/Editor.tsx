import {
  useState,
  DragEventHandler,
  ChangeEventHandler,
  useEffect,
  useRef,
  MouseEventHandler,
} from "react";
import EditorPanel from "./EditorPanel";

import { IconFilePlus } from "@tabler/icons-react";

const Editor = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [stopUpload, setStopUpload] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);

  const [isSelecting, setIsSelecting] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    if (stopUpload) {
      preventNewImgUpload(e.dataTransfer.files[0]);
      return;
    }

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
    if (stopUpload) {
      preventNewImgUpload(e.target.files[0]);
      return;
    }

    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const preventNewImgUpload = (file: File) => {
    if (
      confirm("이미 이미지가 업로드되어 있습니다. 이미지를 교체하시겠습니까?")
    ) {
      const currentCanvas = canvasRef.current;

      const ctx = currentCanvas?.getContext("2d");

      ctx?.clearRect(0, 0, currentCanvas!.width, currentCanvas!.height);

      setFile(file);
    }

    return;
  };

  const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSelecting(true);

    const startPoint = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };

    setStartX(startPoint.x);
    setStartY(startPoint.y);
  };

  const handleSelecting: MouseEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSelecting || !file) return;

    const canvasCurrent = canvasRef.current;
    const ctx = canvasCurrent?.getContext("2d");

    const img = new Image();
    img.src = URL.createObjectURL(file);

    const canvasPosition = canvasCurrent!.getBoundingClientRect();

    const dragAreaWidth = Math.round(e.clientX - startX - canvasPosition.left);
    const dragAreaHeight = Math.round(e.clientY - startY - canvasPosition.top);

    img.onload = () => {
      ctx!.filter = "blur(3px)";
      ctx!.drawImage(img, 0, 0, canvasCurrent!.width, canvasCurrent!.height);

      let blurredImgData: ImageData | null = null;

      if (dragAreaWidth !== 0 && dragAreaHeight !== 0) {
        blurredImgData = ctx!.getImageData(
          startX,
          startY,
          dragAreaWidth,
          dragAreaHeight
        );
      }

      ctx!.clearRect(0, 0, canvasCurrent!.width, canvasCurrent!.height);
      ctx!.filter = "none";
      ctx!.drawImage(img, 0, 0, canvasCurrent!.width, canvasCurrent!.height);

      const rw = dragAreaWidth < 0 ? startX + dragAreaWidth : startX;
      const rh = dragAreaHeight < 0 ? startY + dragAreaHeight : startY;

      if (blurredImgData) {
        ctx!.putImageData(blurredImgData, rw, rh);
        blurredImgData = null;
        ctx!.stroke();
      }
    };
  };

  const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSelecting(false);
  };

  const drawingImgOnCanvas = (imgFile: File) => {
    const canvasCurrent = canvasRef.current;
    const ctx = canvasCurrent?.getContext("2d");

    const img = new Image();
    img.src = URL.createObjectURL(imgFile);

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, canvasCurrent!.width, canvasCurrent!.height);
      setStopUpload(true);
    };
  };

  useEffect(() => {
    if (file) {
      drawingImgOnCanvas(file);
    }
  }, [file]);

  return (
    <div className="w-fit border h-fit rounded-md flex flex-col">
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
          <div
            className="relative flex justify-center items-center"
            style={{ width: "850px", height: "500px" }}
          >
            {isDragging && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <IconFilePlus stroke={2} size={48} />
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={850}
              height={500}
              onMouseDown={handleMouseDown}
              onMouseMove={handleSelecting}
              onMouseUp={handleMouseUp}
              className={isDragging ? "bg-slate-300" : ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
