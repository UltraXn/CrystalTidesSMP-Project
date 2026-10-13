
pub struct MenuButton {
    pub label: &'static str,
    pub description: &'static str,
    pub icon_symbol: &'static str,
    pub action_url: Option<&'static str>,
}

pub const SERVER_SHORTCUTS: &[MenuButton] = &[
    MenuButton {
        label: "Tienda Oficial",
        description: "Ranks, cosmeticos y pases de batalla",
        icon_symbol: "💎",
        action_url: Some("https://tienda.crystaltides.net"),
    },
    MenuButton {
        label: "Discord Comunidad",
        description: "Eventos en vivo, soporte y chat de voz",
        icon_symbol: "💬",
        action_url: Some("https://discord.gg/crystaltides"),
    },
    MenuButton {
        label: "Mapa Dinamico (BlueMap)",
        description: "Explora construcciones y biomas en tiempo real",
        icon_symbol: "🗺️",
        action_url: Some("https://mapa.crystaltides.net"),
    },
    MenuButton {
        label: "Wiki & Recetas",
        description: "Guia oficial de encantamientos y dungeons",
        icon_symbol: "📖",
        action_url: Some("https://wiki.crystaltides.net"),
    },
];

pub struct ServerMenuState {
    pub selected_tab: u32,
    pub eco_qos_bypass_active: bool,
    pub frame_gen_active: bool,
    pub instant_replay_ready: bool,
}

impl Default for ServerMenuState {
    fn default() -> Self {
        Self::new()
    }
}

impl ServerMenuState {
    pub fn new() -> Self {
        Self {
            selected_tab: 0,
            eco_qos_bypass_active: true,
            frame_gen_active: true,
            instant_replay_ready: true,
        }
    }

    pub fn toggle_frame_gen(&mut self) -> bool {
        self.frame_gen_active = !self.frame_gen_active;
        crate::fsr::update_fsr_config(crate::fsr::FsrConfig {
            enabled: true,
            frame_gen_enabled: self.frame_gen_active,
            render_scale: 1.0,
            target_fps: 144,
            sharpness: 0.8,
            motion_vector_mode: "OpticalFlowEstimated".to_string(),
        });
        self.frame_gen_active
    }

    pub fn toggle_instant_replay(&mut self) -> bool {
        self.instant_replay_ready = !self.instant_replay_ready;
        self.instant_replay_ready
    }

    pub fn select_tab(&mut self, tab: u32) -> bool {
        if tab <= 2 {
            self.selected_tab = tab;
            true
        } else {
            false
        }
    }

    pub fn toggle_eco_qos(&mut self) -> bool {
        self.eco_qos_bypass_active = !self.eco_qos_bypass_active;
        let _ = crate::thread_qos::optimize_current_thread(self.eco_qos_bypass_active);
        self.eco_qos_bypass_active
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_server_shortcuts_integrity() {
        assert_eq!(SERVER_SHORTCUTS.len(), 4);
        for shortcut in SERVER_SHORTCUTS {
            assert!(!shortcut.label.is_empty());
            assert!(!shortcut.description.is_empty());
            if let Some(url) = shortcut.action_url {
                assert!(url.starts_with("https://"), "Shortcut URL must use HTTPS: {}", url);
            }
        }
    }

    #[test]
    fn test_server_menu_defaults() {
        let menu = ServerMenuState::default();
        assert_eq!(menu.selected_tab, 0);
        assert!(menu.eco_qos_bypass_active);
        assert!(menu.frame_gen_active);
        assert!(menu.instant_replay_ready);
    }

    #[test]
    fn test_server_menu_toggle_instant_replay() {
        let mut menu = ServerMenuState::new();
        assert!(menu.instant_replay_ready);
        let updated = menu.toggle_instant_replay();
        assert!(!updated);
        assert!(!menu.instant_replay_ready);
    }

    #[test]
    fn test_server_menu_select_tab_bounds() {
        let mut menu = ServerMenuState::new();
        assert!(menu.select_tab(1));
        assert_eq!(menu.selected_tab, 1);

        // Out of bounds tab (> 2) should be rejected
        assert!(!menu.select_tab(99));
        assert_eq!(menu.selected_tab, 1);
    }
}

