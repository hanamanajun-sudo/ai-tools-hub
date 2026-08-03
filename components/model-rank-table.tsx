"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowUpDown, TrendingUp, TrendingDown, Sparkles, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

type ModelRow = {
  id: number;
  label: string;
  company: string | null;
  company_slug: string | null;
  rank: number;
  intelligence: number | null;
  speed: number | null;
  cost: number | null;
  context: number | null;
  openness: number | null;
  collected_at: string;
  collected_date: string;
};

type SortKey = "intelligence" | "speed" | "cost" | "rank";

const COMPANY_COLORS: Record<string, string> = {
  "Anthropic": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "OpenAI": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Google": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "xAI": "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  "Moonshot AI": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Zhipu AI": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "MiniMax": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "DeepSeek": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "NVIDIA": "bg-green-500/10 text-green-400 border-green-500/20",
};

function formatContext(tokens: number | null): string {
  if (!tokens) return "-";
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return String(tokens);
}

function CompanyLink({ row }: { row: ModelRow }) {
  const cls = COMPANY_COLORS[row.company ?? ""] ?? "bg-secondary/50 text-muted-foreground border-border";
  if (row.company_slug) {
    return (
      <Link
        href={`/tools/${row.company_slug}`}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium hover:opacity-80 transition-opacity ${cls}`}
      >
        {row.company}
        <ExternalLink className="h-2.5 w-2.5" />
      </Link>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {row.company}
    </span>
  );
}

export function ModelRankTable() {
  const [rows, setRows] = useState<ModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("intelligence");
  const [sortAsc, setSortAsc] = useState(false);
  const [prevRanks, setPrevRanks] = useState<Record<string, number>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        // 최신 날짜 데이터
        const { data, error } = await supabase
          .from("ai_model_rank")
          .select("*")
          .order("collected_date", { ascending: false })
          .order("rank", { ascending: true })
          .limit(8);
        if (error) throw error;
        if (data && data.length > 0) {
          const latestDate = data[0].collected_date;
          const todayRows = data.filter((r: ModelRow) => r.collected_date === latestDate);
          setRows(todayRows);
          setUpdatedAt(todayRows[0]?.collected_at ?? null);

          // 이전 날짜 순위 (변화 감지용)
          const { data: older } = await supabase
            .from("ai_model_rank")
            .select("label, rank, collected_date")
            .lt("collected_date", latestDate)
            .order("collected_date", { ascending: false })
            .limit(16);
          if (older && older.length > 0) {
            const prevDate = older[0].collected_date;
            const prevMap: Record<string, number> = {};
            older
              .filter((r: any) => r.collected_date === prevDate)
              .forEach((r: any) => { prevMap[r.label] = r.rank; });
            setPrevRanks(prevMap);
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [rows, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  // 변화 감지 원라인 뉴스
  const newsLines = useMemo(() => {
    const lines: { text: string; up: boolean }[] = [];
    const latest = [...rows].sort((a, b) => a.rank - b.rank);
    latest.forEach(row => {
      const prev = prevRanks[row.label];
      if (prev === undefined) {
        lines.push({ text: `신규 진입: ${row.company ?? ""} ${row.label} ${row.rank}위`, up: true });
      } else if (prev !== row.rank) {
        const up = row.rank < prev;
        lines.push({
          text: `${row.label} ${up ? "상승" : "하락"} → ${row.rank}위`,
          up,
        });
      }
    });
    if (latest.length > 0) {
      const fastest = [...latest].sort((a, b) => (b.speed ?? 0) - (a.speed ?? 0))[0];
      const cheapest = [...latest].sort((a, b) => (a.cost ?? 999) - (b.cost ?? 999))[0];
      lines.push({ text: `최속: ${fastest.label} ${fastest.speed} tok/s`, up: true });
      lines.push({ text: `최저비용: ${cheapest.label} $${cheapest.cost}`, up: true });
    }
    return lines;
  }, [rows, prevRanks]);

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      title={`${label} 정렬`}
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortKey === k ? "text-primary" : "text-muted-foreground/40"}`} />
    </button>
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6 animate-pulse">
        <div className="h-5 w-48 rounded bg-muted mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (error || rows.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-bold text-foreground">AI 모델 랭킹</h2>
          <span className="text-xs text-muted-foreground">Artificial Analysis 기준</span>
        </div>
        {updatedAt && (
          <span className="text-xs text-muted-foreground">
            ⏱ {new Date(updatedAt).toLocaleDateString("ko-KR")} 갱신
          </span>
        )}
      </div>

      {/* 원라인 뉴스 */}
      {newsLines.length > 0 && (
        <div className="px-5 py-3 border-b border-border/40 bg-primary/[0.03] space-y-1">
          {newsLines.map((n, i) => (
            <p key={i} className="flex items-center gap-1.5 text-xs text-foreground/80">
              {n.up
                ? <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                : <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />}
              {n.text}
            </p>
          ))}
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground">
              <th className="px-4 py-3 text-left text-xs font-medium w-10">#</th>
              <th className="px-2 py-3 text-left text-xs font-medium">모델</th>
              <th className="px-2 py-3 text-right text-xs font-medium">
                <SortHeader label="🧠 지능" k="intelligence" />
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium hidden sm:table-cell">
                <SortHeader label="⚡ 속도" k="speed" />
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium hidden sm:table-cell">
                <SortHeader label="💰 비용" k="cost" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium hidden md:table-cell">📏 컨텍스트</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const prev = prevRanks[row.label];
              const rankChanged = prev !== undefined && prev !== row.rank;
              return (
                <tr key={row.id} className="border-b border-border/20 last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-muted-foreground">
                    {row.rank}
                    {rankChanged && (
                      <span className={`ml-1 text-[10px] ${row.rank < prev ? "text-emerald-500" : "text-red-500"}`}>
                        {row.rank < prev ? "▲" : "▼"}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate max-w-[180px]">{row.label}</p>
                        <div className="mt-1"><CompanyLink row={row} /></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right font-mono text-sm font-semibold text-foreground">
                    {row.intelligence?.toFixed(1) ?? "-"}
                  </td>
                  <td className="px-2 py-3 text-right font-mono text-sm text-foreground/80 hidden sm:table-cell">
                    {row.speed ? `${row.speed.toFixed(0)}` : "-"}
                  </td>
                  <td className="px-2 py-3 text-right font-mono text-sm text-foreground/80 hidden sm:table-cell">
                    ${row.cost?.toFixed(2) ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {formatContext(row.context)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground">
          출처: Artificial Analysis (공개 데이터) · 모델 이름 클릭 시 상세 정보 확인
        </p>
      </div>
    </section>
  );
}
