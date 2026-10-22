import { formatDuration, Status } from "../api";
import { GearIcon, HelpIcon } from "./Icons";

interface Props {
  /** null on the home page (shows the big wordmark), otherwise the compact folder header. */
  onHome: ((from: HTMLElement) => void) | null;
  status: Status;
  onToggle: () => void;
  onSettings: () => void;
  onHelp: () => void;
}

export function Header({ onHome, status, onToggle, onSettings, onHelp }: Props) {
  const light = !status.enabled ? "off" : status.chatPaused ? "paused" : "on";
  const lightTitle = {
    on: "Remapping on — click (or press the toggle key) to turn off",
    paused: "Paused while chat is open — Enter or Esc to resume",
    off: "Remapping off — click to turn on",
  }[light];

  const timer = (
    <span
      className={`timer ${status.playSeconds >= 3600 ? "over" : ""}`}
      title="Time played while Roblox is focused"
    >
      {formatDuration(status.playSeconds)}
    </span>
  );

  return (
    <header className={onHome ? "header compact" : "header"}>
      {onHome ? (
        <div className="header-left">
          <button className="ro-badge" onClick={(e) => onHome(e.currentTarget)} title="Home">
            RO
          </button>
          {timer}
        </div>
      ) : (
        <h1 className="wordmark">
          Mac<span className="ro">RO</span> Maker
          {/* Shine is a separate layer over solid text, so the letters themselves never flicker. */}
          <span className="glint" aria-hidden>
            MacRO Maker
          </span>
        </h1>
      )}

      <div className="header-right">
        {!onHome && timer}
        <button className="icon-btn gear" onClick={onSettings} title="Settings">
          <GearIcon />
        </button>
        <button className="icon-btn help" onClick={onHelp} title="Help / About">
          <HelpIcon />
        </button>
        <button className={`status-light ${light}`} onClick={onToggle} title={lightTitle} />
      </div>
    </header>
  );
}
