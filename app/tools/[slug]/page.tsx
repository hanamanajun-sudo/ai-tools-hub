import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiTools, categories, type ExpertRating } from "@/lib/ai-tools-data";
import { categoryColors } from "@/lib/tool-styles";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReviewsSection } from "@/components/reviews-section";
import { RelatedNews } from "@/components/related-news";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  Lightbulb,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Users,
  BarChart3,
} from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

const RATING_LABELS: Record<keyof ExpertRating, string> = {
  accuracy: "정확성",
  easeOfUse: "사용 편의성",
  features: "기능",
  performance: "성능",
  value: "가격 대비 가치",
  innovation: "혁신성",
};

export function generateStaticParams() {
  return aiTools.map((tool) => ({ slug: tool.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = aiTools.find((t) => t.id === slug);
  if (!tool) return {};

  const categoryLabel = categories.find((c) => c.value === tool.category);

  return {
    title: `${tool.name} - ai.ktoolu`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} - ai.ktoolu`,
      description: tool.description,
      type: "website",
      siteName: "ai.ktoolu",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} - ai.ktoolu`,
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

  // --- Expert Rating ---
  const ratingKeys = tool.expertRating ? (Object.keys(tool.expertRating) as (keyof ExpertRating)[]) : [];
  const avgRating = tool.expertRating
    ? ratingKeys.reduce((sum, k) => sum + tool.expertRating![k], 0) / ratingKeys.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
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

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* ── Tool Header ── */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass}`}>
              {categoryLabel?.emoji} {categoryLabel?.label}
            </span>
            {tool.free ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">무료</span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-xs font-medium text-orange-400">유료</span>
            )}
            {tool.popular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-black">
                <Star className="h-3 w-3 fill-current" />인기
              </span>
            )}
            {tool.expertRating && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-400">
                <BarChart3 className="h-3 w-3" />전문가 평점 {avgRating.toFixed(1)}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">{tool.name}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">{tool.longDescription ?? tool.description}</p>
        </div>

        {/* ── Screenshot Gallery ── */}
        {tool.screenshots && tool.screenshots.length > 0 && (
          <ScreenshotGallery screenshots={tool.screenshots} toolName={tool.name} />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-8">
          {/* ── Left: Main Content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expert Rating */}
            {tool.expertRating && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-blue-400" /> 전문가 평가
                </h2>
                <div className="space-y-3">
                  {ratingKeys.map((key) => {
                    const val = tool.expertRating![key];
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{RATING_LABELS[key]}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${s <= Math.round(val) ? "fill-amber-400 text-amber-400" : "text-border"}`}
                              />
                            ))}
                            <span className="text-xs font-medium text-foreground ml-1">{val.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                            style={{ width: `${(val / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 text-center">
                    <span className="text-lg font-bold text-foreground">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground"> / 5 — 종합 평가</span>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            {tool.features && tool.features.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-3">주요 기능</h2>
                <ul className="space-y-2">
                  {tool.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pros & Cons */}
            {(tool.pros || tool.cons) && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">장단점</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {tool.pros && (
                    <div>
                      <p className="text-xs font-medium text-emerald-500 mb-2">장점</p>
                      <ul className="space-y-1.5">
                        {tool.pros.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tool.cons && (
                    <div>
                      <p className="text-xs font-medium text-red-400 mb-2">단점</p>
                      <ul className="space-y-1.5">
                        {tool.cons.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-400" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Use Cases */}
            {tool.useCases && tool.useCases.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-3">활용 사례</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.useCases.map((u) => (
                    <span key={u} className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground">
                      <Lightbulb className="h-3 w-3 shrink-0" />
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">태그</h2>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm bg-secondary/50 text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ratings & Comments */}
            <ReviewsSection toolSlug={tool.id} />

            {/* Related News */}
            <RelatedNews toolName={tool.name} toolSlug={tool.id} toolTags={tool.tags} />
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-4">
            {/* CTA */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">사이트 바로가기</h2>
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button className="w-full gap-2 group">
                  <span>{tool.name} 방문하기</span>
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </a>
              <p className="mt-3 text-xs text-muted-foreground text-center">{tool.url.replace(/^https?:\/\//, "")}</p>
            </div>

            {/* Who Is This For */}
            {tool.whoIsFor && tool.whoIsFor.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-400" /> 이런 분께 추천
                </h2>
                <ul className="space-y-2">
                  {tool.whoIsFor.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-400" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing */}
            {tool.pricing && (
              <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" /> 가격
                </h2>
                <div className="space-y-2 text-sm">
                  {tool.pricing.free && (
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                      <p className="text-xs font-medium text-emerald-500 mb-1">무료</p>
                      <p className="text-muted-foreground">{tool.pricing.free}</p>
                    </div>
                  )}
                  {tool.pricing.paid && (
                    <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-3">
                      <p className="text-xs font-medium text-orange-400 mb-1">유료</p>
                      <p className="text-muted-foreground">{tool.pricing.paid}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">카테고리</span>
                  <span className="font-medium text-foreground">{categoryLabel?.emoji} {categoryLabel?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">요금제</span>
                  <span className={`font-medium ${tool.free ? "text-emerald-400" : "text-orange-400"}`}>
                    {tool.free ? "무료 플랜 있음" : "유료"}
                  </span>
                </div>
                {tool.expertRating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">전문가 평점</span>
                    <span className="font-medium text-foreground">{avgRating.toFixed(1)} / 5</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Tools ── */}
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-foreground mb-4">{categoryLabel?.emoji} 같은 카테고리 도구</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((related) => (
                <Link
                  key={related.id}
                  href={`/tools/${related.id}`}
                  className="group rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:-translate-y-0.5"
                >
                  <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">{related.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{related.description}</div>
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
            ai.ktoolu — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Screenshot Gallery Component ── */
function ScreenshotGallery({ screenshots, toolName }: { screenshots: string[]; toolName: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden mb-8">
      <div className="flex gap-4 overflow-x-auto p-4 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {screenshots.map((src, i) => (
          <div key={i} className="shrink-0 w-[280px] sm:w-[360px] rounded-lg bg-muted/50 border border-border/30 overflow-hidden">
            <div className="aspect-[16/10] bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-4xl mb-2 opacity-30">🖥️</div>
                <p className="text-xs text-muted-foreground">{toolName} 스크린샷 {i + 1}</p>
              </div>
            </div>
            <div className="p-2 text-center">
              <span className="text-[10px] text-muted-foreground">{i + 1} / {screenshots.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
