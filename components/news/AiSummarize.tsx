import { favicon } from "@/lib/tools";

const AI_TOOLS = [
  { name: "ChatGPT", domain: "chat.openai.com", url: (q: string) => `https://chat.openai.com/?q=${q}` },
  { name: "Claude", domain: "claude.ai", url: (q: string) => `https://claude.ai/new?q=${q}` },
  { name: "Gemini", domain: "gemini.google.com", url: (q: string) => `https://gemini.google.com/app?q=${q}` },
  { name: "Perplexity", domain: "perplexity.ai", url: (q: string) => `https://www.perplexity.ai/search?q=${q}` },
  { name: "Grok", domain: "x.ai", url: (q: string) => `https://x.com/i/grok?text=${q}` },
  { name: "Copilot", domain: "copilot.microsoft.com", url: (q: string) => `https://copilot.microsoft.com/?q=${q}` },
];

export function AiSummarize({ articleUrl }: { articleUrl: string }) {
  const q = encodeURIComponent(`Summarize this article: ${articleUrl}`);
  return (
    <div
      className="bg-white rounded-lg px-[18px] py-[14px] mb-6 flex items-center gap-[14px] flex-wrap"
      style={{ border: "1.5px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 font-display text-[12.5px] font-extrabold" style={{ color: "var(--text)" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--blue)" }}>
          <path d="M12 2L9.5 8.5 3 9l5 4.5L6 21l6-3 6 3-2-7.5L21 9l-6.5-.5z" />
        </svg>
        Summarize with AI
      </div>
      <div className="text-[11.5px] -ml-[6px]" style={{ color: "var(--text-3)" }}>
        Open this story in your favorite AI for a quick summary or follow-up Qs
      </div>
      <div className="flex gap-[6px] ml-auto flex-wrap">
        {AI_TOOLS.map((t) => (
          <a
            key={t.name}
            href={t.url(q)}
            target="_blank"
            rel="noopener noreferrer"
            title={`Ask ${t.name}`}
            className="ais-btn"
          >
            <img src={favicon(t.domain, 64)} alt="" className="w-[15px] h-[15px] rounded-[3px] flex-shrink-0" />
            {t.name}
          </a>
        ))}
      </div>
    </div>
  );
}
