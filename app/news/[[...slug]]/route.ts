// 폐기한 AI 뉴스 섹션(189편). 그냥 404로 두는 대신 410으로 영구 삭제를 명시한다 —
// 2026-08 infoepic 서브도메인 정리 때와 같은 방식.
export function GET() {
  return new Response("410 Gone — 이 섹션은 영구 삭제되었습니다.", {
    status: 410,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
