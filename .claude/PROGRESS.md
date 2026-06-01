# AI Tools Hub 진행 상황

## 2026-05-23
- 프로젝트 초기 세팅 완료 (clone, npm install, .claude 폴더 구성)

### 1단계: Cloudflare 이전 ✅ 완료
- Next.js 16.1.6 → 16.2.6 업그레이드
- @opennextjs/cloudflare 1.19.11, wrangler 4.94.0 설치
- open-next.config.ts, wrangler.jsonc 생성
- .github/workflows/deploy.yml (GitHub Actions) 생성
- ⚠️ 로컬 Windows 빌드 불가 (한글 경로 + Turbopack 경로 검증 충돌)
- ✅ GitHub Actions (Linux)로 빌드/배포 전환
- ✅ GitHub Secrets 4개 설정 완료 (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- ✅ https://ai-tools-hub.hanamanajun.workers.dev/ 배포 완료

### 2단계: 컨텐츠 볼륨업 ✅ 완료
- AITool 인터페이스 확장: longDescription, features, pros, cons, pricing, useCases 추가
- 40개 도구 전체 상세 한국어 컨텐츠 작성
- 도구 상세 페이지(app/tools/[slug]/page.tsx) UI 개선: 주요 기능, 장단점, 활용 사례, 가격 섹션 추가

### 도메인 & SEO ✅ 완료
- ✅ ai.ktoolu.com 커스텀 도메인 Cloudflare Workers 연결
- ✅ sitemap.ts, robots.ts → ai.ktoolu.com으로 업데이트
- ✅ vercel.json 301 리다이렉트 설정 (Vercel → ai.ktoolu.com)
- ✅ Google Search Console 주소 변경 신청 완료 (vercel.app → ai.ktoolu.com)
- ✅ Search Console 사이트맵 등록: https://ai.ktoolu.com/sitemap.xml

---

## 2026-05-24

### 오늘 한 일

**블로그 섹션 구현 (Notion CMS 연동)**
- Notion 데이터베이스를 CMS로 사용하는 블로그 기능 구현
- `lib/notion.ts` — Notion API 연동 모듈 작성
- `app/blog/page.tsx` — 블로그 목록 페이지
- `app/blog/[slug]/page.tsx` — 블로그 개별 글 페이지
- 홈페이지에 최신 블로그 3개 미리보기 섹션 추가
- 헤더에 블로그 메뉴 + 글 수 뱃지 추가
- 카테고리별 컬러 태그 (AI 도구 리뷰, AI 트렌드 뉴스, 카테고리별 추천, AI 활용 팁)
- Notion MCP로 블로그 글 4개 직접 작성 (Claude Code 확장 시리즈)

**브랜딩**
- 사이트 이름 → `ai.ktoolu`로 변경
- 파비콘 → 보라-파랑 그라디언트 "k" SVG로 변경

**배포 파이프라인 개선**
- `deploy.yml`에 빌드 시 NOTION_API_KEY, NOTION_BLOG_DATABASE_ID 환경변수 주입
- 배포 후 Cloudflare Worker 런타임 시크릿 자동 등록 (`wrangler secret put`)
- `revalidate = false` 완전 정적 빌드로 전환 (Internal Server Error 방지)

### 완료된 항목 ✅

- ✅ 블로그 목록·상세 페이지 구현
- ✅ Notion REST API 직접 fetch 연동 (SDK 없이)
- ✅ 홈페이지 블로그 미리보기 섹션
- ✅ 사이트명·파비콘 변경
- ✅ GitHub Actions에 Notion 환경변수 설정
- ✅ Cloudflare Worker 런타임 시크릿 등록 자동화
- ✅ 블로그 글 4개 발행 (Claude Code MCP, 슬래시 커맨드, 훅, 확장 개요)

**해결한 기술 이슈**
- `notion-to-md` → `@notionhq/client` 순서로 제거: esbuild가 ES6 클래스를 컴파일할 때 삽입하는 `__name()` 헬퍼가 Cloudflare Workers 런타임에 미정의 → `ReferenceError` 발생
- 최종 해결: SDK 전체 제거, Notion REST API를 순수 `fetch()`로 직접 호출
- 클라이언트 사이드 네비게이션(RSC 재요청) 시 런타임에도 API 키 필요 → Worker 시크릿으로 해결

### 다음에 할 일

- [ ] 블로그 글 추가 작성 (AI 도구 리뷰, 트렌드 뉴스 등)
- [ ] 도구 제안 기능 (사용자가 도구 추천)
- [ ] 검색 기능 강화
- [ ] OG 이미지 자동 생성 (블로그 글별)

---

## 2026-06-02

### 오늘 한 일

**블로그 글 작성 및 Notion 등록**
- 컴퓨텍스 2026 젠슨황 RTX 스파크 발표 내용 포스팅 작성
- 웹 검색으로 팩트 체크: 가격($1,499~), 출시일(10/26), 파트너사(5개사) 등 오류 수정
- SEO 롱테일 키워드 고려한 제목 작성
- Notion MCP로 `ai.ktoolu blog` 데이터베이스에 직접 등록 (Published=true)
- Tags 멀티셀렉트 옵션 신규 추가 (엔비디아, RTX스파크, 컴퓨텍스2026, AI PC, 젠슨황)

**블로그 포스트 페이지 UI/UX 전면 개선**
- `app/blog/[slug]/page.tsx` 전면 재작성
  - 카테고리별 컬러 그라디언트 상단 액센트 바
  - 히어로 섹션: 카테고리 뱃지 + 날짜 + 읽기 시간 추정 한 줄 배치
  - 제목 `2.375rem`, `word-break: keep-all` (한국어 최적화)
  - 카테고리별 컬러 액센트 구분선
- `app/globals.css`에 `.blog-content` 커스텀 클래스 추가
  - h2: 인디고 좌측 보더 액센트
  - ul/ol: 컬러 불릿/숫자
  - blockquote, callout, code, pre, figure, hr 스타일
  - 본문 `font-size: 1.0625rem`, `line-height: 1.9`
  - 라이트/다크 모드 모두 지원

**블로그 목록 썸네일 추가**
- `app/blog/page.tsx`: 커버 이미지 있는 글은 좌측 썸네일 카드 레이아웃
- 커버 없는 글은 기존 텍스트 카드 유지

**Notion 이미지 만료 문제 해결 (Supabase → Cloudflare R2)**
- Notion 직접 업로드 이미지는 AWS S3 임시 URL로 약 1시간 후 만료되는 문제 해결
- `lib/notion.ts`: Supabase Storage → Cloudflare R2 바인딩 방식으로 전환
  - `getCloudflareContext()`로 R2 버킷 접근
  - 최초 로드 시 R2에 복사, 이후 `/api/r2/notion/{blockId}` 영구 URL 반환
  - Workers 외 환경(로컬/정적 빌드)에서는 원본 URL 폴백
- `app/api/r2/[...path]/route.ts` 신규 생성 — R2 이미지 서빙 엔드포인트
- `wrangler.jsonc`: account_id, R2 바인딩(`BLOG_ASSETS`) 추가
- `deploy.yml`: 배포 시 `blog-assets` R2 버킷 자동 생성 스텝 추가
- 블로그 페이지 `revalidate: false → 3600` (ISR, Worker 런타임에서 R2 접근 가능)

**환경변수 설정 완료**
- `NOTION_API_KEY`, `NOTION_BLOG_DATABASE_ID` `.env.local` 및 GitHub Secrets 등록
- `NOTION_BLOG_DATABASE_ID` `wrangler.jsonc` vars에 추가

### 완료된 항목 ✅

- ✅ 블로그 포스트 상세 페이지 UI/UX 전면 개선
- ✅ 블로그 목록 커버 이미지 썸네일 표시
- ✅ Notion 이미지 만료 문제 해결 (Cloudflare R2 영구 캐싱)
- ✅ R2 이미지 서빙 API 라우트 구현
- ✅ 블로그 글 1개 추가 발행 (젠슨황 컴퓨텍스 2026 RTX 스파크)
- ✅ NOTION_API_KEY GitHub Secrets 등록

### 다음에 할 일

- [ ] n8n 프롬프트 업그레이드: hermes3 → qwen2.5:7b, 핵심내용/인사이트/인용구 포함 형식
- [ ] Supabase `ai_news.url` UNIQUE 제약조건 추가 (중복 기사 방지)
- [ ] n8n 중복 URL 사전 필터링 (Ollama 처리 전 저장된 URL 제외)
- [ ] OG 이미지 자동 생성 (블로그 글별 SNS 썸네일)
- [ ] 블로그 글 꾸준히 추가 (AI 도구 리뷰, 트렌드 뉴스)
- [ ] 도구 제안 기능 (사용자가 AI 툴 추천)
- [ ] 검색 기능 강화 (Supabase 풀텍스트 검색)
