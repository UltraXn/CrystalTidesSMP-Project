use std::sync::atomic::{AtomicU32, Ordering};
use std::time::Instant;

const HISTORY_SIZE: usize = 120;

pub struct TelemetryData {
    pub average_fps: f32,
    pub p99_frametime_ms: f32,
    pub min_frametime_ms: f32,
    pub max_frametime_ms: f32,
    pub frametime_history: [f32; HISTORY_SIZE],
    pub history_idx: usize,
    pub vram_used_mb: u32,
    pub vram_total_mb: u32,
    pub ram_used_mb: u32,
}

static PRESENTED_FRAMES: AtomicU32 = AtomicU32::new(0);

pub struct TelemetryHud {
    last_frame_time: Instant,
    frametimes: [f32; HISTORY_SIZE],
    head: usize,
    count: usize,
}

impl Default for TelemetryHud {
    fn default() -> Self {
        Self::new()
    }
}

impl TelemetryHud {
    pub fn new() -> Self {
        Self {
            last_frame_time: Instant::now(),
            frametimes: [16.6; HISTORY_SIZE],
            head: 0,
            count: 0,
        }
    }

    pub fn on_frame(&mut self) -> TelemetryData {
        let now = Instant::now();
        let delta = now.duration_since(self.last_frame_time).as_secs_f32() * 1000.0;
        self.last_frame_time = now;
        self.record_frametime(delta)
    }

    pub fn record_frametime(&mut self, delta: f32) -> TelemetryData {
        PRESENTED_FRAMES.fetch_add(1, Ordering::Relaxed);

        // Clamping unrealistic spikes (e.g. game pauses or loading)
        let clamped_delta = delta.clamp(1.0, 100.0);
        self.frametimes[self.head] = clamped_delta;
        self.head = (self.head + 1) % HISTORY_SIZE;
        if self.count < HISTORY_SIZE {
            self.count += 1;
        }

        let mut sum = 0.0;
        let mut min = 999.0;
        let mut max = 0.0;
        let mut sorted = [0.0; HISTORY_SIZE];

        sorted[..self.count].copy_from_slice(&self.frametimes[..self.count]);
        for &v in &sorted[..self.count] {
            sum += v;
            if v < min { min = v; }
            if v > max { max = v; }
        }

        let avg_frametime = if self.count > 0 { sum / self.count as f32 } else { 16.6 };
        let avg_fps = if avg_frametime > 0.0 { 1000.0 / avg_frametime } else { 60.0 };

        // Approximate p99
        let p99_idx = ((self.count as f32) * 0.99) as usize;
        let sorted_slice = &mut sorted[0..self.count];
        sorted_slice.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let p99 = if self.count > 0 { sorted_slice[p99_idx.min(self.count - 1)] } else { 16.6 };

        TelemetryData {
            average_fps: avg_fps,
            p99_frametime_ms: p99,
            min_frametime_ms: min,
            max_frametime_ms: max,
            frametime_history: self.frametimes,
            history_idx: self.head,
            vram_used_mb: 2840,
            vram_total_mb: 12288,
            ram_used_mb: 3950,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_telemetry_hud_defaults() {
        let hud = TelemetryHud::default();
        assert_eq!(hud.head, 0);
        assert_eq!(hud.count, 0);
    }

    #[test]
    fn test_telemetry_hud_record_frametime_and_p99() {
        let mut hud = TelemetryHud::new();

        // Feed 100 frames of 10ms
        for _ in 0..99 {
            hud.record_frametime(10.0);
        }
        // Feed 1 frame of 50ms spike
        let data = hud.record_frametime(50.0);

        assert_eq!(data.history_idx, 100);
        assert!(data.p99_frametime_ms >= 49.0, "Expected p99 to capture the 50ms spike, got {}", data.p99_frametime_ms);
        assert!(data.average_fps > 90.0, "Average FPS should be high for 10ms frames");
    }

    #[test]
    fn test_telemetry_hud_clamping() {
        let mut hud = TelemetryHud::new();
        // Frame spike of 500ms should be clamped to 100.0ms
        let data = hud.record_frametime(500.0);
        assert_eq!(data.max_frametime_ms, 100.0);

        // Frame lower than 1.0ms should be clamped to 1.0ms
        let data_fast = hud.record_frametime(0.1);
        assert_eq!(data_fast.min_frametime_ms, 1.0);
    }
}

