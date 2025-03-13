import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  // Cargar código guardado al iniciar la aplicación
  useEffect(() => {
    async function loadSavedCode() {
      try {
        console.log("📥 Intentando cargar código...");
        const savedCode = await invoke<string>("load_code");
        console.log("📄 Código cargado desde el archivo:", savedCode);
        setCode(savedCode); // Asigna el código guardado al editor
      } catch (error) {
        console.error("❌ Error cargando código:", error);
      }
    }

    loadSavedCode();
  }, []);

  // Guardar código cada vez que el usuario escribe
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveCode(code);
      runCode();
    }, 500);

    return () => clearTimeout(timeout);
  }, [code]);

  // Ejecutar código con Tauri
  const runCode = async () => {
    try {
      const result = await invoke<string>("run_js_code", { code });
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  // Guardar código en el archivo local
  const saveCode = async (code: string) => {
    try {
      console.log("💾 Guardando código:", code);
      await invoke("save_code", { code });
      console.log("✅ Código guardado correctamente.");
    } catch (error) {
      console.error("❌ Error guardando código:", error);
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

