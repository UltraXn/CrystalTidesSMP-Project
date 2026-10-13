use std::collections::VecDeque;
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

const MAX_BUFFER_DURATION: Duration = Duration::from_secs(30);

#[derive(Clone, Debug)]
pub struct ReplayFrameMetadata {
    pub frame_id: u64,
    pub timestamp_ms: u64,
    pub delta_ms: f32,
    pub is_keyframe: bool,
    pub payload_size: usize,
}

pub struct CircularReplayBuffer {
    buffer: VecDeque<(Instant, ReplayFrameMetadata)>,
    total_bytes: usize,
    max_bytes: usize,
}

impl Default for CircularReplayBuffer {
    fn default() -> Self {
        Self::new(64 * 1024 * 1024) // 64 MB rolling circular buffer
    }
}

impl CircularReplayBuffer {
    pub fn new(max_bytes: usize) -> Self {
        Self {
            buffer: VecDeque::with_capacity(1800), // ~30s at 60fps
            total_bytes: 0,
            max_bytes,
        }
    }

    pub fn push_frame(&mut self, meta: ReplayFrameMetadata) {
        let now = Instant::now();
        self.total_bytes += meta.payload_size;
        self.buffer.push_back((now, meta));

        // Purge frames older than 30 seconds or exceeding memory capacity
        while let Some((time, front_meta)) = self.buffer.front() {
            if now.duration_since(*time) > MAX_BUFFER_DURATION || self.total_bytes > self.max_bytes {
                self.total_bytes = self.total_bytes.saturating_sub(front_meta.payload_size);
                self.buffer.pop_front();
            } else {
                break;
            }
        }
    }

    pub fn get_buffered_duration(&self) -> Duration {
        if let (Some((oldest, _)), Some((newest, _))) = (self.buffer.front(), self.buffer.back()) {
            newest.duration_since(*oldest)
        } else {
            Duration::ZERO
        }
    }

    pub fn get_frame_count(&self) -> usize {
        self.buffer.len()
    }

    /// Flushes the rolling 30-second buffer into a replay file in the user's .crystaltides directory.
    pub fn save_clip<P: AsRef<Path>>(&self, target_dir: P) -> Result<PathBuf, String> {
        let dir = target_dir.as_ref();
        if !dir.exists() {
            fs::create_dir_all(dir).map_err(|e| format!("Failed to create directory: {}", e))?;
        }

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or(Duration::ZERO)
            .as_millis();

        let filename = format!("crystaltides_clip_{}.ctreplay", timestamp);
        let file_path = dir.join(filename);

        let mut file = File::create(&file_path)
            .map_err(|e| format!("Failed to create clip file: {}", e))?;

        // Write CrystalTides Replay Container Header
        file.write_all(b"CT_REPLAY_V1\n")
            .map_err(|e| format!("Write error: {}", e))?;

        let header_info = format!(
            "Timestamp={}\nFramesCount={}\nDurationSec={:.2}\n\n",
            timestamp,
            self.buffer.len(),
            self.get_buffered_duration().as_secs_f64()
        );
        file.write_all(header_info.as_bytes())
            .map_err(|e| format!("Write error: {}", e))?;

        // Write frame metadata stream
        for (_, meta) in &self.buffer {
            let row = format!(
                "F:{},T:{},D:{:.2},K:{},S:{}\n",
                meta.frame_id, meta.timestamp_ms, meta.delta_ms, meta.is_keyframe as u8, meta.payload_size
            );
            file.write_all(row.as_bytes())
                .map_err(|e| format!("Write error: {}", e))?;
        }

        file.flush().map_err(|e| format!("Flush error: {}", e))?;
        Ok(file_path)
    }
}

static INSTANT_REPLAY: Mutex<Option<CircularReplayBuffer>> = Mutex::new(None);

pub fn init_replay_system() {
    let mut lock = INSTANT_REPLAY.lock().unwrap();
    if lock.is_none() {
        *lock = Some(CircularReplayBuffer::default());
        log::info!("🎥 [InstantReplay] GPU Circular Replay Buffer Initialized (30s buffer)");
    }
}

pub fn record_replay_frame(frame_id: u64, delta_ms: f32, is_keyframe: bool, payload_size: usize) {
    let mut lock = INSTANT_REPLAY.lock().unwrap();
    if let Some(ref mut replay) = *lock {
        let now_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or(Duration::ZERO)
            .as_millis() as u64;

        replay.push_frame(ReplayFrameMetadata {
            frame_id,
            timestamp_ms: now_ms,
            delta_ms,
            is_keyframe,
            payload_size,
        });
    }
}

pub fn save_current_replay() -> Result<String, String> {
    let lock = INSTANT_REPLAY.lock().unwrap();
    if let Some(ref replay) = *lock {
        let home = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Default".to_string());
        let target_dir = Path::new(&home).join(".crystaltides").join("replays");
        let path = replay.save_clip(&target_dir)?;
        Ok(path.to_string_lossy().to_string())
    } else {
        Err("Instant replay system not initialized".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_circular_buffer_capacity() {
        let mut buffer = CircularReplayBuffer::new(1024 * 1024);
        for i in 0..100 {
            buffer.push_frame(ReplayFrameMetadata {
                frame_id: i,
                timestamp_ms: i * 16,
                delta_ms: 16.6,
                is_keyframe: i % 30 == 0,
                payload_size: 512,
            });
        }

        assert_eq!(buffer.get_frame_count(), 100);
    }

    #[test]
    fn test_save_clip_millisecond_uniqueness() {
        let temp_dir = std::env::temp_dir().join("ct_replay_test");
        let mut buffer = CircularReplayBuffer::new(1024 * 1024);
        buffer.push_frame(ReplayFrameMetadata {
            frame_id: 1,
            timestamp_ms: 1000,
            delta_ms: 16.6,
            is_keyframe: true,
            payload_size: 256,
        });

        let clip1 = buffer.save_clip(&temp_dir).expect("Should save first clip");
        std::thread::sleep(Duration::from_millis(2));
        let clip2 = buffer.save_clip(&temp_dir).expect("Should save second clip");

        assert_ne!(clip1, clip2, "Consecutive clips must have unique filenames");
        let _ = fs::remove_file(clip1);
        let _ = fs::remove_file(clip2);
        let _ = fs::remove_dir(temp_dir);
    }
}
