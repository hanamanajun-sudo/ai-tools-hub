import { NextRequest, NextResponse } from "next/server";

// 도메인 통합: 구 서브도메인으로 들어온 요청을 apex로 넘긴다.
// 한 Worker가 두 호스트를 서빙하므로 호스트 헤더로 구분한다.
const LEGACY_HOST = "ai.ktoolu.com";
const APEX = "https://ktoolu.com";

// 폐기한 섹션. 리디렉션 대상에서 빼야 한다 — apex에는 이 경로가 없어서
// 301로 보내면 "404로 가는 리디렉션"이 되고, 그건 그냥 404보다 나쁜 신호다.
// 명시적 410으로 "영구 삭제"를 알린다.
const GONE_SECTIONS = /^\/(news|glossary)(\/|$)/;

// 통합하면서 블로그 경로가 /blog → /posts 로 바뀌었다.
const RENAMED_PREFIX = { from: "/blog", to: "/posts" };

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (host !== LEGACY_HOST) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  if (GONE_SECTIONS.test(pathname)) {
    return new NextResponse("410 Gone — 이 페이지는 영구 삭제되었습니다.", {
      status: 410,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const mapped =
    pathname === RENAMED_PREFIX.from || pathname.startsWith(`${RENAMED_PREFIX.from}/`)
      ? RENAMED_PREFIX.to + pathname.slice(RENAMED_PREFIX.from.length)
      : pathname;

  return NextResponse.redirect(`${APEX}${mapped}${search}`, 301);
}

export const config = {
  // 정적 자산은 제외 — 어차피 301 후 apex에서 다시 받아간다.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
