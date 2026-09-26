import { MetadataRoute } from "next";
import { getPosts } from "@/lib/notion";

const BASE_URL = "https://ktoolu.com";

// revalidate(시간 기반 ISR) 제거 이유는 app/page.tsx 주석 참고 —
// 큐 없이 쓰면 동시 요청에서 재검증이 멈춘다(Error 1102 실측 재현).
// dynamic API가 없어 revalidate만 빼면 빌드 시점에 얼어붙으므로 force-dynamic 명시.
export const dynamic = "force-dynamic";

// sitemap은 "전부"가 아니라 "구글이 먼저 봐줬으면 하는 것"만 담는다.
// 2026-09 Search Console 기준 색인 8개 / 발견됨-색인 안 됨 145개 — 새 도메인이
// 크롤 우선순위를 못 받는 상태라, 템플릿형 도구 54개·프롬프트 31개·카테고리 목록을
// 한꺼번에 밀어 넣지 않는다. 실제로 색인된 유형(직접 써본 글, 핵심 도구)만 남겼다.
// 빠진 페이지도 사이트 안 링크로는 그대로 발견·접근된다. 색인이 붙으면 다시 늘릴 것.
//
// 2026-09-26: 내용이 몇 세대 전 모델을 현재형으로 적고 있는 도구는 갱신 전까지 뺐다.
// 색인 우선 목록에 낡은 페이지를 올리면 새 도메인에서 낡은 내용으로 재평가받는다.
// 같은 날 도구 페이지 정리: 핵심 도구(CORE_TOOL_IDS)만 관리하고 나머지는 간략 모드 + noindex.
// 여기엔 핵심 중에서도 내용 검증이 끝난 것만 넣는다.
// 2026-09-26 공식 페이지(또는 복수 보도 교차 확인)로 갱신한 핵심 도구 18개를 넣었다.
// CORE_TOOL_IDS 20개 중 남은 것은 자체 제작 crop·story(항상 최신).
const PRIORITY_TOOL_IDS = [
  // 갱신 완료
  "chatgpt", "claude", "gemini", "muse",
  "cursor", "perplexity", "deepseek", "capcut", "suno", "eleven-labs", "manus", "kling", "veo",
  "midjourney", "seedance", "grok", "n8n", "hermes",
  // 자체 제작
  "crop", "story",
];

async function getIndexablePosts() {
  try {
    const posts = await getPosts();
    return posts.filter((p) => !p.noIndex);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getIndexablePosts();

  // lastModified는 실제 날짜를 아는 글에만 넣는다. 정적 페이지에 new Date()를 넣으면
  // 매 요청마다 전 URL이 "오늘 수정됨"으로 나가는 가짜 신선도 신호가 된다.
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    ...(post.publishedAt ? { lastModified: new Date(post.publishedAt) } : {}),
  }));

  const staticPaths = ["", "/posts", "/about", "/contact", "/privacy", "/story", "/guides/line-sticker-size"];
  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
  }));

  const toolPages: MetadataRoute.Sitemap = PRIORITY_TOOL_IDS.map((id) => ({
    url: `${BASE_URL}/tools/${id}`,
  }));

  return [...staticPages, ...postPages, ...toolPages];
}
