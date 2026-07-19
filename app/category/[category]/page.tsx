import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { categories, type Category } from "@/lib/ai-tools-data";
import { categoryColors } from "@/lib/tool-styles";
import { getRankedToolsForCategory, getRankEmoji, getHighlight, shortDesc } from "@/lib/tool-ranking";
import { getToolShortName as getName } from "@/lib/tool-names";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { breadcrumbJsonLd, safeJsonLd } from "@/lib/breadcrumb";

type Props = { params: Promise<{ category: string }> };

const BASE_URL = "https://ai.ktoolu.com";

/** 카테고리별 소개 — 실제로 다른 내용, 템플릿 문구 아님 */
const CATEGORY_INTRO: Record<Exclude<Category, "all">, string> = {
  text: "ChatGPT, Claude, Gemini처럼 대화로 질문에 답하고 글을 써주는 AI입니다. 문서 작성, 번역, 코드 설명, 아이디어 정리 등 일상 업무 대부분을 커버하며, 무료로 시작할 수 있는 도구가 많습니다.",
  image: "Midjourney, DALL-E처럼 텍스트 설명만으로 그림을 만들어내는 AI입니다. 일러스트·광고 이미지·컨셉 아트 제작에 활용되며, 도구마다 그림체와 사실감의 방향이 크게 다릅니다.",
  video: "Sora, Runway, Kling처럼 텍스트나 이미지 한 장으로 짧은 영상을 만들어내는 AI입니다. 아직 초기 단계라 현실감·움직임의 자연스러움·영상 길이 등 도구별 강점이 뚜렷하게 갈립니다.",
  coding: "Cursor, Claude, GitHub Copilot처럼 코드 작성·리뷰·디버깅을 돕는 AI입니다. 자동완성 수준을 넘어 기능 설계부터 구현까지 맡기는 '에이전틱 코딩'으로 빠르게 진화하고 있습니다.",
  music: "Suno처럼 가사나 장르만 입력하면 완성된 곡을 만들어주는 AI입니다. 다른 카테고리보다 도구 수는 적지만 완성도가 빠르게 올라가고 있는 영역입니다.",
  agent: "Zapier, n8n, AutoGPT처럼 여러 앱을 연결하거나 작업을 스스로 계획해 처리하는 AI입니다. 반복 업무를 코드 없이 자동화하려는 1인 창업가·스타트업이 특히 많이 찾습니다.",
  other: "위 카테고리로 분류하기 애매하거나 여러 영역을 넘나드는 AI 도구들을 모았습니다.",
};

function getCategory(value: string) {
  return categories.find((c) => c.value === value && c.value !== "all");
}

export function generateStaticParams() {
  return categories.filter((c) => c.value !== "all").map((c) => ({ category: c.value }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  const count = getRankedToolsForCategory(cat.value as Exclude<Category, "all">).length;
  const title = `${cat.label} AI 도구 추천 ${count}선 — ai.ktoolu`;
  const description = CATEGORY_INTRO[cat.value as Exclude<Category, "all">];
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/category/${cat.value}` },
    openGraph: { title, description, type: "website", siteName: "ai.ktoolu" },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const catValue = cat.value as Exclude<Category, "all">;
  const tools = getRankedToolsForCategory(catValue);
  if (tools.length === 0) notFound();

  const colorClass = categoryColors[catValue];
  const pageUrl = `${BASE_URL}/category/${catValue}`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.label} AI 도구 모음`,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/tools/${tool.id}`,
      name: tool.name,
    })),
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "홈", url: BASE_URL },
    { name: cat.label, url: pageUrl },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
          ← 전체 AI 도구
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass}`}>
            {cat.emoji} {cat.label}
          </span>
          <span className="text-xs text-muted-foreground">{tools.length}개 도구</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
          {cat.label} AI 도구 추천 {tools.length}선
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mb-10">
          {CATEGORY_INTRO[catValue]}
        </p>

        <div className="space-y-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
            >
              <span className="shrink-0 text-lg font-bold text-muted-foreground w-9 text-center pt-0.5">
                {getRankEmoji(tool.rankInCat)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {getName(tool)}
                  </h2>
                  {tool.free ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400">무료</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[11px] font-medium text-orange-400">유료</span>
                  )}
                  {tool.popular && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-black">
                      <Star className="h-2.5 w-2.5 fill-current" />인기
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-1.5">{shortDesc(tool)}</p>
                {tool.expertRating && (
                  <p className="text-xs text-muted-foreground/80">{getHighlight(tool)}</p>
                )}
                {tool.mergeNote && (
                  <p className="text-xs text-muted-foreground/60 mt-1">{tool.mergeNote}</p>
                )}
                {tool.soraNote && (
                  <p className="text-xs text-amber-500/80 mt-1">{tool.soraNote}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
