"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "story-landing" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "등록에 실패했어요.");
        return;
      }

      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("네트워크 오류로 등록하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  // 이 폼은 항상 bg-primary(어두운) 히어로/CTA 섹션 안에서만 쓰인다 —
  // 전역 text-foreground/bg-card 토큰을 쓰면 라이트 모드에서 검은 배경에
  // 검은 글씨가 되므로, primary-foreground 계열로 고정한다.
  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 px-6 py-4 text-primary-foreground">
        <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        <p className="text-sm font-medium">등록 완료! 베타가 열리면 이 메일로 가장 먼저 알려드릴게요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="flex-1 rounded-lg border border-primary-foreground/20 bg-primary-foreground/95 px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-foreground px-6 py-3 font-semibold text-primary transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? "등록 중..." : "베타 신청하기"}
          {status !== "loading" && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      </div>
      {status === "error" && <p className="mt-2 text-sm font-medium text-red-300">{errorMsg}</p>}
      <p className="mt-3 text-xs text-primary-foreground/60">
        스팸 없이, 베타 오픈 소식만 보내드려요. 언제든 수신 거부할 수 있습니다.
      </p>
    </form>
  );
}
