import { seedPrompts } from "./seed-prompts-data.ts";
import { readFileSync } from "node:fs";

const envContent = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

const rows = seedPrompts.map((p) => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  content: p.content,
  category: p.category,
  tools: p.tools,
  tips: p.tips,
  example_output: p.example_output,
  is_featured: p.is_featured,
}));

const res = await fetch(`${url}/rest/v1/prompts`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(rows),
});

console.log("status:", res.status);
const body = await res.json();
if (Array.isArray(body)) {
  console.log("inserted count:", body.length);
} else {
  console.log("response:", JSON.stringify(body));
}
