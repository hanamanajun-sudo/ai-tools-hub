import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, LayoutGrid, Target, TrendingUp, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { aiTools } from "@/lib/ai-tools-data";
import { ALL_CATEGORIES } from "@/lib/post-categories";

export const metadata: Metadata = {
  title: "ktoolu란? — ktoolu",
  description:
    "ktoolu는 AI 도구를 소개하고, 그 도구로 직접 만들고 써본 기록을 남기는 곳입니다. 크툴루(Cthulhu)에서 영감을 받은 이름처럼, 심해보다 넓고 깊은 정보를 제공합니다.",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "AI 콘텐츠 제작": "AI로 글·이미지·자동화 파이프라인 직접 만들기",
  "AI 도구 비교": "가격·한도까지 확인한 AI 툴 비교",
  "유튜브 & 숏폼": "AI를 더한 유튜브 제작·성장 전략",
  "AI 개발 · 자동화": "Claude Code, 로컬 LLM 등 개발 도구를 실제로 굴려본 기록",
  "글쓰기 & 소설": "AI와 함께 이야기 구상하고 쓰기",
  "게임 · 앱 만들기": "AI로 아이디어부터 프로토타입까지",
};

const PILLARS = [
  {
    icon: LayoutGrid,
    title: "AI 도구 디렉토리",
    body: `${aiTools.length}개의 AI 도구를 카테고리별로 정리하고, 그중 저희가 직접 만든 도구도 함께 소개합니다. 장단점, 가격 비교, 대안 도구까지 한 곳에서 확인할 수 있어요.`,
  },
  {
    icon: TrendingUp,
    title: "AI 모델 랭킹",
    body: "지능·속도·비용·컨텍스트 지표를 매일 자동으로 수집해 상위 10개 모델을 갱신합니다. 사람이 요약한 뉴스가 아니라 실측 지표로 트렌드를 확인하세요.",
  },
  {
    icon: BookOpen,
    title: "직접 만들어 보고 씁니다",
    body: "발표 자료를 요약만 하지 않아요. 도구를 직접 써보고, 때로는 직접 만들어보면서 알게 된 것만 글로 남깁니다.",
  },
  {
    icon: Target,
    title: "가격·한도까지 확인",
    body: "비교 글에는 항상 확인 날짜를 남겨요. 무료 플랜의 숨은 제한처럼, 결정에 필요한 숫자를 빠뜨리지 않으려 합니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content">
        {/* 히어로 */}
        <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
              ktoolu란?
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              <span className="font-bold text-primary">K Tool for U</span> — AI로 만드는 사람들을 위한 툴킷
            </p>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground leading-relaxed mt-4">
              AI 도구를 고르는 시간을 줄여드립니다. 새로운 AI 서비스가 매일같이 쏟아지지만,
              정작 &ldquo;내게 맞는 도구가 무엇인지&rdquo;를 확인하는 데는 생각보다 시간이 걸리니까요.
            </p>
          </div>
        </section>

        {/* 이름의 의미 */}
        <section className="border-b border-border/40 py-14">
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <img
                src="/ktoolu-logo.png"
                alt="크툴루"
                width={140}
                height={140}
                className="shrink-0 drop-shadow-lg"
              />
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">이름의 의미</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  <span className="font-semibold text-foreground">ktoolu</span>는 H.P. 러브크래프트의 소설에 등장하는
                  신화적 존재 <span className="font-semibold text-primary">크툴루(Cthulhu)</span>에서 영감을 받은 이름이에요.
                  심해에 잠들어 있는 크툴루처럼, 인터넷 어딘가에 흩어진 AI 활용법을 한 곳에 끌어모아 제공한다는 의미를 담았습니다.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  동시에 <span className="font-semibold text-primary">K Tool for U</span> — AI로 무언가 만들고 싶은
                  사람들을 위한 실용적인 툴과 정보를 제공한다는 뜻이기도 해요.
                </p>
                <div className="mt-5 rounded-xl border-l-4 border-primary bg-primary/5 p-4">
                  <p className="text-sm text-foreground italic">&ldquo;우리의 지식은 심해보다 깊다&rdquo; — ktoolu 모토</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 무엇을 다루나요 */}
        <section className="border-b border-border/40 py-14">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">무엇을 다루나요?</h2>
              <p className="text-sm text-muted-foreground">6가지 카테고리로 AI 콘텐츠 제작의 궁금증을 해결해요</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {ALL_CATEGORIES.map((cat) => (
                <div key={cat} className="rounded-xl border border-border/50 bg-card p-5">
                  <h3 className="font-bold text-foreground mb-1 text-sm">{cat}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{CATEGORY_DESCRIPTIONS[cat]}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <img src="/ktoolu-tube-logo.png" alt="ktoolu tube 로고" width={220} height={220} className="drop-shadow-xl" />
            </div>
          </div>
        </section>

        {/* 왜 ktoolu인가 */}
        <section className="border-b border-border/40 py-14">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">왜 ktoolu인가요?</h2>
              <p className="text-sm text-muted-foreground">AI로 만드는 사람들을 위해 지키는 4가지 원칙</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PILLARS.map((p) => (
                <div key={p.title} className="flex gap-4 rounded-xl border border-border/50 bg-card p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <p.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 text-sm">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 text-center">
          <div className="mx-auto max-w-xl px-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">지금 바로 시작해보세요</h2>
            <p className="text-sm text-muted-foreground mb-7">
              AI로 뭔가 만들고 싶은데 막막한가요? ktoolu가 함께할게요.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                AI 도구 둘러보기
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors"
              >
                <Zap className="h-4 w-4" strokeWidth={1.5} />
                가이드 보기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
