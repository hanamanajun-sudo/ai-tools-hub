import Link from "next/link";
import { Sparkles, BookOpen, ArrowRight, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ToolsSection } from "@/components/tools-section";
import { getBlogPosts } from "@/lib/notion";
import { aiTools } from "@/lib/ai-tools-data";

export const revalidate = false;

const CATEGORY_COLORS: Record<string, string> = {
  "AI 도구 리뷰": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "AI 트렌드 뉴스": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "카테고리별 추천": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "AI 활용 팁": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default async function HomePage() {
  const allPosts = await getBlogPosts();
  const latestPosts = allPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader blogCount={allPosts.length} />

      <main className="mx-auto max-w-7xl px-4 pb-16">
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

        {/* Blog Preview */}
        {latestPosts.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">최신 블로그</h2>
              </div>
              <Link
                href="/blog"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                전체 보기
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:-translate-y-0.5 hover:shadow-md"
                >
                  {post.category && (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium mb-3 ${CATEGORY_COLORS[post.category] ?? "bg-secondary/50 text-muted-foreground border-border"}`}>
                      {post.category}
                    </span>
                  )}
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.description}
                    </p>
                  )}
                  {post.publishedAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("ko-KR")}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
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
