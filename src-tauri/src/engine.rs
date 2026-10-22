//! Platform-neutral remapping state. The OS keyboard hook asks `on_key` what to do
//! with every physical key event; everything here is plain logic so it can be tested.

use crate::config::Config;
use crate::keys::{self, VK_ENTER, VK_ESCAPE, VK_SLASH};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

pub static ENGINE: LazyLock<Mutex<Engine>> = LazyLock::new(|| {
    Mutex::new(Engine { enabled: true, ..Default::default() })
});

#[derive(Debug, PartialEq, Eq)]
pub enum Action {
    /// Let the original key through untouched.
    Pass,
    /// Swallow the original key and send this virtual key instead (same up/down direction).
    Send(u16),
}

#[derive(Default)]
pub struct Engine {
    pub enabled: bool,
    pub chat_paused: bool,
    pub focused_exe: String,
    target_exe: String,
    remaps: HashMap<u16, u16>,
    toggle_vk: u16,
    toggle_down: bool,
    /// Physical keys currently held down that we remapped -> the key we sent for them.
    /// Their key-up is always translated, even if remapping was disabled mid-press,
    /// so the game never ends up with a stuck key.
    held: HashMap<u16, u16>,
    pub play_seconds: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub enabled: bool,
    pub chat_paused: bool,
    pub target_focused: bool,
    pub focused_exe: String,
    pub play_seconds: u64,
}

impl Engine {
    pub fn apply_config(&mut self, cfg: &Config) {
        self.toggle_vk = keys::code_to_vk(&cfg.toggle_key).unwrap_or(0);
        let active = cfg.active();
        let target = active.map(|f| f.target_exe.clone()).unwrap_or_default();
        if !target.eq_ignore_ascii_case(&self.target_exe) {
            self.play_seconds = 0;
        }
        self.target_exe = target;
        self.remaps = active
            .map(|f| {
                f.remaps
                    .iter()
                    .filter_map(|r| Some((keys::code_to_vk(&r.from)?, keys::code_to_vk(&r.to)?)))
                    .collect()
            })
            .unwrap_or_default();
    }

    pub fn target_exe(&self) -> &str {
        &self.target_exe
    }

    pub fn target_focused(&self) -> bool {
        !self.target_exe.is_empty() && self.focused_exe.eq_ignore_ascii_case(&self.target_exe)
    }

    pub fn set_focused(&mut self, exe: String) {
        if exe != self.focused_exe {
            // Chat almost certainly closed if the user tabbed away.
            self.chat_paused = false;
            self.focused_exe = exe;
        }
    }

    /// Returns what to do with the key, and whether visible status changed.
    pub fn on_key(&mut self, vk: u16, down: bool) -> (Action, bool) {
        if let Some(&out) = self.held.get(&vk) {
            if !down {
                self.held.remove(&vk);
            }
            return (Action::Send(out), false);
        }

        if vk == self.toggle_vk && vk != 0 {
            let changed = down && !self.toggle_down;
            if changed {
                self.enabled = !self.enabled;
            }
            self.toggle_down = down;
            return (Action::Pass, changed);
        }

        if !self.enabled || !self.target_focused() {
            return (Action::Pass, false);
        }

        if self.chat_paused {
            if down && (vk == VK_ENTER || vk == VK_ESCAPE) {
                self.chat_paused = false;
                return (Action::Pass, true);
            }
            return (Action::Pass, false);
        }

        if let Some(&out) = self.remaps.get(&vk) {
            if down {
                self.held.insert(vk, out);
            }
            return (Action::Send(out), false);
        }

        if down && vk == VK_SLASH {
            self.chat_paused = true;
            return (Action::Pass, true);
        }

        (Action::Pass, false)
    }

    /// Called once per second.
    pub fn tick(&mut self, target_running: bool) {
        if !target_running {
            self.play_seconds = 0;
        } else if self.target_focused() {
            self.play_seconds += 1;
        }
    }

    pub fn status(&self) -> Status {
        Status {
            enabled: self.enabled,
            chat_paused: self.chat_paused,
            target_focused: self.target_focused(),
            focused_exe: self.focused_exe.clone(),
            play_seconds: self.play_seconds,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::{Folder, Remap};

    const I: u16 = 0x49;
    const W: u16 = 0x57;
    const F8: u16 = 0x77;

    fn engine() -> Engine {
        let mut e = Engine { enabled: true, ..Default::default() };
        e.apply_config(&Config {
            folders: vec![Folder {
                id: "f".into(),
                name: "Test".into(),
                target_exe: "RobloxPlayerBeta.exe".into(),
                remaps: vec![Remap { from: "KeyI".into(), to: "KeyW".into() }],
                thumbnail: None,
                icon: None,
            }],
            active_folder: Some("f".into()),
            toggle_key: "F8".into(),
        });
        e.set_focused("RobloxPlayerBeta.exe".into());
        e
    }

    #[test]
    fn remaps_only_when_target_focused() {
        let mut e = engine();
        assert_eq!(e.on_key(I, true).0, Action::Send(W));
        assert_eq!(e.on_key(I, false).0, Action::Send(W));
        e.set_focused("notepad.exe".into());
        assert_eq!(e.on_key(I, true).0, Action::Pass);
    }

    #[test]
    fn original_target_key_still_works() {
        let mut e = engine();
        assert_eq!(e.on_key(W, true).0, Action::Pass);
    }

    #[test]
    fn slash_pauses_until_enter_or_escape() {
        let mut e = engine();
        assert_eq!(e.on_key(VK_SLASH, true), (Action::Pass, true));
        assert_eq!(e.on_key(I, true).0, Action::Pass);
        e.on_key(I, false);
        e.on_key(VK_ESCAPE, true);
        assert_eq!(e.on_key(I, true).0, Action::Send(W));
    }

    #[test]
    fn key_up_translated_after_disable() {
        let mut e = engine();
        assert_eq!(e.on_key(I, true).0, Action::Send(W));
        assert_eq!(e.on_key(F8, true), (Action::Pass, true));
        assert!(!e.enabled);
        assert_eq!(e.on_key(I, false).0, Action::Send(W));
        assert_eq!(e.on_key(I, true).0, Action::Pass);
    }

    #[test]
    fn toggle_ignores_autorepeat() {
        let mut e = engine();
        e.on_key(F8, true);
        e.on_key(F8, true);
        assert!(!e.enabled);
        e.on_key(F8, false);
        e.on_key(F8, true);
        assert!(e.enabled);
    }

    #[test]
    fn timer_counts_focused_time_and_resets_on_exit() {
        let mut e = engine();
        e.tick(true);
        e.set_focused("explorer.exe".into());
        e.tick(true);
        assert_eq!(e.play_seconds, 1);
        e.tick(false);
        assert_eq!(e.play_seconds, 0);
    }
}
