import Link from "next/link";
import type { Metadata } from "next";
import { MessageCircle, Search, AlertCircle, MessageSquare, Handshake } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "문의 — ktoolu",
  description: "ktoolu 광고·제휴, 콘텐츠 오류 제보, 그 밖의 문의는 카카오톡 채널로 받고 있습니다.",
};

const TOPICS = [
  {
    icon: AlertCircle,
    title: "오류 · 정보 정정 제보",
    description:
      "글에 실린 가격, 무료 플랜 한도, 기능 설명이 실제와 다른 것을 발견하셨다면 알려주세요. AI 도구는 정책이 자주 바뀌어 가장 많이 도움이 되는 제보입니다.",
  },
  {
    icon: MessageSquare,
    title: "다뤄줬으면 하는 주제",
    description:
      "어떤 도구를 비교해줬으면 하는지, 어떤 작업을 AI로 자동화하고 싶은지 알려주세요. 실제 질문에서 출발한 글이 가장 잘 읽힙니다.",
  },
  {
    icon: Handshake,
    title: "제휴 · 도구 소개 요청",
    description:
      "직접 만드신 도구나 서비스를 소개하고 싶으시면 어떤 문제를 해결하는지 함께 보내주세요. 실제로 써본 뒤에만 다룹니다.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-2xl px-4 pb-16">
        <div className="pt-10 pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">문의</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            제보와 제안을 환영합니다. 특히 글의 정보가 최신이 아닌 것을 발견하셨다면 알려주세요.
          </p>
        </div>

        {/* 카카오톡 채널 */}
        <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-foreground">카카오톡 문의</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            카카오톡 앱에서 아래 채널명을 검색해 채널 추가 후 메시지를 보내주세요.
            보통 2~3일 안에 답변드립니다.
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-semibold text-foreground">@infoepic</span>
          </div>
        </div>

        {/* 어떤 문의를 받나 */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground mb-1">이런 문의를 기다립니다</h2>
          <p className="text-sm text-muted-foreground mb-5">아래 내용이 아니어도 괜찮습니다. 어떤 이야기든 편하게 보내주세요.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TOPICS.map((t) => (
              <div key={t.title} className="rounded-xl border border-border/50 bg-card p-5">
                <t.icon className="h-5 w-5 text-primary mb-3" strokeWidth={1.5} />
                <h3 className="font-bold text-foreground mb-1.5 text-sm">{t.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 먼저 확인해 보세요 */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground mb-5">먼저 확인해 보세요</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 p-5">
              <h3 className="font-semibold text-foreground mb-1 text-sm">글의 정보가 언제 기준인가요?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                각 글에 작성일이 표시됩니다. 가격과 무료 플랜 한도가 포함된 비교 글은 분기마다 다시 확인해 갱신하고 있습니다.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 p-5">
              <h3 className="font-semibold text-foreground mb-1 text-sm">글을 인용하거나 옮겨도 되나요?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                출처와 원문 링크를 함께 표기하시면 일부 인용은 자유롭게 하셔도 됩니다. 전문 전재는 위 채널로 먼저 문의해 주세요.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 p-5">
              <h3 className="font-semibold text-foreground mb-1 text-sm">개인정보 관련 요청은 어디로 하나요?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                위 카카오톡 채널로 보내주시면 됩니다. 처리 기준은{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  개인정보처리방침
                </Link>
                에 정리돼 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
