"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { aiTools, categories, type Category, type AITool } from "@/lib/ai-tools-data";
import { categoryColors } from "@/lib/tool-styles";
import { Search, ExternalLink, Star, Trophy, TrendingUp, Zap, Award } from "lucide-react";
import Link from "next/link";

/* ---------- 순위 점수 계산 ---------- */
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
  return "";
}

function getHighlight(tool: AITool): string {
  if (!tool.expertRating) return "";
  const { accuracy, easeOfUse, features, performance, value, innovation } = tool.expertRating;
  const scores: { label: string; val: number }[] = [
    { label: "정확도", val: accuracy },
    { label: "사용성", val: easeOfUse },
    { label: "기능", val: features },
    { label: "성능", val: performance },
    { label: "가성비", val: value },
    { label: "혁신성", val: innovation },
  ];
  const top = scores.reduce((a, b) => (a.val >= b.val ? a : b));
  if (top.val >= 4.6) return `🏆 ${top.label} 최상`;
  if (top.val >= 4.3) return `⭐ ${top.label} 우수`;
  return `${top.label} ${top.val.toFixed(1)}`;
}

/* ---------- 카테고리 통계 ---------- */
function categoryStats(tools: AITool[]) {
  const freeCount = tools.filter((t) => t.free).length;
  const avgRating =
    tools.reduce((s, t) => {
      if (!t.expertRating) return s;
      const avg =
        (t.expertRating.accuracy +
          t.expertRating.easeOfUse +
          t.expertRating.features +
          t.expertRating.performance +
          t.expertRating.value +
          t.expertRating.innovation) /
        6;
      return s + avg;
    }, 0) / tools.length;
  const totalScore = tools.reduce((s, t) => s + calcRankScore(t), 0);
  return { freeCount, avgRating: avgRating || 0, totalScore };
}

export function ToolsSection() {
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------- 카테고리별 랭킹 ---------- */
  const rankedCategories = useMemo(() => {
    const catData: { category: Category; rank: number; tools: (AITool & { score: number; rankInCat: number })[] }[] = [];

    for (const cat of categories) {
      if (cat.value === "all") continue;

      let tools = aiTools.filter((t) => t.category === cat.value);

      // 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        tools = tools.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }

      if (tools.length === 0) continue;

      const scored = tools
        .map((t) => ({ ...t, score: calcRankScore(t), rankInCat: 0 }))
        .sort((a, b) => b.score - a.score)
        .map((t, i) => ({ ...t, rankInCat: i + 1 }));

      catData.push({
        category: cat.value,
        rank: 0,
        tools: scored,
      });
    }

    // 인기도 순으로 카테고리 정렬 (total score)
    catData.sort(
      (a, b) =>
        b.tools.reduce((s, t) => s + t.score, 0) - a.tools.reduce((s, t) => s + t.score, 0)
    );
    catData.forEach((c, i) => (c.rank = i + 1));

    return catData;
  }, [searchQuery]);

  const categoryMeta = useMemo(() => {
    const m: Record<string, { label: string; emoji: string }> = {};
    for (const c of categories) {
      if (c.value !== "all") m[c.value] = { label: c.label, emoji: c.emoji };
    }
    return m;
  }, []);

  const hasSearch = searchQuery.trim().length > 0;
  const totalTools = rankedCategories.reduce((s, c) => s + c.tools.length, 0);

  return (
    <>
      {/* Search */}
      <section className="mb-8">
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

      {/* Results Info */}
      {hasSearch && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalTools === 0 ? "검색 결과가 없습니다" : (
              <>
                <span className="font-semibold text-foreground">{totalTools}</span>개 도구 검색됨
                <span className="ml-1">— &quot;<span className="text-primary">{searchQuery}</span>&quot;</span>
              </>
            )}
          </p>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-auto py-1" onClick={() => setSearchQuery("")}>
            검색 초기화
          </Button>
        </div>
      )}

      {totalTools === 0 && hasSearch ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">검색 결과가 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-6">다른 검색어를 시도해보세요.</p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
            전체 도구 보기
          </Button>
        </div>
      ) : (
        /* ---------- 카테고리별 랭킹 섹션 ---------- */
        <div className="space-y-10">
          {rankedCategories.map((cat) => {
            const meta = categoryMeta[cat.category];
            const stats = categoryStats(cat.tools);
            const colorClass = categoryColors[cat.category] || "";

            return (
              <section key={cat.category}>
                {/* 카테고리 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">
                      {meta?.emoji} {meta?.label}
                    </h2>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                      {stats.freeCount}/{cat.tools.length} 무료
                    </span>
                    {stats.avgRating > 0 && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        평균 ⭐ {stats.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 랭킹 테이블 */}
                <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <th className="w-12 py-3 pl-4 text-center text-xs font-semibold text-muted-foreground">순위</th>
                        <th className="py-3 pl-2 text-left text-xs font-semibold text-muted-foreground">도구</th>
                        <th className="hidden sm:table-cell py-3 text-left text-xs font-semibold text-muted-foreground">설명</th>
                        <th className="w-20 py-3 text-center text-xs font-semibold text-muted-foreground">평점</th>
                        <th className="w-28 py-3 pr-4 text-left text-xs font-semibold text-muted-foreground">하이라이트</th>
                        <th className="w-12 py-3 pr-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.tools.map((tool) => {
                        const avg = tool.expertRating
                          ? (
                              (tool.expertRating.accuracy +
                                tool.expertRating.easeOfUse +
                                tool.expertRating.features +
                                tool.expertRating.performance +
                                tool.expertRating.value +
                                tool.expertRating.innovation) /
                              6
                            ).toFixed(1)
                          : "-";
                        const rankEmoji = getRankEmoji(tool.rankInCat);
                        const highlight = getHighlight(tool);
                        const rowBg = tool.rankInCat === 1 ? "bg-amber-500/5" : tool.rankInCat === 2 ? "bg-gray-400/5" : tool.rankInCat === 3 ? "bg-orange-500/5" : "";

                        return (
                          <tr key={tool.id} className={`border-b border-border/20 transition-colors hover:bg-muted/20 last:border-0 ${rowBg}`}>
                            {/* 순위 */}
                            <td className="py-3 pl-4 text-center">
                              <span className="text-base font-bold text-muted-foreground">
                                {rankEmoji || `#${tool.rankInCat}`}
                              </span>
                            </td>
                            {/* 도구명 */}
                            <td className="py-3 pl-2">
                              <Link href={`/tools/${tool.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                {tool.name}
                              </Link>
                              <div className="flex gap-1 mt-1">
                                {tool.popular && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
                                    <Star className="h-2.5 w-2.5 fill-current" />
                                    인기
                                  </span>
                                )}
                                {tool.free && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                                    무료
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* 설명 */}
                            <td className="hidden sm:table-cell py-3 text-muted-foreground max-w-[280px] truncate pr-4">
                              {tool.description}
                            </td>
                            {/* 평점 */}
                            <td className="py-3 text-center">
                              <span className="font-mono text-sm font-bold text-foreground">{avg}</span>
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
      )}
    </>
  );
}
