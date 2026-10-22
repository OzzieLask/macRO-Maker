import { useCallback, useEffect, useRef, useState } from "react";
import { LogicalSize, getCurrentWindow } from "@tauri-apps/api/window";
import { flushSync } from "react-dom";
import {
  Config,
  Folder,
  ROBLOX_EXE,
  Status,
  getConfig,
  getStatus,
  onStatus,
  saveConfig,
  setEnabled,
} from "./api";
import { FolderView } from "./components/FolderView";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { KeyCapture } from "./components/KeyCapture";
import { Modal } from "./components/Modal";
import { averageColor, circleWipe } from "./transitions";
import "./App.css";

const ACCENT = "#f2c14e";

const EMPTY_STATUS: Status = {
  enabled: true,
  chatPaused: false,
  targetFocused: false,
  focusedExe: "",
  playSeconds: 0,
};

export default function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState<Status>(EMPTY_STATUS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [modal, setModal] = useState<"settings" | "help" | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  /** Switches view behind a circle wipe that starts from `from`. */
  const wipeTo = (from: HTMLElement, color: string, change: () => void) =>
    circleWipe(wipeRef.current!, from, color, () => flushSync(change));

  // The window has no fixed size: it follows the panel's natural size as content changes.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const win = getCurrentWindow();
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      win.setSize(new LogicalSize(Math.ceil(width), Math.ceil(height))).catch(console.error);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [config !== null]);

  useEffect(() => {
    getConfig().then(setConfig);
    getStatus().then(setStatus);
    const unlisten = onStatus(setStatus);
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const update = useCallback((next: Config) => {
    setConfig(next);
    saveConfig(next).catch((e) => console.error("save failed", e));
  }, []);

  if (!config) return null;
  const open = config.folders.find((f) => f.id === openId) ?? null;

  const openFolder = async (id: string, from: HTMLElement) => {
    const folder = config.folders.find((f) => f.id === id);
    const color = folder?.thumbnail
      ? await averageColor(folder.thumbnail, ACCENT)
      : (folder?.icon?.color ?? ACCENT);
    wipeTo(from, color, () => setOpenId(id));
  };

  const goHome = (from: HTMLElement) =>
    wipeTo(from, ACCENT, () => {
      setOpenId(null);
      setNewId(null);
    });

  const addFolder = (from: HTMLElement) => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: `Folder ${config.folders.length + 1}`,
      targetExe: ROBLOX_EXE,
      remaps: [],
      thumbnail: null,
    };
    wipeTo(from, ACCENT, () => {
      setNewId(folder.id);
      update({
        ...config,
        folders: [...config.folders, folder],
        activeFolder: config.activeFolder ?? folder.id,
      });
      setOpenId(folder.id);
    });
  };

  const changeFolder = (folder: Folder) =>
    update({ ...config, folders: config.folders.map((f) => (f.id === folder.id ? folder : f)) });

  const deleteFolder = (id: string, from: HTMLElement) =>
    wipeTo(from, "#e5484d", () => {
      const folders = config.folders.filter((f) => f.id !== id);
      const activeFolder = config.activeFolder === id ? (folders[0]?.id ?? null) : config.activeFolder;
      update({ ...config, folders, activeFolder });
      setOpenId(null);
      setNewId(null);
    });

  return (
    <div className="panel" ref={panelRef}>
      <Header
        onHome={open ? goHome : null}
        status={status}
        onToggle={() => setEnabled(!status.enabled)}
        onSettings={() => setModal("settings")}
        onHelp={() => setModal("help")}
      />

      {open ? (
        <FolderView
          key={open.id}
          folder={open}
          active={config.activeFolder === open.id}
          isNew={newId === open.id}
          status={status}
          onChange={changeFolder}
          onActivate={() => update({ ...config, activeFolder: open.id })}
          onDelete={(from) => deleteFolder(open.id, from)}
        />
      ) : (
        <Home config={config} onOpen={openFolder} onAdd={addFolder} />
      )}

      {modal === "settings" && (
        <Modal title="Settings" onClose={() => setModal(null)}>
          <div className="setting">
            <div>
              <strong>On / off hotkey</strong>
              <p>Toggles all remapping from anywhere, even in game.</p>
            </div>
            <KeyCapture value={config.toggleKey} onChange={(toggleKey) => update({ ...config, toggleKey })} />
          </div>
          <div className="setting">
            <div>
              <strong>Closing the window</strong>
              <p>MacRO Maker keeps running in the system tray. Right-click the tray icon to quit.</p>
            </div>
          </div>
        </Modal>
      )}

      {modal === "help" && (
        <Modal title="About MacRO Maker" onClose={() => setModal(null)}>
          <p>
            Remap keys for Roblox (or any app) to make games more accessible — for example, play with{" "}
            <b>IJKL</b> instead of <b>WASD</b>.
          </p>
          <ul className="help-list">
            <li>Each folder is a set of remaps for one app. One folder is active at a time.</li>
            <li>Remaps only run while the folder's app is focused.</li>
            <li>
              Pressing <b>/</b> opens Roblox chat and pauses remaps so you can type. <b>Enter</b> or <b>Esc</b>{" "}
              resumes.
            </li>
            <li>The yellow light means remapping is on. Click it or press the on/off hotkey to toggle.</li>
          </ul>
        </Modal>
      )}
      <div className="wipe" ref={wipeRef} aria-hidden />
    </div>
  );
}
