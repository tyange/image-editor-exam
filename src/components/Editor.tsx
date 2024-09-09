import {
  ChangeEventHandler,
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import EditorPanel from "./EditorPanel";

type MaskedArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  zoomLevel: number;
};

const INITIAL_MASKED_AREA = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  zoomLevel: 1,
};

type EditorState = {
  originImageSource: string | undefined;
  maskedAreas: MaskedArea[];
  beforeMaskedAreasHistory: MaskedArea[][];
  currentStep: number;
  zoomLevel: number;
};

type EditorAction =
  | { type: "undo" | "redo" | "historyUpdate" | "zoomIn" | "zoomOut" }
  | { type: "setOriginImageSource"; payload: string }
  | {
      type: "masked";
      payload: MaskedArea;
    };

const initialState: EditorState = {
  originImageSource: undefined,
  maskedAreas: [],
  beforeMaskedAreasHistory: [],
  currentStep: 0,
  zoomLevel: 1,
};
const reducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case "setOriginImageSource":
      return {
        ...initialState,
        originImageSource: action.payload,
      };
    case "masked":
      return {
        ...state,
        maskedAreas: [...state.maskedAreas, action.payload],
        currentStep: state.currentStep + 1,
        beforeMaskedAreasHistory: [],
      };
    case "undo":
      const newMaskedAreas = [...state.maskedAreas];
      newMaskedAreas.pop();

      return {
        ...state,
        maskedAreas: [...newMaskedAreas],
        currentStep: state.currentStep - 1,
        beforeMaskedAreasHistory: [
          ...state.beforeMaskedAreasHistory,
          [...state.maskedAreas],
        ],
      };
    case "redo":
      const newBeforeMaskedAreasHistory = [...state.beforeMaskedAreasHistory];
      newBeforeMaskedAreasHistory.pop();

      return {
        ...state,
        currentStep: state.currentStep + 1,
        maskedAreas: [
          ...state.beforeMaskedAreasHistory[
            state.beforeMaskedAreasHistory.length - 1
          ],
        ],
        beforeMaskedAreasHistory: [...newBeforeMaskedAreasHistory],
      };
    case "zoomIn":
      const zoomInLevel = state.zoomLevel + 0.1;

      return {
        ...state,
        zoomLevel: zoomInLevel > 0.1 ? zoomInLevel : 0.1,
      };
    case "zoomOut":
      const zoomOutLevel = state.zoomLevel - 0.1;

      return {
        ...state,
        zoomLevel: zoomOutLevel > 0.1 ? zoomOutLevel : 0.1,
      };
    default:
      return state;
  }
};

const Editor = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [isDragging, setIsDragging] = useState(false);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [maskedArea, setMaskedArea] = useState<MaskedArea>(INITIAL_MASKED_AREA);
  const [fileName, setFileName] = useState("");

  const originImageLayerRef = useRef<HTMLCanvasElement | null>(null);

  const fileChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      setFileName(e.target.files[0].name);
      dispatch({
        type: "setOriginImageSource",
        payload: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const getCanvasCoordinates = (event: MouseEvent) => {
    const canvas = originImageLayerRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const zoomedX = (canvasX - centerX) / state.zoomLevel + centerX;
    const zoomedY = (canvasY - centerY) / state.zoomLevel + centerY;
    return {
      x: zoomedX,
      y: zoomedY,
    };
  };

  const mouseDownHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    setIsDragging(true);

    const { x, y } = getCanvasCoordinates(e);

    setMaskedArea({
      ...INITIAL_MASKED_AREA,
      x: x,
      y: y,
    });
  };

  const mouseMoveHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!isDragging) return;

    const { x, y } = getCanvasCoordinates(e);
    const width = x - maskedArea.x;
    const height = y - maskedArea.y;

    setMaskedArea((prevState) => ({
      ...prevState,
      width,
      height,
    }));
  };

  const mouseUpHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();

    if (maskedArea.width !== 0 && maskedArea.height !== 0) {
      dispatch({
        type: "masked",
        payload: { ...maskedArea, zoomLevel: state.zoomLevel },
      });
    }

    setIsDragging(false);

    setMaskedArea(() => INITIAL_MASKED_AREA);
  };

  const drawDragArea = () => {
    const canvas = originImageLayerRef.current;
    const context = canvas!.getContext("2d");

    context!.clearRect(0, 0, canvas!.width, canvas!.height);
    context!.save();

    if (!canvas || maskedArea.width === 0 || maskedArea.height === 0) {
      return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    context!.clearRect(0, 0, canvas.width, canvas.height);
    context!.save();
    context!.translate(centerX, centerY);
    context!.scale(state.zoomLevel, state.zoomLevel);
    context!.translate(-centerX, -centerY);

    context!.fillStyle = "rgba(255,0,0,0.2)";

    context?.fillRect(
      maskedArea.x,
      maskedArea.y,
      maskedArea.width,
      maskedArea.height
    );

    context!.restore();
  };
  useEffect(drawDragArea, [maskedArea]);

  const drawOriginImageLayer = () => {
    const originImageLayerCanvas = originImageLayerRef.current;

    if (!originImageLayerCanvas || !state.originImageSource) {
      return;
    }

    const originImageLayerContext = originImageLayerCanvas.getContext("2d");
    const image = new Image();
    image.src = state.originImageSource;

    image.onload = () => {
      originImageLayerCanvas.width = image.width * state.zoomLevel;
      originImageLayerCanvas.height = image.height * state.zoomLevel;

      const centerX = originImageLayerCanvas.width / 2;
      const centerY = originImageLayerCanvas.height / 2;

      originImageLayerContext!.clearRect(
        0,
        0,
        originImageLayerCanvas.width,
        originImageLayerCanvas.height
      );

      originImageLayerContext!.save();
      originImageLayerContext!.translate(centerX, centerY);
      originImageLayerContext!.scale(state.zoomLevel, state.zoomLevel);
      originImageLayerContext!.translate(-image.width / 2, -image.height / 2);
      originImageLayerContext!.drawImage(
        image,
        0,
        0,
        image.width,
        image.height
      );
      originImageLayerContext!.restore();
      drawMaskedAreas();
    };
  };
  useEffect(drawOriginImageLayer, [state.originImageSource, state.zoomLevel]);

  const drawMaskedAreas = () => {
    const canvas = originImageLayerRef.current;

    if (!canvas || state.maskedAreas.length === 0 || !state.originImageSource) {
      return;
    }

    const context = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    context!.clearRect(0, 0, canvas.width, canvas.height);
    context!.save();
    // context!.translate(centerX, centerY);
    context!.scale(state.zoomLevel, state.zoomLevel);
    // context!.translate(-centerX, -centerY);

    state.maskedAreas.forEach((area) => {
      context!.fillStyle = "rgba(255,0,0,1)";
      context!.fillRect(area.x, area.y, area.width, area.height);
    });

    context!.restore();
  };

  const drawMaskedAreas1 = () => {
    const canvas = originImageLayerRef.current;

    if (!canvas || state.maskedAreas.length === 0 || !state.originImageSource) {
      return;
    }

    const context = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    context!.clearRect(0, 0, canvas.width, canvas.height);
    context!.save();
    // context!.translate(centerX, centerY);
    // context!.scale(state.zoomLevel, state.zoomLevel);
    // context!.translate(-centerX, -centerY);

    state.maskedAreas.forEach((area) => {
      context!.fillStyle = "rgba(255,0,0,1)";
      context!.fillRect(area.x, area.y, area.width, area.height);
    });

    context!.restore();
  };
  useEffect(drawMaskedAreas1, [state.maskedAreas]);

  const mergeCanvases = (canvases: HTMLCanvasElement[]) => {
    const mergedCanvas = document.createElement("canvas");
    const mergedContext = mergedCanvas.getContext("2d");

    if (!mergedContext) {
      return;
    }

    mergedCanvas.width = canvases[0].width;
    mergedCanvas.height = canvases[0].height;

    canvases.forEach((canvas) => {
      mergedContext.drawImage(canvas, 0, 0);
    });

    return mergedCanvas;
  };

  const onUndoHandler = () => {
    if (state.currentStep <= 0) return;

    dispatch({ type: "undo" });
  };

  const onRedoHandler = () => {
    if (state.beforeMaskedAreasHistory.length === 0) return;

    dispatch({ type: "redo" });
  };

  const onZoomInHandler = () => {
    dispatch({ type: "zoomIn" });
  };

  const onZoomOutHandler = () => {
    dispatch({ type: "zoomOut" });
  };

  const onDownloadHandler = () => {
    const originCanvas = originImageLayerRef.current;

    if (!originCanvas) {
      return;
    }

    const dataURL = originCanvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${fileName}_edited.png`;

    link.click();
  };

  return (
    <div className="border rounded-md flex flex-col w-fit h-fit bg-slate-600">
      <EditorPanel
        onUndoHandler={onUndoHandler}
        onRedoHandler={onRedoHandler}
        onDownloadHandler={onDownloadHandler}
        onZoomInHandler={onZoomInHandler}
        onZoomOutHandler={onZoomOutHandler}
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
          className="flex justify-center items-center relative overflow-auto"
          style={{ width: "700px", height: "500px" }}
        >
          <canvas
            id="origin-image-layer"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            ref={originImageLayerRef}
            onMouseDown={mouseDownHandler}
            onMouseMove={mouseMoveHandler}
            onMouseUp={mouseUpHandler}
          />
        </div>
      </div>
    </div>
  );
};
export default Editor;
