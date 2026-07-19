"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function PromptShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/prompts/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOnX() {
    const url = `${window.location.origin}/prompts/${slug}`;
    const text = encodeURIComponent(`${title}\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/30">
      <span className="text-xs text-muted-foreground font-medium">공유하기</span>
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {copied
          ? <><Check className="h-3.5 w-3.5 text-green-500" /><span className="text-green-500">복사됨</span></>
          : <><Link2 className="h-3.5 w-3.5" /> 링크 복사</>
        }
      </button>
      <button
        onClick={shareOnX}
        className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <span className="font-bold text-[12px]">𝕏</span> 퍼가기
      </button>
    </div>
  );
}
