import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { isAuthenticated, logoutAction } from "./actions";
import { LoginForm } from "./login-form";
import { AdminReviewsTable } from "./reviews-table";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin - AI Tools Hub",
  robots: { index: false, follow: false },
};

async function AdminContent() {
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminReviewsTable initialReviews={reviews ?? []} />;
}

export default async function AdminPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return (
      <Suspense>
        <LoginForm />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">AI Tools Hub</span>
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm font-semibold text-foreground">관리자</span>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">리뷰 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            전체 리뷰를 확인하고 숨기거나 삭제할 수 있습니다.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
          }
        >
          <AdminContent />
        </Suspense>
      </main>
    </div>
  );
}
