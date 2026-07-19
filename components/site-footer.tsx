import Link from "next/link";
import { Sparkles } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "AI 도구" },
  { href: "/prompts", label: "프롬프트 도서관" },
  { href: "/blog", label: "블로그" },
  { href: "/news", label: "AI 뉴스" },
  { href: "/glossary", label: "용어해설" },
];

const INFO_LINKS = [
  { href: "/about", label: "소개" },
  { href: "/contact", label: "문의" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/10 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <div className="flex items-center justify-center gap-1.5 sm:justify-start">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground">ai.ktoolu</span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              최고의 AI 도구들을 한곳에서
            </p>
          </div>

          <nav aria-label="사이트 링크" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border/30 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ai.ktoolu. All rights reserved.</p>
          <nav aria-label="정책 링크" className="flex items-center gap-4">
            {INFO_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
