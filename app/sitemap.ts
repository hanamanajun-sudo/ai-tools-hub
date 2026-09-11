import { MetadataRoute } from "next";
import { aiTools, categories } from "@/lib/ai-tools-data";
import { getPrompts, PROMPT_CATEGORIES } from "@/lib/prompts";
import { getPosts } from "@/lib/notion";

const BASE_URL = "https://ai.ktoolu.com";

export const revalidate = 3600;

async function getIndexablePrompts() {
  try {
    return await getPrompts();
  } catch {
    return [];
  }
}

async function getIndexablePosts() {
  try {
    const posts = await getPosts();
    return posts.filter((p) => !p.noIndex);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [prompts, posts] = await Promise.all([getIndexablePrompts(), getIndexablePosts()]);

  // noindex 처리된 글은 sitemap에서도 제외한다 — "색인하지 마"와 "여기 있어" 신호가
  // 동시에 나가면 모순이라 (ktoolu.com lib/notion.ts와 동일한 원칙).
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

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

  const sectionPages: MetadataRoute.Sitemap = ["/posts", "/prompts"].map((path) => ({
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

  const storyPage: MetadataRoute.Sitemap = [{
    url: `${BASE_URL}/story`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }];

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...sectionPages,
    ...infoPages,
    ...storyPage,
    ...categoryPages,
    ...toolPages,
    ...postPages,
    ...promptCategoryPages,
    ...promptPages,
  ];
}
