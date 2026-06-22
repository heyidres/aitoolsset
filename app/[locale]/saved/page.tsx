/**
 * /saved — the signed-in user's library of saved tools.
 *
 * Server-rendered. Reads from the `saved_tool` join table and
 * adapts each tool to the legacy `Tool` shape so the existing
 * <ToolCard> just works.
 */

import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { auth } from "@/lib/auth";
import { getSavedTools } from "@/lib/cms";
import { cmsToolToLegacy } from "@/lib/cms-adapters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your saved tools — AI Tools Set",
  description: "Tools you've saved across the directory. Sign in to sync across devices.",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <main>
        <Nav />
        <section className="px-9 py-24 section-pad-x">
          <div className="max-w-[680px] mx-auto text-center">
            <div style={{ fontSize: 48, marginBottom: 14 }}>🔒</div>
            <h1
              className="font-display font-black mb-3"
              style={{ fontSize: 36, letterSpacing: "-1.2px", lineHeight: 1.1 }}
            >
              Sign in to see your saved tools
            </h1>
            <p className="mb-7" style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.6 }}>
              Save any tool from the directory and access it here on every device. We never share or sell your library.
            </p>
            <Link
              href="/api/auth/signin?callbackUrl=/saved"
              className="font-display text-sm font-bold text-white px-7 py-[13px] rounded-pill inline-block"
              style={{ background: "var(--blue)" }}
            >
              Sign in with Google →
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const cmsSaved = await getSavedTools(user.id).catch(() => []);
  const tools = cmsSaved.map(cmsToolToLegacy);

  return (
    <main>
      <Nav />

      <section className="bg-white px-9 pt-14 pb-10 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto">
          <div
            className="font-display font-bold mb-3"
            style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)" }}
          >
            Your library
          </div>
          <h1
            className="font-display font-black mb-3"
            style={{ fontSize: 40, letterSpacing: "-1.4px", lineHeight: 1.05 }}
          >
            Saved tools
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>
            <strong className="tnum" style={{ color: "var(--text)", fontWeight: 800 }}>
              {tools.length}
            </strong>{" "}
            {tools.length === 1 ? "tool" : "tools"} saved · synced across every device you sign in on.
          </p>
        </div>
      </section>

      <section className="px-9 py-14 section-pad-x" style={{ background: "var(--cream)" }}>
        <div className="max-w-page mx-auto">
          {tools.length === 0 ? (
            <div
              className="rounded-lg p-12 text-center bg-white"
              style={{ border: "1px solid var(--border)" }}
            >
              <div style={{ fontSize: 38, marginBottom: 12 }}>🤍</div>
              <h2
                className="font-display font-extrabold mb-2"
                style={{ fontSize: 22, letterSpacing: "-.4px" }}
              >
                Nothing saved yet
              </h2>
              <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 460, margin: "0 auto 20px" }}>
                Browse the directory and click the heart on any tool to save it. It'll show up here.
              </p>
              <Link
                href="/"
                className="font-display text-sm font-bold text-white px-6 py-3 rounded-pill inline-block"
                style={{ background: "var(--blue)" }}
              >
                Browse the directory →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5 saved-row-3">
              {tools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
