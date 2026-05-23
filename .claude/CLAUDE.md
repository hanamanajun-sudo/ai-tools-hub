# AI Tools Hub 프로젝트 지시어

## 프로젝트 개요
AI 도구들을 한눈에 볼 수 있는 종합 디렉토리 사이트.
한국어 기반, 향후 일본어/영어 다국어 지원 예정.

---

## 기술 스택
- **프레임워크**: Next.js (App Router)
- **스타일링**: Tailwind CSS + shadcn/ui
- **DB**: Supabase (서울 리전, 무료 플랜)
  - Project URL: https://wgnlsmiicynpizkbzyvu.supabase.co
  - 테이블: `reviews` (id, tool_slug, rating, comment, created_at, hidden)
- **배포**: 현재 Vercel Hobby → Cloudflare Pages로 이전 예정
- **현재 URL**: https://ai-tools-hub-inky-theta.vercel.app
- **GitHub**: https://github.com/hanamanajun-sudo/ai-tools-hub
- **로컬 경로**: C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\ai-tools-hub

---

## Claude Code 스킬 & MCP
세션 시작 시 `claude-code-setup`을 먼저 실행해서 환경 자동 설정해줘.
그 이후 작업 진행 중 추가 스킬/MCP가 필요하면 그때그때 설치하고 진행해줘.

---

## 현재 구현 완료된 기능
1. **메인 페이지**: AI 툴 40개 카드, 카테고리 필터(텍스트/이미지/비디오/코딩/음악/기타), 실시간 검색
2. **개별 툴 상세 페이지**: /tools/[slug] 동적 라우팅, 40개 정적 페이지
3. **별점 & 코멘트**: Supabase 연동, 1-5점 별점, 500자 코멘트, 평균 별점 표시
4. **관리자 페이지**: /admin, 비밀번호 인증, 리뷰 숨기기/삭제, 통계
5. **다크모드**: 라이트모드 기본 + 다크모드 토글
6. **SEO**: sitemap.xml, robots.txt, 각 페이지별 메타태그, Google Search Console 등록 완료

---

## 파일 구조
```
ai-tools-hub/
├── app/
│   ├── layout.tsx          → 전체 레이아웃, 다크모드, Google 메타태그
│   ├── page.tsx            → 메인 페이지
│   ├── admin/              → 관리자 페이지
│   ├── tools/[slug]/       → 개별 툴 상세 페이지
│   ├── sitemap.ts          → 자동 sitemap 생성
│   └── robots.ts           → robots.txt
├── components/
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui/ (badge, button, card, input)
└── lib/
    ├── ai-tools-data.ts    → AI 툴 데이터 40개
    ├── supabase.ts         → Supabase 클라이언트
    └── utils.ts
```

---

## npm 패키지
새 기능 추가 시 필요한 패키지를 먼저 설치하고 코드 작성해줘.
```bash
# Cloudflare 이전 시 필요
npm install @opennextjs/cloudflare wrangler --save-dev

# 향후 기능별 필요 패키지 (해당 단계에서 설치)
# 이미지 최적화: sharp
# 뉴스/RSS 수집: rss-parser
# 마크다운 블로그: gray-matter, remark, rehype
# Notion CMS 연동: @notionhq/client
```

---

## 🚨 작업 우선순위

### 1단계: Vercel → Cloudflare Pages 이전
- @opennextjs/cloudflare 사용
- Supabase 연결 그대로 유지
- 환경변수 Cloudflare에 새로 설정
- Google Search Console 도메인 변경 반영
- ❌ Vercel 전용 서비스(KV, Edge Config, Blob) 절대 사용 금지

### 2단계: 컨텐츠 볼륨 업
- 기존 40개 AI 툴 설명 보강 (기능, 장단점, 가격, 사용법 상세화)
- 각 툴 로고/스크린샷 추가
- 저품질로 검색 제외 되지 않게 해야함

### 3단계: 추가 컨텐츠 기능 (이전+볼륨업 이후 논의)

#### 3-1) 블로그 글 섹션
- Notion CMS 연동 방안 검토
- /blog 라우트 추가

#### 3-2) AI 툴 업데이트 자동 수집
- RSS 피드, 공식 블로그 크롤링 방법 조사
- 무료/유료 옵션 비교

#### 3-3) AI 뉴스 자동 수집 & 게시
- 무료 수집 가능 여부 확인 (NewsAPI, RSS 등)
- AI 편집 후 게시하는 에디터 사이트 내장 가능 여부
- /news 라우트 추가

---

## 미래 로드맵
- 로그인 기능 (Supabase Auth)
- AI 툴 비교 페이지
- 프롬프트 공유 섹션
- 일본어/영어 다국어 (i18n)
- 도메인 구매 및 연결
- 수익화: 애드센스, 어필리에이트 링크, 구독제

---

## 주의사항
- 한국어로 응답해줘
- 초보자 수준에 맞춰 설명해줘
- 벤더 락인 방지: 플랫폼 독립적인 코드 유지
- 작은 단계로 나눠서 진행하고, 각 단계 완료 시 확인받고 다음 단계로
- 새 기능 추가 시 npm 패키지 먼저 설치 후 코드 작성
