import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  RichTextItemResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_API_KEY ?? "placeholder" });

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

function getText(prop: { type: string; rich_text?: RichTextItemResponse[]; title?: RichTextItemResponse[] }): string {
  if (prop.type === "title" && prop.title) return prop.title.map((r) => r.plain_text).join("");
  if (prop.type === "rich_text" && prop.rich_text) return prop.rich_text.map((r) => r.plain_text).join("");
  return "";
}

function richTextToHtml(items: RichTextItemResponse[]): string {
  return items.map((r) => {
    let text = r.plain_text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const ann = r.annotations;
    if (ann.code) text = `<code>${text}</code>`;
    if (ann.bold) text = `<strong>${text}</strong>`;
    if (ann.italic) text = `<em>${text}</em>`;
    if (ann.strikethrough) text = `<s>${text}</s>`;
    if (r.type === "text" && r.text.link) text = `<a href="${r.text.link.url}">${text}</a>`;
    return text;
  }).join("");
}

function blockToHtml(block: BlockObjectResponse): string {
  const b = block as any;
  switch (block.type) {
    case "paragraph":
      return `<p>${richTextToHtml(b.paragraph.rich_text)}</p>`;
    case "heading_1":
      return `<h1>${richTextToHtml(b.heading_1.rich_text)}</h1>`;
    case "heading_2":
      return `<h2>${richTextToHtml(b.heading_2.rich_text)}</h2>`;
    case "heading_3":
      return `<h3>${richTextToHtml(b.heading_3.rich_text)}</h3>`;
    case "bulleted_list_item":
      return `<li>${richTextToHtml(b.bulleted_list_item.rich_text)}</li>`;
    case "numbered_list_item":
      return `<li>${richTextToHtml(b.numbered_list_item.rich_text)}</li>`;
    case "quote":
      return `<blockquote>${richTextToHtml(b.quote.rich_text)}</blockquote>`;
    case "code": {
      const lang = b.code.language ?? "";
      const code = b.code.rich_text.map((r: RichTextItemResponse) => r.plain_text).join("").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    }
    case "divider":
      return "<hr />";
    case "image": {
      const url = b.image.type === "external" ? b.image.external.url : b.image.file?.url ?? "";
      const caption = b.image.caption?.length ? richTextToHtml(b.image.caption) : "";
      return `<figure><img src="${url}" alt="${caption}" />${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
    }
    case "callout": {
      const icon = b.callout.icon?.emoji ?? "💡";
      return `<div class="callout"><span>${icon}</span><div>${richTextToHtml(b.callout.rich_text)}</div></div>`;
    }
    default:
      return "";
  }
}

function blocksToHtml(blocks: BlockObjectResponse[]): string {
  const parts: string[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === "bulleted_list_item") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(blockToHtml(blocks[i]));
        i++;
      }
      parts.push(`<ul>${items.join("")}</ul>`);
    } else if (block.type === "numbered_list_item") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(blockToHtml(blocks[i]));
        i++;
      }
      parts.push(`<ol>${items.join("")}</ol>`);
    } else {
      parts.push(blockToHtml(block));
      i++;
    }
  }
  return parts.join("\n");
}

function pageToPost(page: PageObjectResponse): BlogPost {
  const props = page.properties as Record<string, any>;

  const cover =
    page.cover?.type === "external"
      ? page.cover.external.url
      : page.cover?.type === "file"
      ? page.cover.file.url
      : null;

  return {
    id: page.id,
    slug: getText(props.Slug) || page.id,
    title: getText(props.Title),
    description: getText(props.Description),
    category: props.Category?.select?.name ?? "",
    tags: (props.Tags?.multi_select ?? []).map((t: { name: string }) => t.name),
    publishedAt: props.PublishedAt?.date?.start ?? "",
    cover,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const dbId = process.env.NOTION_BLOG_DATABASE_ID;
  if (!dbId) return [];

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "PublishedAt", direction: "descending" }],
    });

    return response.results
      .filter((p): p is PageObjectResponse => p.object === "page")
      .map(pageToPost);
  } catch (e) {
    console.error("[Notion] getBlogPosts 오류:", e);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<{ post: BlogPost; html: string } | null> {
  const dbId = process.env.NOTION_BLOG_DATABASE_ID;
  if (!dbId) return null;

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Slug", rich_text: { equals: slug } },
        ],
      },
    });

    const page = response.results.find((p): p is PageObjectResponse => p.object === "page");
    if (!page) return null;

    const blocksResponse = await notion.blocks.children.list({ block_id: page.id, page_size: 100 });
    const blocks = blocksResponse.results.filter(
      (b): b is BlockObjectResponse => "type" in b
    );
    const html = blocksToHtml(blocks);

    return { post: pageToPost(page), html };
  } catch (e) {
    console.error("[Notion] getBlogPost 오류:", e);
    return null;
  }
}
