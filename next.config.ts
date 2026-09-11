import type { NextConfig } from "next";

// 구 서브도메인 → apex 리디렉션은 Cloudflare Redirect Rule(엣지)에서 처리한다.
// next.config redirects로 하면 generateStaticParams를 쓰는 라우트
// (/tools/[slug], /category/[category])에서 OpenNext가 500을 낸다.
// 폐기 섹션(/news, /glossary)은 Redirect Rule에서 제외돼 이 앱까지 도달하고,
// app/ 아래 catch-all 라우트 핸들러가 410으로 받는다.
const nextConfig: NextConfig = {};

export default nextConfig;
