export function VerifiedBadge() {
  return (
    <span className="group/v relative inline-flex items-center cursor-help">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="block">
        <path
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z"
          fill="#1D9BF0"
        />
        <path d="M9 12l2 2.5 4.5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1 bottom-[calc(100%+7px)] opacity-0 group-hover/v:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap text-[11.5px] font-medium text-white px-[10px] py-[6px] rounded-[8px]"
        style={{ background: "var(--near-black)" }}
      >
        Verified by AI Tools Set team
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent"
          style={{ borderTopColor: "var(--near-black)" }}
        />
      </span>
    </span>
  );
}
