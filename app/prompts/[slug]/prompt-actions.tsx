"use client";

import { useMemo, useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { extractVariables, fillTemplate, incrementPromptCopy } from "@/lib/prompts";
import { trackEvent } from "@/lib/analytics";

/** ChatGPT·Perplexity만 URL 프리필을 공식 지원. Claude(2025-10 제거)·Gemini(미지원)는 제외 */
const LAUNCH_TARGETS = [
  { tool: "chatgpt", label: "ChatGPT에서 실행", url: (text: string) => `https://chatgpt.com/?q=${encodeURIComponent(text)}` },
  { tool: "perplexity", label: "Perplexity에서 실행", url: (text: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(text)}` },
];

export function PromptActions({ slug, content }: { slug: string; content: string }) {
  const variables = useMemo(() => extractVariables(content), [content]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const filled = useMemo(() => fillTemplate(content, values), [content, values]);
  const hasEmptyVariables = variables.some((v) => !values[v]?.trim());

  function handleCopy() {
    navigator.clipboard.writeText(filled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent("prompt_copy", { prompt_slug: slug, filled: !hasEmptyVariables });
    incrementPromptCopy(slug);
  }

  function handleLaunch(tool: string, buildUrl: (text: string) => string) {
    trackEvent("prompt_launch", { prompt_slug: slug, tool });
    window.open(buildUrl(filled), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      {variables.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">변수 채우기</p>
          {variables.map((v) => (
            <div key={v}>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor={`var-${v}`}>
                {v}
              </label>
              <input
                id={`var-${v}`}
                type="text"
                value={values[v] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                placeholder={v}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring/50"
              />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          {variables.length > 0 ? "완성 미리보기" : "프롬프트"}
        </p>
        <pre className="whitespace-pre-wrap break-words text-sm text-foreground/85 leading-relaxed font-sans">{filled}</pre>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {copied ? <><Check className="h-4 w-4" /> 복사됨</> : <><Copy className="h-4 w-4" /> 프롬프트 복사</>}
        </button>
        {LAUNCH_TARGETS.map((t) => (
          <button
            key={t.tool}
            onClick={() => handleLaunch(t.tool, t.url)}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {t.label} <ExternalLink className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      {variables.length > 0 && hasEmptyVariables && (
        <p className="text-xs text-muted-foreground/70">변수를 채우지 않으면 {"{{변수}}"} 표시가 그대로 복사·전송됩니다.</p>
      )}
    </div>
  );
}
