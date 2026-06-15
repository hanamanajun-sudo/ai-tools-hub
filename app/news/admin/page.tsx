"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Star, Eye, EyeOff, LogIn, LogOut, RefreshCw, AlertCircle, Check, X, ChevronLeft, ChevronRight } from "lucide-react";

type AiNews = {
  id: number;
  title: string;
  source: string;
  collected_at: string;
  is_visible: boolean;
  tags: string[];
};

const PAGE_SIZE = 20;

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [news, setNews] = useState<AiNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function handleLogin() {
    setLoginError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setLoginError("비밀번호가 일치하지 않습니다");
        return;
      }
      setAuthenticated(true);
      sessionStorage.setItem("ktoolu_admin", "true");
    } catch {
      setLoginError("로그인 서버 오류");
    }
  }

  function handleLogout() {
    setAuthenticated(false);
    sessionStorage.removeItem("ktoolu_admin");
  }

  useEffect(() => {
    if (sessionStorage.getItem("ktoolu_admin") === "true") {
      setAuthenticated(true);
    }
  }, []);

  async function fetchNews() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await supabase
        .from("ai_news")
        .select("id,title,source,collected_at,is_visible,tags")
        .order("collected_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setNews(data || []);
    } catch {
      setError("뉴스를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) fetchNews();
  }, [authenticated]);

  async function toggleVisibility(item: AiNews) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase
        .from("ai_news")
        .update({ is_visible: !item.is_visible })
        .eq("id", item.id);
      if (error) throw error;
      setNews(prev => prev.map(n => n.id === item.id ? { ...n, is_visible: !n.is_visible } : n));
      showToast("ID " + item.id + " " + (item.is_visible ? "숨김" : "표시"), "success");
    } catch {
      showToast("업데이트 실패", "error");
    }
  }

  async function toggleEditorPick(item: AiNews) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const hasPick = item.tags?.includes("편집자픽");
      const newTags = hasPick
        ? (item.tags || []).filter(t => t !== "편집자픽")
        : [...(item.tags || []), "편집자픽"];
      const { error } = await supabase
        .from("ai_news")
        .update({ tags: newTags })
        .eq("id", item.id);
      if (error) throw error;
      const msg = hasPick ? "편집자픽 해제" : "편집자픽 지정";
      setNews(prev => prev.map(n => n.id === item.id ? { ...n, tags: newTags } : n));
      showToast("ID " + item.id + " " + msg, "success");
    } catch {
      showToast("업데이트 실패", "error");
    }
  }

  const filteredNews = news.filter(n => showDeleted ? true : n.is_visible);
  const totalPages = Math.ceil(filteredNews.length / PAGE_SIZE);
  const pagedNews = filteredNews.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">관리자 로그인</h1>
              <p className="text-xs text-muted-foreground">ai.ktoolu.com/news/admin</p>
            </div>
          </div>
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={password}
            onChange={e => { setPassword(e.target.value); setLoginError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
            autoFocus
          />
          {loginError && (
            <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
              <X className="h-3 w-3" /> {loginError}
            </p>
          )}
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold">{'\uD83D\uDCCB'} 뉴스 관리</h1>
            <span className="text-xs text-muted-foreground">
              총 {filteredNews.length}건 {!showDeleted && ("(숨김 " + news.filter(n => !n.is_visible).length + "건)")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowDeleted(!showDeleted); setPage(0); }}
              className={"flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors " + (showDeleted ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground")}
            >
              {showDeleted ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showDeleted ? "숨김 포함" : "표시만"}
            </button>
            <button
              onClick={fetchNews}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> 새로고침
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-red-400 hover:border-red-500/20 transition-colors"
            >
              <LogOut className="h-3 w-3" /> 로그아웃
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className={"fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-all " + (toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white")}>
          {toast.type === "success" ? <Check className="h-3.5 w-3.5 inline mr-1" /> : <X className="h-3.5 w-3.5 inline mr-1" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-card border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button onClick={fetchNews} className="text-xs text-primary hover:underline">{"\uB2E4\uC2DC \uC2DC\uB3C4"}</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground w-12">ID</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">{'\uC81C\uBAA9'}</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground w-24">{'\uCD9C\uCC98'}</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground w-20">{'\uB0A0\uC9DC'}</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground w-16">{'\uD45C\uC2DC'}</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground w-20">{'\uD3B8\uC9D1\uC790\uD53D'}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedNews.map(item => (
                    <tr
                      key={item.id}
                      className={"border-b border-border/20 hover:bg-muted/20 transition-colors" + (!item.is_visible ? " opacity-40" : "")}
                    >
                      <td className="px-3 py-2.5 text-xs text-muted-foreground font-mono">{item.id}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-foreground line-clamp-1">{item.title}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.source}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(item.collected_at).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => toggleVisibility(item)}
                          className={"inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors " + (item.is_visible ? "text-green-500 hover:bg-green-500/10" : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent")}
                          title={item.is_visible ? "숨기기" : "표시하기"}
                        >
                          {item.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => toggleEditorPick(item)}
                          className={"inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors " + (item.tags?.includes("편집자픽") ? "text-amber-500 hover:bg-amber-500/10" : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent")}
                          title={item.tags?.includes("편집자픽") ? "편집자픽 해제" : "편집자픽 지정"}
                        >
                          <Star className={"h-3.5 w-3.5 " + (item.tags?.includes("편집자픽") ? "fill-amber-500" : "")} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" /> 이전
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={(page === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent") + " w-7 h-7 rounded-md text-xs font-medium transition-colors"}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  다음 <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
