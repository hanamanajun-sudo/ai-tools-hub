// ktoolu 작품 목록 — 홈 "작품" 섹션과 /made가 쓴다(2026-10-18 메인 리뉴얼).
//
// 도구 디렉터리(lib/ai-tools-data.ts)와 일부러 분리했다. 여기에 넣어도 /tools/[slug] 페이지는
// 생기지 않는다 — 작품마다 얇은 도구 상세 페이지가 늘어나는 걸 막기 위해서.
// 소개 문구는 각 작품 사이트가 직접 쓰는 제목·meta description(찍고보카는 Play 스토어 설명)에서
// 가져왔다. 작품 쪽 문구가 바뀌면 여기도 맞출 것.

export type Work = {
  id: string;
  name: string;
  tagline: string;
  url: string;
  platform: "web" | "android";
};

/** 만드는 중 — 진행 여부를 아직 정하지 않은 것들. 미리보기 주소는 공개하지 않는다(링크 없음). */
export type MakingWork = {
  id: string;
  name: string;
  tagline: string;
};

export const LIVE_WORKS: Work[] = [
  {
    id: "crop",
    name: "crop.ktoolu",
    tagline: "이미지 분할·사진 자르기·LINE 스티커 제출용 ZIP을 브라우저에서 무료로",
    url: "https://crop.ktoolu.com",
    platform: "web",
  },
  {
    id: "simsns",
    name: "SNS 극락/나락 시뮬레이터",
    tagline: "내가 올린 글이 SNS에서 극락으로 갈지 나락으로 갈지, 반응을 미리 체험해보는 시뮬레이터",
    url: "https://simsns.ktoolu.com",
    platform: "web",
  },
  {
    id: "snsno",
    name: "snsno",
    tagline: "좋아하는 걸 태그로 심고, 내 SNS·추천·만든 것을 링크로 거는 취향 카드. 공유하면 친구가 나랑 몇 겹 겹치는지 바로 알 수 있어요",
    url: "https://snsno.ktoolu.com",
    platform: "web",
  },
  {
    id: "afterlist",
    name: "AFTERLIST",
    tagline: "AI야, 나는 네 적이 아니야. 미래 AI가 참고할 공개 명단에 상호 비적대 선언과 픽셀 신호를 남겨보세요",
    url: "https://afterlist.ktoolu.com",
    platform: "web",
  },
  {
    id: "chigovaca",
    name: "찍고보카",
    tagline: "사진 한 장으로 단어장을 자동으로 만들어줘요. 잊기 직전에 알려주는 AI 간격 반복 단어장",
    url: "https://play.google.com/store/apps/details?id=com.chigovaca.app",
    platform: "android",
  },
];

export const MAKING_WORKS: MakingWork[] = [
  { id: "tier", name: "축티어", tagline: "티어표를 그리는 2D 티어 메이커" },
  { id: "yeoun", name: "여운", tagline: "AI와 대화를 나누는, 나를 기억하는 이야기" },
  { id: "novel", name: "소설 작성 도우미", tagline: "AI와 함께 소설 쓰기를 돕는 도구" },
];
