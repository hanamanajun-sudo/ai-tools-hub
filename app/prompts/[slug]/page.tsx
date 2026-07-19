import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Lightbulb, FileCheck2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPromptBySlug, getRelatedPrompts, getPromptCategoryMeta } from "@/lib/prompts";
import { getKoName } from "@/lib/tool-names";
import { aiTools } from "@/lib/ai-tools-data";
import { breadcrumbJsonLd, safeJsonLd } from "@/lib/breadcrumb";
import { PromptActions } from "./prompt-actions";
import { PromptShareButtons } from "./share-buttons";

type Props = { params: Promise<{ slug: string }> };

const BASE_URL = "https://ai.ktoolu.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return { title: "프롬프트 없음 — ai.ktoolu" };
  return {
    title: `${prompt.title} — ai.ktoolu 프롬프트 도서관`,
    description: prompt.description,
    alternates: { canonical: `${BASE_URL}/prompts/${slug}` },
    openGraph: { title: prompt.title, description: prompt.description, type: "article", siteName: "ai.ktoolu" },
  };
}

export default async function PromptDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const prompt = await getPromptBySlug(slug);
  if (!prompt) notFound();

  const meta = getPromptCategoryMeta(prompt.category);
  const related = await getRelatedPrompts(prompt.category, slug);
  const recommendedTools = prompt.tools
    .map((id) => aiTools.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const promptUrl = `${BASE_URL}/prompts/${slug}`;
  const breadcrumbs = breadcrumbJsonLd([
    { name: "홈", url: BASE_URL },
    { name: "프롬프트 도서관", url: `${BASE_URL}/prompts` },
    { name: meta?.label ?? "프롬프트", url: `${BASE_URL}/prompts?cat=${prompt.category}` },
    { name: prompt.title, url: promptUrl },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <SiteHeader activePage="prompts" />

      <main id="main-content" className="mx-auto max-w-2xl px-4 pb-16">
        <div className="pt-8">
          <Link
            href="/prompts"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            프롬프트 도서관
          </Link>

          <Link
            href={`/prompts?cat=${prompt.category}`}
            className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            {meta?.emoji} {meta?.label}
          </Link>

          <h1 className="text-2xl font-extrabold leading-snug text-foreground mb-3">{prompt.title}</h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">{prompt.description}</p>

          <PromptActions slug={prompt.slug} content={prompt.content} />

          {prompt.tips && (
            <div className="mt-6 rounded-xl bg-blue-500/5 border border-blue-500/20 px-4 py-3">
              <p className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" /> 사용 팁
              </p>
              <div className="space-y-1.5">
                {prompt.tips.split("\n").filter(Boolean).map((tip, i) => (
                  <p key={i} className="text-sm text-foreground/75 leading-relaxed">{tip}</p>
                ))}
              </div>
            </div>
          )}

          {prompt.example_output && (
            <div className="mt-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
              <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5" /> 실제 결과 예시
              </p>
              <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap">{prompt.example_output}</p>
            </div>
          )}

          {recommendedTools.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-muted-foreground mb-2">추천 툴</p>
              <div className="flex flex-wrap gap-2">
                {recommendedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="inline-flex items-center rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                  >
                    {getKoName(tool).short}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <PromptShareButtons title={prompt.title} slug={prompt.slug} />

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">비슷한 카테고리 프롬프트</h2>
              <div className="space-y-2">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/prompts/${p.slug}`}
                    className="flex items-start gap-2 rounded-lg border border-border/40 bg-card px-4 py-3 hover:border-border transition-colors"
                  >
                    <span className="text-sm text-foreground/80 leading-snug">{p.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
