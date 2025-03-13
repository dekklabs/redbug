#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use std::fs;
use std::process::{Command, Stdio};
use std::env;
use std::path::PathBuf;
use dirs; // Importar `dirs` para obtener la carpeta de Documentos

/// Obtener la ruta donde se almacenará el código del playground en `~/Documents/redbug/playground_code.txt`
fn get_storage_path() -> PathBuf {
    let home_dir = dirs::document_dir().unwrap(); // Obtener ~/Documents
    let path = home_dir.join("redbug/playground_code.txt");

    println!("Ruta de almacenamiento: {:?}", path); // <-- DEBUG
    path
}

/// Guardar el código en un archivo local
#[command]
fn save_code(code: String) -> String {
    let path = get_storage_path();

    // Asegurar que el directorio existe
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            if let Err(e) = std::fs::create_dir_all(parent) {
                println!("❌ Error creando la carpeta: {}", e);
                return format!("Error creando la carpeta: {}", e);
            }
        }
    }

    println!("Guardando código en: {:?}", path); // <-- DEBUG
    println!("Código a guardar: {}", code); // <-- DEBUG

    match fs::write(&path, code) {
        Ok(_) => {
            println!("✅ Código guardado exitosamente.");
            "Código guardado correctamente".to_string()
        }
        Err(e) => {
            println!("❌ Error guardando código: {}", e);
            format!("Error guardando código: {}", e)
        }
    }
}

/// Cargar el código guardado del archivo local
#[command]
fn load_code() -> String {
    let path = get_storage_path();
    println!("Cargando código desde: {:?}", path); // <-- DEBUG

    match fs::read_to_string(&path) {
        Ok(code) => {
            println!("📄 Código cargado: {}", code); // <-- DEBUG
            code
        }
        Err(e) => {
            println!("⚠️ No se pudo leer el archivo: {}", e);
            "".to_string()
        }
    }
}

/// Ejecutar código JavaScript en Node.js
#[command]
fn run_js_code(code: String) -> String {
    let exe_path = env::current_exe().unwrap();
    let node_path: PathBuf = exe_path
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("Resources/node/bin/node");

    let output = Command::new(node_path)
        .arg("-e")
        .arg(&code)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output();

    match output {
        Ok(out) => {
            if !out.stderr.is_empty() {
                format!("Error: {}", String::from_utf8_lossy(&out.stderr))
            } else {
                String::from_utf8_lossy(&out.stdout).to_string()
            }
        }
        Err(e) => format!("Error ejecutando código: {}", e),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![run_js_code, save_code, load_code])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}

