import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "개인정보처리방침 — ai.ktoolu",
  description: "ai.ktoolu의 개인정보 수집·이용에 관한 안내입니다.",
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 수집하는 정보 및 수집 방법",
    body: (
      <>
        <p>
          ai.ktoolu는 회원가입 없이 이용할 수 있는 사이트이며, 이용자의 이름·이메일 등
          신원을 확인할 수 있는 정보를 별도로 수집하지 않습니다.
        </p>
        <p>다만 아래 기능 이용 과정에서 일부 정보가 자동으로 생성·수집됩니다.</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><b>도구 리뷰·별점 작성 시</b>: 별점, 코멘트 내용, 작성 시각이 저장됩니다. 이름이나 연락처는 요구하지 않습니다.</li>
          <li><b>사이트 이용 시</b>: Google Analytics를 통해 방문 페이지, 접속 기기·브라우저 종류, 대략적 지역(도시 단위) 등 통계성 이용 정보가 자동 수집됩니다.</li>
        </ul>
      </>
    ),
  },
  {
    title: "2. 정보 이용 목적",
    body: (
      <ul className="list-disc list-inside space-y-1">
        <li>도구별 실사용 평가·리뷰 표시 및 평균 별점 산출</li>
        <li>방문 통계 분석을 통한 콘텐츠 개선 및 서비스 품질 향상</li>
        <li>부정 이용(도배·욕설 등) 방지를 위한 리뷰 검수</li>
      </ul>
    ),
  },
  {
    title: "3. 보유 및 이용 기간",
    body: (
      <p>
        작성된 리뷰는 삭제 요청이 있거나 운영상 부적절하다고 판단되어 관리자가 숨김·삭제 처리할 때까지
        보관됩니다. Google Analytics 데이터는 Google의 표준 보관 정책을 따릅니다.
      </p>
    ),
  },
  {
    title: "4. 제3자 제공 및 처리 위탁",
    body: (
      <>
        <p>ai.ktoolu는 아래 외부 서비스를 이용하며, 이 과정에서 이용 정보가 해당 서비스에 전달될 수 있습니다.</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><b>Google Analytics(GA4)</b> — 방문 통계 분석</li>
          <li><b>Supabase</b> — 리뷰·별점 데이터 저장(데이터베이스 호스팅)</li>
        </ul>
        <p className="mt-2">
          현재 ai.ktoolu는 광고를 게재하고 있지 않습니다. 추후 Google AdSense 등 광고 서비스를 도입할 경우,
          광고 파트너가 맞춤형 광고 제공을 위해 쿠키를 사용할 수 있으며, 이 경우 본 방침을 사전에 개정해
          고지합니다.
        </p>
      </>
    ),
  },
  {
    title: "5. 쿠키(Cookie) 운영",
    body: (
      <p>
        Google Analytics는 방문자 구분을 위해 쿠키를 사용합니다. 이용자는 브라우저 설정에서 쿠키 저장을
        거부하거나 삭제할 수 있으며, 이 경우 일부 통계 기능이 제한될 수 있으나 사이트 이용 자체에는
        영향이 없습니다.
      </p>
    ),
  },
  {
    title: "6. 이용자의 권리",
    body: (
      <p>
        본인이 작성한 리뷰의 삭제를 원하시면 문의 페이지를 통해 요청해 주세요. 확인 후 조치하겠습니다.
      </p>
    ),
  },
  {
    title: "7. 문의처",
    body: (
      <p>
        개인정보 관련 문의는{" "}
        <a href="/contact" className="text-primary hover:underline">문의 페이지</a>
        {" "}안내에 따라 카카오톡 채널(@infoepic)로 연락해 주세요.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-2xl px-4 pb-16">
        <div className="pt-10 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">개인정보처리방침</h1>
          <p className="text-sm text-muted-foreground">시행일: 2026년 7월 18일</p>
        </div>

        <div className="space-y-7">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-bold text-foreground mb-2">{s.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{s.body}</div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
