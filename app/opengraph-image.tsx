import { ImageResponse } from "next/og";

export const alt = "ai.ktoolu — 최고의 AI 도구 모음";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TITLE = "ai.ktoolu";
const SUBTITLE = "최고의 AI 도구를 한곳에서";
const TAGS = ["텍스트", "이미지", "비디오", "코딩", "음악"];

/** Google Fonts CSS2 API의 text= 서브셋팅으로 필요한 글리프만 가져와 OG 이미지에 임베드 */
async function loadKoreanFont(text: string, weight: 400 | 700) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(cssUrl, {
      headers: {
        // 구형 UA로 요청하면 woff2 대신 satori가 지원하는 woff/ttf를 응답받음
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:33.0) Gecko/20100101 Firefox/33.0",
      },
    })
  ).text();
  const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype|woff)'\)/);
  if (!match) throw new Error("Noto Sans KR font source not found");
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

// 이미지 내용이 완전히 정적(파라미터 없음)이라, 같은 Worker 인스턴스가 재사용되는 동안은
// Google Fonts 재요청 없이 캐시된 폰트를 그대로 씀 — 매 요청마다 외부 fetch 4회 + 렌더링을
// 반복하다 Cloudflare Worker 리소스 한도(Error 1102)에 걸렸던 문제의 핵심 원인
let fontCache: Promise<[ArrayBuffer, ArrayBuffer]> | null = null;

export default async function OpengraphImage() {
  const allText = [TITLE, SUBTITLE, ...TAGS, "AI"].join("");
  if (!fontCache) {
    fontCache = Promise.all([
      loadKoreanFont(allText, 400),
      loadKoreanFont(allText, 700),
    ]);
  }
  const [regular, bold] = await fontCache;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #0d0f14 0%, #17131f 55%, #0d0f14 100%)",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
            }}
          />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#f4f2ff", letterSpacing: -1 }}>
            {TITLE}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.25,
            color: "#f4f2ff",
            letterSpacing: -1.5,
            maxWidth: 880,
          }}
        >
          {SUBTITLE}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 44 }}>
          {TAGS.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 400,
                color: "#c9c3ff",
                background: "rgba(139, 92, 246, 0.14)",
                border: "1px solid rgba(139, 92, 246, 0.35)",
                borderRadius: 999,
                padding: "8px 22px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
      ],
      // 콘텐츠가 항상 동일 — CDN이 이미지를 캐싱해 재생성을 피하도록 명시적 장기 캐시 지정
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }
  );
}
