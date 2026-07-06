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

const TRANSLATIONS_ZH = {
  tools: {
    "chatgpt": {
      "desc": "全球领先的 AI,专为写作、编程、头脑风暴和创意任务打造。深受全球数百万用户信赖。",
      "tags": [
        "聊天",
        "写作"
      ]
    },
    "midjourney": {
      "desc": "将文字描述转化为令人惊艳的图像。AI 艺术创作的行业标杆。",
      "tags": [
        "图像"
      ]
    },
    "claude": {
      "desc": "Anthropic 出品,擅长精细推理、长上下文分析,提供安全、有帮助的回答。",
      "tags": [
        "聊天",
        "写作"
      ]
    },
    "perplexity": {
      "desc": "实时查找、总结并引用可靠信息的 AI 搜索引擎。",
      "tags": [
        "搜索",
        "研究"
      ]
    },
    "cursor": {
      "desc": "AI 驱动的 IDE。与能理解整个代码库的 AI 一起编写、调试、重构代码。",
      "tags": [
        "代码"
      ]
    },
    "runway": {
      "desc": "面向影视创作者和内容创作者的专业级 AI 视频生成、编辑与视觉特效。",
      "tags": [
        "视频"
      ]
    },
    "suno": {
      "desc": "通过文字提示生成电台品质的完整歌曲。歌词、旋律、母带全由 AI 完成。",
      "tags": [
        "音频",
        "音乐"
      ]
    },
    "elevenlabs": {
      "desc": "支持 32 种语言的超逼真 AI 语音克隆与文本转语音。业界领先的语音 AI。",
      "tags": [
        "语音",
        "音频"
      ]
    },
    "v0": {
      "desc": "通过自然语言描述生成可用于生产环境的 React + Tailwind UI 组件。",
      "tags": [
        "代码",
        "设计"
      ]
    },
    "gemini": {
      "desc": "Google 出品的多模态 AI,可同时对文本、图像、音频、视频和代码进行推理。",
      "tags": [
        "聊天",
        "研究"
      ]
    },
    "ideogram": {
      "desc": "以排版为核心的图像生成工具。完美渲染图像中的文字 — 设计师的首选。",
      "tags": [
        "图像"
      ]
    },
    "kling": {
      "desc": "根据图像和文字生成物理效果精准的高质量电影级视频。",
      "tags": [
        "视频"
      ]
    }
  } as Record<string, ToolOverride>,
  categories: {
    "Writing & Editing": "写作与编辑",
    "Image Generation": "图像生成",
    "Video": "视频",
    "Video & Animation": "视频与动画",
    "Code & Developer": "代码与开发",
    "Marketing": "营销",
    "Marketing & Sales": "营销与销售",
    "Productivity": "生产力",
    "Productivity & Automation": "生产力与自动化",
    "Audio & Music": "音频与音乐",
    "Research & Data": "研究与数据",
    "Design & Creative": "设计与创意",
    "Business & Finance": "商业与金融",
    "Education": "教育",
    "Education & Learning": "教育与学习",
    "Automation": "自动化",
    "Chatbots & Assistants": "聊天机器人与助手",
    "Customer Support": "客户支持",
    "Translation & Language": "翻译与语言",
    "Resume & Career": "简历与职业",
    "Email Assistants": "邮件助手",
    "SEO & Content": "SEO 与内容",
    "Social Media": "社交媒体",
    "PDF & Documents": "PDF 与文档",
    "3D & AR / VR": "3D 与 AR / VR",
    "Avatar Generation": "头像生成",
    "Gaming & Entertainment": "游戏与娱乐",
    "Healthcare & Medical": "医疗健康",
    "Legal & Compliance": "法律与合规",
    "HR & Recruiting": "人力资源与招聘",
    "Real Estate": "房地产",
    "Travel & Hospitality": "旅游与酒店",
    "Architecture & Interior": "建筑与室内设计",
    "Music Production": "音乐制作",
    "Voice Cloning": "语音克隆",
    "Speech Recognition": "语音识别",
    "Text-to-Speech": "文本转语音",
    "Spreadsheet AI": "表格 AI",
    "Note-Taking": "笔记工具",
    "Mind Mapping": "思维导图",
    "Recipe & Food AI": "食谱与美食 AI",
    "Fitness & Wellness": "健身与健康",
    "E-commerce": "电子商务",
    "Photo Editing": "照片编辑",
    "Logo Makers": "Logo 制作",
    "UI / UX Design": "UI / UX 设计",
    "Game Asset Generation": "游戏素材生成",
    "Data Visualization": "数据可视化",
    "OCR & Document AI": "OCR 与文档 AI",
    "AI Detectors": "AI 检测工具",
    "Plagiarism Checkers": "查重工具",
    "AI Agents": "AI 智能体",
    "No-code AI": "无代码 AI",
    "Analytics": "数据分析"
  } as Record<string, string>,
  popularCategoryDescs: {
    "Writing & Editing": "生成、编辑、打磨文本 — 从博客文章到营销文案,再到长篇小说。",
    "Image Generation": "用最新的扩散模型,从文字提示生成图像、插画与艺术作品。",
    "Code & Developer": "AI 结对编程、自动补全、代码审查与全栈代码生成工具。",
    "Video & Animation": "视频生成、编辑与动画制作 — 文本转视频、抠像去背景、对口型一应俱全。",
    "Audio & Music": "语音克隆、音乐生成、转录、播客制作与音效设计。",
    "Productivity & Automation": "日程 AI、会议纪要总结、任务自动化与个人工作流助手。"
  } as Record<string, string>,
  useCases: {
    "Write a blog post": {
      "name": "撰写博客文章",
      "desc": "帮您更快完成研究、大纲和写作的工具。"
    },
    "Create a logo": {
      "name": "制作 Logo",
      "desc": "用于 Logo、品牌形象和视觉素材的 AI 设计工具。"
    },
    "Analyse data": {
      "name": "分析数据",
      "desc": "用 AI 理解电子表格、CSV 文件和数据库。"
    },
    "Edit a video": {
      "name": "编辑视频",
      "desc": "借助 AI 完成剪辑、字幕和调色。"
    },
    "Reply to emails": {
      "name": "回复邮件",
      "desc": "更快地撰写、总结和管理收件箱。"
    },
    "Transcribe audio": {
      "name": "转录音频",
      "desc": "将会议、播客和通话转为可搜索的文本。"
    },
    "Ship code faster": {
      "name": "更快交付代码",
      "desc": "AI 结对编程、代码生成器和调试助手。"
    },
    "Run social media": {
      "name": "运营社交媒体",
      "desc": "跨平台的内容排期、创作与数据分析。"
    }
  } as Record<string, { name: string; desc: string }>,
  pricingTiers: {
    "Free": {
      "name": "完全免费",
      "desc": "开源或完全免费的工具 — 无需付费计划即可使用。"
    },
    "Freemium": {
      "name": "提供免费版",
      "desc": "慷慨的免费计划,外加可选的付费升级以解锁更多功能。"
    },
    "Paid": {
      "name": "仅付费",
      "desc": "基于订阅的高级工具 — 无免费版本。"
    },
    "Enterprise": {
      "name": "定制价格",
      "desc": "提供定制合同与专属支持的企业级工具。"
    }
  } as Record<string, { name: string; desc: string }>,
  subCategories: {
    "SEO & Content": "SEO 与内容",
    "AI Copywriting": "AI 文案写作",
    "Email Marketing": "邮件营销",
    "Social Media": "社交媒体",
    "Ad Creative": "广告创意",
    "Analytics": "数据分析"
  } as Record<string, string>,
  marketingFaq: [
    {
      "q": "2026年最好的 AI 营销工具是什么?",
      "a": "对大多数营销团队来说,**Jasper AI** 是最佳选择 — 它将 AI 文案写作、品牌语调学习、SEO 模式和团队协作整合在同一个平台上。对独立创业者或预算有限的团队来说,**Copy.ai** 强大的免费计划是不错的选择,而 SEO 导向的内容创作则首推 **Writesonic**。“最好”取决于具体使用场景:博客内容、广告创意、邮件自动化,还是全漏斗营销。"
    },
    {
      "q": "有免费的 AI 营销工具吗?",
      "a": "有 — 该分类下的 108 款工具中,31 款提供完全免费的计划,52 款提供慷慨的免费增值计划。您可以在页面顶部用“免费”或“免费增值”筛选查看全部。热门免费选项包括:Copy.ai、ChatGPT(免费版)、Canva Magic Write,以及 HubSpot 的免费 AI 工具。"
    },
    {
      "q": "AI 营销工具能取代营销团队吗?",
      "a": "不能 — 更准确的说法是,AI 营销工具是放大器,而非替代品。重复性工作(文案初稿、生成变体、内容排期、报表整理)交给 AI 处理,营销人员则专注于策略、品牌和高价值决策。大多数团队反馈生产力提升 2 到 5 倍,这是在扩大成果,而不是裁员。"
    },
    {
      "q": "SEO 方面最好的 AI 营销工具是哪些?",
      "a": "**Surfer SEO** 和 **Frase** 是最出色的 AI 驱动 SEO 内容工具 — 两者都将 SERP 分析与 AI 写作结合,帮您撰写能在搜索结果中排名靠前的文章。**Semrush** 和 **Ahrefs** 在技术 SEO 方面也内置了强大的 AI 功能。"
    },
    {
      "q": "如何选择适合自己的 AI 营销工具?",
      "a": "从您最大的瓶颈入手。如果内容发布卡壳,选 AI 文案工具;如果博客搜不到,选 SEO 工具;如果邮件效果平平,选邮件 AI 工具。不要一次性上五款工具 — 先选一款深度整合,再逐步添加。"
    }
  ] as Array<{ q: string; a: string }>,
  marketingFacts: {
    "Total tools": "工具总数",
    "Free tools": "免费工具",
    "Freemium": "免费增值",
    "Paid only": "仅付费",
    "Avg starting price": "平均起步价",
    "Top use case": "主要使用场景"
  } as Record<string, string>,
  relatedSliderTools: {
    "Claude": {
      "cat": "AI 聊天 · Anthropic",
      "desc": "Anthropic 出品,擅长精细推理与长上下文分析。"
    },
    "Google Gemini": {
      "cat": "AI 聊天 · Google",
      "desc": "Google 出品的多模态 AI,涵盖文本、图像与视频。"
    },
    "Perplexity": {
      "cat": "AI 搜索",
      "desc": "提供实时引用的 AI 搜索。"
    },
    "MS Copilot": {
      "cat": "AI 聊天 · Microsoft",
      "desc": "基于 GPT-4 的 Microsoft AI 助手。"
    },
    "Mistral": {
      "cat": "AI 聊天",
      "desc": "以卓越效率著称的开放权重模型。"
    },
    "Cohere": {
      "cat": "AI API",
      "desc": "面向企业团队的企业级语言 AI。"
    },
    "Groq": {
      "cat": "AI API",
      "desc": "面向开发者的超高速 LLM 推理。"
    }
  } as Record<string, { cat: string; desc: string }>,
  pricingTags: {
    "Free": "免费",
    "Free tier": "免费版",
    "Free Trial": "免费试用",
    "Paid": "付费",
    "Credit-based": "按额度计费",
    "Enterprise": "企业版"
  } as Record<string, string>,
  writerUseCases: [
    {
      "name": "长篇内容",
      "desc": "大规模生成文章、报告与深度内容"
    },
    {
      "name": "SEO 内容",
      "desc": "融入 AI 关键词优化,写出能排名靠前的博客文章"
    },
    {
      "name": "邮件文案",
      "desc": "标题、邮件序列与冷启动外联"
    },
    {
      "name": "社交媒体",
      "desc": "几秒内生成推特帖子串、动态和 LinkedIn 内容"
    }
  ] as UseCaseOverride[],
  devUseCases: [
    {
      "name": "AI 编程 IDE",
      "desc": "在 AI 辅助下编写、调试和部署"
    },
    {
      "name": "API 工具",
      "desc": "几分钟内将 AI 集成进您的应用"
    },
    {
      "name": "UI 生成",
      "desc": "从提示词几秒内生成可用于生产环境的 React 代码"
    },
    {
      "name": "代码审查",
      "desc": "AI 驱动的漏洞检测与重构建议"
    }
  ] as UseCaseOverride[],
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      "source": "OpenAI",
      "category": "产品发布",
      "title": "OpenAI 发布 GPT-5,支持 100 万 token 上下文与实时推理",
      "excerpt": "OpenAI 旗舰模型的新一代版本带来了 10 倍大的上下文窗口、更强的推理能力,以及无需插件的原生实时联网访问。",
      "time": "2 小时前",
      "read": "5 分钟阅读"
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      "source": "Google DeepMind",
      "category": "研究",
      "title": "DeepMind 发布 Gemini 2.5,新增多模态能力",
      "time": "4 小时前",
      "read": "3 分钟阅读"
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      "source": "Anthropic",
      "category": "产品发布",
      "title": "Claude 4 发布,推出扩展思考与计算机操作 2.0 功能",
      "time": "6 小时前",
      "read": "4 分钟阅读"
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      "source": "OpenAI",
      "category": "视频 AI",
      "title": "Sora 2.0 现已支持 4K 输出及 5 分钟长视频生成",
      "time": "6 小时前",
      "read": "2 分钟阅读"
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      "source": "Mistral AI",
      "category": "研究",
      "title": "Mixtral 9x22B 开源发布 — 以三分之一成本达到 GPT-4 水准",
      "time": "10 小时前",
      "read": "3 分钟阅读"
    }
  } as Record<string, NewsOverride>,
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      "tag": "指南",
      "title": "GPT-5 完全指南:您需要知道的一切",
      "date": "5月4日",
      "read": "8分钟"
    },
    "chatgpt-vs-claude-4": {
      "tag": "对比",
      "title": "ChatGPT vs Claude 4(2026):谁才是最强 AI?",
      "date": "5月1日",
      "read": "12分钟"
    },
    "best-free-ai-marketing-tools": {
      "tag": "推荐",
      "title": "2026年营销人员必备的7款免费 AI 工具",
      "date": "4月25日",
      "read": "9分钟"
    }
  } as Record<string, BlogOverride>,
};

const TRANSLATIONS_DE = {
  tools: {
    "chatgpt": {
      "desc": "Die weltweit führende AI für Schreiben, Coding, Brainstorming und kreative Arbeit. Von Millionen Menschen weltweit vertraut.",
      "tags": [
        "Chat",
        "Schreiben"
      ]
    },
    "midjourney": {
      "desc": "Verwandelt Textbeschreibungen in atemberaubend schöne Bilder. Der Maßstab für AI-Kunstgenerierung.",
      "tags": [
        "Bild"
      ]
    },
    "claude": {
      "desc": "Anthropics durchdachte AI für präzises Reasoning, lange Kontextanalysen und sichere, hilfreiche Antworten.",
      "tags": [
        "Chat",
        "Schreiben"
      ]
    },
    "perplexity": {
      "desc": "Die AI-Suchmaschine, die verlässliche Informationen in Echtzeit findet, zusammenfasst und mit Quellen belegt.",
      "tags": [
        "Suche",
        "Recherche"
      ]
    },
    "cursor": {
      "desc": "Die AI-gestützte IDE. Schreibe, debugge und refaktoriere mit einer AI, die deine gesamte Codebasis versteht.",
      "tags": [
        "Code"
      ]
    },
    "runway": {
      "desc": "Professionelle AI-Videogenerierung, -bearbeitung und visuelle Effekte für Filmemacher und Kreative.",
      "tags": [
        "Video"
      ]
    },
    "suno": {
      "desc": "Erzeugt vollständige, radiotaugliche Songs aus Textprompts. Songtext, Melodie und Mastering — alles von der AI.",
      "tags": [
        "Audio",
        "Musik"
      ]
    },
    "elevenlabs": {
      "desc": "Ultrarealistische AI-Stimmklonung und Text-zu-Sprache in 32 Sprachen. Die führende Voice-AI der Branche.",
      "tags": [
        "Stimme",
        "Audio"
      ]
    },
    "v0": {
      "desc": "Erzeugt produktionsreife React- + Tailwind-UI-Komponenten aus natürlichsprachigen Beschreibungen.",
      "tags": [
        "Code",
        "Design"
      ]
    },
    "gemini": {
      "desc": "Googles multimodale AI, die Text, Bild, Audio, Video und Code gleichzeitig verarbeitet.",
      "tags": [
        "Chat",
        "Recherche"
      ]
    },
    "ideogram": {
      "desc": "Typografiefokussierte Bildgenerierung. Rendert Text in Bildern perfekt — erste Wahl für Design.",
      "tags": [
        "Bild"
      ]
    },
    "kling": {
      "desc": "Erzeugt hochwertige, filmische Videos mit physikalisch präziser Bewegung aus Bildern und Text.",
      "tags": [
        "Video"
      ]
    }
  } as Record<string, ToolOverride>,
  categories: {
    "Writing & Editing": "Schreiben & Bearbeiten",
    "Image Generation": "Bildgenerierung",
    "Video": "Video",
    "Video & Animation": "Video & Animation",
    "Code & Developer": "Code & Entwicklung",
    "Marketing": "Marketing",
    "Marketing & Sales": "Marketing & Vertrieb",
    "Productivity": "Produktivität",
    "Productivity & Automation": "Produktivität & Automatisierung",
    "Audio & Music": "Audio & Musik",
    "Research & Data": "Recherche & Daten",
    "Design & Creative": "Design & Kreatives",
    "Business & Finance": "Business & Finanzen",
    "Education": "Bildung",
    "Education & Learning": "Bildung & Lernen",
    "Automation": "Automatisierung",
    "Chatbots & Assistants": "Chatbots & Assistenten",
    "Customer Support": "Kundensupport",
    "Translation & Language": "Übersetzung & Sprache",
    "Resume & Career": "Lebenslauf & Karriere",
    "Email Assistants": "E-Mail-Assistenten",
    "SEO & Content": "SEO & Content",
    "Social Media": "Social Media",
    "PDF & Documents": "PDF & Dokumente",
    "3D & AR / VR": "3D & AR / VR",
    "Avatar Generation": "Avatar-Generierung",
    "Gaming & Entertainment": "Gaming & Unterhaltung",
    "Healthcare & Medical": "Gesundheit & Medizin",
    "Legal & Compliance": "Recht & Compliance",
    "HR & Recruiting": "HR & Recruiting",
    "Real Estate": "Immobilien",
    "Travel & Hospitality": "Reisen & Hospitality",
    "Architecture & Interior": "Architektur & Innenarchitektur",
    "Music Production": "Musikproduktion",
    "Voice Cloning": "Stimmklonung",
    "Speech Recognition": "Spracherkennung",
    "Text-to-Speech": "Text-zu-Sprache",
    "Spreadsheet AI": "Tabellenkalkulations-AI",
    "Note-Taking": "Notizen",
    "Mind Mapping": "Mindmapping",
    "Recipe & Food AI": "Rezept- & Food-AI",
    "Fitness & Wellness": "Fitness & Wellness",
    "E-commerce": "E-Commerce",
    "Photo Editing": "Fotobearbeitung",
    "Logo Makers": "Logo-Generatoren",
    "UI / UX Design": "UI-/UX-Design",
    "Game Asset Generation": "Game-Asset-Generierung",
    "Data Visualization": "Datenvisualisierung",
    "OCR & Document AI": "OCR & Dokumenten-AI",
    "AI Detectors": "AI-Detektoren",
    "Plagiarism Checkers": "Plagiatsprüfung",
    "AI Agents": "AI-Agenten",
    "No-code AI": "No-Code-AI",
    "Analytics": "Analytics"
  } as Record<string, string>,
  popularCategoryDescs: {
    "Writing & Editing": "Texte erstellen, bearbeiten und verfeinern — von Blogartikeln über Marketing-Copy bis zu langer Belletristik.",
    "Image Generation": "Erzeuge Bilder, Illustrationen und Kunst aus Textprompts mit den neuesten Diffusionsmodellen.",
    "Code & Developer": "AI-Pair-Programmer, Autovervollständigung, Code-Reviewer und Full-Stack-Generatoren.",
    "Video & Animation": "Video-Generierung, -Bearbeitung und Animation — von Text-zu-Video über Hintergrundentfernung bis Lippensynchronisation.",
    "Audio & Music": "Stimmklonung, Musikgenerierung, Transkription, Podcast-Produktion und Sounddesign.",
    "Productivity & Automation": "Kalender-AI, Meeting-Zusammenfassungen, Aufgabenautomatisierung und persönliche Workflow-Assistenten."
  } as Record<string, string>,
  useCases: {
    "Write a blog post": {
      "name": "Blogartikel schreiben",
      "desc": "Tools, die Recherche, Gliederung und Schreiben beschleunigen."
    },
    "Create a logo": {
      "name": "Logo erstellen",
      "desc": "AI-Designtools für Logos, Markenidentität und visuelle Assets."
    },
    "Analyse data": {
      "name": "Daten analysieren",
      "desc": "Tabellen, CSVs und Datenbanken mit AI verstehen."
    },
    "Edit a video": {
      "name": "Video bearbeiten",
      "desc": "Schnitt, Untertitel und Farbkorrektur mit AI-Unterstützung."
    },
    "Reply to emails": {
      "name": "E-Mails beantworten",
      "desc": "Postfach schneller verfassen, zusammenfassen und verwalten."
    },
    "Transcribe audio": {
      "name": "Audio transkribieren",
      "desc": "Meetings, Podcasts und Anrufe in durchsuchbaren Text verwandeln."
    },
    "Ship code faster": {
      "name": "Code schneller ausliefern",
      "desc": "AI-Pair-Programmer, Codegeneratoren und Debug-Helfer."
    },
    "Run social media": {
      "name": "Social Media betreiben",
      "desc": "Content über mehrere Plattformen hinweg planen, erstellen und analysieren."
    }
  } as Record<string, { name: string; desc: string }>,
  pricingTiers: {
    "Free": {
      "name": "Komplett kostenlos",
      "desc": "Open-Source- oder komplett kostenlose Tools — nutzbar ohne bezahlten Plan."
    },
    "Freemium": {
      "name": "Kostenlose Version verfügbar",
      "desc": "Großzügiger kostenloser Plan plus optionales bezahltes Upgrade für mehr Funktionen."
    },
    "Paid": {
      "name": "Nur kostenpflichtig",
      "desc": "Abo-basierte Premium-Tools — keine kostenlose Version."
    },
    "Enterprise": {
      "name": "Individuelle Preise",
      "desc": "Enterprise-Tools mit individuellen Verträgen und dediziertem Support."
    }
  } as Record<string, { name: string; desc: string }>,
  subCategories: {
    "SEO & Content": "SEO & Content",
    "AI Copywriting": "AI-Copywriting",
    "Email Marketing": "E-Mail-Marketing",
    "Social Media": "Social Media",
    "Ad Creative": "Anzeigen-Creatives",
    "Analytics": "Analytics"
  } as Record<string, string>,
  marketingFaq: [
    {
      "q": "Was sind die besten AI-Marketing-Tools im Jahr 2026?",
      "a": "Für die meisten Marketingteams ist **Jasper AI** die beste Wahl — es vereint AI-Copywriting, Training auf die Markenstimme, einen SEO-Modus und Teamzusammenarbeit in einer Plattform. Für Solo-Gründer oder Teams mit kleinem Budget eignet sich der starke kostenlose Plan von **Copy.ai**, und für SEO-fokussierten Content ist **Writesonic** hervorragend. Was „das Beste“ ist, hängt vom Anwendungsfall ab: Blog-Content, Anzeigen-Creatives, E-Mail-Automatisierung oder Full-Funnel-Marketing."
    },
    {
      "q": "Gibt es kostenlose AI-Marketing-Tools?",
      "a": "Ja — von den 108 Tools in dieser Kategorie haben 31 einen komplett kostenlosen Plan, und 52 bieten einen großzügigen Freemium-Plan an. Oben kannst du mit dem Filter „Kostenlos“ oder „Freemium“ alle anzeigen. Beliebte kostenlose Optionen: Copy.ai, ChatGPT (kostenloser Plan), Canva Magic Write und die kostenlosen AI-Tools von HubSpot."
    },
    {
      "q": "Können AI-Marketing-Tools ein Marketingteam ersetzen?",
      "a": "Nein — AI-Marketing-Tools sollte man eher als Verstärker denn als Ersatz verstehen. Wiederkehrende Aufgaben (Textentwürfe, Varianten erstellen, Planung, Reporting) übernimmt die AI, während sich Marketer auf Strategie, Marke und wirkungsstarke Entscheidungen konzentrieren. Die meisten Teams berichten von einer 2- bis 5-fachen Produktivitätssteigerung — es geht eher um mehr Ergebnisse als um weniger Personal."
    },
    {
      "q": "Welches AI-Marketing-Tool eignet sich am besten für SEO?",
      "a": "**Surfer SEO** und **Frase** sind die besten AI-gestützten SEO-Content-Tools — beide kombinieren SERP-Analyse mit AI-Writing, um Texte für Top-Platzierungen zu erstellen. Für technisches SEO bieten auch **Semrush** und **Ahrefs** starke integrierte AI-Funktionen."
    },
    {
      "q": "Wie finde ich das richtige AI-Marketing-Tool für mich?",
      "a": "Starte bei deinem größten Engpass. Stockt die Content-Produktion, brauchst du einen AI-Copywriter. Rankt dein Blog nicht, ein SEO-Tool. Stagniert die E-Mail-Performance, eine E-Mail-AI. Führe nicht gleich fünf Tools auf einmal ein — wähle eines, integriere es gründlich, und ergänze dann bei Bedarf."
    }
  ] as Array<{ q: string; a: string }>,
  marketingFacts: {
    "Total tools": "Tools insgesamt",
    "Free tools": "Kostenlose Tools",
    "Freemium": "Freemium",
    "Paid only": "Nur kostenpflichtig",
    "Avg starting price": "Ø Startpreis",
    "Top use case": "Top-Anwendungsfall"
  } as Record<string, string>,
  relatedSliderTools: {
    "Claude": {
      "cat": "AI-Chat · Anthropic",
      "desc": "Anthropics präzises Reasoning und lange Kontextanalyse."
    },
    "Google Gemini": {
      "cat": "AI-Chat · Google",
      "desc": "Googles multimodale AI für Text, Bild und Video."
    },
    "Perplexity": {
      "cat": "AI-Suche",
      "desc": "AI-Suche mit Quellenangaben in Echtzeit."
    },
    "MS Copilot": {
      "cat": "AI-Chat · Microsoft",
      "desc": "Microsofts AI-Assistent auf Basis von GPT-4."
    },
    "Mistral": {
      "cat": "AI-Chat",
      "desc": "Open-Weight-Modelle mit herausragender Effizienz."
    },
    "Cohere": {
      "cat": "AI-API",
      "desc": "Enterprise-taugliche Sprach-AI für Businessteams."
    },
    "Groq": {
      "cat": "AI-API",
      "desc": "Ultraschnelle LLM-Inferenz für Entwickler."
    }
  } as Record<string, { cat: string; desc: string }>,
  pricingTags: {
    "Free": "Kostenlos",
    "Free tier": "Kostenlose Version",
    "Free Trial": "Kostenlose Testphase",
    "Paid": "Kostenpflichtig",
    "Credit-based": "Guthabenbasiert",
    "Enterprise": "Enterprise"
  } as Record<string, string>,
  writerUseCases: [
    {
      "name": "Langform-Content",
      "desc": "Artikel, Berichte und Tiefenrecherchen im großen Maßstab"
    },
    {
      "name": "SEO-Content",
      "desc": "Blogartikel für Top-Rankings mit integrierten AI-Keywords"
    },
    {
      "name": "E-Mail-Texte",
      "desc": "Betreffzeilen, Sequenzen und Cold Outreach"
    },
    {
      "name": "Social Media",
      "desc": "Twitter-Threads, Posts und LinkedIn-Beiträge in Sekunden"
    }
  ] as UseCaseOverride[],
  devUseCases: [
    {
      "name": "AI-Coding-IDE",
      "desc": "Schreiben, Debuggen und Deployen mit AI-Unterstützung"
    },
    {
      "name": "API-Tools",
      "desc": "AI in Minuten in deine App integrieren"
    },
    {
      "name": "UI-Generierung",
      "desc": "Vom Prompt zu produktionsreifem React in Sekunden"
    },
    {
      "name": "Code-Review",
      "desc": "AI-gestützte Fehlererkennung und Refactoring"
    }
  ] as UseCaseOverride[],
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      "source": "OpenAI",
      "category": "Produktlaunch",
      "title": "OpenAI veröffentlicht GPT-5 mit 1-Mio.-Token-Kontext und Echtzeit-Reasoning",
      "excerpt": "Die nächste Generation von OpenAIs Flaggschiffmodell bietet ein 10-mal größeres Kontextfenster, verbessertes Reasoning und nativen Echtzeit-Webzugriff ohne Plugins.",
      "time": "vor 2 Stunden",
      "read": "5 Min. Lesezeit"
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      "source": "Google DeepMind",
      "category": "Forschung",
      "title": "DeepMind veröffentlicht Gemini 2.5 mit neuen multimodalen Fähigkeiten",
      "time": "vor 4 Stunden",
      "read": "3 Min. Lesezeit"
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      "source": "Anthropic",
      "category": "Produktlaunch",
      "title": "Claude 4 startet mit Extended Thinking und Computer Use 2.0",
      "time": "vor 6 Stunden",
      "read": "4 Min. Lesezeit"
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      "source": "OpenAI",
      "category": "Video-AI",
      "title": "Sora 2.0 unterstützt jetzt 4K-Ausgabe und 5-minütige Videogenerierung",
      "time": "vor 6 Stunden",
      "read": "2 Min. Lesezeit"
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      "source": "Mistral AI",
      "category": "Forschung",
      "title": "Mixtral 9x22B als Open Source veröffentlicht — GPT-4-Niveau zu einem Drittel der Kosten",
      "time": "vor 10 Stunden",
      "read": "3 Min. Lesezeit"
    }
  } as Record<string, NewsOverride>,
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      "tag": "Guide",
      "title": "Der komplette GPT-5-Guide: Alles, was du wissen musst",
      "date": "4. Mai",
      "read": "8 Min."
    },
    "chatgpt-vs-claude-4": {
      "tag": "Vergleich",
      "title": "ChatGPT vs. Claude 4 (2026): Welche AI gewinnt?",
      "date": "1. Mai",
      "read": "12 Min."
    },
    "best-free-ai-marketing-tools": {
      "tag": "Empfehlung",
      "title": "Die 7 besten kostenlosen AI-Tools für Marketer 2026",
      "date": "25. April",
      "read": "9 Min."
    }
  } as Record<string, BlogOverride>,
};

const TRANSLATIONS_FR = {
  tools: {
    "chatgpt": {
      "desc": "La meilleure IA au monde pour l'écriture, le code, le brainstorming et la création. Plébiscitée par des millions de personnes dans le monde.",
      "tags": [
        "Chat",
        "Écriture"
      ]
    },
    "midjourney": {
      "desc": "Transforme vos descriptions textuelles en images d'une beauté à couper le souffle. La référence de la génération d'art par IA.",
      "tags": [
        "Image"
      ]
    },
    "claude": {
      "desc": "L'IA réfléchie d'Anthropic, pensée pour un raisonnement fin, l'analyse de longs contextes et des réponses sûres et utiles.",
      "tags": [
        "Chat",
        "Écriture"
      ]
    },
    "perplexity": {
      "desc": "Le moteur de recherche IA qui trouve, résume et cite des informations fiables en temps réel.",
      "tags": [
        "Recherche",
        "Étude"
      ]
    },
    "cursor": {
      "desc": "L'IDE propulsé par l'IA. Écrivez, déboguez et refactorisez avec une IA qui comprend l'intégralité de votre base de code.",
      "tags": [
        "Code"
      ]
    },
    "runway": {
      "desc": "Génération vidéo, montage et effets visuels IA professionnels pour cinéastes et créateurs.",
      "tags": [
        "Vidéo"
      ]
    },
    "suno": {
      "desc": "Générez des morceaux complets de qualité radio à partir d'un simple prompt texte. Paroles, mélodie et mastering, tout est géré par l'IA.",
      "tags": [
        "Audio",
        "Musique"
      ]
    },
    "elevenlabs": {
      "desc": "Clonage vocal IA ultra-réaliste et synthèse vocale dans 32 langues. La meilleure IA vocale du marché.",
      "tags": [
        "Voix",
        "Audio"
      ]
    },
    "v0": {
      "desc": "Génère des composants d'interface React + Tailwind prêts pour la production à partir d'une simple description en langage naturel.",
      "tags": [
        "Code",
        "Design"
      ]
    },
    "gemini": {
      "desc": "L'IA multimodale de Google, capable de raisonner simultanément sur le texte, l'image, l'audio, la vidéo et le code.",
      "tags": [
        "Chat",
        "Recherche"
      ]
    },
    "ideogram": {
      "desc": "Génération d'images centrée sur la typographie. Rendu parfait du texte dans l'image — le choix numéro un pour le design.",
      "tags": [
        "Image"
      ]
    },
    "kling": {
      "desc": "Génère, à partir d'images ou de texte, des vidéos cinématographiques haute qualité au mouvement physiquement réaliste.",
      "tags": [
        "Vidéo"
      ]
    }
  } as Record<string, ToolOverride>,
  categories: {
    "Writing & Editing": "Écriture & édition",
    "Image Generation": "Génération d'images",
    "Video": "Vidéo",
    "Video & Animation": "Vidéo & animation",
    "Code & Developer": "Code & développement",
    "Marketing": "Marketing",
    "Marketing & Sales": "Marketing & ventes",
    "Productivity": "Productivité",
    "Productivity & Automation": "Productivité & automatisation",
    "Audio & Music": "Audio & musique",
    "Research & Data": "Recherche & données",
    "Design & Creative": "Design & créativité",
    "Business & Finance": "Business & finance",
    "Education": "Éducation",
    "Education & Learning": "Éducation & apprentissage",
    "Automation": "Automatisation",
    "Chatbots & Assistants": "Chatbots & assistants",
    "Customer Support": "Support client",
    "Translation & Language": "Traduction & langues",
    "Resume & Career": "CV & carrière",
    "Email Assistants": "Assistants e-mail",
    "SEO & Content": "SEO & contenu",
    "Social Media": "Réseaux sociaux",
    "PDF & Documents": "PDF & documents",
    "3D & AR / VR": "3D & RA / RV",
    "Avatar Generation": "Génération d'avatars",
    "Gaming & Entertainment": "Jeux vidéo & divertissement",
    "Healthcare & Medical": "Santé & médecine",
    "Legal & Compliance": "Juridique & conformité",
    "HR & Recruiting": "RH & recrutement",
    "Real Estate": "Immobilier",
    "Travel & Hospitality": "Voyage & hôtellerie",
    "Architecture & Interior": "Architecture & intérieur",
    "Music Production": "Production musicale",
    "Voice Cloning": "Clonage vocal",
    "Speech Recognition": "Reconnaissance vocale",
    "Text-to-Speech": "Synthèse vocale",
    "Spreadsheet AI": "IA pour tableurs",
    "Note-Taking": "Prise de notes",
    "Mind Mapping": "Cartes mentales",
    "Recipe & Food AI": "IA cuisine & recettes",
    "Fitness & Wellness": "Fitness & bien-être",
    "E-commerce": "E-commerce",
    "Photo Editing": "Retouche photo",
    "Logo Makers": "Créateurs de logos",
    "UI / UX Design": "Design UI / UX",
    "Game Asset Generation": "Génération d'assets de jeu",
    "Data Visualization": "Visualisation de données",
    "OCR & Document AI": "OCR & IA documentaire",
    "AI Detectors": "Détecteurs d'IA",
    "Plagiarism Checkers": "Détecteurs de plagiat",
    "AI Agents": "Agents IA",
    "No-code AI": "IA no-code",
    "Analytics": "Analytique"
  } as Record<string, string>,
  popularCategoryDescs: {
    "Writing & Editing": "Générez, éditez et peaufinez vos textes — des articles de blog aux textes marketing, jusqu'à la fiction longue.",
    "Image Generation": "Générez images, illustrations et œuvres d'art à partir d'un simple prompt texte, grâce aux derniers modèles de diffusion.",
    "Code & Developer": "Pair-programmeurs IA, autocomplétion, relecteurs de code et générateurs full-stack.",
    "Video & Animation": "Génération, montage et animation vidéo — du texte-vers-vidéo à la suppression d'arrière-plan et au lip-sync.",
    "Audio & Music": "Clonage vocal, génération musicale, transcription, production de podcasts et sound design.",
    "Productivity & Automation": "IA de calendrier, résumés de réunions, automatisation des tâches et assistants de workflow personnel."
  } as Record<string, string>,
  useCases: {
    "Write a blog post": {
      "name": "Rédiger un article de blog",
      "desc": "Des outils pour accélérer la recherche, le plan et la rédaction."
    },
    "Create a logo": {
      "name": "Créer un logo",
      "desc": "Des outils de design IA pour logos, identité de marque et assets visuels."
    },
    "Analyse data": {
      "name": "Analyser des données",
      "desc": "Comprenez vos tableurs, fichiers CSV et bases de données grâce à l'IA."
    },
    "Edit a video": {
      "name": "Monter une vidéo",
      "desc": "Découpe, sous-titres et étalonnage assistés par IA."
    },
    "Reply to emails": {
      "name": "Répondre à ses e-mails",
      "desc": "Rédigez, résumez et gérez votre boîte de réception plus vite."
    },
    "Transcribe audio": {
      "name": "Transcrire de l'audio",
      "desc": "Transformez réunions, podcasts et appels en texte consultable."
    },
    "Ship code faster": {
      "name": "Livrer du code plus vite",
      "desc": "Pair-programmeurs IA, générateurs de code et assistants de débogage."
    },
    "Run social media": {
      "name": "Gérer les réseaux sociaux",
      "desc": "Planifiez, rédigez et analysez votre contenu sur toutes les plateformes."
    }
  } as Record<string, { name: string; desc: string }>,
  pricingTiers: {
    "Free": {
      "name": "Entièrement gratuit",
      "desc": "Outils open source ou entièrement gratuits — utilisables sans aucun plan payant."
    },
    "Freemium": {
      "name": "Offre gratuite disponible",
      "desc": "Un plan gratuit généreux, avec une mise à niveau payante en option pour plus de fonctionnalités."
    },
    "Paid": {
      "name": "Payant uniquement",
      "desc": "Outils premium par abonnement — pas de version gratuite."
    },
    "Enterprise": {
      "name": "Tarif sur mesure",
      "desc": "Outils entreprise avec contrats personnalisés et support dédié."
    }
  } as Record<string, { name: string; desc: string }>,
  subCategories: {
    "SEO & Content": "SEO & contenu",
    "AI Copywriting": "Copywriting IA",
    "Email Marketing": "E-mail marketing",
    "Social Media": "Réseaux sociaux",
    "Ad Creative": "Créa publicitaire",
    "Analytics": "Analytique"
  } as Record<string, string>,
  marketingFaq: [
    {
      "q": "Quels sont les meilleurs outils IA marketing en 2026 ?",
      "a": "Pour la plupart des équipes marketing, **Jasper AI** est le meilleur choix — copywriting IA, apprentissage de la voix de marque, mode SEO et collaboration d'équipe réunis sur une seule plateforme. Pour les créateurs solo ou les équipes à petit budget, le généreux plan gratuit de **Copy.ai** est une excellente option, et pour le contenu axé SEO, **Writesonic** excelle. Le \"meilleur\" outil dépend surtout de votre cas d'usage : contenu de blog, créa publicitaire, automatisation des e-mails, marketing full-funnel, etc."
    },
    {
      "q": "Existe-t-il des outils IA marketing gratuits ?",
      "a": "Oui — sur les 108 outils de cette catégorie, 31 proposent un plan entièrement gratuit et 52 offrent une formule freemium généreuse. Utilisez les filtres \"Gratuit\" ou \"Freemium\" en haut de page pour tous les voir. Options gratuites populaires : Copy.ai, ChatGPT (plan gratuit), Canva Magic Write, ou encore les outils IA gratuits de HubSpot."
    },
    {
      "q": "Les outils IA marketing peuvent-ils remplacer une équipe marketing ?",
      "a": "Non — mieux vaut voir les outils IA marketing comme un amplificateur plutôt qu'un remplaçant. L'IA prend en charge les tâches répétitives (brouillons de copy, génération de variantes, planification, reporting), pendant que les marketeurs se concentrent sur la stratégie, la marque et les décisions à fort impact. La plupart des équipes rapportent des gains de productivité de 2 à 5 fois — il s'agit de démultiplier les résultats, pas de réduire les effectifs."
    },
    {
      "q": "Quel est le meilleur outil IA marketing pour le SEO ?",
      "a": "**Surfer SEO** et **Frase** sont les meilleurs outils de contenu SEO propulsés par l'IA — tous deux combinent analyse des SERP et rédaction IA pour produire des articles bien positionnés. Pour le SEO technique, **Semrush** et **Ahrefs** intègrent aussi de puissantes fonctionnalités IA."
    },
    {
      "q": "Comment choisir l'outil IA marketing qui me convient ?",
      "a": "Commencez par votre plus gros goulot d'étranglement. Si la publication de contenu bloque, prenez un copywriter IA. Si votre blog ne se positionne pas, un outil SEO. Si vos e-mails stagnent, une IA e-mail. N'adoptez pas cinq outils à la fois — choisissez-en un, intégrez-le en profondeur, puis ajoutez-en d'autres."
    }
  ] as Array<{ q: string; a: string }>,
  marketingFacts: {
    "Total tools": "Total des outils",
    "Free tools": "Outils gratuits",
    "Freemium": "Freemium",
    "Paid only": "Payant uniquement",
    "Avg starting price": "Prix de départ moyen",
    "Top use case": "Cas d'usage principal"
  } as Record<string, string>,
  relatedSliderTools: {
    "Claude": {
      "cat": "IA conversationnelle · Anthropic",
      "desc": "Le raisonnement fin et l'analyse de longs contextes signés Anthropic."
    },
    "Google Gemini": {
      "cat": "IA conversationnelle · Google",
      "desc": "L'IA multimodale de Google, à l'aise avec le texte, l'image et la vidéo."
    },
    "Perplexity": {
      "cat": "Recherche IA",
      "desc": "Un moteur de recherche IA qui cite ses sources en temps réel."
    },
    "MS Copilot": {
      "cat": "IA conversationnelle · Microsoft",
      "desc": "L'assistant IA de Microsoft, basé sur GPT-4."
    },
    "Mistral": {
      "cat": "IA conversationnelle",
      "desc": "Des modèles à poids ouverts, réputés pour leur efficacité."
    },
    "Cohere": {
      "cat": "API IA",
      "desc": "Une IA linguistique de niveau entreprise pour les équipes business."
    },
    "Groq": {
      "cat": "API IA",
      "desc": "Une inférence LLM ultra-rapide pour les développeurs."
    }
  } as Record<string, { cat: string; desc: string }>,
  pricingTags: {
    "Free": "Gratuit",
    "Free tier": "Offre gratuite",
    "Free Trial": "Essai gratuit",
    "Paid": "Payant",
    "Credit-based": "Basé sur des crédits",
    "Enterprise": "Entreprise"
  } as Record<string, string>,
  writerUseCases: [
    {
      "name": "Contenu long format",
      "desc": "Articles, rapports et contenus approfondis, à grande échelle"
    },
    {
      "name": "Contenu SEO",
      "desc": "Des articles de blog optimisés pour le référencement, avec intégration de mots-clés par l'IA"
    },
    {
      "name": "Copywriting e-mail",
      "desc": "Objets, séquences et prospection à froid"
    },
    {
      "name": "Réseaux sociaux",
      "desc": "Threads Twitter, posts et publications LinkedIn en quelques secondes"
    }
  ] as UseCaseOverride[],
  devUseCases: [
    {
      "name": "IDE de code IA",
      "desc": "Écrivez, déboguez et déployez avec l'aide de l'IA"
    },
    {
      "name": "Outils API",
      "desc": "Intégrez l'IA à vos applications en quelques minutes"
    },
    {
      "name": "Génération d'interfaces",
      "desc": "Du prompt au React prêt pour la production, en quelques secondes"
    },
    {
      "name": "Revue de code",
      "desc": "Détection de bugs et refactorisation propulsées par l'IA"
    }
  ] as UseCaseOverride[],
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      "source": "OpenAI",
      "category": "Lancement produit",
      "title": "OpenAI lance GPT-5, avec un contexte de 1 million de tokens et un raisonnement en temps réel",
      "excerpt": "La nouvelle génération du modèle phare d'OpenAI offre une fenêtre de contexte 10 fois plus grande, un raisonnement amélioré et un accès web natif en temps réel, sans plugin.",
      "time": "il y a 2 heures",
      "read": "5 min de lecture"
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      "source": "Google DeepMind",
      "category": "Recherche",
      "title": "DeepMind dévoile Gemini 2.5 et ses nouvelles capacités multimodales",
      "time": "il y a 4 heures",
      "read": "3 min de lecture"
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      "source": "Anthropic",
      "category": "Lancement produit",
      "title": "Claude 4 est lancé avec la réflexion étendue et l'utilisation d'ordinateur 2.0",
      "time": "il y a 6 heures",
      "read": "4 min de lecture"
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      "source": "OpenAI",
      "category": "IA vidéo",
      "title": "Sora 2.0 prend désormais en charge la sortie 4K et la génération de vidéos de 5 minutes",
      "time": "il y a 6 heures",
      "read": "2 min de lecture"
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      "source": "Mistral AI",
      "category": "Recherche",
      "title": "Mixtral 9x22B passe open source — niveau GPT-4 à un coût 3 fois inférieur",
      "time": "il y a 10 heures",
      "read": "3 min de lecture"
    }
  } as Record<string, NewsOverride>,
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      "tag": "Guide",
      "title": "Le guide complet de GPT-5 : tout ce qu'il faut savoir",
      "date": "4 mai",
      "read": "8 min"
    },
    "chatgpt-vs-claude-4": {
      "tag": "Comparatif",
      "title": "ChatGPT vs Claude 4 (2026) : quelle IA l'emporte ?",
      "date": "1er mai",
      "read": "12 min"
    },
    "best-free-ai-marketing-tools": {
      "tag": "Sélection",
      "title": "7 meilleurs outils IA gratuits pour marketeurs en 2026",
      "date": "25 avril",
      "read": "9 min"
    }
  } as Record<string, BlogOverride>,
};

const TRANSLATIONS_JA = {
  tools: {
    "chatgpt": {
      "desc": "文章作成、コーディング、ブレインストーミング、クリエイティブな作業のための世界最高峰のAI。世界中の数百万人に信頼されています。",
      "tags": [
        "チャット",
        "ライティング"
      ]
    },
    "midjourney": {
      "desc": "テキストの説明を息をのむほど美しい画像に変換。AIアート生成のスタンダード。",
      "tags": [
        "画像"
      ]
    },
    "claude": {
      "desc": "精緻な推論、長文コンテキスト分析、安全で頼りになる応答を実現するAnthropicの思慮深いAI。",
      "tags": [
        "チャット",
        "ライティング"
      ]
    },
    "perplexity": {
      "desc": "信頼できる情報をリアルタイムで検索・要約・引用するAI検索エンジン。",
      "tags": [
        "検索",
        "リサーチ"
      ]
    },
    "cursor": {
      "desc": "AI搭載のIDE。コードベース全体を理解するAIと一緒にコードを書き、デバッグし、リファクタリングできます。",
      "tags": [
        "コード"
      ]
    },
    "runway": {
      "desc": "映画制作者やクリエイターのためのプロフェッショナルなAI動画生成・編集・視覚効果ツール。",
      "tags": [
        "動画"
      ]
    },
    "suno": {
      "desc": "テキストプロンプトからラジオ品質のフル楽曲を生成。歌詞、メロディ、マスタリングすべてAI任せ。",
      "tags": [
        "オーディオ",
        "音楽"
      ]
    },
    "elevenlabs": {
      "desc": "32言語対応の超リアルなAI音声クローンとテキスト読み上げ。業界最高峰のボイスAI。",
      "tags": [
        "音声",
        "オーディオ"
      ]
    },
    "v0": {
      "desc": "自然言語の説明からプロダクション品質のReact + Tailwind UIコンポーネントを生成。",
      "tags": [
        "コード",
        "デザイン"
      ]
    },
    "gemini": {
      "desc": "テキスト、画像、音声、動画、コードを同時に推論するGoogleのマルチモーダルAI。",
      "tags": [
        "チャット",
        "リサーチ"
      ]
    },
    "ideogram": {
      "desc": "タイポグラフィ重視の画像生成。画像内のテキストを完璧にレンダリング — デザイン用途に最適。",
      "tags": [
        "画像"
      ]
    },
    "kling": {
      "desc": "画像やテキストから物理的に正確な動きの高品質でシネマティックな動画を生成。",
      "tags": [
        "動画"
      ]
    }
  } as Record<string, ToolOverride>,
  categories: {
    "Writing & Editing": "ライティング & 編集",
    "Image Generation": "画像生成",
    "Video": "動画",
    "Video & Animation": "動画 & アニメーション",
    "Code & Developer": "コード & 開発者向け",
    "Marketing": "マーケティング",
    "Marketing & Sales": "マーケティング & 営業",
    "Productivity": "生産性",
    "Productivity & Automation": "生産性 & 自動化",
    "Audio & Music": "オーディオ & 音楽",
    "Research & Data": "リサーチ & データ",
    "Design & Creative": "デザイン & クリエイティブ",
    "Business & Finance": "ビジネス & ファイナンス",
    "Education": "教育",
    "Education & Learning": "教育 & 学習",
    "Automation": "自動化",
    "Chatbots & Assistants": "チャットボット & アシスタント",
    "Customer Support": "カスタマーサポート",
    "Translation & Language": "翻訳 & 言語",
    "Resume & Career": "履歴書 & キャリア",
    "Email Assistants": "メールアシスタント",
    "SEO & Content": "SEO & コンテンツ",
    "Social Media": "ソーシャルメディア",
    "PDF & Documents": "PDF & 文書",
    "3D & AR / VR": "3D & AR / VR",
    "Avatar Generation": "アバター生成",
    "Gaming & Entertainment": "ゲーム & エンターテインメント",
    "Healthcare & Medical": "ヘルスケア & 医療",
    "Legal & Compliance": "法務 & コンプライアンス",
    "HR & Recruiting": "人事 & 採用",
    "Real Estate": "不動産",
    "Travel & Hospitality": "旅行 & ホスピタリティ",
    "Architecture & Interior": "建築 & インテリア",
    "Music Production": "音楽制作",
    "Voice Cloning": "音声クローン",
    "Speech Recognition": "音声認識",
    "Text-to-Speech": "テキスト読み上げ",
    "Spreadsheet AI": "スプレッドシートAI",
    "Note-Taking": "ノート作成",
    "Mind Mapping": "マインドマップ",
    "Recipe & Food AI": "レシピ & フードAI",
    "Fitness & Wellness": "フィットネス & ウェルネス",
    "E-commerce": "Eコマース",
    "Photo Editing": "写真編集",
    "Logo Makers": "ロゴメーカー",
    "UI / UX Design": "UI / UX デザイン",
    "Game Asset Generation": "ゲームアセット生成",
    "Data Visualization": "データ可視化",
    "OCR & Document AI": "OCR & 文書AI",
    "AI Detectors": "AI検出ツール",
    "Plagiarism Checkers": "剽窃チェッカー",
    "AI Agents": "AIエージェント",
    "No-code AI": "ノーコードAI",
    "Analytics": "分析"
  } as Record<string, string>,
  popularCategoryDescs: {
    "Writing & Editing": "テキストを生成・編集・磨き上げる — ブログ記事からマーケティングコピー、長編フィクションまで。",
    "Image Generation": "最新の拡散モデルでテキストプロンプトから画像・イラスト・アートを生成します。",
    "Code & Developer": "AIペアプログラマー、自動補完、コードレビュー、フルスタック生成ツール。",
    "Video & Animation": "動画の生成・編集・アニメーション化 — テキストから動画、背景除去、リップシンクまで。",
    "Audio & Music": "音声クローン、音楽生成、文字起こし、ポッドキャスト制作、サウンドデザイン。",
    "Productivity & Automation": "カレンダーAI、会議の要約、作業の自動化、個人向けワークフローアシスタント。"
  } as Record<string, string>,
  useCases: {
    "Write a blog post": {
      "name": "ブログ記事を書く",
      "desc": "リサーチ・構成・執筆をより速くサポートするツール。"
    },
    "Create a logo": {
      "name": "ロゴを作る",
      "desc": "ロゴ・ブランドアイデンティティ・ビジュアル素材のためのAIデザインツール。"
    },
    "Analyse data": {
      "name": "データを分析する",
      "desc": "スプレッドシート・CSV・データベースをAIで理解する。"
    },
    "Edit a video": {
      "name": "動画を編集する",
      "desc": "AIの力でカット・字幕・映像補正。"
    },
    "Reply to emails": {
      "name": "メールに返信する",
      "desc": "受信箱をより速く作成・要約・管理。"
    },
    "Transcribe audio": {
      "name": "音声を文字起こしする",
      "desc": "会議・ポッドキャスト・通話を検索可能なテキストに。"
    },
    "Ship code faster": {
      "name": "コードを素早くリリース",
      "desc": "AIペアプログラマー・コード生成ツール・デバッグ支援。"
    },
    "Run social media": {
      "name": "SNSを運用する",
      "desc": "複数プラットフォームでコンテンツを予約・作成・分析。"
    }
  } as Record<string, { name: string; desc: string }>,
  pricingTiers: {
    "Free": {
      "name": "完全無料",
      "desc": "オープンソースまたは完全無料のツール — 有料プランなしで利用可能。"
    },
    "Freemium": {
      "name": "無料プランあり",
      "desc": "充実した無料プラン + より多くの機能が欲しい場合の有料アップグレード。"
    },
    "Paid": {
      "name": "有料専用",
      "desc": "サブスクリプション型のプレミアムツール — 無料版なし。"
    },
    "Enterprise": {
      "name": "カスタム価格",
      "desc": "カスタム契約と専任サポートが提供されるエンタープライズ向けツール。"
    }
  } as Record<string, { name: string; desc: string }>,
  subCategories: {
    "SEO & Content": "SEO & コンテンツ",
    "AI Copywriting": "AIコピーライティング",
    "Email Marketing": "メールマーケティング",
    "Social Media": "ソーシャルメディア",
    "Ad Creative": "広告クリエイティブ",
    "Analytics": "分析"
  } as Record<string, string>,
  marketingFaq: [
    {
      "q": "2026年最高のAIマーケティングツールは何ですか?",
      "a": "ほとんどのマーケティングチームには**Jasper AI**が最良の選択です — AIコピーライティング、ブランドボイスの学習、SEOモード、チームコラボレーションを一つのプラットフォームに統合。個人創業者や予算の少ないチームには**Copy.ai**の強力な無料プランがおすすめで、SEO中心のコンテンツには**Writesonic**が優れています。「最高」はユースケース次第です: ブログコンテンツ、広告クリエイティブ、メール自動化、フルファネルマーケティングなど。"
    },
    {
      "q": "無料のAIマーケティングツールはありますか?",
      "a": "はい — このカテゴリの108個のツールのうち31個は完全無料プランがあり、52個は充実したプレミアムプランを提供しています。上部の「無料」または「プレミアム」フィルターですべて確認できます。代表的な無料オプション: Copy.ai、ChatGPT（無料プラン）、Canva Magic Write、HubSpotの無料AIツール。"
    },
    {
      "q": "AIマーケティングツールはマーケティングチームを置き換えられますか?",
      "a": "いいえ — AIマーケティングツールは代替ではなく増幅装置と考えるのが適切です。反復作業（コピーの下書き、バリエーション生成、予約投稿、レポーティング）はAIが処理し、マーケターは戦略・ブランド・インパクトの大きい意思決定に集中します。ほとんどのチームが2〜5倍の生産性向上を報告しており、人員削減ではなく成果の拡大に近いものです。"
    },
    {
      "q": "SEOに最も適したAIマーケティングツールは?",
      "a": "**Surfer SEO**と**Frase**が最も優れたAI駆動のSEOコンテンツツールです — どちらもSERP分析とAIライティングを組み合わせ、検索上位表示を狙う記事を作成します。テクニカルSEOでは**Semrush**と**Ahrefs**にも強力なAI機能が組み込まれています。"
    },
    {
      "q": "自分に合ったAIマーケティングツールはどう選べばいいですか?",
      "a": "最大のボトルネックから始めましょう。コンテンツ公開が滞っているならAIコピーライター。ブログが検索でヒットしないならSEOツール。メールの成果が伸び悩んでいるならメールAI。一度に5つも導入しないこと — 1つを選んで深く統合してから、次を追加しましょう。"
    }
  ] as Array<{ q: string; a: string }>,
  marketingFacts: {
    "Total tools": "総ツール数",
    "Free tools": "無料ツール",
    "Freemium": "プレミアム",
    "Paid only": "有料専用",
    "Avg starting price": "平均開始価格",
    "Top use case": "主なユースケース"
  } as Record<string, string>,
  relatedSliderTools: {
    "Claude": {
      "cat": "AIチャット · Anthropic",
      "desc": "Anthropicによる精緻な推論と長文コンテキスト分析。"
    },
    "Google Gemini": {
      "cat": "AIチャット · Google",
      "desc": "テキスト・画像・動画を横断するGoogleのマルチモーダルAI。"
    },
    "Perplexity": {
      "cat": "AI検索",
      "desc": "リアルタイムの引用付きAI検索。"
    },
    "MS Copilot": {
      "cat": "AIチャット · Microsoft",
      "desc": "GPT-4を搭載したMicrosoftのAIアシスタント。"
    },
    "Mistral": {
      "cat": "AIチャット",
      "desc": "卓越した効率性を誇るオープンウェイトモデル。"
    },
    "Cohere": {
      "cat": "AI API",
      "desc": "ビジネスチーム向けのエンタープライズ級言語AI。"
    },
    "Groq": {
      "cat": "AI API",
      "desc": "開発者向けの超高速LLM推論。"
    }
  } as Record<string, { cat: string; desc: string }>,
  pricingTags: {
    "Free": "無料",
    "Free tier": "無料プラン",
    "Free Trial": "無料体験",
    "Paid": "有料",
    "Credit-based": "クレジット制",
    "Enterprise": "エンタープライズ"
  } as Record<string, string>,
  writerUseCases: [
    {
      "name": "長文コンテンツ",
      "desc": "記事、レポート、詳細なコンテンツを大規模に"
    },
    {
      "name": "SEOコンテンツ",
      "desc": "AIによるキーワード統合で検索上位を狙うブログ記事"
    },
    {
      "name": "メールコピー",
      "desc": "件名、シーケンス、コールドアウトリーチ"
    },
    {
      "name": "ソーシャルメディア",
      "desc": "Xスレッド、投稿、LinkedIn投稿を数秒で"
    }
  ] as UseCaseOverride[],
  devUseCases: [
    {
      "name": "AIコーディングIDE",
      "desc": "AIの支援で書く・デバッグ・デプロイ"
    },
    {
      "name": "APIツール",
      "desc": "数分でAIをアプリに統合"
    },
    {
      "name": "UI生成",
      "desc": "プロンプトからプロダクションReactまで数秒"
    },
    {
      "name": "コードレビュー",
      "desc": "AIによるバグ検出とリファクタリング"
    }
  ] as UseCaseOverride[],
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      "source": "OpenAI",
      "category": "製品リリース",
      "title": "OpenAI、100万トークンのコンテキストとリアルタイム推論を備えたGPT-5を発表",
      "excerpt": "OpenAIの主力モデルの次世代版は、コンテキストウィンドウが10倍に拡大し、推論性能が向上、プラグイン不要のネイティブなリアルタイムWebアクセスを提供します。",
      "time": "2時間前",
      "read": "5分で読了"
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      "source": "Google DeepMind",
      "category": "リサーチ",
      "title": "DeepMind、新たなマルチモーダル機能を備えたGemini 2.5を公開",
      "time": "4時間前",
      "read": "3分で読了"
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      "source": "Anthropic",
      "category": "製品リリース",
      "title": "Claude 4、拡張思考とComputer Use 2.0を搭載してリリース",
      "time": "6時間前",
      "read": "4分で読了"
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      "source": "OpenAI",
      "category": "動画AI",
      "title": "Sora 2.0が4K出力と5分間の動画生成に対応",
      "time": "6時間前",
      "read": "2分で読了"
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      "source": "Mistral AI",
      "category": "リサーチ",
      "title": "Mixtral 9x22Bがオープンソース化 — 3分の1のコストでGPT-4レベルを実現",
      "time": "10時間前",
      "read": "3分で読了"
    }
  } as Record<string, NewsOverride>,
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      "tag": "ガイド",
      "title": "GPT-5完全ガイド: 知っておくべきすべてのこと",
      "date": "5月4日",
      "read": "8分"
    },
    "chatgpt-vs-claude-4": {
      "tag": "比較",
      "title": "ChatGPT vs Claude 4（2026年版）: どちらのAIが勝つか?",
      "date": "5月1日",
      "read": "12分"
    },
    "best-free-ai-marketing-tools": {
      "tag": "おすすめ",
      "title": "マーケター向け2026年最高の無料AIツール7選",
      "date": "4月25日",
      "read": "9分"
    }
  } as Record<string, BlogOverride>,
};

const TRANSLATIONS_PT = {
  tools: {
    "chatgpt": {
      "desc": "A IA líder mundial em escrita, programação, brainstorming e tarefas criativas. Usada e confiada por milhões de pessoas ao redor do mundo.",
      "tags": [
        "Chat",
        "Escrita"
      ]
    },
    "midjourney": {
      "desc": "Transforme descrições em texto em imagens de tirar o fôlego. O padrão-ouro da geração de arte com IA.",
      "tags": [
        "Imagem"
      ]
    },
    "claude": {
      "desc": "A IA cuidadosa da Anthropic para raciocínio sofisticado, análise de contexto longo e respostas seguras e úteis.",
      "tags": [
        "Chat",
        "Escrita"
      ]
    },
    "perplexity": {
      "desc": "Mecanismo de busca com IA que encontra, resume e cita informações confiáveis em tempo real.",
      "tags": [
        "Busca",
        "Pesquisa"
      ]
    },
    "cursor": {
      "desc": "O IDE nativo de IA. Escreva, depure e refatore código com uma IA que entende toda a sua base de código.",
      "tags": [
        "Código"
      ]
    },
    "runway": {
      "desc": "Geração, edição e efeitos visuais de vídeo com IA de nível profissional para cineastas e criadores.",
      "tags": [
        "Vídeo"
      ]
    },
    "suno": {
      "desc": "Crie músicas completas com qualidade de rádio a partir de um prompt de texto. Letra, melodia e masterização — tudo com IA.",
      "tags": [
        "Áudio",
        "Música"
      ]
    },
    "elevenlabs": {
      "desc": "Clonagem de voz e conversão de texto em fala ultrarrealistas com IA em 32 idiomas. A IA de voz líder do setor.",
      "tags": [
        "Voz",
        "Áudio"
      ]
    },
    "v0": {
      "desc": "Gere componentes de UI em React + Tailwind prontos para produção a partir de descrições em linguagem natural.",
      "tags": [
        "Código",
        "Design"
      ]
    },
    "gemini": {
      "desc": "A IA multimodal do Google, capaz de raciocinar sobre texto, imagens, áudio, vídeo e código simultaneamente.",
      "tags": [
        "Chat",
        "Pesquisa"
      ]
    },
    "ideogram": {
      "desc": "Geração de imagens focada em tipografia. Renderização perfeita de texto dentro das imagens — o melhor da categoria para design.",
      "tags": [
        "Imagem"
      ]
    },
    "kling": {
      "desc": "Geração de vídeos cinematográficos de alta fidelidade a partir de imagens e texto, com movimento fisicamente preciso.",
      "tags": [
        "Vídeo"
      ]
    }
  } as Record<string, ToolOverride>,
  categories: {
    "Writing & Editing": "Escrita & Edição",
    "Image Generation": "Geração de Imagens",
    "Video": "Vídeo",
    "Video & Animation": "Vídeo & Animação",
    "Code & Developer": "Código & Desenvolvimento",
    "Marketing": "Marketing",
    "Marketing & Sales": "Marketing & Vendas",
    "Productivity": "Produtividade",
    "Productivity & Automation": "Produtividade & Automação",
    "Audio & Music": "Áudio & Música",
    "Research & Data": "Pesquisa & Dados",
    "Design & Creative": "Design & Criatividade",
    "Business & Finance": "Negócios & Finanças",
    "Education": "Educação",
    "Education & Learning": "Educação & Aprendizado",
    "Automation": "Automação",
    "Chatbots & Assistants": "Chatbots & Assistentes",
    "Customer Support": "Suporte ao Cliente",
    "Translation & Language": "Tradução & Idiomas",
    "Resume & Career": "Currículo & Carreira",
    "Email Assistants": "Assistentes de E-mail",
    "SEO & Content": "SEO & Conteúdo",
    "Social Media": "Redes Sociais",
    "PDF & Documents": "PDF & Documentos",
    "3D & AR / VR": "3D & AR / VR",
    "Avatar Generation": "Geração de Avatares",
    "Gaming & Entertainment": "Jogos & Entretenimento",
    "Healthcare & Medical": "Saúde & Medicina",
    "Legal & Compliance": "Jurídico & Compliance",
    "HR & Recruiting": "RH & Recrutamento",
    "Real Estate": "Imóveis",
    "Travel & Hospitality": "Viagem & Hotelaria",
    "Architecture & Interior": "Arquitetura & Interiores",
    "Music Production": "Produção Musical",
    "Voice Cloning": "Clonagem de Voz",
    "Speech Recognition": "Reconhecimento de Fala",
    "Text-to-Speech": "Texto para Fala",
    "Spreadsheet AI": "IA para Planilhas",
    "Note-Taking": "Anotações",
    "Mind Mapping": "Mapas Mentais",
    "Recipe & Food AI": "IA para Receitas & Comida",
    "Fitness & Wellness": "Fitness & Bem-estar",
    "E-commerce": "E-commerce",
    "Photo Editing": "Edição de Fotos",
    "Logo Makers": "Criadores de Logo",
    "UI / UX Design": "Design de UI / UX",
    "Game Asset Generation": "Geração de Assets para Jogos",
    "Data Visualization": "Visualização de Dados",
    "OCR & Document AI": "OCR & IA para Documentos",
    "AI Detectors": "Detectores de IA",
    "Plagiarism Checkers": "Verificadores de Plágio",
    "AI Agents": "Agentes de IA",
    "No-code AI": "IA No-code",
    "Analytics": "Análise de Dados"
  } as Record<string, string>,
  popularCategoryDescs: {
    "Writing & Editing": "Gere, edite e refine textos — de posts de blog a copy de marketing e ficção longa.",
    "Image Generation": "Gere imagens, ilustrações e arte a partir de prompts de texto com os modelos de difusão mais recentes.",
    "Code & Developer": "Par de programação com IA, autocompletar, revisores de código e geradores full-stack.",
    "Video & Animation": "Geração, edição e animação de vídeo — de texto para vídeo, remoção de fundo e sincronia labial.",
    "Audio & Music": "Clonagem de voz, geração de música, transcrição, produção de podcast e design de som.",
    "Productivity & Automation": "IA para calendário, resumo de reuniões, automação de tarefas e assistentes de fluxo de trabalho pessoal."
  } as Record<string, string>,
  useCases: {
    "Write a blog post": {
      "name": "Escrever um post de blog",
      "desc": "Ferramentas que ajudam a pesquisar, estruturar e escrever artigos mais rápido."
    },
    "Create a logo": {
      "name": "Criar um logo",
      "desc": "Ferramentas de design com IA para logos, identidade de marca e materiais visuais."
    },
    "Analyse data": {
      "name": "Analisar dados",
      "desc": "Entenda planilhas, CSVs e bancos de dados com o auxílio da IA."
    },
    "Edit a video": {
      "name": "Editar um vídeo",
      "desc": "Corte, legende e aprimore vídeos com a ajuda da IA."
    },
    "Reply to emails": {
      "name": "Responder e-mails",
      "desc": "Redija, resuma e gerencie sua caixa de entrada em menos tempo."
    },
    "Transcribe audio": {
      "name": "Transcrever áudio",
      "desc": "Transforme reuniões, podcasts e ligações em texto pesquisável."
    },
    "Ship code faster": {
      "name": "Lançar código mais rápido",
      "desc": "Pares de programação com IA, geradores de código e assistentes de depuração."
    },
    "Run social media": {
      "name": "Gerenciar redes sociais",
      "desc": "Agende, escreva e analise conteúdo em várias plataformas."
    }
  } as Record<string, { name: string; desc: string }>,
  pricingTiers: {
    "Free": {
      "name": "Completamente Grátis",
      "desc": "Ferramentas open-source ou totalmente gratuitas — sem exigência de plano pago."
    },
    "Freemium": {
      "name": "Plano Gratuito Disponível",
      "desc": "Planos gratuitos generosos com upgrades pagos opcionais para mais recursos."
    },
    "Paid": {
      "name": "Somente Pago",
      "desc": "Ferramentas premium com preços por assinatura — sem versão gratuita."
    },
    "Enterprise": {
      "name": "Preço Personalizado",
      "desc": "Ferramentas empresariais com contratos personalizados e suporte dedicado."
    }
  } as Record<string, { name: string; desc: string }>,
  subCategories: {
    "SEO & Content": "SEO & Conteúdo",
    "AI Copywriting": "Copywriting com IA",
    "Email Marketing": "E-mail Marketing",
    "Social Media": "Redes Sociais",
    "Ad Creative": "Criativos de Anúncios",
    "Analytics": "Análise de Dados"
  } as Record<string, string>,
  marketingFaq: [
    {
      "q": "Qual é a melhor ferramenta de IA para marketing em 2026?",
      "a": "Para a maioria das equipes de marketing, a **Jasper AI** é nossa escolha número um — ela combina copywriting com IA, treinamento de voz de marca, modo SEO e colaboração em equipe em uma única plataforma. Para fundadores solo ou orçamentos menores, a **Copy.ai** oferece um plano gratuito robusto, e a **Writesonic** é excelente para conteúdo voltado a SEO. A \"melhor\" ferramenta depende do seu caso de uso: conteúdo de blog, criativos de anúncios, automação de e-mail ou marketing de funil completo."
    },
    {
      "q": "Existem ferramentas de IA para marketing gratuitas?",
      "a": "Sim — 31 das 108 ferramentas desta categoria têm um plano totalmente gratuito, e outras 52 oferecem planos freemium generosos. Filtre a lista acima por \"Grátis\" ou \"Freemium\" para ver todas. Opções gratuitas populares incluem Copy.ai, ChatGPT (plano gratuito), Canva Magic Write e as ferramentas de IA gratuitas da HubSpot."
    },
    {
      "q": "As ferramentas de IA para marketing podem substituir uma equipe de marketing?",
      "a": "Não — o melhor jeito de pensar nas ferramentas de IA para marketing é como multiplicadoras de força, não substitutas. Elas cuidam do trabalho repetitivo (redigir textos, gerar variações, agendar publicações, gerar relatórios) para que os profissionais de marketing possam focar em estratégia, marca e decisões de alto impacto. A maioria das equipes relata ganhos de produtividade de 2 a 5 vezes, não redução de equipe."
    },
    {
      "q": "Qual ferramenta de IA para marketing é melhor para SEO?",
      "a": "**Surfer SEO** e **Frase** são as duas melhores ferramentas de conteúdo para SEO com IA — ambas combinam análise de SERP com escrita por IA para produzir artigos que rankeiam bem. Para SEO técnico, **Semrush** e **Ahrefs** também têm recursos de IA robustos incorporados."
    },
    {
      "q": "Como escolher a ferramenta de IA para marketing certa?",
      "a": "Comece pelo seu maior gargalo. Se você está com dificuldade para publicar conteúdo, escolha um copywriter de IA. Se seu blog não está rankeando, escolha uma ferramenta de SEO. Se seus e-mails estão sem resultado, escolha uma IA de e-mail. Não tente adotar 5 ferramentas de uma vez — escolha uma, integre-a profundamente e depois adicione mais."
    }
  ] as Array<{ q: string; a: string }>,
  marketingFacts: {
    "Total tools": "Total de ferramentas",
    "Free tools": "Ferramentas gratuitas",
    "Freemium": "Freemium",
    "Paid only": "Somente pagas",
    "Avg starting price": "Preço inicial médio",
    "Top use case": "Principal caso de uso"
  } as Record<string, string>,
  relatedSliderTools: {
    "Claude": {
      "cat": "IA de Chat · Anthropic",
      "desc": "Raciocínio sofisticado e análise de contexto longo pela Anthropic."
    },
    "Google Gemini": {
      "cat": "IA de Chat · Google",
      "desc": "A IA multimodal do Google para texto, imagens e vídeo."
    },
    "Perplexity": {
      "cat": "IA de Busca",
      "desc": "Busca com IA e citações em tempo real."
    },
    "MS Copilot": {
      "cat": "IA de Chat · Microsoft",
      "desc": "O assistente de IA da Microsoft, com tecnologia GPT-4."
    },
    "Mistral": {
      "cat": "IA de Chat",
      "desc": "Modelos de peso aberto com eficiência incomparável."
    },
    "Cohere": {
      "cat": "API de IA",
      "desc": "IA de linguagem de nível empresarial para equipes de negócios."
    },
    "Groq": {
      "cat": "API de IA",
      "desc": "Inferência de LLM ultrarrápida para desenvolvedores."
    }
  } as Record<string, { cat: string; desc: string }>,
  pricingTags: {
    "Free": "Grátis",
    "Free tier": "Plano gratuito",
    "Free Trial": "Teste grátis",
    "Paid": "Pago",
    "Credit-based": "Baseado em créditos",
    "Enterprise": "Empresarial"
  } as Record<string, string>,
  writerUseCases: [
    {
      "name": "Escrita longa",
      "desc": "Artigos, relatórios e conteúdo aprofundado em escala"
    },
    {
      "name": "Conteúdo para SEO",
      "desc": "Posts de blog prontos para rankear com integração de palavras-chave por IA"
    },
    {
      "name": "Copy de e-mail",
      "desc": "Linhas de assunto, sequências e prospecção fria"
    },
    {
      "name": "Redes sociais",
      "desc": "Threads, tweets e posts no LinkedIn em segundos"
    }
  ] as UseCaseOverride[],
  devUseCases: [
    {
      "name": "IDEs de programação com IA",
      "desc": "Escreva, depure e implante com ajuda da IA"
    },
    {
      "name": "Ferramentas de API",
      "desc": "Integre IA aos seus aplicativos em minutos"
    },
    {
      "name": "Geração de UI",
      "desc": "Do prompt ao React em produção em segundos"
    },
    {
      "name": "Revisão de código",
      "desc": "Detecção de bugs e refatoração com IA"
    }
  ] as UseCaseOverride[],
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      "source": "OpenAI",
      "category": "Lançamento de Produto",
      "title": "OpenAI lança o GPT-5 com 1 milhão de tokens de contexto e raciocínio em tempo real",
      "excerpt": "A nova geração do modelo principal da OpenAI traz uma janela de contexto 10 vezes maior, raciocínio aprimorado e acesso nativo à web em tempo real, sem plugins.",
      "time": "há 2 horas",
      "read": "5 min de leitura"
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      "source": "Google DeepMind",
      "category": "Pesquisa",
      "title": "DeepMind lança o Gemini 2.5 com novos recursos multimodais",
      "time": "há 4 horas",
      "read": "3 min de leitura"
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      "source": "Anthropic",
      "category": "Lançamento de Produto",
      "title": "Claude 4 é lançado com raciocínio estendido e Computer Use 2.0",
      "time": "há 6 horas",
      "read": "4 min de leitura"
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      "source": "OpenAI",
      "category": "IA de Vídeo",
      "title": "Sora 2.0 agora suporta saída em 4K e geração de vídeos de 5 minutos",
      "time": "há 6 horas",
      "read": "2 min de leitura"
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      "source": "Mistral AI",
      "category": "Pesquisa",
      "title": "Mixtral 9x22B se torna open-source — nível GPT-4 a um custo 3 vezes menor",
      "time": "há 10 horas",
      "read": "3 min de leitura"
    }
  } as Record<string, NewsOverride>,
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      "tag": "Guia",
      "title": "Guia completo do GPT-5: tudo o que você precisa saber",
      "date": "4 de maio",
      "read": "8 min"
    },
    "chatgpt-vs-claude-4": {
      "tag": "Comparação",
      "title": "ChatGPT vs Claude 4 em 2026: qual IA vence?",
      "date": "1º de maio",
      "read": "12 min"
    },
    "best-free-ai-marketing-tools": {
      "tag": "Seleção",
      "title": "As 7 melhores ferramentas de IA gratuitas para profissionais de marketing em 2026",
      "date": "25 de abril",
      "read": "9 min"
    }
  } as Record<string, BlogOverride>,
};

const TRANSLATIONS_TW = {
  tools: {
    "chatgpt": {
      "desc": "全球最強的 AI，適合寫作、寫程式、腦力激盪與各種創意工作，深受全球數百萬使用者信賴。",
      "tags": [
        "聊天",
        "寫作"
      ]
    },
    "midjourney": {
      "desc": "把文字描述轉換成令人驚豔的圖像，AI 藝術生成的標竿之作。",
      "tags": [
        "圖片"
      ]
    },
    "claude": {
      "desc": "Anthropic 打造的深思熟慮型 AI，擅長精細推理、長篇上下文分析，並提供安全、有幫助的回應。",
      "tags": [
        "聊天",
        "寫作"
      ]
    },
    "perplexity": {
      "desc": "即時搜尋、彙整並引用可靠資訊的 AI 搜尋引擎。",
      "tags": [
        "搜尋",
        "研究"
      ]
    },
    "cursor": {
      "desc": "AI 驅動的 IDE，讓理解整個程式碼庫的 AI 陪你一起撰寫、除錯與重構。",
      "tags": [
        "程式"
      ]
    },
    "runway": {
      "desc": "為電影工作者與創作者打造的專業 AI 影片生成、剪輯與視覺特效工具。",
      "tags": [
        "影片"
      ]
    },
    "suno": {
      "desc": "只需文字提示，就能生成電台品質的完整歌曲——歌詞、旋律、母帶後製全部交給 AI。",
      "tags": [
        "音訊",
        "音樂"
      ]
    },
    "elevenlabs": {
      "desc": "支援 32 種語言的超擬真 AI 語音複製與文字轉語音，業界頂尖的語音 AI。",
      "tags": [
        "語音",
        "音訊"
      ]
    },
    "v0": {
      "desc": "用自然語言描述，就能生成可直接上線的 React + Tailwind UI 元件。",
      "tags": [
        "程式",
        "設計"
      ]
    },
    "gemini": {
      "desc": "Google 打造的多模態 AI，能同時理解文字、圖片、音訊、影片與程式碼。",
      "tags": [
        "聊天",
        "研究"
      ]
    },
    "ideogram": {
      "desc": "以文字排印為核心的圖像生成工具，能在圖片中完美呈現文字——設計師的首選。",
      "tags": [
        "圖片"
      ]
    },
    "kling": {
      "desc": "透過圖片與文字生成物理運動精準、畫質猶如電影般的高品質影片。",
      "tags": [
        "影片"
      ]
    }
  } as Record<string, ToolOverride>,
  categories: {
    "Writing & Editing": "寫作與編輯",
    "Image Generation": "圖片生成",
    "Video": "影片",
    "Video & Animation": "影片與動畫",
    "Code & Developer": "程式與開發",
    "Marketing": "行銷",
    "Marketing & Sales": "行銷與業務",
    "Productivity": "生產力",
    "Productivity & Automation": "生產力與自動化",
    "Audio & Music": "音訊與音樂",
    "Research & Data": "研究與數據",
    "Design & Creative": "設計與創意",
    "Business & Finance": "商業與財務",
    "Education": "教育",
    "Education & Learning": "教育與學習",
    "Automation": "自動化",
    "Chatbots & Assistants": "聊天機器人與助理",
    "Customer Support": "客戶服務",
    "Translation & Language": "翻譯與語言",
    "Resume & Career": "履歷與職涯",
    "Email Assistants": "郵件助理",
    "SEO & Content": "SEO 與內容",
    "Social Media": "社群媒體",
    "PDF & Documents": "PDF 與文件",
    "3D & AR / VR": "3D 與 AR / VR",
    "Avatar Generation": "虛擬人像生成",
    "Gaming & Entertainment": "遊戲與娛樂",
    "Healthcare & Medical": "醫療保健",
    "Legal & Compliance": "法律與合規",
    "HR & Recruiting": "人資與招募",
    "Real Estate": "房地產",
    "Travel & Hospitality": "旅遊與餐旅",
    "Architecture & Interior": "建築與室內設計",
    "Music Production": "音樂製作",
    "Voice Cloning": "語音複製",
    "Speech Recognition": "語音辨識",
    "Text-to-Speech": "文字轉語音",
    "Spreadsheet AI": "試算表 AI",
    "Note-Taking": "筆記工具",
    "Mind Mapping": "心智圖",
    "Recipe & Food AI": "食譜與美食 AI",
    "Fitness & Wellness": "健身與健康",
    "E-commerce": "電子商務",
    "Photo Editing": "照片編輯",
    "Logo Makers": "標誌製作",
    "UI / UX Design": "UI / UX 設計",
    "Game Asset Generation": "遊戲素材生成",
    "Data Visualization": "資料視覺化",
    "OCR & Document AI": "OCR 與文件 AI",
    "AI Detectors": "AI 偵測工具",
    "Plagiarism Checkers": "抄襲檢測工具",
    "AI Agents": "AI 代理",
    "No-code AI": "無程式碼 AI",
    "Analytics": "數據分析"
  } as Record<string, string>,
  popularCategoryDescs: {
    "Writing & Editing": "生成、編輯與潤飾文字——從部落格文章到行銷文案，甚至長篇小說都難不倒。",
    "Image Generation": "運用最新的擴散模型，從文字提示生成圖片、插畫與藝術作品。",
    "Code & Developer": "AI 結對工程師、自動完成、程式碼審查與全端生成工具。",
    "Video & Animation": "生成、剪輯與製作影片動畫——文字轉影片、去背、對嘴同步樣樣都行。",
    "Audio & Music": "語音複製、音樂生成、逐字稿轉錄、Podcast 製作與音效設計。",
    "Productivity & Automation": "行事曆 AI、會議摘要、工作自動化與個人工作流程助理。"
  } as Record<string, string>,
  useCases: {
    "Write a blog post": {
      "name": "撰寫部落格文章",
      "desc": "協助你更快完成研究、大綱與寫作的工具。"
    },
    "Create a logo": {
      "name": "製作標誌",
      "desc": "打造標誌、品牌識別與視覺素材的 AI 設計工具。"
    },
    "Analyse data": {
      "name": "分析資料",
      "desc": "用 AI 讀懂試算表、CSV 與資料庫。"
    },
    "Edit a video": {
      "name": "剪輯影片",
      "desc": "AI 輔助剪接、字幕與影片校色。"
    },
    "Reply to emails": {
      "name": "回覆郵件",
      "desc": "更快撰寫、摘要與管理你的收件匣。"
    },
    "Transcribe audio": {
      "name": "轉錄音訊",
      "desc": "把會議、Podcast 與通話轉成可搜尋的文字。"
    },
    "Ship code faster": {
      "name": "更快交付程式碼",
      "desc": "AI 結對工程師、程式碼生成器與除錯助手。"
    },
    "Run social media": {
      "name": "經營社群媒體",
      "desc": "跨平台排程、撰寫並分析內容成效。"
    }
  } as Record<string, { name: string; desc: string }>,
  pricingTiers: {
    "Free": {
      "name": "完全免費",
      "desc": "開源或完全免費的工具——不需訂閱付費方案也能使用。"
    },
    "Freemium": {
      "name": "提供免費方案",
      "desc": "有充足的免費方案，需要更多功能時也能升級付費。"
    },
    "Paid": {
      "name": "僅限付費",
      "desc": "以訂閱為主的進階工具——沒有免費版本。"
    },
    "Enterprise": {
      "name": "客製報價",
      "desc": "提供客製合約與專屬支援的企業級工具。"
    }
  } as Record<string, { name: string; desc: string }>,
  subCategories: {
    "SEO & Content": "SEO 與內容",
    "AI Copywriting": "AI 文案",
    "Email Marketing": "電子郵件行銷",
    "Social Media": "社群媒體",
    "Ad Creative": "廣告素材",
    "Analytics": "數據分析"
  } as Record<string, string>,
  marketingFaq: [
    {
      "q": "2026 年最好的 AI 行銷工具是什麼？",
      "a": "對大多數行銷團隊來說，**Jasper AI** 是最佳選擇——把 AI 文案撰寫、品牌語氣學習、SEO 模式與團隊協作整合在同一個平台。對獨立創業者或預算有限的團隊來說，**Copy.ai** 強大的免費方案很不錯；若專注於 SEO 內容，**Writesonic** 表現亮眼。「最好」取決於你的使用情境：部落格內容、廣告素材、電子郵件自動化，或是全通路行銷。"
    },
    {
      "q": "有免費的 AI 行銷工具嗎？",
      "a": "有——這個分類中的 108 款工具裡，31 款提供完全免費的方案，52 款提供充足的免費增值方案。頁面上方可用「免費」或「免費增值」篩選查看所有選項。代表性的免費選擇包括：Copy.ai、ChatGPT（免費方案）、Canva Magic Write，以及 HubSpot 的免費 AI 工具。"
    },
    {
      "q": "AI 行銷工具能取代行銷團隊嗎？",
      "a": "不能——把 AI 行銷工具想成放大器，而非替代品會更貼切。重複性的工作（撰寫文案草稿、產生變化版本、排程發布、製作報表）交給 AI 處理，行銷人員則能專注在策略、品牌與高影響力的決策上。大多數團隊回報生產力提升 2 到 5 倍，這是擴大成果，而非裁減人力。"
    },
    {
      "q": "最適合 SEO 的 AI 行銷工具是哪些？",
      "a": "**Surfer SEO** 與 **Frase** 是評價最高的 AI 驅動 SEO 內容工具——兩者都結合了 SERP 分析與 AI 寫作，協助產出能在搜尋結果中名列前茅的文章。若是技術性 SEO，**Semrush** 與 **Ahrefs** 也內建了強大的 AI 功能。"
    },
    {
      "q": "我該如何挑選適合自己的 AI 行銷工具？",
      "a": "從你最大的瓶頸開始下手。如果內容產出卡關，選 AI 文案工具；如果部落格搜尋排名不佳，選 SEO 工具；如果郵件成效停滯，選郵件 AI 工具。不要一次導入五種工具——先選一個深入整合，之後再逐步擴充。"
    }
  ] as Array<{ q: string; a: string }>,
  marketingFacts: {
    "Total tools": "工具總數",
    "Free tools": "免費工具",
    "Freemium": "免費增值",
    "Paid only": "僅限付費",
    "Avg starting price": "平均起價",
    "Top use case": "主要使用情境"
  } as Record<string, string>,
  relatedSliderTools: {
    "Claude": {
      "cat": "AI 聊天 · Anthropic",
      "desc": "Anthropic 打造，具備精細推理與長篇上下文分析能力。"
    },
    "Google Gemini": {
      "cat": "AI 聊天 · Google",
      "desc": "Google 的多模態 AI，橫跨文字、圖片與影片。"
    },
    "Perplexity": {
      "cat": "AI 搜尋",
      "desc": "提供即時引用來源的 AI 搜尋工具。"
    },
    "MS Copilot": {
      "cat": "AI 聊天 · Microsoft",
      "desc": "以 GPT-4 為基礎的 Microsoft AI 助理。"
    },
    "Mistral": {
      "cat": "AI 聊天",
      "desc": "效率頂尖的開放權重模型。"
    },
    "Cohere": {
      "cat": "AI API",
      "desc": "為企業團隊打造的企業級語言 AI。"
    },
    "Groq": {
      "cat": "AI API",
      "desc": "為開發者提供超高速 LLM 推理。"
    }
  } as Record<string, { cat: string; desc: string }>,
  pricingTags: {
    "Free": "免費",
    "Free tier": "免費方案",
    "Free Trial": "免費試用",
    "Paid": "付費",
    "Credit-based": "點數制",
    "Enterprise": "企業"
  } as Record<string, string>,
  writerUseCases: [
    {
      "name": "長篇內容",
      "desc": "大規模產出文章、報告與深度內容"
    },
    {
      "name": "SEO 內容",
      "desc": "結合 AI 關鍵字整合，寫出能上排名的部落格文章"
    },
    {
      "name": "郵件文案",
      "desc": "主旨、郵件序列與陌生開發信"
    },
    {
      "name": "社群媒體",
      "desc": "幾秒內完成推特串文、貼文與 LinkedIn 發文"
    }
  ] as UseCaseOverride[],
  devUseCases: [
    {
      "name": "AI 程式 IDE",
      "desc": "在 AI 協助下撰寫、除錯與部署"
    },
    {
      "name": "API 工具",
      "desc": "幾分鐘內把 AI 整合進你的應用程式"
    },
    {
      "name": "UI 生成",
      "desc": "從提示詞到可上線的 React，只需幾秒鐘"
    },
    {
      "name": "程式碼審查",
      "desc": "AI 驅動的錯誤偵測與重構"
    }
  ] as UseCaseOverride[],
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      "source": "OpenAI",
      "category": "產品發表",
      "title": "OpenAI 推出 GPT-5，具備 100 萬 token 上下文與即時推理能力",
      "excerpt": "OpenAI 旗艦模型的最新版本提供大 10 倍的上下文視窗、更強的推理能力，以及無需外掛的原生即時網路存取。",
      "time": "2 小時前",
      "read": "閱讀 5 分鐘"
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      "source": "Google DeepMind",
      "category": "研究",
      "title": "DeepMind 發布具備全新多模態能力的 Gemini 2.5",
      "time": "4 小時前",
      "read": "閱讀 3 分鐘"
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      "source": "Anthropic",
      "category": "產品發表",
      "title": "Claude 4 上線，具備延伸思考與電腦操作 2.0 功能",
      "time": "6 小時前",
      "read": "閱讀 4 分鐘"
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      "source": "OpenAI",
      "category": "影片 AI",
      "title": "Sora 2.0 現已支援 4K 輸出與 5 分鐘長度的影片生成",
      "time": "6 小時前",
      "read": "閱讀 2 分鐘"
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      "source": "Mistral AI",
      "category": "研究",
      "title": "Mixtral 9x22B 開源釋出——以三分之一成本達到 GPT-4 水準",
      "time": "10 小時前",
      "read": "閱讀 3 分鐘"
    }
  } as Record<string, NewsOverride>,
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      "tag": "指南",
      "title": "GPT-5 完整指南：你需要知道的一切",
      "date": "5 月 4 日",
      "read": "8 分鐘"
    },
    "chatgpt-vs-claude-4": {
      "tag": "比較",
      "title": "ChatGPT vs Claude 4（2026）：哪個 AI 更勝一籌？",
      "date": "5 月 1 日",
      "read": "12 分鐘"
    },
    "best-free-ai-marketing-tools": {
      "tag": "推薦",
      "title": "2026 年給行銷人員的 7 款最佳免費 AI 工具",
      "date": "4 月 25 日",
      "read": "9 分鐘"
    }
  } as Record<string, BlogOverride>,
};

const TRANSLATIONS_VI = {
  tools: {
    "chatgpt": {
      "desc": "AI hàng đầu thế giới cho viết lách, lập trình, brainstorm và các công việc sáng tạo. Được hàng triệu người tin dùng trên toàn cầu.",
      "tags": [
        "Trò chuyện",
        "Viết lách"
      ]
    },
    "midjourney": {
      "desc": "Biến mô tả văn bản thành những hình ảnh đẹp đến kinh ngạc. Tiêu chuẩn vàng cho tạo ảnh nghệ thuật bằng AI.",
      "tags": [
        "Hình ảnh"
      ]
    },
    "claude": {
      "desc": "AI chu đáo của Anthropic cho suy luận tinh vi, phân tích ngữ cảnh dài và những phản hồi an toàn, hữu ích.",
      "tags": [
        "Trò chuyện",
        "Viết lách"
      ]
    },
    "perplexity": {
      "desc": "Công cụ tìm kiếm AI tìm, tóm tắt và trích dẫn thông tin đáng tin cậy theo thời gian thực.",
      "tags": [
        "Tìm kiếm",
        "Nghiên cứu"
      ]
    },
    "cursor": {
      "desc": "IDE hỗ trợ AI. Viết, gỡ lỗi và tái cấu trúc code cùng AI hiểu toàn bộ codebase của bạn.",
      "tags": [
        "Lập trình"
      ]
    },
    "runway": {
      "desc": "Tạo, chỉnh sửa video và hiệu ứng hình ảnh chuyên nghiệp bằng AI dành cho nhà làm phim và nhà sáng tạo.",
      "tags": [
        "Video"
      ]
    },
    "suno": {
      "desc": "Tạo bài hát hoàn chỉnh chất lượng radio chỉ từ prompt văn bản. Lời, giai điệu và mastering đều do AI đảm nhiệm.",
      "tags": [
        "Âm thanh",
        "Âm nhạc"
      ]
    },
    "elevenlabs": {
      "desc": "Nhân bản giọng nói AI siêu thực và chuyển văn bản thành giọng nói bằng 32 ngôn ngữ. AI giọng nói hàng đầu ngành.",
      "tags": [
        "Giọng nói",
        "Âm thanh"
      ]
    },
    "v0": {
      "desc": "Tạo các component UI React + Tailwind chuẩn production chỉ từ mô tả bằng ngôn ngữ tự nhiên.",
      "tags": [
        "Lập trình",
        "Thiết kế"
      ]
    },
    "gemini": {
      "desc": "AI đa phương thức của Google có thể suy luận đồng thời trên văn bản, hình ảnh, âm thanh, video và code.",
      "tags": [
        "Trò chuyện",
        "Nghiên cứu"
      ]
    },
    "ideogram": {
      "desc": "Tạo ảnh tập trung vào typography. Hiển thị hoàn hảo chữ trong ảnh — lựa chọn hàng đầu cho thiết kế.",
      "tags": [
        "Hình ảnh"
      ]
    },
    "kling": {
      "desc": "Tạo video điện ảnh chất lượng cao với chuyển động chuẩn vật lý từ hình ảnh và văn bản.",
      "tags": [
        "Video"
      ]
    }
  } as Record<string, ToolOverride>,
  categories: {
    "Writing & Editing": "Viết lách & Biên tập",
    "Image Generation": "Tạo ảnh",
    "Video": "Video",
    "Video & Animation": "Video & Hoạt hình",
    "Code & Developer": "Code & Lập trình",
    "Marketing": "Marketing",
    "Marketing & Sales": "Marketing & Bán hàng",
    "Productivity": "Năng suất",
    "Productivity & Automation": "Năng suất & Tự động hóa",
    "Audio & Music": "Âm thanh & Âm nhạc",
    "Research & Data": "Nghiên cứu & Dữ liệu",
    "Design & Creative": "Thiết kế & Sáng tạo",
    "Business & Finance": "Kinh doanh & Tài chính",
    "Education": "Giáo dục",
    "Education & Learning": "Giáo dục & Học tập",
    "Automation": "Tự động hóa",
    "Chatbots & Assistants": "Chatbot & Trợ lý ảo",
    "Customer Support": "Hỗ trợ khách hàng",
    "Translation & Language": "Dịch thuật & Ngôn ngữ",
    "Resume & Career": "Hồ sơ xin việc & Sự nghiệp",
    "Email Assistants": "Trợ lý Email",
    "SEO & Content": "SEO & Nội dung",
    "Social Media": "Mạng xã hội",
    "PDF & Documents": "PDF & Tài liệu",
    "3D & AR / VR": "3D & AR / VR",
    "Avatar Generation": "Tạo Avatar",
    "Gaming & Entertainment": "Game & Giải trí",
    "Healthcare & Medical": "Y tế & Sức khỏe",
    "Legal & Compliance": "Pháp lý & Tuân thủ",
    "HR & Recruiting": "Nhân sự & Tuyển dụng",
    "Real Estate": "Bất động sản",
    "Travel & Hospitality": "Du lịch & Khách sạn",
    "Architecture & Interior": "Kiến trúc & Nội thất",
    "Music Production": "Sản xuất âm nhạc",
    "Voice Cloning": "Nhân bản giọng nói",
    "Speech Recognition": "Nhận dạng giọng nói",
    "Text-to-Speech": "Chuyển văn bản thành giọng nói",
    "Spreadsheet AI": "AI cho bảng tính",
    "Note-Taking": "Ghi chú",
    "Mind Mapping": "Sơ đồ tư duy",
    "Recipe & Food AI": "Công thức nấu ăn & AI ẩm thực",
    "Fitness & Wellness": "Thể hình & Sức khỏe",
    "E-commerce": "Thương mại điện tử",
    "Photo Editing": "Chỉnh sửa ảnh",
    "Logo Makers": "Tạo logo",
    "UI / UX Design": "Thiết kế UI / UX",
    "Game Asset Generation": "Tạo tài nguyên game",
    "Data Visualization": "Trực quan hóa dữ liệu",
    "OCR & Document AI": "OCR & AI xử lý tài liệu",
    "AI Detectors": "Công cụ phát hiện AI",
    "Plagiarism Checkers": "Kiểm tra đạo văn",
    "AI Agents": "Tác nhân AI",
    "No-code AI": "AI không cần code",
    "Analytics": "Phân tích"
  } as Record<string, string>,
  popularCategoryDescs: {
    "Writing & Editing": "Tạo, chỉnh sửa và trau chuốt văn bản — từ bài blog đến copy marketing và tiểu thuyết dài kỳ.",
    "Image Generation": "Tạo ảnh, minh họa và tác phẩm nghệ thuật từ prompt văn bản bằng các mô hình diffusion mới nhất.",
    "Code & Developer": "Lập trình viên AI, tự động hoàn thành, công cụ review code và tạo mã full-stack.",
    "Video & Animation": "Tạo, chỉnh sửa và làm hoạt hình video — từ chuyển văn bản thành video, xóa nền đến đồng bộ khẩu hình.",
    "Audio & Music": "Nhân bản giọng nói, tạo nhạc, phiên âm, sản xuất podcast và thiết kế âm thanh.",
    "Productivity & Automation": "AI lịch làm việc, tóm tắt cuộc họp, tự động hóa tác vụ và trợ lý quy trình cá nhân."
  } as Record<string, string>,
  useCases: {
    "Write a blog post": {
      "name": "Viết bài blog",
      "desc": "Công cụ giúp nghiên cứu, lên dàn ý và viết nhanh hơn."
    },
    "Create a logo": {
      "name": "Tạo logo",
      "desc": "Công cụ thiết kế AI cho logo, nhận diện thương hiệu và tài nguyên hình ảnh."
    },
    "Analyse data": {
      "name": "Phân tích dữ liệu",
      "desc": "Hiểu bảng tính, CSV và cơ sở dữ liệu bằng AI."
    },
    "Edit a video": {
      "name": "Chỉnh sửa video",
      "desc": "Cắt ghép, phụ đề và chỉnh màu với sự trợ giúp của AI."
    },
    "Reply to emails": {
      "name": "Trả lời email",
      "desc": "Soạn, tóm tắt và quản lý hộp thư nhanh hơn."
    },
    "Transcribe audio": {
      "name": "Phiên âm audio",
      "desc": "Chuyển cuộc họp, podcast và cuộc gọi thành văn bản có thể tìm kiếm."
    },
    "Ship code faster": {
      "name": "Code nhanh hơn",
      "desc": "Lập trình viên AI, công cụ tạo code và trợ lý gỡ lỗi."
    },
    "Run social media": {
      "name": "Vận hành mạng xã hội",
      "desc": "Lên lịch, viết và phân tích nội dung trên nhiều nền tảng."
    }
  } as Record<string, { name: string; desc: string }>,
  pricingTiers: {
    "Free": {
      "name": "Hoàn toàn miễn phí",
      "desc": "Công cụ mã nguồn mở hoặc hoàn toàn miễn phí — dùng được mà không cần gói trả phí."
    },
    "Freemium": {
      "name": "Có gói miễn phí",
      "desc": "Gói miễn phí rộng rãi + nâng cấp trả phí tùy chọn khi cần thêm tính năng."
    },
    "Paid": {
      "name": "Chỉ trả phí",
      "desc": "Công cụ cao cấp theo hình thức đăng ký — không có phiên bản miễn phí."
    },
    "Enterprise": {
      "name": "Giá tùy chỉnh",
      "desc": "Công cụ doanh nghiệp với hợp đồng riêng và hỗ trợ chuyên biệt."
    }
  } as Record<string, { name: string; desc: string }>,
  subCategories: {
    "SEO & Content": "SEO & Nội dung",
    "AI Copywriting": "Copywriting AI",
    "Email Marketing": "Email Marketing",
    "Social Media": "Mạng xã hội",
    "Ad Creative": "Sáng tạo quảng cáo",
    "Analytics": "Phân tích"
  } as Record<string, string>,
  marketingFaq: [
    {
      "q": "Công cụ marketing AI tốt nhất năm 2026 là gì?",
      "a": "Với hầu hết các đội marketing, **Jasper AI** là lựa chọn tốt nhất — tích hợp copywriting AI, học giọng điệu thương hiệu, chế độ SEO và cộng tác nhóm trong một nền tảng. Với nhà sáng lập một mình hoặc đội ngũ ngân sách hạn chế, gói miễn phí mạnh mẽ của **Copy.ai** là lựa chọn tốt, còn nội dung tập trung SEO thì **Writesonic** vượt trội. \"Tốt nhất\" phụ thuộc vào trường hợp sử dụng: nội dung blog, sáng tạo quảng cáo, tự động hóa email hay marketing toàn phễu."
    },
    {
      "q": "Có công cụ marketing AI miễn phí không?",
      "a": "Có — trong số 108 công cụ ở danh mục này, 31 công cụ có gói hoàn toàn miễn phí, và 52 công cụ cung cấp gói premium rộng rãi. Bạn có thể xem tất cả bằng bộ lọc \"Miễn phí\" hoặc \"Premium\" ở phía trên. Các lựa chọn miễn phí tiêu biểu: Copy.ai, ChatGPT (gói miễn phí), Canva Magic Write, các công cụ AI miễn phí của HubSpot."
    },
    {
      "q": "Công cụ marketing AI có thể thay thế đội marketing không?",
      "a": "Không — nên xem công cụ marketing AI là bộ khuếch đại chứ không phải sự thay thế. AI xử lý các công việc lặp lại (soạn thảo copy, tạo biến thể, lên lịch, báo cáo), còn marketer tập trung vào chiến lược, thương hiệu và các quyết định có tác động lớn. Hầu hết các đội báo cáo tăng năng suất 2–5 lần, đây là mở rộng kết quả chứ không phải cắt giảm nhân sự."
    },
    {
      "q": "Công cụ marketing AI nào tốt nhất cho SEO?",
      "a": "**Surfer SEO** và **Frase** là những công cụ nội dung SEO dựa trên AI tốt nhất hiện nay — cả hai đều kết hợp phân tích SERP với viết bằng AI để tạo ra bài viết được xếp hạng cao trên tìm kiếm. Với SEO kỹ thuật, **Semrush** và **Ahrefs** cũng tích hợp sẵn các tính năng AI mạnh mẽ."
    },
    {
      "q": "Làm sao để chọn công cụ marketing AI phù hợp với tôi?",
      "a": "Hãy bắt đầu từ điểm nghẽn lớn nhất. Nếu việc xuất bản nội dung bị chậm, hãy dùng copywriter AI. Nếu blog không lên top tìm kiếm, hãy dùng công cụ SEO. Nếu hiệu suất email trì trệ, hãy dùng AI email. Đừng triển khai 5 công cụ cùng lúc — chọn một công cụ, tích hợp sâu, rồi mới thêm công cụ khác."
    }
  ] as Array<{ q: string; a: string }>,
  marketingFacts: {
    "Total tools": "Tổng số công cụ",
    "Free tools": "Công cụ miễn phí",
    "Freemium": "Premium",
    "Paid only": "Chỉ trả phí",
    "Avg starting price": "Giá khởi điểm trung bình",
    "Top use case": "Mục đích sử dụng phổ biến nhất"
  } as Record<string, string>,
  relatedSliderTools: {
    "Claude": {
      "cat": "Trò chuyện AI · Anthropic",
      "desc": "Suy luận tinh vi và phân tích ngữ cảnh dài của Anthropic."
    },
    "Google Gemini": {
      "cat": "Trò chuyện AI · Google",
      "desc": "AI đa phương thức của Google bao quát văn bản, hình ảnh và video."
    },
    "Perplexity": {
      "cat": "Tìm kiếm AI",
      "desc": "Tìm kiếm AI với trích dẫn theo thời gian thực."
    },
    "MS Copilot": {
      "cat": "Trò chuyện AI · Microsoft",
      "desc": "Trợ lý AI của Microsoft dựa trên GPT-4."
    },
    "Mistral": {
      "cat": "Trò chuyện AI",
      "desc": "Mô hình open-weight với hiệu suất vượt trội."
    },
    "Cohere": {
      "cat": "API AI",
      "desc": "AI ngôn ngữ cấp doanh nghiệp cho các đội ngũ kinh doanh."
    },
    "Groq": {
      "cat": "API AI",
      "desc": "Suy luận LLM siêu tốc cho lập trình viên."
    }
  } as Record<string, { cat: string; desc: string }>,
  pricingTags: {
    "Free": "Miễn phí",
    "Free tier": "Gói miễn phí",
    "Free Trial": "Dùng thử miễn phí",
    "Paid": "Trả phí",
    "Credit-based": "Theo tín dụng",
    "Enterprise": "Doanh nghiệp"
  } as Record<string, string>,
  writerUseCases: [
    {
      "name": "Nội dung dài",
      "desc": "Bài viết, báo cáo, nội dung chuyên sâu ở quy mô lớn"
    },
    {
      "name": "Nội dung SEO",
      "desc": "Bài blog chuẩn SEO với từ khóa AI tích hợp để lên top tìm kiếm"
    },
    {
      "name": "Copy email",
      "desc": "Tiêu đề, chuỗi email, tiếp cận khách hàng lạnh"
    },
    {
      "name": "Mạng xã hội",
      "desc": "Thread Twitter, bài đăng, nội dung LinkedIn chỉ trong vài giây"
    }
  ] as UseCaseOverride[],
  devUseCases: [
    {
      "name": "IDE lập trình AI",
      "desc": "Viết, gỡ lỗi và triển khai với sự trợ giúp của AI"
    },
    {
      "name": "Công cụ API",
      "desc": "Tích hợp AI vào ứng dụng chỉ trong vài phút"
    },
    {
      "name": "Tạo giao diện",
      "desc": "Từ prompt đến React chuẩn production chỉ trong vài giây"
    },
    {
      "name": "Review code",
      "desc": "Phát hiện lỗi và tái cấu trúc bằng AI"
    }
  ] as UseCaseOverride[],
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      "source": "OpenAI",
      "category": "Ra mắt sản phẩm",
      "title": "OpenAI ra mắt GPT-5 với ngữ cảnh 1 triệu token và suy luận thời gian thực",
      "excerpt": "Phiên bản tiếp theo của mô hình chủ lực OpenAI mang đến cửa sổ ngữ cảnh lớn hơn gấp 10 lần, suy luận được cải thiện và khả năng truy cập web thời gian thực mà không cần plugin.",
      "time": "2 giờ trước",
      "read": "5 phút đọc"
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      "source": "Google DeepMind",
      "category": "Nghiên cứu",
      "title": "DeepMind ra mắt Gemini 2.5 với khả năng đa phương thức mới",
      "time": "4 giờ trước",
      "read": "3 phút đọc"
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      "source": "Anthropic",
      "category": "Ra mắt sản phẩm",
      "title": "Claude 4 ra mắt với khả năng suy nghĩ mở rộng và computer use 2.0",
      "time": "6 giờ trước",
      "read": "4 phút đọc"
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      "source": "OpenAI",
      "category": "AI Video",
      "title": "Sora 2.0 giờ hỗ trợ xuất 4K và tạo video dài 5 phút",
      "time": "6 giờ trước",
      "read": "2 phút đọc"
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      "source": "Mistral AI",
      "category": "Nghiên cứu",
      "title": "Mixtral 9x22B mã nguồn mở — ngang tầm GPT-4 với chi phí thấp hơn 3 lần",
      "time": "10 giờ trước",
      "read": "3 phút đọc"
    }
  } as Record<string, NewsOverride>,
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      "tag": "Hướng dẫn",
      "title": "Hướng dẫn đầy đủ về GPT-5: Mọi điều bạn cần biết",
      "date": "4 tháng 5",
      "read": "8 phút"
    },
    "chatgpt-vs-claude-4": {
      "tag": "So sánh",
      "title": "ChatGPT vs Claude 4 (2026): AI nào sẽ chiến thắng?",
      "date": "1 tháng 5",
      "read": "12 phút"
    },
    "best-free-ai-marketing-tools": {
      "tag": "Đề xuất",
      "title": "7 công cụ AI miễn phí tốt nhất năm 2026 dành cho marketer",
      "date": "25 tháng 4",
      "read": "9 phút"
    }
  } as Record<string, BlogOverride>,
};

const TRANSLATIONS_ES = {
  tools: {
    "chatgpt": {
      "desc": "La IA líder mundial para escribir, programar, hacer lluvia de ideas y crear. Con la confianza de millones de personas en todo el mundo.",
      "tags": [
        "Chat",
        "Escritura"
      ]
    },
    "midjourney": {
      "desc": "Convierte descripciones de texto en imágenes asombrosamente hermosas. El estándar de la generación de arte con IA.",
      "tags": [
        "Imagen"
      ]
    },
    "claude": {
      "desc": "La IA reflexiva de Anthropic para razonamiento sofisticado, análisis de contexto extenso y respuestas seguras y útiles.",
      "tags": [
        "Chat",
        "Escritura"
      ]
    },
    "perplexity": {
      "desc": "Un motor de búsqueda con IA que encuentra, resume y cita información confiable en tiempo real.",
      "tags": [
        "Búsqueda",
        "Investigación"
      ]
    },
    "cursor": {
      "desc": "Un IDE potenciado por IA. Escribe, depura y refactoriza junto a una IA que entiende toda tu base de código.",
      "tags": [
        "Código"
      ]
    },
    "runway": {
      "desc": "Generación, edición y efectos visuales de video con IA de nivel profesional para cineastas y creadores.",
      "tags": [
        "Video"
      ]
    },
    "suno": {
      "desc": "Genera canciones completas con calidad de radio a partir de prompts de texto. Letra, melodía y masterización, todo con IA.",
      "tags": [
        "Audio",
        "Música"
      ]
    },
    "elevenlabs": {
      "desc": "Clonación de voz con IA hiperrealista y texto a voz en 32 idiomas. La mejor IA de voz del sector.",
      "tags": [
        "Voz",
        "Audio"
      ]
    },
    "v0": {
      "desc": "Genera componentes de interfaz React + Tailwind listos para producción a partir de descripciones en lenguaje natural.",
      "tags": [
        "Código",
        "Diseño"
      ]
    },
    "gemini": {
      "desc": "La IA multimodal de Google que razona simultáneamente sobre texto, imagen, audio, video y código.",
      "tags": [
        "Chat",
        "Investigación"
      ]
    },
    "ideogram": {
      "desc": "Generación de imágenes centrada en tipografía. Renderiza texto dentro de las imágenes a la perfección — la mejor opción para diseño.",
      "tags": [
        "Imagen"
      ]
    },
    "kling": {
      "desc": "Genera video cinematográfico de alta calidad con movimiento físicamente preciso a partir de imágenes y texto.",
      "tags": [
        "Video"
      ]
    }
  } as Record<string, ToolOverride>,
  categories: {
    "Writing & Editing": "Escritura y edición",
    "Image Generation": "Generación de imágenes",
    "Video": "Video",
    "Video & Animation": "Video y animación",
    "Code & Developer": "Código y desarrollo",
    "Marketing": "Marketing",
    "Marketing & Sales": "Marketing y ventas",
    "Productivity": "Productividad",
    "Productivity & Automation": "Productividad y automatización",
    "Audio & Music": "Audio y música",
    "Research & Data": "Investigación y datos",
    "Design & Creative": "Diseño y creatividad",
    "Business & Finance": "Negocios y finanzas",
    "Education": "Educación",
    "Education & Learning": "Educación y aprendizaje",
    "Automation": "Automatización",
    "Chatbots & Assistants": "Chatbots y asistentes",
    "Customer Support": "Atención al cliente",
    "Translation & Language": "Traducción e idiomas",
    "Resume & Career": "Currículum y carrera",
    "Email Assistants": "Asistentes de correo electrónico",
    "SEO & Content": "SEO y contenido",
    "Social Media": "Redes sociales",
    "PDF & Documents": "PDF y documentos",
    "3D & AR / VR": "3D y AR / VR",
    "Avatar Generation": "Generación de avatares",
    "Gaming & Entertainment": "Videojuegos y entretenimiento",
    "Healthcare & Medical": "Salud y medicina",
    "Legal & Compliance": "Legal y cumplimiento",
    "HR & Recruiting": "RR. HH. y reclutamiento",
    "Real Estate": "Bienes raíces",
    "Travel & Hospitality": "Viajes y hostelería",
    "Architecture & Interior": "Arquitectura e interiorismo",
    "Music Production": "Producción musical",
    "Voice Cloning": "Clonación de voz",
    "Speech Recognition": "Reconocimiento de voz",
    "Text-to-Speech": "Texto a voz",
    "Spreadsheet AI": "IA para hojas de cálculo",
    "Note-Taking": "Toma de notas",
    "Mind Mapping": "Mapas mentales",
    "Recipe & Food AI": "IA de recetas y comida",
    "Fitness & Wellness": "Fitness y bienestar",
    "E-commerce": "Comercio electrónico",
    "Photo Editing": "Edición de fotos",
    "Logo Makers": "Creadores de logotipos",
    "UI / UX Design": "Diseño UI / UX",
    "Game Asset Generation": "Generación de assets para videojuegos",
    "Data Visualization": "Visualización de datos",
    "OCR & Document AI": "OCR e IA de documentos",
    "AI Detectors": "Detectores de IA",
    "Plagiarism Checkers": "Verificadores de plagio",
    "AI Agents": "Agentes de IA",
    "No-code AI": "IA sin código",
    "Analytics": "Analítica"
  } as Record<string, string>,
  popularCategoryDescs: {
    "Writing & Editing": "Genera, edita y perfecciona texto — desde publicaciones de blog hasta copy de marketing y ficción extensa.",
    "Image Generation": "Genera imágenes, ilustraciones y arte a partir de prompts de texto con los últimos modelos de difusión.",
    "Code & Developer": "Programadores en pareja con IA, autocompletado, revisores de código y generadores full-stack.",
    "Video & Animation": "Genera, edita y anima video — desde texto a video hasta eliminación de fondo y sincronización labial.",
    "Audio & Music": "Clonación de voz, generación musical, transcripción, producción de podcasts y diseño de sonido.",
    "Productivity & Automation": "IA de calendario, resúmenes de reuniones, automatización de tareas y asistentes de flujo de trabajo personal."
  } as Record<string, string>,
  useCases: {
    "Write a blog post": {
      "name": "Escribir una publicación de blog",
      "desc": "Herramientas que ayudan a investigar, esquematizar y escribir más rápido."
    },
    "Create a logo": {
      "name": "Crear un logotipo",
      "desc": "Herramientas de diseño con IA para logotipos, identidad de marca y assets visuales."
    },
    "Analyse data": {
      "name": "Analizar datos",
      "desc": "Entiende hojas de cálculo, archivos CSV y bases de datos con IA."
    },
    "Edit a video": {
      "name": "Editar un video",
      "desc": "Corta, subtitula y mejora video con la ayuda de la IA."
    },
    "Reply to emails": {
      "name": "Responder correos",
      "desc": "Escribe, resume y gestiona tu bandeja de entrada más rápido."
    },
    "Transcribe audio": {
      "name": "Transcribir audio",
      "desc": "Convierte reuniones, podcasts y llamadas en texto buscable."
    },
    "Ship code faster": {
      "name": "Programar más rápido",
      "desc": "Programadores en pareja con IA, generadores de código y ayudantes de depuración."
    },
    "Run social media": {
      "name": "Gestionar redes sociales",
      "desc": "Programa, escribe y analiza contenido en varias plataformas."
    }
  } as Record<string, { name: string; desc: string }>,
  pricingTiers: {
    "Free": {
      "name": "Totalmente gratis",
      "desc": "Herramientas de código abierto o completamente gratuitas — utilizables sin plan de pago."
    },
    "Freemium": {
      "name": "Plan gratuito disponible",
      "desc": "Un plan gratuito generoso + una mejora de pago opcional si necesitas más funciones."
    },
    "Paid": {
      "name": "Solo de pago",
      "desc": "Herramientas premium basadas en suscripción — sin versión gratuita."
    },
    "Enterprise": {
      "name": "Precio personalizado",
      "desc": "Herramientas empresariales con contratos a medida y soporte dedicado."
    }
  } as Record<string, { name: string; desc: string }>,
  subCategories: {
    "SEO & Content": "SEO y contenido",
    "AI Copywriting": "Redacción publicitaria con IA",
    "Email Marketing": "Email marketing",
    "Social Media": "Redes sociales",
    "Ad Creative": "Creatividad publicitaria",
    "Analytics": "Analítica"
  } as Record<string, string>,
  marketingFaq: [
    {
      "q": "¿Cuáles son las mejores herramientas de IA de marketing en 2026?",
      "a": "Para la mayoría de los equipos de marketing, **Jasper AI** es la mejor opción — combina redacción con IA, aprendizaje de la voz de marca, modo SEO y colaboración en equipo en una sola plataforma. Para fundadores independientes o equipos con poco presupuesto, el sólido plan gratuito de **Copy.ai** es una buena opción, y **Writesonic** destaca en contenido centrado en SEO. \"La mejor\" depende del caso de uso: contenido de blog, creatividad publicitaria, automatización de correo o marketing de embudo completo."
    },
    {
      "q": "¿Existen herramientas de IA de marketing gratuitas?",
      "a": "Sí — de las 108 herramientas de esta categoría, 31 tienen un plan completamente gratuito y 52 ofrecen un plan freemium generoso. Puedes ver todas usando los filtros \"Gratis\" o \"Freemium\" arriba. Opciones gratuitas destacadas: Copy.ai, ChatGPT (plan gratuito), Canva Magic Write y las herramientas de IA gratuitas de HubSpot."
    },
    {
      "q": "¿Pueden las herramientas de IA de marketing reemplazar a un equipo de marketing?",
      "a": "No — lo mejor es pensar en las herramientas de IA de marketing como un amplificador, no un reemplazo. La IA se encarga de las tareas repetitivas (borradores de copy, generación de variantes, programación, reportes), mientras que los marketers se enfocan en estrategia, marca y decisiones de alto impacto. La mayoría de los equipos reportan una mejora de productividad de 2 a 5 veces, más cercano a ampliar resultados que a reducir personal."
    },
    {
      "q": "¿Cuál es la mejor herramienta de IA de marketing para SEO?",
      "a": "**Surfer SEO** y **Frase** son las herramientas de contenido SEO con IA más destacadas — ambas combinan análisis de SERP con redacción con IA para crear artículos que se posicionan bien en las búsquedas. Para SEO técnico, **Semrush** y **Ahrefs** también incorporan funciones de IA muy potentes."
    },
    {
      "q": "¿Cómo elijo la herramienta de IA de marketing adecuada para mí?",
      "a": "Empieza por tu mayor cuello de botella. Si la publicación de contenido se estanca, prueba un redactor con IA. Si tu blog no aparece en las búsquedas, prueba una herramienta de SEO. Si el rendimiento del correo está estancado, prueba una IA de email. No adoptes cinco herramientas a la vez — elige una, intégrala a fondo y luego añade más."
    }
  ] as Array<{ q: string; a: string }>,
  marketingFacts: {
    "Total tools": "Total de herramientas",
    "Free tools": "Herramientas gratis",
    "Freemium": "Freemium",
    "Paid only": "Solo de pago",
    "Avg starting price": "Precio inicial medio",
    "Top use case": "Caso de uso principal"
  } as Record<string, string>,
  relatedSliderTools: {
    "Claude": {
      "cat": "Chat con IA · Anthropic",
      "desc": "El razonamiento sofisticado y el análisis de contexto extenso de Anthropic."
    },
    "Google Gemini": {
      "cat": "Chat con IA · Google",
      "desc": "La IA multimodal de Google que abarca texto, imagen y video."
    },
    "Perplexity": {
      "cat": "Búsqueda con IA",
      "desc": "Búsqueda con IA con citas en tiempo real."
    },
    "MS Copilot": {
      "cat": "Chat con IA · Microsoft",
      "desc": "El asistente de IA de Microsoft basado en GPT-4."
    },
    "Mistral": {
      "cat": "Chat con IA",
      "desc": "Modelos de pesos abiertos con una eficiencia inigualable."
    },
    "Cohere": {
      "cat": "API de IA",
      "desc": "IA de lenguaje de nivel empresarial para equipos de negocio."
    },
    "Groq": {
      "cat": "API de IA",
      "desc": "Inferencia de LLM ultrarrápida para desarrolladores."
    }
  } as Record<string, { cat: string; desc: string }>,
  pricingTags: {
    "Free": "Gratis",
    "Free tier": "Plan gratuito",
    "Free Trial": "Prueba gratis",
    "Paid": "De pago",
    "Credit-based": "Basado en créditos",
    "Enterprise": "Empresarial"
  } as Record<string, string>,
  writerUseCases: [
    {
      "name": "Contenido extenso",
      "desc": "Artículos, informes y contenido profundo a gran escala"
    },
    {
      "name": "Contenido SEO",
      "desc": "Publicaciones de blog optimizadas para posicionarse mejor con integración de palabras clave con IA"
    },
    {
      "name": "Copy de correo",
      "desc": "Asuntos, secuencias y prospección en frío"
    },
    {
      "name": "Redes sociales",
      "desc": "Hilos de Twitter, publicaciones y posts de LinkedIn en segundos"
    }
  ] as UseCaseOverride[],
  devUseCases: [
    {
      "name": "IDE de programación con IA",
      "desc": "Escribe, depura e implementa con ayuda de la IA"
    },
    {
      "name": "Herramientas de API",
      "desc": "Integra IA en tu app en minutos"
    },
    {
      "name": "Generación de UI",
      "desc": "De un prompt a React listo para producción en segundos"
    },
    {
      "name": "Revisión de código",
      "desc": "Detección de errores y refactorización con IA"
    }
  ] as UseCaseOverride[],
  newsByTitle: {
    "OpenAI launches GPT-5 with 1M token context and real-time reasoning": {
      "source": "OpenAI",
      "category": "Lanzamiento de producto",
      "title": "OpenAI lanza GPT-5 con contexto de 1 millón de tokens y razonamiento en tiempo real",
      "excerpt": "La próxima generación del modelo insignia de OpenAI ofrece una ventana de contexto 10 veces mayor, razonamiento mejorado y acceso web nativo en tiempo real sin necesidad de plugins.",
      "time": "hace 2 horas",
      "read": "5 min de lectura"
    },
    "DeepMind releases Gemini 2.5 with new multimodal capabilities": {
      "source": "Google DeepMind",
      "category": "Investigación",
      "title": "DeepMind presenta Gemini 2.5 con nuevas capacidades multimodales",
      "time": "hace 4 horas",
      "read": "3 min de lectura"
    },
    "Claude 4 launches with extended thinking and computer use 2.0": {
      "source": "Anthropic",
      "category": "Lanzamiento de producto",
      "title": "Claude 4 se lanza con pensamiento extendido y uso de computadora 2.0",
      "time": "hace 6 horas",
      "read": "4 min de lectura"
    },
    "Sora 2.0 now supports 4K output and 5-minute video generation": {
      "source": "OpenAI",
      "category": "IA de video",
      "title": "Sora 2.0 ahora admite salida en 4K y generación de video de 5 minutos",
      "time": "hace 6 horas",
      "read": "2 min de lectura"
    },
    "Mixtral 9x22B open-sourced — GPT-4 level at 3x lower cost": {
      "source": "Mistral AI",
      "category": "Investigación",
      "title": "Mixtral 9x22B se lanza como código abierto — nivel GPT-4 a 3 veces menor costo",
      "time": "hace 10 horas",
      "read": "3 min de lectura"
    }
  } as Record<string, NewsOverride>,
  blogPostsBySlug: {
    "gpt-5-complete-guide": {
      "tag": "Guía",
      "title": "Guía completa de GPT-5: todo lo que necesitas saber",
      "date": "4 de mayo",
      "read": "8 min"
    },
    "chatgpt-vs-claude-4": {
      "tag": "Comparativa",
      "title": "ChatGPT vs Claude 4 (2026): ¿qué IA gana?",
      "date": "1 de mayo",
      "read": "12 min"
    },
    "best-free-ai-marketing-tools": {
      "tag": "Recomendaciones",
      "title": "Las 7 mejores herramientas de IA gratis para marketers en 2026",
      "date": "25 de abril",
      "read": "9 min"
    }
  } as Record<string, BlogOverride>,
};

const OVERLAYS: Record<string, typeof TRANSLATIONS_KO> = {
  ko: TRANSLATIONS_KO,
  zh: TRANSLATIONS_ZH,
  de: TRANSLATIONS_DE,
  fr: TRANSLATIONS_FR,
  ja: TRANSLATIONS_JA,
  pt: TRANSLATIONS_PT,
  tw: TRANSLATIONS_TW,
  vi: TRANSLATIONS_VI,
  es: TRANSLATIONS_ES,
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
