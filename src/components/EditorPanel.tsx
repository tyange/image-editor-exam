import { IconArrowBackUp, IconFileDownload } from "@tabler/icons-react";

type EditorPanelProps = {
  onUndoHandler: () => void;
  onDownloadHandler: () => void;
};

const EditorPanel = ({
  onUndoHandler,
  onDownloadHandler,
}: EditorPanelProps) => {
  return (
    <div className="w-full flex justify-center gap-5 py-5">
      <button onClick={onUndoHandler}>
        <IconArrowBackUp />
      </button>
      <button onClick={onDownloadHandler}>
        <IconFileDownload />
      </button>
    </div>
  );
};

export default EditorPanel;
