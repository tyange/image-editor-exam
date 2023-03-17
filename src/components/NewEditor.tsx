import {
  ChangeEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import EditorPanel from "./EditorPanel";

type BlurryArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const INITIAL_BLURRY_AREA = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

const NewEditor = () => {
  const originImageLayerRef = useRef<HTMLCanvasElement | null>(null);
  const blurredImageLayerRef = useRef<HTMLCanvasElement | null>(null);
  const dragLayerRef = useRef<HTMLCanvasElement | null>(null);

  const [originImageSource, setOriginImageSource] = useState<
    string | undefined
  >();

  const [isDragging, setIsDragging] = useState(false);
  const [maskedArea, setMaskedArea] = useState<BlurryArea>(INITIAL_BLURRY_AREA);
  const [maskedAreas, setMaskedAreas] = useState<BlurryArea[]>([]);

  const [maskedAreasHistory, setMaskedAreasHistory] = useState<BlurryArea[][]>([
    [],
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const fileChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      setOriginImageSource(URL.createObjectURL(e.target.files[0]));
    }
  };

  const mouseDownHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    setIsDragging(true);

    setMaskedArea({
      ...INITIAL_BLURRY_AREA,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  };

  const mouseMoveHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!isDragging) return;

    setMaskedArea((prevState) => ({
      ...prevState,
      width: e.nativeEvent.offsetX - prevState.x,
      height: e.nativeEvent.offsetY - prevState.y,
    }));
  };

  const mouseUpHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    const canvas = blurredImageLayerRef.current;

    if (!canvas) return;

    if (maskedArea.width !== 0 && maskedArea.height !== 0) {
      if (maskedAreasHistory.length > 0) {
        setCurrentStep(maskedAreasHistory.length + 1);
      } else {
        setCurrentStep((prevState) => prevState + 1);
      }

      setMaskedAreas((prevState) => [
        ...prevState,
        {
          ...maskedArea,
        },
      ]);

      const newStep = [...maskedAreas, maskedArea];
      const updatedStep = [...maskedAreasHistory];

      updatedStep.push(newStep);

      setMaskedAreasHistory(() => [...updatedStep]);
    }

    setIsDragging(false);

    setMaskedArea(INITIAL_BLURRY_AREA);
  };

  const drawDragArea = () => {
    const canvas = dragLayerRef.current;
    const context = canvas!.getContext("2d");

    context!.clearRect(0, 0, canvas!.width, canvas!.height);
    context!.fillStyle = "rgba(255,255,255,0.2)";

    context?.fillRect(
      maskedArea.x,
      maskedArea.y,
      maskedArea.width,
      maskedArea.height
    );
  };

  useEffect(drawDragArea, [maskedArea]);

  const drawOriginImageLayer = () => {
    const canvas = originImageLayerRef.current;

    if (!canvas || !originImageSource) return;

    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = originImageSource;

    image.onload = () => {
      context!.drawImage(image, 0, 0, canvas.width, canvas.height);

      maskedAreas.forEach((area, index) => {
        context!.fillStyle = "rgba(255,255,255,0.9)";
        context!.fillText(index.toString(), area.x, area.y);
        context!.fillRect(area.x, area.y, area.width, area.height);
      });

      context!.restore();
    };
  };

  useEffect(drawOriginImageLayer, [originImageSource, maskedAreas]);

  const onUndoHandler = () => {
    if (currentStep <= 0) return;

    if (currentStep === maskedAreasHistory.length) {
      setMaskedAreas(() => [...maskedAreasHistory[currentStep - 2]]);
      setCurrentStep((prevState) => prevState - 2);
      return;
    }

    setMaskedAreas(() => [...maskedAreasHistory[currentStep - 1]]);

    setCurrentStep((prevState) => prevState - 1);
  };

  const onRedoHandler = () => {
    if (currentStep >= maskedAreasHistory.length - 1) {
      return;
    }

    setMaskedAreas(() => [...maskedAreasHistory[currentStep + 1]]);

    setCurrentStep((prevState) => prevState + 1);
  };

  return (
    <div className="border rounded-md flex flex-col w-fit h-fit">
      <EditorPanel
        onUndoHandler={onUndoHandler}
        onRedoHandler={onRedoHandler}
      />
      <div className="flex-1 flex flex-col justify-center items-center">
        <div>
          <input
            id="fileInput"
            type="file"
            className="p-3 hidden"
            accept="image/png, image/jpeg, image/jpg"
            onChange={fileChangeHandler}
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            Select File
          </label>
        </div>
        <div
          className="flex justify-center items-center relative"
          style={{ width: "850px", height: "500px" }}
        >
          <canvas
            id="origin-image-layer"
            className="absolute left-0 top-0 z-10"
            ref={originImageLayerRef}
            width={850}
            height={500}
          />
          <canvas
            id="blurred-image-layer"
            className="absolute left-0 top-0"
            ref={blurredImageLayerRef}
            width={850}
            height={500}
          />
          <canvas
            id="drag-layer"
            className="absolute left-0 top-0 z-20"
            width={850}
            height={500}
            ref={dragLayerRef}
            onMouseDown={mouseDownHandler}
            onMouseMove={mouseMoveHandler}
            onMouseUp={mouseUpHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default NewEditor;
