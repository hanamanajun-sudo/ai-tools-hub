"use client";

import { useState } from "react";

export function ScreenshotGallery({
  screenshots,
  toolName,
}: {
  screenshots: string[];
  toolName: string;
}) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden mb-8">
      <div
        className="flex gap-4 overflow-x-auto p-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {screenshots.map((src, i) => (
          <div
            key={i}
            className="shrink-0 w-[280px] sm:w-[360px] rounded-lg bg-muted/50 border border-border/30 overflow-hidden"
          >
            <div className="aspect-[16/10] relative bg-muted overflow-hidden">
              {failedImages.has(i) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/80 to-muted">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2 opacity-30">🖥️</div>
                    <p className="text-xs text-muted-foreground">
                      {toolName} 스크린샷 {i + 1}
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={src}
                  alt={`${toolName} 스크린샷 ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => handleImageError(i)}
                />
              )}
            </div>
            <div className="p-2 text-center">
              <span className="text-[10px] text-muted-foreground">
                {i + 1} / {screenshots.length}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
