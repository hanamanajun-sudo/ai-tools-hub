"use client";

import { useState, useMemo } from "react";
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
import { Search, ExternalLink, Star, LayoutGrid, ListOrdered, Calendar } from "lucide-react";
import Link from "next/link";

/* ===================================================================
   크로스 카테고리: 특정 도구를 추가 카테고리에도 등장시킴
   예) ChatGPT는 이미지·코딩, Claude는 코딩, Gemini는 이미지·코딩
   =================================================================== */
const CROSS_CATEGORY: Record<string, Exclude<Category, "all">[]> = {
  chatgpt:          ["image", "coding"],
  claude:           ["coding"],
  gemini:           ["image", "coding"],
  deepseek:         ["coding"],
  "ms-copilot":     ["coding"],
};

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
  const bonus = tool.popular ? 0.35 : 0;
  return avg + bonus;
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

function categoryStats(tools: AITool[]) {
  const freeCount = tools.filter((t) => t.free).length;
  const avgRating =
    tools.reduce((s, t) => {
      if (!t.expertRating) return s;
      return s + (t.expertRating.accuracy + t.expertRating.easeOfUse + t.expertRating.features + t.expertRating.performance + t.expertRating.value + t.expertRating.innovation) / 6;
    }, 0) / tools.length;
  return { freeCount, avgRating: avgRating || 0 };
}

/* ===================================================================
   카드 그리드용 ToolCard (기존 UI 복원)
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
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                  {categoryLabel?.emoji} {categoryLabel?.label}
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
            className="w-full gap-2 border-border/50 hover:border-border hover:bg-accent transition-all group/btn"
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
   ToolsSection 메인
   =================================================================== */
export function ToolsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [viewMode, setViewMode] = useState<"ranking" | "grid">("ranking");

  // 업데이트 날짜 (오늘 기준)
  const today = new Date();
  const updateDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  /* ---------- 카테고리별 랭킹 (크로스 포함) ---------- */
  const rankedCategories = useMemo(() => {
    // 1) 각 도구의 원본 카테고리 + 크로스 카테고리 매핑
    const toolCategoryMap = new Map<string, Exclude<Category, "all">[]>();
    for (const tool of aiTools) {
      const extras = CROSS_CATEGORY[tool.id] ?? [];
      const cats = [tool.category, ...extras];
      // 중복 제거
      toolCategoryMap.set(tool.id, [...new Set(cats)]);
    }

    // 2) 카테고리별 도구 수집
    const catTools = new Map<Exclude<Category, "all">, AITool[]>();
    for (const tool of aiTools) {
      const cats = toolCategoryMap.get(tool.id) ?? [tool.category];
      for (const cat of cats) {
        if (!catTools.has(cat)) catTools.set(cat, []);
        catTools.get(cat)!.push(tool);
      }
    }

    // 3) 검색어 필터 + 점수 산정 + 정렬
    const result: {
      category: Exclude<Category, "all">;
      tools: (AITool & { score: number; rankInCat: number })[];
    }[] = [];

    for (const cat of categories) {
      if (cat.value === "all") continue;
      const tools = catTools.get(cat.value) ?? [];
      if (tools.length === 0) continue;

      let filtered = tools;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = tools.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      if (filtered.length === 0) continue;

      const scored = filtered
        .map((t) => ({ ...t, score: calcRankScore(t), rankInCat: 0 }))
        .sort((a, b) => b.score - a.score)
        .map((t, i) => ({ ...t, rankInCat: i + 1 }));

      result.push({ category: cat.value, tools: scored });
    }

    // 카테고리 total score 순 정렬
    result.sort((a, b) => b.tools.reduce((s, t) => s + t.score, 0) - a.tools.reduce((s, t) => s + t.score, 0));
    return result;
  }, [searchQuery]);

  /* ---------- 카드 그리드용 필터 ---------- */
  const filteredCards = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return aiTools.filter((tool) => {
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, selectedCategory]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: aiTools.length };
    for (const t of aiTools) counts[t.category] = (counts[t.category] ?? 0) + 1;
    return counts;
  }, []);

  const categoryMeta: Record<string, { label: string; emoji: string }> = {};
  for (const c of categories) if (c.value !== "all") categoryMeta[c.value] = { label: c.label, emoji: c.emoji };

  const totalRankedTools = rankedCategories.reduce((s, c) => s + c.tools.length, 0);

  return (
    <>
      {/* Search */}
      <section className="mb-6">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
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

      {/* 결과 정보 */}
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

      {/* ---------- RANKING VIEW ---------- */}
      {viewMode === "ranking" && totalRankedTools === 0 && searchQuery.trim() ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">검색 결과가 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-6">다른 검색어를 시도해보세요.</p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>전체 도구 보기</Button>
        </div>
      ) : viewMode === "ranking" ? (
        <div className="mx-auto max-w-5xl space-y-10">
          {rankedCategories.map((cat) => {
            const meta = categoryMeta[cat.category];
            const stats = categoryStats(cat.tools);
            const colorClass = categoryColors[cat.category] || "";

            return (
              <section key={cat.category}>
                {/* 카테고리 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">{meta?.emoji} {meta?.label}</h2>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                      {stats.freeCount}/{cat.tools.length} 무료
                    </span>
                    {stats.avgRating > 0 && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">평균 ⭐ {stats.avgRating.toFixed(1)}</span>
                    )}
                  </div>
                </div>

                {/* 랭킹 테이블 */}
                <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="w-14 py-3 pl-4 text-center text-xs font-semibold text-muted-foreground">순위</th>
                        <th className="py-3 pl-2 text-left text-xs font-semibold text-muted-foreground">도구</th>
                        <th className="hidden sm:table-cell py-3 text-left text-xs font-semibold text-muted-foreground">설명</th>
                        <th className="w-32 py-3 pr-4 text-left text-xs font-semibold text-muted-foreground">하이라이트</th>
                        <th className="w-12 py-3 pr-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.tools.map((tool) => {
                        const rankEmoji = getRankEmoji(tool.rankInCat);
                        const highlight = getHighlight(tool);
                        const rowBg = tool.rankInCat === 1 ? "bg-amber-500/5" : tool.rankInCat === 2 ? "bg-gray-400/5" : tool.rankInCat === 3 ? "bg-orange-500/5" : "";
                        const isCrossCategory = tool.category !== cat.category;

                        return (
                          <tr key={`${tool.id}-${cat.category}`} className={`border-b border-border/20 transition-colors hover:bg-muted/20 last:border-0 ${rowBg}`}>
                            {/* 순위 */}
                            <td className="py-3 pl-4 text-center">
                              <span className={`text-base font-bold ${tool.rankInCat <= 3 ? "" : "text-muted-foreground"}`}>
                                {rankEmoji}
                              </span>
                            </td>
                            {/* 도구명 */}
                            <td className="py-3 pl-2">
                              <Link href={`/tools/${tool.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                {tool.name}
                              </Link>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tool.popular && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
                                    <Star className="h-2.5 w-2.5 fill-current" />
                                    인기
                                  </span>
                                )}
                                {tool.free && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">무료</span>
                                )}
                                {isCrossCategory && (
                                  <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${colorClass}`}>
                                    {categoryMeta[tool.category]?.emoji} {categories.find(c => c.value === tool.category)?.label}
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* 설명 */}
                            <td className="hidden sm:table-cell py-3 text-muted-foreground max-w-[260px] truncate pr-4">
                              {tool.description}
                            </td>
                            {/* 하이라이트 */}
                            <td className="py-3 pr-4">
                              <span className="text-xs text-muted-foreground">{highlight}</span>
                            </td>
                            {/* 방문 */}
                            <td className="py-3 pr-4">
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
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

      {/* ---------- CARD GRID VIEW ---------- */}
      {viewMode === "grid" && (
        <>
          {/* 카테고리 필터 */}
          <section className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const count = catCounts[cat.value] ?? 0;
                const isSelected = selectedCategory === cat.value;
                return (
                  <Button
                    key={cat.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`gap-2 transition-all ${isSelected ? "shadow-sm" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"}`}
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-mono leading-none ${isSelected ? "bg-background/20 text-current" : "bg-muted text-muted-foreground"}`}>{count}</span>
                  </Button>
                );
              })}
            </div>
          </section>

          {/* 결과 수 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCards.length === 0 ? "검색 결과가 없습니다" : (
                <><span className="font-semibold text-foreground">{filteredCards.length}</span>개의 도구</>
              )}
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

      {/* ---------- 하단 뷰 전환 토글 ---------- */}
      <div className="mt-12 flex items-center justify-center gap-2">
        <Button
          variant={viewMode === "ranking" ? "default" : "outline"}
          size="sm"
          className={`gap-2 ${viewMode === "ranking" ? "" : "border-border/50 text-muted-foreground"}`}
          onClick={() => setViewMode("ranking")}
        >
          <ListOrdered className="h-4 w-4" />
          순위 테이블
        </Button>
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          className={`gap-2 ${viewMode === "grid" ? "" : "border-border/50 text-muted-foreground"}`}
          onClick={() => setViewMode("grid")}
        >
          <LayoutGrid className="h-4 w-4" />
          카드 그리드
        </Button>
      </div>
    </>
  );
}
