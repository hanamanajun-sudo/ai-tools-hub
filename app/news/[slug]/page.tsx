import { createClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft, ScrollText, GraduationCap, Zap, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { newsSlug, parseNewsId, isIndexable } from "@/lib/news-slug";
import { NewsShareButtons } from "./share-buttons";

export const revalidate = 3600;

const BASE_URL = "https://ai.ktoolu.com";

type AiNews = {
  id: number;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  explanation: string | null;
  importance: string | null;
  collected_at: string;
  is_visible: boolean;
  tags: string[] | null;
  terms: string[] | null;
};

type GlossaryTerm = { slug: string; term: string; definition: string };

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getNews(id: number): Promise<AiNews | null> {
  const { data } = await client()
    .from("ai_news")
    .select("id,title,url,source,summary,explanation,importance,collected_at,is_visible,tags,terms")
    .eq("id", id)
    .eq("is_visible", true)
    .single();
  return data as AiNews | null;
}

async function getTerms(slugs: string[]): Promise<GlossaryTerm[]> {
  if (slugs.length === 0) return [];
  const { data } = await client()
    .from("glossary")
    .select("slug,term,definition")
    .in("slug", slugs);
  return (data as GlossaryTerm[]) || [];
}

/** 같은 태그/용어를 공유하는 관련 기사 */
async function getRelated(item: AiNews): Promise<AiNews[]> {
  const supabase = client();
  const key = (item.terms?.length ? item.terms[0] : null);
  let q = supabase
    .from("ai_news")
    .select("id,title,url,source,summary,explanation,importance,collected_at,is_visible,tags,terms")
    .eq("is_visible", true)
    .neq("id", item.id)
    .order("collected_at", { ascending: false })
    .limit(5);
  if (key) q = q.contains("terms", [key]);
  else if (item.tags?.length) q = q.contains("tags", [item.tags[0]]);
  const { data } = await q;
  return (data as AiNews[]) || [];
}

// ── 텍스트 분해 헬퍼 (news-list.tsx와 동일 로직) ──
function parseSummaryLines(text: string): string[] {
  if (text.includes("•")) {
    return text.split("\n").map(l => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean).slice(0, 3);
  }
  if (/^\d+\./.test(text.trim())) {
    return text.split("\n").map(l => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean).slice(0, 3);
  }
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3);
}

function splitSentences(text: string): string[] {
  if (text.includes("\n")) {
    return text.split("\n").map(s => s.trim()).filter(Boolean);
  }
  const parts = text.split(/(?<=[다됩니임했않요도죠함]\.)\s+/);
  return parts.map(s => s.trim()).filter(Boolean);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = parseNewsId(slug);
  const item = id ? await getNews(id) : null;
  if (!item) return { title: "뉴스 없음 — ai.ktoolu" };

  const desc = (item.summary || item.explanation || item.title).replace(/\n/g, " ").slice(0, 150);
  const canonical = `${BASE_URL}/news/${newsSlug(item)}`;
  const indexable = isIndexable(item);

  return {
    title: `${item.title} — ai.ktoolu AI 뉴스`,
    description: desc,
    alternates: { canonical },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: item.title,
      description: desc,
      type: "article",
      siteName: "ai.ktoolu",
      url: canonical,
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = parseNewsId(slug);
  if (!id) notFound();

  const item = await getNews(id);
  if (!item) notFound();

  const [terms, related] = await Promise.all([
    getTerms(item.terms || []),
    getRelated(item),
  ]);
  const termMap = Object.fromEntries(terms.map(t => [t.slug, t]));

  const dateLabel = new Date(item.collected_at).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    datePublished: item.collected_at,
    dateModified: item.collected_at,
    author: { "@type": "Organization", name: "ai.ktoolu" },
    publisher: { "@type": "Organization", name: "ai.ktoolu" },
    mainEntityOfPage: `${BASE_URL}/news/${newsSlug(item)}`,
    ...(item.summary ? { description: item.summary.replace(/\n/g, " ").slice(0, 200) } : {}),
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader activePage="news" />
      <script
        type="application/ld+json"
        // JSON.stringify 결과의 `<`를 이스케이프해 제목 등에 `</script>`가 있어도 안전
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <main className="mx-auto max-w-2xl px-4 pb-16">
        <div className="pt-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            AI 뉴스 목록
          </Link>

          {/* 상단: 소스 + 날짜 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {item.source}
            </span>
            <span className="text-xs text-muted-foreground">{dateLabel}</span>
          </div>

          <h1 className="text-2xl font-extrabold leading-snug text-foreground mb-5">
            {item.title}
          </h1>

          {item.summary && (
            <div className="mb-4 rounded-xl bg-muted/50 border border-border/40 px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5" /> 기사 3줄 요약
              </p>
              <ol className="space-y-1.5">
                {parseSummaryLines(item.summary).map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                    <span className="shrink-0 mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-muted-foreground/20 text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    {line}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {item.explanation && (
            <div className="mb-4 rounded-xl bg-blue-500/5 border border-blue-500/20 px-4 py-3">
              <p className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> 초등학생도 이해하는 ktoolu 설명
              </p>
              <div className="space-y-1.5">
                {splitSentences(item.explanation).map((s, i) => (
                  <p key={i} className="text-sm text-foreground/75 leading-relaxed">{s}</p>
                ))}
              </div>
            </div>
          )}

          {item.importance && (
            <div className="mb-4 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3">
              <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> 인사이트 &amp; 시사점
              </p>
              <div className="space-y-1.5">
                {splitSentences(item.importance).map((s, i) => (
                  <p key={i} className="text-sm text-foreground/75 leading-relaxed">{s}</p>
                ))}
              </div>
            </div>
          )}

          {terms.length > 0 && (
            <div className="mb-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
              <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> 용어해설
              </p>
              <div className="space-y-2">
                {(item.terms || []).map(slug => {
                  const g = termMap[slug];
                  if (!g) return null;
                  return (
                    <div key={slug}>
                      <Link
                        href={`/glossary/${slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-0.5"
                      >
                        {g.term}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                      <p className="text-xs text-foreground/60 leading-relaxed">{g.definition}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 원문 출처 */}
          <div className="mt-6 pt-4 border-t border-border/30">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              원문 보기 ({item.source}) <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <NewsShareButtons title={item.title} slug={newsSlug(item)} />

          {/* 관련 기사 */}
          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">관련 AI 뉴스</h2>
              <div className="space-y-2">
                {related.map(a => (
                  <Link
                    key={a.id}
                    href={`/news/${newsSlug(a)}`}
                    className="flex items-start gap-2 rounded-lg border border-border/40 bg-card px-4 py-3 hover:border-border transition-colors"
                  >
                    <span className="text-sm text-foreground/80 leading-snug">{a.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
