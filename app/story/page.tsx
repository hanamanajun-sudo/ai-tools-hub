import type { Metadata } from "next";
import { AlertTriangle, FileText, Wand2, Clock, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaitlistForm } from "@/components/waitlist-form";

const BASE_URL = "https://ktoolu.com";

export const metadata: Metadata = {
  title: "AI 장편소설 쓰기 도구 (베타 준비 중) — ktoolu",
  description: "AI로 장편소설을 쓸 때 설정이 무너지는 문제를 해결하는 도구를 만들고 있습니다. 베타 신청하고 가장 먼저 소식을 받아보세요.",
  alternates: { canonical: `${BASE_URL}/story` },
};

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "캐릭터 말투가 회차마다 바뀐다",
    description: "10화에서는 존댓말 쓰던 캐릭터가 20화에서 반말을 쓴다. AI에게 매번 설정을 다시 알려줘야 한다.",
  },
  {
    icon: FileText,
    title: "설정집을 따로 관리하기 번거롭다",
    description: "세계관, 인물 관계, 이미 나온 사건을 별도 문서에 정리해야 하는데, AI와의 대화창에서는 이걸 계속 들고 다니기 어렵다.",
  },
  {
    icon: Wand2,
    title: "AI 특유의 반복 표현이 계속 나온다",
    description: "\"그의 눈빛이 흔들렸다\" 같은 문장이 회차마다 반복돼서, 결국 사람이 일일이 걸러내야 한다.",
  },
];

const PROGRESS = [
  {
    icon: CheckCircle2,
    done: true,
    title: "캐릭터·세계관 설정 관리",
    description: "인물 관계, 말투, 세계관 설정을 한 곳에 정리하고 AI가 매 화 참고하도록 연결하는 기능 — 개발 중",
  },
  {
    icon: Clock,
    done: false,
    title: "회차별 진행 상태 추적",
    description: "이미 나온 사건과 복선을 AI가 잊지 않도록 회차 히스토리를 관리하는 기능 — 설계 중",
  },
  {
    icon: Clock,
    done: false,
    title: "반복 표현 검수",
    description: "AI 특유의 상투적 문장을 잡아내는 검수 기능 — 아이디어 단계",
  },
];

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content">
        {/* 히어로 */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="mx-auto max-w-2xl px-4">
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
              베타 준비 중
            </span>
            <h1 className="mb-5 text-3xl md:text-4xl font-bold leading-tight">
              AI로 장편소설을 쓸 때,
              <br />
              설정이 무너지지 않게
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed opacity-80">
              캐릭터 말투, 세계관, 이미 나온 사건을 AI가 계속 기억하게 만드는 도구를 만들고 있습니다.
              아직 완성 전이라, 먼저 신청해 주시는 분께 베타를 가장 먼저 열어드릴게요.
            </p>
            <WaitlistForm />
          </div>
        </section>

        {/* 문제 정의 */}
        <section className="border-b border-border/40 py-16">
          <div className="mx-auto max-w-2xl px-4">
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                장편을 AI와 쓰면 꼭 생기는 문제
              </h2>
              <p className="text-muted-foreground">직접 AI로 장편을 써보면서 매번 부딪힌 것들입니다.</p>
            </div>
            <div className="space-y-5">
              {PROBLEMS.map((p) => (
                <div key={p.title} className="flex gap-4 rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                    <p.icon className="h-5 w-5 text-destructive" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1 text-sm">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 현재 개발 단계 */}
        <section className="border-b border-border/40 bg-secondary/20 py-16">
          <div className="mx-auto max-w-2xl px-4">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">지금 만들고 있는 것</h2>
              <p className="text-muted-foreground">완성된 제품이 아니라, 실제로 만들어가는 과정을 그대로 보여드립니다.</p>
            </div>
            <div className="space-y-4 rounded-xl border border-border/50 bg-card p-6">
              {PROGRESS.map((p) => (
                <div key={p.title} className="flex items-start gap-3">
                  <p.icon className={`h-5 w-5 shrink-0 mt-0.5 ${p.done ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.title}</p>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 하단 CTA */}
        <section className="bg-primary py-16 text-center text-primary-foreground">
          <div className="mx-auto max-w-xl px-4">
            <h2 className="mb-4 text-2xl font-bold">베타가 열리면 가장 먼저 알려드릴게요</h2>
            <p className="mb-8 text-sm opacity-70">
              지금 신청하신다고 결제가 발생하지 않습니다. 진행 상황도 함께 공유해요.
            </p>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
