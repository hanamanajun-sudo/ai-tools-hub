# ai.ktoolu.com 진행 현황

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
