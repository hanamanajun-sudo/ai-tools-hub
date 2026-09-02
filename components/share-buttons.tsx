"use client";

import { useEffect, useState } from "react";
import { Link2, Check, FileText } from "lucide-react";

/**
 * 카카오 JavaScript 키는 클라이언트에 노출되는 것이 정상인 공개 키다.
 * (카카오 개발자 콘솔에 등록된 도메인에서만 동작하도록 제한되므로 비밀값이 아님)
 */
const KAKAO_JS_KEY = "3746f855febf08a430921640054fb288";
const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js";

type KakaoSdk = {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: { sendDefault: (settings: Record<string, unknown>) => void };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const BTN_CLASS =
  "flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-500 hover:bg-amber-500/25 hover:border-amber-500/60 transition-colors cursor-pointer";

/**
 * 사이트 전역 공용 공유 버튼 — 링크 복사 + 본문 복사(옵션) + 카카오톡 + X 퍼가기.
 * `copyText`를 넘긴 페이지에서만 "본문 복사" 버튼이 나온다.
 */
export function ShareButtons({
  title,
  path,
  copyText,
  description,
}: {
  title: string;
  path: string;
  copyText?: string;
  description?: string;
}) {
  const [copied, setCopied] = useState<"link" | "body" | null>(null);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [kakaoError, setKakaoError] = useState(false);

  // 클릭 시점에 SDK를 받아오면 팝업 차단에 걸릴 수 있어서 미리 로드해 둔다.
  useEffect(() => {
    function initKakao() {
      const kakao = window.Kakao;
      if (!kakao) return;
      try {
        if (!kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);
        setKakaoReady(kakao.isInitialized());
      } catch {
        setKakaoReady(false);
      }
    }

    if (window.Kakao) {
      initKakao();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>("script[data-kakao-sdk]");
    if (!script) {
      script = document.createElement("script");
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.dataset.kakaoSdk = "true";
      document.body.appendChild(script);
    }
    script.addEventListener("load", initKakao);
    const target = script;
    return () => target.removeEventListener("load", initKakao);
  }, []);

  async function copy(text: string, kind: "link" | "body") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // 클립보드 권한 거부 등 — 조용히 무시
    }
  }

  function pageUrl() {
    return `${window.location.origin}${path}`;
  }

  function shareOnX() {
    const text = encodeURIComponent(`${title}\n${pageUrl()}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function shareOnKakao() {
    const kakao = window.Kakao;
    if (!kakao?.isInitialized()) return;
    const url = pageUrl();
    const link = { mobileWebUrl: url, webUrl: url };
    try {
      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description: description ?? "ai.ktoolu에서 확인하기",
          imageUrl: `${window.location.origin}/opengraph-image`,
          link,
        },
        buttons: [{ title: "자세히 보기", link }],
      });
    } catch {
      setKakaoError(true);
      setTimeout(() => setKakaoError(false), 2500);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border/30">
      <span className="text-xs text-muted-foreground font-medium">공유하기</span>

      <button onClick={() => copy(pageUrl(), "link")} className={BTN_CLASS}>
        {copied === "link" ? (
          <>
            <Check className="h-3.5 w-3.5 text-green-500" />
            <span className="text-green-500">복사됨</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" /> 링크 복사
          </>
        )}
      </button>

      {copyText && (
        <button onClick={() => copy(copyText, "body")} className={BTN_CLASS}>
          {copied === "body" ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">복사됨</span>
            </>
          ) : (
            <>
              <FileText className="h-3.5 w-3.5" /> 본문 복사
            </>
          )}
        </button>
      )}

      {kakaoReady && (
        <button
          onClick={shareOnKakao}
          className="flex items-center gap-1.5 rounded-lg border border-[#FEE500] bg-[#FEE500] px-3 py-1.5 text-xs font-bold text-[#191600] hover:brightness-95 transition-all cursor-pointer"
        >
          <KakaoIcon />
          {kakaoError ? "공유 실패" : "카카오톡"}
        </button>
      )}

      <button onClick={shareOnX} className={BTN_CLASS}>
        <span className="font-bold text-[12px]">𝕏</span> 퍼가기
      </button>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12 3C6.99 3 3 6.24 3 10.24c0 2.52 1.68 4.74 4.2 6.03l-.9 3.36c-.09.33.27.6.57.42l3.99-2.64c.36.03.75.06 1.14.06 5.01 0 9-3.24 9-7.23S17.01 3 12 3z" />
    </svg>
  );
}
