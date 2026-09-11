# HANDOFF — AI 모델 랭킹 수집 크론 (ai.ktoolu.com)

> **작성일**: 2026-09-11
> **작성자**: Hermes (준원 컴퍼니 R5 시스템팀)
> **목적**: 도메인·호스팅 변경 작업을 위해 Claude AI에게 이 파이프라인을 인계
> **수신**: Claude AI (ai.ktoolu.com 도메인/호스팅 이전 작업 담당)

---

## 1. 한 줄 요약

매일 **09:05 KST**에 Hermes 크론이 `aa_rank.py`를 실행 → **Artificial Analysis**(artificialanalysis.ai)에서 AI 모델 지능·속도·비용·컨텍스트·개방성 지표를 스크래핑 → **Supabase `ai_model_rank` 테이블**에 저장 → **ai.ktoolu.com 홈페이지의 "AI 모델 랭킹 TOP10" 표**가 이 데이터를 읽어 표시.

**LLM 호출 없음** (`no_agent` 스크립트) → **토큰 비용 0원**. 순수 스크래핑 + DB 쓰기.

---

## 2. 현재 상태 (2026-09-11 기준)

| 항목 | 값 |
|------|-----|
| Hermes 크론 이름 | **AI모델랭킹수집** |
| job_id | `b3403380eba4` |
| 스케줄 | `5 9 * * *` → **매일 09:05 KST** |
| 실행 스크립트 | `C:\Users\hanam\AppData\Local\hermes\scripts\aa_rank.py` |
| 모드 | `no_agent: true` (LLM 없이 스크립트만 실행) |
| 상태 | ✅ **실행 중** (`enabled: true`, `scheduled`) |
| 최근 실행 | 2026-09-11 09:05 → `ok` |
| 다음 실행 | 2026-09-12 09:05 KST |
| deliver | `local` (결과는 로컬 저장, 메시지 발송 없음) |
| 실행 로그 위치 | `~/AppData/Local/hermes/cron/output/b3403380eba4/` |

> ⚠️ **이 크론은 Hermes가 관리합니다.** Claude가 직접 pause/resume/스크립트 수정을 할 수 없고, 필요하면 회장님(사용자)을 통해 Hermes에 요청해야 합니다. Claude의 담당 범위는 **① 스크립트 수정 ② Supabase 스키마/키 이전 ③ 프론트엔드 연동**입니다.

---

## 3. 데이터 흐름

```
[Artificial Analysis]  https://artificialanalysis.ai/models
        │  (JSON-LD <script type="application/ld+json"> 파싱, 인증 불필요)
        ▼
[aa_rank.py]  매일 09:05 KST, Hermes 크론이 실행
        │  상위 10개 모델 추출 → 회사/슬러그 매핑 → 오늘자 기존 행 삭제 → INSERT
        ▼
[Supabase]  https://wgnlsmiicynpizkbzyvu.supabase.co  →  테이블 `ai_model_rank`
        │  (anon key로 REST 접근)
        ▼
[ai-tools-hub]  components/model-rank-table.tsx
        │  createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
        │  .from("ai_model_rank").select("*").order(collected_date desc).order(rank asc).limit(10)
        ▼
[ai.ktoolu.com 홈]  app/page.tsx → <ModelRankTable />  ("AI 모델 랭킹 TOP10" 섹션)
```

---

## 4. 스크립트 상세 (`aa_rank.py`, 219줄)

| 단계 | 함수 | 하는 일 |
|------|------|---------|
| 1 | `fetch_aa_data()` | AA 페이지 HTML에서 `ld+json` 블록 전부 파싱 → 데이터셋 dict (`Intelligence`, `Speed`, `Cost per Task`, `Context Window`, `Artificial Analysis Openness Index: Score`) |
| 2 | (main) | `Intelligence` 지표 내림차순 **상위 10개** 선정 |
| 3 | `get_company_info()` | `COMPANY_MAP`으로 모델명 → 회사명 + 사이트 내부 툴 slug 매핑 (Claude→claude, GPT→chatgpt, Gemini→gemini, Grok→grok 등) |
| 4 | (main) | **저장 전 오늘 날짜 기존 행 DELETE** (`collected_date=eq.<오늘>`) → 중복 방지 |
| 5 | (main) | 10행 Supabase INSERT |
| 6 | (main) | 변화 감지 → 순위 상승/하락/신규 진입 + 최속/최저비용 한 줄 뉴스 생성 (stdout 출력) |
| 7 | (main) | 로컬 캐시 저장: `hermes/scripts/../cache/model-rank-latest.json` |

**저장 컬럼** (실측 스키마, 2026-09-11 확인):

| 컬럼 | 타입(추정) | 예시/설명 |
|------|-----------|----------|
| `id` | int (PK, auto) |  |
| `label` | text | `Claude Fable 5.1 (max with fallback)` ← 모델 표시명 |
| `company` | text | `Anthropic` |
| `company_slug` | text/null | `claude` (사이트 내부 툴 페이지 slug, 없으면 null) |
| `rank` | int | 1~10 |
| `intelligence` | numeric | AA 지능 지수 |
| `speed` | numeric | 중간 출력 속도 (tok/s) |
| `cost` | numeric | 작업당 비용 (USD) |
| `context` | int | 컨텍스트 윈도우 (토큰) |
| `openness` | numeric | 개방성 지수 |
| `collected_at` | timestamptz | ISO8601 (KST) |
| `collected_date` | text (`YYYY-MM-DD`) | 날짜별 스냅샷 키 |

**현재 데이터**: 총 **360행** (날짜별 스냅샷 누적), 최신 **2026-09-11**, 1위 `Claude Fable 5.1`.

> 📌 **히스토리 보존이 설계 의도입니다.** 날짜별 스냅샷이 쌓여서 순위 변화 추적이 가능합니다. **기존 행 삭제 금지.**

---

## 5. 인증 / 키 관리

| 용도 | 키 | 위치 |
|------|-----|------|
| Supabase (스크립트) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ① Hermes `C:\Users\hanam\AppData\Local\hermes\.env` ② 없으면 `ai-tools-hub\.env.local` (폴백) |
| Supabase (프론트) | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ① `wrangler.jsonc`의 `vars` ② 로컬은 `.env.local` |
| AA 스크래핑 | 없음 | `User-Agent: Mozilla/5.0` 헤더만 |

- Supabase URL은 **스크립트에 하드코딩**돼 있음: `aa_rank.py:17` `SUPABASE_URL = "https://wgnlsmiicynpizkbzyvu.supabase.co"`
- anon key로 **INSERT/DELETE가 되려면 RLS 정책이 열려 있어야** 함 (새 프로젝트로 옮기면 이 정책을 반드시 재현)

---

## 6. 도메인 · 호스팅 변경 영향 ⭐ (이번 작업의 핵심)

### 현재 배포 구조
- **호스팅**: Cloudflare Workers (OpenNext 어댑터)
  - `wrangler.jsonc` → `name: "ai-tools-hub"`, `account_id: f42bab346dd367772b859bec5f7d4611`
  - `open-next.config.ts` → `opennextjs-cloudflare build`
  - 배포 명령: `npm run deploy` (= `opennextjs-cloudflare build && opennextjs-cloudflare deploy`)
  - R2 버킷 바인딩 `BLOG_ASSETS` → `blog-assets`
  - `keep_names: false` (next-themes 인라인 스크립트의 `__name` ReferenceError 회피용 — **절대 임의 변경 금지**)
- **vercel.json**: 모든 경로 `/(.*)` → `https://ai.ktoolu.com/$1` **permanent redirect** (레거시 Vercel → 도메인 이전용 잔재)
- **커스텀 도메인**: `wrangler.jsonc`에 `routes` 항목이 **없음** → `ai.ktoolu.com`은 **Cloudflare 대시보드에서 수동 연결**된 상태로 추정. 도메인 변경 시 여기를 확인할 것.

### 케이스 A — Supabase 프로젝트도 함께 이전하는 경우
1. 새 프로젝트에 `ai_model_rank` 테이블 생성 (섹션 4의 스키마 + `id` auto increment)
2. **RLS 정책 재현**: anon key로 `SELECT / INSERT / DELETE` 허용 (기존과 동일하게)
3. `aa_rank.py:17`의 `SUPABASE_URL` 하드코딩 수정
4. `wrangler.jsonc` `vars`의 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 교체
5. `.env.local` (로컬 개발) 교체
6. Hermes `.env`의 `NEXT_PUBLIC_SUPABASE_ANON_KEY`도 동기화 (스크립트가 이걸 먼저 읽음 — **빠뜨리기 쉬움**)
7. 기존 360행 마이그레이션(선택): 스냅샷 히스토리 보존하려면 export/import
8. `npm run deploy` 재배포 후 홈에서 랭킹 표 렌더 확인

### 케이스 B — 도메인만 바꾸는 경우
1. `vercel.json`의 redirect destination URL 수정
2. Cloudflare 커스텀 도메인 재연결
3. 사이트 내 하드코딩된 절대 URL / OG 태그 / canonical 검색 후 수정
4. **크론 스크립트는 도메인과 무관** (AA + Supabase만 접근) → **스크립트 수정 불필요** ✅

### 두 경우 공통
- **기존 데이터 무변경 원칙**: `ai_model_rank`, `ai_news`, `glossary` 등 기존 테이블/레코드 삭제 금지
- 스크립트는 `collected_date` 기준 오늘자 행만 지우고 다시 쓰는 구조이므로 **재실행해도 하루 1세트만** 남음

---

## 7. 운영 명령

```bash
# 수동 실행 (테스트)
python "C:\Users\hanam\AppData\Local\hermes\scripts\aa_rank.py"

# 크론 상태 확인
hermes cron list

# 크론 일시중지 / 재개  (job_id: b3403380eba4)
hermes cron pause b3403380eba4
hermes cron resume b3403380eba4

# 실행 로그
ls ~/AppData/Local/hermes/cron/output/b3403380eba4/

# 로컬 캐시 (최신 랭킹+뉴스)
cat "C:\Users\hanam\AppData\Local\hermes\scripts\..\cache\model-rank-latest.json"
```

프론트 로컬 확인:
```bash
cd "C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\ai-tools-hub"
npm run dev        # 로컬 개발
npm run deploy     # Cloudflare 배포
```

---

## 8. 실패 모드 / 제약

| 증상 | 원인 | 대처 |
|------|------|------|
| `[ERROR] Artificial Analysis 데이터 수집 실패` 후 종료 | AA 사이트 HTML 구조(ld+json) 변경 | `fetch_aa_data()` 파싱 로직 점검 |
| `[ERROR] Supabase key not found` | Hermes `.env` / `.env.local`에 anon key 없음 | 키 위치 3곳 확인 (섹션 5) |
| 저장 0/10 성공 | RLS 정책 문제 또는 URL 오류 | 새 Supabase 프로젝트면 RLS 재확인 |
| 홈에 랭킹 표 안 보임 | `error \|\| rows.length === 0`이면 컴포넌트가 `null` 반환 (조용히 숨김) | Supabase 데이터 존재 여부 + env 키 확인 |
| `__name is not defined` (다크모드 깜빡임) | wrangler esbuild keepNames | `wrangler.jsonc`의 `"keep_names": false` 유지 |

**의존성**: `aa_rank.py`는 외부 라이브러리 없이 **Python 표준 라이브러리만** 사용 (`urllib`, `json`, `re`). `requests`/`supabase-py` 불필요.

---

## 9. Claude가 하지 말아야 할 것

1. ❌ `ai_model_rank` / `ai_news` / `glossary` 테이블 또는 **기존 레코드 삭제**
2. ❌ Hermes 크론 삭제 (중지/재개만, 그것도 회장님 경유)
3. ❌ `wrangler.jsonc`의 `keep_names: false` 제거 (다크모드 버그 재발)
4. ❌ anon key 등 **시크릿을 문서/깃에 평문 저장** (환경변수/`wrangler secret` 사용)

---

## 10. 연관 시스템 참고

같은 Supabase 프로젝트(`wgnlsmiicynpizkbzyvu`)를 공유하는 다른 크론들 — 이번 이전 작업 시 **함께 고려**:

| 크론 | 스크립트 | 스케줄 | 상태 |
|------|---------|--------|------|
| AI뉴스수집 | `ktoolu-news.py` | 매일 09:00 | ⏸ 중지됨 (2026-09-11) |
| 크루즈뉴스수집 | `cruise-news.py` | 매일 09:00 | ⏸ 중지됨 (2026-09-11) |
| 주간리서치수집 | `r1-research.py` | 월 07:00 | ✅ 실행 중 |
| AI모델랭킹수집 | `aa_rank.py` | 매일 09:05 | ✅ 실행 중 (이 문서의 대상) |

- 참고: AI뉴스수집·크루즈뉴스수집은 2026-09-11 회장님 지시로 중지(정의는 보존, 삭제 아님)
- 위 스크립트들도 모두 `SUPABASE_URL`을 하드코딩하고 있으므로, Supabase 이전 시 **4개 전부** 수정 필요

---

*문의: 회장님 경유 → Hermes (R5 시스템팀)*
*원본 스크립트: `C:\Users\hanam\AppData\Local\hermes\scripts\aa_rank.py`*
