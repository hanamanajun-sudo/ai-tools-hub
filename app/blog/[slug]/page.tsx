import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowLeft, Calendar, Tag } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getBlogPost, getBlogPosts } from "@/lib/notion";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = false;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

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

const CATEGORY_COLORS: Record<string, string> = {
  "AI 도구 리뷰": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "AI 트렌드 뉴스": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "카테고리별 추천": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "AI 활용 팁": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (!result) notFound();

  const { post, html } = result;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            블로그
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {post.cover && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <img src={post.cover} alt={post.title} className="w-full h-56 object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {post.category && (
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[post.category] ?? "bg-secondary/50 text-muted-foreground border-border"}`}>
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

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-lg text-muted-foreground mb-8">{post.description}</p>
        )}

        <hr className="border-border/50 mb-8" />

        <div
          className="prose prose-invert prose-sm max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-code:text-primary prose-code:bg-muted/50 prose-code:rounded prose-code:px-1
            prose-pre:bg-muted/30 prose-pre:border prose-pre:border-border/50
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
            prose-ul:text-muted-foreground prose-ol:text-muted-foreground
            prose-li:marker:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-10 pt-6 border-t border-border/50">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {post.tags.map((tag) => (
              <span key={tag} className="text-sm text-muted-foreground">#{tag}</span>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 bg-muted/10 mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            ai.ktoolu — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}
