import { getCloudflareContext } from "@opennextjs/cloudflare";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function notionHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY ?? ""}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

type RichTextItem = {
  type: string;
  plain_text: string;
  annotations: { bold: boolean; italic: boolean; strikethrough: boolean; code: boolean };
  text?: { content: string; link: { url: string } | null };
};

type NotionBlock = { id: string; type: string; [key: string]: any };

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string;
  cover: string | null;
};

// ── Cloudflare R2 Image Persistence ──────────────────────────────────────

function getR2Bucket(): any | null {
  try {
    const { env } = getCloudflareContext();
    return (env as any).BLOG_ASSETS ?? null;
  } catch {
    // Outside Cloudflare Workers context (e.g. local Next.js dev / static build)
    return null;
  }
}

async function persistNotionImage(fileUrl: string, key: string): Promise<string> {
  try {
    const bucket = getR2Bucket();
    if (!bucket) return fileUrl; // fallback during local dev / static build

    const r2Key = `notion/${key}`;
    const proxyUrl = `/api/r2/${r2Key}`;

    // Skip download if already cached
    const existing = await bucket.head(r2Key);
    if (existing) return proxyUrl;

    // Download from Notion and upload to R2
    const res = await fetch(fileUrl);
    if (!res.ok) return fileUrl;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    await bucket.put(r2Key, buffer, { httpMetadata: { contentType } });
    return proxyUrl;
  } catch {
    return fileUrl;
  }
}

async function resolveCover(page: any): Promise<string | null> {
  if (!page.cover) return null;
  if (page.cover.type === "external") return page.cover.external?.url ?? null;
  if (page.cover.type === "file" && page.cover.file?.url) {
    return persistNotionImage(page.cover.file.url, `cover-${page.id}`);
  }
  return null;
}

// ── HTML Rendering ────────────────────────────────────────────────────────

function getText(prop: any): string {
  if (!prop) return "";
  const items: RichTextItem[] = prop.type === "title" ? prop.title : prop.rich_text;
  return (items ?? []).map((r) => r.plain_text).join("");
}

function richTextToHtml(items: RichTextItem[]): string {
  if (!items?.length) return "";
  return items.map((r) => {
    let t = r.plain_text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (r.annotations.code) t = `<code>${t}</code>`;
    if (r.annotations.bold) t = `<strong>${t}</strong>`;
    if (r.annotations.italic) t = `<em>${t}</em>`;
    if (r.annotations.strikethrough) t = `<s>${t}</s>`;
    if (r.type === "text" && r.text?.link) t = `<a href="${r.text.link.url}">${t}</a>`;
    return t;
  }).join("");
}

// imageUrlMap: block.id → resolved permanent URL (for Notion-hosted images)
function blockToHtml(block: NotionBlock, imageUrlMap?: Map<string, string>): string {
  const b = block[block.type];
  if (!b) return "";
  switch (block.type) {
    case "paragraph": return `<p>${richTextToHtml(b.rich_text)}</p>`;
    case "heading_1": return `<h1>${richTextToHtml(b.rich_text)}</h1>`;
    case "heading_2": return `<h2>${richTextToHtml(b.rich_text)}</h2>`;
    case "heading_3": return `<h3>${richTextToHtml(b.rich_text)}</h3>`;
    case "bulleted_list_item": return `<li>${richTextToHtml(b.rich_text)}</li>`;
    case "numbered_list_item": return `<li>${richTextToHtml(b.rich_text)}</li>`;
    case "quote": return `<blockquote>${richTextToHtml(b.rich_text)}</blockquote>`;
    case "code": {
      const code = (b.rich_text as RichTextItem[]).map((r) => r.plain_text).join("")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code class="language-${b.language ?? ""}">${code}</code></pre>`;
    }
    case "divider": return "<hr />";
    case "image": {
      // Use persisted URL if available, otherwise fall back
      const url = imageUrlMap?.get(block.id)
        ?? (b.type === "external" ? b.external?.url : b.file?.url ?? "");
      const caption = b.caption?.length ? richTextToHtml(b.caption) : "";
      return `<figure><img src="${url}" alt="${caption}" loading="lazy" />${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
    }
    case "callout":
      return `<div class="callout"><span>${b.icon?.emoji ?? "💡"}</span><div>${richTextToHtml(b.rich_text)}</div></div>`;
    default: return "";
  }
}

function blocksToHtml(blocks: NotionBlock[], imageUrlMap?: Map<string, string>): string {
  const parts: string[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].type === "bulleted_list_item") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item")
        items.push(blockToHtml(blocks[i++], imageUrlMap));
      parts.push(`<ul>${items.join("")}</ul>`);
    } else if (blocks[i].type === "numbered_list_item") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item")
        items.push(blockToHtml(blocks[i++], imageUrlMap));
      parts.push(`<ol>${items.join("")}</ol>`);
    } else {
      parts.push(blockToHtml(blocks[i++], imageUrlMap));
    }
  }
  return parts.join("\n");
}

// Pre-resolve Notion-hosted images → Supabase permanent URLs
async function resolveImageBlocks(blocks: NotionBlock[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const imageBlocks = blocks.filter(
    (b) => b.type === "image" && b.image?.type === "file" && b.image?.file?.url
  );
  await Promise.all(
    imageBlocks.map(async (b) => {
      const url = await persistNotionImage(b.image.file.url, b.id);
      map.set(b.id, url);
    })
  );
  return map;
}

// ── Public API ────────────────────────────────────────────────────────────

function pageToPost(page: any): BlogPost {
  const p = page.properties;
  return {
    id: page.id,
    slug: getText(p.Slug) || page.id,
    title: getText(p.Title),
    description: getText(p.Description),
    category: p.Category?.select?.name ?? "",
    tags: (p.Tags?.multi_select ?? []).map((t: { name: string }) => t.name),
    publishedAt: p.PublishedAt?.date?.start ?? "",
    cover: null, // resolved asynchronously after
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const dbId = process.env.NOTION_BLOG_DATABASE_ID;
  if (!dbId || !process.env.NOTION_API_KEY) return [];
  try {
    const res = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
      method: "POST",
      headers: notionHeaders(),
      body: JSON.stringify({
        filter: { property: "Published", checkbox: { equals: true } },
        sorts: [{ property: "PublishedAt", direction: "descending" }],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    const pages = (data.results ?? []).filter((p: any) => p.object === "page");

    // Resolve cover images in parallel
    return Promise.all(
      pages.map(async (page: any) => {
        const post = pageToPost(page);
        post.cover = await resolveCover(page);
        return post;
      })
    );
  } catch (e) {
    console.error("[Notion] getBlogPosts 오류:", e);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<{ post: BlogPost; html: string } | null> {
  const dbId = process.env.NOTION_BLOG_DATABASE_ID;
  if (!dbId || !process.env.NOTION_API_KEY) return null;
  try {
    const res = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
      method: "POST",
      headers: notionHeaders(),
      body: JSON.stringify({
        filter: {
          and: [
            { property: "Published", checkbox: { equals: true } },
            { property: "Slug", rich_text: { equals: slug } },
          ],
        },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    const page = (data.results ?? []).find((p: any) => p.object === "page");
    if (!page) return null;

    const blocksRes = await fetch(`${NOTION_API_BASE}/blocks/${page.id}/children?page_size=100`, {
      headers: notionHeaders(),
    });
    const blocksData = blocksRes.ok ? await blocksRes.json() as any : { results: [] };
    const blocks: NotionBlock[] = blocksData.results ?? [];

    // Resolve inline images and cover in parallel
    const [imageUrlMap, cover] = await Promise.all([
      resolveImageBlocks(blocks),
      resolveCover(page),
    ]);

    const html = blocksToHtml(blocks, imageUrlMap);
    const post = pageToPost(page);
    post.cover = cover;

    return { post, html };
  } catch (e) {
    console.error("[Notion] getBlogPost 오류:", e);
    return null;
  }
}
