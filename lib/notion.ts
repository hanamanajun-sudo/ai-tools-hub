import { getCloudflareContext } from "@opennextjs/cloudflare";
import { normalizeCategory } from "./post-categories";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

// 두 개의 독립된 Notion integration을 함께 다룬다 — 같은 워크스페이스지만
// 서로 다른 토큰(같은 integration이 상대 DB에 연결돼 있지 않음).
type NotionSource = "hub" | "ktoolu";

function sourceConfig(source: NotionSource): { apiKey: string; dbId: string } {
  return source === "hub"
    ? { apiKey: process.env.NOTION_API_KEY ?? "", dbId: process.env.NOTION_BLOG_DATABASE_ID ?? "" }
    : { apiKey: process.env.NOTION_API_KEY_KTOOLU ?? "", dbId: process.env.NOTION_DATABASE_ID_KTOOLU ?? "" };
}

function notionHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
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
  noIndex: boolean;
  source: NotionSource;
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

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

// 반환값은 항상 정규식으로 검증된 11자리 영숫자/-/_ 조합만 통과시켜서,
// 악의적인 URL(예: v=x"><script>...)이 iframe src 속성 문자열로 그대로
// 이어붙여질 때 속성 탈출/스크립트 삽입(XSS)이 되지 않도록 한다.
function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    let candidate: string | null = null;
    if (u.hostname.includes("youtu.be")) {
      candidate = u.pathname.slice(1).split("/")[0] || null;
    } else if (u.hostname.includes("youtube.com")) {
      candidate = u.searchParams.get("v");
      if (!candidate) {
        const m = u.pathname.match(/\/embed\/([^/?]+)/);
        if (m) candidate = m[1];
      }
    }
    return candidate && YOUTUBE_ID_RE.test(candidate) ? candidate : null;
  } catch {
    // 잘못된 URL 형식 — 무시
  }
  return null;
}

function tableToHtml(block: NotionBlock): string {
  const rows: NotionBlock[] = (block.children ?? []).filter((r: NotionBlock) => r.type === "table_row");
  if (!rows.length) return "";
  const hasHeader = !!block.table?.has_column_header;
  const rowHtml = (row: NotionBlock, cellTag: "th" | "td") =>
    `<tr>${(row.table_row?.cells ?? []).map((cell: RichTextItem[]) => `<${cellTag}>${richTextToHtml(cell)}</${cellTag}>`).join("")}</tr>`;
  const head = hasHeader ? `<thead>${rowHtml(rows[0], "th")}</thead>` : "";
  const body = (hasHeader ? rows.slice(1) : rows).map((r) => rowHtml(r, "td")).join("");
  return `<div class="table-wrap"><table>${head}<tbody>${body}</tbody></table></div>`;
}

// imageUrlMap: block.id → resolved permanent URL (for Notion-hosted images)
function blockToHtml(block: NotionBlock, imageUrlMap?: Map<string, string>): string {
  const b = block[block.type];
  if (!b) return "";
  // 노션에서 Tab으로 들여쓴 블록은 부모의 children으로 온다 — 부모 뒤(목록은 li 안)에 이어 붙인다.
  const nested = block.type !== "table" && block.children?.length
    ? blocksToHtml(block.children, imageUrlMap)
    : "";
  switch (block.type) {
    case "paragraph": return `<p>${richTextToHtml(b.rich_text)}</p>${nested}`;
    case "heading_1": return `<h1>${richTextToHtml(b.rich_text)}</h1>`;
    case "heading_2": return `<h2>${richTextToHtml(b.rich_text)}</h2>`;
    case "heading_3": return `<h3>${richTextToHtml(b.rich_text)}</h3>`;
    case "bulleted_list_item": return `<li>${richTextToHtml(b.rich_text)}${nested}</li>`;
    case "numbered_list_item": return `<li>${richTextToHtml(b.rich_text)}${nested}</li>`;
    case "quote": return `<blockquote>${richTextToHtml(b.rich_text)}</blockquote>${nested}`;
    case "table": return tableToHtml(block);
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
    case "video":
    case "embed": {
      const url = b.type === "external" ? b.external?.url : b.url ?? b.file?.url;
      if (!url) return "";
      const ytId = extractYoutubeId(url);
      if (!ytId) return "";
      return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${ytId}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
    }
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

// 블록 children 전체(100개 넘으면 페이지 넘김)를 가져오고, 하위 블록이 있는 것
// (표의 행, 들여쓴 문단·목록)은 maxDepth까지 재귀로 채운다. 예전엔 최상위만 가져와서
// 표와 들여쓴 문단이 통째로 사라졌다(2026-09-26 가격 비교 글에서 발견).
async function fetchBlockTree(blockId: string, apiKey: string, depth = 0, maxDepth = 2): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const qs = `page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await fetch(`${NOTION_API_BASE}/blocks/${blockId}/children?${qs}`, {
      headers: notionHeaders(apiKey),
    });
    if (!res.ok) break;
    const data = await res.json() as any;
    blocks.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  if (depth < maxDepth) {
    await Promise.all(
      blocks
        .filter((b) => b.has_children && b.type !== "child_page" && b.type !== "child_database")
        .map(async (b) => {
          b.children = await fetchBlockTree(b.id, apiKey, depth + 1, maxDepth);
        })
    );
  }
  return blocks;
}

function flattenBlocks(blocks: NotionBlock[]): NotionBlock[] {
  return blocks.flatMap((b) => [b, ...(b.children ? flattenBlocks(b.children) : [])]);
}

// Pre-resolve Notion-hosted images → Supabase permanent URLs
async function resolveImageBlocks(blocks: NotionBlock[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const imageBlocks = flattenBlocks(blocks).filter(
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

// ai-tools-hub 자체 블로그 DB (Description 속성, 페이지 커버 이미지 사용)
function hubPageToPost(page: any): BlogPost {
  const p = page.properties;
  return {
    id: page.id,
    slug: getText(p.Slug) || page.id,
    title: getText(p.Title),
    description: getText(p.Description),
    category: normalizeCategory(p.Category?.select?.name ?? ""),
    tags: (p.Tags?.multi_select ?? []).map((t: { name: string }) => t.name),
    publishedAt: p.PublishedAt?.date?.start ?? "",
    cover: null, // resolved asynchronously after
    noIndex: false, // 이 DB엔 NoIndex 속성이 없음
    source: "hub",
  };
}

// ktoolu.com DB (Summary→description, CoverImage는 URL 속성, NoIndex 체크박스 존재)
function ktooluPageToPost(page: any): BlogPost {
  const p = page.properties;
  return {
    id: page.id,
    slug: getText(p.Slug) || page.id,
    title: getText(p.Title),
    description: getText(p.Summary),
    category: normalizeCategory(p.Category?.select?.name ?? ""),
    tags: (p.Tags?.multi_select ?? []).map((t: { name: string }) => t.name),
    publishedAt: p.PublishedAt?.date?.start ?? "",
    cover: p.CoverImage?.url ?? null,
    noIndex: p.NoIndex?.checkbox ?? false,
    source: "ktoolu",
  };
}

async function queryPublishedPosts(source: NotionSource): Promise<BlogPost[]> {
  const { apiKey, dbId } = sourceConfig(source);
  if (!dbId || !apiKey) return [];
  try {
    const res = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
      method: "POST",
      headers: notionHeaders(apiKey),
      body: JSON.stringify({
        filter: { property: "Published", checkbox: { equals: true } },
        sorts: [{ property: "PublishedAt", direction: "descending" }],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    const pages = (data.results ?? []).filter((p: any) => p.object === "page");
    const toPost = source === "hub" ? hubPageToPost : ktooluPageToPost;

    return Promise.all(
      pages.map(async (page: any) => {
        const post = toPost(page);
        // hub DB는 페이지 커버 이미지를 R2에 영구 저장, ktoolu DB는 이미 URL 속성이라 그대로 사용
        if (source === "hub") post.cover = await resolveCover(page);
        return post;
      })
    );
  } catch (e) {
    console.error(`[Notion:${source}] 목록 조회 오류:`, e);
    return [];
  }
}

export async function getPosts(): Promise<BlogPost[]> {
  const [hubPosts, ktooluPosts] = await Promise.all([
    queryPublishedPosts("hub"),
    queryPublishedPosts("ktoolu"),
  ]);
  return [...hubPosts, ...ktooluPosts].sort((a, b) =>
    (b.publishedAt || "").localeCompare(a.publishedAt || "")
  );
}

async function queryPostBySlug(source: NotionSource, slug: string): Promise<any | null> {
  const { apiKey, dbId } = sourceConfig(source);
  if (!dbId || !apiKey) return null;
  const res = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
    method: "POST",
    headers: notionHeaders(apiKey),
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
  return (data.results ?? []).find((p: any) => p.object === "page") ?? null;
}

export async function getPost(slug: string): Promise<{ post: BlogPost; html: string } | null> {
  try {
    for (const source of ["hub", "ktoolu"] as const) {
      const page = await queryPostBySlug(source, slug);
      if (!page) continue;

      const { apiKey } = sourceConfig(source);
      const blocks = await fetchBlockTree(page.id, apiKey);

      const toPost = source === "hub" ? hubPageToPost : ktooluPageToPost;
      const [imageUrlMap, cover] = await Promise.all([
        resolveImageBlocks(blocks),
        source === "hub" ? resolveCover(page) : Promise.resolve(undefined),
      ]);

      const html = blocksToHtml(blocks, imageUrlMap);
      const post = toPost(page);
      if (cover !== undefined) post.cover = cover;

      return { post, html };
    }
    return null;
  } catch (e) {
    console.error("[Notion] getPost 오류:", e);
    return null;
  }
}
