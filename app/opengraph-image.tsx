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

export default async function OpengraphImage() {
  const allText = [TITLE, SUBTITLE, ...TAGS, "AI"].join("");
  const [regular, bold] = await Promise.all([
    loadKoreanFont(allText, 400),
    loadKoreanFont(allText, 700),
  ]);

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
    }
  );
}
