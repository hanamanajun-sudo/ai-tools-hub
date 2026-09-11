// 폐기한 용어집 섹션. 뉴스에 딸린 용어 해설이라 함께 제거했다.
export function GET() {
  return new Response("410 Gone — 이 섹션은 영구 삭제되었습니다.", {
    status: 410,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
