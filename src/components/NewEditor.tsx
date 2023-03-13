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
  blurryImage?: ImageData;
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
  const [blurryArea, setBlurryArea] = useState<BlurryArea>(INITIAL_BLURRY_AREA);
  const [blurryAreas, setBlurryAreas] = useState<BlurryArea[]>([]);
  const [showingBlurryAreas, setShowingBlurryAreas] = useState<BlurryArea[]>(
    []
  );

  const [blurryAreasHistory, setBlurryAreasHistory] = useState<BlurryArea[][]>(
    []
  );
  const [currentStep, setCurrentStep] = useState(0);

  const fileChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      setOriginImageSource(URL.createObjectURL(e.target.files[0]));
    }
  };

  const mouseDownHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    setIsDragging(true);

    setBlurryArea({
      ...INITIAL_BLURRY_AREA,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  };

  const mouseMoveHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!isDragging) return;

    setBlurryArea((prevState) => ({
      ...prevState,
      width: e.nativeEvent.offsetX - prevState.x,
      height: e.nativeEvent.offsetY - prevState.y,
    }));
  };

  const mouseUpHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    const canvas = blurredImageLayerRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (blurryArea.width !== 0 && blurryArea.height !== 0) {
      setCurrentStep((prevState) => prevState + 1);

      setBlurryAreas((prevState) => [
        ...prevState,
        {
          ...blurryArea,
          blurryImage: context?.getImageData(
            blurryArea.x,
            blurryArea.y,
            blurryArea.width,
            blurryArea.height
          ),
        },
      ]);
    }

    setIsDragging(false);

    setBlurryArea(INITIAL_BLURRY_AREA);
  };

  const drawDragArea = () => {
    const canvas = dragLayerRef.current;
    const context = canvas!.getContext("2d");

    context!.clearRect(0, 0, canvas!.width, canvas!.height);
    context!.fillStyle = "rgba(255,255,255,0.2)";

    context?.fillRect(
      blurryArea.x,
      blurryArea.y,
      blurryArea.width,
      blurryArea.height
    );
  };

  useEffect(drawDragArea, [blurryArea]);

  const drawBlurredImageLayer = () => {
    const canvas = blurredImageLayerRef.current;

    if (!canvas || !originImageSource) return;

    const context = canvas.getContext("2d");

    const image = new Image();
    image.src = originImageSource;

    image.onload = () => {
      context!.filter = "blur(3px)";
      context!.drawImage(image, 0, 0, canvas!.width, canvas!.height);
      context!.restore();
    };
  };

  useEffect(drawBlurredImageLayer, [originImageSource]);

  const drawOriginImageLayer = () => {
    const canvas = originImageLayerRef.current;

    if (!canvas || !originImageSource) return;

    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = originImageSource;

    image.onload = () => {
      context!.drawImage(image, 0, 0, canvas.width, canvas.height);

      showingBlurryAreas
        .filter(({ blurryImage }) => blurryImage !== undefined)
        .forEach(({ blurryImage, ...area }) => {
          const left = area.width > 0 ? area.x : area.x + area.width;
          const top = area.height > 0 ? area.y : area.y + area.height;
          context!.putImageData(blurryImage as ImageData, left, top);
        });

      context!.restore();
    };
  };

  useEffect(drawOriginImageLayer, [originImageSource, showingBlurryAreas]);

  useEffect(() => {
    const newStep = [...blurryAreas];
    const updatedStep = [...blurryAreasHistory];

    updatedStep.push(newStep);

    setBlurryAreasHistory(() => [...updatedStep]);
    setShowingBlurryAreas(() => [...blurryAreas]);
  }, [blurryAreas]);

  const onUndoHandler = () => {
    setShowingBlurryAreas(() => [...blurryAreasHistory[currentStep - 1]]);

    setBlurryAreas(() => [...blurryAreasHistory[currentStep - 1]]);

    setCurrentStep((prevState) => prevState - 1);
  };

  return (
    <div className="border rounded-md flex flex-col w-fit h-fit">
      <EditorPanel onUndoHandler={onUndoHandler} />
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
