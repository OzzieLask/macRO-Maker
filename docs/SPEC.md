# MacRO Maker — Spec

A downloadable macro / key-remap panel for Roblox players that makes gameplay more
accessible (e.g. play with IJKL instead of WASD, which Roblox itself can't rebind).
It can also act as a general-purpose remapper for other apps.

## Decisions (v1)

| Area | Decision |
| --- | --- |
| Stack | Tauri 2 (Rust backend + React/TypeScript UI) |
| Platform | Windows now; keep the input layer behind a trait so macOS can be added later |
| Remap rule | `I → W` blocks the physical I and sends W. Real W still works normally |
| Chat pause | Pressing `/` in the target window pauses remaps; `Enter` or `Esc` resumes |
| Targeting | Each folder has a target app (default `RobloxPlayerBeta.exe`); remaps only fire while that app is focused |
| Timer | Counts time **while Roblox is focused**; turns red past 1 hour |
| Active folder | Exactly one folder is active at a time; only its remaps run |
| Closing window | Minimizes to system tray; remaps keep running. Quit from tray menu |
| Kill switch | Global hotkey (default `F8`, configurable) toggles remapping; mirrors the status light |
| Mic toggle | Deferred (no Roblox mute hotkey exists; revisit later) |
| Macros (sequences) | Deferred past v1 |

## v1 features

1. **Remap folders** — home screen shows folders as tiles + a `+` tile. Layout grows with content.
2. **Key remaps** inside a folder — list of `from → to` pills, `+` to add (press-a-key capture).
3. **Chat pause** on `/`.
4. **Play-time timer** in folder header.
5. **Header controls** — settings, help/about, active/inactive light (on = remapping enabled).

## UI (from mockup)

- Dark panel (`#121214` bg, `#232327` surfaces), accent yellow (`#F2C14E`).
- Title "Mac**RO** Maker" with a glistening shine sweep over the wordmark.
- Font: Builder Sans isn't freely available → use a close Google font (Nunito Sans / Google Sans fallback).
- Folder view: `RO` badge (back to home), timer, hotkey list, add button.

## Architecture

```
src/                 React UI
src-tauri/src/
  main.rs / lib.rs   Tauri setup, commands, events to UI
  config.rs          Folders/remaps persisted as JSON in the app config dir
  engine.rs          Platform-neutral remap state (active folder, paused, enabled)
  platform/windows/
    hook.rs          WH_KEYBOARD_LL hook: match → block + SendInput (scancodes)
    focus.rs         SetWinEventHook(EVENT_SYSTEM_FOREGROUND) → focused exe name
```

- Injected events (`LLKHF_INJECTED`) are ignored by the hook so our own output never loops.
- Output uses scan codes, which Roblox reads reliably.

## Later

- Mic toggle, macro sequences, links to launch specific Roblox games, macOS support.
