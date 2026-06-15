import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ ok: false, error: "관리자 비밀번호가 설정되지 않았습니다" }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ ok: false, error: "비밀번호가 일치하지 않습니다" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "요청을 처리할 수 없습니다" }, { status: 400 });
  }
}
