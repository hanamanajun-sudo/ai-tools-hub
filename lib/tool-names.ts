/* 한국어 검색어 매핑 (Google Trends 기반) — 툴 상세/카테고리 페이지 공용 */
export const KO_TOOL_NAMES: Record<string, { h1: string; short: string }> = {
  chatgpt:      { h1: "챗GPT(ChatGPT)", short: "챗GPT" },
  claude:       { h1: "Claude(클로드)", short: "Claude" },
  deepseek:     { h1: "DeepSeek(딥시크)", short: "DeepSeek" },
  gemini:       { h1: "제미나이(Gemini)", short: "제미나이" },
  grok:         { h1: "그록(Grok)", short: "그록" },
  midjourney:   { h1: "미드저니(Midjourney)", short: "미드저니" },
  dalle3:       { h1: "달리(DALL-E 3)", short: "달리" },
  sora:         { h1: "소라(Sora)", short: "소라" },
  capcut:       { h1: "캡컷(CapCut)", short: "캡컷" },
  "auto-gpt":   { h1: "오토GPT(AutoGPT)", short: "오토GPT" },
  "image-nanobana": { h1: "제미니(Image Nanobana)", short: "제미니" },
};

export function getKoName(tool: { id: string; name: string }): { h1: string; short: string } {
  return KO_TOOL_NAMES[tool.id] ?? { h1: tool.name, short: tool.name };
}

export function getToolShortName(tool: { id: string; name: string }): string {
  return KO_TOOL_NAMES[tool.id]?.short ?? tool.name;
}
