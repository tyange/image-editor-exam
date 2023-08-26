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
};

const INITIAL_MASKED_AREA = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

type EditorState = {
  originImageSource: string | undefined;
  maskedAreas: MaskedArea[];
  maskedAreasHistory: MaskedArea[][];
  currentStep: number;
  isOverwrite: boolean;
};

type EditorAction =
  | { type: "undo" | "redo" | "historyUpdate" }
  | { type: "setOriginImageSource"; payload: string }
  | {
      type: "masked";
      payload: MaskedArea;
    };

const initialState: EditorState = {
  originImageSource: undefined,
  maskedAreas: [],
  maskedAreasHistory: [[]],
  currentStep: 0,
  isOverwrite: false,
};
const reducer = (state: EditorState, action: EditorAction) => {
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
        currentStep: state.isOverwrite
          ? state.maskedAreasHistory.length
          : state.currentStep + 1,
      };
    case "historyUpdate":
      return {
        ...state,
        maskedAreasHistory: [
          ...state.maskedAreasHistory,
          [...state.maskedAreas],
        ],
      };
    case "undo":
      return {
        ...state,
        maskedAreas: state.maskedAreasHistory[state.currentStep - 1],
        maskedAreasHistory: [
          ...state.maskedAreasHistory,
          state.maskedAreasHistory[state.currentStep - 1],
        ],
        currentStep: state.currentStep - 1,
        isOverwrite: true,
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

    const canvas = blurredImageLayerRef.current;

    if (!canvas) return;

    if (maskedArea.width !== 0 && maskedArea.height !== 0) {
      dispatch({ type: "masked", payload: maskedArea });
      dispatch({ type: "historyUpdate" });
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

    if (!canvas || !state.originImageSource) return;

    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = state.originImageSource;

    image.onload = () => {
      const hRatio = canvas.width / image.width;
      const vRatio = canvas.height / image.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShiftX = (canvas.width - image.width * ratio) / 2;
      const centerShiftY = (canvas.height - image.height * ratio) / 2;

      context!.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        centerShiftX,
        centerShiftY,
        image.width * ratio,
        image.height * ratio
      );

      state.maskedAreas.forEach((area, index) => {
        context!.fillStyle = "rgba(255,255,255,1)";
        context!.fillRect(area.x, area.y, area.width, area.height);
      });

      context!.restore();
    };
  };

  useEffect(drawOriginImageLayer, [state.originImageSource, state.maskedAreas]);

  const onUndoHandler = () => {
    if (state.currentStep <= 0) return;

    dispatch({ type: "undo" });
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
        onDownloadHandler={onDownloadHandler}
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
export default Editor;
