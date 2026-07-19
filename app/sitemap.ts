import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { aiTools, categories } from "@/lib/ai-tools-data";
import { newsSlug, isIndexable } from "@/lib/news-slug";
import { getPrompts, PROMPT_CATEGORIES } from "@/lib/prompts";

const BASE_URL = "https://ai.ktoolu.com";

export const revalidate = 3600;

async function getIndexableNews() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("ai_news")
      .select("id,title,summary,explanation,importance,collected_at,is_visible,tags")
      .eq("is_visible", true)
      .order("collected_at", { ascending: false })
      .limit(500);
    return (data || []).filter(isIndexable);
  } catch {
    return [];
  }
}

async function getIndexablePrompts() {
  try {
    return await getPrompts();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, prompts] = await Promise.all([getIndexableNews(), getIndexablePrompts()]);

  const toolPages: MetadataRoute.Sitemap = aiTools.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((c) => c.value !== "all")
    .map((c) => ({
      url: `${BASE_URL}/category/${c.value}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

  const newsPages: MetadataRoute.Sitemap = news.map((item) => ({
    url: `${BASE_URL}/news/${newsSlug(item)}`,
    lastModified: new Date(item.collected_at),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const promptPages: MetadataRoute.Sitemap = prompts.map((p) => ({
    url: `${BASE_URL}/prompts/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const promptCategoryPages: MetadataRoute.Sitemap = PROMPT_CATEGORIES.map((c) => ({
    url: `${BASE_URL}/prompts?cat=${c.value}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.55,
  }));

  const sectionPages: MetadataRoute.Sitemap = ["/news", "/blog", "/glossary", "/prompts"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const infoPages: MetadataRoute.Sitemap = ["/about", "/contact", "/privacy"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...sectionPages,
    ...infoPages,
    ...categoryPages,
    ...toolPages,
    ...newsPages,
    ...promptCategoryPages,
    ...promptPages,
  ];
}
