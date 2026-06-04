export function DealRibbon({ label, expires }: { label: string; expires: string }) {
  return (
    <div
      className="group/d absolute top-3 left-0 z-[5] flex items-center gap-[5px] text-white font-display text-[10.5px] font-extrabold tracking-[.01em] px-3 py-1 pr-[10px] rounded-r-pill"
      style={{
        background: "linear-gradient(135deg,#f97316,#ef4444)",
        boxShadow: "0 2px 8px rgba(239,68,68,.35)",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
      {label}
      <span
        className="absolute top-[calc(100%+6px)] left-0 opacity-0 group-hover/d:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap text-[11.5px] font-medium text-white px-[10px] py-[6px] rounded-[8px]"
        style={{ background: "var(--near-black)" }}
      >
        Expires {expires}
        <span
          className="absolute left-[14px] bottom-full border-[5px] border-transparent"
          style={{ borderBottomColor: "var(--near-black)" }}
        />
      </span>
    </div>
  );
}
