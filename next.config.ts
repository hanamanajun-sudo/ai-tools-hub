import type { NextConfig } from "next";

// 도메인 통합: 한 Worker가 apex와 구 서브도메인을 함께 서빙하므로
// 호스트 헤더로 구분해 구 서브도메인 요청만 apex로 넘긴다.
const LEGACY_HOST = { type: "host" as const, value: "ai.ktoolu.com" };

// 폐기한 섹션(/news, /glossary)은 리디렉션 대상에서 제외한다 —
// apex에 없는 경로라 301로 보내면 "404로 가는 리디렉션"이 되어
// 그냥 404보다 나쁜 신호가 된다. 이 경로들은 app/ 아래 라우트 핸들러가 410으로 받는다.
const EXCEPT_GONE = "/:path((?!news|glossary)(?:.*))";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 통합하면서 블로그 경로가 바뀌었다 (/blog → /posts).
      // 단순 301이면 apex에서 404가 되므로 경로를 매핑해준다.
      {
        source: "/blog",
        has: [LEGACY_HOST],
        destination: "https://ktoolu.com/posts",
        permanent: true,
      },
      {
        source: "/blog/:path*",
        has: [LEGACY_HOST],
        destination: "https://ktoolu.com/posts/:path*",
        permanent: true,
      },
      {
        source: "/",
        has: [LEGACY_HOST],
        destination: "https://ktoolu.com/",
        permanent: true,
      },
      {
        source: EXCEPT_GONE,
        has: [LEGACY_HOST],
        destination: "https://ktoolu.com/:path",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
