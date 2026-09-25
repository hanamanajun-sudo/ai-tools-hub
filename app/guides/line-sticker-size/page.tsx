import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ExternalLink, Scissors } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { breadcrumbJsonLd, safeJsonLd } from "@/lib/breadcrumb";

const BASE_URL = "https://ktoolu.com";
const PATH = "/guides/line-sticker-size";
const OFFICIAL_GUIDE = "https://creator.line.me/en/guideline/sticker/";
// 아래 수치는 공식 가이드라인을 직접 확인한 날짜 기준이다. 규격이 바뀌면 이 날짜와 표를 함께 갱신할 것.
const CHECKED_AT = "2026년 9월 25일";

export const metadata: Metadata = {
  title: "LINE 스티커(스탬프) 규격 총정리 — 크기·개수·파일 조건 | ktoolu",
  description:
    "LINE 크리에이터스 마켓 스티커 제출 규격을 한 표로 정리했습니다. 스티커 370x320, 대표 이미지 240x240, 탭 이미지 96x74, 8·16·24·32·40개, PNG·투명 배경·짝수 픽셀 등.",
  alternates: { canonical: `${BASE_URL}${PATH}` },
};

const SPEC_ROWS = [
  { item: "스티커 이미지", size: "최대 370 x 320 px", note: "1MB 이하" },
  { item: "대표 이미지 (main)", size: "240 x 240 px", note: "1MB 이하" },
  { item: "채팅방 탭 이미지 (tab)", size: "96 x 74 px", note: "1MB 이하" },
];

const RULES = [
  { label: "세트 개수", value: "8 · 16 · 24 · 32 · 40개 중 하나" },
  { label: "파일 형식", value: "PNG" },
  { label: "배경", value: "투명" },
  { label: "가로·세로 크기", value: "짝수 픽셀" },
  { label: "색상 모드", value: "RGB" },
  { label: "해상도", value: "72dpi 이상" },
  { label: "여백", value: "그림과 가장자리 사이 약 10px" },
  { label: "ZIP으로 한 번에 올릴 때", value: "전체 60MB 이하" },
];

const STEPS = [
  {
    title: "그림을 투명 배경 PNG로 준비",
    body: "배경이 흰색이면 채팅창에서 네모 박스처럼 보입니다. 그림 도구에서 배경을 투명으로 내보내세요. 크기는 규격보다 커도 괜찮습니다 — 다음 단계에서 맞춥니다.",
  },
  {
    title: "crop.ktoolu 스티커 헬퍼에 한꺼번에 올리기",
    body: "여러 장을 한 번에 끌어다 놓을 수 있습니다. 370x320 캔버스에 녹색 점선(10px 안전 여백)이 보이고, 자동 맞춤으로 여백 안에 맞춰집니다.",
  },
  {
    title: "순서 정리하고 대표 이미지 지정",
    body: "드래그로 순서를 바꾸고, 세트를 대표할 스티커를 더블클릭으로 지정합니다. 개수가 8·16·24·32·40이 아니면 다운로드할 때 알려줍니다.",
  },
  {
    title: "ZIP 한 번에 받기",
    body: "스티커 이미지 전체와 함께 대표 이미지(240x240), 탭 이미지(96x74)가 자동으로 만들어져 들어갑니다. 크기를 따로 줄여 저장할 필요가 없습니다.",
  },
];

const MISTAKES = [
  "대표 이미지를 스티커 크기(370x320) 그대로 올림 — 대표 이미지는 240x240입니다",
  "배경을 흰색으로 둠 — 투명이어야 합니다",
  "개수를 7개나 10개로 맞춤 — 8의 배수(최대 40)만 허용됩니다",
  "그림이 가장자리에 딱 붙음 — 약 10px 여백을 두세요",
  "홀수 픽셀(예: 369x320)로 저장 — 가로·세로 모두 짝수여야 합니다",
];

export default function LineStickerSizeGuide() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "홈", url: BASE_URL },
    { name: "crop.ktoolu", url: `${BASE_URL}/tools/crop` },
    { name: "LINE 스티커 규격 총정리", url: `${BASE_URL}${PATH}` },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-3xl px-4 pb-16">
        <header className="pt-10 pb-8">
          <p className="text-xs font-semibold text-violet-400 mb-3">무료 가이드 · 공식 규격 {CHECKED_AT} 확인</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4 leading-tight" style={{ wordBreak: "keep-all" }}>
            LINE 스티커(스탬프) 규격 총정리
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
            LINE 크리에이터스 마켓에 스티커를 제출할 때 필요한 크기·개수·파일 조건을 한 곳에 모았습니다.
            규격이 하나라도 어긋나면 제출이 막히니, 올리기 전에 이 표로 한 번 점검하세요.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">이미지 크기</h2>
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-semibold text-foreground">이미지</th>
                  <th className="px-4 py-3 font-semibold text-foreground">크기</th>
                  <th className="px-4 py-3 font-semibold text-foreground">용량</th>
                </tr>
              </thead>
              <tbody>
                {SPEC_ROWS.map((r) => (
                  <tr key={r.item} className="border-t border-border/40">
                    <td className="px-4 py-3 text-foreground" style={{ wordBreak: "keep-all" }}>{r.item}</td>
                    <td className="px-4 py-3 font-mono text-foreground whitespace-nowrap">{r.size}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">공통 조건</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RULES.map((r) => (
              <div key={r.label} className="rounded-xl border border-border/50 bg-card p-4">
                <dt className="text-xs text-muted-foreground mb-1">{r.label}</dt>
                <dd className="text-sm font-semibold text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">자주 하는 실수</h2>
          <ul className="space-y-2">
            {MISTAKES.map((m) => (
              <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                {m}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-2">규격 맞추기를 무료로 한 번에</h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            위 조건을 하나씩 맞추는 대신, ktoolu가 만든 무료 도구 crop.ktoolu로 한 번에 처리할 수 있습니다.
            가입이 없고, 이미지는 서버로 올라가지 않고 브라우저 안에서만 처리됩니다.
          </p>
          <ol className="space-y-4 mb-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-xl border border-border/50 bg-card p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://crop.ktoolu.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Scissors className="h-4 w-4" />
              crop.ktoolu 무료로 쓰기
            </a>
            <Link
              href="/tools/crop"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary/50 transition-colors"
            >
              도구 자세히 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-muted/20 p-5 text-sm text-muted-foreground leading-relaxed">
          <p className="mb-2">
            이 페이지의 수치는 {CHECKED_AT} LINE 크리에이터스 마켓 공식 가이드라인을 확인해 정리했습니다.
            규격은 바뀔 수 있으니 제출 전에 공식 문서를 한 번 더 확인하세요. 움직이는 스티커와 이모티콘은 규격이 다릅니다.
          </p>
          <a
            href={OFFICIAL_GUIDE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            LINE Creators Market 스티커 가이드라인 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
