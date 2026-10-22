import { ReactNode } from "react";
import { FolderIcon } from "../api";

export const ICON_COLORS = [
  "#e5484d", // red
  "#f76b15", // orange
  "#f2c14e", // yellow
  "#99d52a", // lime
  "#30a46c", // green
  "#12a594", // teal
  "#00a2c7", // cyan
  "#3e63dd", // blue
  "#6e56cf", // indigo
  "#ab4aba", // purple
  "#e93d82", // pink
  "#8b8d98", // gray
];

/** Symbols in a 24×24 box. `fg` is the symbol color, `bg` the tile color (for cutouts). */
export const SYMBOLS: Record<string, (fg: string, bg: string) => ReactNode> = {
  circle: (fg) => <circle cx="12" cy="12" r="8" fill={fg} />,
  square: (fg) => <rect x="4.5" y="4.5" width="15" height="15" rx="3" fill={fg} />,
  triangle: (fg) => <Soft fg={fg} d="M12 4 20.5 19H3.5z" />,
  diamond: (fg) => <Soft fg={fg} d="M12 3 21 12 12 21 3 12z" />,
  star: (fg) => <Soft fg={fg} d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />,
  heart: (fg) => <path fill={fg} d="M12 20.5s-8.5-5-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 6-8.5 11-8.5 11z" />,
  bolt: (fg) => <Soft fg={fg} d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" />,
  crown: (fg) => <Soft fg={fg} d="M3.5 8l4.5 3.8L12 5.5l4 6.3L20.5 8 19 18.5H5z" />,
  smile: (fg, bg) => (
    <>
      <circle cx="12" cy="12" r="8.5" fill={fg} />
      <circle cx="9" cy="10" r="1.4" fill={bg} />
      <circle cx="15" cy="10" r="1.4" fill={bg} />
      <path d="M8.3 13.8a4.3 4.3 0 0 0 7.4 0" stroke={bg} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  ),
};

/** Filled path with rounded corners (a stroke in the same color softens the points). */
function Soft({ fg, d }: { fg: string; d: string }) {
  return <path d={d} fill={fg} stroke={fg} strokeWidth="1.6" strokeLinejoin="round" />;
}

/** The symbol is a darker shade of the tile color so the two always match. */
export const symbolColor = (color: string) => `color-mix(in srgb, ${color} 45%, #000)`;

export function IconArt({ icon, className = "" }: { icon: FolderIcon; className?: string }) {
  const draw = SYMBOLS[icon.symbol] ?? SYMBOLS.circle;
  return (
    <div className={`thumb thumb-icon ${className}`} style={{ background: icon.color }}>
      <svg viewBox="0 0 24 24" aria-hidden>
        {draw(symbolColor(icon.color), icon.color)}
      </svg>
    </div>
  );
}
