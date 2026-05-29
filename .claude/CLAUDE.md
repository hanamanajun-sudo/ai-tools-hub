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
  - 테이블: `ai_news` (id, title, url, source, content_preview, summary, explanation, importance, tags, published_at, collected_at, is_visible)
  - ⚠️ ai_news.url 컬럼에 UNIQUE 제약조건 아직 없음 → 중복 저장 가능성 있음
- **배포**: GitHub push → GitHub Actions → Cloudflare Workers (자동 배포)
- **프로덕션 URL**: https://ai.ktoolu.com
- **Vercel**: 구 URL (ai-tools-hub-inky-theta.vercel.app) → ai.ktoolu.com으로 301 리다이렉트만 함, 실제 호스팅 아님
- **GitHub**: https://github.com/hanamanajun-sudo/ai-tools-hub
- **로컬 경로**: C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\ai-tools-hub

---

## Claude Code 스킬 & MCP
세션 시작 시 `claude-code-setup`을 먼저 실행해서 환경 자동 설정해줘.
그 이후 작업 진행 중 추가 스킬/MCP가 필요하면 그때그때 설치하고 진행해줘.

---

## 현재 구현 완료된 기능
1. **메인 페이지**: AI 툴 40개 카드, 카테고리 필터(텍스트/이미지/비디오/코딩/음악/기타), 실시간 검색
2. **개별 툴 상세 페이지**: /tools/[slug] 동적 라우팅, 40개 정적 페이지 (상세 설명/기능/장단점/가격 포함)
3. **별점 & 코멘트**: Supabase 연동, 1-5점 별점, 500자 코멘트, 평균 별점 표시
4. **관리자 페이지**: /admin, 비밀번호 인증, 리뷰 숨기기/삭제, 통계
5. **다크모드**: 라이트모드 기본 + 다크모드 토글
6. **SEO**: sitemap.xml, robots.txt, 각 페이지별 메타태그, Google Search Console 등록 완료
7. **블로그**: /blog, Notion CMS 연동, Notion REST API 직접 fetch (SDK 없이)
8. **AI 뉴스**: /news, Supabase ai_news 테이블, revalidate=300 (5분 캐시)

---

## n8n AI 뉴스 자동수집 워크플로우
- **워크플로우 파일**: C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\n8n-workflow-ai-news.json
- **실행 주기**: 6시간마다 (로컬 n8n)
- **뉴스 소스**: VentureBeat AI, TechCrunch AI, Ars Technica, MIT Tech Review, IEEE Spectrum, HackerNews API
- **AI 요약**: Ollama 로컬 실행 (http://127.0.0.1:11434)
- **현재 사용 모델**: hermes3:latest
- **추천 모델**: qwen2.5:7b (한국어 품질 더 좋음, 설치 완료)
- **설치된 Ollama 모델**: hermes3:latest, qwen2.5:7b, llama3.1:8b
- **저장**: Supabase ai_news 테이블
- **흐름**: RSS 수집 → AI 필터링/정렬 → 하나씩 처리 → 프롬프트 준비(ollamaRequest 문자열 생성) → Ollama 요약 → 결과 파싱 → Supabase 저장

### n8n 워크플로우 핵심 주의사항
- Ollama HTTP 노드: `contentType: "raw"`, body = `={{ $json.ollamaRequest }}` (프롬프트 준비 노드에서 미리 JSON.stringify한 문자열)
- JSON.stringify를 HTTP 노드 body 표현식에서 직접 호출하면 n8n이 이중 직렬화해서 400 에러 발생
- Supabase "This is an item, but it's empty" = 정상 (return=minimal 옵션)
- 현재 미해결: ai_news.url UNIQUE 제약조건 없어서 같은 기사 중복 저장 가능

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

## 🚨 현재 작업 우선순위

### ✅ 완료
- Vercel → Cloudflare Workers 이전
- 컨텐츠 볼륨업 (40개 툴 상세화)
- 커스텀 도메인 ai.ktoolu.com
- 블로그 (Notion CMS)
- AI 뉴스 자동수집 n8n 워크플로우 (Ollama 동작 확인)

### 🔜 다음 작업
1. **n8n 프롬프트 업그레이드**: hermes3 → qwen2.5:7b 전환 + 더 깊은 기사 형식 (핵심내용/인사이트/인용구 포함), num_predict 2000~3000
2. **Supabase url UNIQUE 제약조건**: `ALTER TABLE ai_news ADD CONSTRAINT ai_news_url_unique UNIQUE (url);`
3. **n8n 중복 URL 사전 필터링**: Ollama 처리 전에 이미 저장된 URL 제외

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
