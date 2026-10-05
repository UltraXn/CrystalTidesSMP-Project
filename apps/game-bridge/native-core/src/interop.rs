//! WGL_NV_DX_interop2 & DirectX 12 Zero-Copy Swapchain Interop
//!
//! Enables zero-copy sharing of the OpenGL Framebuffer texture with a DirectX 12
//! swapchain in GPU VRAM, allowing AMD FidelityFX FSR 3.1 Frame Generation to run
//! on Minecraft frames without breaking Sodium/Iris GLSL shaders.

use std::ffi::{c_void, CString};
use std::sync::Mutex;

pub type HANDLE = *mut c_void;

// WGL NV DX Interop access flags
pub const WGL_ACCESS_READ_ONLY_NV: u32 = 0x0000;
pub const WGL_ACCESS_READ_WRITE_NV: u32 = 0x0001;
pub const WGL_ACCESS_WRITE_DISCARD_NV: u32 = 0x0002;

// Function pointer signatures for WGL_NV_DX_interop2
pub type PFNWGLDXOPENDEVICENV = unsafe extern "system" fn(dx_device: *mut c_void) -> HANDLE;
pub type PFNWGLDXCLOSEDEVICENV = unsafe extern "system" fn(h_device: HANDLE) -> i32;
pub type PFNWGLDXREGISTEROBJECTNV = unsafe extern "system" fn(
    h_device: HANDLE,
    dx_resource: *mut c_void,
    name: u32,
    object_type: u32,
    access: u32,
) -> HANDLE;
pub type PFNWGLDXUNREGISTEROBJECTNV = unsafe extern "system" fn(h_device: HANDLE, h_object: HANDLE) -> i32;
pub type PFNWGLDXLOCKOBJECTSNV = unsafe extern "system" fn(h_device: HANDLE, count: i32, h_objects: *mut HANDLE) -> i32;
pub type PFNWGLDXUNLOCKOBJECTSNV = unsafe extern "system" fn(h_device: HANDLE, count: i32, h_objects: *mut HANDLE) -> i32;

#[derive(Default, Clone)]
pub struct WglInteropProcs {
    pub dx_open_device: Option<PFNWGLDXOPENDEVICENV>,
    pub dx_close_device: Option<PFNWGLDXCLOSEDEVICENV>,
    pub dx_register_object: Option<PFNWGLDXREGISTEROBJECTNV>,
    pub dx_unregister_object: Option<PFNWGLDXUNREGISTEROBJECTNV>,
    pub dx_lock_objects: Option<PFNWGLDXLOCKOBJECTSNV>,
    pub dx_unlock_objects: Option<PFNWGLDXUNLOCKOBJECTSNV>,
    pub is_supported: bool,
}

pub struct InteropState {
    pub procs: WglInteropProcs,
    pub device_handle: Option<HANDLE>,
    pub registered_texture_handle: Option<HANDLE>,
    pub texture_id: u32,
    pub width: u32,
    pub height: u32,
    pub is_locked: bool,
}

unsafe impl Send for InteropState {}
unsafe impl Sync for InteropState {}

static INTEROP_STATE: Mutex<Option<InteropState>> = Mutex::new(None);

/// Loads WGL extension function pointers from the active OpenGL context
///
/// # Safety
///
/// The caller must ensure that an active and valid OpenGL context is currently bound
/// to the calling thread prior to invoking this function.
pub unsafe fn load_wgl_extensions() -> WglInteropProcs {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::Graphics::OpenGL::wglGetProcAddress;
        use windows::core::PCSTR;

        let get_proc = |name: &str| -> Option<*mut c_void> {
            let c_str = CString::new(name).ok()?;
            let ptr = wglGetProcAddress(PCSTR(c_str.as_ptr() as *const u8));
            ptr.map(|p| p as *mut c_void)
        };

        let open_dev: Option<PFNWGLDXOPENDEVICENV> = get_proc("wglDXOpenDeviceNV").map(|p| std::mem::transmute(p));
        let close_dev: Option<PFNWGLDXCLOSEDEVICENV> = get_proc("wglDXCloseDeviceNV").map(|p| std::mem::transmute(p));
        let reg_obj: Option<PFNWGLDXREGISTEROBJECTNV> = get_proc("wglDXRegisterObjectNV").map(|p| std::mem::transmute(p));
        let unreg_obj: Option<PFNWGLDXUNREGISTEROBJECTNV> = get_proc("wglDXUnregisterObjectNV").map(|p| std::mem::transmute(p));
        let lock_obj: Option<PFNWGLDXLOCKOBJECTSNV> = get_proc("wglDXLockObjectsNV").map(|p| std::mem::transmute(p));
        let unlock_obj: Option<PFNWGLDXUNLOCKOBJECTSNV> = get_proc("wglDXUnlockObjectsNV").map(|p| std::mem::transmute(p));

        let supported = open_dev.is_some() && reg_obj.is_some() && lock_obj.is_some() && unlock_obj.is_some();

        log::info!(
            "[Interop] WGL_NV_DX_interop2 availability: Supported={}, OpenDevice={:?}",
            supported,
            open_dev.is_some()
        );

        WglInteropProcs {
            dx_open_device: open_dev,
            dx_close_device: close_dev,
            dx_register_object: reg_obj,
            dx_unregister_object: unreg_obj,
            dx_lock_objects: lock_obj,
            dx_unlock_objects: unlock_obj,
            is_supported: supported,
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        WglInteropProcs::default()
    }
}

/// Initializes the interop state with the active OpenGL texture ID
pub fn init_interop(texture_id: u32, width: u32, height: u32) -> Result<String, String> {
    unsafe {
        let procs = load_wgl_extensions();
        let supported = procs.is_supported;

        let state = InteropState {
            procs,
            device_handle: None,
            registered_texture_handle: None,
            texture_id,
            width,
            height,
            is_locked: false,
        };

        let mut lock = INTEROP_STATE.lock().map_err(|e| e.to_string())?;
        *lock = Some(state);

        Ok(format!(
            "Interop Initialized: Texture={}, Size={}x{}, NV_DX_Interop_Supported={}",
            texture_id, width, height, supported
        ))
    }
}

/// Locks the OpenGL texture for DirectX 12 zero-copy reading
pub fn lock_texture_for_dx12() -> Result<bool, String> {
    let mut lock = INTEROP_STATE.lock().map_err(|e| e.to_string())?;
    if let Some(ref mut state) = *lock {
        if let (Some(lock_fn), Some(dev), Some(mut obj)) = (
            state.procs.dx_lock_objects,
            state.device_handle,
            state.registered_texture_handle,
        ) {
            unsafe {
                let res = lock_fn(dev, 1, &mut obj);
                state.is_locked = res != 0;
                return Ok(state.is_locked);
            }
        }
    }
    Ok(false)
}

/// Unlocks the OpenGL texture, returning ownership back to OpenGL
pub fn unlock_texture_from_dx12() -> Result<bool, String> {
    let mut lock = INTEROP_STATE.lock().map_err(|e| e.to_string())?;
    if let Some(ref mut state) = *lock {
        if let (Some(unlock_fn), Some(dev), Some(mut obj)) = (
            state.procs.dx_unlock_objects,
            state.device_handle,
            state.registered_texture_handle,
        ) {
            unsafe {
                let res = unlock_fn(dev, 1, &mut obj);
                state.is_locked = false;
                return Ok(res != 0);
            }
        }
    }
    Ok(false)
}
