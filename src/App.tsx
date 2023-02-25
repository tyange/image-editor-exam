import Editor from "./components/Editor";
import Layout from "./components/Layout";

const App = () => {
  return (
    <div className="App">
      <Layout>
        <Editor />
      </Layout>
    </div>
  );
};

export default App;
