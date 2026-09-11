import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, Tag, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPosts } from "@/lib/notion";
import { ALL_CATEGORIES, CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/post-categories";

export const metadata: Metadata = {
  title: "블로그 - ktoolu",
  description: "AI 도구를 소개하고, 그 도구로 직접 만들어 본 기록을 씁니다.",
  alternates: { canonical: "https://ktoolu.com/posts" },
};

export const revalidate = 3600;

type Props = { searchParams: Promise<{ category?: string }> };

export default async function PostsPage({ searchParams }: Props) {
  const { category: selectedCategory } = await searchParams;
  const allPosts = await getPosts();
  const posts = selectedCategory
    ? allPosts.filter((p) => p.category === selectedCategory)
    : allPosts;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader activePage="blog" blogCount={allPosts.length} />

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            {selectedCategory ?? "블로그"}
          </h1>
          <p className="text-muted-foreground">
            {selectedCategory
              ? `${posts.length}개의 글이 있어요`
              : "AI 도구를 소개하고, 그 도구로 직접 만들어 본 기록을 씁니다."}
          </p>
        </div>

        {/* 카테고리 필터 탭 */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <Link
            href="/posts"
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            전체
          </Link>
          {ALL_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/posts?category=${encodeURIComponent(cat)}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {selectedCategory && (
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{selectedCategory}</span> 카테고리의 글 {posts.length}개
            </span>
            <Link
              href="/posts"
              className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-xs font-medium hover:bg-secondary transition-colors"
            >
              <X className="h-3 w-3" />
              필터 해제
            </Link>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <p className="text-muted-foreground">아직 게시된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
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
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? DEFAULT_CATEGORY_COLOR}`}>
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

      <SiteFooter />
    </div>
  );
}
