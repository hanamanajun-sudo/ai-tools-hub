# ai.ktoolu.com 진행 현황

## 2026-09-02 작업 내용

### 오늘 한 일

**1. 뉴스 페이지에 "편집자 한마디" 기능 추가**
- `/news/admin`에서 기사별로 직접 코멘트를 입력할 수 있는 UI 추가(펼침 텍스트영역 + 저장/취소)
- 입력하면 뉴스 페이지의 "인사이트 & 시사점" 바로 아래 보라색 섹션으로 표시, 비워두면 섹션 자체가 안 나옴
- Supabase `ai_news` 테이블에 `editor_note` 컬럼 추가 필요 → 사용자가 직접 SQL 실행 완료
- 컬럼이 없을 때는 관리자 페이지가 에러 대신 실행할 SQL을 안내하도록 처리

**2. 뉴스 공유 버튼에 "본문 복사" + "카카오톡 공유" 추가**
- 본문 복사: 제목 + 3줄요약 + 쉬운설명 + 인사이트 + 편집자한마디(있으면) + 하단에 원문 출처와 ai.ktoolu 링크까지 포함한 전문을 클립보드에 복사
- 카카오톡 공유: 카카오 JS SDK를 페이지 진입 시 미리 로드해 초기화(클릭 시점 로드는 팝업 차단 위험) 후 feed 템플릿으로 공유
- `components/share-buttons.tsx`를 공용 컴포넌트로 확장해 블로그/글로서리/프롬프트/툴 페이지는 기존 버튼 그대로, 뉴스 페이지만 `copyText`/`description` prop으로 추가 버튼 노출
- 배포 직후 실제 클릭 시 "잘못된 요청으로 인증에 실패하였습니다"(카카오 에러 4011)로 실패. 디버깅 과정에서 카카오 디벨로퍼스에 도메인 등록 필드가 **3곳**으로 나뉘어 있다는 걸 확인함(헷갈리기 쉬워 기록):
  - `일반 > 앱 기본 정보 > 앱 대표 도메인` — 정보 표시용, 보안 검증에 안 쓰임
  - `앱 > 제품 링크 관리 > 웹 도메인` — 카카오톡 공유/메시지의 링크 버튼이 이동 가능한 도메인
  - `앱 > 플랫폼 키 > JavaScript 키 > JavaScript SDK 도메인` — **JS SDK가 API 호출마다 실제로 검사하는 도메인** (이게 등록 안 돼 있어도 `Kakao.init()`/`isInitialized()`는 정상 반환되므로 초기화 성공만으로는 도메인 등록 여부를 확인할 수 없음)
  - 위 3곳을 다 확인·등록했는데도 안 됐는데, 최종 원인은 **코드에 넣은 JavaScript 키 자체가 실제 콘솔 값과 다름** — 콘솔에서 정확한 값을 다시 확인해 교체하니 해결됨

**3. 버그 수정: 관리자 테이블 "한마디" 헤더가 이스케이프 원문(`한마디`)으로 표시**
- JSX 텍스트 노드에 유니코드 이스케이프를 직접 써서 해석이 안 되고 있었음 — 문자열 리터럴로 감싸 수정

**4. 버그 수정: 전 페이지 콘솔 에러 `ReferenceError: __name is not defined` (다크모드 깜빡임의 실제 원인)**
- 원인: wrangler의 esbuild가 `keepNames` 기본값 `true`라 함수 본문에 `__name(fn,"fn")` 계측 호출을 삽입. `next-themes`가 테마 적용 함수를 `script.toString()`으로 직렬화해 `<head>` 인라인 스크립트로 심는데, 브라우저엔 `__name` 헬퍼가 없어 첫 줄에서 죽음 → 그 아래 실제 테마 적용 코드가 하이드레이션 전까지 통째로 실행 안 됨
- 실제 피해: 다크모드 사용자가 페이지를 열 때마다 라이트 화면이 잠깐 보였다가 다크로 바뀌는 FOUC(깜빡임) 발생
- 해결: `wrangler.jsonc`에 wrangler 정식 지원 옵션 `"keep_names": false` 추가
- 검증: 프로덕션 HTML에서 `__name` 완전 제거 확인, React 청크를 강제 차단한 상태에서도 `<html class="dark/light">`가 하이드레이션 전에 정상 적용됨을 확인, 4개 페이지 콘솔 에러 없음, 테마 토글·랭킹 표·검색·공유 버튼·카카오 SDK·본문 복사 전부 회귀 없이 정상 동작

**5. 공유 버튼(링크복사·본문복사·카카오톡·퍼가기)에 마우스 오버 시 포인터 커서 추가**
- `<button>`은 브라우저 기본값이 `cursor:default`라 클릭 가능해 보이지 않았음 — `cursor-pointer` 클래스 추가

---

### 완료된 항목

- [x] 편집자 한마디 기능 배포 (`60d70f3`), Supabase 컬럼 추가 완료
- [x] 본문 복사 · 카카오톡 공유 배포 (`60d70f3`) → 실제로는 안 되던 것을 사용자와 함께 디버깅해서 해결 (`26690d5`, 원인: 코드의 JS 키가 실제 콘솔 값과 달랐음)
- [x] 관리자 헤더 이스케이프 버그 수정·배포 (`0d031a2`)
- [x] `__name` ReferenceError / 다크모드 FOUC 근본 원인 규명·수정·배포 (`e4e500e`)
- [x] 공유 버튼 커서 포인터 수정·배포 (`820228b`)

---

### 다음에 할 일

- [ ] `lib/notion.ts`의 `image` 블록 `alt` 속성 큰따옴표 이스케이프 누락 — 2026-08-31에 발견한 항목, 아직 미수정
- [ ] 프롬프트 도서관 2단계(비로그인 localStorage 스크랩) — `docs/prompt-library-plan.md` 참고

---

## 2026-08-31 작업 내용

### 오늘 한 일

**1. 블로그 글에 유튜브 영상 임베드 재생 기능 추가**
- 기존 `lib/notion.ts` 렌더러(`blockToHtml`)가 Notion의 video/embed 블록을 전혀 처리하지 못해 빈 문자열로 무시하던 문제 발견
- youtu.be / youtube.com 두 URL 형태 모두에서 video ID를 추출해 반응형 16:9 iframe(`.video-embed`)으로 렌더링하도록 추가, `app/globals.css`에 대응 스타일 추가

**2. 보안 수정: 유튜브 임베드 XSS 취약점**
- 배포 직후 자동 보안 리뷰가 `lib/notion.ts`에서 XSS 가능성을 잡아냄 — `extractYoutubeId`가 URL에서 뽑아낸 값을 검증 없이 그대로 `iframe src` 속성 문자열에 이어붙이고 있어서, 조작된 video 블록 URL로 속성을 탈출해 스크립트를 주입할 수 있는 경로가 있었음
- 유튜브 video ID는 항상 영숫자·`-`·`_` 11자리라는 정규식(`^[A-Za-z0-9_-]{11}$`)으로 검증 후 통과한 값만 렌더링하도록 수정, 재배포 후 영상 정상 재생 확인

**3. 블로그 신규 글 게시: "마이크로덕(MicroDuck) 완전 정리: 399달러에 사는 오픈소스 이족보행 로봇"**
- 사용자 제공 ktoolu 뉴스 기사 + MarkTechPost 기사를 기반으로, Pollen Robotics 공식 페이지·Engadget 기사까지 교차 검증해서 가격/사양/구매처/기능/한계 등 빠짐없이 정리
- 요청받은 유튜브 소개 영상을 페이지에서 바로 재생되는 임베드로 포함 (위 1번 기능 사용)
- Notion CMS에 Category="AI 트렌드 뉴스", Slug=`microduck-hugging-face-robot-guide`로 게시, 프로덕션 렌더링 확인 완료

**4. 사소한 문구 수정**
- `/news/[slug]` 페이지의 "초등학생도 이해하는 ktoolu 설명" 라벨을 "초등학생도 이해하는 NEWS 설명"으로 변경

---

### 완료된 항목

- [x] 블로그 유튜브 영상 임베드 기능 배포 (`20c0b9b`)
- [x] 유튜브 임베드 XSS 취약점 수정·배포 (`dbccc95`)
- [x] 마이크로덕 로봇 블로그 글 게시 완료
- [x] 뉴스 상세 페이지 라벨 문구 수정 배포 (`3c5a9b5`)

---

### 다음에 할 일

- [ ] `/blog` 목록 페이지는 revalidate=3600(1시간 캐시)라 새 글이 목록에 뜨는 데 최대 1시간 소요 — 반영 확인
- [ ] `lib/notion.ts`의 기존 `image` 블록도 `alt="${caption}"`에서 caption의 큰따옴표(")를 이스케이프하지 않고 있음 — video 블록과 같은 속성-탈출 XSS 패턴이라 다음에 점검·수정 필요
- [ ] 프롬프트 도서관 2단계(비로그인 localStorage 스크랩) — `docs/prompt-library-plan.md` 참고

---

## 2026-07-29 작업 내용

### 오늘 한 일

**1. 툴 상세페이지 "관련 뉴스 더보기" + 뉴스 페이지 키워드 필터**
- `/tools/claude` 등 관련 뉴스 위젯(5개로 제한)에 "{툴명} 관련 뉴스 더보기" 링크 추가
- `/news?q=키워드들&label=툴명` 형태로 뉴스 페이지에 툴별 필터 기능 추가 (기존 태그/날짜 필터와 동일한 방식)
- 위젯 미리보기와 "더보기" 전체 목록이 완전히 같은 키워드 기준으로 필터링되도록 로직 공유 (결과 불일치 방지)
- 실데이터로 검증: 최근 50건 중 Claude/Anthropic 매칭 12건 확인 (위젯엔 5건만 노출 — "더보기"가 실제로 더 보여줄 내용 있음을 확인)

**2. 프로덕션 장애 대응: Cloudflare Worker Error 1102 (리소스 한도 초과)**
- 증상: ai.ktoolu.com 접속 시 "Worker exceeded resource limits" 에러
- 원인 진단: `/opengraph-image` 엔드포인트가 `x-nextjs-cache: MISS`, `Cache-Control: max-age=0`로 **캐싱이 전혀 안 되고 매 요청마다 재생성**되고 있었음. 이미지 하나 만드는 데 Google Fonts 외부 fetch 4회 + Satori 렌더링을 매번 반복 — 카카오톡/X 등 링크 공유 시 미리보기 봇이 호출할 때마다 CPU 비용이 누적되어 한도 초과로 이어짐
- 해결: `ImageResponse`에 `Cache-Control: public, max-age=31536000, immutable` 헤더 추가(CDN 엣지 캐싱 유도) + 폰트 fetch 결과를 모듈 스코프에 캐싱(같은 Worker 인스턴스 재사용 시 재요청 방지)
- 배포 후 확인: 응답시간 0.9초 → 0.2초(캐시 히트), 사이트 전체 페이지 200 정상

**3. 블로그 신규 글 게시**: "키미 K3, 로컬로 돌아가나? 구축비용 현실적으로 따져봤다"
- 타겟 키워드: kimi k3, 구축비용, 로컬로 돌아가나?
- 게시 전 웹서치로 초안 수치 전수 검증 — **VRAM 요구량 오류 1건 발견·수정**: 초안엔 "500GB대 후반"으로 적혀 있었으나, K3 가중치 파일 자체가 1.56TB라 앞뒤가 안 맞는 수치였음(이전 모델 K2의 577~630GB 수치가 잘못 옮겨 붙은 것으로 추정) → "1.5TB 이상"으로 정정. 나머지 수치(896개 전문가 중 16개 활성화, 활성 파라미터 1,040억, 64개 가속기 권장 등)는 교차 확인 후 그대로 반영
- Notion CMS에 Category="AI 트렌드 뉴스", Slug=`kimi-k3-local-hosting-cost`로 게시, 프로덕션 렌더링 확인 완료
- 참고: 사이트 렌더러(`lib/notion.ts`)가 Notion 표(table) 블록을 지원하지 않아, 원래 표로 정리하려던 "필요 하드웨어 스펙"은 불릿 리스트로 변환해 정보 유실 방지

---

### 완료된 항목

- [x] 관련뉴스 더보기 + 뉴스 키워드 필터 배포 (`b133d6a`)
- [x] OG 이미지 캐싱 수정, Error 1102 해결 배포 (`23d54f1`)
- [x] 블로그 "키미 K3 로컬 구축비용" 게시 완료

---

### 다음에 할 일

- [ ] Error 1102 재발 여부 며칠 지켜보기 (같은 원인의 캐싱 누락이 다른 동적 라우트에도 있는지 여유될 때 점검)
- [ ] 프롬프트 도서관 2단계(비로그인 localStorage 스크랩) — `docs/prompt-library-plan.md` 참고
- [ ] 다국어(i18n), 뉴스레터 — 로드맵의 다음 분기 큰 베팅

---

## 2026-06-25 작업 내용

### 오늘 한 일

- 네이버 서치콘솔 등록: `app/layout.tsx`의 `metadata.other`에 `naver-site-verification` 태그를 기존 `google-site-verification`과 병기 추가
- `public/naver...html` 확인 파일 생성
- `npm run deploy`(opennextjs-cloudflare build+deploy) 시도했으나 Windows 환경 호환성 경고로 CLI 배포 중단
- GitHub Actions(`.github/workflows/deploy.yml`) 자동 배포 확인 후 `git push`로 배포 트리거

---

### 완료된 항목

- [x] 네이버 태그 + 확인 파일 코드 반영, GitHub push 완료

---

### 다음에 할 일

- [ ] GitHub Actions 배포 완료 확인
- [ ] 네이버 서치콘솔 소유 확인 진행
- [ ] sitemap 제출

---

## 2026-06-10 작업 내용

### AI 뉴스 페이지 UI 전면 개선

- 기존 영어 제목 기사 3개 Supabase에서 삭제
- 섹션 타이틀 추가: 📋 기사 3줄 요약 / 💡 ktoolu 설명 / ⚡ 인사이트 & 시사점
- 날짜 그루핑: 오늘 / 어제 / 이번 주 / 이전
- 소스별 + 태그별 필터 (동시 적용 가능)
- 3줄 요약: 번호 뱃지(1·2·3) 리스트 형식
- 섹션별 배경색 구분: gray(요약) / blue(설명) / amber(인사이트)
- ktoolu 설명, 인사이트 문장 단위 줄바꿈 처리
- 기사별 앵커 공유 링크: 링크 아이콘 클릭 → `/news#article-{id}` 복사, 해당 기사로 스크롤

### 용어해설(Glossary) 시스템 구축

- `/glossary` — 전체 용어 인덱스 (알파벳/한글 그룹별)
- `/glossary/[slug]` — 개별 용어 페이지 (정의 + 이 용어가 나온 기사 목록)
- 기사 하단 📖 용어해설 섹션 추가 (정의 미리보기 + 클릭 → 개별 페이지)
- 헤더에 용어해설 메뉴 추가
- Hermes 프롬프트에 terms 추출 추가 (작업지시서 작성 완료)

### n8n → Hermes 에이전트 전환 결정

- n8n 워크플로우 중단
- Hermes(hermes3:latest, Ollama 로컬) 기반 자동 수집 스크립트로 교체
- 기술 스펙 및 작업지시서 작성 완료 (아래 참고)

---

## ✅ 현재 완료 상태

| 기능 | 상태 |
|---|---|
| AI 툴 디렉토리 (40개) | ✅ |
| 커스텀 도메인 ai.ktoolu.com | ✅ |
| Cloudflare Workers 배포 | ✅ |
| 블로그 (Notion CMS) | ✅ |
| AI 뉴스 페이지 UI | ✅ |
| 날짜 그루핑 + 소스/태그 필터 | ✅ |
| 기사 공유 앵커 링크 | ✅ |
| 용어해설 페이지 구조 | ✅ (Supabase SQL 실행 필요) |

---

## 🔴 다음 세션에서 할 일 (우선순위 순)

### 1. Supabase SQL 실행 (아직 안 했으면 먼저 할 것)

Supabase SQL Editor에서 실행:

```sql
CREATE TABLE glossary (
  id bigint generated always as identity primary key,
  term text not null,
  slug text not null unique,
  definition text not null,
  url text,
  related_tool_slug text,
  created_at timestamptz default now()
);

ALTER TABLE ai_news ADD COLUMN IF NOT EXISTS terms text[] default '{}';
ALTER TABLE glossary DISABLE ROW LEVEL SECURITY;
```

### 2. Hermes 뉴스 수집 스크립트 구축

저장 위치: `C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\news-collector\collect.js`

Hermes에게 전달할 작업지시서 요약:
- RSS 6개 소스 수집 → 48시간 이내 + AI 키워드 필터 → 상위 5개
- Supabase 기존 URL 조회 → 신규만 처리
- Ollama hermes3:latest로 한국어 요약 + terms 추출
- Supabase ai_news 저장 + glossary 신규 용어 upsert
- `node collect.js` 실행으로 동작 확인

**Hermes 프롬프트 출력 형식:**
```json
{
  "title": "한국어 제목",
  "summary": "• 1줄\n• 2줄\n• 3줄",
  "explanation": "설명 2~3문장",
  "importance": "인사이트/시사점 2~3문장 (공식 표현 금지)",
  "tags": ["태그1", "태그2", "태그3"],
  "terms": [
    { "term": "용어명", "slug": "url-safe-slug", "definition": "설명 2~3문장", "url": "공식링크 or null" }
  ]
}
```

### 3. 스케줄링 설정

스크립트 완성 후 Windows Task Scheduler로 6시간마다 자동 실행 설정

### 4. 나중에 (트래픽 늘면)

- 이메일 구독 뉴스레터 (Resend 또는 Mailchimp)
- 로그인 기능 (Supabase Auth)
- AI 툴 비교 페이지
- 어필리에이트 링크 (툴별 상세 페이지에)

---

## 프로젝트 핵심 정보

```
로컬 경로: C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\ai-tools-hub
사이트:    https://ai.ktoolu.com
GitHub:    https://github.com/hanamanajun-sudo/ai-tools-hub
배포:      git push → GitHub Actions → Cloudflare Workers (자동)
DB:        Supabase (서울 리전) https://wgnlsmiicynpizkbzyvu.supabase.co
AI 요약:   Ollama hermes3:latest (로컬, http://127.0.0.1:11434)
```

**Supabase 테이블:**
- `ai_news`: id, title, url, source, content_preview, summary, explanation, importance, tags, terms, published_at, collected_at, is_visible
- `reviews`: 툴 별점/코멘트
- `glossary`: id, term, slug, definition, url, related_tool_slug, created_at
