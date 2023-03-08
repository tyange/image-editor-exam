import Layout from "./components/Layout";
import Editor from "./components/Editor";
import NewEditor from "./components/NewEditor";

const App = () => {
  return (
    <div className="App">
      <Layout>
        <NewEditor />
      </Layout>
    </div>
  );
};

export default App;
