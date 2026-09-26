# ktoolu.com 진행 현황

> 2026-09-12부로 이 저장소가 **ktoolu.com 본체**가 되었다. 구 ktoolu.com 코드베이스
> (`클로드cowork/ktoolu.com`, Vercel)는 더 이상 도메인을 서빙하지 않는다.

## 2026-09-26 — 핵심 도구 3개 갱신, 가격 비교 글 갱신, Notion 표 렌더링 버그

### 오늘 한 일

- **도구 16개 점검 → 낡은 8개 sitemap 제외**(`9618a26`): 몇 세대 전 모델을 현재형으로 쓴 페이지
  (chatgpt·claude·gemini·cursor·deepseek·perplexity·kling·runway)
- **ChatGPT·Claude·Gemini 페이지 갱신**(`a76e943`): 공식 요금제 페이지(chatgpt.com/pricing,
  claude.com/pricing, gemini.google/kr/subscriptions) 기준. 모델·요금제·가격·기능 교체, 커뮤니티
  요약의 낡은 사실 정리(출처 인용문은 원문 유지). sitemap에 3개 복귀 → 52개.
  Gemini AI Pro 29,000원만 공식 페이지에 원화 표기가 없어 복수 보도로 확인
- **Notion 글 "AI 구독료 비교"(`ai-subscription-price-comparison-2026`) 가격 갱신**: 표 5개와
  사실 문장만 수정, 본인 사용 소감은 그대로. 상단에 "9월 26일 갱신" 명시. Grok은 공식 페이지가
  JS로 가격을 불러와 확인 불가 → 2차 출처 교차 확인값, 모델 버전은 출처끼리 엇갈려 뺐다
- **렌더러 버그 수정**(`lib/notion.ts`): 최상위 블록만 가져오고 `table` 케이스가 없어서
  **표·들여쓴 블록이 통째로 사라지고, 100블록 넘는 글은 뒷부분이 잘리고 있었다.**
  가격 비교 글은 가격표 없이 공개돼 있었음. 영향받던 글 12개(hub 8 · ktoolu 4), 그중
  `hermes-desktop-10-settings`는 100블록 초과로 결말까지 잘림. `fetchBlockTree`(페이지 넘김 +
  2단계 재귀)와 표 렌더링 추가, 라이브에서 확인

### 다음에 할 일

- [ ] Search Console URL 검사: 가격 비교 글(옛·새 주소), /tools/chatgpt·claude·gemini 추가 가능
- [x] **도구 페이지 정리**(방향 전환, 9/26 합의) — 핵심 20개(`CORE_TOOL_IDS`, 사용자 선정)만
      관리, 나머지 35개는 간략 모드(설명 + 공식 링크) + noindex. 짧은 설명의 틀린 사실 11건 수정,
      Nano Banana 가짜 URL 수정, Sora 서비스 종료 반영, **Muse(Meta) 추가**. bolt는 sitemap에서 제외
- [x] 핵심 9개 갱신 완료(9/26): cursor·perplexity·deepseek·capcut·suno·eleven-labs·manus·kling·veo.
      공식 페이지 직접 확인: Cursor·Perplexity·Suno·ElevenLabs. 복수 보도 교차 확인: CapCut·Manus·
      Kling·Veo·Cursor Pro+/Ultra(페이지에 "복수 보도 기준" 명시). 옛 URL 3건 교체
      (cursor.sh·suno.ai·kling.kuaishou.com). sitemap 61개(도구 20개)
- [ ] 아직 가격 미검증인 핵심 5개: midjourney·seedance·grok·n8n·hermes (sitemap엔 있음)
- [ ] 복수 보도 기반 값(CapCut 미국 정가, Manus 크레딧, Kling 요금, Cursor Pro+/Ultra)은
      공식 페이지를 브라우저로 직접 열어 대조할 수 있으면 대조할 것
- [ ] Muse 한국 출시되면 description·cons·comparisonNotes 갱신
- 원칙: 가격은 가격 비교 글 한 곳에만(분기 갱신), 새 글은 날짜 박힌 체험형
- [ ] 가격 비교 글 제목 "(2026년)"·PublishedAt은 그대로 둠 — 사이트에 "수정일" 표시 기능은 없음

## 2026-09-25 (계속) — sitemap 축소, crop 버그 수정, LINE 스티커 가이드

### 오늘 한 일

- **Search Console 진단**: 색인 8개(6월부터 정체) / 발견됨-색인 안 됨 145개 / 3개월 노출 19·클릭 1.
  색인된 8개는 전부 **옛 주소**(ai.ktoolu.com/blog·tools 7개 + 옛 홈)이고 마지막 크롤이 9/7 이전 —
  도메인 이전 후 구글이 아직 다시 오지 않음. 노출 검색어는 전부 "헤르메스 데스크톱",
  "제미나이 코드 어시스트 가격" 같은 도구 사용 쿼리. 기술적 차단(noindex 등)은 없음
- **sitemap 146 → 56개**(`d6389e9`): 정적 6 + 글 전체 + 도구 16개(랭킹 상위 + 색인된 bolt +
  crop·story). 프롬프트·카테고리·나머지 도구 제외. 정적 페이지 `lastModified: new Date()`
  (전 URL "오늘 수정됨" 가짜 신호)도 제거
- **crop.ktoolu 버그 수정 및 배포** — 대표로 지정한 스티커가 `main.png`(370x320)로만 나가서
  ① 대표 이미지 규격(240x240) 위반 ② 세트에서 1개가 빠져 개수(8/16/24/32/40) 위반 ③ 탭 이미지(96x74)
  없음. 수정 후 전 스티커 + `main.png` 240x240 + `tab.png` 96x74, 개수가 틀리면 경고.
  Playwright로 수정 전/후와 라이브 모두 ZIP 내용·크기 검증. 3개 언어 푸터에 apex 링크 추가
- **`/guides/line-sticker-size` 신설**(`eaaf0a3`): LINE 공식 가이드라인을 직접 확인한 수치만 사용.
  crop 도구 페이지를 실제 기능 기준으로 다시 쓰고 "함께 보면 좋은 가이드" 박스로 연결

### 다음에 할 일

- [ ] Search Console: sitemap 재제출, URL 검사로 옛 주소 7개 → 새 주소·가이드 색인 요청
- [ ] **crop.ktoolu는 git 저장소가 아님** — 되돌릴 수단이 Pages 배포 이력뿐. git 저장소로 만들 것.
      수정 전 백업: `클로드cowork/crop.ktoolu.backup-20260925` (git 전환 후 삭제 가능)
- [ ] LINE ZIP 파일명 규칙(stamp_01.png vs 01.png 등)은 공식 문서에서 확인 못 함 —
      실제 제출 때 업로드 화면에서 확인 필요
- [ ] 애드센스는 색인 30개+ & 노출이 꾸준히 붙은 뒤 신청

## 2026-09-25 — 순수 유튜브 글 8편 비공개

사이트 정체성(AI 도구 + 직접 만든 것)과 안 맞는 순수 유튜브 글 8편을 Notion에서
`Published` 해제(삭제 아님, 체크만 다시 켜면 복원). 라이브 `/posts` 42→34편, 해당 URL 404.
AI 각도를 붙였던 나머지 6편(`2026-youtube-*`)은 유지.

복원 대상 slug (ktoolu Notion DB): `youtube-video-title-formula-10`,
`before-1000-subscribers-do-dont`, `smartphone-youtube-recording-setup`,
`first-youtube-video-roadmap`, `youtube-channel-art-banner-guide`,
`thumbnail-ab-testing-click-rate`, `shorts-hook-20-techniques`, `youtube-channel-name-niche-50`

## 2026-09-13 — 장애: 동시 요청 시 사이트 전체 먹통 (Error 1102)

### 오늘 한 일

사용자 신고: ktoolu.com에서 블로그·프롬프트 클릭 시 "Worker exceeded resource
limits", 헤더/푸터 다른 버튼도 무반응.

**1차 진단(틀림 아닌 절반만 맞음): 시간 기반 revalidate.** `wrangler tail`로
동시 요청 10개를 보내 재현 → 실제 로그에서 `"Worker's code had hung"` 예외 확인.
`/`, `/posts`, `/prompts`, `/sitemap.xml`이 `export const revalidate = 3600`을
쓰는데 `open-next.config.ts`에 큐 override가 없어(OpenNext Cloudflare는 시간
기반 재검증에 큐가 필수) 동시 요청에서 재검증이 멈추는 것으로 보고 4곳의
revalidate를 제거·배포(`6ad3008`). `/`, `/sitemap.ts`는 dynamic API가 없어
revalidate만 빼면 빌드 시점에 얼어붙으므로 `force-dynamic` 명시.

**재현 테스트를 계속 밀어붙여서 진짜 원인을 찾음.** 배경 curl 여러 개(`&` + `wait`)로
재현을 시도했더니 간헐적으로만 실패해 "고쳐진 듯" 보였는데, 이 테스트 방식 자체가
신뢰할 수 없었다(Git Bash 백그라운드 프로세스가 클라이언트 쪽 `000` 실패를 서버
장애와 섞어 보고함). `xargs -P`/`curl -Z` 같은 **진짜 병렬 요청 도구**로 바꾸자
`/contact`(revalidate가 있지도 않은 순수 정적 페이지) 하나에 동시 요청 6개만 보내도
**5개가 정확히 클라이언트 타임아웃(10초)까지 매달리는 걸 100% 재현**함.

**진짜 원인: OpenNext Cloudflare의 기본 증분 캐시.** 캐시 override를 하나도
안 주면(이 프로젝트가 그랬음) 정적 페이지 캐시 조회에 single-flight 락이 걸리는데,
그 락이 정상적으로 안 풀려 같은 경로에 동시 요청이 들어오면 **첫 요청만 성공하고
나머지는 락 해제를 기다리다 Cloudflare의 hung-request 감지에 걸려 죽는다.**
revalidate 유무와 무관 — 순수 정적 페이지도 걸림.

**해결(`4c4ca81`):**
- R2 버킷 신규 생성 `ktoolu-cache` (`npx wrangler r2 bucket create`)
- `wrangler.jsonc`에 `NEXT_INC_CACHE_R2_BUCKET` 바인딩(캐시 전용, 이미지용
  `BLOG_ASSETS`와 별개) + `WORKER_SELF_REFERENCE` 서비스 바인딩(공식 요구사항) 추가
- `open-next.config.ts`에 `incrementalCache: r2IncrementalCache` 설정.
  **큐(Durable Object, 유료 플랜 필요)는 설정 안 함** — 시간 기반 재검증을 전부
  빼둬서 필요 없음
- 배포 후 동일 조건(`/contact` 동시 6개, 이어서 20-way 혼합 부하)으로 재검증 →
  전부 200. 사용자 브라우저 확인 완료

### 완료된 항목

- [x] Error 1102 근본 원인 규명 및 수정 — R2 incrementalCache override 추가
- [x] 시간 기반 revalidate 4곳 제거(부수적으로 필요했던 조치, 유지)
- [x] 배포 후 동시 요청 부하 테스트로 재현·수정 확인 (6-way, 15-way, 20-way)
- [x] 사용자 브라우저에서 정상 동작 확인

### 다음 세션에서 알아야 할 것 (추가)

- **`open-next.config.ts`가 더 이상 빈 기본값이 아니다.** `incrementalCache:
  r2IncrementalCache` 설정돼 있고, 이게 `NEXT_INC_CACHE_R2_BUCKET`(R2 버킷
  `ktoolu-cache`)과 `WORKER_SELF_REFERENCE` 서비스 바인딩에 의존한다. 이 두 바인딩을
  `wrangler.jsonc`에서 지우면 다시 이번 장애가 재현된다
- **동시성 버그는 부하 테스트 도구를 제대로 골라야 드러난다.** 백그라운드 curl(`&`)은
  신뢰할 수 없다 — `xargs -P` 또는 `curl -Z`(진짜 병렬)를 쓸 것
- Cloudflare Workers Free 플랜에서도 R2 incrementalCache는 쓸 수 있다(Durable
  Object 큐만 유료 플랜 필요). 시간 기반 재검증(`revalidate = N`)을 쓰지 않는 한
  큐 없이도 안전
- 새로 라우트에 `export const revalidate = N`(시간 기반)을 추가하고 싶어지면,
  큐를 같이 설정하지 않는 한 **하지 말 것** — 대신 `force-dynamic`이나 fetch 레벨
  캐싱을 고려

## 2026-09-12 작업 내용 — 도메인 통합 (ai.ktoolu.com → ktoolu.com)

### 오늘 한 일

**0. 방향 전환: "리뉴얼"에서 "통합"으로**

기존 ktoolu.com 리뉴얼을 계속 밀기보다 ai.ktoolu.com의 자산을 ktoolu.com으로 합치자는
제안에서 출발해, 실사 후 **합치는 방향을 반대로 뒤집었다.**

- 처음 판단은 "ai.ktoolu.com 콘텐츠를 ktoolu.com 코드베이스로 가져온다"였으나, 실제로
  열어보니 ai-tools-hub 쪽이 **모든 면에서 본체 자격**이었다 — Next 16/React 19/Tailwind 4,
  이미 Cloudflare Workers(OpenNext)에서 운영 중, OG 이미지·R2 이미지 캐싱·JSON-LD·공유
  버튼 등 인프라 완비. 반면 구 ktoolu.com은 Next 15/React 18/Tailwind 3 + Vercel
- **옮길 게 적은 쪽을 옮긴다**는 원칙으로, 구 ktoolu.com의 글 26편·페이지 6개만 이쪽으로
  이식하고 도메인만 apex로 바꾸는 계획으로 전환. 호스팅 이전 작업 자체가 사라졌다
- ai.ktoolu.com이 이미 이 Worker에서 서빙되고 있었으므로 "workers.dev에서 먼저 검증"
  같은 안전한 스테이징 단계는 존재하지 않았고, 배포 = 즉시 라이브임을 확인하고 진행

**1. 폐기 — AI 뉴스 189편 · 용어집 288개 · 리뷰 기능** (`299db84`, `aa6474f`, `cdf4bf0`)

- 뉴스를 샘플링해보니 **타 매체(The Verge 등) 기사를 요약·재작성한 900자짜리 자동 생성물**
  이었고, 구성도 완전히 템플릿화돼 있었다. 애드센스 "스크랩된 콘텐츠" 정책에 직접 걸리는
  성격이라, 통합 후 apex(애드센스 예정 도메인)에 얹는 건 자산 흡수가 아니라 부채 이전
- 용어집은 항목당 정의가 **100자**. 288개를 개별 상세 페이지로 색인시키면 뉴스보다 얇은
  페이지를 대량 생산하는 셈. 뉴스에 딸린 부속물이라 함께 폐기
- "공개하되 noindex" 안도 검토했으나 **애드센스 심사는 색인 여부와 무관하게 사이트를 본다**는
  점에서 해법이 못 됨을 확인. 개인 소비용이면 비공개가 정답이라는 결론
- 리뷰 기능은 트래픽이 없어 1건뿐이었고, RLS를 좁히면 작성 경로가 어차피 막혀 기능째 제거.
  `/admin`(리뷰 전용, 어디서도 링크 안 됨)과 **인증 없이 R2에 쓰기·삭제를 하던
  `/api/debug/r2`** 도 함께 제거
- 프롬프트 복사 카운터는 RLS 강화 후 401로 **조용히 실패**하고 있었다. `trackEvent`로 같은
  신호를 이미 GA에 보내고 있어 중복이라 카운터를 제거하고 정렬 기준을 `created_at`으로 교체

**2. 글 42편 병합 — 두 Notion DB를 하나의 `/posts`로** (`cd42a14`, `09d7aa1`)

- `/blog` → `/posts`로 경로 통일(구 ktoolu.com의 URL 규칙 승계)
- `lib/notion.ts`가 **서로 다른 두 integration**(같은 워크스페이스, 다른 토큰)을 병렬 조회해
  병합. hub DB(Description 속성 + 페이지 커버)와 ktoolu DB(Summary + CoverImage URL 속성
  + NoIndex 체크박스)의 스키마 차이를 각각 매핑
- `lib/post-categories.ts` 신설 — 원본 Notion 값은 건드리지 않고 노출 시점에만 6개 통합
  카테고리로 정규화. 실측 분포: 유튜브&숏폼 14 · **AI 개발·자동화 13(신설)** · AI 도구 비교 9 ·
  AI 콘텐츠 제작 6 · 글쓰기&소설 0 · 게임·앱 만들기 0
- **구 ktoolu.com 26편의 slug를 그대로 유지** — 2026-09-04에 canonical 버그를 고쳐 겨우
  색인시킨 URL이라 경로가 바뀌면 그 작업이 무효가 된다
- sitemap이 글 목록 페이지만 담고 개별 글은 빠져 있던 것도 함께 수정(noIndex 글 제외 로직 포함)

**3. 페이지 이식 — about·contact·privacy·story·자체 도구** (`b05ae72`, `5d29778`, `e3d99eb`)

- about: 구 ktoolu.com의 브랜드 서사(Cthulhu 유래, 로고, 모토)를 뼈대로 삼고 AI 도구
  디렉토리·AI 모델 랭킹 축을 추가. 로고 1.39MB→62KB 압축 이식
- privacy: 두 원본을 그대로 합치지 않고 **현재 코드 기준 사실관계로 재작성.** 양쪽 다 이미
  삭제된 기능을 고지하고 있었다(ai 쪽은 리뷰·별점, ktoolu 쪽은 2026-09-06에 없앤 뉴스레터).
  호스팅도 Vercel→Cloudflare로 정정
- `/story` 랜딩 + 대기명단 API 이식. 디자인 토큰 변환 중 **성공 메시지가 `bg-primary`(라이트
  모드에서 거의 검정) 위에 `text-foreground`(거의 검정)로 렌더될 뻔한 것**을 발견해 수정.
  실제 제출까지 종단 검증 후 테스트 데이터는 archive 처리
- crop·story를 `/made` 같은 별도 경로로 분리하지 않고 **외부 도구 52개와 같은 `/tools`
  디렉토리에 편입**("내 도구도 같이 소개한다"는 방향). "🐙 ktoolu 제작" 배지 + waitlist는
  "베타 대기중"으로 정직하게 표시. `expertRating`은 의도적으로 비움 — 남의 도구를 평가하는
  6축 점수를 자기 도구에 적용하면 자기 상찬이 된다
- **maker.ktoolu(티어메이커)는 제외** — `maker.ktoolu.com`이 NXDOMAIN(미배포)이라
  디렉토리에 올리면 죽은 링크가 된다

**4. 도메인 전환** (`f133179`)

- Cloudflare 대시보드에서 apex의 Vercel CNAME 삭제 → Worker 커스텀 도메인 추가
- BASE_URL 상수 9곳·metadataBase·robots sitemap URL·화면 브랜드 표기를 apex로 일괄 교체
- **네이버 소유 확인 토큰을 배열로 2개 유지** — 통합 기간에 한 코드베이스가 양쪽 호스트를
  서빙하는데 네이버는 메타 태그로 확인하므로, 한쪽만 남기면 다른 쪽 인증이 끊긴다
  (구글은 apex가 DNS TXT 기반이라 영향 없음)

**5. 리디렉션 — 세 번 시도해서 엣지로 안착** (`c86ad1e` → `5410a6c` → `0b6648c`)

같은 문제를 세 가지 방식으로 풀어본 기록. 다음에 같은 작업을 할 때 1·2번은 건너뛸 것:

1. **`proxy.ts`(미들웨어)** → CI 빌드 실패. OpenNext가 `Node.js middleware is not currently
   supported`로 거부하는데, Next.js 16의 proxy 규약은 기본이 Node 런타임이라 맞지 않음
2. **`next.config.ts` redirects + `has:host`** → 빌드는 통과했지만 **라이브에서만 500 발생.**
   `generateStaticParams`를 쓰는 라우트(`/tools/[slug]`, `/category/[category]`)에서만
   터져서 로컬 dev 서버로는 전혀 안 보였다. 색인된 59개 URL이 500을 내는 상태라 즉시 되돌림
3. **Cloudflare Redirect Rules(엣지)** → 정답. 워커에 닿기 전에 처리되므로 OpenNext 제약과
   무관해진다. 규칙 2개를 **조건이 서로 겹치지 않게** 구성해 순서 의존을 제거
   - `/blog/*` → `/posts/*` (경로가 바뀐 구간이라 단순 301이면 apex에서 404)
   - 나머지 → apex (단, `/news`·`/glossary` 제외)
- `/news`·`/glossary`는 리디렉션에서 빼고 **410**으로 응답(`app/` 아래 catch-all 라우트
  핸들러). apex에 없는 경로를 301로 보내면 "404로 가는 리디렉션"이 되어 그냥 404보다 나쁘고,
  전체를 301로 덮으면 폐기한 뉴스 189편이 apex로 되살아난다

**6. Supabase RLS 보안 강화 (Hermes 실행)**

- anon 키가 `wrangler.jsonc`(깃)와 브라우저 번들에 공개돼 있는데 **RLS가 anon에 INSERT/
  DELETE를 허용**하고 있었다. 사이트 방문자 누구나 `ai_model_rank` 360행 히스토리를 지우거나
  가짜 순위를 넣을 수 있는 상태
- 키 교체로는 해결 안 되는 문제(새 키도 똑같이 공개됨)라 **RLS를 anon=SELECT 전용으로 좁히고
  크론은 service_role 키를 쓰도록** 전환. 5개 테이블 전부 401 차단 실측 검증, 데이터 보존 확인
- Hermes가 작업 중 **`aa_rank.py`의 `.env` 경로 버그**(`LOCALAPPDATA` 뒤에 `.env`를 붙여
  `AppData\Local\.env`를 보고 있었음)를 발견해 수정 — Hermes `.env`를 한 번도 못 읽고 있었다

### 완료된 항목

- [x] AI 뉴스 189편·용어집 288개·리뷰 기능·`/admin`·`/api/debug/r2` 제거 (`299db84`, `aa6474f`, `cdf4bf0`)
- [x] 두 Notion DB 병합 → `/posts` 42편, 카테고리 6개 정규화, sitemap 개별 글 포함 (`cd42a14`, `09d7aa1`)
- [x] about·contact·privacy 재작성, `/story` + 대기명단 이식, 자체 도구 디렉토리 편입 (`b05ae72`, `5d29778`, `e3d99eb`)
- [x] ktoolu.com DNS를 Worker로 전환, BASE_URL·브랜드 표기 일괄 교체, 네이버 토큰 2개 유지 (`f133179`)
- [x] Cloudflare Redirect Rules 2개로 구 서브도메인 → apex 301, 폐기 섹션 410 (`0b6648c` + 엣지 규칙)
- [x] Supabase RLS anon=SELECT 전용으로 축소, 크론 service_role 전환 (Hermes)
- [x] 라이브 전수 검증 — apex 11개 경로 200 / 404 캐치올 / robots·sitemap Content-Type /
      OG 이미지 / 대기명단 종단 / 구 호스트 301 1홉 착지 / 폐기 섹션 410 / www 경유 정상

### 다음에 할 일

**지금 할 것**

- [ ] **Hermes PAT revoke** — `.env`의 `SUPABASE_ACCESS_TOKEN`. RLS 작업이 끝나 용도가
      없는데 계정 전체 관리자 권한을 가진 가장 높은 권한의 자격증명이다 (30일 자동 만료)
- [ ] Search Console 정리
  - `ktoolu.com/sitemap.xml` **재제출**(삭제 X) — 표시된 33개는 옛 Vercel 시절 값이고
    지금 같은 주소가 146개를 서빙 중
  - `ai.ktoolu.com/sitemap.xml` 항목 **삭제** — 현재 301로 apex sitemap을 가리키는 중복 항목
  - 색인생성 → 삭제 → 임시 삭제에 `ai.ktoolu.com/news`, `ai.ktoolu.com/glossary` 접두어 제출
    (⚠️ `ai.ktoolu.com/` 전체를 제출하면 나머지 경로의 301 이전 신호까지 차단된다)

**순서 의존 있음 — 반드시 이 순서로**

- [ ] `www.ktoolu.com` 자립: 현재 `www → Vercel → 301 → apex`로 동작 중. Cloudflare
      Redirect Rule로 대체해야 함
- [ ] 그다음 Vercel 프로젝트 정리 (롤백 경로라 2~4주 보존 권장) + `_vercel` TXT 2개 제거

**여유 있을 때**

- [ ] `afterlist.ktoolu.com`에 ktoolu.com으로 돌아오는 링크 추가 — 광고 없음·1페이지 경험물로
      조건은 잘 지켜져 있으나 **apex로 오는 도관이 없다.** 공유로 유입이 생길 수 있는 유일한
      비-SEO 자산이라 비용 대비 효과가 가장 좋은 항목
- [ ] 구 ktoolu.com 저장소 아카이브 또는 README에 이전 안내
- [ ] 홈 히어로 카피 개편 검토 — 이번엔 도메인/브랜드만 기계적으로 교체해서 여전히
      "최고의 AI 도구를 한곳에서 탐색하세요"(디렉토리 중심)다. 정리된 4개 축(도구 소개 /
      내가 만든 도구 / 트렌드(모델 랭킹) / 직접 만든 기록)을 반영할지는 별도 판단
- [ ] 색인 안정화 후 애드센스 신청 (급하지 않음). `next/script` + `afterInteractive` 필수
- [ ] 대기명단 신청자에게 실제로 소식을 보낼 발송 수단은 여전히 없음

### 다음 세션에서 알아야 할 것

- **배포는 GitHub Actions(Ubuntu)로만 된다.** 로컬 Windows에서 `npm run deploy`는
  OpenNext가 Windows를 지원하지 않아 `EXIT=127`로 실패한다. `master`에 푸시 → 자동 배포
- **`deploy.yml`이 런타임 시크릿을 덮어쓴다.** GitHub 시크릿이 비어 있으면 빈 문자열로
  `wrangler secret put`을 실행한다. 실제로 첫 배포에서 `NOTION_API_KEY_KTOOLU`가 빈 값으로
  덮여 `/posts`가 16편만 나왔다. 새 시크릿을 추가할 땐 **GitHub 시크릿과 Worker 시크릿 양쪽**을
  맞춰야 한다
- **로컬 빌드 성공은 검증이 아니다.** 리디렉션 500은 빌드도 로컬 dev도 통과하고 라이브에서만
  드러났다. 배포 후 실제 URL을 curl로 두드릴 것
- 한 Worker가 `ktoolu.com`과 `ai.ktoolu.com`을 함께 서빙한다. 구 호스트는 엣지 규칙이
  301로 보내고, `/news`·`/glossary`만 워커까지 도달해 410을 받는다

---

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
