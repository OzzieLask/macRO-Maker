mod config;
mod engine;
mod keys;
mod platform;

use config::Config;
use engine::{ENGINE, Status};
use std::path::PathBuf;
use std::sync::{Mutex, mpsc};
use std::time::Duration;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, State, WindowEvent};

struct AppState {
    config: Mutex<Config>,
    path: PathBuf,
}

fn emit_status(app: &AppHandle) {
    let status = ENGINE.lock().unwrap().status();
    let _ = app.emit("status", status);
}

#[tauri::command]
fn get_config(state: State<AppState>) -> Config {
    state.config.lock().unwrap().clone()
}

#[tauri::command]
fn save_config(app: AppHandle, state: State<AppState>, config: Config) -> Result<(), String> {
    ENGINE.lock().unwrap().apply_config(&config);
    config.save(&state.path).map_err(|e| e.to_string())?;
    *state.config.lock().unwrap() = config;
    emit_status(&app);
    Ok(())
}

#[tauri::command]
fn get_status() -> Status {
    ENGINE.lock().unwrap().status()
}

#[tauri::command]
fn set_enabled(app: AppHandle, enabled: bool) {
    ENGINE.lock().unwrap().enabled = enabled;
    emit_status(&app);
}

fn show_main(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
    }
}

fn setup_tray(app: &tauri::App) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "Open MacRO Maker", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &quit])?;
    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("MacRO Maker")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => show_main(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main(tray.app_handle());
            }
        })
        .build(app)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let path = app.path().app_config_dir()?.join("config.json");
            let config = Config::load(&path);
            ENGINE.lock().unwrap().apply_config(&config);
            app.manage(AppState { config: Mutex::new(config), path });

            // Hook thread -> UI status updates (F8 toggle, chat pause, focus changes).
            let (tx, rx) = mpsc::channel::<()>();
            platform::start(Box::new(move || {
                let _ = tx.send(());
            }));
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                while rx.recv().is_ok() {
                    emit_status(&handle);
                }
            });

            // Play-time timer.
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    std::thread::sleep(Duration::from_secs(1));
                    let target = ENGINE.lock().unwrap().target_exe().to_string();
                    let running = !target.is_empty() && platform::is_running(&target);
                    ENGINE.lock().unwrap().tick(running);
                    emit_status(&handle);
                }
            });

            setup_tray(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            // Closing hides to the tray; remaps keep running. Quit from the tray menu.
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![get_config, save_config, get_status, set_enabled])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
