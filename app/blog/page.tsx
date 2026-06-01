import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getBlogPosts } from "@/lib/notion";

export const metadata: Metadata = {
  title: "블로그 - ai.ktoolu",
  description: "AI 도구 리뷰, 트렌드 뉴스, 활용 팁을 공유합니다.",
};

export const revalidate = 3600;

const CATEGORY_COLORS: Record<string, string> = {
  "AI 도구 리뷰": "bg-violet-500/10 text-violet-600 border-violet-500/25 dark:text-violet-400",
  "AI 트렌드 뉴스": "bg-blue-500/10 text-blue-600 border-blue-500/25 dark:text-blue-400",
  "카테고리별 추천": "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400",
  "AI 활용 팁": "bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            ai.ktoolu
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">블로그</h1>
          <p className="text-muted-foreground">AI 도구 리뷰, 트렌드 뉴스, 활용 팁</p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <p className="text-muted-foreground">아직 게시된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-border hover:-translate-y-0.5 hover:shadow-sm"
              >
                {/* Thumbnail */}
                {post.cover && (
                  <div className="hidden sm:block w-44 shrink-0 overflow-hidden bg-muted">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      {post.category && (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? "bg-secondary/50 text-muted-foreground border-border"}`}>
                          {post.category}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString("ko-KR")}
                        </span>
                      )}
                    </div>

                    <h2
                      className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1.5 leading-snug"
                      style={{ wordBreak: "keep-all" }}
                    >
                      {post.title}
                    </h2>

                    {post.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                        {post.description}
                      </p>
                    )}
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 bg-muted/10 mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            ai.ktoolu — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}
