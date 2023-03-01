import {
  ChangeEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import EditorPanel from "./EditorPanel";

type BlurryArea = {
  x: 0;
  y: 0;
  width: 0;
  height: 0;
};

const NewEditor = () => {
  const blurLayerRef = useRef<HTMLCanvasElement | null>(null);
  const originImageLayerRef = useRef<HTMLCanvasElement | null>(null);
  const dragLayerRef = useRef<HTMLCanvasElement | null>(null);

  const [originImageSource, setOriginImageSource] = useState<
    string | undefined
  >();

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
    console.log(e.nativeEvent.offsetX);
    console.log(e.nativeEvent.offsetY);
  };

  return (
    <div className="w-2/3 border h-4/5 rounded-md flex flex-col">
      <EditorPanel />
      <div className="flex-1 flex flex-col justify-center items-center">
        <div
          className={`w-full h-full flex flex-col gap-3 justify-center items-center`}
        >
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
          <div className="relative w-full h-full flex justify-center items-center">
            <canvas
              className="absolute left-0 top-0 w-full h-full"
              ref={blurLayerRef}
            />
            <canvas
              className="absolute left-0 top-0 w-full h-full"
              ref={originImageLayerRef}
            />
            <canvas
              className="absolute left-0 top-0 w-full h-full"
              ref={dragLayerRef}
              onMouseDown={mouseDownHandler}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEditor;
