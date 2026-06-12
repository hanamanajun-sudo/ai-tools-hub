import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { BlogShareButtons } from "./share-buttons";
import { SiteHeader } from "@/components/site-header";
import { getBlogPost, getBlogPosts } from "@/lib/notion";

type Props = { params: Promise<{ slug: string }> };

// force-dynamic: 빌드 시 정적 생성 안 함 → Worker에서 렌더링 → R2 접근 가능 → 이미지 영구 캐싱
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (!result) return {};
  const { post } = result;
  return {
    title: `${post.title} - ai.ktoolu 블로그`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      siteName: "ai.ktoolu",
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
  };
}

const CATEGORY_CONFIG: Record<string, { badge: string; gradient: string }> = {
  "AI 도구 리뷰": {
    badge: "bg-violet-500/10 text-violet-600 border-violet-500/25 dark:text-violet-400 dark:border-violet-500/30",
    gradient: "from-violet-500 via-purple-500 to-violet-600",
  },
  "AI 트렌드 뉴스": {
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/25 dark:text-blue-400 dark:border-blue-500/30",
    gradient: "from-blue-500 via-indigo-500 to-blue-600",
  },
  "카테고리별 추천": {
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400 dark:border-emerald-500/30",
    gradient: "from-emerald-500 via-teal-400 to-emerald-600",
  },
  "AI 활용 팁": {
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400 dark:border-amber-500/30",
    gradient: "from-amber-500 via-orange-400 to-amber-500",
  },
};

const DEFAULT_CONFIG = {
  badge: "bg-secondary/50 text-muted-foreground border-border",
  gradient: "from-slate-400 via-slate-500 to-slate-400",
};

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  return Math.max(1, Math.ceil(text.length / 500));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (!result) notFound();

  const { post, html } = result;
  const readingTime = estimateReadingTime(html);
  const cat = CATEGORY_CONFIG[post.category] ?? DEFAULT_CONFIG;

  return (
    <div className="min-h-screen bg-background">
      {/* Category gradient top bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${cat.gradient}`} />

      <SiteHeader activePage="blog" />

      <main className="mx-auto max-w-3xl px-5">
        {/* Hero */}
        <section className="pt-12 pb-10">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-7">
            {post.category && (
              <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide ${cat.badge}`}>
                {post.category}
              </span>
            )}
            {post.publishedAt && (
              <>
                <span className="text-border/60 text-sm select-none">·</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.publishedAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
            <span className="text-border/60 text-sm select-none">·</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {readingTime}분 읽기
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-[1.875rem] sm:text-[2.375rem] font-extrabold text-foreground leading-[1.2] tracking-tight mb-5"
            style={{ wordBreak: "keep-all" }}
          >
            {post.title}
          </h1>

          {/* Description */}
          {post.description && (
            <p
              className="text-[1.0625rem] leading-[1.8] text-muted-foreground"
              style={{ wordBreak: "keep-all" }}
            >
              {post.description}
            </p>
          )}
        </section>

        {/* Cover image */}
        {post.cover && (
          <div className="mb-10 overflow-hidden rounded-2xl border border-border/40 shadow-sm">
            <img
              src={post.cover}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        )}

        {/* Accent divider */}
        <div className={`mb-10 h-px bg-gradient-to-r ${cat.gradient} opacity-50 rounded-full`} />

        {/* Article body */}
        <article className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-wrap items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/70 transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <BlogShareButtons title={post.title} slug={slug} />

        {/* Back link */}
        <div className="mt-10 mb-16">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            모든 글 보기
          </Link>
        </div>
      </main>

      <footer className="border-t border-border/40 bg-muted/5">
        <div className="mx-auto max-w-3xl px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            ai.ktoolu — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}
