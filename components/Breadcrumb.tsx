import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items, theme = "dark" }: { items: Crumb[]; theme?: "dark" | "light" }) {
  const isDark = theme === "dark";
  const linkColor = isDark ? "rgba(255,255,255,.55)" : "var(--text-2)";
  const sepColor = isDark ? "rgba(255,255,255,.2)" : "var(--text-3)";
  const currentColor = isDark ? "#fff" : "var(--text)";
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-[12.5px] font-medium mb-6 flex-wrap"
      style={{ color: linkColor }}
    >
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="flex items-center gap-2">
            {c.href && !last ? (
              <Link href={c.href} className="transition-colors hover:text-white" style={{ color: linkColor }}>
                {c.label}
              </Link>
            ) : (
              <span style={{ color: last ? currentColor : linkColor }}>{c.label}</span>
            )}
            {!last && <span style={{ color: sepColor }}>/</span>}
          </span>
        );
      })}
    </nav>
  );
}
