import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  other: {
    "google-site-verification": "X3wLx-M7XBhDQNx05evWnSZeDGDmn-ETAPwgnp9O1jc",
    "naver-site-verification": "e6397e836d51aa8ac6451a90eb94e809754ea940",
  },
  title: "ai.ktoolu - 최고의 AI 도구 모음",
  description: "텍스트, 이미지, 비디오, 코딩, 음악 등 최고의 AI 도구들을 한곳에서 탐색하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
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
