# MacRO Maker

Accessible key remapping for Roblox players — e.g. play with **IJKL** instead of WASD,
which Roblox itself won't let you rebind. Works as a general per-app remapper too.

See [docs/SPEC.md](docs/SPEC.md) for decisions and architecture.

## Develop

Requires Node 18+, Rust (stable, MSVC), and WebView2 (built into Windows 11).

```sh
npm install
npm run tauri dev        # run the app
cd src-tauri && cargo test   # engine unit tests
npm run tauri build      # installer in src-tauri/target/release/bundle
```

## Layout

- `src/` — React UI (home folders, folder editor, settings/help)
- `src-tauri/src/engine.rs` — platform-neutral remap logic (tested)
- `src-tauri/src/platform/windows.rs` — keyboard hook, focus tracking, SendInput
- `src-tauri/src/config.rs` — folders saved to `%APPDATA%\com.macro-maker.app\config.json`
