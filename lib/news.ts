import { createClient } from "@supabase/supabase-js";

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

export async function getLatestNews(limit = 20): Promise<AiNews[]> {
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
