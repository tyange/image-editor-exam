import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconFileDownload,
} from "@tabler/icons-react";

type EditorPanelProps = {
  onUndoHandler: () => void;
  onRedoHandler: () => void;
  onDownloadHandler: () => void;
  onZoomInHandler: () => void;
  onZoomOutHandler: () => void;
};

const EditorPanel = ({
  onUndoHandler,
  onRedoHandler,
  onDownloadHandler,
  onZoomInHandler,
  onZoomOutHandler,
}: EditorPanelProps) => {
  return (
    <div className="w-full flex justify-center gap-5 py-5">
      <button onClick={onUndoHandler}>
        <IconArrowBackUp />
      </button>
      <button onClick={onRedoHandler}>
        <IconArrowForwardUp />
      </button>
      <button onClick={onDownloadHandler}>
        <IconFileDownload />
      </button>
      <button onClick={onZoomInHandler}>
        <span>+</span>
      </button>
      <button onClick={onZoomOutHandler}>
        <span>-</span>
      </button>
    </div>
  );
};

export default EditorPanel;
