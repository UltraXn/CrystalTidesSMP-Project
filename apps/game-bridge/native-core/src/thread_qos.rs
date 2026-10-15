//! Thread QoS & In-Process Windows Power Throttling Bypass
//! 
//! Applied directly from inside the JVM process to ensure the Render Thread
//! and Integrated Server Thread never get scheduled to Intel E-Cores or throttled
//! by Windows 11 EcoQoS.

#[cfg(target_os = "windows")]
use windows::Win32::System::Threading::{
    GetCurrentThread, GetCurrentThreadId, SetThreadPriority,
    THREAD_PRIORITY_ABOVE_NORMAL, THREAD_PRIORITY_NORMAL,
};

#[cfg(target_os = "windows")]
#[repr(C)]
struct ThreadPowerThrottlingState {
    version: u32,
    control_mask: u32,
    state_mask: u32,
}

/// Optimizes the calling thread:
/// 1. Elevates thread priority to ABOVE_NORMAL or NORMAL
/// 2. Disables Windows 11 EcoQoS (ThreadPowerThrottling) directly on the thread handle
pub fn optimize_current_thread(above_normal: bool) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    unsafe {
        let thread = GetCurrentThread();
        let thread_id = GetCurrentThreadId();

        // 1. Thread priority (capped at ABOVE_NORMAL)
        let target_prio = if above_normal {
            THREAD_PRIORITY_ABOVE_NORMAL
        } else {
            THREAD_PRIORITY_NORMAL
        };

        let prio_ok = SetThreadPriority(thread, target_prio);

        // 2. Disable EcoQoS for this thread via SetThreadInformation (ThreadPowerThrottling = 1)
        #[link(name = "kernel32")]
        extern "system" {
            fn SetThreadInformation(
                hThread: windows::Win32::Foundation::HANDLE,
                ThreadInformationClass: i32,
                ThreadInformation: *const std::ffi::c_void,
                ThreadInformationSize: u32,
            ) -> windows::Win32::Foundation::BOOL;
        }

        let state = ThreadPowerThrottlingState {
            version: 1, // THREAD_POWER_THROTTLING_CURRENT_VERSION
            control_mask: 0x1, // THREAD_POWER_THROTTLING_EXECUTION_SPEED
            state_mask: 0, // 0 = Disable throttling
        };

        let eco_ok = SetThreadInformation(
            thread,
            1, // ThreadPowerThrottling
            &state as *const _ as *const std::ffi::c_void,
            std::mem::size_of::<ThreadPowerThrottlingState>() as u32,
        );

        let status = format!(
            "Thread ID {}: Priority Set ({:?}), EcoQoS Disabled ({:?})",
            thread_id,
            prio_ok.is_ok(),
            eco_ok.as_bool()
        );
        log::info!("[ThreadQoS] {}", status);
        Ok(status)
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = above_normal;
        Ok("Thread QoS only active on Windows platform.".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_optimize_current_thread_above_normal() {
        let res = optimize_current_thread(true);
        assert!(res.is_ok());
    }

    #[test]
    fn test_optimize_current_thread_normal() {
        let res = optimize_current_thread(false);
        assert!(res.is_ok());
    }
}
