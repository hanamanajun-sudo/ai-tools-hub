import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTop } from "@/components/scroll-to-top";
import Script from "next/script";
import "./globals.css";

// 한글 타이포그래피 전용 — Geist는 라틴 전용이라 한글은 시스템 폴백 폰트로 렌더링되던 문제 해결
const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ktoolu.com"),
  other: {
    "google-site-verification": "X3wLx-M7XBhDQNx05evWnSZeDGDmn-ETAPwgnp9O1jc",
    "google-adsense-account": "ca-pub-6443201130119317",
    // 도메인 통합 기간에는 한 코드베이스가 apex와 구 서브도메인 양쪽을 서빙한다.
    // 네이버는 메타 태그로 소유 확인을 하므로 두 토큰을 모두 남겨야 한쪽 인증이 끊기지 않는다
    // (구글은 apex가 DNS 기반 도메인 속성이라 태그와 무관).
    "naver-site-verification": [
      "e6397e836d51aa8ac6451a90eb94e809754ea940", // 구 서브도메인(ai 호스트) 속성
      "8a1a558c4ea1d19d9657d399ff82baf19d581d21", // apex 속성
    ],
  },
  title: "ktoolu - 최고의 AI 도구 모음",
  description: "텍스트, 이미지, 비디오, 코딩, 음악 등 최고의 AI 도구들을 한곳에서 탐색하세요.",
  openGraph: {
    title: "ktoolu - 최고의 AI 도구 모음",
    description: "텍스트, 이미지, 비디오, 코딩, 음악 등 최고의 AI 도구들을 한곳에서 탐색하세요.",
    siteName: "ktoolu",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "ktoolu - 최고의 AI 도구 모음",
    description: "텍스트, 이미지, 비디오, 코딩, 음악 등 최고의 AI 도구들을 한곳에서 탐색하세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${pretendard.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <ScrollToTop />
        {/* AdSense 사이트 확인·자동광고용 스크립트. React 사이트에서 head의 async 스크립트는
            하이드레이션과 경쟁해 광고가 사라지므로(#418/#423) GA4와 같이 afterInteractive로 둔다.
            광고 단위는 아직 배치하지 않았다. 계정 ID는 public/ads.txt의 pub ID와 같아야 한다. */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6443201130119317"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-L1ZKP1983B" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-L1ZKP1983B');`}
        </Script>
      </body>
    </html>
  );
}
