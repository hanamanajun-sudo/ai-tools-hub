import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { ShareButtons } from "@/components/share-buttons";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPost } from "@/lib/notion";
import { breadcrumbJsonLd, safeJsonLd } from "@/lib/breadcrumb";
import { CATEGORY_COLORS, CATEGORY_GRADIENTS, DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_GRADIENT } from "@/lib/post-categories";

type Props = { params: Promise<{ slug: string }> };

const BASE_URL = "https://ktoolu.com";

// force-dynamic: 빌드 시 정적 생성 안 함 → Worker에서 렌더링 → R2 접근 가능 → 이미지 영구 캐싱
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPost(slug);
  if (!result) return {};
  const { post } = result;
  return {
    title: `${post.title} - ktoolu 블로그`,
    description: post.description,
    alternates: { canonical: `${BASE_URL}/posts/${slug}` },
    robots: post.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      siteName: "ktoolu",
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
  };
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  return Math.max(1, Math.ceil(text.length / 500));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPost(slug);
  if (!result) notFound();

  const { post, html } = result;
  const readingTime = estimateReadingTime(html);
  const badge = CATEGORY_COLORS[post.category] ?? DEFAULT_CATEGORY_COLOR;
  const gradient = CATEGORY_GRADIENTS[post.category] ?? DEFAULT_CATEGORY_GRADIENT;

  const postUrl = `${BASE_URL}/posts/${slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: postUrl,
    mainEntityOfPage: postUrl,
    author: { "@type": "Organization", name: "ktoolu" },
    publisher: { "@type": "Organization", name: "ktoolu" },
    ...(post.publishedAt ? { datePublished: post.publishedAt, dateModified: post.publishedAt } : {}),
    ...(post.cover ? { image: post.cover } : {}),
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "홈", url: BASE_URL },
    { name: "블로그", url: `${BASE_URL}/posts` },
    { name: post.title, url: postUrl },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      {/* Category gradient top bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${gradient}`} />

      <SiteHeader activePage="blog" />

      <main id="main-content" className="mx-auto max-w-3xl px-5">
        {/* Hero */}
        <section className="pt-12 pb-10">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-7">
            {post.category && (
              <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide ${badge}`}>
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
        <div className={`mb-10 h-px bg-gradient-to-r ${gradient} opacity-50 rounded-full`} />

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

        <ShareButtons title={post.title} path={`/posts/${slug}`} />

        {/* Back link */}
        <div className="mt-10 mb-16">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            모든 글 보기
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
