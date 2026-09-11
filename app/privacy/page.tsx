import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "개인정보처리방침 — ktoolu",
  description: "ktoolu의 개인정보 수집·이용, 쿠키, 제3자 서비스 사용에 관한 안내입니다.",
};

const EFFECTIVE_DATE = "2026년 9월 11일";

// TODO(3단계 — /story 대기명단 병합 시 갱신 필요):
// 대기명단 폼이 이 코드베이스에 합류하면 1절에 이메일 수집 항목을 추가할 것.
// 지금은 이 사이트에 이메일을 수집하는 기능이 없어 의도적으로 뺐다 —
// 없는 기능을 있는 것처럼 적으면 그 자체로 부정확한 고지가 된다.
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 수집하는 정보",
    body: (
      <>
        <p>
          이 사이트는 회원가입 없이 이용할 수 있으며, 이름·전화번호 등 이용자를 직접 식별할 수 있는
          정보를 요구하거나 수집하지 않습니다.
        </p>
        <p>
          다만 Google Analytics를 통해 접속 IP, 브라우저·기기 종류, 방문 페이지, 체류 시간, 유입 경로
          등 통계성 이용 정보가 자동으로 수집됩니다.
        </p>
      </>
    ),
  },
  {
    title: "2. 정보 이용 목적",
    body: (
      <ul className="list-disc list-inside space-y-1">
        <li>방문 통계 분석을 통한 콘텐츠 개선 및 서비스 품질 향상</li>
        <li>비정상적인 접근 및 오류 대응</li>
      </ul>
    ),
  },
  {
    title: "3. 쿠키(Cookie) 사용",
    body: (
      <>
        <p>
          Google Analytics는 방문자 구분을 위해 쿠키를 사용합니다. 이용자는 브라우저 설정에서
          쿠키 저장을 거부하거나 삭제할 수 있으며, 이 경우 일부 통계 기능이 제한될 수 있으나
          사이트 이용 자체에는 영향이 없습니다.
        </p>
        <p>
          현재 이 사이트는 광고를 게재하고 있지 않습니다. 추후 Google AdSense 등 광고 서비스를
          도입할 경우, 광고 파트너가 맞춤형 광고 제공을 위해 별도의 쿠키를 사용할 수 있으며, 이용자는
          그 시점에{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google 광고 설정
          </a>
          에서 맞춤 광고를 사용 중지할 수 있습니다.
        </p>
      </>
    ),
  },
  {
    title: "4. 제3자 제공 및 처리 위탁",
    body: (
      <>
        <p>이 사이트는 아래 외부 서비스를 이용하며, 이 과정에서 자동 수집 정보가 해당 서비스에 전달됩니다.</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <b>Google Analytics(GA4)</b> — 방문 통계 분석.{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google 개인정보처리방침
            </a>
          </li>
          <li><b>Cloudflare</b> — 사이트 호스팅 및 이미지 저장. 접속 로그가 서버에 기록됩니다.</li>
          <li><b>Supabase</b> — AI 도구 소개 페이지의 프롬프트·모델 랭킹 데이터 저장(읽기 전용, 이용자가 직접 입력하는 정보 없음).</li>
        </ul>
      </>
    ),
  },
  {
    title: "5. 보유 및 파기",
    body: (
      <p>
        통계 목적의 자동 수집 정보는 Google Analytics의 표준 보관 정책(최대 26개월)을 따르며,
        이후 자동 삭제됩니다. 이 사이트가 직접 보관하는 이용자 개인정보는 없습니다.
      </p>
    ),
  },
  {
    title: "6. 이용자의 권리",
    body: (
      <p>
        개인정보 처리에 관한 열람·정정·삭제 요청은{" "}
        <a href="/contact" className="text-primary hover:underline">문의 페이지</a>
        {" "}안내에 따라 카카오톡 채널(@infoepic)로 접수하며, 확인 후 처리 결과를 회신합니다.
      </p>
    ),
  },
  {
    title: "7. 외부 링크",
    body: (
      <p>
        사이트의 글에는 외부 서비스로 연결되는 링크가 포함될 수 있습니다. 연결된 사이트에서
        발생하는 개인정보 처리에 대해서는 해당 사이트의 방침이 적용되며, 이 사이트는 이에 대한
        책임을 지지 않습니다.
      </p>
    ),
  },
  {
    title: "8. 방침 변경",
    body: (
      <p>
        이 방침이 변경될 경우 변경 내용과 시행일을 이 페이지에 게시합니다. 중요한 변경이 있는
        경우에는 시행일 최소 7일 전에 공지합니다.
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
          <p className="text-sm text-muted-foreground">시행일: {EFFECTIVE_DATE}</p>
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
