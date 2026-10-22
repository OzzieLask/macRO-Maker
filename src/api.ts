import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

/** Keys are `KeyboardEvent.code` strings, e.g. "KeyI", "ArrowUp". */
export interface Remap {
  from: string;
  to: string;
}

export interface Folder {
  id: string;
  name: string;
  targetExe: string;
  remaps: Remap[];
  /** Small JPEG data URL shown on the folder tile. */
  thumbnail?: string | null;
  /** Made-in-app icon, used when there's no thumbnail image. */
  icon?: FolderIcon | null;
}

export interface FolderIcon {
  color: string;
  symbol: string;
}

export interface Config {
  folders: Folder[];
  activeFolder: string | null;
  toggleKey: string;
}

export interface Status {
  enabled: boolean;
  chatPaused: boolean;
  targetFocused: boolean;
  focusedExe: string;
  playSeconds: number;
}

export const ROBLOX_EXE = "RobloxPlayerBeta.exe";

export const getConfig = () => invoke<Config>("get_config");
export const saveConfig = (config: Config) => invoke<void>("save_config", { config });
export const getStatus = () => invoke<Status>("get_status");
export const setEnabled = (enabled: boolean) => invoke<void>("set_enabled", { enabled });
export const onStatus = (cb: (s: Status) => void) => listen<Status>("status", (e) => cb(e.payload));

const NAMED: Record<string, string> = {
  Space: "Space",
  Enter: "Enter",
  Escape: "Esc",
  Tab: "Tab",
  Backspace: "Bksp",
  CapsLock: "Caps",
  ShiftLeft: "LShift",
  ShiftRight: "RShift",
  ControlLeft: "LCtrl",
  ControlRight: "RCtrl",
  AltLeft: "LAlt",
  AltRight: "RAlt",
  ArrowLeft: "←",
  ArrowUp: "↑",
  ArrowRight: "→",
  ArrowDown: "↓",
  PageUp: "PgUp",
  PageDown: "PgDn",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Backquote: "`",
  Comma: ",",
  Period: ".",
  Slash: "/",
};

/** Short label for a key code: "KeyI" -> "I", "Numpad5" -> "Num5". */
export function keyLabel(code: string): string {
  if (NAMED[code]) return NAMED[code];
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return "Num" + code.slice(6);
  return code;
}

/** "1:16:58" / "4:05" */
export function formatDuration(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Center-crops an image file to a small square JPEG data URL for folder tiles. */
export async function makeThumbnail(file: File, size = 256): Promise<string> {
  const img = await createImageBitmap(file);
  const side = Math.min(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas
    .getContext("2d")!
    .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
  img.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
