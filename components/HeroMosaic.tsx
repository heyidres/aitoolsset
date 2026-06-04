import Link from "next/link";
import { TOOLS } from "@/lib/tools";
import { Favicon } from "./Favicon";

export function HeroMosaic() {
  return (
    <div className="relative grid grid-cols-4 gap-3 content-center hero-right-mosaic">
      {TOOLS.map((t, i) => (
        <Link
          key={t.id}
          href={t.link}
          className={`mosaic-card-hover rounded p-4 flex flex-col items-center gap-2 text-center tnum ${i < 2 ? "featured" : ""}`}
        >
          <div
            className="w-10 h-10 rounded-[10px] overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,.1)" }}
          >
            <Favicon domain={t.domain} name={t.name} size={40} />
          </div>
          <div
            className="font-display text-[11px] font-bold w-full truncate"
            style={{ color: "rgba(255,255,255,.7)" }}
          >
            {t.name}
          </div>
          <div className="text-[10px]" style={{ color: "rgba(255,255,255,.3)" }}>
            {t.tags[0]}
          </div>
          {t.trending && t.trendPct ? (
            <div className="text-[10.5px] font-bold" style={{ color: "var(--blue-h)" }}>
              ↑{t.trendPct}%
            </div>
          ) : (
            <div className="text-[10.5px] font-bold" style={{ color: "var(--blue-h)" }}>
              ♥ {(t.saves / 1000).toFixed(1)}k
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
