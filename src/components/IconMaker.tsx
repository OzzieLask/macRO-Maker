import { Folder, makeThumbnail } from "../api";
import { ICON_COLORS, SYMBOLS, symbolColor } from "./IconArt";
import { Modal } from "./Modal";
import { Thumbnail } from "./Thumbnail";

interface Props {
  folder: Folder;
  onChange: (folder: Folder) => void;
  onClose: () => void;
}

/** Pick a color + symbol for the folder's icon, or upload an image instead. Edits apply live. */
export function IconMaker({ folder, onChange, onClose }: Props) {
  const color = folder.icon?.color ?? ICON_COLORS[2];
  const symbol = folder.icon?.symbol ?? "star";
  // Choosing an icon replaces any uploaded image (and vice versa).
  const pick = (next: { color?: string; symbol?: string }) =>
    onChange({ ...folder, thumbnail: null, icon: { color, symbol, ...next } });

  return (
    <Modal title="Folder icon" onClose={onClose}>
      <div className="icon-maker">
        <div className="icon-preview">
          {/* Keyed so each new pick remounts and replays the pop animation. */}
          <Thumbnail key={`${folder.icon?.color}-${folder.icon?.symbol}`} folder={folder} />
        </div>

        <div className="icon-controls">
          <div className="swatches" role="radiogroup" aria-label="Color">
            {ICON_COLORS.map((c) => (
              <button
                key={c}
                className={`swatch ${folder.icon?.color === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => pick({ color: c })}
                role="radio"
                aria-checked={folder.icon?.color === c}
                aria-label={c}
              />
            ))}
          </div>

          <div className="symbols" role="radiogroup" aria-label="Symbol">
            {Object.entries(SYMBOLS).map(([name, draw]) => (
              <button
                key={name}
                className={`symbol ${folder.icon?.symbol === name ? "selected" : ""}`}
                onClick={() => pick({ symbol: name })}
                role="radio"
                aria-checked={folder.icon?.symbol === name}
                title={name}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                  {draw(folder.icon ? symbolColor(color) : "currentColor", "var(--surface)")}
                </svg>
              </button>
            ))}
          </div>

          <div className="icon-actions">
            <label className="pill">
              Upload image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) onChange({ ...folder, thumbnail: await makeThumbnail(file), icon: null });
                }}
              />
            </label>
            {(folder.thumbnail || folder.icon) && (
              <button className="link" onClick={() => onChange({ ...folder, thumbnail: null, icon: null })}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
