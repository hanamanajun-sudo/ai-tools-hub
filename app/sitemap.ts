import { MetadataRoute } from "next";
import { getPosts } from "@/lib/notion";

const BASE_URL = "https://ktoolu.com";

// revalidate(시간 기반 ISR) 제거 이유는 app/page.tsx 주석 참고 —
// 큐 없이 쓰면 동시 요청에서 재검증이 멈춘다(Error 1102 실측 재현).
// dynamic API가 없어 revalidate만 빼면 빌드 시점에 얼어붙으므로 force-dynamic 명시.
export const dynamic = "force-dynamic";

// sitemap은 "전부"가 아니라 "구글이 먼저 봐줬으면 하는 것"만 담는다.
// 2026-09 Search Console 기준 색인 8개 / 발견됨-색인 안 됨 145개 — 새 도메인이
// 크롤 우선순위를 못 받는 상태라, 템플릿형 페이지를 밀어 넣지 않고 직접 쓴 글만 남겼다.
// 빠진 페이지도 사이트 안 링크로는 그대로 발견·접근된다. 색인이 붙으면 다시 늘릴 것.
//
// 2026-10-18: 도구 상세 페이지(/tools/*)는 sitemap에서 전부 뺐다. 콘셉트 재정의("작품이 주인공")로
// AI 도구 디렉터리를 접으면서 robots.txt가 /tools 전체를 막기 때문 — 막은 URL을 sitemap에 올리면
// "색인해 달라"와 "크롤하지 마라"가 충돌한다. 작품은 /made, 글은 /posts가 색인 창구다.

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

  const staticPaths = ["", "/posts", "/about", "/contact", "/privacy", "/story", "/made", "/guides/line-sticker-size"];
  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
  }));

  return [...staticPages, ...postPages];
}
