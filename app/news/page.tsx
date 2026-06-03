import { Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { NewsList } from "./news-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 뉴스 — ai.ktoolu",
  description: "매일 자동 수집·요약되는 최신 AI 뉴스. OpenAI, Anthropic, Google DeepMind 등 주요 AI 트렌드를 한국어로 쉽게 읽어보세요.",
};

// 정적 셸 — 데이터는 클라이언트에서 Supabase 직접 호출
export const dynamic = "force-static";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader activePage="news" />

      <main className="mx-auto max-w-4xl px-4 pb-16">
        <section className="py-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-3">
            가장 빠른 AI 뉴스 모음
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            해외 주요 AI 뉴스를 수집해 한국어로 요약 전달합니다.
          </p>
        </section>

        <NewsList />
      </main>

      <footer className="border-t border-border/40 bg-muted/10 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            ai.ktoolu — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}
