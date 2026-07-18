import Link from "next/link";
import { Sparkles, BookOpen, ArrowRight, Calendar, Newspaper } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ToolsSection } from "@/components/tools-section";
import { getBlogPosts } from "@/lib/notion";
import { aiTools } from "@/lib/ai-tools-data";
import { newsSlug } from "@/lib/news-slug";

export const revalidate = 3600; // 1시간마다 재생성

const CATEGORY_COLORS: Record<string, string> = {
  "AI 도구 리뷰": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "AI 트렌드 뉴스": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "카테고리별 추천": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "AI 활용 팁": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

async function getLatestNews() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("ai_news")
      .select("id,title,url,source,summary,collected_at,tags")
      .eq("is_visible", true)
      .order("collected_at", { ascending: false })
      .limit(3);
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [allPosts, latestNews] = await Promise.all([
    getBlogPosts(),
    getLatestNews(),
  ]);
  const latestPosts = allPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader blogCount={allPosts.length} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-16">
        {/* Hero */}
        <section className="py-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3" />
            최신 AI 도구 {aiTools.length}개 수록
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-4">
            최고의 AI 도구를
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              한곳에서 탐색하세요
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            텍스트, 이미지, 비디오, 코딩, 음악까지 — 업무와 창작을 혁신할
            AI 도구들을 카테고리별로 정리했습니다.
          </p>
        </section>

        {/* Tools */}
        <ToolsSection />

        {/* Blog + News Preview */}
        <section className="mt-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Blog */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">최신 블로그</h2>
                </div>
                <Link
                  href="/blog"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  전체 보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {latestPosts.length > 0 ? latestPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {post.category && (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium mb-2 ${CATEGORY_COLORS[post.category] ?? "bg-secondary/50 text-muted-foreground border-border"}`}>
                        {post.category}
                      </span>
                    )}
                    <h3 className="font-bold text-foreground hover:text-primary transition-colors mb-1 line-clamp-2 text-sm">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.description}</p>
                    )}
                    {post.publishedAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString("ko-KR")}
                      </div>
                    )}
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground py-4">블로그 글이 없습니다.</p>
                )}
              </div>
            </div>

            {/* News */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-blue-400" />
                  <h2 className="text-xl font-bold text-foreground">AI 뉴스</h2>
                </div>
                <Link
                  href="/news"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  전체 보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {latestNews.length > 0 ? latestNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${newsSlug(item)}`}
                    className="block rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {item.source && (
                        <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                          {item.source}
                        </span>
                      )}
                      {item.tags && item.tags.length > 0 && item.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-foreground hover:text-blue-400 transition-colors mb-1 line-clamp-2 text-sm">
                      {item.title}
                    </h3>
                    {item.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                    )}
                    {item.collected_at && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.collected_at).toLocaleDateString("ko-KR")}
                      </div>
                    )}
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground py-4">AI 뉴스가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
