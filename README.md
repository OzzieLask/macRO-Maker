# MacRO Maker

Accessible key remapping for Roblox players — e.g. play with **IJKL** instead of WASD,
which Roblox itself won't let you rebind. Works as a general per-app remapper too.

See [docs/SPEC.md](docs/SPEC.md) for decisions and architecture.

## Download

Grab the latest `MacRO Maker_x.y.z_x64-setup.exe` from
[Releases](https://github.com/OzzieLask/macRO-Maker/releases/latest) and run it (Windows 10/11).

The installer isn't code-signed, so Windows may say "Windows protected your PC".
Click **More info → Run anyway**.

## Releasing

1. Bump the version in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.
2. Commit, then tag and push: `git tag v0.1.0 && git push origin v0.1.0`.
3. GitHub Actions builds the installer into a **draft** release — review it and click Publish.

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
