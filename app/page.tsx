"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { aiTools, categories, type Category, type AITool } from "@/lib/ai-tools-data";
import { Search, ExternalLink, Sparkles, Star } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const categoryColors: Record<string, string> = {
  text: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  image: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  video: "bg-red-500/10 text-red-400 border-red-500/20",
  coding: "bg-green-500/10 text-green-400 border-green-500/20",
  music: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  other: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const categoryGlowColors: Record<string, string> = {
  text: "hover:shadow-blue-500/10",
  image: "hover:shadow-purple-500/10",
  video: "hover:shadow-red-500/10",
  coding: "hover:shadow-green-500/10",
  music: "hover:shadow-yellow-500/10",
  other: "hover:shadow-cyan-500/10",
};

function ToolCard({ tool }: { tool: AITool }) {
  const colorClass = categoryColors[tool.category];
  const glowClass = categoryGlowColors[tool.category];
  const categoryLabel = categories.find((c) => c.value === tool.category);

  return (
    <Card
      className={`group relative flex flex-col bg-card border-border/50 transition-all duration-300 hover:border-border hover:shadow-xl ${glowClass} hover:-translate-y-0.5`}
    >
      {tool.popular && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-black shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            인기
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                {categoryLabel?.emoji} {categoryLabel?.label}
              </span>
              {tool.free ? (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  무료
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
                  유료
                </span>
              )}
            </div>
            <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {tool.name}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button
            variant="outline"
            className="w-full gap-2 border-border/50 hover:border-border hover:bg-accent transition-all group/btn"
          >
            <span>사이트 방문</span>
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return aiTools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, selectedCategory]);

  const toolCountByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: aiTools.length };
    for (const tool of aiTools) {
      counts[tool.category] = (counts[tool.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">AI Tools Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{aiTools.length}개의 AI 도구</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16">
        {/* Hero Section */}
        <section className="py-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3" />
            최신 AI 도구 {aiTools.length}개 수록
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-4">
            최고의 AI 도구를
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              한곳에서 탐색하세요
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            텍스트, 이미지, 비디오, 코딩, 음악까지 — 업무와 창작을 혁신할
            AI 도구들을 카테고리별로 정리했습니다.
          </p>
        </section>

        {/* Search */}
        <section className="mb-8">
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="AI 도구 이름, 기능, 태그로 검색..."
              className="h-11 pl-10 pr-4 bg-muted/30 border-border/50 focus:border-border focus-visible:ring-1 focus-visible:ring-ring/50 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const count = toolCountByCategory[cat.value] ?? 0;
              const isSelected = selectedCategory === cat.value;
              return (
                <Button
                  key={cat.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 transition-all ${
                    isSelected
                      ? "shadow-sm"
                      : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-mono leading-none ${
                      isSelected
                        ? "bg-background/20 text-current"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </section>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredTools.length === 0 ? (
              "검색 결과가 없습니다"
            ) : (
              <>
                <span className="font-semibold text-foreground">{filteredTools.length}</span>
                개의 도구
                {searchQuery && (
                  <span className="ml-1">
                    — &quot;<span className="text-primary">{searchQuery}</span>&quot; 검색 결과
                  </span>
                )}
              </>
            )}
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-auto py-1"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              필터 초기화
            </Button>
          )}
        </div>

        {/* Tool Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              다른 검색어나 카테고리를 시도해보세요.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              전체 도구 보기
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            AI Tools Hub — 최고의 AI 도구들을 한곳에서
          </p>
        </div>
      </footer>
    </div>
  );
}
