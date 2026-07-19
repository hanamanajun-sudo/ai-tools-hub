"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface OutboundLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  eventName: string;
  eventParams?: Record<string, unknown>;
  children: ReactNode;
}

/** 외부 링크 클릭을 GA4 이벤트로 기록하는 앵커. 서버 컴포넌트 안에서도 쓸 수 있게 클라이언트로 분리 */
export function OutboundLink({ eventName, eventParams, onClick, children, ...rest }: OutboundLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        trackEvent(eventName, eventParams);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
