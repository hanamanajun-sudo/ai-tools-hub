import { aiTools, categories, type Category, type AITool } from "./ai-tools-data";

/* ===================================================================
   크로스 카테고리 — 특정 툴을 원 카테고리 외 추가 카테고리에도 노출
   =================================================================== */
export const CROSS_CATEGORY: Record<string, Exclude<Category, "all">[]> = {
  chatgpt:          ["image", "coding"],
  claude:           ["coding"],
  gemini:           ["image", "coding"],
  deepseek:         ["coding"],
  "ms-copilot":     ["coding"],
  manus:            [],
  devin:            [],
  "zapier-ai":      [],
  "auto-gpt":       [],
  "browser-use":    [],
};

/* ===================================================================
   수동 순위 오버라이드
   - 키: 카테고리 → { toolId: 원하는_순위 }
   - 오버라이드에 없는 툴은 auto-rank (오버라이드 마지막 순위 + 1부터)
   =================================================================== */
export const RANKING_OVERRIDES: Record<string, Record<string, number>> = {
  coding: {
    claude: 1, chatgpt: 2, cursor: 3, gemini: 4,
  },
  text: {
    claude: 1, chatgpt: 2, gemini: 3, deepseek: 4, grok: 5, perplexity: 6,
  },
  image: {
    chatgpt: 1, midjourney: 2, gemini: 3,
  },
  video: {
    seedance: 1, kling: 2, runway: 3, gemini: 4, sora: 5,
  },
  agent: {
    "zapier-ai": 3,
    n8n: 4,
    hermes: 6,
  },
};

/* ===================================================================
   툴 통합 (특정 카테고리에서 숨기고 상위 툴에 통합)
   =================================================================== */
export const MERGED_TOOLS: Record<string, { into: string; note: string }> = {
  "chatgpt-image":  { into: "chatgpt", note: "ChatGPT Image 통합" },
  "image-nanobana": { into: "gemini",  note: "Gemini 이미지 통합" },
};

export const SORA_SHUTDOWN = "⚠️ 2026년 3월 25일, OpenAI에서 Sora 앱 서비스 종료를 공지했습니다.";

export type RankedTool = AITool & {
  score: number;
  rankInCat: number;
  mergeNote?: string;
  soraNote?: string;
};

export function calcRankScore(tool: AITool): number {
  if (!tool.expertRating) return 0;
  const avg =
    (tool.expertRating.accuracy +
      tool.expertRating.easeOfUse +
      tool.expertRating.features +
      tool.expertRating.performance +
      tool.expertRating.value +
      tool.expertRating.innovation) /
    6;
  return avg + (tool.popular ? 0.35 : 0);
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export function getHighlight(tool: AITool): string {
  if (!tool.expertRating) return "";
  const scores: { label: string; val: number }[] = [
    { label: "정확도", val: tool.expertRating.accuracy },
    { label: "사용성", val: tool.expertRating.easeOfUse },
    { label: "기능", val: tool.expertRating.features },
    { label: "성능", val: tool.expertRating.performance },
    { label: "가성비", val: tool.expertRating.value },
    { label: "혁신성", val: tool.expertRating.innovation },
  ];
  const top = scores.reduce((a, b) => (a.val >= b.val ? a : b));
  if (top.val >= 4.6) return `🏆 ${top.label} 최상`;
  if (top.val >= 4.3) return `⭐ ${top.label} 우수`;
  return `${top.label} ${top.val.toFixed(1)}`;
}

/** 설명 짧게 자르기 */
export function shortDesc(tool: AITool): string {
  const d = tool.description;
  if (d.length <= 60) return d;
  const dot = d.indexOf(".", 40);
  if (dot > 0 && dot < 70) return d.slice(0, dot + 1);
  return d.slice(0, 58) + "…";
}

/**
 * 전 카테고리에 대해 크로스 카테고리·통합·수동 오버라이드를 반영한 순위를 계산.
 * 정적 데이터 기반이라 매 호출마다 재계산해도 비용이 작다 (렌더 시 1회).
 */
export function getRankedCategories(): { category: Exclude<Category, "all">; tools: RankedTool[] }[] {
  // 1) 카테고리 매핑 (크로스 포함)
  const toolCategoryMap = new Map<string, Exclude<Category, "all">[]>();
  for (const tool of aiTools) {
    const extras = CROSS_CATEGORY[tool.id] ?? [];
    toolCategoryMap.set(tool.id, [tool.category, ...new Set(extras)]);
  }
  // 2) 통합 툴 제외하고 카테고리별 수집
  const catTools = new Map<Exclude<Category, "all">, AITool[]>();
  for (const tool of aiTools) {
    if (MERGED_TOOLS[tool.id]) continue;
    const cats = toolCategoryMap.get(tool.id) ?? [tool.category];
    for (const cat of cats) {
      if (!catTools.has(cat)) catTools.set(cat, []);
      catTools.get(cat)!.push(tool);
    }
  }

  const result: { category: Exclude<Category, "all">; tools: RankedTool[] }[] = [];
  for (const cat of categories) {
    if (cat.value === "all") continue;
    const tools = catTools.get(cat.value) ?? [];
    if (tools.length === 0) continue;

    const override = RANKING_OVERRIDES[cat.value] ?? {};
    const overriddenIds = new Set(Object.keys(override));
    const overrideMax = overriddenIds.size > 0 ? Math.max(...Object.values(override)) : 0;

    const ranked: RankedTool[] = [];
    for (const [id, pos] of Object.entries(override)) {
      const tool = tools.find((t) => t.id === id);
      if (tool) {
        const mergeNote = Object.values(MERGED_TOOLS).find((m) => m.into === id)?.note;
        const soraNote = id === "sora" ? SORA_SHUTDOWN : undefined;
        ranked.push({ ...tool, score: calcRankScore(tool), rankInCat: pos, mergeNote, soraNote });
      }
    }

    const autoTools = tools
      .filter((t) => !overriddenIds.has(t.id))
      .map((t) => ({ ...t, score: calcRankScore(t), rankInCat: 0 }))
      .sort((a, b) => b.score - a.score);
    let autoPos = overrideMax;
    for (const t of autoTools) {
      autoPos++;
      t.rankInCat = autoPos;
    }
    ranked.push(...autoTools);
    ranked.sort((a, b) => a.rankInCat - b.rankInCat);
    result.push({ category: cat.value, tools: ranked });
  }

  // 카테고리 정렬: 수동 오버라이드 있는 카테고리가 먼저
  result.sort((a, b) => {
    const aHasOverride = RANKING_OVERRIDES[a.category] ? 0 : 1;
    const bHasOverride = RANKING_OVERRIDES[b.category] ? 0 : 1;
    if (aHasOverride !== bHasOverride) return aHasOverride - bHasOverride;
    return b.tools.reduce((s, t) => s + t.score, 0) - a.tools.reduce((s, t) => s + t.score, 0);
  });
  return result;
}

export function getRankedToolsForCategory(category: Exclude<Category, "all">): RankedTool[] {
  return getRankedCategories().find((c) => c.category === category)?.tools ?? [];
}
