import Link from "next/link";
import { Sparkles, BookOpen, Wrench, Info } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// 2026-10-18 리뉴얼: 내비는 작품 / 글 / 소개 세 개. 예전 2단(AI 도구 디렉터리 카테고리 줄)과
// "프롬프트" 링크(robots.txt로 막은 페이지)는 뺐다.
interface SiteHeaderProps {
  activePage?: "blog" | "prompts" | "made" | "about";
  blogCount?: number;
}

function navClass(active: boolean) {
  return `flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
    active ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent"
  }`;
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
          <div className="flex h-14 items-center justify-between gap-2">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">ktoolu</span>
            </Link>

            <nav aria-label="주 메뉴" className="flex items-center gap-1">
              <Link href="/made" className={navClass(activePage === "made")}>
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">작품</span>
              </Link>
              <Link href="/posts" className={navClass(activePage === "blog")}>
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">글</span>
                {blogCount !== undefined && blogCount > 0 && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-xs leading-none text-primary">
                    {blogCount}
                  </span>
                )}
              </Link>
              <Link href="/about" className={navClass(activePage === "about")}>
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">소개</span>
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
