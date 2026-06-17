import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiTools, categories, type ExpertRating, type PricingPlan } from "@/lib/ai-tools-data";
import { categoryColors } from "@/lib/tool-styles";
import { SiteHeader } from "@/components/site-header";
import { ReviewsSection } from "@/components/reviews-section";
import { RelatedNews } from "@/components/related-news";
import {
  ExternalLink, Sparkles, Star, CheckCircle2, XCircle,
  Lightbulb, CreditCard, Users, BarChart3, Newspaper, Check,
  ChevronRight, Medal, FileText, MessageSquare, GitCompare, ThumbsUp, ThumbsDown,
} from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

const RATING_LABELS: Record<keyof ExpertRating, string> = {
  accuracy: "정확성", easeOfUse: "사용 편의성", features: "기능",
  performance: "성능", value: "가격 대비 가치", innovation: "혁신성",
};

/* ── 한국어 검색어 매핑 (Google Trends 기반) ── */
const KO_TOOL_NAMES: Record<string, { h1: string; short: string }> = {
  chatgpt:      { h1: "챗GPT(ChatGPT)", short: "챗GPT" },
  claude:       { h1: "Claude(클로드)", short: "Claude" },
  gemini:       { h1: "제미나이(Gemini)", short: "제미나이" },
  grok:         { h1: "그록(Grok)", short: "그록" },
  midjourney:   { h1: "미드저니(Midjourney)", short: "미드저니" },
  dalle3:       { h1: "달리(DALL-E 3)", short: "달리" },
  sora:         { h1: "소라(Sora)", short: "소라" },
  capcut:       { h1: "캡컷(CapCut)", short: "캡컷" },
  "auto-gpt":   { h1: "오토GPT(AutoGPT)", short: "오토GPT" },
  "image-nanobana": { h1: "제미니(Image Nanobana)", short: "제미니" },
};

function getKoName(tool: { id: string; name: string }): { h1: string; short: string } {
  return KO_TOOL_NAMES[tool.id] ?? { h1: tool.name, short: tool.name };
}

function getName(tool: { id: string; name: string }): string {
  return KO_TOOL_NAMES[tool.id]?.short ?? tool.name;
}

export function generateStaticParams() {
  return aiTools.map((tool) => ({ slug: tool.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = aiTools.find((t) => t.id === slug);
  if (!tool) return {};
  const ko = getKoName(tool);
  const categoryLabel = categories.find((c) => c.value === tool.category);
  return {
    title: `${ko.h1} - ai.ktoolu`,
    description: tool.description,
    openGraph: { title: `${ko.h1} - ai.ktoolu`, description: tool.description, type: "website", siteName: "ai.ktoolu" },
    twitter: { card: "summary", title: `${ko.h1} - ai.ktoolu`, description: tool.description },
    keywords: [tool.name, ...tool.tags, categoryLabel?.label ?? "", "AI 도구", "AI tools"],
  };
}

const TAB_ITEMS = [
  { id: "overview", label: "개요", icon: "FileText" },
  { id: "reviews", label: "리뷰 & 평가", icon: "MessageSquare" },
  { id: "pricing", label: "가격 비교", icon: "CreditCard" },
  { id: "alternatives", label: "대안 도구", icon: "GitCompare" },
] as const;

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = aiTools.find((t) => t.id === slug);
  if (!tool) notFound();

  const categoryLabel = categories.find((c) => c.value === tool.category);
  const colorClass = categoryColors[tool.category];
  const relatedTools = aiTools.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 4);

  const ratingKeys = tool.expertRating ? (Object.keys(tool.expertRating) as (keyof ExpertRating)[]) : [];
  const avgRating = tool.expertRating
    ? ratingKeys.reduce((sum, k) => sum + tool.expertRating![k], 0) / ratingKeys.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* ── Hero ── */}
        <section id="overview" className="mb-6">
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
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">{getKoName(tool).h1}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">{tool.longDescription ?? tool.description}</p>
        </section>

        {/* ── Screenshots ── */}
        {tool.screenshots && tool.screenshots.length > 0 && <ScreenshotGallery screenshots={tool.screenshots} toolName={tool.name} />}

        {/* ── Tab Navigation ── */}
        <div className="sticky top-14 z-40 -mx-4 px-4 bg-background/95 backdrop-blur-sm border-b-2 border-border/40 mb-8">
          <nav className="flex gap-0 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {TAB_ITEMS.map((tab) => {
              const IconComponent = ({ className }: { className?: string }) => {
                switch (tab.icon) {
                  case "FileText": return <FileText className={className} />;
                  case "MessageSquare": return <MessageSquare className={className} />;
                  case "CreditCard": return <CreditCard className={className} />;
                  case "GitCompare": return <GitCompare className={className} />;
                  default: return null;
                }
              };
              return (
                <a
                  key={tab.id}
                  href={`#tab-${tab.id}`}
                  className="flex items-center gap-1.5 shrink-0 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 border-b-2 border-transparent hover:border-primary/60 transition-colors rounded-t-lg"
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Left (2/3) ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* ═══ TAB: 개요 ═══ */}
            <section id="tab-overview">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-primary" />
                {getKoName(tool).short} 개요
              </h2>

              {tool.features && tool.features.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-6 mb-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">주요 기능</h3>
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
                <div className="rounded-xl border border-border/50 bg-card p-6 mb-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">장단점</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {tool.pros && (
                      <div>
                        <p className="text-xs font-medium text-emerald-500 mb-2">장점</p>
                        <ul className="space-y-1.5">
                          {tool.pros.map((p) => (
                            <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />{p}
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
                              <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-400" />{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tool.useCases && tool.useCases.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-6 mb-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">활용 사례</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.useCases.map((u) => (
                      <span key={u} className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground">
                        <Lightbulb className="h-3 w-3 shrink-0" />{u}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm bg-secondary/50 text-muted-foreground">{tag}</Badge>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ TAB: 리뷰 & 평가 ═══ */}
            <section id="tab-reviews">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-amber-400" />
                {getKoName(tool).short} 리뷰 & 평가
              </h2>

              {tool.expertRating && (
                <div className="rounded-xl border border-border/50 bg-card p-6 mb-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-blue-400" />전문가 평가
                  </h3>
                  <div className="space-y-3">
                    {ratingKeys.map((key) => {
                      const val = tool.expertRating![key];
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">{RATING_LABELS[key]}</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`h-3 w-3 ${s <= Math.round(val) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                              ))}
                              <span className="text-xs font-medium text-foreground ml-1">{val.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${(val / 5) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 text-center border-t border-border/20">
                      <span className="text-lg font-bold text-foreground">{avgRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground"> / 5 종합 평가</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 커뮤니티 리뷰 요약 ── */}
              {tool.communityReviewSummary && (
                <div className="rounded-xl border border-border/50 bg-card p-6 mb-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-primary" />한국 커뮤니티 리뷰
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4 bg-muted/30 rounded-lg p-4 border border-border/30">
                    {tool.communityReviewSummary.overall}
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-500 mb-2 flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />장점
                      </p>
                      <ul className="space-y-2">
                        {tool.communityReviewSummary.pros.map((p) => (
                          <li key={p.keyword} className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3">
                            <p className="text-xs font-semibold text-emerald-400 mb-0.5">{p.keyword}</p>
                            <p className="text-xs text-muted-foreground">{p.content}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" />단점
                      </p>
                      <ul className="space-y-2">
                        {tool.communityReviewSummary.cons.map((c) => (
                          <li key={c.keyword} className="rounded-lg bg-red-500/5 border border-red-500/15 p-3">
                            <p className="text-xs font-semibold text-red-400 mb-0.5">{c.keyword}</p>
                            <p className="text-xs text-muted-foreground">{c.content}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <details className="group">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                      수집 출처 ({tool.communityReviewSummary.sources.length}개)
                    </summary>
                    <div className="mt-3 space-y-2">
                      {tool.communityReviewSummary.sources.map((src, i) => (
                        <div key={i} className="rounded-lg bg-muted/30 border border-border/30 p-3">
                          <p className="text-xs font-medium text-foreground">{src.name} — {src.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{src.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              <ReviewsSection toolSlug={tool.id} />
              <RelatedNews toolName={tool.name} toolSlug={tool.id} toolTags={tool.tags} />
            </section>

            {/* ═══ TAB: 가격 비교 ═══ */}
            <section id="tab-pricing">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-emerald-400" />
                {getKoName(tool).short} 요금제 비교
              </h2>

              {tool.pricingPlans && tool.pricingPlans.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {tool.pricingPlans.map((plan) => (
                    <PricingCard key={plan.name} plan={plan} />
                  ))}
                </div>
              )}

              {tool.comparisonNotes && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-4 mt-5">
                  <p className="text-xs font-semibold text-blue-400 mb-1.5 flex items-center gap-1.5">
                    <Medal className="h-3.5 w-3.5" />구독 추천
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{tool.comparisonNotes}</p>
                </div>
              )}

              {/* 기존 pricing fallback */}
              {!tool.pricingPlans && tool.pricing && (
                <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4" />가격 정보
                  </h3>
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

              {/* ChatGPT vs Claude vs Gemini 비교 */}
              {["chatgpt", "claude", "gemini"].includes(tool.id) && (
                <PlanetComparison currentToolSlug={tool.id} />
              )}
            </section>

            {/* ═══ TAB: 대안 도구 ═══ */}
            <section id="tab-alternatives">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-purple-400" />
                {getKoName(tool).short} 대안 도구
              </h2>
              {relatedTools.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {relatedTools.map((related) => (
                    <Link
                      key={related.id}
                      href={`/tools/${related.id}`}
                      className="group rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:-translate-y-0.5"
                    >
                      <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">{related.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-2">{related.description}</div>
                      <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        자세히 보기 <ChevronRight className="h-3 w-3" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/50 bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">같은 카테고리의 다른 도구가 없습니다</p>
                </div>
              )}
            </section>
          </div>

          {/* ── Right (1/3) Sidebar ── */}
          <div className="space-y-4">
            {/* Sticky CTA */}
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">사이트 바로가기</h2>
                <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button className="w-full gap-2 group">
                    <span>{getName(tool)} 방문하기</span>
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </a>
                <p className="mt-3 text-xs text-muted-foreground text-center">{tool.url.replace(/^https?:\/\//, "")}</p>
              </div>

              {tool.whoIsFor && tool.whoIsFor.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-6">
                  <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-400" />이런 분께 추천
                  </h2>
                  <ul className="space-y-2">
                    {tool.whoIsFor.map((w) => (
                      <li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-400" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick pricing summary in sidebar */}
              {tool.pricingPlans && tool.pricingPlans.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-6">
                  <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4" />요금 한눈에
                  </h2>
                  <div className="space-y-2">
                    {tool.pricingPlans.map((plan) => (
                      <div key={plan.name} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{plan.name}</span>
                        <span className={`font-medium ${plan.recommended ? "text-emerald-400" : "text-foreground"}`}>
                          {plan.price}
                          {plan.recommended && <span className="ml-1 text-[10px] text-emerald-500">✓</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  <a href="#tab-pricing" className="block text-center text-xs text-primary hover:underline mt-3">
                    상세 비교 보기 →
                  </a>
                </div>
              )}

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
        </div>
      </main>

      <footer className="border-t border-border/40 bg-muted/10 mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />ai.ktoolu — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Pricing Card ── */
function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div className={`rounded-xl border ${plan.recommended ? "border-emerald-500/40 bg-emerald-500/[0.03]" : "border-border/50 bg-card"} p-5 relative`}>
      {plan.recommended && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
          <Check className="h-2.5 w-2.5" />추천
        </span>
      )}
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="font-semibold text-sm text-foreground">{plan.name}</h4>
        <span className="text-lg font-bold text-foreground">{plan.price}</span>
      </div>
      <ul className="space-y-1.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />{f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── ChatGPT vs Claude vs Gemini 비교 ── */
function PlanetComparison({ currentToolSlug }: { currentToolSlug: string }) {
  const planets = aiTools.filter((t) => ["chatgpt", "claude", "gemini"].includes(t.id));
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 mt-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">ChatGPT vs Claude vs Gemini 비교</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left pb-2 text-xs font-semibold text-muted-foreground">항목</th>
              {planets.map((p) => (
                <th key={p.id} className={`pb-2 px-3 text-xs font-semibold ${p.id === currentToolSlug ? "text-primary" : "text-muted-foreground"}`}>
                  {p.name} {p.id === currentToolSlug && "⬅"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/20">
              <td className="py-2 text-xs text-muted-foreground">가격 (무료)</td>
              {planets.map((p) => (
                <td key={p.id} className="py-2 px-3 text-xs font-medium text-foreground">{p.pricing?.free?.split(",")[0] ?? "-"}</td>
              ))}
            </tr>
            <tr className="border-b border-border/20">
              <td className="py-2 text-xs text-muted-foreground">가격 (유료)</td>
              {planets.map((p) => (
                <td key={p.id} className="py-2 px-3 text-xs font-medium text-foreground">{p.pricing?.paid?.split("—")[0]?.trim() ?? "-"}</td>
              ))}
            </tr>
            <tr className="border-b border-border/20">
              <td className="py-2 text-xs text-muted-foreground">전문가 평점</td>
              {planets.map((p) => {
                const keys = p.expertRating ? Object.keys(p.expertRating) as (keyof ExpertRating)[] : [];
                const avg = p.expertRating ? keys.reduce((s, k) => s + p.expertRating![k], 0) / keys.length : 0;
                return (
                  <td key={p.id} className={`py-2 px-3 text-xs font-medium ${p.id === currentToolSlug ? "text-amber-400" : "text-foreground"}`}>
                    {avg.toFixed(1)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-2 text-xs text-muted-foreground">특징</td>
              {planets.map((p) => (
                <td key={p.id} className="py-2 px-3 text-xs text-muted-foreground">{p.tags.slice(0, 2).join(", ")}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        각 도구 상세 페이지에서 더 자세한 정보를 확인하세요
      </p>
    </div>
  );
}

/* ── Screenshot Gallery ── */
function ScreenshotGallery({ screenshots, toolName }: { screenshots: string[]; toolName: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden mb-8">
      <div className="flex gap-4 overflow-x-auto p-4 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {screenshots.map((_src, i) => (
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
