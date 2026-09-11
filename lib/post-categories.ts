// ktoolu.com(26편) + ktoolu 블로그(16편) 통합 카테고리 체계.
// 두 Notion DB 모두 원본 Category 값은 건드리지 않고, 노출 시점에만
// 아래 매핑으로 6개 통합 카테고리로 정규화한다.
//
// 실측 분포(2026-09-11 기준, Published=true 기준):
//   유튜브 & 숏폼      14  (ktoolu.com)
//   AI 도구 비교        9  (ktoolu.com 6 + ktoolu "AI 도구 리뷰"/"카테고리별 추천")
//   AI 콘텐츠 제작      6  (ktoolu.com)
//   AI 개발 · 자동화   13  (ktoolu "AI 활용 팁"/"AI 트렌드 뉴스" — Claude Code, Hermes,
//                          로컬 LLM 호스팅 등 개발 도구 실사용기 + 하드웨어/이벤트 동향)
//   글쓰기 & 소설       0  (/story 연동 시 채워질 예정)
//   게임 · 앱 만들기     0  (티어메이커 등 연동 시 채워질 예정)

export const ALL_CATEGORIES = [
  "AI 콘텐츠 제작",
  "AI 도구 비교",
  "유튜브 & 숏폼",
  "AI 개발 · 자동화",
  "글쓰기 & 소설",
  "게임 · 앱 만들기",
] as const;

export type PostCategory = (typeof ALL_CATEGORIES)[number] | string;

// 원본 Category 값 → 통합 카테고리. 매핑에 없는 값은 원본 그대로 통과시킨다
// (앞으로 늘어날 카테고리를 여기서 계속 좁혀나가도록).
const CATEGORY_ALIAS: Record<string, PostCategory> = {
  "AI 도구 리뷰": "AI 도구 비교",
  "카테고리별 추천": "AI 도구 비교",
  "AI 활용 팁": "AI 개발 · 자동화",
  "AI 트렌드 뉴스": "AI 개발 · 자동화",
};

export function normalizeCategory(raw: string): PostCategory {
  return CATEGORY_ALIAS[raw] ?? raw;
}

export const CATEGORY_COLORS: Record<string, string> = {
  "AI 콘텐츠 제작": "bg-violet-500/10 text-violet-600 border-violet-500/25 dark:text-violet-400",
  "AI 도구 비교": "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400",
  "유튜브 & 숏폼": "bg-rose-500/10 text-rose-600 border-rose-500/25 dark:text-rose-400",
  "AI 개발 · 자동화": "bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400",
  "글쓰기 & 소설": "bg-blue-500/10 text-blue-600 border-blue-500/25 dark:text-blue-400",
  "게임 · 앱 만들기": "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/25 dark:text-fuchsia-400",
};

export const CATEGORY_GRADIENTS: Record<string, string> = {
  "AI 콘텐츠 제작": "from-violet-500 via-purple-500 to-violet-600",
  "AI 도구 비교": "from-emerald-500 via-teal-400 to-emerald-600",
  "유튜브 & 숏폼": "from-rose-500 via-pink-500 to-rose-600",
  "AI 개발 · 자동화": "from-amber-500 via-orange-400 to-amber-500",
  "글쓰기 & 소설": "from-blue-500 via-indigo-500 to-blue-600",
  "게임 · 앱 만들기": "from-fuchsia-500 via-purple-400 to-fuchsia-600",
};

export const DEFAULT_CATEGORY_COLOR = "bg-secondary/50 text-muted-foreground border-border";
export const DEFAULT_CATEGORY_GRADIENT = "from-slate-400 via-slate-500 to-slate-400";
