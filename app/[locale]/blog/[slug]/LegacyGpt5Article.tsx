/**
 * Legacy hardcoded GPT-5 demo article. Lives at the slug
 * `gpt-5-complete-guide`. Kept around so the original demo
 * stays available while editors build out real content via
 * /portal-admin/blog. The router in page.tsx dispatches here when
 * that exact slug is requested.
 */

import { Link } from "@/lib/i18n/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Favicon } from "@/components/Favicon";

export const LEGACY_METADATA = {
  title: "GPT-5 Complete Guide: Everything You Need to Know — AI Tools Set Blog",
  description:
    "OpenAI's GPT-5 brings a 1M token context window, native web access, and dramatically improved reasoning. We tested it for 2 weeks — here's our complete guide.",
};

const TAGS = ["GPT-5", "OpenAI", "ChatGPT", "LLMs", "AI Reviews", "Guides", "Claude 4"];

const RELATED_ARTICLES = [
  { tag: "Comparison · 12 min", title: "ChatGPT vs Claude 4 in 2026: which AI should you use?", img: "vs Claude", grad: "linear-gradient(135deg,#1a0533,#4c1d95)", author: "Sarah Park", initials: "SP", date: "May 1", slug: "chatgpt-vs-claude-4" },
  { tag: "Comparison · 11 min", title: "Cursor vs GitHub Copilot: an honest comparison after 3 months", img: "Cursor", grad: "linear-gradient(135deg,#0f172a,#1e3a5f)", author: "Mike Liu", initials: "ML", date: "Apr 22", slug: "cursor-vs-copilot" },
  { tag: "Guide · 9 min", title: "The 7 best free AI tools for marketers in 2026", img: "Tools", grad: "linear-gradient(135deg,#022c22,#065f46)", author: "Priya Nair", initials: "PN", date: "Apr 25", slug: "best-free-ai-marketing-tools" },
];

const COMMENTS = [
  { name: "Maria Costa", role: "Product Manager", date: "May 5, 2026", text: "The 1M token context window is genuinely a game-changer for my workflow. I've been pasting entire codebases and getting genuinely useful refactor suggestions. Worth every cent of Plus.", bg: "#dbeafe", fg: "#1d4ed8", initials: "MC", likes: 14 },
  { name: "Tom Reed", role: "Engineering Lead", date: "May 5, 2026", text: "Great comparison with Claude 4 — matches my experience. I run both side-by-side and pay for both. For me, it's Claude for writing, GPT-5 for code.", bg: "#fce7f3", fg: "#db2777", initials: "TR", likes: 8 },
];

export default function LegacyGpt5Article() {
  return (
    <main>
      <Nav />
      <ReadingProgress />

      <section className="bg-white px-9 pt-12 pb-10 section-pad-x" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[760px] mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12.5px] font-medium mb-[22px] flex-wrap" style={{ color: "var(--text-3)" }}>
            <Link href="/" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>
              Home
            </Link>
            <span style={{ color: "var(--border-2)" }}>/</span>
            <Link href="/blog" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>
              Blog
            </Link>
            <span style={{ color: "var(--border-2)" }}>/</span>
            <Link href="/blog" className="transition-colors hover:text-blue" style={{ color: "var(--text-3)" }}>
              Guides
            </Link>
            <span style={{ color: "var(--border-2)" }}>/</span>
            <span style={{ color: "var(--text-2)" }}>GPT-5 Complete Guide</span>
          </nav>

          <div
            className="inline-flex items-center gap-[6px] rounded-pill px-3 py-[5px] font-display text-[11.5px] font-extrabold uppercase tracking-[.07em] mb-4"
            style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.18)", color: "var(--blue)" }}
          >
            📘 In-depth guide
          </div>
          <h1
            className="mb-[18px]"
            style={{
              fontFamily: "var(--font-lora), Georgia, serif",
              fontSize: "clamp(36px, 4.2vw, 52px)",
              fontWeight: 600,
              letterSpacing: "-1px",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            GPT-5 Complete Guide: Everything you need to know about OpenAI's most powerful model
          </h1>
          <p className="text-lg leading-[1.65] mb-[30px] font-normal" style={{ color: "var(--text-2)" }}>
            OpenAI's GPT-5 has finally arrived with a 1M token context window, native web access, and dramatically improved reasoning. We tested it for two weeks across writing, code, analysis, and creative tasks — here's our complete verdict.
          </p>
          <div className="flex items-center gap-[14px] flex-wrap">
            <div className="flex items-center gap-[10px]">
              <div
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white font-display text-sm font-extrabold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)" }}
              >
                AJ
              </div>
              <div className="flex flex-col">
                <div className="font-display text-sm font-extrabold" style={{ color: "var(--text)" }}>
                  Alex Johnson
                </div>
                <div className="text-xs" style={{ color: "var(--text-3)" }}>
                  Senior Editor · AI Tools Set
                </div>
              </div>
            </div>
            <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
            <div className="text-[13px] flex items-center gap-[5px] font-medium" style={{ color: "var(--text-2)" }}>
              📅 May 4, 2026
            </div>
            <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
            <div className="text-[13px] flex items-center gap-[5px] font-medium" style={{ color: "var(--text-2)" }}>
              ⏱️ 8 min read
            </div>
            <span className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--border-2)" }} />
            <div className="text-[13px] flex items-center gap-[5px] font-medium tnum" style={{ color: "var(--text-2)" }}>
              👁️ 18,420 views
            </div>
          </div>
        </div>
      </section>

      {/* Hero image */}
      <div className="max-w-[1080px] mx-auto px-9 section-pad-x">
        <div
          className="rounded-lg relative overflow-hidden flex items-center justify-center mt-8"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0052ff 100%)", height: 420 }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              top: -100,
              right: -80,
              width: 400,
              height: 400,
              background: "radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 60%)",
            }}
          />
          <div
            className="font-display font-black relative"
            style={{ fontSize: 120, letterSpacing: "-4px", color: "rgba(255,255,255,.12)" }}
          >
            GPT-5
          </div>
          <div
            className="absolute bottom-[14px] left-[14px] backdrop-blur-md font-display text-[11px] font-bold uppercase tracking-[.07em] px-3 py-[5px] rounded-pill"
            style={{ background: "rgba(0,0,0,.55)", color: "rgba(255,255,255,.7)" }}
          >
            Illustration · AI Tools Set
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-[1320px] mx-auto px-9 py-12 grid grid-cols-[minmax(0,1fr)_320px] gap-14 items-start blog-layout-grid section-pad-x">
        <article className="article-body min-w-0">
          <p>
            OpenAI quietly rolled out <strong>GPT-5</strong> to ChatGPT Plus users on May 1, 2026 — and after two weeks of daily use, our team can confidently say: this is the largest leap forward since GPT-4. The model isn't just better at the things GPT-4o did well. It can do <em>entirely new things</em> — multi-hour reasoning chains, codebase-scale refactoring, and real-time web research with citations that actually check out.
          </p>

          <p>
            This guide walks through everything we tested: <a href="#whats-new">what's new in GPT-5</a>, <a href="#benchmarks">benchmark results</a>, <a href="#use-cases">use cases we recommend</a>, <a href="#pricing">pricing and access</a>, and <a href="#vs-claude">how it compares to Claude 4</a> — Anthropic's competing flagship.
          </p>

          {/* Highlight box */}
          <div
            className="rounded-lg p-6 my-7 flex gap-4 items-start"
            style={{ background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.18)" }}
          >
            <div
              className="w-9 h-9 rounded-[10px] text-white flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: "var(--blue)" }}
            >
              💡
            </div>
            <div className="flex-1">
              <div className="font-display text-sm font-extrabold mb-[6px]" style={{ color: "var(--text)" }}>
                TL;DR
              </div>
              <div className="text-[14.5px] leading-[1.65]" style={{ color: "var(--text-2)" }}>
                GPT-5 is significantly better than GPT-4o at reasoning, code, and long-context tasks. It's worth the $20/month Plus subscription. For pure writing and creative tasks, Claude 4 is still slightly ahead. For everything else, GPT-5 is the new default.
              </div>
            </div>
          </div>

          <h2 id="whats-new">What's new in GPT-5</h2>
          <p>
            GPT-5 introduces three substantial improvements over GPT-4o, plus a handful of smaller quality-of-life upgrades. Here's what matters most:
          </p>

          <h3>1. A 1 million token context window</h3>
          <p>
            This is the headline number, and it deserves attention. GPT-5 can ingest roughly <strong>750,000 words</strong> in a single conversation — that's the entire Lord of the Rings trilogy, three times. In practice, this means you can paste your full codebase, an entire research paper collection, or hours of meeting transcripts and have a productive conversation about all of it without manual chunking.
          </p>

          <h3>2. Native real-time web access</h3>
          <p>
            GPT-5 doesn't just &quot;browse the web&quot; anymore — it can run continuous searches, follow citations, cross-reference sources, and produce final answers that include working footnote-style links. We tested this against Perplexity and Claude with web browsing: GPT-5 was more thorough, though Perplexity was faster.
          </p>

          {/* Tool callout */}
          <Link
            href="/ai-tool/chatgpt"
            className="tc-hover flex gap-[14px] items-center bg-white rounded-lg p-[18px] my-7 cursor-pointer"
          >
            <div
              className="w-12 h-12 rounded-[11px] overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <Favicon domain="chat.openai.com" name="ChatGPT" size={48} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-[5px] mb-[3px]">
                <span className="font-display text-[15px] font-extrabold">ChatGPT</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1D9BF0">
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z" />
                </svg>
              </div>
              <div className="text-[13px] leading-[1.45]" style={{ color: "var(--text-2)" }}>
                The world's most used AI — try GPT-5 with a Plus subscription.
              </div>
            </div>
            <span
              className="font-display text-[12.5px] font-bold px-[14px] py-[7px] rounded-pill flex-shrink-0"
              style={{ color: "var(--blue)", background: "var(--blue-soft)", border: "1px solid rgba(0,82,255,.15)" }}
            >
              Visit tool →
            </span>
          </Link>

          <h3>3. Extended thinking mode</h3>
          <p>
            Toggle &quot;Extended thinking&quot; in the model selector and GPT-5 will reason for up to 30 minutes before responding. This is overkill for most tasks, but for hard problems — debugging a thorny bug, architecting a new system, planning a complex content strategy — it produces noticeably better output. The downside is wait time and cost: extended thinking burns through your message quota faster.
          </p>

          <h2 id="benchmarks">Benchmark results</h2>
          <p>OpenAI published the official benchmark numbers, but we wanted to verify with our own tests. Here are the headline results from the most important academic benchmarks:</p>

          <ul>
            <li><strong>MMLU (general reasoning):</strong> GPT-5 scored 91.4%, up from 88.7% for GPT-4o. Claude 4 leads slightly at 91.9%.</li>
            <li><strong>HumanEval (code):</strong> GPT-5 hit 96.2% — a substantial jump from GPT-4o's 90.2%. Best-in-class for coding tasks.</li>
            <li><strong>MATH (mathematical reasoning):</strong> 84.7% versus GPT-4o's 76.6%. Massive improvement on multi-step math.</li>
            <li><strong>GPQA (graduate-level science):</strong> 73.1% — the first model to break 70% on this notoriously hard benchmark.</li>
          </ul>

          <blockquote>
            The MATH improvement is the most surprising. GPT-4o frequently slipped up on multi-step problems requiring careful tracking of variables. GPT-5 handles them with the same kind of step-by-step rigor a competent mathematician would use.
          </blockquote>

          <h2 id="use-cases">Use cases where GPT-5 excels</h2>
          <p>After two weeks of hands-on testing across our team — engineers, marketers, researchers, and writers — here are the workflows where GPT-5 noticeably outperforms its predecessor:</p>

          <ol>
            <li><strong>Codebase-wide refactoring.</strong> Paste your entire repo, describe the change, and GPT-5 produces a complete, working refactor with explanations. We did this for a 12,000-line TypeScript project. It worked first try.</li>
            <li><strong>Research synthesis.</strong> Drop in 5–10 papers and ask GPT-5 to find common threads, contradictions, or gaps. Output quality matches what a graduate research assistant would produce in days.</li>
            <li><strong>Multi-step planning.</strong> Project plans, content calendars, technical roadmaps — GPT-5 thinks several steps ahead and catches dependencies GPT-4o would miss.</li>
            <li><strong>Data analysis on long files.</strong> Upload a 100MB CSV and GPT-5 can run analyses across the whole file without chunking. Charts and SQL output are noticeably better too.</li>
          </ol>

          <h2 id="pricing">Pricing and access</h2>
          <p>GPT-5 is rolling out in three tiers:</p>
          <ul>
            <li><strong>ChatGPT Plus ($20/month):</strong> Full GPT-5 access with daily message limits, 1M context, extended thinking, web browsing, file uploads.</li>
            <li><strong>ChatGPT Pro ($200/month):</strong> Unlimited GPT-5 messages, priority access during peak times, longer extended thinking sessions, access to research preview features.</li>
            <li><strong>API:</strong> $15 per million input tokens, $60 per million output tokens. Pricier than GPT-4o, but you're paying for the better model.</li>
          </ul>
          <p>If you're a heavy user, Pro is worth it — we ran out of Plus messages within 90 minutes on day one. For most people, Plus is plenty.</p>

          <h2 id="vs-claude">GPT-5 vs Claude 4</h2>
          <p>Anthropic's <strong>Claude 4</strong> launched the same week, and the comparison is closer than the benchmark numbers suggest. Here's our honest take after running both side-by-side:</p>
          <ul>
            <li><strong>Writing quality:</strong> Claude 4 still edges out GPT-5 for nuanced, long-form prose. GPT-5 is more &quot;correct&quot; but reads slightly more mechanical.</li>
            <li><strong>Code:</strong> GPT-5 wins by a wide margin on complex multi-file tasks. Claude 4 is competitive for short snippets.</li>
            <li><strong>Reasoning:</strong> Roughly tied. Claude 4's extended thinking is more transparent (you can see the reasoning trace); GPT-5's is faster.</li>
            <li><strong>Personality:</strong> Subjective, but most of our team prefers Claude's tone for back-and-forth conversation.</li>
          </ul>
          <p>If you only pay for one, GPT-5 is the safer pick — it's stronger on more tasks. If you can afford both ($40/month total), that's what we'd recommend.</p>

          <h2>The verdict</h2>
          <p>GPT-5 is the new default. The 1M context window alone justifies the upgrade for anyone who works with large amounts of text or code. The reasoning improvements are real and measurable. And while Claude 4 remains slightly ahead on certain writing tasks, GPT-5 is now the most capable general-purpose AI on the market.</p>
          <p>If you've been on the fence about a ChatGPT Plus subscription, this is the moment. And if you build with AI APIs, plan to migrate to GPT-5 soon — your output quality will jump in a way users will notice.</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-[6px] mt-9 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            {TAGS.map((t) => (
              <span
                key={t}
                className="font-display text-xs font-semibold px-3 py-[5px] rounded-pill cursor-pointer transition-colors hover:border-blue hover:text-blue"
                style={{ color: "var(--text-2)", border: "1px solid var(--border)", background: "var(--white)" }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 mt-7 py-[18px] flex-wrap" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            <div className="font-display text-[12.5px] font-bold mr-auto" style={{ color: "var(--text-2)" }}>
              Share this article
            </div>
            <div className="flex gap-[6px]">
              {["x", "linkedin", "facebook", "link"].map((k) => (
                <button
                  key={k}
                  title={k}
                  className="w-9 h-9 rounded-sm flex items-center justify-center transition-colors hover:bg-near-black hover:text-white"
                  style={{ background: "var(--surface)", color: "var(--text-2)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    {k === "x" && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25z" />}
                    {k === "linkedin" && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />}
                    {k === "facebook" && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />}
                    {k === "link" && (
                      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </g>
                    )}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Author bio */}
          <div
            className="flex gap-[18px] rounded-lg p-6 mt-8"
            style={{ background: "var(--cream)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-16 h-16 rounded-full text-white font-display text-xl font-extrabold flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)" }}
            >
              AJ
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-extrabold mb-[2px] flex items-center gap-[5px]" style={{ color: "var(--text)" }}>
                Alex Johnson
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1D9BF0">
                  <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.26-3.91-.8C14.66 2.88 13.43 2 12 2s-2.66.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81-1 1.01-1.26 2.52-.8 3.91C2.88 9.34 2 10.57 2 12s.88 2.66 2.19 3.34c-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.26 3.91.8C9.34 21.12 10.57 22 12 22s2.66-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81 1-1.01 1.26-2.52.8-3.91C21.12 14.66 22.25 13.43 22.25 12z" />
                </svg>
              </div>
              <div className="text-[12.5px] mb-[10px]" style={{ color: "var(--text-3)" }}>
                Senior Editor · Writes about AI tools, infrastructure, and the people building them.
              </div>
              <div className="text-[13.5px] leading-[1.65] mb-3" style={{ color: "var(--text-2)" }}>
                Alex has been covering AI for 6 years and previously led product at two YC-backed startups. He tests every tool he writes about for at least a week.
              </div>
            </div>
          </div>
        </article>

        <BlogSidebar />
      </div>

      {/* Related articles */}
      <section className="py-14 px-9 section-pad-x" style={{ background: "var(--cream)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-[1320px] mx-auto">
          <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
            <div>
              <div className="eyebrow mb-[6px]" style={{ letterSpacing: ".09em" }}>
                Continue reading
              </div>
              <h2 className="font-display font-black" style={{ fontSize: 32, letterSpacing: "-1.2px", lineHeight: 1.1 }}>
                Related articles
              </h2>
            </div>
            <Link href="/blog" className="font-display text-[13.5px] font-bold" style={{ color: "var(--blue)" }}>
              All articles →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-[18px] blog-related-3">
            {RELATED_ARTICLES.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group blog-card-hover rounded-lg overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-center relative" style={{ height: 160, background: p.grad }}>
                  <div className="font-display font-black" style={{ fontSize: 42, color: "rgba(255,255,255,.15)", letterSpacing: "-1.5px" }}>
                    {p.img}
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-display text-[10.5px] font-extrabold uppercase tracking-[.07em] mb-2" style={{ color: "var(--blue)" }}>
                    {p.tag}
                  </div>
                  <h3 className="font-display text-base font-extrabold leading-[1.3] mb-2 transition-colors group-hover:text-blue" style={{ letterSpacing: "-.3px" }}>
                    {p.title}
                  </h3>
                  <div className="text-xs flex items-center gap-[6px]" style={{ color: "var(--text-3)" }}>
                    <div
                      className="w-5 h-5 rounded-full text-white font-display font-extrabold flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #0052ff, #578bfa)", fontSize: 9 }}
                    >
                      {p.initials}
                    </div>
                    {p.author} · {p.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="py-14 px-9 bg-white section-pad-x" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-display font-black mb-7" style={{ fontSize: 24, letterSpacing: "-.8px" }}>
            Comments ({COMMENTS.length})
          </h2>
          <div className="rounded-lg p-[18px] mb-7" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <textarea
              placeholder="Share your thoughts on this article…"
              className="w-full h-[90px] rounded text-sm outline-none px-[14px] py-3 resize-y bg-white"
              style={{ border: "1.5px solid var(--border)", lineHeight: 1.55 }}
            />
            <div className="flex items-center justify-between mt-[10px] flex-wrap gap-2">
              <div className="text-[11.5px]" style={{ color: "var(--text-3)" }}>
                Sign in to comment with your real name or post anonymously.
              </div>
              <button
                className="font-display text-[13px] font-bold text-white px-5 py-[9px] rounded-pill"
                style={{ background: "var(--blue)" }}
              >
                Post comment
              </button>
            </div>
          </div>
          {COMMENTS.map((c, i) => (
            <div key={i} className="flex gap-3 py-[18px]" style={{ borderBottom: i < COMMENTS.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-display text-[13px] font-extrabold flex-shrink-0"
                style={{ background: c.bg, color: c.fg }}
              >
                {c.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-[5px] flex-wrap">
                  <div className="font-display text-[13.5px] font-extrabold">{c.name}</div>
                  <div className="text-[11.5px]" style={{ color: "var(--text-3)" }}>
                    {c.role} · {c.date}
                  </div>
                </div>
                <div className="text-sm leading-[1.65] mb-2" style={{ color: "var(--text)" }}>
                  {c.text}
                </div>
                <div className="flex gap-[14px] text-xs font-semibold" style={{ color: "var(--text-3)" }}>
                  <button className="flex items-center gap-1 cursor-pointer transition-colors hover:text-blue">👍 {c.likes}</button>
                  <button className="cursor-pointer transition-colors hover:text-blue">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
