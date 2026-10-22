import { useEffect, useState } from "react";
import { Folder, ROBLOX_EXE, Status } from "../api";
import { IconMaker } from "./IconMaker";
import { ArrowIcon, PlusIcon, TrashIcon } from "./Icons";
import { KeyCapture } from "./KeyCapture";
import { Thumbnail } from "./Thumbnail";

interface Props {
  folder: Folder;
  active: boolean;
  /** Just created: focus and select the name so it can be typed right away. */
  isNew: boolean;
  status: Status;
  onChange: (folder: Folder) => void;
  onActivate: () => void;
  onDelete: (from: HTMLElement) => void;
}

export function FolderView({ folder, active, isNew, status, onChange, onActivate, onDelete }: Props) {
  // Index of a row added this session that should start listening for its "from" key.
  const [fresh, setFresh] = useState<number | null>(null);
  // Deleting a folder takes two clicks; the armed state times out.
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const setRemap = (i: number, side: "from" | "to", code: string) => {
    const remaps = folder.remaps.map((r, j) => (j === i ? { ...r, [side]: code } : r));
    onChange({ ...folder, remaps });
  };
  const addRemap = () => {
    setFresh(folder.remaps.length);
    onChange({ ...folder, remaps: [...folder.remaps, { from: "", to: "" }] });
  };
  const removeRemap = (i: number) =>
    onChange({ ...folder, remaps: folder.remaps.filter((_, j) => j !== i) });

  return (
    <main className="folder">
      <div className="folder-meta">
        <button className="thumb-picker" onClick={() => setIconOpen(true)} title="Make an icon">
          <Thumbnail folder={folder} />
          <span className="thumb-overlay">{folder.thumbnail || folder.icon ? "Change" : "Make icon"}</span>
        </button>
        <div className="folder-title">
          <input
            className="folder-name"
            value={folder.name}
            onChange={(e) => onChange({ ...folder, name: e.target.value })}
            onFocus={(e) => isNew && e.target.select()}
            autoFocus={isNew}
            placeholder="Folder name"
            aria-label="Folder name"
          />
          <div className="folder-actions">
            <button className={`pill ${active ? "pill-on" : ""}`} onClick={onActivate} disabled={active}>
              {active ? "Active" : "Use this folder"}
            </button>
          </div>
        </div>
      </div>

      <label className="target">
        <span>Applies to</span>
        <input
          value={folder.targetExe}
          onChange={(e) => onChange({ ...folder, targetExe: e.target.value })}
          placeholder={ROBLOX_EXE}
          spellCheck={false}
        />
        {folder.targetExe !== ROBLOX_EXE && (
          <button className="link" onClick={() => onChange({ ...folder, targetExe: ROBLOX_EXE })}>
            Roblox
          </button>
        )}
      </label>

      <ul className="remaps">
        {folder.remaps.map((r, i) => (
          <li key={i} className="remap">
            <KeyCapture value={r.from} onChange={(c) => setRemap(i, "from", c)} autoListen={fresh === i && !r.from} />
            <span className="arrow">
              <ArrowIcon />
            </span>
            <KeyCapture value={r.to} onChange={(c) => setRemap(i, "to", c)} autoListen={fresh === i && !!r.from && !r.to} />
            <button className="icon-btn trash remove" onClick={() => removeRemap(i)} title="Remove remap">
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>

      <button className="add-row" onClick={addRemap} title="Add remap">
        <PlusIcon size={18} />
      </button>

      <footer className="folder-footer">
        <span className="hint">
          {active && status.targetFocused
            ? status.chatPaused
              ? "Chat open — remaps paused"
              : "Target focused — remaps live"
            : "Press / in game to chat; Enter or Esc resumes remaps"}
        </span>
        <button
          className={`icon-btn trash delete-folder ${confirmDelete ? "armed" : ""}`}
          onClick={(e) => (confirmDelete ? onDelete(e.currentTarget) : setConfirmDelete(true))}
          title="Delete folder"
        >
          <TrashIcon size={20} />
          {confirmDelete && <span>Click again to delete</span>}
        </button>
      </footer>
      {iconOpen && <IconMaker folder={folder} onChange={onChange} onClose={() => setIconOpen(false)} />}
    </main>
  );
}
