import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorkCard, MakingCard } from "@/components/work-card";
import { LIVE_WORKS, MAKING_WORKS } from "@/lib/works";
import { breadcrumbJsonLd, safeJsonLd } from "@/lib/breadcrumb";

const BASE_URL = "https://ktoolu.com";

export const metadata: Metadata = {
  title: "ktoolu가 직접 만든 것 — ktoolu",
  description: "ktoolu가 직접 만들어 운영하는 웹 도구와 앱 모음입니다.",
  alternates: { canonical: `${BASE_URL}/made` },
};

// 작품 목록은 lib/works.ts 한 곳에서 관리한다(홈 "작품" 섹션과 같은 데이터).
export default function MadePage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "홈", url: BASE_URL },
    { name: "작품", url: `${BASE_URL}/made` },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <SiteHeader activePage="made" />

      <main id="main-content" className="mx-auto max-w-5xl px-4 pb-16">
        <div className="pt-10 pb-8">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">ktoolu가 직접 만든 것</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            직접 만들어 운영하는 웹 도구와 앱입니다. 카드를 누르면 바로 열어볼 수 있어요.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="mb-4 text-lg font-bold text-foreground">운영 중</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LIVE_WORKS.map((work) => (
              <li key={work.id}>
                <WorkCard work={work} source="made" />
              </li>
            ))}
          </ul>
        </section>

        {MAKING_WORKS.length > 0 && (
          <section>
            <h2 className="mb-1 text-lg font-bold text-foreground">만드는 중</h2>
            <p className="mb-4 text-sm text-muted-foreground">아직 공개 전이라 링크는 없어요.</p>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {MAKING_WORKS.map((work) => (
                <li key={work.id}>
                  <MakingCard work={work} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
