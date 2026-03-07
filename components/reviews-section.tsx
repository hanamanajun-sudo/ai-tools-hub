"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type Review } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Send, Loader2 } from "lucide-react";

interface ReviewsSectionProps {
  toolSlug: string;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${i}점`}
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              i <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function AverageStars({ average }: { average: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= Math.round(average)
              ? "fill-amber-400 text-amber-400"
              : "text-border"
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

export function ReviewsSection({ toolSlug }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("tool_slug", toolSlug)
      .eq("hidden", false)
      .order("created_at", { ascending: false });

    if (!error && data) setReviews(data);
    setLoading(false);
  }, [toolSlug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError("별점을 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase.from("reviews").insert({
      tool_slug: toolSlug,
      rating,
      comment: comment.trim(),
    });

    if (error) {
      setSubmitError("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } else {
      setRating(0);
      setComment("");
      setSubmitted(true);
      await fetchReviews();
      setTimeout(() => setSubmitted(false), 3000);
    }

    setSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">별점 & 코멘트</h2>
          {reviews.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {reviews.length}
            </span>
          )}
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <AverageStars average={averageRating} />
            <span className="text-sm font-bold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">/ 5</span>
          </div>
        )}
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-border/50 bg-muted/20 p-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">별점 선택</p>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">코멘트 (선택)</p>
          <Textarea
            placeholder="이 도구를 사용해본 경험을 공유해주세요..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            className="resize-none bg-background text-sm"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {comment.length} / 500
          </p>
        </div>
        {submitError && (
          <p className="text-xs text-destructive">{submitError}</p>
        )}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            size="sm"
            disabled={submitting || rating === 0}
            className="gap-2"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {submitting ? "제출 중..." : "리뷰 제출"}
          </Button>
          {submitted && (
            <span className="text-xs text-emerald-500 font-medium animate-in fade-in">
              리뷰가 등록됐습니다!
            </span>
          )}
        </div>
      </form>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed border-border/50">
          <Star className="h-8 w-8 text-border mb-2" />
          <p className="text-sm text-muted-foreground">아직 등록된 리뷰가 없습니다</p>
          <p className="text-xs text-muted-foreground/60 mt-1">첫 번째 리뷰를 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-border/50 bg-muted/10 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(review.created_at)}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-foreground leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
