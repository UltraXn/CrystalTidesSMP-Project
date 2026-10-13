use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::Instant;

/// Watchdog that detects JVM Garbage Collector pauses and stutters.
/// When Java freezes the Render Thread for > 50ms, this guard triggers
/// synthetic frame reprojection to preserve visual continuity at the display refresh rate.
pub struct PacingGuard {
    last_frame_instant: Instant,
    stutter_threshold_ms: f64,
    emergency_frames_count: AtomicU64,
    guard_active: AtomicBool,
}

#[derive(Debug, PartialEq, Eq)]
pub enum PacingAction {
    Nominal,
    EmergencyReprojectionRequired { elapsed_ms: u64 },
}

impl Default for PacingGuard {
    fn default() -> Self {
        Self::new(50.0)
    }
}

impl PacingGuard {
    pub fn new(stutter_threshold_ms: f64) -> Self {
        Self {
            last_frame_instant: Instant::now(),
            stutter_threshold_ms,
            emergency_frames_count: AtomicU64::new(0),
            guard_active: AtomicBool::new(true),
        }
    }

    pub fn on_real_frame_presented(&mut self) {
        self.last_frame_instant = Instant::now();
    }

    /// Checks if the JVM thread has paused beyond the allowable frametime tolerance.
    pub fn inspect_pacing(&mut self) -> PacingAction {
        if !self.guard_active.load(Ordering::Relaxed) {
            return PacingAction::Nominal;
        }

        let elapsed = self.last_frame_instant.elapsed();
        let elapsed_ms = elapsed.as_secs_f64() * 1000.0;

        if elapsed_ms >= self.stutter_threshold_ms {
            self.emergency_frames_count.fetch_add(1, Ordering::Relaxed);
            // Advance timestamp slightly to prevent flood while still guarding
            self.last_frame_instant = Instant::now();
            PacingAction::EmergencyReprojectionRequired {
                elapsed_ms: elapsed_ms as u64,
            }
        } else {
            PacingAction::Nominal
        }
    }

    pub fn get_emergency_frames_count(&self) -> u64 {
        self.emergency_frames_count.load(Ordering::Relaxed)
    }

    pub fn set_active(&self, active: bool) {
        self.guard_active.store(active, Ordering::SeqCst);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pacing_guard_nominal() {
        let mut guard = PacingGuard::new(50.0);
        guard.on_real_frame_presented();
        assert_eq!(guard.inspect_pacing(), PacingAction::Nominal);
        assert_eq!(guard.get_emergency_frames_count(), 0);
    }

    #[test]
    fn test_pacing_guard_stutter_trigger() {
        let mut guard = PacingGuard::new(1.0); // 1ms threshold for testing
        std::thread::sleep(std::time::Duration::from_millis(5));
        let action = guard.inspect_pacing();
        match action {
            PacingAction::EmergencyReprojectionRequired { elapsed_ms } => {
                assert!(elapsed_ms >= 1);
            }
            PacingAction::Nominal => panic!("Expected emergency reprojection!"),
        }
        assert_eq!(guard.get_emergency_frames_count(), 1);
    }
}
