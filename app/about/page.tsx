import type { Metadata } from "next";
import { Sparkles, LayoutGrid, Newspaper, LibraryBig, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { aiTools } from "@/lib/ai-tools-data";

export const metadata: Metadata = {
  title: "소개 — ai.ktoolu",
  description: "ai.ktoolu는 텍스트·이미지·비디오·코딩·음악 등 다양한 AI 도구를 카테고리별로 정리하고, AI 뉴스와 용어해설을 함께 제공하는 사이트입니다.",
};

const SECTIONS = [
  {
    icon: LayoutGrid,
    title: "AI 도구 디렉토리",
    body: `현재 ${aiTools.length}개의 AI 도구를 텍스트, 이미지, 비디오, 코딩, 음악 등 카테고리별로 정리했습니다. 각 도구의 장단점, 가격 비교, 실사용 후기를 확인할 수 있습니다.`,
  },
  {
    icon: Newspaper,
    title: "AI 뉴스",
    body: "해외 주요 AI 뉴스를 수집해 한국어로 요약하고, 왜 중요한지 쉽게 풀어 설명합니다. 매일 갱신됩니다.",
  },
  {
    icon: LibraryBig,
    title: "용어해설",
    body: "AI 관련 기사에 자주 등장하지만 낯선 용어들을 한국어로 쉽게 풀어 설명합니다.",
  },
  {
    icon: BookOpen,
    title: "블로그",
    body: "AI 도구 활용법, 트렌드 분석, 실전 팁을 다루는 글을 꾸준히 발행합니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-2xl px-4 pb-16">
        <div className="pt-10 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground mb-5">
            <Sparkles className="h-3 w-3" />
            ai.ktoolu 소개
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
            AI 도구를 고르는 시간을 줄여드립니다
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            새로운 AI 서비스가 매일같이 쏟아지지만, 정작 &ldquo;내게 맞는 도구가 무엇인지&rdquo;,
            &ldquo;무료로 어디까지 쓸 수 있는지&rdquo;를 확인하는 데는 생각보다 시간이 걸립니다.
            ai.ktoolu는 이런 고민을 줄이기 위해 AI 도구를 카테고리별로 정리하고,
            실사용 후기와 가격 정보를 한곳에 모아 제공합니다.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {SECTIONS.map((s) => (
            <div key={s.title} className="flex gap-4 rounded-xl border border-border/50 bg-card p-5">
              <s.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-foreground mb-1">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border/50 bg-muted/20 p-5">
          <h2 className="font-bold text-foreground mb-2">운영 및 면책 안내</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ai.ktoolu는 개인이 운영하는 사이트입니다. 소개된 도구의 가격·기능 정보는
            작성 시점 기준이며, 실제 서비스와 차이가 있을 수 있으니 이용 전 공식 사이트에서
            최신 정보를 다시 확인해 주세요. 콘텐츠 오류나 개선 제안은 문의 페이지를 통해 알려주시면
            반영하겠습니다.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
