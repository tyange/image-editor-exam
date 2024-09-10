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
  const [maskedArea, setMaskedArea] = useState<MaskedArea>(INITIAL_MASKED_AREA);
  const [fileName, setFileName] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // Calculate the scale factor based on the zoom level
    const scaleFactor = 1 / state.zoomLevel;

    // Get the position of the mouse relative to the canvas
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Apply the scale factor to adjust for zoom
    // We don't need to subtract any offset because the canvas is not centered
    const adjustedX = canvasX * scaleFactor;
    const adjustedY = canvasY * scaleFactor;

    return {
      x: adjustedX,
      y: adjustedY,
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

  const drawDragArea = (ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) {
      return;
    }

    ctx.fillStyle = "rgba(255,0,0,0.2)";

    ctx.fillRect(
      maskedArea.x,
      maskedArea.y,
      maskedArea.width,
      maskedArea.height
    );

    drawMaskedAreas(ctx);
  };

  const drawImageWithMaskedAreas = () => {
    const canvas = canvasRef.current;

    if (!canvas || !state.originImageSource) {
      return;
    }

    const originImageLayerContext = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    const image = new Image();
    image.src = state.originImageSource;

    image.onload = () => {
      canvas.width = Math.round(image.width * state.zoomLevel);
      canvas.height = Math.round(image.height * state.zoomLevel);

      originImageLayerContext!.save();
      originImageLayerContext!.scale(state.zoomLevel, state.zoomLevel);
      originImageLayerContext!.drawImage(image, 0, 0);
      drawDragArea(originImageLayerContext);
    };

    originImageLayerContext!.restore();
  };
  useEffect(drawImageWithMaskedAreas, [
    state.originImageSource,
    state.zoomLevel,
    maskedArea,
    state.maskedAreas,
  ]);

  const drawMaskedAreas = (ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) {
      return;
    }

    state.maskedAreas.forEach((area) => {
      ctx!.fillStyle = "rgba(255,0,0,1)";
      ctx!.fillRect(area.x, area.y, area.width, area.height);
    });
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
    const originCanvas = canvasRef.current;

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
        className="overflow-auto"
        style={{ width: "700px", height: "500px" }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={mouseDownHandler}
          onMouseMove={mouseMoveHandler}
          onMouseUp={mouseUpHandler}
        />
      </div>
    </div>
  );
};
export default Editor;
