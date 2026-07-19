import Link from "next/link";
import type { Metadata } from "next";
import { Star, Copy, Wand2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrompts, PROMPT_CATEGORIES, getPromptCategoryMeta, type PromptCategory } from "@/lib/prompts";
import { getToolShortName } from "@/lib/tool-names";
import { aiTools } from "@/lib/ai-tools-data";

function toolDisplayName(toolId: string): string {
  const tool = aiTools.find((t) => t.id === toolId);
  return tool ? getToolShortName(tool) : toolId;
}

export const revalidate = 3600;

const BASE_URL = "https://ai.ktoolu.com";

type Props = { searchParams: Promise<{ cat?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { cat } = await searchParams;
  const catMeta = cat ? getPromptCategoryMeta(cat) : undefined;
  const title = catMeta ? `${catMeta.label} 프롬프트 모음 — ai.ktoolu 프롬프트 도서관` : "프롬프트 도서관 — ai.ktoolu";
  const description = "바로 복사해서 쓰는 실전 프롬프트 모음. 글쓰기, 업무, 코딩, 학습, 이미지, 커리어까지 카테고리별로 정리했습니다.";
  return {
    title,
    description,
    alternates: { canonical: catMeta ? `${BASE_URL}/prompts?cat=${catMeta.value}` : `${BASE_URL}/prompts` },
  };
}

export default async function PromptsPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const activeCategory = cat && getPromptCategoryMeta(cat) ? (cat as PromptCategory) : undefined;
  const prompts = await getPrompts(activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader activePage="prompts" />

      <main id="main-content" className="mx-auto max-w-4xl px-4 pb-16">
        <div className="pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground mb-5">
            <Wand2 className="h-3 w-3" />
            프롬프트 도서관
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-3">
            바로 복사해서 쓰는 프롬프트
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            변수만 채우면 완성되는 실전 프롬프트를 카테고리별로 정리했습니다.
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Link
            href="/prompts"
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !activeCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
            }`}
          >
            전체
          </Link>
          {PROMPT_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/prompts?cat=${c.value}`}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === c.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
              }`}
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>

        {prompts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">아직 등록된 프롬프트가 없습니다.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {prompts.map((p) => {
              const meta = getPromptCategoryMeta(p.category);
              return (
                <Link
                  key={p.slug}
                  href={`/prompts/${p.slug}`}
                  className="group flex flex-col rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
                >
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {p.is_featured && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-500 border border-amber-500/30">
                        <Star className="h-2.5 w-2.5 fill-amber-500" /> 편집자 픽
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {meta?.emoji} {meta?.label}
                    </span>
                  </div>
                  <h2 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1.5">
                    {p.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{p.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      {p.tools.slice(0, 3).map((toolId) => (
                        <span key={toolId} className="rounded bg-muted/60 px-1.5 py-0.5">
                          {toolDisplayName(toolId)}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1">
                      <Copy className="h-3 w-3" /> {p.copy_count}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
