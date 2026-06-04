export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: 26, height: 26, background: "var(--blue)", borderRadius: 7 }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white" />
        <rect x="8" y="1" width="5" height="5" rx="1.2" fill="white" opacity=".5" />
        <rect x="1" y="8" width="5" height="5" rx="1.2" fill="white" opacity=".5" />
        <rect x="8" y="8" width="5" height="5" rx="1.2" fill="white" />
      </svg>
    </div>
  );
}
