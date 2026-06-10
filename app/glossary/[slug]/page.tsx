import { createClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

async function getTerm(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("glossary")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

async function getRelatedArticles(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("ai_news")
    .select("id,title,collected_at")
    .contains("terms", [slug])
    .eq("is_visible", true)
    .order("collected_at", { ascending: false })
    .limit(5);
  return data || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const term = await getTerm(slug);
  if (!term) return { title: "용어 없음 — ai.ktoolu" };
  return {
    title: `${term.term} 뜻, 설명 — ai.ktoolu`,
    description: term.definition.slice(0, 150),
  };
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [term, articles] = await Promise.all([getTerm(slug), getRelatedArticles(slug)]);

  if (!term) notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-16">
        <div className="pt-8 pb-4">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            용어해설 목록
          </Link>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5 mb-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl font-extrabold text-foreground">{term.term}</h1>
              <BookOpen className="h-5 w-5 text-emerald-400 shrink-0 mt-1" />
            </div>
            <div className="space-y-2">
              {term.definition.split(/(?<=[다됩니임했않]\.)\s+/).filter(Boolean).map((s: string, i: number) => (
                <p key={i} className="text-sm text-foreground/80 leading-relaxed">{s}</p>
              ))}
            </div>
            {term.url && (
              <a
                href={term.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                공식 링크 <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {articles.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">이 용어가 나온 기사</h2>
              <div className="space-y-2">
                {articles.map(a => (
                  <Link
                    key={a.id}
                    href={`/news#article-${a.id}`}
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
