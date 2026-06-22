/**
 * Locale-aware overlays for the hardcoded seed data in lib/tools.ts.
 *
 * The seed catalogue (TOOLS, CATEGORIES, NEWS, BLOG_POSTS, etc.) is
 * the English source of truth. To show those same items in Korean
 * without a full CMS migration, we keep tightly-scoped per-locale
 * overrides here and merge them at render time.
 *
 * Adding a new locale:
 *   1. Create a TRANSLATIONS_<xx> map below following the ko shape.
 *   2. Add it to `OVERLAYS` keyed by the locale code.
 *   3. Deploy. The helper functions handle the rest.
 *
 * This file is *not* the Phase 3 CMS translations table — that's
 * coming separately and supersedes this layer for CMS-managed rows.
 * This overlay only handles the hardcoded seed arrays.
 */

import type { Tool, NewsItem, BlogPost } from "@/lib/tools";

/** Per-tool override — id is the lookup key, every field optional. */
type ToolOverride = Partial<Pick<Tool, "desc" | "tags" | "cat">>;
type NewsOverride = Partial<Pick<NewsItem, "source" | "category" | "title" | "excerpt" | "time" | "read">>;
type BlogOverride = Partial<Pick<BlogPost, "tag" | "title" | "date" | "read">>;
type UseCaseOverride = { name: string; desc: string };

/** Korean translations — covers everything that's visibly hardcoded on the homepage. */
const TRANSLATIONS_KO = {
  tools: {
    chatgpt:    { desc: "글쓰기, 코딩, 브레인스토밍, 창의적 작업을 위한 세계 최고의 AI. 전 세계 수백만 명이 신뢰합니다.", tags: ["채팅", "글쓰기"] },
    midjourney: { desc: "텍스트 설명을 숨막히게 아름다운 이미지로 변환. AI 아트 생성의 표준.", tags: ["이미지"] },
    claude:     { desc: "정교한 추론, 긴 컨텍스트 분석, 안전하고 도움이 되는 응답을 위한 Anthropic의 사려 깊은 AI.", tags: ["채팅", "글쓰기"] },
    perplexity: { desc: "신뢰할 수 있는 정보를 실시간으로 찾고 요약하고 인용하는 AI 검색 엔진.", tags: ["검색", "리서치"] },
    cursor:     { desc: "AI 기반 IDE. 코드베이스 전체를 이해하는 AI와 함께 작성·디버그·리팩토링하세요.", tags: ["코드"] },
    runway:     { desc: "영화 제작자와 크리에이터를 위한 프로페셔널 AI 비디오 생성·편집·시각 효과.", tags: ["비디오"] },
    suno:       { desc: "텍스트 프롬프트로 라디오 품질의 풀렝스 곡을 생성. 가사, 멜로디, 마스터링 모두 AI.", tags: ["오디오", "음악"] },
    elevenlabs: { desc: "32개 언어로 초현실적인 AI 음성 복제 및 텍스트-음성 변환. 업계 최고의 보이스 AI.", tags: ["음성", "오디오"] },
    v0:         { desc: "자연어 설명으로 프로덕션 수준의 React + Tailwind UI 컴포넌트를 생성.", tags: ["코드", "디자인"] },
    gemini:     { desc: "텍스트, 이미지, 오디오, 비디오, 코드를 동시에 추론하는 Google의 멀티모달 AI.", tags: ["채팅", "리서치"] },
    ideogram:   { desc: "타이포그래피 중심 이미지 생성. 이미지 내 텍스트를 완벽하게 렌더링 — 디자인 최고의 선택.", tags: ["이미지"] },
    kling:      { desc: "이미지와 텍스트로 물리적으로 정확한 모션의 고품질 영화 같은 비디오 생성.", tags: ["비디오"] },
  } as Record<string, ToolOverride>,

  // Index by English name (the seed data uses these as identifiers in the CATEGORIES array).
  categories: {
    "Writing & Editing": "글쓰기 & 편집",
    "Image Generation":  "이미지 생성",
    "Video":             "비디오",
    "Code & Developer":  "코드 & 개발",
    "Marketing":         "마케팅",
    "Productivity":      "생산성",
    "Audio & Music":     "오디오 & 음악",
    "Research & Data":   "리서치 & 데이터",
    "Design & Creative": "디자인 & 크리에이티브",
    "Business & Finance": "비즈니스 & 금융",
    "Education":         "교육",
    "Automation":        "자동화",
  } as Record<string, string>,

  // Pricing tags shown on WRITER_TOOLS / DEV_TOOLS (and resolveSectionTools)
  pricingTags: {
    "Free":         "무료",
    "Free tier":    "무료 플랜",
    "Free Trial":   "무료 체험",
    "Paid":         "유료",
    "Credit-based": "크레딧 기반",
    "Enterprise":   "엔터프라이즈",
  } as Record<string, string>,

  writerUseCases: [
    { name: "장문 콘텐츠",   desc: "글, 리포트, 심층 콘텐츠를 대규모로" },
    { name: "SEO 콘텐츠",   desc: "AI 키워드 통합으로 검색 상위 노출용 블로그 글" },
    { name: "이메일 카피",  desc: "제목, 시퀀스, 콜드 아웃리치" },
    { name: "소셜 미디어",  desc: "트위터 스레드, 포스트, LinkedIn 게시물을 몇 초 만에" },
  ] as UseCaseOverride[],

  devUseCases: [
    { name: "AI 코딩 IDE",  desc: "AI 도움으로 작성·디버그·배포" },
    { name: "API 도구",     desc: "AI를 앱에 몇 분 안에 통합" },
    { name: "UI 생성",     desc: "프롬프트에서 프로덕션 React까지 단 몇 초" },
    { name: "코드 리뷰",   desc: "AI 기반 버그 탐지와 리팩토링" },
  ] as UseCaseOverride[],

  // News — keyed by source+title hash (we use just title since titles are stable)
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      source: "OpenAI",
      category: "제품 출시",
      title: "OpenAI, 100만 토큰 컨텍스트와 실시간 추론을 갖춘 GPT-5 출시",
      excerpt: "OpenAI 플래그십 모델의 차세대 버전이 10배 큰 컨텍스트 윈도우, 개선된 추론, 플러그인 없는 네이티브 실시간 웹 액세스를 제공합니다.",
      time: "2시간 전",
      read: "5분 읽기",
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      source: "Google DeepMind",
      category: "리서치",
      title: "DeepMind, 새로운 멀티모달 기능을 갖춘 Gemini 2.5 공개",
      time: "4시간 전",
      read: "3분 읽기",
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      source: "Anthropic",
      category: "제품 출시",
      title: "Claude 4, 확장된 사고와 컴퓨터 사용 2.0 기능으로 출시",
      time: "6시간 전",
      read: "4분 읽기",
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      source: "OpenAI",
      category: "비디오 AI",
      title: "Sora 2.0, 4K 출력 및 5분 길이 영상 생성 지원",
      time: "6시간 전",
      read: "2분 읽기",
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      source: "Mistral AI",
      category: "리서치",
      title: "Mixtral 9x22B 오픈소스 공개 — 3배 저렴한 비용으로 GPT-4 수준",
      time: "10시간 전",
      read: "3분 읽기",
    },
  } as Record<string, NewsOverride>,

  // Blog posts — keyed by slug
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      tag: "가이드",
      title: "GPT-5 완벽 가이드: 알아야 할 모든 것",
      date: "5월 4일",
      read: "8분",
    },
    "chatgpt-vs-claude-4": {
      tag: "비교",
      title: "ChatGPT vs Claude 4 (2026): 어떤 AI가 승리할까?",
      date: "5월 1일",
      read: "12분",
    },
    "best-free-ai-marketing-tools": {
      tag: "추천",
      title: "마케터를 위한 2026년 최고의 무료 AI 도구 7선",
      date: "4월 25일",
      read: "9분",
    },
  } as Record<string, BlogOverride>,
};

const OVERLAYS: Record<string, typeof TRANSLATIONS_KO> = {
  ko: TRANSLATIONS_KO,
};

// ─────────────────────────────────────────────────────────────
// HELPERS — components call these instead of touching the raw arrays
// ─────────────────────────────────────────────────────────────

/** Returns a new Tool array with desc + tags overlaid for the given locale. */
export function localizeTools(tools: Tool[], locale: string): Tool[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return tools;
  return tools.map((t) => {
    const o = overlay.tools[t.id];
    if (!o) return t;
    return { ...t, desc: o.desc ?? t.desc, tags: o.tags ?? t.tags };
  });
}

/** Returns a new categories list with translated names. */
export function localizeCategories<T extends { name: string }>(cats: readonly T[], locale: string): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...cats];
  return cats.map((c) => ({ ...c, name: overlay.categories[c.name] ?? c.name }));
}

/** Returns a translated pricing tag — "Free" → "무료", etc. Pass-through for unknown values. */
export function localizePricingTag(tag: string, locale: string): string {
  const overlay = OVERLAYS[locale];
  if (!overlay) return tag;
  return overlay.pricingTags[tag] ?? tag;
}

/** Returns a new tool-list with pricing tags translated (for WRITER_TOOLS / DEV_TOOLS). */
export function localizeToolList<T extends { tag: string }>(list: readonly T[], locale: string): T[] {
  return list.map((t) => ({ ...t, tag: localizePricingTag(t.tag, locale) }));
}

/** Returns a new use-case list with translated name + desc. Order matches input. */
export function localizeUseCases<T extends { name: string; desc: string }>(
  cases: readonly T[],
  locale: string,
  kind: "writer" | "dev",
): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...cases];
  const overrides = kind === "writer" ? overlay.writerUseCases : overlay.devUseCases;
  return cases.map((c, i) => ({
    ...c,
    name: overrides[i]?.name ?? c.name,
    desc: overrides[i]?.desc ?? c.desc,
  }));
}

/** Returns the main news item with source/category/title/excerpt/time/read translated. */
export function localizeNewsItem(item: NewsItem, locale: string): NewsItem {
  const overlay = OVERLAYS[locale];
  if (!overlay) return item;
  const o = overlay.newsByTitle[item.title];
  if (!o) return item;
  return {
    ...item,
    source: o.source ?? item.source,
    category: o.category ?? item.category,
    title: o.title ?? item.title,
    excerpt: o.excerpt ?? item.excerpt,
    time: o.time ?? item.time,
    read: o.read ?? item.read,
  };
}

/** Returns a new news-items list with each item localized. */
export function localizeNewsList(items: readonly NewsItem[], locale: string): NewsItem[] {
  return items.map((n) => localizeNewsItem(n, locale));
}

/** Returns a new blog post array with title/tag/date/read translated. */
export function localizeBlogPosts(posts: readonly BlogPost[], locale: string): BlogPost[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...posts];
  return posts.map((p) => {
    const o = overlay.blogPostsBySlug[p.slug];
    if (!o) return p;
    return {
      ...p,
      tag: o.tag ?? p.tag,
      title: o.title ?? p.title,
      date: o.date ?? p.date,
      read: o.read ?? p.read,
    };
  });
}
