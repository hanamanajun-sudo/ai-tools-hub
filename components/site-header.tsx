import Link from "next/link";
import { Sparkles, BookOpen, Newspaper, LibraryBig, Wand2, FileText, Image, Film, Code, Music, Bot, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// 실제 페이지 렌더링 순서와 동일한 카테고리 링크
// 페이지 순서: 코딩 → 텍스트/글쓰기 → 자동화/에이전트 → 비디오 → 이미지 생성 → 기타 → 음악
const CATEGORY_LINKS = [
  { label: "AI 모델 랭킹", href: "/#model-rank", icon: <TrendingUp className="h-3 w-3" />, highlight: true },
  { label: "코딩", href: "/#category-coding", icon: <Code className="h-3 w-3" /> },
  { label: "텍스트 / 글쓰기", href: "/#category-text", icon: <FileText className="h-3 w-3" /> },
  { label: "자동화 / 에이전트", href: "/#category-agent", icon: <Bot className="h-3 w-3" /> },
  { label: "비디오", href: "/#category-video", icon: <Film className="h-3 w-3" /> },
  { label: "이미지 생성", href: "/#category-image", icon: <Image className="h-3 w-3" /> },
  { label: "기타", href: "/#category-other", icon: <Sparkles className="h-3 w-3" /> },
  { label: "음악", href: "/#category-music", icon: <Music className="h-3 w-3" /> },
];

interface SiteHeaderProps {
  activePage?: "blog" | "news" | "glossary" | "prompts";
  blogCount?: number;
}

export function SiteHeader({ activePage, blogCount }: SiteHeaderProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        본문으로 바로가기
      </a>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        {/* Row 1: Logo + Internal nav */}
        <div className="flex h-12 items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">ai.ktoolu</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/news"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                activePage === "news"
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">AI 뉴스</span>
            </Link>
            <Link
              href="/blog"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                activePage === "blog"
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">블로그</span>
              {blogCount !== undefined && blogCount > 0 && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-mono text-primary leading-none">
                  {blogCount}
                </span>
              )}
            </Link>
            <Link
              href="/prompts"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                activePage === "prompts"
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">프롬프트</span>
            </Link>
            <Link
              href="/glossary"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                activePage === "glossary"
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <LibraryBig className="h-4 w-4" />
              <span className="hidden sm:inline">용어해설</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>

        {/* Row 2: Category Links */}
        <div className="flex items-center gap-0.5 border-t border-border/20 pt-1 pb-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CATEGORY_LINKS.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                cat.highlight
                  ? "text-primary font-semibold bg-primary/5 hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {cat.icon}
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
      </header>
    </>
  );
}
