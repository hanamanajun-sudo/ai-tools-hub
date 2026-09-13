import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// 기본값(캐시 override 없음)은 정적 페이지 캐시 조회에 버그가 있어, 같은 경로에
// 동시 요청이 여러 개 들어오면 첫 요청만 성공하고 나머지는 락이 안 풀려 타임아웃까지
// 매달린다(실측: Error 1102, wrangler tail에서 "Worker's code had hung" 확인).
// R2 기반 캐시로 바꿔서 그 락 문제를 없앤다. 큐(Durable Object, 유료 플랜 필요)는
// 설정하지 않음 — 시간 기반 재검증(revalidate)을 전부 제거해 필요 없다.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
