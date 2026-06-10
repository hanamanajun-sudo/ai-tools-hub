import Link from "next/link";
import { Sparkles, BookOpen, Newspaper, LibraryBig } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const AI_TOOLS = [
  {
    name: "ChatGPT",
    href: "https://chat.openai.com",
    dot: "bg-emerald-500",
  },
  {
    name: "Claude",
    href: "https://claude.ai",
    dot: "bg-orange-400",
  },
  {
    name: "Gemini",
    href: "https://gemini.google.com",
    dot: "bg-blue-500",
  },
  {
    name: "Grok",
    href: "https://grok.com",
    dot: "bg-zinc-500",
  },
  {
    name: "GitHub",
    href: "https://github.com",
    dot: "bg-purple-500",
  },
];

interface SiteHeaderProps {
  activePage?: "blog" | "news" | "glossary";
  blogCount?: number;
}

export function SiteHeader({ activePage, blogCount }: SiteHeaderProps) {
  return (
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

        {/* Row 2: AI Tool Quick Links */}
        <div className="flex h-8 items-center gap-0.5 border-t border-border/20 pt-1 pb-1">
          {AI_TOOLS.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              title={tool.name}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors whitespace-nowrap"
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${tool.dot}`} />
              {tool.name}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
