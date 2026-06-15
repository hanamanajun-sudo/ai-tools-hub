"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ExternalLink, Newspaper, Loader2 } from "lucide-react";

interface RelatedNewsProps {
  toolName: string;
  toolSlug: string;
  toolTags: string[];
}

interface NewsItem {
  id: number;
  title: string;
  url: string;
  source: string;
  collected_at: string;
}

export function RelatedNews({ toolName, toolSlug, toolTags }: RelatedNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 태그 기반 검색: 도구명이나 태그 중 하나라도 포함된 기사
        const keywords = [toolName.toLowerCase(), ...toolTags.map(t => t.toLowerCase())];
        
        const { data } = await supabase
          .from("ai_news")
          .select("id,title,url,source,collected_at")
          .eq("is_visible", true)
          .order("collected_at", { ascending: false })
          .limit(20);

        if (!data) { setLoading(false); return; }

        // 클라이언트 사이드에서 키워드 필터링
        const matched = data.filter(item => {
          const lowerTitle = item.title.toLowerCase();
          return keywords.some(k => lowerTitle.includes(k));
        }).slice(0, 5);

        setNews(matched);
      } catch {
        // 조용히 실패
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [toolName, toolSlug, toolTags]);

  if (loading) return null;
  if (news.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <Newspaper className="h-4 w-4 text-primary" /> {toolName} 관련 뉴스
      </h2>
      <div className="space-y-2">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 rounded-lg border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {item.source} · {new Date(item.collected_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
}
