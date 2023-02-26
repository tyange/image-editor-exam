import { useState, DragEventHandler, ChangeEventHandler } from "react";
import EditorPanel from "./EditorPanel";

import { IconFilePlus } from "@tabler/icons-react";

const Editor = () => {
  const [isDragging, setIsDragging] = useState(false);

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

    console.log(e.dataTransfer.files);

    setIsDragging(false);
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    console.log(e.target.files);
  };

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
          <input type="file" className="p-3" onChange={handleFileChange} />
          <div className="relative w-full h-full flex justify-center items-center">
            {isDragging && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <IconFilePlus stroke={2} size={48} />
              </div>
            )}
            <canvas
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
