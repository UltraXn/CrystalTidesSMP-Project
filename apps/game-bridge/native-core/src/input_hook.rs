use std::sync::atomic::{AtomicBool, AtomicIsize, Ordering};
use windows::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_SHIFT, VK_TAB};
use windows::Win32::UI::WindowsAndMessaging::{
    CallWindowProcW, ClipCursor, GetForegroundWindow, SetWindowLongPtrW, ShowCursor,
    GWLP_WNDPROC, WM_CHAR, WM_KEYDOWN, WM_LBUTTONDOWN, WM_LBUTTONUP,
    WM_MOUSEMOVE, WM_MOUSEWHEEL, WM_RBUTTONDOWN, WM_RBUTTONUP, WM_SYSKEYDOWN, WNDPROC,
};

static OVERLAY_VISIBLE: AtomicBool = AtomicBool::new(false);
static ORIGINAL_WNDPROC: AtomicIsize = AtomicIsize::new(0);
static HOOKED_HWND: AtomicIsize = AtomicIsize::new(0);

/// Check if the in-game overlay is currently toggled on
pub fn is_overlay_visible() -> bool {
    OVERLAY_VISIBLE.load(Ordering::SeqCst)
}

/// Set overlay visibility state and adjust Windows cursor state accordingly
pub fn set_overlay_visible(visible: bool) {
    OVERLAY_VISIBLE.store(visible, Ordering::SeqCst);
    unsafe {
        if visible {
            // Free any restricted mouse clip and ensure cursor is visible for UI interaction
            let _ = ClipCursor(None);
            ShowCursor(true);
        } else {
            // Return cursor control to Minecraft
            ShowCursor(false);
        }
    }
}

/// Toggle overlay state
pub fn toggle_overlay() -> bool {
    let current = is_overlay_visible();
    let next = !current;
    set_overlay_visible(next);
    next
}

/// Installs the global window procedure subclass hook on the active Minecraft window.
pub fn hook_active_window() -> bool {
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.0.is_null() {
            return false;
        }
        hook_window(hwnd)
    }
}

/// Subclasses the specified window to capture Shift + Tab and block mouse events when overlay is open.
pub fn hook_window(hwnd: HWND) -> bool {
    unsafe {
        let current_hooked = HOOKED_HWND.load(Ordering::SeqCst);
        if current_hooked == hwnd.0 as isize {
            return true; // Already hooked
        }

        let original = SetWindowLongPtrW(
            hwnd,
            GWLP_WNDPROC,
            overlay_wnd_proc as *const () as usize as isize,
        );

        if original != 0 {
            ORIGINAL_WNDPROC.store(original, Ordering::SeqCst);
            HOOKED_HWND.store(hwnd.0 as isize, Ordering::SeqCst);
            log::info!("🎮 [InputHook] Subclassed Minecraft HWND {:?} successfully", hwnd);
            true
        } else {
            log::warn!("⚠️ [InputHook] Failed to subclass HWND {:?}", hwnd);
            false
        }
    }
}

/// Custom window procedure that intercepts input before LWJGL / Minecraft processes it.
unsafe extern "system" fn overlay_wnd_proc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    // 1. Intercept Shift + Tab hotkey
    if msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN {
        let key = wparam.0 as i32;
        if key == VK_TAB.0 as i32 {
            let shift_state = GetAsyncKeyState(VK_SHIFT.0 as i32);
            let shift_down = (shift_state as u16 & 0x8000) != 0;
            if shift_down {
                let is_open = toggle_overlay();
                log::info!("🎮 [InputHook] Shift+Tab triggered! Overlay state: {}", is_open);
                return LRESULT(0); // Swallow the event so Minecraft doesn't cycle UI elements
            }
        }
    }

    // 2. When overlay is active, consume mouse clicks and text input so player doesn't swing/move
    if is_overlay_visible() {
        match msg {
            WM_LBUTTONDOWN | WM_LBUTTONUP | WM_RBUTTONDOWN | WM_RBUTTONUP | WM_MOUSEMOVE
            | WM_MOUSEWHEEL | WM_CHAR => {
                // Event absorbed by the overlay interface
                return LRESULT(0);
            }
            _ => {}
        }
    }

    // 3. Fall through to original Minecraft WNDPROC
    let original = ORIGINAL_WNDPROC.load(Ordering::SeqCst);
    if original != 0 {
        let original_fn: WNDPROC = std::mem::transmute(original);
        CallWindowProcW(original_fn, hwnd, msg, wparam, lparam)
    } else {
        LRESULT(0)
    }
}
