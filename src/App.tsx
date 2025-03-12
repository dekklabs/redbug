import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/core"

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      runCode();
    }, 500);

    return () => clearTimeout(timeout);
  }, [code]);

  const runCode = async () => {
    try {
      const result = await invoke<string>("run_js_code", { code });
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "50%" }}>
        <Editor
          theme="vs-dark"
          height="100%"
          language="javascript"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>
      <div style={{ width: "50%", padding: "10px", background: "#222", color: "#fff" }}>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;
