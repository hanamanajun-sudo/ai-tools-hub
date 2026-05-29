import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import { join } from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type AiNews = {
  id: number;
  title: string;
  url: string;
  source: string;
  content_preview: string | null;
  summary: string | null;
  explanation: string | null;
  importance: string | null;
  published_at: string | null;
  collected_at: string;
  is_visible: boolean;
  tags: string[];
};

// Supabase에서 뉴스 로드
async function getNewsFromSupabase(limit: number): Promise<AiNews[]> {
  try {
    const { data, error } = await supabase
      .from("ai_news")
      .select("*")
      .eq("is_visible", true)
      .order("collected_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

// public/news-cache.json에서 로드 (Supabase 오프라인 시 폴백, Node.js 환경 전용)
async function getNewsFromLocalCache(limit: number): Promise<AiNews[]> {
  try {
    const cachePath = join(process.cwd(), "public", "news-cache.json");
    const raw = await readFile(cachePath, "utf-8");
    const data = JSON.parse(raw);
    return (data.news || [])
      .filter((n: AiNews) => n.is_visible !== false)
      .slice(0, limit)
      .map((n: AiNews, i: number) => ({ ...n, id: n.id ?? i + 1 }));
  } catch {
    return [];
  }
}

export async function getLatestNews(limit = 20): Promise<AiNews[]> {
  const fromDb = await getNewsFromSupabase(limit);
  if (fromDb.length > 0) return fromDb;
  // Supabase 연결 불가 시 로컬 캐시 사용 (Next.js Node.js 런타임에서만 동작)
  return getNewsFromLocalCache(limit);
}

export async function getNewsCount(): Promise<number> {
  try {
    const { count } = await supabase
      .from("ai_news")
      .select("*", { count: "exact", head: true })
      .eq("is_visible", true);
    return count || 0;
  } catch {
    return 0;
  }
}
