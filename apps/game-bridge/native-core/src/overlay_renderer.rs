use std::sync::Mutex;
use windows::Win32::Graphics::OpenGL::*;
use crate::input_hook;
use crate::ui::server_menu::ServerMenuState;
use crate::ui::telemetry_hud::TelemetryHud;

static OVERLAY_RENDERER: Mutex<Option<OverlayRenderer>> = Mutex::new(None);

pub struct OverlayRenderer {
    hud: TelemetryHud,
    #[allow(dead_code)]
    pub menu: ServerMenuState,
}

impl Default for OverlayRenderer {
    fn default() -> Self {
        Self::new()
    }
}

impl OverlayRenderer {
    pub fn new() -> Self {
        Self {
            hud: TelemetryHud::new(),
            menu: ServerMenuState::new(),
        }
    }

    pub fn render(&mut self, width: i32, height: i32) {
        // Collect telemetry on every frame for accurate frametime graphs
        let telemetry = self.hud.on_frame();

        // If overlay is not toggled by the player, exit immediately
        if !input_hook::is_overlay_visible() {
            return;
        }

        unsafe {
            // 1. Save all existing OpenGL pipeline state
            glPushAttrib(GL_ALL_ATTRIB_BITS);

            // 2. Setup 2D Orthographic view matching viewport dimensions
            glMatrixMode(GL_PROJECTION);
            glPushMatrix();
            glLoadIdentity();
            glOrtho(0.0, width as f64, height as f64, 0.0, -1.0, 1.0);

            glMatrixMode(GL_MODELVIEW);
            glPushMatrix();
            glLoadIdentity();

            glDisable(GL_DEPTH_TEST);
            glEnable(GL_BLEND);
            glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

            // 3. Render Translucent Backdrop Dimming (Obsidian Frost)
            glColor4f(0.02, 0.04, 0.07, 0.72);
            glBegin(GL_QUADS);
            glVertex2f(0.0, 0.0);
            glVertex2f(width as f32, 0.0);
            glVertex2f(width as f32, height as f32);
            glVertex2f(0.0, height as f32);
            glEnd();

            // 4. Center Dialog Dimensions
            let modal_w = (width as f32 * 0.75).clamp(600.0, 1100.0);
            let modal_h = (height as f32 * 0.72).clamp(420.0, 720.0);
            let modal_x = (width as f32 - modal_w) * 0.5;
            let modal_y = (height as f32 - modal_h) * 0.5;

            // Modal Body
            glColor4f(0.04, 0.06, 0.10, 0.94);
            glBegin(GL_QUADS);
            glVertex2f(modal_x, modal_y);
            glVertex2f(modal_x + modal_w, modal_y);
            glVertex2f(modal_x + modal_w, modal_y + modal_h);
            glVertex2f(modal_x, modal_y + modal_h);
            glEnd();

            // Modal Cyan Glowing Border
            glColor4f(0.0, 0.9, 1.0, 0.5);
            glLineWidth(2.0);
            glBegin(GL_LINE_LOOP);
            glVertex2f(modal_x, modal_y);
            glVertex2f(modal_x + modal_w, modal_y);
            glVertex2f(modal_x + modal_w, modal_y + modal_h);
            glVertex2f(modal_x, modal_y + modal_h);
            glEnd();

            // Header Accent Line
            glColor4f(0.0, 0.9, 1.0, 0.85);
            glBegin(GL_LINES);
            glVertex2f(modal_x + 16.0, modal_y + 44.0);
            glVertex2f(modal_x + modal_w - 16.0, modal_y + 44.0);
            glEnd();

            // 5. Left Panel: Real-Time Frametime Graph Box
            let graph_x = modal_x + 24.0;
            let graph_y = modal_y + 60.0;
            let graph_w = modal_w * 0.48;
            let graph_h = modal_h * 0.45;

            glColor4f(0.02, 0.03, 0.05, 0.85);
            glBegin(GL_QUADS);
            glVertex2f(graph_x, graph_y);
            glVertex2f(graph_x + graph_w, graph_y);
            glVertex2f(graph_x + graph_w, graph_y + graph_h);
            glVertex2f(graph_x, graph_y + graph_h);
            glEnd();

            glColor4f(0.15, 0.25, 0.35, 0.6);
            glLineWidth(1.0);
            glBegin(GL_LINE_LOOP);
            glVertex2f(graph_x, graph_y);
            glVertex2f(graph_x + graph_w, graph_y);
            glVertex2f(graph_x + graph_w, graph_y + graph_h);
            glVertex2f(graph_x, graph_y + graph_h);
            glEnd();

            // Frametime Curve in Cyan
            glColor4f(0.0, 0.9, 1.0, 0.9);
            glLineWidth(1.8);
            glBegin(GL_LINE_STRIP);
            let hist_len = telemetry.frametime_history.len();
            for i in 0..hist_len {
                let val = telemetry.frametime_history[(telemetry.history_idx + i) % hist_len];
                let norm_y = (val / 33.3).clamp(0.0, 1.0); // 33.3ms is 30 FPS floor
                let px = graph_x + (i as f32 / (hist_len - 1) as f32) * graph_w;
                let py = (graph_y + graph_h) - norm_y * (graph_h - 10.0);
                glVertex2f(px, py);
            }
            glEnd();

            // 6. Right Panel: Server Quick-Access Buttons
            let right_x = modal_x + modal_w * 0.54;
            let right_y = modal_y + 60.0;
            let btn_w = modal_w * 0.42;
            let btn_h = 42.0;

            for (idx, _btn) in crate::ui::server_menu::SERVER_SHORTCUTS.iter().enumerate() {
                let by = right_y + (idx as f32 * (btn_h + 12.0));

                // Button pill background
                glColor4f(0.06, 0.10, 0.16, 0.85);
                glBegin(GL_QUADS);
                glVertex2f(right_x, by);
                glVertex2f(right_x + btn_w, by);
                glVertex2f(right_x + btn_w, by + btn_h);
                glVertex2f(right_x, by + btn_h);
                glEnd();

                // Button cyan subtle border
                glColor4f(0.0, 0.8, 0.95, 0.35);
                glLineWidth(1.0);
                glBegin(GL_LINE_LOOP);
                glVertex2f(right_x, by);
                glVertex2f(right_x + btn_w, by);
                glVertex2f(right_x + btn_w, by + btn_h);
                glVertex2f(right_x, by + btn_h);
                glEnd();
            }

            // 7. Restore Matrices & Attributes cleanly
            glMatrixMode(GL_PROJECTION);
            glPopMatrix();

            glMatrixMode(GL_MODELVIEW);
            glPopMatrix();

            glPopAttrib();
        }
    }
}

/// Invoked right before buffer presentation to draw the active overlay
pub fn present_overlay(width: i32, height: i32) {
    let mut guard = OVERLAY_RENDERER.lock().unwrap();
    if guard.is_none() {
        *guard = Some(OverlayRenderer::new());
        // Try hooking active window for input capture
        let _ = input_hook::hook_active_window();
    }

    if let Some(renderer) = guard.as_mut() {
        renderer.render(width, height);
    }
}
