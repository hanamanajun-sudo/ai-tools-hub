import { MetadataRoute } from "next";

// 2026-10-17: 애드센스가 ktoolu.com을 "가치가 별로 없는 콘텐츠"로 반려했다.
// <meta name="robots" content="noindex">는 구글 검색 색인만 막을 뿐 애드센스 자체 심사 크롤러
// (Mediapartners-Google)의 품질 크롤링은 막지 못한다. robots.txt Disallow는 모든 크롤러가 지키므로
// 얇은 템플릿형 페이지는 여기서 통째로 막는다. URL은 그대로 둔다(noindex도 유지).
//
// - /prompts: 30개 전부 본문 800자 미만
// - /tools: 2026-10-18 콘셉트 재정의("작품이 주인공")로 AI 도구 디렉터리를 접으면서 상세 페이지 전체를 막는다.
//   예전엔 핵심 아닌 도구 36개만 개별 경로로 막았으나(핵심 18개는 열어 둠), 핵심 페이지도 같은
//   템플릿형 도구 소개라 새 콘셉트에서 존재 이유가 없다. /tools 접두어 하나로 전부 막힌다.
// 작품 소개는 /made, 글은 /posts가 맡는다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/prompts", "/tools"],
    },
    sitemap: "https://ktoolu.com/sitemap.xml",
  };
}
