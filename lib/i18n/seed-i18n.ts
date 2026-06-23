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

  // Full 48-entry overlay so EVERY visible category name flows through Korean.
  // Index by English name — the seed data (lib/categories.ts, lib/tools.ts,
  // lib/category-detail.ts RELATED_CATS) all use these strings as identifiers.
  categories: {
    "Writing & Editing":            "글쓰기 & 편집",
    "Image Generation":             "이미지 생성",
    "Video":                        "비디오",
    "Video & Animation":            "비디오 & 애니메이션",
    "Code & Developer":             "코드 & 개발",
    "Marketing":                    "마케팅",
    "Marketing & Sales":            "마케팅 & 영업",
    "Productivity":                 "생산성",
    "Productivity & Automation":    "생산성 & 자동화",
    "Audio & Music":                "오디오 & 음악",
    "Research & Data":              "리서치 & 데이터",
    "Design & Creative":            "디자인 & 크리에이티브",
    "Business & Finance":           "비즈니스 & 금융",
    "Education":                    "교육",
    "Education & Learning":         "교육 & 학습",
    "Automation":                   "자동화",
    "Chatbots & Assistants":        "챗봇 & 어시스턴트",
    "Customer Support":             "고객 지원",
    "Translation & Language":       "번역 & 언어",
    "Resume & Career":              "이력서 & 커리어",
    "Email Assistants":             "이메일 어시스턴트",
    "SEO & Content":                "SEO & 콘텐츠",
    "Social Media":                 "소셜 미디어",
    "PDF & Documents":              "PDF & 문서",
    "3D & AR / VR":                 "3D & AR / VR",
    "Avatar Generation":            "아바타 생성",
    "Gaming & Entertainment":       "게이밍 & 엔터테인먼트",
    "Healthcare & Medical":         "헬스케어 & 의료",
    "Legal & Compliance":           "법률 & 컴플라이언스",
    "HR & Recruiting":              "HR & 채용",
    "Real Estate":                  "부동산",
    "Travel & Hospitality":         "여행 & 호스피탈리티",
    "Architecture & Interior":      "건축 & 인테리어",
    "Music Production":             "음악 제작",
    "Voice Cloning":                "음성 복제",
    "Speech Recognition":           "음성 인식",
    "Text-to-Speech":               "텍스트-음성 변환",
    "Spreadsheet AI":               "스프레드시트 AI",
    "Note-Taking":                  "노트 작성",
    "Mind Mapping":                 "마인드맵",
    "Recipe & Food AI":             "레시피 & 음식 AI",
    "Fitness & Wellness":           "피트니스 & 웰니스",
    "E-commerce":                   "이커머스",
    "Photo Editing":                "사진 편집",
    "Logo Makers":                  "로고 메이커",
    "UI / UX Design":               "UI / UX 디자인",
    "Game Asset Generation":        "게임 에셋 생성",
    "Data Visualization":           "데이터 시각화",
    "OCR & Document AI":            "OCR & 문서 AI",
    "AI Detectors":                 "AI 탐지기",
    "Plagiarism Checkers":          "표절 검사기",
    "AI Agents":                    "AI 에이전트",
    "No-code AI":                   "노코드 AI",
    "Analytics":                    "분석",
  } as Record<string, string>,

  /**
   * Per-popular-category description overlay — keyed by English name.
   * Used by PopularCategoriesGrid on /ai-tools.
   */
  popularCategoryDescs: {
    "Writing & Editing": "텍스트를 생성·편집·다듬기 — 블로그 글에서 마케팅 카피, 장문 픽션까지.",
    "Image Generation": "최신 디퓨전 모델로 텍스트 프롬프트에서 이미지·일러스트·아트를 생성합니다.",
    "Code & Developer": "AI 페어 프로그래머, 자동완성, 코드 리뷰어, 풀스택 생성기.",
    "Video & Animation": "비디오 생성·편집·애니메이션 — 텍스트-비디오, 배경 제거, 립싱크까지.",
    "Audio & Music": "음성 복제, 음악 생성, 전사, 팟캐스트 제작, 사운드 디자인.",
    "Productivity & Automation": "캘린더 AI, 회의 요약, 작업 자동화, 개인 워크플로우 어시스턴트.",
  } as Record<string, string>,

  /**
   * Use-case (categories landing /ai-tools — USE_CASES array) overlay.
   * Keyed by English name → Korean name + desc.
   */
  useCases: {
    "Write a blog post":   { name: "블로그 글 작성",   desc: "리서치·아웃라인·작성을 더 빠르게 도와주는 도구." },
    "Create a logo":       { name: "로고 만들기",      desc: "로고·브랜드 아이덴티티·비주얼 에셋을 위한 AI 디자인 도구." },
    "Analyse data":        { name: "데이터 분석",      desc: "스프레드시트·CSV·데이터베이스를 AI로 이해하기." },
    "Edit a video":        { name: "비디오 편집",      desc: "AI 도움으로 컷·자막·영상 보정." },
    "Reply to emails":     { name: "이메일 답장",      desc: "받은편지함을 더 빨리 작성·요약·관리." },
    "Transcribe audio":    { name: "오디오 전사",      desc: "회의·팟캐스트·통화를 검색 가능한 텍스트로." },
    "Ship code faster":    { name: "코드 더 빠르게",   desc: "AI 페어 프로그래머·코드 생성기·디버그 헬퍼." },
    "Run social media":    { name: "소셜 미디어 운영", desc: "여러 플랫폼에서 콘텐츠 예약·작성·분석." },
  } as Record<string, { name: string; desc: string }>,

  /**
   * Pricing tier overlay (PRICING_TIERS on /ai-tools).
   * Keyed by English tag → Korean name + desc.
   */
  pricingTiers: {
    "Free":       { name: "완전 무료",          desc: "오픈소스 또는 완전 무료 도구 — 유료 플랜 없이도 사용 가능." },
    "Freemium":   { name: "무료 플랜 제공",     desc: "넉넉한 무료 플랜 + 더 많은 기능을 원할 때 선택할 수 있는 유료 업그레이드." },
    "Paid":       { name: "유료 전용",          desc: "구독 기반 프리미엄 도구 — 무료 버전 없음." },
    "Enterprise": { name: "맞춤 가격",          desc: "맞춤 계약과 전담 지원이 제공되는 엔터프라이즈 도구." },
  } as Record<string, { name: string; desc: string }>,

  /**
   * Sub-category sidebar labels (CategoryBrowser's SUB_CATEGORIES).
   * Keys are SUB_CATEGORIES[].label.
   */
  subCategories: {
    "SEO & Content":     "SEO & 콘텐츠",
    "AI Copywriting":    "AI 카피라이팅",
    "Email Marketing":   "이메일 마케팅",
    "Social Media":      "소셜 미디어",
    "Ad Creative":       "광고 크리에이티브",
    "Analytics":         "분석",
  } as Record<string, string>,

  /** Marketing FAQ on the category detail page (lib/category-detail.ts MARKETING_FAQ_TEXT). */
  marketingFaq: [
    {
      q: "2026년 최고의 AI 마케팅 도구는 무엇인가요?",
      a: "대부분의 마케팅팀에는 **Jasper AI**가 최선의 선택입니다 — AI 카피라이팅, 브랜드 보이스 학습, SEO 모드, 팀 협업을 한 플랫폼에 통합. 1인 창업자나 예산이 적은 팀에는 **Copy.ai**의 강력한 무료 플랜이 좋고, SEO 중심 콘텐츠는 **Writesonic**이 탁월합니다. \"최고\"는 활용 사례에 따라 달라집니다: 블로그 콘텐츠, 광고 크리에이티브, 이메일 자동화, 풀펀넬 마케팅 등.",
    },
    {
      q: "무료 AI 마케팅 도구가 있나요?",
      a: "네 — 이 카테고리의 108개 도구 중 31개는 완전 무료 플랜이 있고, 52개는 넉넉한 프리미엄 플랜을 제공합니다. 상단에서 \"무료\" 또는 \"프리미엄\" 필터로 모두 확인할 수 있습니다. 대표 무료 옵션: Copy.ai, ChatGPT(무료 플랜), Canva Magic Write, HubSpot의 무료 AI 도구.",
    },
    {
      q: "AI 마케팅 도구가 마케팅팀을 대체할 수 있나요?",
      a: "아니요 — AI 마케팅 도구는 대체재가 아니라 증폭기로 생각하는 것이 좋습니다. 반복 업무(카피 초안, 변형 생성, 예약, 리포팅)는 AI가 처리하고, 마케터는 전략·브랜드·고임팩트 의사결정에 집중합니다. 대부분의 팀이 2~5배 생산성 향상을 보고하며, 인원 감축이 아닌 결과 확장에 가깝습니다.",
    },
    {
      q: "SEO에 가장 좋은 AI 마케팅 도구는?",
      a: "**Surfer SEO**와 **Frase**가 가장 우수한 AI 기반 SEO 콘텐츠 도구입니다 — 둘 다 SERP 분석과 AI 라이팅을 결합해 검색 상위 노출용 글을 만듭니다. 기술 SEO는 **Semrush**와 **Ahrefs**에도 강력한 AI 기능이 내장되어 있습니다.",
    },
    {
      q: "내게 맞는 AI 마케팅 도구는 어떻게 고르나요?",
      a: "가장 큰 병목부터 시작하세요. 콘텐츠 발행이 막힌다면 AI 카피라이터. 블로그가 검색에 안 잡힌다면 SEO 도구. 이메일 성과가 평탄하다면 이메일 AI. 한 번에 5개를 도입하지 마세요 — 하나를 골라 깊이 통합한 다음, 더 추가하세요.",
    },
  ] as Array<{ q: string; a: string }>,

  /** Marketing facts (lib/category-detail.ts MARKETING_FACTS) — keyed by English label. */
  marketingFacts: {
    "Total tools":         "전체 도구",
    "Free tools":          "무료 도구",
    "Freemium":            "프리미엄",
    "Paid only":           "유료 전용",
    "Avg starting price":  "평균 시작 가격",
    "Top use case":        "주요 활용 사례",
  } as Record<string, string>,

  /** Related slider hardcoded RELATED array (components/tool/RelatedSlider.tsx). */
  relatedSliderTools: {
    "Claude":         { cat: "AI 채팅 · Anthropic",   desc: "Anthropic의 정교한 추론과 긴 컨텍스트 분석." },
    "Google Gemini":  { cat: "AI 채팅 · Google",      desc: "텍스트·이미지·비디오를 아우르는 Google의 멀티모달 AI." },
    "Perplexity":     { cat: "AI 검색",                desc: "실시간 인용을 제공하는 AI 검색." },
    "MS Copilot":     { cat: "AI 채팅 · Microsoft",   desc: "GPT-4 기반의 Microsoft AI 어시스턴트." },
    "Mistral":        { cat: "AI 채팅",                desc: "최고의 효율성을 자랑하는 오픈 가중치 모델." },
    "Cohere":         { cat: "AI API",                 desc: "비즈니스 팀을 위한 엔터프라이즈급 언어 AI." },
    "Groq":           { cat: "AI API",                 desc: "개발자를 위한 초고속 LLM 추론." },
  } as Record<string, { cat: string; desc: string }>,

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

/**
 * Returns a new popular-category list with desc localized.
 * Pairs with localizeCategories which handles the `name` field.
 */
export function localizePopularCategoryDescs<T extends { name: string; desc: string }>(
  cats: readonly T[],
  locale: string,
): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...cats];
  return cats.map((c) => ({
    ...c,
    desc: overlay.popularCategoryDescs[c.name] ?? c.desc,
  }));
}

/** Returns a new use-cases list with name + desc localized. */
export function localizeUseCasesByName<T extends { name: string; desc: string }>(
  uses: readonly T[],
  locale: string,
): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...uses];
  return uses.map((u) => {
    const o = overlay.useCases[u.name];
    return o ? { ...u, name: o.name, desc: o.desc } : u;
  });
}

/** Returns a new pricing-tier list with name + desc localized. */
export function localizePricingTiers<T extends { tag: string; name: string; desc: string }>(
  tiers: readonly T[],
  locale: string,
): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...tiers];
  return tiers.map((p) => {
    const o = overlay.pricingTiers[p.tag];
    return o ? { ...p, name: o.name, desc: o.desc } : p;
  });
}

/** Returns a new sub-category list with label localized. */
export function localizeSubCategories<T extends { label: string }>(
  subs: readonly T[],
  locale: string,
): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...subs];
  return subs.map((s) => ({ ...s, label: overlay.subCategories[s.label] ?? s.label }));
}

/** Returns the Korean MARKETING_FAQ_TEXT for non-default locales; English otherwise. */
export function localizeMarketingFaq<T extends { q: string; a: string }>(
  items: readonly T[],
  locale: string,
): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...items];
  // Items align by index — both English and Korean lists are 5 entries.
  return items.map((item, i) => ({
    ...item,
    q: overlay.marketingFaq[i]?.q ?? item.q,
    a: overlay.marketingFaq[i]?.a ?? item.a,
  }));
}

/** Returns a new marketing-facts list with labels localized. */
export function localizeMarketingFacts<T extends { label: string; val: string }>(
  facts: readonly T[],
  locale: string,
): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...facts];
  return facts.map((f) => ({ ...f, label: overlay.marketingFacts[f.label] ?? f.label }));
}

/** Returns a new related-slider tools list with cat + desc localized. */
export function localizeRelatedSliderTools<T extends { name: string; cat: string; desc: string }>(
  tools: readonly T[],
  locale: string,
): T[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return [...tools];
  return tools.map((t) => {
    const o = overlay.relatedSliderTools[t.name];
    return o ? { ...t, cat: o.cat, desc: o.desc } : t;
  });
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
