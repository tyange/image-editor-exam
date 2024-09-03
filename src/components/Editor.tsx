import {
  ChangeEventHandler,
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
  ratio: number;
};

const INITIAL_MASKED_AREA = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  ratio: 1,
};

type EditorState = {
  originImageSource: string | undefined;
  maskedAreas: MaskedArea[];
  beforeMaskedAreasHistory: MaskedArea[][];
  currentStep: number;
  zoomLevel: number;
};

type EditorAction =
  | { type: "undo" | "redo" | "historyUpdate" }
  | { type: "setOriginImageSource"; payload: string }
  | {
      type: "masked";
      payload: MaskedArea;
    }
  | { type: "setZoomLevel"; payload: number };

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
    case "setZoomLevel":
      return {
        ...state,
        zoomLevel: action.payload,
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

  const originImageLayerRef = useRef<HTMLCanvasElement | null>(null);
  const blurredImageLayerRef = useRef<HTMLCanvasElement | null>(null);
  const dragLayerRef = useRef<HTMLCanvasElement | null>(null);

  const fileChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      setFileName(e.target.files[0].name);
      dispatch({
        type: "setOriginImageSource",
        payload: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const mouseDownHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    setIsDragging(true);

    setMaskedArea({
      ...INITIAL_MASKED_AREA,
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
    e.preventDefault();

    if (maskedArea.width !== 0 && maskedArea.height !== 0) {
      dispatch({
        type: "masked",
        payload: { ...maskedArea },
      });
    }

    setIsDragging(false);

    setMaskedArea(() => INITIAL_MASKED_AREA);
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

    if (!canvas || !state.originImageSource) {
      return;
    }

    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = state.originImageSource;

    image.onload = () => {
      const verticalRatio = canvas.width / image.width;

      const centerShiftX = (canvas.width - image.width * verticalRatio) / 2;
      const centerShiftY = (canvas.height - image.height * verticalRatio) / 2;

      context!.clearRect(0, 0, canvas.width, canvas.height);

      context!.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        centerShiftX,
        centerShiftY,
        image.width * verticalRatio,
        image.height * verticalRatio
      );
    };

    console.log(state.zoomLevel);

    context!.scale(state.zoomLevel, state.zoomLevel);
  };

  useEffect(drawOriginImageLayer, [state.originImageSource, state.zoomLevel]);

  const drawMaskedAreas = () => {
    const canvas = blurredImageLayerRef.current;

    if (!canvas || state.maskedAreas.length === 0 || !state.originImageSource) {
      return;
    }

    const context = canvas.getContext("2d");

    context!.clearRect(0, 0, canvas.width, canvas.height);

    state.maskedAreas.forEach((area) => {
      context!.fillStyle = "rgba(255,255,255,1)";
      context!.fillRect(area.x, area.y, area.width, area.height);
    });
  };

  useEffect(drawMaskedAreas, [state.maskedAreas]);

  const onUndoHandler = () => {
    if (state.currentStep <= 0) return;

    dispatch({ type: "undo" });
  };

  const onRedoHandler = () => {
    if (state.beforeMaskedAreasHistory.length === 0) return;

    dispatch({ type: "redo" });
  };

  const onZoomInHandler = () => {
    dispatch({ type: "setZoomLevel", payload: (state.zoomLevel + 1) * 1.1 });
  };

  const onZoomOutHandler = () => {
    if (state.zoomLevel === 1) {
      return;
    }

    dispatch({ type: "setZoomLevel", payload: (state.zoomLevel - 1) / 1.1 });
  };

  const onDownloadHandler = () => {
    const canvas = originImageLayerRef.current;

    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${fileName}_edited.png`;

    link.click();
  };

  return (
    <div className="border rounded-md flex flex-col w-fit h-fit">
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
            className="absolute left-0 top-0 z-20"
            ref={blurredImageLayerRef}
            width={850}
            height={500}
          />
          <canvas
            id="drag-layer"
            className="absolute left-0 top-0 z-30"
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
export default Editor;
