import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Sparkles, BookOpen, ArrowRight, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ToolsSection } from "@/components/tools-section";
import { ModelRankTable } from "@/components/model-rank-table";
import { StickyBottomPanel } from "@/components/sticky-bottom-panel";
import { getPosts } from "@/lib/notion";
import { aiTools } from "@/lib/ai-tools-data";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/post-categories";
import { ArrowUpRight } from "lucide-react";

// revalidate(시간 기반 ISR)는 OpenNext Cloudflare에서 큐 설정이 필수인데
// 이 프로젝트엔 큐가 없어 동시 요청 시 재검증이 멈춰버린다(실측: 동시 요청
// 10개로 "Worker's code had hung" 재현, Error 1102). 큐(Durable Object,
// 유료 플랜 필요)를 새로 붙이는 대신 시간 기반 재검증 자체를 뺐다.
// force-dynamic 없이 revalidate만 빼면 이 페이지는 dynamic API를 안 써서
// 빌드 시점에 완전히 정적으로 얼어붙는다(모델 랭킹·최신 글이 다음 배포 전까지
// 안 바뀜) — 그래서 매 요청 렌더링을 명시한다. 캐시 계층 자체가 없어 큐도 불필요.
export const dynamic = "force-dynamic";

const BASE_URL = "https://ktoolu.com";

export const metadata: Metadata = {
  alternates: { canonical: BASE_URL },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ktoolu",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const MADE_TOOLS = aiTools.filter((t) => t.madeByKtoolu);

export default async function HomePage() {
  const allPosts = await getPosts();
  const latestPosts = allPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader blogCount={allPosts.length} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-16">
        {/* Hero */}
        <section className="py-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3" />
            최신 AI 도구 {aiTools.length}개 수록
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-4">
            최고의 AI 도구를
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              한곳에서 탐색하세요
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            텍스트, 이미지, 비디오, 코딩, 음악까지 — 업무와 창작을 혁신할
            AI 도구들을 카테고리별로 정리했습니다.
          </p>
        </section>

        {/* Main content (랭킹+툴) + 사이드바(블로그) */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── 메인: 모델 랭킹 + AI 툴 (2/3) ── */}
          <div className="lg:col-span-2 space-y-12">
            <ModelRankTable />

            {/* ktoolu가 직접 만든 도구 */}
            {MADE_TOOLS.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🐙</span>
                  <h2 className="text-lg font-bold text-foreground">ktoolu가 만든 도구</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MADE_TOOLS.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="group flex flex-col rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-border hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">
                          {tool.status === "waitlist" ? "베타 대기중" : "지금 써보기"}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1 flex items-center gap-1">
                        {tool.name}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <Suspense fallback={null}>
              <ToolsSection />
            </Suspense>
          </div>

          {/* ── 사이드바: 최신 블로그 (1/3, 하단 고정) ── */}
          <StickyBottomPanel className="lg:col-span-1">
            <div className="space-y-8">
              {/* 최신 블로그 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">최신 블로그</h2>
                  </div>
                  <Link
                    href="/posts"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    전체 보기
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {latestPosts.length > 0 ? latestPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="block rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {post.category && (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium mb-2 ${CATEGORY_COLORS[post.category] ?? DEFAULT_CATEGORY_COLOR}`}>
                          {post.category}
                        </span>
                      )}
                      <h3 className="font-bold text-foreground hover:text-primary transition-colors mb-1 line-clamp-2 text-sm">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.description}</p>
                      )}
                      {post.publishedAt && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString("ko-KR")}
                        </div>
                      )}
                    </Link>
                  )) : (
                    <p className="text-sm text-muted-foreground py-4">블로그 글이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </StickyBottomPanel>
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
