-- ============================================================
-- Supabase RLS 보안 강화 — ai.ktoolu.com
-- 프로젝트 ref: wgnlsmiicynpizkbzyvu
--
-- 목표
--   anon          → SELECT 만 허용
--   INSERT/UPDATE/DELETE → service_role 만
--
-- 대상 테이블
--   ai_model_rank, ai_news, glossary, prompts, reviews
--
-- 실행 위치: Supabase Dashboard → SQL Editor  (전체 붙여넣고 Run)
--
-- ⚠️ 실행 순서 주의
--   1) Hermes .env 에 SUPABASE_SERVICE_ROLE_KEY 추가
--   2) aa_rank.py / ktoolu-news.py 가 service_role 키를 쓰도록 수정
--   3) aa_rank.py 수동 실행 → 10행 저장 성공 확인
--   4) **그 다음에** 이 SQL 실행  (순서를 바꾸면 크론 저장 실패)
--
-- 데이터 보존: 이 SQL 은 정책/권한만 바꿉니다. 기존 행은 삭제되지 않습니다.
-- ============================================================

do $$
declare
  t    text;
  pol  record;
  tbls text[] := array['ai_model_rank', 'ai_news', 'glossary', 'prompts', 'reviews'];
begin
  foreach t in array tbls loop

    -- 0) 테이블이 없으면 건너뜀 (안전장치)
    if not exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      raise notice 'SKIP: public.% 없음', t;
      continue;
    end if;

    -- 1) 기존 정책 전부 제거 (anon_all 같은 광범위 허용 정책 포함)
    for pol in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
      raise notice 'DROP policy % on %', pol.policyname, t;
    end loop;

    -- 2) RLS 활성화
    execute format('alter table public.%I enable row level security', t);

    -- 3) anon: 읽기(SELECT)만
    execute format(
      'create policy anon_select on public.%I for select to anon using (true)', t);

    -- 4) service_role: 쓰기 포함 전체 (service_role은 RLS 우회하지만 의도 명시)
    execute format(
      'create policy service_role_all on public.%I for all to service_role using (true) with check (true)', t);

    -- 5) 테이블 권한 정리 — anon 쓰기 권한 회수, SELECT만 부여
    execute format(
      'revoke insert, update, delete, truncate, references, trigger on public.%I from anon', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant all on public.%I to service_role', t);

    raise notice 'OK: % → anon=SELECT only, service_role=ALL', t;
  end loop;
end $$;

-- 6) 시퀀스(identity/serial) 권한 — service_role INSERT 대비
grant usage, select on all sequences in schema public to service_role;

-- ============================================================
-- 검증 쿼리 1: 정책 목록 확인
--   기대: 각 테이블에 anon_select(SELECT) + service_role_all(ALL) 2개
-- ============================================================
select tablename,
       policyname,
       roles,
       cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('ai_model_rank', 'ai_news', 'glossary', 'prompts', 'reviews')
order by tablename, policyname;

-- ============================================================
-- 검증 쿼리 2: anon 롤의 테이블 권한 확인
--   기대: anon 은 SELECT 만 (INSERT/UPDATE/DELETE 없음)
-- ============================================================
select table_name,
       privilege_type
from information_schema.role_table_grants
where grantee = 'anon'
  and table_schema = 'public'
  and table_name in ('ai_model_rank', 'ai_news', 'glossary', 'prompts', 'reviews')
order by table_name, privilege_type;
