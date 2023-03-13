import {
  IconArrowForwardUp,
  IconArrowBackUp,
  IconCirclePlus,
  IconCircleMinus,
  IconFileDownload,
} from "@tabler/icons-react";

type EditorPanelProps = {
  onUndoHandler: () => void;
  onRedoHandler: () => void;
};

const EditorPanel = ({ onUndoHandler, onRedoHandler }: EditorPanelProps) => {
  return (
    <div className="w-full flex justify-center gap-5 py-5">
      <button onClick={onUndoHandler}>
        <IconArrowBackUp />
      </button>
      <button onClick={onRedoHandler}>
        <IconArrowForwardUp />
      </button>
      <button>
        <IconCirclePlus />
      </button>
      <button>
        <IconCircleMinus />
      </button>
      <button>
        <IconFileDownload />
      </button>
    </div>
  );
};

export default EditorPanel;
