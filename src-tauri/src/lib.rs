use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    if let Ok(hwnd) = window.hwnd() {
                        use windows_sys::Win32::UI::WindowsAndMessaging::{
                            GetWindowLongW, SetWindowLongW, GWL_EXSTYLE, WS_EX_NOACTIVATE,
                        };
                        let hwnd_ptr = hwnd.0 as windows_sys::Win32::Foundation::HWND;
                        unsafe {
                            let ex_style = GetWindowLongW(hwnd_ptr, GWL_EXSTYLE);
                            SetWindowLongW(hwnd_ptr, GWL_EXSTYLE, ex_style | (WS_EX_NOACTIVATE as i32));
                        }
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
