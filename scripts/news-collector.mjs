#!/usr/bin/env node
// AI 뉴스 자동 수집 및 요약 스크립트
// 실행: node scripts/news-collector.mjs

import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env.local 로드
const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = await readFile(join(__dirname, '..', '.env.local'), 'utf-8').catch(() => '');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.trim() && line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const eqIndex = line.indexOf('=');
      return [line.slice(0, eqIndex).trim(), line.slice(eqIndex + 1).trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OLLAMA_URL = 'http://127.0.0.1:11434'; // localhost는 IPv6(::1)로 해석될 수 있어 127.0.0.1 사용
const MODEL = 'qwen2.5:7b';
const MAX_ARTICLES_PER_RUN = 8; // 한 번에 최대 처리 수 (ollama 부하 고려)
const LOCAL_CACHE_PATH = join(__dirname, '..', 'public', 'news-cache.json'); // 로컬 JSON 캐시

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const rssParser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'Mozilla/5.0 AI-News-Collector/1.0' },
  customFields: { item: ['media:content', 'content:encoded'] },
});

// Supabase 연결 상태
let supabaseOk = false;

// AI 관련 키워드 (대소문자 무관)
const AI_KEYWORDS = [
  'artificial intelligence', ' ai ', 'machine learning', 'deep learning',
  'large language model', 'llm', 'gpt', 'claude', 'gemini', 'llama', 'chatgpt',
  'openai', 'anthropic', 'google deepmind', 'meta ai', 'mistral',
  'neural network', 'transformer model', 'diffusion model', 'generative ai',
  'robotics', 'autonomous', 'computer vision', 'natural language',
  'sora', 'midjourney', 'stable diffusion', 'dall-e', 'imagen',
  'ai agent', 'ai model', 'foundation model', 'multimodal',
];

// RSS 피드 목록 (무료, 키 불필요)
const RSS_FEEDS = [
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge AI' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat AI' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica' },
  { url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', source: 'TechCrunch AI' },
  { url: 'https://www.wired.com/feed/tag/artificial-intelligence/latest/rss', source: 'Wired AI' },
];

function isAIRelated(title = '', content = '') {
  const text = (title + ' ' + content).toLowerCase();
  return AI_KEYWORDS.some(kw => text.includes(kw));
}

function cleanText(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 800);
}

async function fetchRSSArticles() {
  const articles = [];

  for (const feed of RSS_FEEDS) {
    try {
      process.stdout.write(`  📡 ${feed.source}... `);
      const result = await rssParser.parseURL(feed.url);
      let count = 0;

      for (const item of result.items.slice(0, 6)) {
        if (!item.link) continue;
        const contentRaw = item['content:encoded'] || item.content || item.contentSnippet || '';
        const contentClean = cleanText(contentRaw);
        if (!isAIRelated(item.title, contentClean)) continue;

        articles.push({
          title: (item.title || '제목 없음').trim(),
          url: item.link.split('?')[0],
          source: feed.source,
          content_preview: contentClean,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        });
        count++;
      }

      console.log(`${count}개`);
    } catch (err) {
      console.log(`실패 (${err.message.slice(0, 40)})`);
    }
  }

  return articles;
}

async function fetchHackerNewsAI() {
  try {
    process.stdout.write('  📡 Hacker News... ');
    const url = 'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=artificial+intelligence+AI+LLM&hitsPerPage=15&numericFilters=points%3E30';
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const articles = data.hits
      .filter(hit => hit.url && isAIRelated(hit.title, hit.story_text || ''))
      .slice(0, 4)
      .map(hit => ({
        title: hit.title.trim(),
        url: hit.url,
        source: 'Hacker News',
        content_preview: hit.story_text ? cleanText(hit.story_text) : `HN 점수: ${hit.points}점`,
        published_at: hit.created_at || new Date().toISOString(),
      }));

    console.log(`${articles.length}개`);
    return articles;
  } catch (err) {
    console.log(`실패 (${err.message.slice(0, 40)})`);
    return [];
  }
}

// 로컬 JSON 캐시에서 기존 URL 읽기
async function getLocalCachedUrls() {
  try {
    const raw = await readFile(LOCAL_CACHE_PATH, 'utf-8');
    const data = JSON.parse(raw);
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    return new Set(
      (data.news || [])
        .filter(n => new Date(n.collected_at).getTime() > twoWeeksAgo)
        .map(n => n.url)
    );
  } catch {
    return new Set();
  }
}

// 로컬 JSON 캐시에 저장
async function saveToLocalCache(articles) {
  let existing = [];
  try {
    const raw = await readFile(LOCAL_CACHE_PATH, 'utf-8');
    existing = JSON.parse(raw).news || [];
  } catch {
    // 파일 없으면 빈 배열로 시작
  }

  // 기존 + 새 기사 병합 (최신 200개 유지)
  const merged = [...articles, ...existing]
    .filter((item, idx, arr) => arr.findIndex(a => a.url === item.url) === idx)
    .slice(0, 200);

  await writeFile(LOCAL_CACHE_PATH, JSON.stringify({ updated_at: new Date().toISOString(), news: merged }, null, 2), 'utf-8');
  return merged.length;
}

// Supabase에서 기존 URL 읽기
async function getSupabaseUrls() {
  if (!supabaseOk) return new Set();
  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from('ai_news').select('url').gte('collected_at', since);
    return new Set(data?.map(r => r.url) || []);
  } catch {
    return new Set();
  }
}

async function saveToSupabase(article) {
  if (!supabaseOk) return false;
  try {
    const { error } = await supabase.from('ai_news').insert({
      title: article.title,
      url: article.url,
      source: article.source,
      content_preview: article.content_preview,
      summary: article.summary || '',
      explanation: article.explanation || '',
      importance: article.importance || '',
      published_at: article.published_at,
      tags: Array.isArray(article.tags) ? article.tags.slice(0, 5) : [],
    });

    if (error?.code === '23505') {
      process.stdout.write(' [중복]');
    } else if (error) {
      process.stdout.write(` [DB오류: ${error.message.slice(0, 20)}]`);
      return false;
    } else {
      process.stdout.write(' [DB저장]');
    }
    return true;
  } catch {
    process.stdout.write(' [DB연결실패]');
    return false;
  }
}

async function summarizeWithOllama(title, contentPreview) {
  // system 역할로 분리해서 qwen이 프롬프트 텍스트를 출력에 섞지 않도록 방지
  const prompt = `<|im_start|>system
You must respond ONLY with a valid JSON object. All values must be written in Korean (한국어). No English in values except proper nouns. No extra text outside the JSON.
<|im_end|>
<|im_start|>user
다음 AI 뉴스를 분석해서 JSON으로만 답해줘. 값은 모두 한국어로 작성. 영어 키 이름은 그대로 유지.

형식:
{"summary":"여기에 핵심 내용 3문장 (한국어)","explanation":"여기에 초보자 설명 2문장 (한국어)","importance":"여기에 중요한 이유 1문장 (한국어)","tags":["한국어태그1","한국어태그2","한국어태그3"]}

제목: ${title}
내용: ${(contentPreview || '').slice(0, 400)}
<|im_end|>
<|im_start|>assistant`;

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.1, num_predict: 500, stop: ['<|im_end|>', '<|im_start|>'] },
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const text = (data.response || '').trim();

    // 첫 번째 '{' 위치부터 매칭되는 '}' 까지 추출
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, end = -1;
      for (let i = start; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
      }
      if (end !== -1) {
        try {
          return JSON.parse(text.slice(start, end + 1));
        } catch { /* fallthrough */ }
      }
    }

    return { summary: contentPreview?.slice(0, 200) || title, explanation: '', importance: '', tags: [] };
  } catch (err) {
    process.stdout.write(` [Ollama오류: ${err.message.slice(0, 20)}]`);
    return {
      summary: contentPreview?.slice(0, 200) || title,
      explanation: '',
      importance: '',
      tags: [],
    };
  }
}

async function checkSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_KEY },
      signal: AbortSignal.timeout(5000),
    });
    // HTTP 응답이 오면 연결 성공 (401/403도 서버가 살아있다는 의미)
    return res.status < 500;
  } catch {
    return false;
  }
}

async function main() {
  console.log('\n🤖 AI 뉴스 자동 수집 시작');
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`);
  console.log('─'.repeat(50));

  // Ollama 연결 확인
  try {
    await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    console.log(`✅ Ollama 연결 확인 (모델: ${MODEL})`);
  } catch {
    console.error(`❌ Ollama 연결 실패. http://127.0.0.1:11434 확인 필요`);
    process.exit(1);
  }

  // Supabase 연결 확인
  supabaseOk = await checkSupabase();
  if (supabaseOk) {
    console.log('✅ Supabase 연결 확인');
  } else {
    console.log('⚠️  Supabase 오프라인 → 로컬 JSON 캐시(public/news-cache.json)에만 저장');
  }

  console.log('\n📥 뉴스 수집 중...');
  const [rssArticles, hnArticles] = await Promise.all([
    fetchRSSArticles(),
    fetchHackerNewsAI(),
  ]);

  const allArticles = [...rssArticles, ...hnArticles];
  console.log(`\n총 수집: ${allArticles.length}개`);

  // 중복 제거 (로컬 + Supabase 모두 확인)
  const [localUrls, dbUrls] = await Promise.all([
    getLocalCachedUrls(),
    getSupabaseUrls(),
  ]);
  const existingUrls = new Set([...localUrls, ...dbUrls]);

  const newArticles = allArticles
    .filter(a => !existingUrls.has(a.url))
    .slice(0, MAX_ARTICLES_PER_RUN);

  if (newArticles.length === 0) {
    console.log('✨ 새 뉴스 없음 (이미 모두 수집됨)\n');
    return;
  }

  console.log(`🆕 신규 처리 대상: ${newArticles.length}개`);
  console.log('\n🧠 AI 요약 중...');

  const processedArticles = [];
  for (let i = 0; i < newArticles.length; i++) {
    const article = newArticles[i];
    process.stdout.write(`\n[${i + 1}/${newArticles.length}] ${article.source} — ${article.title.slice(0, 45)}...`);

    const analysis = await summarizeWithOllama(article.title, article.content_preview);
    const enriched = {
      ...article,
      summary: analysis.summary || '',
      explanation: analysis.explanation || '',
      importance: analysis.importance || '',
      tags: analysis.tags || [],
      collected_at: new Date().toISOString(),
      is_visible: true,
    };

    processedArticles.push(enriched);
    await saveToSupabase(enriched);
    process.stdout.write(' [로컬저장]');

    if (i < newArticles.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // 로컬 JSON 캐시에 일괄 저장
  const totalCached = await saveToLocalCache(processedArticles);
  console.log(`\n\n📁 로컬 캐시: ${totalCached}개 기사 보관`);

  console.log('─'.repeat(50));
  console.log(`✅ 완료: ${processedArticles.length}개 뉴스 처리`);
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}\n`);
}

main().catch(err => {
  console.error('\n❌ 치명적 오류:', err.message);
  process.exit(1);
});
