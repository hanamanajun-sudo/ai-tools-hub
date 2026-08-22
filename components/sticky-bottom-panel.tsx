"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const LG_BREAKPOINT = 1024; // Tailwind `lg:` 기준

/**
 * "사이드바 자체가 끝까지 스크롤된 뒤, 왼쪽 메인이 다 내려갈 때까지 하단에 붙어있는" 패턴.
 *
 * CSS `position: sticky; bottom: N`은 이 프로젝트의 중첩 그리드 구조(사이드바 grid item을
 * 늘려 메인 컬럼과 높이를 맞추고, 그 안의 짧은 자식에 sticky bottom을 거는 방식)에서
 * 실제 브라우저 테스트 결과 전혀 붙지 않는 것을 확인함 — align-items:start로 바꿔봐도
 * 동일. 그래서 스크롤 위치를 직접 계산해 fixed/absolute를 오가는 방식으로 구현.
 */
export function StickyBottomPanel({
  children,
  gap = 24,
  className,
}: {
  children: ReactNode;
  gap?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  useEffect(() => {
    let ticking = false;

    function update() {
      ticking = false;
      const container = containerRef.current;
      const panel = panelRef.current;
      if (!container || !panel) return;

      if (window.innerWidth < LG_BREAKPOINT) {
        setPanelStyle({});
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const panelHeight = panel.offsetHeight;
      const vh = window.innerHeight;
      const stickLine = vh - gap; // 패널 하단이 이 선(뷰포트 기준)에 닿으면 붙잡음

      const staticBottom = containerRect.top + panelHeight; // 그냥 흘러갈 때 뷰포트 기준 패널 하단

      if (staticBottom > stickLine) {
        // 패널 자체가 아직 다 안 보임 — 자연스럽게 흘러가며 스크롤되는 중
        setPanelStyle({});
      } else if (containerRect.bottom <= stickLine) {
        // 왼쪽 메인 콘텐츠 끝에 도달 — 컨테이너 하단에 붙여서 마무리
        setPanelStyle({ position: "absolute", left: 0, right: 0, bottom: 0 });
      } else {
        // 스크롤 중간 구간 — 뷰포트 하단에 고정
        setPanelStyle({
          position: "fixed",
          left: containerRect.left,
          width: containerRect.width,
          bottom: gap,
        });
      }
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    // 메인 컬럼(형제 요소)이 비동기 데이터 로딩 후 늘어나면 그리드 stretch로 인해
    // containerRef 높이도 뒤늦게 바뀌므로, scroll/resize 없이도 재계산되도록 감시.
    const resizeObserver = new ResizeObserver(onScrollOrResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      resizeObserver.disconnect();
    };
  }, [gap]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div ref={panelRef} style={panelStyle}>
        {children}
      </div>
    </div>
  );
}
