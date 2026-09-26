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
// 빠진 것(갱신하면 다시 넣을 것): cursor(GPT-4o), deepseek(R1·2025년),
// perplexity(GPT-4), kling(2.0·2024년), runway(Gen-2·3).
// chatgpt·claude·gemini는 2026-09-26 공식 요금제 페이지 기준으로 갱신 후 복귀.
// 나머지 남긴 것도 가격은 검증 전 — 모델 세대만 기준으로 거른 1차 필터다.
const PRIORITY_TOOL_IDS = [
  // 공식 페이지 기준 갱신 완료
  "chatgpt", "claude", "gemini",
  "midjourney", "seedance", "grok", "n8n", "hermes",
  // 이미 색인됐던 페이지
  "bolt",
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
