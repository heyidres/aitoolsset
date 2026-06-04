import { Favicon } from "./Favicon";

type Tool = { name: string; domain: string; tag: string };
type UseCase = { name: string; desc: string; label: string; grad: string };

type Props = {
  bg: string;
  badge: string;
  title: React.ReactNode;
  description: string;
  tools: Tool[];
  cases: UseCase[];
  imageSide: "left" | "right";
};

export function UseCaseBlock({ bg, badge, title, description, tools, cases, imageSide }: Props) {
  const imgFirst = imageSide === "left";
  return (
    <section className="py-[72px] px-9 section-pad-x" style={{ background: bg, borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-page mx-auto">
        <div className="grid grid-cols-[320px_1fr] gap-14 items-start usecase-grid-split">
          <div data-order={imgFirst ? "2" : "1"} style={{ order: imgFirst ? 2 : 1 }}>
            <div
              className="inline-flex items-center gap-[6px] rounded-pill px-[13px] py-[5px] font-display text-xs font-bold tracking-[.04em] mb-4"
              style={{
                background: "var(--blue-soft)",
                border: "1px solid rgba(0,82,255,.15)",
                color: "var(--blue)",
              }}
            >
              {badge}
            </div>
            <h2
              className="font-display font-black tracking-[-1px] leading-[1.1] mb-[14px]"
              style={{ fontSize: 32 }}
            >
              {title}
            </h2>
            <p className="text-[14.5px] leading-[1.65] mb-6" style={{ color: "var(--text-2)" }}>
              {description}
            </p>
            <div className="flex flex-col">
              {tools.map((t) => (
                <div
                  key={t.name}
                  className="ut-row-hover usecase-tools-row flex items-center gap-3 py-3 cursor-pointer"
                >
                  <div
                    className="w-8 h-8 rounded-[7px] overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <Favicon domain={t.domain} name={t.name} size={32} />
                  </div>
                  <div className="ut-name-h font-display text-[13.5px] font-bold">{t.name}</div>
                  <span className="text-[11px] ml-auto" style={{ color: "var(--text-3)" }}>
                    {t.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div data-order={imgFirst ? "1" : "2"} style={{ order: imgFirst ? 1 : 2 }}>
            <div className="grid grid-cols-2 gap-3">
              {cases.map((c) => (
                <div
                  key={c.name}
                  className="uc-card-hover rounded-lg overflow-hidden cursor-pointer tnum"
                >
                  <div
                    className="flex items-center justify-center relative overflow-hidden"
                    style={{ height: 120, background: c.grad }}
                  >
                    <div
                      className="font-display font-black text-white"
                      style={{ fontSize: 32, letterSpacing: "-1px", opacity: 0.25 }}
                    >
                      {c.label}
                    </div>
                  </div>
                  <div className="px-4 py-[14px]">
                    <div className="font-display font-extrabold text-sm mb-1">{c.name}</div>
                    <div className="text-xs leading-[1.45]" style={{ color: "var(--text-2)" }}>
                      {c.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
