import { ExternalLink } from "lucide-react";
import { OutboundLink } from "@/components/outbound-link";
import type { MakingWork, Work } from "@/lib/works";

const PLATFORM_LABEL: Record<Work["platform"], string> = {
  web: "웹",
  android: "Android 앱",
};

function hostLabel(work: Work) {
  return work.platform === "android" ? "Google Play" : work.url.replace(/^https?:\/\//, "");
}

/** 운영 중인 작품 카드 — 누르면 작품(서브도메인·스토어)으로 바로 이동 */
export function WorkCard({ work, source }: { work: Work; source: string }) {
  return (
    <OutboundLink
      href={work.url}
      eventName="made_card_click"
      eventParams={{ tool_id: work.id, tool_name: work.name, source }}
      className="group flex h-full flex-col rounded-xl border border-border/50 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          운영 중
        </span>
        <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {PLATFORM_LABEL[work.platform]}
        </span>
      </div>
      <h3 className="mb-1.5 font-semibold text-foreground transition-colors group-hover:text-primary">{work.name}</h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground" style={{ wordBreak: "keep-all" }}>
        {work.tagline}
      </p>
      <span className="inline-flex items-center gap-1 text-xs text-primary">
        {hostLabel(work)}
        <ExternalLink className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </OutboundLink>
  );
}

/** 만드는 중 카드 — 링크 없음(미리보기 주소 비공개) */
export function MakingCard({ work }: { work: MakingWork }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-dashed border-border/60 bg-muted/20 p-5">
      <span className="mb-3 w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        만드는 중
      </span>
      <h3 className="mb-1.5 font-semibold text-foreground">{work.name}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground" style={{ wordBreak: "keep-all" }}>
        {work.tagline}
      </p>
    </div>
  );
}
