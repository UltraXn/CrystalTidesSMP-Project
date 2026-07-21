use rusqlite::Connection;

pub fn init_core() -> bool {
    match Connection::open_in_memory() {
        Ok(_) => {
            println!("[Rust Core] SQLite Memory Initialized.");
            true
        }
        Err(e) => {
            println!("[Rust Core] DB Error: {}", e);
            false
        }
    }
}
