import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { invoke } from "@tauri-apps/api/core";
import { initVimMode } from "monaco-vim";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [editorMode, setEditorMode] = useState<"normal" | "vim">("normal");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef<any>(null);
  const vimStatusRef = useRef<HTMLDivElement | null>(null);

  // Load saved code from file
  useEffect(() => {
    async function loadSavedCode() {
      try {
        console.log("📥 Intentando cargar código...");
        const savedCode = await invoke<string>("load_code");
        console.log("📄 Código cargado desde el archivo:", savedCode);
        setCode(savedCode);
      } catch (error) {
        console.error("❌ Error cargando código:", error);
      }
    }

    loadSavedCode();
  }, []);

  // Save code to file
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveCode(code);
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

  const saveCode = async (code: string) => {
    try {
      console.log("💾 Guardando código:", code);
      await invoke("save_code", { code });
      console.log("✅ Código guardado correctamente.");
    } catch (error) {
      console.error("❌ Error guardando código:", error);
    }
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    if (editorMode === "vim") {
      activateVimMode();
    }
  };

  const toggleEditorMode = (mode: "normal" | "vim") => {
    setEditorMode(mode);
    if (editorRef.current) {
      if (mode === "vim") {
        activateVimMode();
      } else {
        deactivateVimMode();
      }
    }
  };

  // Active Vim Mode
  const activateVimMode = () => {
    if (editorRef.current) {
      console.log("🟢 Activando modo Vim...");
      vimModeRef.current = initVimMode(editorRef.current, vimStatusRef.current);
    }
  };

  // Desactive Vim Mode
  const deactivateVimMode = () => {
    if (vimModeRef.current) {
      console.log("🔴 Desactivando modo Vim...");
      vimModeRef.current.dispose();
      vimModeRef.current = null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      <div style={{ padding: "10px", background: "#222", color: "#fff", display: "flex", justifyContent: "space-between" }}>
        <span>Redbug Playground</span>
        <select
          value={editorMode}
          onChange={(e) => toggleEditorMode(e.target.value as "normal" | "vim")}
          style={{ background: "#444", color: "#fff", border: "none", padding: "5px", cursor: "pointer" }}
        >
          <option value="normal">Modo Normal</option>
          <option value="vim">Modo Vim</option>
        </select>
      </div>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: "50%" }}>
          <Editor
            theme="vs-dark"
            height="100%"
            language="javascript"
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
          />
        </div>
        <div style={{ width: "50%", padding: "10px", background: "#222", color: "#fff" }}>
          <pre>{output}</pre>
        </div>
      </div>
      {editorMode === "vim" && <div ref={vimStatusRef} style={{ background: "#111", color: "#0f0", padding: "5px" }} />}
    </div>
  );
}

export default App;

