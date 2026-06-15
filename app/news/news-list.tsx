"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { ExternalLink, Clock, AlertCircle, RefreshCw, X, Link2, Check, Star, ChevronLeft, ChevronRight } from "lucide-react";

// 🔥 편집자 픽 — tags 배열에 '편집자픽' 포함 여부로 판단 (관리자 페이지에서 실시간 토글)
function isEditorPick(item: AiNews): boolean {
  return item.tags?.includes("편집자픽") ?? false;
}

type AiNews = {
  id: number;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  explanation: string | null;
  importance: string | null;
  collected_at: string;
  is_visible: boolean;
  tags: string[];
  terms: string[] | null;
};

type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
};

function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[다됩니임했않]\.)\s+/);
  return parts.map(s => s.trim()).filter(Boolean);
}

const SOURCE_COLORS: Record<string, string> = {
  "The Verge AI":   "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "VentureBeat AI": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Ars Technica":   "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "TechCrunch AI":  "bg-green-500/10 text-green-400 border-green-500/20",
  "Wired AI":       "bg-red-500/10 text-red-400 border-red-500/20",
  "Hacker News":    "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function SourceBadge({ source }: { source: string }) {
  const cls = SOURCE_COLORS[source] ?? "bg-secondary/50 text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {source}
    </span>
  );
}

function EditorPickBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-500 border border-amber-500/30 shrink-0">
      <Star className="h-3 w-3 fill-amber-500" />
      편집자 픽
    </span>
  );
}

function getDateGroup(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

  if (date >= todayStart) return "오늘";
  if (date >= yesterdayStart) return "어제";
  if (date >= weekStart) return "이번 주";
  return "이전";
}

const DATE_GROUP_ORDER = ["오늘", "어제", "이번 주", "이전"];

function parseSummaryLines(text: string): string[] {
  if (text.includes("•")) {
    return text.split("\n").map(l => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean).slice(0, 3);
  }
  if (/^\d+\./.test(text.trim())) {
    return text.split("\n").map(l => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean).slice(0, 3);
  }
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3);
}

/** YYYY-MM-DD 문자열로 변환 */
function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** YYYY.M.D 형식으로 표시 */
function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 오늘 날짜 키 */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function NewsList() {
  const [news, setNews] = useState<AiNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null); // YYYY-MM-DD
  const [glossary, setGlossary] = useState<Record<string, GlossaryTerm>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const dateScrollRef = useRef<HTMLDivElement>(null);

  function copyArticleLink(id: number) {
    const url = `${window.location.origin}/news#article-${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function shareOnX(id: number, title: string) {
    const url = `${window.location.origin}/news#article-${id}`;
    const text = encodeURIComponent(`${title}\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#article-")) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-primary/40");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary/40"), 2500);
    }, 400);
  }, []);

  async function fetchNews() {
    setLoading(true);
    setError(false);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await supabase
        .from("ai_news")
        .select("id,title,url,source,summary,explanation,importance,collected_at,is_visible,tags,terms")
        .eq("is_visible", true)
        .order("collected_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNews(data || []);

      const allSlugs = [...new Set((data || []).flatMap(n => n.terms || []))];
      if (allSlugs.length > 0) {
        const { data: terms } = await supabase
          .from("glossary")
          .select("slug,term,definition")
          .in("slug", allSlugs);
        if (terms) {
          setGlossary(Object.fromEntries(terms.map(t => [t.slug, t])));
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNews(); }, []);

  // 고유 날짜 목록 (최신순)
  const dateList = useMemo(() => {
    const keys = new Set(news.map(n => toDateKey(n.collected_at)));
    return Array.from(keys).sort().reverse();
  }, [news]);

  // 날짜 스크롤: 오늘로 이동
  function scrollToToday() {
    setActiveDate(null);
  }

  // 날짜 스크롤: 좌우
  function scrollDates(dir: "left" | "right") {
    if (!dateScrollRef.current) return;
    const amount = 180;
    dateScrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  const allSources = useMemo(() => {
    const sources = new Set(news.map(item => item.source).filter(Boolean));
    return Array.from(sources).sort();
  }, [news]);

  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    news.forEach(item => {
      (item.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [news]);

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      if (activeTag && !item.tags?.includes(activeTag)) return false;
      if (activeDate && toDateKey(item.collected_at) !== activeDate) return false;
      return true;
    });
  }, [news, activeTag, activeDate]);

  const groupedNews = useMemo(() => {
    const groups: Record<string, AiNews[]> = {};
    filteredNews.forEach(item => {
      const group = getDateGroup(item.collected_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  }, [filteredNews]);

  const sortedGroupedNews = useMemo(() => {
    const result: Record<string, AiNews[]> = {};
    for (const [group, items] of Object.entries(groupedNews)) {
      result[group] = [...items].sort((a, b) => {
        const aPick = isEditorPick(a) ? 0 : 1;
        const bPick = isEditorPick(b) ? 0 : 1;
        return aPick - bPick;
      });
    }
    return result;
  }, [groupedNews]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-24 rounded-full bg-muted" />
              <div className="h-4 w-16 rounded bg-muted ml-auto" />
            </div>
            <div className="h-5 w-3/4 rounded bg-muted mb-3" />
            <div className="h-16 rounded-lg bg-muted/60 mb-3" />
            <div className="h-4 w-full rounded bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-semibold text-foreground">뉴스를 불러오지 못했습니다</p>
        <button
          onClick={fetchNews}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          다시 시도
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-semibold text-foreground">아직 수집된 뉴스가 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── 날짜 선택 바 ── */}
      {dateList.length > 0 && (
        <div className="flex items-center gap-1 mb-6">
          <button
            onClick={() => scrollDates("left")}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full hover:bg-accent transition-colors text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={dateScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dateList.map(dateKey => {
              const isActive = activeDate === dateKey;
              const isToday = dateKey === todayKey();
              const label = isToday ? "오늘" : formatDateShort(dateKey);
              return (
                <button
                  key={dateKey}
                  onClick={() => setActiveDate(isActive ? null : dateKey)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollToToday()}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full hover:bg-accent transition-colors text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── 날짜 그룹별 뉴스 ── */}
      <div className="space-y-8">
        {DATE_GROUP_ORDER.filter(g => sortedGroupedNews[g]?.length > 0).map(group => (
          <section key={group}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-border/60" />
              {group}
              {activeDate && <span className="text-xs text-primary">({formatDateShort(activeDate)})</span>}
              <span className="h-px flex-1 bg-border/60" />
            </h2>
            <div className="space-y-4">
              {sortedGroupedNews[group].map(item => (
                <article
                  key={item.id}
                  id={`article-${item.id}`}
                  className={`rounded-xl border ${
                    isEditorPick(item)
                      ? "border-amber-500/30 bg-amber-500/[0.02]"
                      : "border-border/50 bg-card"
                  } p-5 transition-all hover:border-border hover:shadow-sm scroll-mt-6`}
                >
                  {/* ── 상단: 편집자픽 + 날짜 ── */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {isEditorPick(item) && <EditorPickBadge />}
                    </div>
                    <span className="inline-flex items-center rounded-md bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(item.collected_at).toLocaleDateString("ko-KR", {
                        year: "numeric", month: "2-digit", day: "2-digit"
                      })}
                    </span>
                  </div>

                  {/* 제목 */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block mb-4"
                  >
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base leading-snug line-clamp-2 flex items-start gap-1.5">
                      {item.title}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </h3>
                  </a>

                  {item.summary && (
                    <div className="mb-3 rounded-xl bg-muted/50 border border-border/40 px-4 py-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">📋 기사 3줄 요약</p>
                      <ol className="space-y-1.5">
                        {parseSummaryLines(item.summary).map((line, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                            <span className="shrink-0 mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-muted-foreground/20 text-[10px] font-bold text-muted-foreground">
                              {i + 1}
                            </span>
                            {line}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {item.explanation && (
                    <div className="mb-3 rounded-xl bg-blue-500/5 border border-blue-500/20 px-4 py-3">
                      <p className="text-xs font-semibold text-blue-400 mb-2">💡 초등학생도 이해하는 ktoolu 설명</p>
                      <div className="space-y-1.5">
                        {splitSentences(item.explanation).map((s, i) => (
                          <p key={i} className="text-sm text-foreground/75 leading-relaxed">{s}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.importance && (
                    <div className="mb-3 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3">
                      <p className="text-xs font-semibold text-amber-400 mb-2">⚡ 인사이트 & 시사점</p>
                      <div className="space-y-1.5">
                        {splitSentences(item.importance).map((s, i) => (
                          <p key={i} className="text-sm text-foreground/75 leading-relaxed">{s}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.terms && item.terms.length > 0 && (
                    <div className="mb-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-400 mb-2">📖 용어해설</p>
                      <div className="space-y-2">
                        {item.terms.map(slug => {
                          const g = glossary[slug];
                          if (!g) return null;
                          return (
                            <div key={slug}>
                              <a
                                href={`/glossary/${slug}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-0.5"
                              >
                                {g.term}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                              <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">{g.definition}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── 하단: 출처 + 퍼가기 ── */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/20 mt-1">
                    <SourceBadge source={item.source} />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyArticleLink(item.id)}
                        title="링크 복사"
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        {copiedId === item.id
                          ? <><Check className="h-3 w-3 text-green-500" /><span className="text-green-500">복사됨</span></>
                          : <><Link2 className="h-3 w-3" /> 링크</>
                        }
                      </button>
                      <button
                        onClick={() => shareOnX(item.id, item.title)}
                        title="X로 퍼가기"
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <span className="font-bold text-[11px]">𝕏</span> 퍼가기
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {filteredNews.length === 0 && (activeTag || activeDate) && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-muted-foreground text-sm">
              {activeTag && <><span className="font-medium text-foreground">#{activeTag}</span> 태그의 </>}
              {activeDate && <><span className="font-medium text-foreground">{formatDateShort(activeDate)}</span> 날짜의 </>}
              기사가 없습니다
            </p>
            <button
              onClick={() => { setActiveTag(null); setActiveDate(null); }}
              className="text-xs text-primary hover:underline"
            >
              전체 보기
            </button>
          </div>
        )}

        {/* ── 하단 태그 필터 ── */}
        {allTags.length > 0 && (
          <div className="pt-6 border-t border-border/30">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium shrink-0">태그</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    activeTag === tag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  해제
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
