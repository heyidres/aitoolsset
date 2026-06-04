/**
 * /search?q=… — full-text-ish search across the tool directory.
 *
 * Searches both DB-managed tools (via Postgres ILIKE across name,
 * tagline, description, tags, domain) AND the hardcoded seed list
 * (in-memory filter). Results are deduped by slug — DB rows win
 * on conflict. Sorted by saves, then name.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS, type Tool } from "@/lib/tools";
import { searchTools } from "@/lib/cms";
import { cmsToolToLegacy } from "@/lib/cms-adapters";
import { SearchInput } from "./SearchInput";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = { q?: string | string[] };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim();
  return {
    title: query ? `Search: ${query} — AI Tools Set` : "Search — AI Tools Set",
    description: query
      ? `AI tools matching "${query}" — curated from the AI Tools Set directory.`
      : "Search 2,400+ AI tools across 48 categories.",
    robots: { index: false, follow: true },
  };
}

function filterHardcoded(query: string): Tool[] {
  const q = query.toLowerCase();
  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.domain.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim();

  let results: Tool[] = [];
  if (query.length >= 2) {
    const [cmsHits, hardcodedHits] = await Promise.all([
      searchTools(query).catch(() => []),
      Promise.resolve(filterHardcoded(query)),
    ]);

    // Dedupe by slug. DB rows win when both sources have the same tool.
    const merged = new Map<string, Tool>();
    for (const t of hardcodedHits) merged.set(t.id, t);
    for (const c of cmsHits) merged.set(c.slug, cmsToolToLegacy(c));

    results = Array.from(merged.values()).sort((a, b) => b.saves - a.saves);
  }

  return (
    <main>
      <Nav />

      <section className="bg-white px-9 pt-14 pb-10 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-page mx-auto">
          <h1
            className="font-display font-black mb-4"
            style={{ fontSize: 38, letterSpacing: "-1.2px", lineHeight: 1.1 }}
          >
            {query ? <>Results for &ldquo;<span style={{ color: "var(--blue)" }}>{query}</span>&rdquo;</> : "Search the AI Tools Set directory"}
          </h1>
          <SearchInput defaultValue={query} />
          {query && (
            <div className="mt-3 text-sm" style={{ color: "var(--text-3)" }}>
              <strong className="tnum" style={{ color: "var(--text-2)", fontWeight: 700 }}>
                {results.length}
              </strong>{" "}
              {results.length === 1 ? "tool" : "tools"} matched
            </div>
          )}
        </div>
      </section>

      <section className="px-9 py-14 section-pad-x">
        <div className="max-w-page mx-auto">
          {!query ? (
            <EmptyHint />
          ) : results.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <div className="grid grid-cols-3 gap-5 search-row-3">
              {results.map((t) => (
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

function EmptyHint() {
  return (
    <div className="rounded-lg p-12 text-center" style={{ background: "var(--cream)", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔎</div>
      <h2 className="font-display font-extrabold mb-2" style={{ fontSize: 22, letterSpacing: "-.4px" }}>
        Type a query to start
      </h2>
      <p style={{ color: "var(--text-2)", fontSize: 14 }}>
        Try a tool name (&ldquo;Cursor&rdquo;), a category (&ldquo;image generation&rdquo;), or a use case (&ldquo;voice cloning&rdquo;).
      </p>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="rounded-lg p-12 text-center bg-white" style={{ border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🫥</div>
      <h2 className="font-display font-extrabold mb-2" style={{ fontSize: 22, letterSpacing: "-.4px" }}>
        No tools match &ldquo;{query}&rdquo;
      </h2>
      <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 18 }}>
        Try a broader keyword or browse by category.
      </p>
      <Link href="/categories" className="font-display text-sm font-bold px-5 py-3 rounded-pill inline-block" style={{ background: "var(--blue)", color: "#fff" }}>
        Browse all 48 categories →
      </Link>
    </div>
  );
}
