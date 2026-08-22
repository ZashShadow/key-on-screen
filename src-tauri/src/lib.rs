use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn send_key_input(key: &str, pressed: bool) {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
            MapVirtualKeyW, MAPVK_VK_TO_VSC, KEYEVENTF_KEYUP, KEYEVENTF_SCANCODE, SendInput,
            INPUT, INPUT_KEYBOARD, KEYBDINPUT,
        };

        let vk_code: u16 = match key.to_uppercase().as_str() {
            "A" => 0x41,
            "B" => 0x42,
            "C" => 0x43,
            "D" => 0x44,
            "E" => 0x45,
            "F" => 0x46,
            "G" => 0x47,
            "H" => 0x48,
            "I" => 0x49,
            "J" => 0x4A,
            "K" => 0x4B,
            "L" => 0x4C,
            "M" => 0x4D,
            "N" => 0x4E,
            "O" => 0x4F,
            "P" => 0x50,
            "Q" => 0x51,
            "R" => 0x52,
            "S" => 0x53,
            "T" => 0x54,
            "U" => 0x55,
            "V" => 0x56,
            "W" => 0x57,
            "X" => 0x58,
            "Y" => 0x59,
            "Z" => 0x5A,
            "SPACE" => 0x20,
            "ENTER" => 0x0D,
            "SHIFT" => 0x10,
            "CTRL" => 0x11,
            "ALT" => 0x12,
            "ESCAPE" => 0x1B,
            _ => return,
        };

        let scan_code = unsafe { MapVirtualKeyW(vk_code as u32, MAPVK_VK_TO_VSC) } as u16;
        let mut flags = KEYEVENTF_SCANCODE;
        if !pressed {
            flags |= KEYEVENTF_KEYUP;
        }

        let mut input = INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: windows_sys::Win32::UI::Input::KeyboardAndMouse::INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: 0,
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
    EnumChildWindows, GetWindowLongW, SetWindowLongW, SetWindowPos, GWL_EXSTYLE, MA_NOACTIVATE,
    SWP_FRAMECHANGED, SWP_NOMOVE, SWP_NOSIZE, SWP_NOZORDER, WM_MOUSEACTIVATE, WS_EX_NOACTIVATE,
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
    SetWindowLongW(child_hwnd, GWL_EXSTYLE, ex_style | (WS_EX_NOACTIVATE as i32));
    SetWindowSubclass(child_hwnd, Some(overlay_subclass_proc), 1, 0);
    1
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
                        let hwnd_ptr = hwnd.0 as windows_sys::Win32::Foundation::HWND;
                        unsafe {
                            let ex_style = GetWindowLongW(hwnd_ptr, GWL_EXSTYLE);
                            SetWindowLongW(hwnd_ptr, GWL_EXSTYLE, ex_style | (WS_EX_NOACTIVATE as i32));
                            SetWindowPos(
                                hwnd_ptr,
                                std::ptr::null_mut(),
                                0,
                                0,
                                0,
                                0,
                                SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED,
                            );
                            SetWindowSubclass(hwnd_ptr, Some(overlay_subclass_proc), 1, 0);
                            EnumChildWindows(hwnd_ptr, Some(enum_child_proc), 0);
                        }
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, send_key_input])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
