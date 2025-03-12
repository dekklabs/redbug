#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use std::process::{Command, Stdio};

#[command]
fn run_js_code(code: String) -> String {
    let output = Command::new("node")
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
        .invoke_handler(tauri::generate_handler![run_js_code])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
