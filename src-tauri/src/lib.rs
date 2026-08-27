use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn minimize_window(window: tauri::WebviewWindow) {
    let _ = window.minimize();
}

#[tauri::command]
fn toggle_maximize_window(window: tauri::WebviewWindow) {
    if let Ok(is_max) = window.is_maximized() {
        if is_max {
            let _ = window.unmaximize();
        } else {
            let _ = window.maximize();
        }
    }
}

#[tauri::command]
fn close_window(window: tauri::WebviewWindow) {
    let _ = window.close();
}

#[tauri::command]
fn send_key_input(key: &str, pressed: bool) {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
            MapVirtualKeyW, MAPVK_VK_TO_VSC, KEYEVENTF_EXTENDEDKEY, KEYEVENTF_KEYUP,
            KEYEVENTF_SCANCODE, SendInput, INPUT, INPUT_KEYBOARD, KEYBDINPUT,
        };

        let key_str = key.to_uppercase();
        let vk_code: u16 = match key_str.as_str() {
            "SPACE" => 0x20,
            "ENTER" => 0x0D,
            "SHIFT" => 0x10,
            "CTRL" | "CONTROL" => 0x11,
            "ALT" => 0x12,
            "ESCAPE" | "ESC" => 0x1B,
            "TAB" => 0x09,
            "UP" => 0x26,
            "DOWN" => 0x28,
            "LEFT" => 0x25,
            "RIGHT" => 0x27,
            "BACKSPACE" => 0x08,
            "DELETE" => 0x2E,
            "CAPSLOCK" | "CAPS" => 0x14,
            "F1" => 0x70,
            "F2" => 0x71,
            "F3" => 0x72,
            "F4" => 0x73,
            "F5" => 0x74,
            "F6" => 0x75,
            "F7" => 0x76,
            "F8" => 0x77,
            "F9" => 0x78,
            "F10" => 0x79,
            "F11" => 0x7A,
            "F12" => 0x7B,
            s if s.len() == 1 => {
                let c = s.chars().next().unwrap();
                if c >= 'A' && c <= 'Z' {
                    c as u16
                } else if c >= '0' && c <= '9' {
                    c as u16
                } else {
                    return;
                }
            }
            _ => return,
        };

        let scan_code = unsafe { MapVirtualKeyW(vk_code as u32, MAPVK_VK_TO_VSC) } as u16;
        let is_extended = matches!(vk_code, 0x25 | 0x26 | 0x27 | 0x28 | 0x2E);

        let mut flags = KEYEVENTF_SCANCODE;
        if is_extended {
            flags |= KEYEVENTF_EXTENDEDKEY;
        }
        if !pressed {
            flags |= KEYEVENTF_KEYUP;
        }

        let mut input = INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: windows_sys::Win32::UI::Input::KeyboardAndMouse::INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: vk_code,
                    wScan: scan_code,
                    dwFlags: flags,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        };

        unsafe {
            SendInput(1, &mut input, std::mem::size_of::<INPUT>() as i32);
        }
    }
}

#[cfg(target_os = "windows")]
use windows_sys::Win32::UI::Shell::{DefSubclassProc, SetWindowSubclass};
#[cfg(target_os = "windows")]
use windows_sys::Win32::UI::WindowsAndMessaging::{
    EnumChildWindows, GetForegroundWindow, GetWindowLongW, SetForegroundWindow, SetWindowLongW,
    SetWindowPos, GWL_EXSTYLE, HWND_TOPMOST, MA_NOACTIVATE, SWP_FRAMECHANGED, SWP_NOACTIVATE,
    SWP_NOMOVE, SWP_NOSIZE, SWP_SHOWWINDOW, WM_MOUSEACTIVATE, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW,
    WS_EX_TOPMOST,
};

#[cfg(target_os = "windows")]
unsafe extern "system" fn overlay_subclass_proc(
    hwnd: windows_sys::Win32::Foundation::HWND,
    msg: u32,
    wparam: windows_sys::Win32::Foundation::WPARAM,
    lparam: windows_sys::Win32::Foundation::LPARAM,
    _id_subclass: usize,
    _ref_data: usize,
) -> windows_sys::Win32::Foundation::LRESULT {
    if msg == WM_MOUSEACTIVATE {
        return MA_NOACTIVATE as _;
    }
    DefSubclassProc(hwnd, msg, wparam, lparam)
}

#[cfg(target_os = "windows")]
unsafe extern "system" fn enum_child_proc(
    child_hwnd: windows_sys::Win32::Foundation::HWND,
    _lparam: windows_sys::Win32::Foundation::LPARAM,
) -> windows_sys::Win32::Foundation::BOOL {
    let ex_style = GetWindowLongW(child_hwnd, GWL_EXSTYLE);
    SetWindowLongW(
        child_hwnd,
        GWL_EXSTYLE,
        ex_style | (WS_EX_NOACTIVATE as i32) | (WS_EX_TOOLWINDOW as i32),
    );
    SetWindowSubclass(child_hwnd, Some(overlay_subclass_proc), 1, 0);
    1
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                #[cfg(target_os = "windows")]
                {
                    let previous_active_hwnd = unsafe { GetForegroundWindow() };
                    if let Ok(hwnd) = window.hwnd() {
                        let hwnd_ptr = hwnd.0 as windows_sys::Win32::Foundation::HWND;
                        unsafe {
                            let ex_style = GetWindowLongW(hwnd_ptr, GWL_EXSTYLE);
                            SetWindowLongW(
                                hwnd_ptr,
                                GWL_EXSTYLE,
                                ex_style
                                    | (WS_EX_NOACTIVATE as i32)
                                    | (WS_EX_TOOLWINDOW as i32)
                                    | (WS_EX_TOPMOST as i32),
                            );
                            SetWindowPos(
                                hwnd_ptr,
                                HWND_TOPMOST,
                                0,
                                0,
                                0,
                                0,
                                SWP_NOMOVE
                                    | SWP_NOSIZE
                                    | SWP_NOACTIVATE
                                    | SWP_FRAMECHANGED
                                    | SWP_SHOWWINDOW,
                            );
                            SetWindowSubclass(hwnd_ptr, Some(overlay_subclass_proc), 1, 0);
                            EnumChildWindows(hwnd_ptr, Some(enum_child_proc), 0);

                            // Restore focus to game window on launch
                            if !previous_active_hwnd.is_null() && previous_active_hwnd != hwnd_ptr {
                                SetForegroundWindow(previous_active_hwnd);
                            }
                        }
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            send_key_input,
            minimize_window,
            toggle_maximize_window,
            close_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
