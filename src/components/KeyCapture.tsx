import { useEffect, useState } from "react";
import { keyLabel } from "../api";

interface Props {
  value: string;
  onChange: (code: string) => void;
  /** Start in listening mode (used for freshly added rows). */
  autoListen?: boolean;
  className?: string;
}

/** A key bubble: click it, then press any key to set it. Esc cancels. */
export function KeyCapture({ value, onChange, autoListen = false, className = "" }: Props) {
  const [listening, setListening] = useState(autoListen);

  useEffect(() => {
    if (!listening) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setListening(false);
      if (e.code !== "Escape" || !value) onChange(e.code);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [listening, value, onChange]);

  return (
    <button
      type="button"
      className={`keycap ${listening ? "listening" : ""} ${className}`}
      autoFocus={autoListen}
      onClick={() => setListening(true)}
      onBlur={() => setListening(false)}
      title={listening ? "Press a key (Esc to cancel)" : "Click to change"}
    >
      {listening ? "…" : value ? keyLabel(value) : "?"}
    </button>
  );
}
