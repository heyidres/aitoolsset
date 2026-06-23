import { Link } from "@/lib/i18n/navigation";

type Props = {
  eyebrow: string;
  title: string;
  sub?: string;
  link?: { label: string; href: string };
};

export function CategoriesSectionHeader({ eyebrow, title, sub, link }: Props) {
  return (
    <div className="flex items-end justify-between mb-9 gap-5 flex-wrap">
      <div>
        <div className="eyebrow mb-2" style={{ letterSpacing: ".09em" }}>
          {eyebrow}
        </div>
        <h2
          className="font-display font-black tracking-[-1.2px] leading-[1.1] mb-2"
          style={{ fontSize: 32 }}
        >
          {title}
        </h2>
        {sub && (
          <p className="text-[14.5px] leading-[1.55] max-w-[580px]" style={{ color: "var(--text-2)" }}>
            {sub}
          </p>
        )}
      </div>
      {link && (
        <Link
          href={link.href}
          className="font-display text-[13px] font-bold flex items-center gap-[5px] flex-shrink-0"
          style={{ color: "var(--blue)" }}
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}
