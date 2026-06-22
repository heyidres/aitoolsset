import { getTranslations } from "next-intl/server";
import { TRUSTED_LOGOS, favicon } from "@/lib/tools";

export async function TrustedTicker() {
  const t = await getTranslations("home");
  const items = [...TRUSTED_LOGOS, ...TRUSTED_LOGOS];
  return (
    <div
      className="bg-white"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="tb-fades flex items-center overflow-hidden" style={{ height: 52 }}>
        <div
          className="font-display font-bold text-[11.5px] uppercase tracking-[.08em] whitespace-nowrap px-8 flex-shrink-0"
          style={{ color: "var(--text-3)" }}
        >
          {t("trusted_by")}
        </div>
        <div className="flex-1 overflow-hidden">
          <div
            className="flex items-center animate-ticker"
            style={{ gap: 48, width: "max-content" }}
          >
            {items.map((l, i) => (
              <div
                key={`${l.name}-${i}`}
                className="flex items-center gap-2 flex-shrink-0 opacity-45 hover:opacity-75 transition-opacity"
                style={{ filter: "grayscale(1)" }}
              >
                <img
                  src={favicon(l.domain, 64)}
                  alt={l.name}
                  className="h-5 w-5 object-contain block rounded"
                />
                <span className="font-display text-[13px] font-bold whitespace-nowrap" style={{ color: "var(--text-2)" }}>
                  {l.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
