"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { ExternalLink, Clock, Tag, AlertCircle, RefreshCw, X, Link2, Check } from "lucide-react";

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
};

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

function TimeAgo({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor(diffMs / 60000);

  let label: string;
  if (diffM < 60) label = `${diffM}분 전`;
  else if (diffH < 24) label = `${diffH}시간 전`;
  else label = `${Math.floor(diffH / 24)}일 전`;

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {label}
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
  // 불릿 형식: • line1\n• line2
  if (text.includes("•")) {
    return text.split("\n").map(l => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean).slice(0, 3);
  }
  // 숫자 형식: 1. line1\n2. line2
  if (/^\d+\./.test(text.trim())) {
    return text.split("\n").map(l => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean).slice(0, 3);
  }
  // 문장 단위 분리
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3);
}

export function NewsList() {
  const [news, setNews] = useState<AiNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  function copyArticleLink(id: number) {
    const url = `${window.location.origin}/news#article-${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
        .select("id,title,url,source,summary,explanation,importance,collected_at,is_visible,tags")
        .eq("is_visible", true)
        .order("collected_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNews(data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNews(); }, []);

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
      if (activeSource && item.source !== activeSource) return false;
      if (activeTag && !item.tags?.includes(activeTag)) return false;
      return true;
    });
  }, [news, activeTag, activeSource]);

  const groupedNews = useMemo(() => {
    const groups: Record<string, AiNews[]> = {};
    filteredNews.forEach(item => {
      const group = getDateGroup(item.collected_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  }, [filteredNews]);

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
      {/* 필터 */}
      <div className="space-y-2 mb-6">
        {/* 소스 필터 */}
        {allSources.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground w-8 shrink-0">출처</span>
            {allSources.map(source => (
              <button
                key={source}
                onClick={() => setActiveSource(activeSource === source ? null : source)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  activeSource === source
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        )}

        {/* 태그 필터 */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground w-8 shrink-0">태그</span>
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
          </div>
        )}

        {/* 필터 해제 */}
        {(activeTag || activeSource) && (
          <button
            onClick={() => { setActiveTag(null); setActiveSource(null); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            필터 해제
          </button>
        )}
      </div>

      {/* 날짜 그룹별 뉴스 */}
      <div className="space-y-8">
        {DATE_GROUP_ORDER.filter(g => groupedNews[g]?.length > 0).map(group => (
          <section key={group}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-border/60" />
              {group}
              <span className="h-px flex-1 bg-border/60" />
            </h2>
            <div className="space-y-4">
              {groupedNews[group].map(item => (
                <article
                  key={item.id}
                  id={`article-${item.id}`}
                  className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-sm scroll-mt-6"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <SourceBadge source={item.source} />
                    <div className="flex items-center gap-2">
                      <TimeAgo dateStr={item.collected_at} />
                      <button
                        onClick={() => copyArticleLink(item.id)}
                        title="요약 링크 복사"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === item.id
                          ? <><Check className="h-3 w-3 text-green-500" /><span className="text-green-500">복사됨</span></>
                          : <Link2 className="h-3 w-3" />
                        }
                      </button>
                    </div>
                  </div>

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
                      <p className="text-xs font-semibold text-blue-400 mb-1.5">💡 ktoolu 설명</p>
                      <p className="text-sm text-foreground/75 leading-relaxed">{item.explanation}</p>
                    </div>
                  )}

                  {item.importance && (
                    <div className="mb-3 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3">
                      <p className="text-xs font-semibold text-amber-400 mb-1.5">⚡ 인사이트 & 시사점</p>
                      <p className="text-sm text-foreground/75 leading-relaxed">{item.importance}</p>
                    </div>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(tag)}
                          className="rounded-md bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}

        {filteredNews.length === 0 && activeTag && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-muted-foreground text-sm">
              <span className="font-medium text-foreground">#{activeTag}</span> 태그의 기사가 없습니다
            </p>
            <button
              onClick={() => setActiveTag(null)}
              className="text-xs text-primary hover:underline"
            >
              전체 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
