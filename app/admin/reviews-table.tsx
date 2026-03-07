"use client";

import { useState, useTransition } from "react";
import { deleteReview, toggleHidden } from "./actions";
import { type Review } from "@/lib/supabase";
import { aiTools } from "@/lib/ai-tools-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, Trash2, Eye, EyeOff } from "lucide-react";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= rating ? "fill-amber-400 text-amber-400" : "text-border"
          }`}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export function AdminReviewsTable({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [pending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const handleToggleHidden = (id: string, currentHidden: boolean) => {
    startTransition(async () => {
      await toggleHidden(id, !currentHidden);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, hidden: !currentHidden } : r))
      );
    });
  };

  const totalCount = reviews.length;
  const hiddenCount = reviews.filter((r) => r.hidden).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "-";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "전체 리뷰", value: totalCount },
          { label: "숨김 처리", value: hiddenCount },
          { label: "평균 별점", value: avgRating },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Star className="h-8 w-8 text-border mb-3" />
            <p className="text-sm text-muted-foreground">등록된 리뷰가 없습니다</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-medium">툴</TableHead>
                <TableHead className="text-xs font-medium">별점</TableHead>
                <TableHead className="text-xs font-medium">코멘트</TableHead>
                <TableHead className="text-xs font-medium">상태</TableHead>
                <TableHead className="text-xs font-medium">작성시간</TableHead>
                <TableHead className="text-xs font-medium text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => {
                const tool = aiTools.find((t) => t.id === review.tool_slug);
                return (
                  <TableRow
                    key={review.id}
                    className={`border-border/50 transition-colors ${
                      review.hidden ? "opacity-50" : ""
                    }`}
                  >
                    <TableCell className="font-medium text-sm">
                      {tool?.name ?? review.tool_slug}
                    </TableCell>
                    <TableCell>
                      <StarDisplay rating={review.rating} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {review.comment || (
                          <span className="text-border italic text-xs">없음</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={review.hidden ? "secondary" : "outline"}
                        className={`text-xs ${
                          review.hidden
                            ? "bg-muted text-muted-foreground"
                            : "border-emerald-500/30 text-emerald-500"
                        }`}
                      >
                        {review.hidden ? "숨김" : "표시"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(review.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          disabled={pending}
                          onClick={() => handleToggleHidden(review.id, review.hidden)}
                          title={review.hidden ? "표시하기" : "숨기기"}
                        >
                          {review.hidden ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              disabled={pending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>리뷰를 삭제할까요?</AlertDialogTitle>
                              <AlertDialogDescription>
                                이 작업은 되돌릴 수 없습니다. 리뷰가 영구적으로 삭제됩니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(review.id)}
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
