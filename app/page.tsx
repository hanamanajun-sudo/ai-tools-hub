import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorkCard, MakingCard } from "@/components/work-card";
import { getPosts } from "@/lib/notion";
import { LIVE_WORKS, MAKING_WORKS } from "@/lib/works";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/post-categories";

// 2026-10-18 메인 리뉴얼: "작품이 주인공" 콘셉트(애드센스 "가치가 별로 없는 콘텐츠" 반려 후 재정의).
// 예전 홈의 AI 도구 디렉터리(외부 링크 58개)·AI 모델 랭킹 표(외부 사이트 스크래핑, 9/26부터 수집 실패로
// 멈춰 있던 데이터)는 뺐다. 이제 홈은 작품 → 만드는 중 → 글 순서.
//
// revalidate(시간 기반 ISR)는 OpenNext Cloudflare에서 큐 설정이 필수인데 이 프로젝트엔 큐가 없어
// 동시 요청 시 재검증이 멈춘다(실측 Error 1102). 그래서 시간 기반 재검증 대신 매 요청 렌더링 —
// 글 목록이 Notion에서 오므로 빌드 시점에 얼어붙지 않게 force-dynamic을 명시한다.
export const dynamic = "force-dynamic";

const BASE_URL = "https://ktoolu.com";

export const metadata: Metadata = {
  alternates: { canonical: BASE_URL },
};

// 사이트 내 검색 기능이 없어졌으므로 SearchAction은 뺐다.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ktoolu",
  url: BASE_URL,
};

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader blogCount={posts.length} />

      <main id="main-content" className="mx-auto max-w-5xl px-4 pb-16">
        {/* Hero */}
        <section className="py-14 text-center">
          <p className="mb-4 text-sm font-semibold tracking-wide text-primary">K Tool for U</p>
          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            직접 만든 도구와,
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              만들면서 써본 기록
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ wordBreak: "keep-all" }}>
            이미지 도구부터 SNS 시뮬레이터, 단어장 앱까지 — 직접 만들어 운영하는 것들과,
            만드는 동안 실제로 써본 AI 도구 이야기를 모았습니다.
          </p>
        </section>

        {/* 작품 */}
        <section id="works" className="mb-14">
          <SectionHeader title="작품" href="/made" linkLabel="전체 보기" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LIVE_WORKS.map((work) => (
              <WorkCard key={work.id} work={work} source="home" />
            ))}
          </div>
        </section>

        {/* 만드는 중 */}
        {MAKING_WORKS.length > 0 && (
          <section className="mb-14">
            <SectionHeader title="만드는 중" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {MAKING_WORKS.map((work) => (
                <MakingCard key={work.id} work={work} />
              ))}
            </div>
          </section>
        )}

        {/* 글 */}
        <section>
          <SectionHeader title="글" href="/posts" linkLabel="전체 보기" />
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-border/50 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {post.category && (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[post.category] ?? DEFAULT_CATEGORY_COLOR}`}>
                        {post.category}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString("ko-KR")}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1.5 font-bold leading-snug text-foreground transition-colors group-hover:text-primary" style={{ wordBreak: "keep-all" }}>
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground" style={{ wordBreak: "keep-all" }}>
                      {post.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">아직 글이 없습니다.</p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
