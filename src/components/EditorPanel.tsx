import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconFileDownload,
} from "@tabler/icons-react";

type EditorPanelProps = {
  onUndoHandler: () => void;
  onRedoHandler: () => void;
  onDownloadHandler: () => void;
};

const EditorPanel = ({
  onUndoHandler,
  onRedoHandler,
  onDownloadHandler,
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
    </div>
  );
};

export default EditorPanel;
