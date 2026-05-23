import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_API_KEY ?? "placeholder" });
const n2m = new NotionToMarkdown({ notionClient: notion });

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

    const posts = response.results
      .filter((p): p is PageObjectResponse => p.object === "page")
      .map(pageToPost);

    console.log(`[Notion] getBlogPosts: ${posts.length}개 로드됨`);
    return posts;
  } catch (e) {
    console.error("[Notion] getBlogPosts 오류:", e);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<{ post: BlogPost; markdown: string } | null> {
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

    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const markdown = n2m.toMarkdownString(mdBlocks).parent;

    return { post: pageToPost(page), markdown };
  } catch {
    return null;
  }
}
