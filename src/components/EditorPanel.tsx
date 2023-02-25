import {
  IconArrowForwardUp,
  IconArrowBackUp,
  IconCirclePlus,
  IconCircleMinus,
  IconFileDownload,
} from "@tabler/icons-react";

const EditorPanel = () => {
  return (
    <div className="w-full flex justify-center gap-5 py-5">
      <button>
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
