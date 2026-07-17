// AI 뉴스 개별 페이지용 슬러그 + 품질 게이트 유틸
// 슬러그는 `제목-{id}` 형태. 제목이 바뀌어도 뒤의 id로 안정적으로 조회한다.

export type NewsSlugInput = {
  id: number;
  title: string;
};

export type NewsIndexInput = {
  is_visible: boolean;
  summary: string | null;
  explanation: string | null;
  importance: string | null;
  tags: string[] | null;
};

/** `제목-{id}` 형태의 SEO 슬러그 생성 (한글 유지) */
export function newsSlug(item: NewsSlugInput): string {
  const base = item.title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // 한글 포함 문자/숫자/공백/하이픈만 남김
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-+$/, ""); // slice로 잘린 끝의 하이픈 제거
  return base ? `${base}-${item.id}` : `${item.id}`;
}

/** 슬러그 끝의 `-{id}`에서 숫자 id 추출 */
export function parseNewsId(slug: string): number | null {
  const m = decodeURIComponent(slug).match(/(\d+)$/);
  return m ? Number(m[1]) : null;
}

/**
 * 품질 게이트: 인덱싱(sitemap 포함 + noindex 미부여) 대상인지 판별.
 * 편집자 픽이거나, summary·explanation·importance를 모두 갖춘 알찬 기사만 통과.
 */
export function isIndexable(item: NewsIndexInput): boolean {
  if (!item.is_visible) return false;
  const isPick = item.tags?.includes("편집자픽") ?? false;
  const isRich = Boolean(item.summary && item.explanation && item.importance);
  return isPick || isRich;
}
