import {
  IconArrowForwardUp,
  IconArrowBackUp,
  IconCirclePlus,
  IconCircleMinus,
  IconFileDownload,
} from "@tabler/icons-react";

type EditorPanelProps = {
  onUndoHandler: () => void;
};

const EditorPanel = ({ onUndoHandler }: EditorPanelProps) => {
  return (
    <div className="w-full flex justify-center gap-5 py-5">
      <button onClick={onUndoHandler}>
        <IconArrowBackUp />
      </button>
      <button>
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
