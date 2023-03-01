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

  const [originImageSource, setOriginImageSource] = useState<
    string | undefined
  >();

  const [isDragging, setIsDragging] = useState(false);
  const [blurryArea, setBlurryArea] = useState<BlurryArea>(INITIAL_BLURRY_AREA);

  // file change handler: input(type: file) 태그에서 특정 이미지를 선택했을 경우,
  // 해당 이미지를 file의 source를 상태로 저장.
  const fileChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      setOriginImageSource(URL.createObjectURL(e.target.files[0]));
    }
  };

  // 'originImageSource' 상태가 변할 때마다 아래 useEffect 함수를 호출하여
  // 'originImageSource' 이미지를 originImageLayer(canvas) 위에 그려냄.
  useEffect(() => {
    if (originImageSource) {
      const originImage = new Image();
      originImage.src = originImageSource;

      // 이미 DOM에 상단에서 선언한 ref들이 마운트 된 상태이므로,
      // 각 ref의 current 값은 무조건 존재함.
      const originImageLayerCurrent = originImageLayerRef.current;
      const originImageLayerCtx = originImageLayerCurrent!.getContext("2d");

      originImage.onload = () => {
        originImageLayerCtx!.drawImage(
          originImage,
          0,
          0,
          originImageLayerCurrent!.width,
          originImageLayerCurrent!.height
        );
      };
    }
  }, [originImageSource]);

  const mouseDownHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);

    setBlurryArea({
      ...INITIAL_BLURRY_AREA,
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  };

  const mouseMoveHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging) return;

    setBlurryArea((prevState) => ({
      ...prevState,
      width: e.nativeEvent.offsetX - prevState.x,
      height: e.nativeEvent.offsetY - prevState.y,
    }));
  };

  const mouseUpHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    setBlurryArea(INITIAL_BLURRY_AREA);
  };

  const drawDragArea = () => {
    const canvas = originImageLayerRef.current;
    const context = canvas?.getContext("2d");

    context!.clearRect(0, 0, canvas!.width, canvas!.height);

    context!.fillStyle = "rgba(255,255,255.0.2)";

    const image = new Image();
    image.src = originImageSource!;

    image.onload = () => {
      context!.drawImage(image, 0, 0, canvas!.width, canvas!.height);

      context?.fillRect(
        blurryArea.x,
        blurryArea.y,
        blurryArea.width,
        blurryArea.height
      );
    };
  };

  useEffect(drawDragArea, [blurryArea]);

  return (
    <div className="border rounded-md flex flex-col  w-fit h-fit ">
      <EditorPanel />
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
          <canvas className="absolute left-0 top-0" width={850} height={500} />
          <canvas className="absolute left-0 top-0" width={850} height={500} />
          <canvas
            className="absolute left-0 top-0"
            width={850}
            height={500}
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

export default NewEditor;
