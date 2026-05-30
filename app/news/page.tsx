import Link from "next/link";
import { Sparkles, BookOpen, Newspaper, ExternalLink, Clock, Tag, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getLatestNews, getNewsCount } from "@/lib/news";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 뉴스 — ai.ktoolu",
  description: "매일 자동 수집·요약되는 최신 AI 뉴스. OpenAI, Anthropic, Google DeepMind 등 주요 AI 트렌드를 한국어로 쉽게 읽어보세요.",
};

export const revalidate = 300; // 5분마다 갱신

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

export default async function NewsPage() {
  const [news, totalCount] = await Promise.all([
    getLatestNews(30),
    getNewsCount(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">ai.ktoolu</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/blog"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              블로그
            </Link>
            <Link
              href="/news"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground bg-accent"
            >
              <Newspaper className="h-4 w-4" />
              AI 뉴스
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16">
        {/* Hero */}
        <section className="py-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-3">
            가장 빠른 AI 뉴스 모음
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            해외 주요 AI 뉴스를 수집해 한국어로 요약 전달합니다.
            {totalCount > 0 && <span className="ml-1 text-primary font-medium">총 {totalCount}개 뉴스 수록</span>}
          </p>
        </section>

        {/* News List */}
        {news.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">아직 수집된 뉴스가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
              >
                {/* 상단: 출처 + 시간 */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <SourceBadge source={item.source} />
                  <TimeAgo dateStr={item.collected_at} />
                </div>

                {/* 제목 + 원문 링크 */}
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

                {/* AI 요약 */}
                {item.summary && (
                  <div className="mb-3 rounded-lg bg-muted/40 px-4 py-3 border border-border/30">
                    <p className="text-sm text-foreground/80 leading-relaxed">{item.summary}</p>
                  </div>
                )}

                {/* 쉬운 설명 */}
                {item.explanation && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    💡 {item.explanation}
                  </p>
                )}

                {/* 중요성 */}
                {item.importance && (
                  <p className="text-xs text-primary/80 font-medium mb-3">
                    ⚡ {item.importance}
                  </p>
                )}

                {/* 태그 */}
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
        )}
      </main>

      <footer className="border-t border-border/40 bg-muted/10 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            ai.ktoolu — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}
