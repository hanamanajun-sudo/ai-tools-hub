# ai.ktoolu 작업 요약 (2026-07-18 ~ 2026-07-20)

> SEO/UX 종합 진단 → 개선 실행 → 프롬프트 도서관 신규 기능까지 이어진 작업 기록.
> 커밋 해시는 실제 git log 기준(작성일 아님, 커밋 시각 기준).

## 개요

| 날짜 | 주제 |
|---|---|
| 07-18 | 뉴스 개별 페이지·게시판형 목록, Kimi 툴 추가, SEO 진단+퀵윈 5종, 구조화 데이터+Pretendard 폰트 |
| 07-19 | GA4 전환 이벤트 추적, 카테고리별 큐레이션 페이지, 프롬프트 도서관 기획+시드 30개 작성 |
| 07-20 | 프롬프트 도서관 1단계 구현·배포 (DB+페이지+검증), 실버그 1건 발견·수정 |

---

## 07-18 — 뉴스 구조 개선 + SEO 진단 + 퀵윈

### 뉴스 UX 개선
- `/news/[slug]` 개별 뉴스 페이지 신규 + sitemap 연동 (`40bd9dd`)
- 목록을 "요약 미리보기" 카드형에서 **제목+날짜만 있는 게시판형**으로 단순화 → 클릭해야 전체 내용이 보이도록 (중복 노출 문제 해결), 링크복사/공유는 상세페이지로 이동 (`d067522`)
- 툴 상세페이지의 "관련 뉴스"가 외부 원문으로 바로 나가던 것을 내부 `/news/[slug]` 링크로 교체 (`95747f8`)
- AI 툴 목록에 **Kimi**(Moonshot AI, K3 모델) 추가 (`8cc2c8d`)

### SEO/UX/접근성/성능 종합 진단
6개 축(SEO 기술·콘텐츠·UI/UX·심미성·접근성·성능)으로 진단 → 스코어카드 리포트 아티팩트로 전달. 총점 73/100(B). 주요 발견:
- `metadataBase` 누락으로 OG/canonical URL이 상대경로로 깨질 수 있음
- 구조화 데이터가 뉴스에만 있고 툴 페이지엔 없음
- 소개·개인정보·문의 페이지 부재 (AdSense 신청 요건 미충족)
- 이미지 CLS는 재확인 결과 **실제 버그 아님**(스크린샷 갤러리 aspect-ratio, 블로그 커버 고정 높이로 이미 안전) — 없는 문제를 고치는 척하지 않고 스킵

### "이번 주 퀵윈" 5개 실행 (`a22def2`)
- `metadataBase` + 전역 openGraph/twitter 메타
- `app/opengraph-image.tsx`: Google Fonts CSS2 `text=` 서브셋팅으로 한글 글리프만 임베드한 동적 OG 이미지
- 헤더 AI 툴 퀵링크·홈 뉴스 미리보기를 외부 대신 내부 링크로 전환
- 접근성 3종: 스킵 링크, 검색창 `aria-label`, `prefers-reduced-motion` 대응
- `components/site-footer.tsx`로 5곳 중복 footer 통합 + `/about` `/contact` `/privacy` 신규(문의는 카카오톡 `@infoepic` 채널 안내)

### 구조화 데이터 + Pretendard 폰트 (`0f8c721`)
- `lib/breadcrumb.ts`: BreadcrumbList 빌더, tools/news/glossary/blog 4개 상세페이지에 적용 + 누락된 canonical도 함께 추가
- 홈: `WebSite`+`SearchAction` JSON-LD, 검색창 입력을 실제 `?q=` URL에 동기화(스키마가 실제로 동작하게)
- 툴 상세: `SoftwareApplication` + 에디토리얼 `Review`(전문가 평점을 "ai.ktoolu 편집팀"이 쓴 단일 리뷰로 정확히 표현) + 실사용자 리뷰 3건 이상일 때만 진짜 `AggregateRating`(허수 방지, 현재는 미노출)
- `FAQPage`는 **도입 안 함** — 구글이 2023-08부로 일반 사이트의 FAQPage 리치 리절트를 중단해 실효 없음
- `next/font/local` + `pretendard` 패키지로 한글 타이포 도입(variable woff2, Geist Sans 대체)

---

## 07-19 — 전환 추적 + 카테고리 페이지 + 프롬프트 도서관 기획

### GA4 전환 이벤트 (`1787f7f`)
- `lib/analytics.ts`, `components/outbound-link.tsx`(서버 컴포넌트에서도 이벤트 추적 가능하게 분리)
- `tool_visit_click`(툴 상세 CTA/홈 랭킹 카드/랭킹 테이블 3곳, source 태그 구분), `news_original_click` 추가

### 비교 페이지 대신 카테고리 큐레이션 페이지 (`183a788`)
- "챗봇 vs 챗봇" 판정형 비교 글은 실측 없이 쓰면 근거 없는 주장이 되고 이미 포화된 장르라 차별화도 안 됨 → 가격·카테고리·태그 등 **이미 구조화된 데이터**만으로 승부하는 방향으로 전환
- `lib/tool-ranking.ts`, `lib/tool-names.ts`: 홈/툴상세/카테고리 페이지에 흩어져 있던 랭킹 알고리즘·한국어 이름 매핑을 단일 소스로 추출(결과 불일치 방지)
- `/category/[category]` 7개 신규(카테고리별 실제로 다른 소개문 + ItemList/BreadcrumbList), 툴 상세페이지 배지·breadcrumb을 실제 카테고리 URL로 연결

### 프롬프트 도서관 기획 (`93288bf`, `18dcd9f`)
- 5단계 로드맵 확정: **① 운영자 큐레이션 도서관 → ② 비로그인 스크랩(localStorage) → ③ Supabase Auth → ④ 개인 프롬프트 관리 → ⑤ 사용자 공유 개방**
- 순서 논리: 로그인 없이 가치가 나오는 것부터, 빈 도서관 문제는 운영자 시드로 해결, 사용자 공유는 검수 부담 때문에 마지막
- 상세 스펙은 [`docs/prompt-library-plan.md`](prompt-library-plan.md)에 별도 문서화(세션이 바뀌어도 이어가기 위함)
- 시드 프롬프트 30개 작성(`scripts/seed-prompts-data.ts`): 6카테고리(글쓰기/업무/코딩/학습/이미지/커리어)×5개, 이미지 카테고리는 사용자 결정에 따라 ChatGPT·Gemini 자연어 작법 기준. `example_output`은 실제 실행 결과가 없어 전부 `null`로 비워둠(지어내지 않음)

---

## 07-20 — 프롬프트 도서관 1단계 구현 + 배포

딥링크 실지원 여부를 웹서치로 재확인: **Claude의 `?q=`는 2025-10 보안 이슈로 제거됨, Gemini는 애초 미지원** → 원래 계획한 4개 대신 **ChatGPT·Perplexity 2개만** 구현(계획 문서 갱신 반영).

구현 내용 (`b7a3a4c`):
- Supabase `prompts` 테이블+RPC 생성(사용자가 SQL Editor에서 실행, 최초 RLS 활성화로 INSERT 막혔던 것도 같이 해결)
- `lib/prompts.ts`: CRUD, `{{변수}}` 추출/치환, `copy_count` RPC, `getPromptsForTool`(툴 페이지 역참조용)
- `/prompts` 목록(카테고리 필터), `/prompts/[slug]` 상세(변수 채우기 폼 → 실시간 미리보기 → 복사 → 딥링크)
- 헤더·푸터·사이트맵 연결(개별 30+카테고리 6+섹션 1 = 37 URL)
- 보너스: 툴 상세페이지에 "이 툴에서 잘 되는 프롬프트" 역참조 섹션
- 시드 30개 REST API로 입력(`scripts/seed-insert.mjs`), 개수·카테고리·필드 검증 통과

**실데이터 검증 중 발견한 진짜 버그**: 동적 라우트의 한글 슬러그를 `decodeURIComponent` 없이 그대로 조회에 써서 상세페이지가 전부 404 나던 문제. `lib/news-slug.ts`에서 이미 같은 이슈를 알고 처리해뒀던 패턴을 새 코드에 반영 안 했던 것 — 발견 즉시 수정하고 프로덕션에서 200 확인까지 마침.

배포 후 프로덕션에서 목록/상세/변수폼/딥링크/카테고리필터/사이트맵/헤더내비/툴페이지 역참조/404 전부 재확인 완료 (`311d7b6`로 진행 기록 마감).

---

## 이번 작업 전반의 판단 기준 (반복된 원칙)

- **없는 근거를 지어내지 않는다**: `example_output`은 실행 결과 없으면 null, `AggregateRating`은 진짜 리뷰 3건 이상일 때만, FAQPage/딥링크도 실제 지원 안 되면 안 넣음
- **실제로 동작하는지 코드가 아니라 데이터로 확인한다**: 매 기능마다 로컬+프로덕션 curl 검증, 구조화 데이터·사이트맵·이벤트 페이로드 직접 확인
- **중복 로직은 단일 소스로**: 랭킹 알고리즘·한국어 이름 매핑 등 여러 곳에서 쓰는 로직은 `lib/`로 추출해 결과 불일치 방지

## 다음 할 일

- 프롬프트 도서관 2단계(비로그인 localStorage 스크랩) — 상세 스펙 미정, [`docs/prompt-library-plan.md`](prompt-library-plan.md)에서 이어서 기획
- 로드맵 남은 "다음 분기 큰 베팅": 다국어(i18n), 뉴스레터
