//! OS-specific input layer. Each platform installs a global key hook that defers to
//! `engine::ENGINE`, tracks the focused app, and can check whether a process is running.

/// Called (from the hook thread) whenever status visible in the UI changes.
pub type Notify = Box<dyn Fn() + Send + Sync>;

#[cfg(windows)]
mod windows;
#[cfg(windows)]
pub use windows::{is_running, start};

#[cfg(not(windows))]
pub fn start(_notify: Notify) {}

#[cfg(not(windows))]
pub fn is_running(_exe: &str) -> bool {
    false
}
