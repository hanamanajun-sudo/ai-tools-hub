"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ExternalLink, Clock, Tag, AlertCircle, RefreshCw } from "lucide-react";

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

export function NewsList() {
  const [news, setNews] = useState<AiNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        .limit(30);

      if (error) throw error;
      setNews(data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNews(); }, []);

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
    <div className="space-y-4">
      {news.map((item) => (
        <article
          key={item.id}
          className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <SourceBadge source={item.source} />
            <TimeAgo dateStr={item.collected_at} />
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block mb-3"
          >
            <h2 className="font-bold text-foreground group-hover:text-primary transition-colors text-base leading-snug line-clamp-2 flex items-start gap-1.5">
              {item.title}
              <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity" />
            </h2>
          </a>

          {item.summary && (
            <div className="mb-3 rounded-lg bg-muted/40 px-4 py-3 border border-border/30">
              <p className="text-sm text-foreground/80 leading-relaxed">{item.summary}</p>
            </div>
          )}

          {item.explanation && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              💡 {item.explanation}
            </p>
          )}

          {item.importance && (
            <p className="text-xs text-primary/80 font-medium mb-3">
              ⚡ {item.importance}
            </p>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
