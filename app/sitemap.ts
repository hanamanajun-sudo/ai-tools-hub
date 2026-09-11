import { MetadataRoute } from "next";
import { aiTools, categories } from "@/lib/ai-tools-data";
import { getPrompts, PROMPT_CATEGORIES } from "@/lib/prompts";

const BASE_URL = "https://ai.ktoolu.com";

export const revalidate = 3600;

async function getIndexablePrompts() {
  try {
    return await getPrompts();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prompts = await getIndexablePrompts();

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

  const sectionPages: MetadataRoute.Sitemap = ["/blog", "/prompts"].map((path) => ({
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
    ...promptCategoryPages,
    ...promptPages,
  ];
}
