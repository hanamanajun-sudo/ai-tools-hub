type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

/** GA4로 커스텀 이벤트 전송. gtag 스크립트가 아직 없거나 SSR 중이면 조용히 무시 */
export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", action, params);
}
