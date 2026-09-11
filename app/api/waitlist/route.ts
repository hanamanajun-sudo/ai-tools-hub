import { NextRequest, NextResponse } from "next/server";

const NOTION_VERSION = "2022-06-28";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const apiKey = process.env.NOTION_API_KEY_KTOOLU;
  const dbId = process.env.NOTION_WAITLIST_DB_ID_KTOOLU;
  if (!apiKey || !dbId) {
    return NextResponse.json({ error: "등록 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "올바른 이메일 주소를 입력해 주세요." }, { status: 400 });
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        Email: { title: [{ text: { content: email } }] },
        SubmittedAt: { date: { start: new Date().toISOString() } },
        Source: { rich_text: [{ text: { content: body.source ?? "story-landing" } }] },
      },
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "등록 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
