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

## AI 뉴스 자동수집 — 현재 운영 파이프라인: Hermes cron (n8n 아님)

⚠️ **2026-07-26 확인: 실제 뉴스 수집은 n8n이 아니라 Hermes cron job이 담당하고 있음.**
n8n 워크플로우(`n8n-workflow-ai-news.json`)는 2026-05-29에 import만 되고 **한 번도 활성화(Active)된 적 없음** —
n8n을 켜서 뭔가 조사할 필요 없음. 아래 "n8n 워크플로우 (사용 안 함, 참고용)" 섹션은 히스토리 보존용.

- **실제 파이프라인**: Hermes cron job `ktoolu-news` — 매일 09:00 KST 실행
- **실행 스크립트**: `ktoolu-news.py` (Python)
- **AI 요약**: DeepSeek API (`deepseek-v4-flash`, 2026-07-26부터 — 아래 사고 참고)
- **뉴스 소스**: VentureBeat AI, TechCrunch AI, Ars Technica, MIT Tech Review, Wired, IEEE Spectrum, HackerNews API
- **저장**: Supabase `ai_news` 테이블, 보통 1회 실행당 5개 저장
- 장애 의심 시: n8n이 아니라 **Hermes cron 실행 로그**부터 확인할 것

### ✅ 해결된 버그: DeepSeek 모델명 폐기로 뉴스 수집 중단 (2026-07-25~26)

**증상**: 07-24까지 매일 정상 수집되던 뉴스가 07-25, 07-26 이틀 연속 0건.

**원인**: DeepSeek가 07-25경 `deepseek-chat` 모델명을 폐기(deprecate). `ktoolu-news.py`가 여전히
`deepseek-chat`을 호출해 API가 `400 Bad Request: "The supported API model names are
deepseek-v4-pro or deepseek-v4-flash, but you passed deepseek-chat."` 반환.

**해결**: `ktoolu-news.py` 90번째 줄 `DEEPSEEK_MODEL = "deepseek-chat"` → `"deepseek-v4-flash"`로 수정.

**진단 시 확인한 것들** (장애 재발 시 체크리스트):
1. Hermes cron 실행 이력에 07-25 이후 실행 시도가 있었는지
2. DeepSeek API 키 유효기간·잔액
3. RSS 소스 응답 상태 (전부 정상이었음 — 소스 문제 아님)
4. Supabase `ai_news` 테이블에서 `collected_at` 최신값으로 마지막 정상 수집 시점 확인:
   `curl ".../rest/v1/ai_news?select=id,collected_at&order=collected_at.desc&limit=5"`

---

## n8n 워크플로우 (사용 안 함, 참고용 — 위 섹션 참고)

과거 n8n으로 전환을 시도했던 흔적. 실제로는 한 번도 가동되지 않았고 Hermes cron으로 바로 대체됨.
아래는 n8n 재도입 시에만 참고할 것.

- **워크플로우 파일**: C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\n8n-workflow-ai-news.json
- **뉴스 소스**: VentureBeat AI, TechCrunch AI, Ars Technica, MIT Tech Review, IEEE Spectrum, HackerNews API
- **흐름**: RSS 수집 → AI 필터링/정렬(48h 이내만) → 중복 URL 제거 → 하나씩 처리 → 프롬프트 준비 → AI 요약 → 결과 파싱 → Supabase 저장

### ⏸️ Ollama 설정 (n8n용, 미사용)
- **AI 요약**: Ollama 로컬 실행 (http://127.0.0.1:11434)
- **설치된 Ollama 모델**: hermes3:latest, qwen2.5:7b, llama3.1:8b
- Ollama 사용 시: 프롬프트 준비 노드를 ollamaRequest 형식으로, HTTP 노드 URL을 `http://127.0.0.1:11434/api/generate`로 변경

### n8n 워크플로우 핵심 주의사항 (재도입 시 참고)
- DeepSeek HTTP 노드: `contentType: "raw"`, body = `={{ $json.deepseekRequest }}`
- JSON.stringify를 HTTP 노드 body 표현식에서 직접 호출하면 n8n이 이중 직렬화해서 400 에러 발생
- Supabase "This is an item, but it's empty" = 정상처럼 보이지만 실제 INSERT 여부는 별도 확인 필요
- ai_news.url UNIQUE 제약조건: `ai_news_url_unique` 이름으로 이미 존재함 (확인 완료)
- Supabase RLS: ai_news 테이블 RLS 비활성화 완료 (UNRESTRICTED 상태)

---

## ✅ 해결된 버그: Supabase INSERT (2026-06-05)

### 증상
- n8n 워크플로우가 끝까지 실행됨 (모든 노드 초록불)
- DeepSeek API 호출 성공, 한국어 번역 정상 작동
- "Supabase 저장" 노드가 "Success in ~200ms" + "This is an item, but it's empty" 표시
- 그런데 Supabase ai_news 테이블에 데이터가 없음

### 확인된 사실
- SQL Editor에서 직접 INSERT → 성공 (id=26 생성됨) → 테이블 자체는 정상
- 현재 테이블 상태: id=26 (테스트 레코드 1개만 존재), UNRESTRICTED (RLS disabled)
- ai_news_url_unique UNIQUE 제약조건 존재
- 기존 25개 레코드는 이전 세션에서 삭제됨 (Purge 실행한 것으로 추정)
- `GRANT SELECT, INSERT ON ai_news TO anon` 실행했으나 효과 없었음
- `GRANT USAGE, SELECT ON SEQUENCE ai_news_id_seq TO anon` 실행했으나 효과 없었음

### 시도했으나 실패한 것들
- `resolution=ignore-duplicates` 제거 → 효과 없음
- RLS 정책 추가/수정 → 효과 없음  
- RLS 완전 비활성화 → 효과 없음
- GRANT 권한 부여 → 효과 없음

### 의심되는 원인
PostgREST가 anon 키로 INSERT 시 HTTP 200/201 빈 응답을 돌려주는데 실제로는 INSERT가 안 되는 상태. 가능한 원인:
1. **anon 롤에 실제 DB 수준 GRANT가 없음** (information_schema 확인 필요)
2. **published_at 컬럼 타입 불일치** - RSS pubDate가 "Mon, 19 Jan 2026 14:00:00 GMT" (RFC 2822) 형식인데 PostgreSQL timestamptz가 이를 거부할 수 있음
3. **n8n body 직렬화 문제** - `=JSON.stringify($json)` 표현식이 예상과 다르게 동작할 수 있음

### 해결 방법
- body를 `=JSON.stringify($json)` → `={{ JSON.stringify({title: $json.title, url: $json.url, ...}) }}` 로 변경
- `={{ }}` 문법 + 명시적 필드 지정이 핵심이었음
- published_at도 `new Date(orig._pubDate).toISOString()` 으로 ISO 형식 변환 적용

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
- AI 뉴스 자동수집: n8n → **Hermes cron(`ktoolu-news`, 매일 09:00 KST)으로 완전 전환 완료** (n8n은 미사용)
- AI 뉴스 페이지 개선: 섹션 타이틀, 날짜 그루핑, 소스/태그 필터
- AI 뉴스 개별 페이지(`/news/[slug]`) + 게시판형 목록 + 구조화 데이터
- 프롬프트 도서관 1단계(`/prompts`, 운영자 큐레이션 30개) — 상세는 `docs/prompt-library-plan.md`
- SEO 진단 기반 개선: metadataBase, OG 이미지, 구조화 데이터(SoftwareApplication/BreadcrumbList/WebSite), Pretendard 폰트, GA4 전환 이벤트, 카테고리 큐레이션 페이지(`/category/[category]`)

### 🔜 다음 작업
1. 뉴스 충분히 쌓이면 스케줄 주기 조정 (현재 하루 1회 5건)
2. 프롬프트 도서관 2단계(비로그인 localStorage 스크랩) — `docs/prompt-library-plan.md` 참고

### 🗓️ 트래픽 늘면 고려
- 이메일 구독 뉴스레터 (Resend 또는 Mailchimp 연동)

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
