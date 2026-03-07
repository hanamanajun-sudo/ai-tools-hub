"use client";

import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Lock } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get("error") === "1";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">AI Tools Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">관리자 로그인</h1>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6">
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                비밀번호
              </label>
              <Input
                type="password"
                name="password"
                placeholder="관리자 비밀번호 입력"
                autoFocus
                required
                className="bg-background"
              />
              {hasError && (
                <p className="mt-1.5 text-xs text-destructive">
                  비밀번호가 올바르지 않습니다.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
