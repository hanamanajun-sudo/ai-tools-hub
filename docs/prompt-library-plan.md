# 프롬프트 도서관 기획·구현 플랜

> 작성: 2026-07-19 · 이 문서는 세션이 바뀌어도 이어서 작업할 수 있도록 전체 로드맵과 1단계 상세 스펙을 담는다.
> 진행할 때마다 하단 "진행 현황"을 갱신할 것.

## 전체 로드맵 (5단계)

| 단계 | 내용 | 로그인 | 상태 |
|---|---|---|---|
| 1 | 프롬프트 도서관 (운영자 큐레이션, 읽기 전용) | 불필요 | 🔜 진행 예정 |
| 2 | 비로그인 스크랩 (localStorage "내 프롬프트함") | 불필요 | 대기 |
| 3 | Supabase Auth 로그인 (Google/카카오 소셜) | — | 대기 |
| 4 | 개인 프롬프트 관리 (비공개 CRUD, 카테고리, 이동/복사) | 필요 | 대기 |
| 5 | 사용자 공유 개방 (공개 신청 → admin 검수 → 게시, 추천/스크랩/조회수) | 필요 | 대기 |

**순서 논리**: 1~2단계는 로그인 없이 즉시 가치(SEO 콘텐츠 + 복사수 데이터)가 나온다.
빈 도서관 문제를 운영자 시드 콘텐츠로 해결한 뒤에 사용자 기능을 연다.
5단계 검수는 기존 admin 페이지 + 리뷰 숨김 패턴 재사용.

---

## 1단계 상세 스펙

### 카테고리 (6개) × 시드 프롬프트 (각 5개 = 총 30개)

| slug | 이름 | 다루는 내용 |
|---|---|---|
| writing | 글쓰기·콘텐츠 | 블로그, SNS, 유튜브 스크립트, 카피라이팅 |
| work | 업무·생산성 | 이메일, 보고서, 회의록, 기획서 |
| coding | 코딩·개발 | 코드리뷰, 디버깅, 리팩터링, 문서화 |
| learning | 학습·리서치 | 요약, 개념설명, 언어학습, 자료조사 |
| image | 이미지·디자인 | ChatGPT·Gemini 이미지 생성 기준 (자연어 대화형 작법, 사용자 확정 2026-07-19) |
| career | 커리어·자기계발 | 이력서, 자소서, 면접준비, 포트폴리오 |

- 30개인 이유: 비어 보이지 않는 최소 볼륨이면서 품질 관리가 가능한 규모. 이후 주 2~3개씩 추가.
- **시드 콘텐츠 품질 기준**(각 프롬프트마다):
  - title: 검색어를 의식한 구체적 제목 (예: "블로그 글 개요 잡아주는 프롬프트")
  - description: 1~2문장, 언제 쓰는지
  - content: 전문. `{{변수}}` 플레이스홀더 사용 (예: `{{주제}}`, `{{대상 독자}}`)
  - tips: 사용 팁 1~3개 (변수를 어떻게 채우면 좋은지 등)
  - tools: 잘 맞는 툴 id 배열 (기존 aiTools id와 일치시켜 상호링크)
  - example_output: 가능하면 실제 실행해본 결과 요약 (없으면 null 허용, 지어내지 말 것)

### DB (Supabase, 프로젝트 wgnlsmiicynpizkbzyvu)

```sql
create table prompts (
  id bigint generated always as identity primary key,
  slug text unique not null,              -- 한글 슬러그 허용 (뉴스 패턴과 동일)
  title text not null,
  description text not null,
  content text not null,                  -- {{변수}} 포함 전문
  category text not null,                 -- writing|work|coding|learning|image|career
  tools text[] default '{}',              -- aiTools id 배열
  tips text,                              -- 사용 팁 (줄바꿈 구분)
  example_output text,
  copy_count int default 0,
  is_visible boolean default true,
  is_featured boolean default false,      -- 편집자 픽
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- RLS는 ai_news처럼 비활성화하되, copy_count 증가는 임의 UPDATE를 막기 위해 RPC로만:
create or replace function increment_prompt_copy(p_slug text)
returns void language sql security definer as
$$ update prompts set copy_count = copy_count + 1 where slug = p_slug; $$;
```

⚠️ ai_news 때 겪은 이슈 참고: anon INSERT/UPDATE가 조용히 실패했던 전례 있음 (.claude/CLAUDE.md "해결된 버그" 섹션). RPC 만들고 반드시 curl로 실제 동작 확인할 것.

### 페이지 (기존 glossary 패턴 복제: 서버 컴포넌트 + revalidate 3600)

1. **`/prompts`** — 목록 페이지
   - 카테고리 필터 (URL: `/prompts?cat=writing`), 편집자 픽 상단
   - 카드: 제목, 설명, 카테고리 뱃지, 복사수, 추천 툴 아이콘
2. **`/prompts/[slug]`** — 상세 페이지
   - 프롬프트 전문: `{{변수}}` 하이라이트 표시
   - **변수 채우기 폼** (클라이언트 컴포넌트): 변수 입력 → 완성본 미리보기
   - **복사 버튼**: 클릭 시 `increment_prompt_copy` RPC + GA 이벤트 `prompt_copy`
   - **"바로 실행" 딥링크 버튼**: 완성본을 URL 파라미터로 넣어 새 탭
     - ChatGPT: `https://chatgpt.com/?q={완성본}` — ✅ 공식 지원 확인(2026-07-20 웹서치)
     - Perplexity: `https://www.perplexity.ai/search?q={완성본}` — ✅ 지원 확인
     - Claude: ❌ **제외** — `claude.ai/new?q=` 파라미터가 2025년 10월경 프롬프트 인젝션 보안 문제로 제거됨
     - Gemini: ❌ **제외** — 네이티브 prefill 파라미터 지원한 적 없음(확장 프로그램 없이는 불가)
     - Claude/Gemini는 추천 툴 섹션에 일반 링크(`/tools/claude`, `/tools/gemini`)로만 노출, 딥링크 버튼은 ChatGPT·Perplexity 2개만
     - GA 이벤트 `prompt_launch` (tool 파라미터 포함)
   - 사용 팁, 결과 예시(있을 때만), 추천 툴 → `/tools/[id]` 내부링크
   - 관련 프롬프트 (같은 카테고리 4개)
   - SEO: canonical, BreadcrumbList, (Article 대신) `HowTo` 또는 일반 메타만 — 구현 시 판단
   - 공유 버튼: `NewsShareButtons` 패턴 재사용
3. **연결 작업**
   - `site-header.tsx` 내비에 "프롬프트" 추가 (아이콘: Terminal 또는 Wand2)
   - `site-footer.tsx` NAV_LINKS에 추가
   - `sitemap.ts`: `/prompts` + 개별 페이지 추가
   - 툴 상세페이지에 "이 툴에 잘 맞는 프롬프트" 섹션 (tools 배열 역참조) — **여유 있으면, 없으면 1.5로 미룸**

### 파일 목록 (예상)

| 파일 | 작업 |
|---|---|
| `lib/prompts.ts` | 타입, 카테고리 상수, Supabase 조회 함수 |
| `app/prompts/page.tsx` | 목록 (신규) |
| `app/prompts/[slug]/page.tsx` | 상세 (신규) |
| `app/prompts/[slug]/prompt-actions.tsx` | 변수폼+복사+딥링크 클라이언트 컴포넌트 (신규) |
| `components/site-header.tsx`, `components/site-footer.tsx` | 내비 추가 |
| `app/sitemap.ts` | 프롬프트 URL 추가 |
| `scripts/seed-prompts.ts` 또는 SQL | 시드 30개 입력 |

### 검증 체크리스트 (구현 후)

- [ ] `npx tsc --noEmit` + eslint 클린
- [ ] `/prompts` 목록·카테고리 필터 동작
- [ ] 상세 페이지: 변수 채우기 → 복사 → Supabase copy_count 실제 증가 확인 (curl로 재조회)
- [ ] 딥링크 버튼: ChatGPT/Claude/Perplexity 실제 프리필 되는지 브라우저 확인
- [ ] canonical/BreadcrumbList/sitemap 반영
- [ ] 배포 후 프로덕션에서 위 항목 재확인, GA 실시간 이벤트 확인

### 주의사항

- 결과 예시(example_output)를 지어내지 말 것 — 실제 실행 결과만 넣거나 비워둘 것
- 시드 프롬프트는 영어 번역투 금지, 실제 한국어 사용자가 쓸 문장으로
- 커밋 시 PROGRESS.md는 이전 세션 잔여 변경이므로 스테이징 제외 (기존 관행)
- CLAUDE.md 참고: 배포는 git push → GitHub Actions → Cloudflare Workers 자동

### 모델 추천 (작업별)

- **시드 프롬프트 30개 작성**: Opus 또는 Fable — 콘텐츠 품질이 이 기능의 얼굴. 저품질 프롬프트 30개는 역효과
- **페이지·DB 구현**: Sonnet으로 충분 — glossary/news 패턴 복제가 대부분인 CRUD 작업
- 권장 흐름: 시드 콘텐츠(Opus/Fable) → 구현(Sonnet) → 최종 검수(아무 모델)

---

## 진행 현황

- [x] Supabase `prompts` 테이블 + RPC 생성 (2026-07-20, 사용자가 SQL Editor에서 실행)
      최초 실행 시 RLS가 기본 활성화돼 INSERT가 막힘 → `alter table prompts disable row level security;` 추가 실행으로 해결
- [x] 시드 프롬프트 30개 **작성** 완료 (2026-07-19) → `scripts/seed-prompts-data.ts`
      - 6카테고리×5개, 편집자픽 6개, 전부 {{변수}} 포함, example_output은 전부 null(실행 결과 확보 전까지 비워둠)
      - tools id 실존 검증·슬러그 중복·타입체크 통과
- [x] 시드 30개 DB **입력** 완료 (2026-07-20) — `scripts/seed-insert.mjs`로 REST API POST, 30/30 성공 확인
- [x] lib/prompts.ts (2026-07-20) — 타입, 카테고리 상수, CRUD, extractVariables/fillTemplate, incrementPromptCopy RPC, getPromptsForTool(역참조)
- [x] /prompts 목록 페이지 (2026-07-20) — 카테고리 필터(`?cat=`), 편집자픽 우선 정렬, 추천 툴 배지는 aiTools에서 실제 이름 조회(id 그대로 노출 안 함)
- [x] /prompts/[slug] 상세 페이지 (2026-07-20) — 변수폼/미리보기/복사/딥링크 전부 구현
      - **딥링크는 ChatGPT·Perplexity만** — Claude `?q=`는 2025-10 보안 이슈로 제거됨, Gemini는 애초 미지원 (웹서치로 확인)
- [x] 헤더·푸터·사이트맵 연결 (2026-07-20) — sitemap에 프롬프트 개별 30개+카테고리 6개+섹션 1개 = 37개 URL 반영
- [x] 보너스: 툴 상세페이지에 "이 툴에서 잘 되는 프롬프트" 역참조 섹션 추가 (2026-07-20, `getPromptsForTool`)
- [x] **실데이터 전체 플로우 검증 완료 (2026-07-20)** — 이 과정에서 실제 버그 1건 발견·수정:
      - 🐛 `app/prompts/[slug]/page.tsx`가 동적 라우트의 한글 슬러그를 `decodeURIComponent` 없이 그대로 조회에 써서 전체 상세페이지가 404 나는 버그. Next.js가 `[slug]` 파라미터를 자동 디코딩해줄 거라 가정한 게 틀림 (`lib/news-slug.ts`는 이미 이 패턴을 알고 decodeURIComponent 처리하고 있었음 — 새 코드에 동일하게 반영해 수정)
      - RPC 복사수 증가 자체는 정상 동작 확인(0→1→검증 후 0으로 리셋). 로컬 curl 테스트에서 한글 파라미터가 씹히는 현상은 Windows Git Bash 셸의 UTF-8 인코딩 아티팩트였고 실제 앱(브라우저 JS)엔 영향 없음 — Node fetch로 재확인 완료
- [x] 타입체크+ESLint 클린 (0 errors, 사전 존재하던 무관한 warning만 잔존)
- [x] 커밋(`b7a3a4c`)·푸시·GitHub Actions 배포 성공, **프로덕션 검증 완료** (2026-07-20)
      한글 슬러그 상세페이지 200(버그 수정 확인), 목록/카테고리필터/사이트맵(37개)/헤더내비/툴페이지 역참조/404 전부 확인

## 1단계 완료 — 다음은 2단계(비로그인 localStorage 스크랩)

1단계 전체 완료. 이어서 할 때는 이 문서 맨 위 "전체 로드맵" 표에서 2단계부터 진행할 것.
2단계 스펙은 아직 상세화 안 됨 — 시작 전에 먼저 상세 스펙을 잡고 진행.

(완료 시 각 항목 체크하고 날짜 기록)
