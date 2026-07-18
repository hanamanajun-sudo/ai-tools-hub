"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { aiTools, categories, type Category, type AITool } from "@/lib/ai-tools-data";
import { categoryColors } from "@/lib/tool-styles";
import {
  Search, ExternalLink, Star, LayoutGrid, ListOrdered, Calendar,
  FileText, Image, Film, Code, Music, Sparkles, Bot
} from "lucide-react";
import Link from "next/link";

/* ===================================================================
   Lucide 아이콘 맵 (이모지 대체)
   =================================================================== */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  text:   <FileText className="h-4 w-4" />,
  image:  <Image className="h-4 w-4" />,
  video:  <Film className="h-4 w-4" />,
  coding: <Code className="h-4 w-4" />,
  music:  <Music className="h-4 w-4" />,
  agent:  <Bot className="h-4 w-4" />,
  other:  <Sparkles className="h-4 w-4" />,
};

/* ===================================================================
   크로스 카테고리
   =================================================================== */
const CROSS_CATEGORY: Record<string, Exclude<Category, "all">[]> = {
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
const RANKING_OVERRIDES: Record<string, Record<string, number>> = {
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
const MERGED_TOOLS: Record<string, { into: string; note: string }> = {
  "chatgpt-image":  { into: "chatgpt", note: "ChatGPT Image 통합" },
  "image-nanobana": { into: "gemini",  note: "Gemini 이미지 통합" },
};

/* ===================================================================
   Sora 서비스 종료 메모
   =================================================================== */
const SORA_SHUTDOWN = "⚠️ 2026년 3월 25일, OpenAI에서 Sora 앱 서비스 종료를 공지했습니다.";

/* ---------- 순위 점수 ---------- */
function calcRankScore(tool: AITool): number {
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

function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function getHighlight(tool: AITool): string {
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
function shortDesc(tool: AITool): string {
  const d = tool.description;
  if (d.length <= 60) return d;
  // 첫 마침표 or 60자 앞에서 자르기
  const dot = d.indexOf(".", 40);
  if (dot > 0 && dot < 70) return d.slice(0, dot + 1);
  return d.slice(0, 58) + "…";
}

/* ===================================================================
   ToolCard (카드 그리드용)
   =================================================================== */
function ToolCard({ tool }: { tool: AITool }) {
  const colorClass = categoryColors[tool.category];
  const categoryLabel = categories.find((c) => c.value === tool.category);
  return (
    <Link href={`/tools/${tool.id}`} className="block">
      <Card className="group relative flex flex-col bg-card border-border/50 transition-all duration-300 hover:border-border hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
        {tool.popular && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-black shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              인기
            </div>
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                  {CATEGORY_ICONS[tool.category]} {categoryLabel?.label}
                </span>
                {tool.free ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">무료</span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">유료</span>
                )}
              </div>
              <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{tool.name}</CardTitle>
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{tool.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            className="w-full gap-2 border-border/50 hover:border-border transition-all group/btn"
            onClick={(e) => { e.preventDefault(); window.open(tool.url, "_blank", "noopener,noreferrer"); }}
          >
            <span>사이트 방문</span>
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

/* ===================================================================
   ToolsSection
   =================================================================== */
export function ToolsSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [viewMode, setViewMode] = useState<"ranking" | "grid">("ranking");

  // 검색어를 URL(?q=)에 동기화 — 홈 WebSite/SearchAction 스키마의 대상 URL을 실제로 동작하게 함
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchQuery.trim()) params.set("q", searchQuery);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const today = new Date();
  const updateDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  /* ---------- 랭킹 (수동 오버라이드 + 통합 툴 적용) ---------- */
  const rankedCategories = useMemo(() => {
    // 1) 카테고리 매핑 (크로스 포함)
    const toolCategoryMap = new Map<string, Exclude<Category, "all">[]>();
    for (const tool of aiTools) {
      const extras = CROSS_CATEGORY[tool.id] ?? [];
      toolCategoryMap.set(tool.id, [tool.category, ...new Set(extras)]);
    }
    // 2) 통합 툴 제외하고 카테고리별 수집
    const catTools = new Map<Exclude<Category, "all">, AITool[]>();
    for (const tool of aiTools) {
      // 통합된 툴은 숨김 (주 툴에 포함됨)
      if (MERGED_TOOLS[tool.id]) continue;
      const cats = toolCategoryMap.get(tool.id) ?? [tool.category];
      for (const cat of cats) {
        if (!catTools.has(cat)) catTools.set(cat, []);
        catTools.get(cat)!.push(tool);
      }
    }
    const result: { category: Exclude<Category, "all">; tools: (AITool & { score: number; rankInCat: number; mergeNote?: string; soraNote?: string })[] }[] = [];
    for (const cat of categories) {
      if (cat.value === "all") continue;
      const tools = catTools.get(cat.value) ?? [];
      if (tools.length === 0) continue;
      let filtered = tools;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = tools.filter(
          (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      if (filtered.length === 0) continue;
      // 오버라이드 & auto-rank
      const override = RANKING_OVERRIDES[cat.value] ?? {};
      const overriddenIds = new Set(Object.keys(override));
      const overrideMax = overriddenIds.size > 0 ? Math.max(...Object.values(override)) : 0;
      // 오버라이드 적용
      const ranked: (AITool & { score: number; rankInCat: number; mergeNote?: string; soraNote?: string })[] = [];
      for (const [id, pos] of Object.entries(override)) {
        const tool = filtered.find((t) => t.id === id);
        if (tool) {
          const mergeNote = Object.values(MERGED_TOOLS).find((m) => m.into === id)?.note;
          const soraNote = id === "sora" ? SORA_SHUTDOWN : undefined;
          ranked.push({ ...tool, score: calcRankScore(tool), rankInCat: pos, mergeNote, soraNote });
        }
      }
      // auto-rank (오버라이드 없는 툴, 점수순)
      const autoTools = filtered
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
  }, [searchQuery]);

  /* ---------- 카드 그리드 필터 ---------- */
  const filteredCards = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return aiTools.filter((tool) => {
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return tool.name.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query) || tool.tags.some((tag) => tag.toLowerCase().includes(query));
    });
  }, [searchQuery, selectedCategory]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: aiTools.length };
    for (const t of aiTools) counts[t.category] = (counts[t.category] ?? 0) + 1;
    return counts;
  }, []);

  const categoryMeta: Record<string, { label: string }> = {};
  for (const c of categories) if (c.value !== "all") categoryMeta[c.value] = { label: c.label };

  const totalRankedTools = rankedCategories.reduce((s, c) => s + c.tools.length, 0);

  return (
    <>
      {/* Search */}
      <section className="mb-6">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            aria-label="AI 도구 검색"
            placeholder="AI 도구 이름, 기능, 태그로 검색..."
            className="h-11 pl-10 pr-4 bg-muted/30 border-border/50 focus:border-border focus-visible:ring-1 focus-visible:ring-ring/50 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* 업데이트 날짜 */}
      <div className="flex items-center justify-center gap-1.5 mb-6 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        마지막 업데이트: {updateDate}
      </div>

      {/* 카테고리 점프 탭 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.filter(c => c.value !== "all").map((cat) => {
          const colorClass = categoryColors[cat.value] || "";
          return (
            <a
              key={cat.value}
              href={`#category-${cat.value}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`category-${cat.value}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 ${colorClass} hover:shadow-sm`}
            >
              {CATEGORY_ICONS[cat.value]}
              {cat.label}
            </a>
          );
        })}
      </div>

      {searchQuery.trim() && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalRankedTools === 0 ? "검색 결과가 없습니다" : (
              <><span className="font-semibold text-foreground">{totalRankedTools}</span>개 도구 검색됨 <span className="ml-1">— &quot;<span className="text-primary">{searchQuery}</span>&quot;</span></>
            )}
          </p>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-auto py-1" onClick={() => setSearchQuery("")}>검색 초기화</Button>
        </div>
      )}

      {/* ========== RANKING VIEW ========== */}
      {viewMode === "ranking" && totalRankedTools === 0 && searchQuery.trim() ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">검색 결과가 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-6">다른 검색어를 시도해보세요.</p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>전체 도구 보기</Button>
        </div>
      ) : viewMode === "ranking" ? (
        <div className="mx-auto max-w-5xl space-y-8">
          {rankedCategories.map((cat) => {
            const meta = categoryMeta[cat.category];
            const colorClass = categoryColors[cat.category] || "";

            return (
              <section key={cat.category} id={`category-${cat.category}`}>
                {/* 카테고리 헤더 — 제목만 */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${colorClass}`}>
                    {CATEGORY_ICONS[cat.category]}
                  </span>
                  <h2 className="text-lg font-bold text-foreground">{meta?.label}</h2>
                </div>

                {/* 랭킹 테이블 */}
                <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="w-14 py-3 pl-4 text-center text-xs font-semibold text-muted-foreground">순위</th>
                        <th className="py-3 pl-2 text-left text-xs font-semibold text-muted-foreground">도구</th>
                        <th className="hidden sm:table-cell py-3 text-left text-xs font-semibold text-muted-foreground">설명</th>
                        <th className="w-32 py-3 text-left text-xs font-semibold text-muted-foreground">하이라이트</th>
                        <th className="w-24 py-3 pr-4 text-center text-xs font-semibold text-muted-foreground">사이트 바로가기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.tools.map((tool) => {
                        const rankEmoji = getRankEmoji(tool.rankInCat);
                        const highlight = getHighlight(tool);
                        const rowBg = tool.rankInCat === 1 ? "bg-amber-500/[0.03]" : tool.rankInCat === 2 ? "bg-gray-400/[0.03]" : tool.rankInCat === 3 ? "bg-orange-500/[0.03]" : "";
                        return (
                          <tr
                            key={`${tool.id}-${cat.category}`}
                            onClick={() => router.push(`/tools/${tool.id}`)}
                            className={`border-b border-border/20 transition-all last:border-0 ${rowBg} cursor-pointer hover:bg-muted/30 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]`}
                          >
                            {/* 순위 */}
                            <td className="py-3 pl-4 text-center">
                              <span className={`text-base font-bold ${tool.rankInCat <= 3 ? "" : "text-muted-foreground"}`}>
                                {rankEmoji}
                              </span>
                            </td>
                            {/* 도구명 */}
                            <td className="py-3 pl-2">
                              <span className="font-semibold text-foreground">
                                {tool.name}
                              </span>
                              {tool.mergeNote && (
                                <span className="block text-[10px] text-muted-foreground/60 mt-0.5">{tool.mergeNote}</span>
                              )}
                            </td>
                            {/* 설명 (절반 이하로) */}
                            <td className="hidden sm:table-cell py-3 text-muted-foreground pr-4">
                              <span className="text-xs leading-snug block">
                                {shortDesc(tool)}
                                {tool.description.length > 60 && (
                                  <span className="text-muted-foreground/50 ml-0.5"> 자세한 내용은 개별 페이지로</span>
                                )}
                              </span>
                              {tool.soraNote && (
                                <span className="block text-[10px] text-amber-500/80 mt-1 leading-tight">{tool.soraNote}</span>
                              )}
                            </td>
                            {/* 하이라이트 */}
                            <td className="py-3">
                              <span className="text-xs text-muted-foreground">{highlight}</span>
                            </td>
                            {/* 사이트 바로가기 */}
                            <td className="py-3 pr-4 text-center">
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title="사이트 방문"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      ) : null}

      {/* ========== CARD GRID VIEW ========== */}
      {viewMode === "grid" && (
        <>
          <section className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const count = catCounts[cat.value] ?? 0;
                const isSelected = selectedCategory === cat.value;
                return (
                  <Button key={cat.value} variant={isSelected ? "default" : "outline"} size="sm" className={`gap-2 transition-all ${isSelected ? "shadow-sm" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"}`} onClick={() => setSelectedCategory(cat.value)}>
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-mono leading-none ${isSelected ? "bg-background/20 text-current" : "bg-muted text-muted-foreground"}`}>{count}</span>
                  </Button>
                );
              })}
            </div>
          </section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCards.length === 0 ? "검색 결과가 없습니다" : (<><span className="font-semibold text-foreground">{filteredCards.length}</span>개의 도구</>)}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-auto py-1" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>필터 초기화</Button>
            )}
          </div>
          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCards.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">검색 결과가 없습니다</h3>
              <p className="text-sm text-muted-foreground mb-6">다른 검색어나 카테고리를 시도해보세요.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>전체 도구 보기</Button>
            </div>
          )}
        </>
      )}

      {/* 하단 뷰 전환 */}
      <div className="mt-12 flex items-center justify-center gap-2">
        <Button variant={viewMode === "ranking" ? "default" : "outline"} size="sm" className={`gap-2 ${viewMode === "ranking" ? "" : "border-border/50 text-muted-foreground"}`} onClick={() => setViewMode("ranking")}>
          <ListOrdered className="h-4 w-4" />
          순위 테이블
        </Button>
        <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" className={`gap-2 ${viewMode === "grid" ? "" : "border-border/50 text-muted-foreground"}`} onClick={() => setViewMode("grid")}>
          <LayoutGrid className="h-4 w-4" />
          카드 그리드
        </Button>
      </div>
    </>
  );
}
