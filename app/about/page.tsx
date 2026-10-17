import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Target, Wrench } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "ktoolu란? — ktoolu",
  description:
    "ktoolu는 직접 만든 도구를 운영하고, 그걸 만들며 써본 AI 도구의 기록을 남기는 곳입니다. 크툴루(Cthulhu)에서 영감을 받은 이름처럼, 심해보다 넓고 깊은 정보를 제공합니다.",
};

// 2026-10-18: 6개 카테고리 소개 대신, 콘셉트 재정의 때 정한 글 세 종류를 보여준다.
const WRITING_KINDS = [
  { title: "작품 이야기", body: "직접 만든 도구를 어떻게 쓰는지, 써보면 어떤 결과가 나오는지" },
  { title: "만들면서 알게 된 것", body: "만드는 과정에서 다른 사람에게도 쓸모 있을 만한 것만" },
  { title: "써본 AI 도구", body: "실제로 써본 도구의 날짜를 박은 체험기 — 모델이 바뀌어도 그때의 기록으로 남게" },
];

const PILLARS = [
  {
    icon: Wrench,
    title: "직접 만들어 운영합니다",
    body: "이미지 도구, SNS 시뮬레이터, 취향 카드, 단어장 앱처럼 직접 만든 것들을 운영하고 있어요. 전부 '작품'에서 볼 수 있습니다.",
  },
  {
    icon: BookOpen,
    title: "써본 것만 씁니다",
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
      <SiteHeader activePage="about" />

      <main id="main-content">
        {/* 히어로 */}
        <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent py-16 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
              ktoolu란?
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              <span className="font-bold text-primary">K Tool for U</span> — 만드는 사람이 직접 쓰고 기록하는 곳
            </p>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground leading-relaxed mt-4">
              AI 도구를 고르는 시간을 줄여드리고, 직접 만든 것도 공개합니다. 새로운 AI 서비스가
              매일같이 쏟아지지만, 정작 &ldquo;내게 맞는 도구가 무엇인지&rdquo;를 확인하는 데는
              생각보다 시간이 걸리니까요.
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
              <p className="text-sm text-muted-foreground">세 가지 글을 씁니다</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {WRITING_KINDS.map((k) => (
                <div key={k.title} className="rounded-xl border border-border/50 bg-card p-5">
                  <h3 className="font-bold text-foreground mb-1 text-sm">{k.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{k.body}</p>
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
              <p className="text-sm text-muted-foreground">AI로 만드는 사람들을 위해 지키는 3가지 원칙</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                href="/made"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                작품 보러 가기
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors"
              >
                <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                글 읽기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
