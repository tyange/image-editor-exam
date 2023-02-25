import EditorPanel from "./EditorPanel";

const Editor = () => {
  return (
    <div className="w-2/3 border h-4/5 rounded-md flex flex-col">
      <EditorPanel />
      <div className="flex-1 flex justify-center items-center">
        <canvas className="w-5/6 h-5/6 shadow-md" />
      </div>
    </div>
  );
};

export default Editor;
