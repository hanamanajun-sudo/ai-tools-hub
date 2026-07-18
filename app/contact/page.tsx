import type { Metadata } from "next";
import { MessageCircle, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "문의 — ai.ktoolu",
  description: "ai.ktoolu 광고·제휴 및 콘텐츠 관련 문의는 카카오톡 채널로 받고 있습니다.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-2xl px-4 pb-16">
        <div className="pt-10 pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">문의</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            광고·제휴 문의, 콘텐츠 오류 제보, 그 밖의 문의사항은 카카오톡으로 받고 있습니다.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-foreground">카카오톡 문의</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            카카오톡 앱에서 아래 채널명을 검색해 채널 추가 후 메시지를 보내주세요.
            영업일 기준 순차적으로 답변드립니다.
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-semibold text-foreground">@infoepic</span>
          </div>
        </div>

        <div className="mt-6 text-sm text-muted-foreground leading-relaxed">
          <p>다음과 같은 문의를 환영합니다.</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside">
            <li>광고·제휴 및 콘텐츠 협업 제안</li>
            <li>도구 정보 오류 또는 업데이트 제보</li>
            <li>사이트 이용 중 발견한 버그 신고</li>
          </ul>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
