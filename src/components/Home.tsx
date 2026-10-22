import { useEffect, useState } from "react";
import { Config } from "../api";
import { PlusIcon } from "./Icons";
import { Thumbnail } from "./Thumbnail";

interface Props {
  config: Config;
  onOpen: (id: string, from: HTMLElement) => void;
  onAdd: (from: HTMLElement) => void;
}

/**
 * Accordion of tiles: exactly one tile is expanded at a time (the "+" tile by default,
 * otherwise the hovered folder). Widths trade off one-for-one, so the row's total width
 * never changes and the auto-sized window stays still while you hover.
 */
export function Home({ config, onOpen, onAdd }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  // Everything starts collapsed, then the "+" tile springs open just after mount.
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 220);
    return () => clearTimeout(t);
  }, []);
  const expanded = opened ? (hover ?? "add") : null;

  return (
    <main
      className="home"
      // Reserve the expanded width up front so the auto-sized window doesn't jump on open.
      style={{ minWidth: `calc(240px + ${config.folders.length} * (38px + 22px))` }}
      onMouseLeave={() => setHover(null)}
    >
      <button
        className={`tile add-tile ${expanded === "add" ? "open" : ""}`}
        onMouseEnter={() => setHover("add")}
        onClick={(e) => onAdd(e.currentTarget)}
        title="New folder"
      >
        <span className="add-plus">
          <PlusIcon size={96} />
        </span>
      </button>

      {config.folders.map((f) => (
        <button
          key={f.id}
          className={`tile folder-tile ${expanded === f.id ? "open" : ""} ${config.activeFolder === f.id ? "active" : ""}`}
          onMouseEnter={() => setHover(f.id)}
          onFocus={() => setHover(f.id)}
          onClick={(e) => onOpen(f.id, e.currentTarget)}
          aria-label={`Open ${f.name}`}
        >
          <Thumbnail folder={f} />
          <span className="tile-shade" />
          <span className="spine-name">{f.name}</span>
          <span className="tile-caption">
            <span className="tile-name">{f.name}</span>
            <span className="tile-sub">
              {config.activeFolder === f.id ? "Active · " : ""}
              {f.remaps.length} remap{f.remaps.length === 1 ? "" : "s"}
            </span>
          </span>
        </button>
      ))}
    </main>
  );
}
