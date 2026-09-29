import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OutboundLink } from "@/components/outbound-link";
import { aiTools } from "@/lib/ai-tools-data";
import { breadcrumbJsonLd, safeJsonLd } from "@/lib/breadcrumb";

const BASE_URL = "https://ktoolu.com";

export const metadata: Metadata = {
  title: "ktoolu가 직접 만든 것 — ktoolu",
  description: "ktoolu가 직접 만들어 운영하는 무료 도구와 놀거리 모음입니다.",
  alternates: { canonical: `${BASE_URL}/made` },
};

// 등재 기준: madeByKtoolu 이면서 운영 중(status가 live)인 항목. 목록을 따로 관리하지 않고
// lib/ai-tools-data.ts의 데이터를 그대로 쓴다 — 새 서비스는 거기에 등록하면 여기에 나온다.
// 대기 중(waitlist)인 항목은 아직 열어볼 수 없어서 뺀다.
const madeTools = aiTools.filter((t) => t.madeByKtoolu && (t.status ?? "live") === "live");

export default function MadePage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "홈", url: BASE_URL },
    { name: "직접 만든 것", url: `${BASE_URL}/made` },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <SiteHeader />

      <main id="main-content" className="mx-auto max-w-3xl px-4 pb-16">
        <div className="pt-10 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">ktoolu가 직접 만든 것</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ktoolu가 직접 만들어 운영하는 무료 도구와 놀거리입니다. 카드를 누르면 바로 열어볼 수 있어요.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {madeTools.map((tool) => (
            <li key={tool.id}>
              <OutboundLink
                href={tool.url}
                eventName="made_card_click"
                eventParams={{ tool_id: tool.id, tool_name: tool.name }}
                className="group flex h-full flex-col rounded-xl border border-border/50 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-border"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {tool.name}
                  </h2>
                  <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                    운영 중
                  </span>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {tool.tagline ?? tool.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  {tool.url.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </OutboundLink>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
