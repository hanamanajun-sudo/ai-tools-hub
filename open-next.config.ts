import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// 기본값(캐시 override 없음)은 정적 페이지 캐시 조회에 버그가 있어, 같은 경로에
// 동시 요청이 여러 개 들어오면 첫 요청만 성공하고 나머지는 락이 안 풀려 타임아웃까지
// 매달린다(실측: Error 1102). 그래서 override는 반드시 둔다.
// R2 캐시는 결제 리스크 때문에 R2를 끄면서 배포가 막혀(2026-10-03) 정적 에셋 캐시로 교체 —
// 읽기 전용이지만 시간 기반 재검증(revalidate)을 전부 뺐기 때문에 이 사이트엔 충분하다.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
