import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiTools, categories } from "@/lib/ai-tools-data";
import { categoryColors } from "@/lib/tool-styles";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReviewsSection } from "@/components/reviews-section";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Star,
} from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return aiTools.map((tool) => ({ slug: tool.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = aiTools.find((t) => t.id === slug);
  if (!tool) return {};

  const categoryLabel = categories.find((c) => c.value === tool.category);

  return {
    title: `${tool.name} - AI Tools Hub`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} - AI Tools Hub`,
      description: tool.description,
      type: "website",
      siteName: "AI Tools Hub",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} - AI Tools Hub`,
      description: tool.description,
    },
    keywords: [tool.name, ...tool.tags, categoryLabel?.label ?? "", "AI 도구", "AI tools"],
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = aiTools.find((t) => t.id === slug);
  if (!tool) notFound();

  const categoryLabel = categories.find((c) => c.value === tool.category);
  const colorClass = categoryColors[tool.category];

  const relatedTools = aiTools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            AI Tools Hub
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Tool Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass}`}>
              {categoryLabel?.emoji} {categoryLabel?.label}
            </span>
            {tool.free ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
                무료
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-xs font-medium text-orange-400">
                유료
              </span>
            )}
            {tool.popular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-black">
                <Star className="h-3 w-3 fill-current" />
                인기
              </span>
            )}
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">
            {tool.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {tool.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tags */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">태그</h2>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-secondary/50 text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ratings & Comments */}
            <ReviewsSection toolSlug={tool.id} />
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">사이트 바로가기</h2>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full gap-2 group">
                  <span>{tool.name} 방문하기</span>
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </a>
              <p className="mt-3 text-xs text-muted-foreground text-center">
                {tool.url.replace(/^https?:\/\//, "")}
              </p>
            </div>

            {/* Info */}
            <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">카테고리</span>
                  <span className="font-medium text-foreground">
                    {categoryLabel?.emoji} {categoryLabel?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">요금제</span>
                  <span className={`font-medium ${tool.free ? "text-emerald-400" : "text-orange-400"}`}>
                    {tool.free ? "무료 플랜 있음" : "유료"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {categoryLabel?.emoji} 같은 카테고리 도구
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((related) => (
                <Link
                  key={related.id}
                  href={`/tools/${related.id}`}
                  className="group rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:-translate-y-0.5"
                >
                  <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">
                    {related.name}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {related.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/10 mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            AI Tools Hub — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}
