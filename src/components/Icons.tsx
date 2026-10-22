export function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)" />
    </svg>
  );
}

export function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M12 2.5c-3.6 0-6.2 2.2-6.4 5.6h3.9c.1-1.4 1.1-2.3 2.5-2.3 1.4 0 2.4.9 2.4 2.1 0 1.1-.5 1.7-1.9 2.6-1.6 1-2.4 2.1-2.3 4v.9h3.8v-.7c0-1.1.4-1.7 1.9-2.6 1.6-1 2.6-2.3 2.6-4.3 0-3.2-2.7-5.3-6.5-5.3zM12 17.4a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2z" />
    </svg>
  );
}

export function PlusIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Rounded bin; the lid is its own group so CSS can flip it open on hover. */
export function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg className="trash-icon" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <g className="trash-lid">
        <rect x="3" y="4.5" width="18" height="3" rx="1.5" />
        <path d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7h-2.2v-.3a.4.4 0 0 0-.4-.4h-.8a.4.4 0 0 0-.4.4v.3z" />
      </g>
      <path
        fillRule="evenodd"
        d="M5 9h14l-1.1 10.6A2.7 2.7 0 0 1 15.2 22H8.8a2.7 2.7 0 0 1-2.7-2.4zm4.3 2.8a.9.9 0 0 0-.9 1l.4 5.6a.9.9 0 0 0 1.8-.1l-.4-5.6a.9.9 0 0 0-.9-.9zm5.4 0a.9.9 0 0 0-.9.9l-.4 5.6a.9.9 0 0 0 1.8.1l.4-5.6a.9.9 0 0 0-.9-1z"
      />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 16" width="24" height="16" fill="currentColor" aria-hidden>
      <path d="M0 6h14V0l10 8-10 8v-6H0z" />
    </svg>
  );
}
