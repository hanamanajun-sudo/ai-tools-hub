import { MetadataRoute } from "next";
import { aiTools, CORE_TOOL_IDS } from "@/lib/ai-tools-data";

// 2026-10-17: 애드센스가 ktoolu.com을 "가치가 별로 없는 콘텐츠"로 반려했다.
// 원인: <meta name="robots" content="noindex">는 구글 검색 색인만 막을 뿐, 애드센스
// 자체 심사 크롤러(Mediapartners-Google)의 품질 크롤링은 막지 못한다. 그래서 9월에
// noindex로 돌려놓은 핵심 외 도구 36개(설명 1~2문장 + 외부 링크뿐인 간략 모드, 예: 300자대)와
// 프롬프트 30개(전부 800자 미만, 2026-09-30 확인)가 애드센스 눈엔 그대로 보이고 있었다.
// robots.txt Disallow는 모든 크롤러가 지키므로 여기서 통째로 막는다. URL은 그대로 둔다
// (noindex도 유지 — Disallow는 크롤링 차단이지 색인 차단이 아니라서 검색 쪽 안전장치로 남겨둔다).
const THIN_TOOL_PATHS = aiTools
  .filter((t) => !CORE_TOOL_IDS.has(t.id))
  .map((t) => `/tools/${t.id}`);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/prompts", ...THIN_TOOL_PATHS],
    },
    sitemap: "https://ktoolu.com/sitemap.xml",
  };
}
