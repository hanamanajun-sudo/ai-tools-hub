-- AI 뉴스 자동 수집 테이블 설정
-- Supabase SQL Editor에서 실행하세요

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS ai_news (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  content_preview TEXT,
  summary TEXT,
  explanation TEXT,
  importance TEXT,
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  is_visible BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}'
);

-- 2. 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS ai_news_collected_at_idx ON ai_news(collected_at DESC);
CREATE INDEX IF NOT EXISTS ai_news_published_at_idx ON ai_news(published_at DESC);
CREATE INDEX IF NOT EXISTS ai_news_is_visible_idx ON ai_news(is_visible);

-- 3. RLS 활성화
ALTER TABLE ai_news ENABLE ROW LEVEL SECURITY;

-- 4. 정책 설정
-- 공개 읽기 (Next.js 페이지에서 사용)
DROP POLICY IF EXISTS "Public read visible news" ON ai_news;
CREATE POLICY "Public read visible news" ON ai_news
  FOR SELECT USING (is_visible = true);

-- 뉴스 삽입 허용 (로컬 스크립트 사용)
DROP POLICY IF EXISTS "Allow news insertion" ON ai_news;
CREATE POLICY "Allow news insertion" ON ai_news
  FOR INSERT WITH CHECK (true);

-- 관리자 전체 읽기 (admin 페이지용 - anon도 허용)
DROP POLICY IF EXISTS "Admin full access" ON ai_news;
CREATE POLICY "Admin full access" ON ai_news
  FOR ALL USING (true);

-- 확인 쿼리
SELECT 'ai_news 테이블 설정 완료!' AS status;
SELECT COUNT(*) AS news_count FROM ai_news;
