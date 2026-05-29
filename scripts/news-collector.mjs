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
const OLLAMA_URL = 'http://127.0.0.1:11434';
const MODEL = 'qwen2.5:7b';         // 연결 확인용
const HERMES_MODEL = 'hermes3:latest'; // 번역/요약 파이프라인용
const MAX_ARTICLES_PER_RUN = 8;
const LOCAL_CACHE_PATH = join(__dirname, '..', 'public', 'news-cache.json');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const rssParser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'Mozilla/5.0 AI-News-Collector/1.0' },
  customFields: { item: ['media:content', 'content:encoded'] },
});

let supabaseOk = false;

// ── 키워드 ──────────────────────────────────────────────
const AI_KEYWORDS = [
  'artificial intelligence', ' ai ', 'machine learning', 'deep learning',
  'large language model', 'llm', 'gpt', 'claude', 'gemini', 'llama', 'chatgpt',
  'openai', 'anthropic', 'google deepmind', 'meta ai', 'mistral',
  'neural network', 'transformer', 'diffusion model', 'generative ai',
  'robotics', 'autonomous', 'computer vision', 'natural language processing',
  'sora', 'midjourney', 'stable diffusion', 'dall-e',
  'ai agent', 'foundation model', 'multimodal', 'reinforcement learning',
];

// 고관심 키워드 - 매칭 시 점수 가중치 2배
const HIGH_VALUE_TERMS = [
  'openai', 'anthropic', 'google deepmind', 'meta ai', 'apple intelligence',
  'gpt-4', 'gpt-5', 'claude', 'gemini', 'llama', 'mistral',
  'breakthrough', 'launch', 'release', 'announced', 'new model',
  'safety', 'regulation', 'ban', 'lawsuit', 'billion', 'funding',
  'robot', 'humanoid', 'autonomous vehicle', 'self-driving',
];

// ── RSS 피드 (404 제거, MIT·IEEE 추가) ─────────────────
const RSS_FEEDS = [
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat AI' },
  { url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', source: 'TechCrunch AI' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica' },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', source: 'MIT Tech Review' },
  { url: 'https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss', source: 'IEEE Spectrum' },
];

// ── 유틸 ────────────────────────────────────────────────
function isAIRelated(title = '', content = '') {
  const text = (title + ' ' + content).toLowerCase();
  return AI_KEYWORDS.some(kw => text.includes(kw));
}

function scoreArticle(title = '', content = '', pubDate) {
  const text = (title + ' ' + content).toLowerCase();
  let score = 0;

  // 일반 키워드 수
  score += AI_KEYWORDS.filter(kw => text.includes(kw)).length;
  // 고관심 키워드는 2배
  score += HIGH_VALUE_TERMS.filter(t => text.includes(t)).length * 2;
  // 최신 기사 보너스
  if (pubDate) {
    const ageH = (Date.now() - new Date(pubDate).getTime()) / 3_600_000;
    if (ageH < 6) score += 5;
    else if (ageH < 24) score += 3;
    else if (ageH < 48) score += 1;
  }
  return score;
}

function normalizeTitle(title = '') {
  return title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '').slice(0, 40);
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

// 링크 유효성 검사 (HEAD 요청)
async function validateLink(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    // 403 = 봇 차단이지만 페이지 존재 / 405 = HEAD 미지원이지만 존재
    return res.status < 400 || res.status === 403 || res.status === 405;
  } catch {
    return false;
  }
}

// ── 수집 ────────────────────────────────────────────────
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

        const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
        articles.push({
          title: (item.title || '제목 없음').trim(),
          url: item.link.split('?')[0],
          source: feed.source,
          content_preview: contentClean,
          published_at: pubDate,
          score: scoreArticle(item.title, contentClean, pubDate),
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
    const url = 'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=artificial+intelligence+AI+LLM&hitsPerPage=15&numericFilters=points%3E50';
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const articles = data.hits
      .filter(hit => hit.url && isAIRelated(hit.title, hit.story_text || ''))
      .slice(0, 4)
      .map(hit => {
        const pubDate = hit.created_at || new Date().toISOString();
        const preview = hit.story_text ? cleanText(hit.story_text) : `HN 점수: ${hit.points}점`;
        return {
          title: hit.title.trim(),
          url: hit.url,
          source: 'Hacker News',
          content_preview: preview,
          published_at: pubDate,
          // HN 점수도 반영
          score: scoreArticle(hit.title, preview, pubDate) + Math.min(Math.floor(hit.points / 20), 5),
        };
      });

    console.log(`${articles.length}개`);
    return articles;
  } catch (err) {
    console.log(`실패 (${err.message.slice(0, 40)})`);
    return [];
  }
}

// ── 중복 확인 ────────────────────────────────────────────
async function getLocalCachedData() {
  try {
    const raw = await readFile(LOCAL_CACHE_PATH, 'utf-8');
    const data = JSON.parse(raw);
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const recent = (data.news || []).filter(n => new Date(n.collected_at).getTime() > cutoff);
    return {
      urls: new Set(recent.map(n => n.url)),
      titles: new Set(recent.map(n => normalizeTitle(n.title))),
    };
  } catch {
    return { urls: new Set(), titles: new Set() };
  }
}

async function getSupabaseData() {
  if (!supabaseOk) return { urls: new Set(), titles: new Set() };
  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('ai_news')
      .select('url, title')
      .gte('collected_at', since);
    return {
      urls: new Set(data?.map(r => r.url) || []),
      titles: new Set(data?.map(r => normalizeTitle(r.title)) || []),
    };
  } catch {
    return { urls: new Set(), titles: new Set() };
  }
}

// ── 저장 ────────────────────────────────────────────────
async function saveToLocalCache(articles) {
  let existing = [];
  try {
    const raw = await readFile(LOCAL_CACHE_PATH, 'utf-8');
    existing = JSON.parse(raw).news || [];
  } catch { /* 없으면 빈 배열 */ }

  const merged = [...articles, ...existing]
    .filter((item, idx, arr) => arr.findIndex(a => a.url === item.url) === idx)
    .slice(0, 200);

  await writeFile(LOCAL_CACHE_PATH, JSON.stringify({ updated_at: new Date().toISOString(), news: merged }, null, 2));
  return merged.length;
}

async function saveToSupabase(article) {
  if (!supabaseOk) return;
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
    if (error?.code === '23505') process.stdout.write(' [중복]');
    else if (error) process.stdout.write(` [DB오류]`);
    else process.stdout.write(' [DB저장]');
  } catch {
    process.stdout.write(' [DB연결실패]');
  }
}

// ── Ollama 3단계 파이프라인 ─────────────────────────────

// hermes3 호출 공통 헬퍼
async function callOllama(model, systemMsg, userMsg, maxTokens = 700) {
  const prompt = `<|im_start|>system\n${systemMsg}\n<|im_end|>\n<|im_start|>user\n${userMsg}\n<|im_end|>\n<|im_start|>assistant`;
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0.1, num_predict: maxTokens, stop: ['<|im_end|>', '<|im_start|>'] },
    }),
    signal: AbortSignal.timeout(90000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return (data.response || '').trim();
}

// JSON 추출 헬퍼 (brace-depth 방식)
function parseJSON(text) {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0, end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

// 3단계 파이프라인: 추출 → 번역 → 요약
async function summarizeWithPipeline(title, contentPreview) {
  const fallback = { summary: contentPreview?.slice(0, 200) || title, explanation: '', importance: '', tags: [] };
  const content = (contentPreview || '').slice(0, 500);

  // ── Step 1: 영어로 핵심 사실 추출 ──────────────────────
  let facts = null;
  try {
    process.stdout.write(' [S1]');
    const raw1 = await callOllama(
      HERMES_MODEL,
      'You are a precise AI news analyst. Extract only verified facts from the article. Respond with valid JSON only, no other text.',
      `Extract key facts from this AI news article into structured JSON.

Title: ${title}
Content: ${content}

Respond with ONLY this JSON:
{"what":"What happened or was announced (1-2 sentences)","who":"Which company/person is involved","why_matters":"Why this matters in AI field (1-2 sentences)","context":"Relevant background (1 sentence)","impact":"Potential impact on users or industry (1 sentence)"}`
    );
    facts = parseJSON(raw1);
  } catch (e) {
    process.stdout.write('(S1실패)');
  }

  // Step1 실패 시: 원본을 그대로 Step2에 전달
  const step1Input = facts
    ? JSON.stringify(facts, null, 2)
    : `Title: ${title}\nContent: ${content}`;

  // ── Step 2: 한국어 번역 ────────────────────────────────
  let koreanFacts = null;
  try {
    process.stdout.write(' [S2]');
    const raw2 = await callOllama(
      HERMES_MODEL,
      'You are a professional Korean translator specializing in technology and AI news. Translate accurately and naturally into Korean.',
      `Translate the following English AI news facts to natural Korean.
Keep JSON keys in English, translate only the values.

Input:
${step1Input}

Respond with ONLY the translated JSON (same structure, Korean values):`
    );
    koreanFacts = parseJSON(raw2);
  } catch (e) {
    process.stdout.write('(S2실패)');
  }

  // Step2 실패 시: Step1 결과(영어)를 Step3에 전달
  const step2Input = koreanFacts
    ? JSON.stringify(koreanFacts, null, 2)
    : step1Input;

  // ── Step 3: 독자용 한국어 요약 완성 ───────────────────
  try {
    process.stdout.write(' [S3]');
    const raw3 = await callOllama(
      HERMES_MODEL,
      'You are a Korean IT journalist. Write clear, engaging summaries for general Korean readers. No jargon. Respond with valid JSON only.',
      `Using these Korean facts about an AI news article, write a polished Korean summary for general readers.

Facts:
${step2Input}

Respond with ONLY this JSON:
{"summary":"핵심 내용 3문장 (자연스러운 한국어)","explanation":"기술을 모르는 사람도 이해할 수 있는 설명 2문장","importance":"이 뉴스가 왜 중요한지 1문장","tags":["태그1","태그2","태그3"]}`
    );
    const result = parseJSON(raw3);
    if (result?.summary) return result;
  } catch (e) {
    process.stdout.write('(S3실패)');
  }

  return fallback;
}

async function checkSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_KEY },
      signal: AbortSignal.timeout(5000),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

// ── 메인 ────────────────────────────────────────────────
async function main() {
  console.log('\n🤖 AI 뉴스 자동 수집 시작');
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`);
  console.log('─'.repeat(50));

  try {
    await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    console.log(`✅ Ollama 연결 확인 (${MODEL})`);
  } catch {
    console.error('❌ Ollama 연결 실패'); process.exit(1);
  }

  supabaseOk = await checkSupabase();
  console.log(supabaseOk ? '✅ Supabase 연결 확인' : '⚠️  Supabase 오프라인 → 로컬 캐시에만 저장');

  // 뉴스 수집
  console.log('\n📥 뉴스 수집 중...');
  const [rssArticles, hnArticles] = await Promise.all([fetchRSSArticles(), fetchHackerNewsAI()]);
  const allArticles = [...rssArticles, ...hnArticles];
  console.log(`\n총 수집: ${allArticles.length}개`);

  // 기존 데이터 로드 (URL + 제목 중복 체크용)
  const [localData, dbData] = await Promise.all([getLocalCachedData(), getSupabaseData()]);
  const existingUrls = new Set([...localData.urls, ...dbData.urls]);
  const existingTitles = new Set([...localData.titles, ...dbData.titles]);

  // 중복 제거 (URL + 제목 유사도)
  const deduplicated = allArticles.filter(a => {
    if (existingUrls.has(a.url)) return false;
    if (existingTitles.has(normalizeTitle(a.title))) return false;
    return true;
  });

  // 관심도 점수 기준 정렬 후 상위 MAX개
  const candidates = deduplicated
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ARTICLES_PER_RUN);

  if (candidates.length === 0) {
    console.log('✨ 새 뉴스 없음\n'); return;
  }

  console.log(`🆕 신규 처리 대상: ${candidates.length}개 (점수순 정렬)`);
  console.log('\n🔗 링크 검증 중...');

  // 링크 유효성 검사 (병렬)
  const validated = await Promise.all(
    candidates.map(async a => ({ ...a, linkOk: await validateLink(a.url) }))
  );
  const validArticles = validated.filter(a => {
    if (!a.linkOk) { console.log(`  ❌ 깨진 링크 제외: ${a.title.slice(0, 50)}`); return false; }
    return true;
  });
  console.log(`  ✅ 유효 링크: ${validArticles.length}개`);

  if (validArticles.length === 0) {
    console.log('처리할 기사 없음\n'); return;
  }

  console.log('\n🧠 AI 요약 중...');
  const processedArticles = [];

  for (let i = 0; i < validArticles.length; i++) {
    const article = validArticles[i];
    process.stdout.write(`\n[${i + 1}/${validArticles.length}] (점수:${article.score}) ${article.source} — ${article.title.slice(0, 40)}...`);

    const analysis = await summarizeWithPipeline(article.title, article.content_preview);
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

    if (i < validArticles.length - 1) await new Promise(r => setTimeout(r, 500));
  }

  const totalCached = await saveToLocalCache(processedArticles);
  console.log(`\n\n📁 로컬 캐시: ${totalCached}개`);
  console.log('─'.repeat(50));
  console.log(`✅ 완료: ${processedArticles.length}개 처리 | ⏰ ${new Date().toLocaleString('ko-KR')}\n`);
}

main().catch(err => { console.error('\n❌ 오류:', err.message); process.exit(1); });
