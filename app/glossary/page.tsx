import { createClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 용어해설 — ai.ktoolu",
  description: "AI 뉴스와 기사에 등장하는 주요 용어를 한국어로 쉽게 설명합니다.",
};

export const revalidate = 3600;

async function getTerms() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("glossary")
    .select("slug,term,definition")
    .order("term", { ascending: true });
  return data || [];
}

export default async function GlossaryPage() {
  const terms = await getTerms();

  const grouped: Record<string, typeof terms> = {};
  for (const t of terms) {
    const key = /^[a-zA-Z]/.test(t.term) ? t.term[0].toUpperCase() : "ㄱ-ㅎ";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }
  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16">
        <section className="py-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">AI 용어해설</h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            AI 뉴스에 등장하는 주요 용어를 한국어로 쉽게 설명합니다.
          </p>
        </section>

        {terms.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">아직 등록된 용어가 없습니다.</p>
        ) : (
          <div className="space-y-8">
            {sortedKeys.map(key => (
              <section key={key}>
                <h2 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="h-px flex-1 bg-border/60" />
                  {key}
                  <span className="h-px flex-1 bg-border/60" />
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {grouped[key].map(t => (
                    <Link
                      key={t.slug}
                      href={`/glossary/${t.slug}`}
                      className="rounded-xl border border-border/50 bg-card p-4 hover:border-border hover:shadow-sm transition-all"
                    >
                      <p className="font-semibold text-foreground mb-1">{t.term}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.definition}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
