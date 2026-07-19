import { createClient } from "@supabase/supabase-js";

export type PromptCategory = "writing" | "work" | "coding" | "learning" | "image" | "career";

export const PROMPT_CATEGORIES: { value: PromptCategory; label: string; emoji: string }[] = [
  { value: "writing", label: "글쓰기·콘텐츠", emoji: "✍️" },
  { value: "work", label: "업무·생산성", emoji: "💼" },
  { value: "coding", label: "코딩·개발", emoji: "💻" },
  { value: "learning", label: "학습·리서치", emoji: "📚" },
  { value: "image", label: "이미지·디자인", emoji: "🎨" },
  { value: "career", label: "커리어·자기계발", emoji: "🚀" },
];

export function getPromptCategoryMeta(value: string) {
  return PROMPT_CATEGORIES.find((c) => c.value === value);
}

export type Prompt = {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  tools: string[];
  tips: string | null;
  example_output: string | null;
  copy_count: number;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

const PROMPT_COLUMNS =
  "id,slug,title,description,content,category,tools,tips,example_output,copy_count,is_visible,is_featured,created_at,updated_at";

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getPrompts(category?: PromptCategory): Promise<Prompt[]> {
  let query = client()
    .from("prompts")
    .select(PROMPT_COLUMNS)
    .eq("is_visible", true);
  if (category) query = query.eq("category", category);
  const { data } = await query.order("is_featured", { ascending: false }).order("copy_count", { ascending: false });
  return (data as Prompt[]) || [];
}

export async function getPromptBySlug(slug: string): Promise<Prompt | null> {
  const { data } = await client()
    .from("prompts")
    .select(PROMPT_COLUMNS)
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();
  return (data as Prompt) || null;
}

export async function getRelatedPrompts(category: PromptCategory, excludeSlug: string, limit = 4): Promise<Prompt[]> {
  const { data } = await client()
    .from("prompts")
    .select(PROMPT_COLUMNS)
    .eq("category", category)
    .eq("is_visible", true)
    .neq("slug", excludeSlug)
    .order("copy_count", { ascending: false })
    .limit(limit);
  return (data as Prompt[]) || [];
}

/** 프롬프트 안의 {{변수}} 목록 추출 (등장 순서, 중복 제거) */
export function extractVariables(content: string): string[] {
  const matches = content.matchAll(/\{\{([^}]+)\}\}/g);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of matches) {
    const name = m[1].trim();
    if (!seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
}

/** 변수 값 맵으로 {{변수}}를 치환한 완성본 생성 */
export function fillTemplate(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{([^}]+)\}\}/g, (_match, name) => {
    const key = name.trim();
    const value = values[key]?.trim();
    return value ? value : `{{${key}}}`;
  });
}

export async function incrementPromptCopy(slug: string): Promise<void> {
  await client().rpc("increment_prompt_copy", { p_slug: slug });
}

/** 특정 AI 툴에 추천된 프롬프트 목록 (툴 상세페이지 역참조용) */
export async function getPromptsForTool(toolId: string, limit = 3): Promise<Prompt[]> {
  const { data } = await client()
    .from("prompts")
    .select(PROMPT_COLUMNS)
    .contains("tools", [toolId])
    .eq("is_visible", true)
    .order("copy_count", { ascending: false })
    .limit(limit);
  return (data as Prompt[]) || [];
}
