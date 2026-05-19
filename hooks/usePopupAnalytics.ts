"use client";

import { useRef, useCallback, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface UsePopupAnalyticsOptions {
  popupId: string;
  pageUrl: string;
  visible: boolean;
  onDismissEsc: () => void;
}

export function usePopupAnalytics({
  popupId,
  pageUrl,
  visible,
  onDismissEsc,
}: UsePopupAnalyticsOptions) {
  const shownAtRef       = useRef<number | null>(null);
  const hasDismissedRef  = useRef(false);
  const hasInteractedRef = useRef(false);

  const ts      = () => new Date().toISOString();
  const elapsed = (): number =>
    shownAtRef.current !== null
      ? Math.round(performance.now() - shownAtRef.current)
      : 0;

  // ── popup_shown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      if (shownAtRef.current !== null) {
        shownAtRef.current    = null;
        hasDismissedRef.current  = false;
        hasInteractedRef.current = false;
      }
      return;
    }
    if (shownAtRef.current !== null) return;

    shownAtRef.current = performance.now();
    trackEvent("popup_shown", { popup_id: popupId, page_url: pageUrl, timestamp: ts() });
  }, [visible, popupId, pageUrl]);

  // ── ESC key → popup_dismissed_esc ────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (hasDismissedRef.current || hasInteractedRef.current) return;

      hasDismissedRef.current = true;
      trackEvent("popup_dismissed_esc", {
        popup_id:        popupId,
        page_url:        pageUrl,
        time_visible_ms: elapsed(),
        timestamp:       ts(),
      });
      onDismissEsc();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, popupId, pageUrl]);

  // ── X button → popup_dismissed_x ────────────────────────────────────────────
  const trackDismissedX = useCallback(() => {
    if (hasDismissedRef.current || hasInteractedRef.current) return;
    hasDismissedRef.current = true;
    trackEvent("popup_dismissed_x", {
      popup_id:        popupId,
      page_url:        pageUrl,
      time_visible_ms: elapsed(),
      timestamp:       ts(),
    });
  }, [popupId, pageUrl]);

  // ── Outside click → popup_dismissed_outside ──────────────────────────────────
  const trackDismissedOutside = useCallback(() => {
    if (hasDismissedRef.current || hasInteractedRef.current) return;
    hasDismissedRef.current = true;
    trackEvent("popup_dismissed_outside", {
      popup_id:        popupId,
      page_url:        pageUrl,
      time_visible_ms: elapsed(),
      timestamp:       ts(),
    });
  }, [popupId, pageUrl]);

  // ── CTA click → popup_cta_clicked ───────────────────────────────────────────
  const trackCtaClicked = useCallback(
    (ctaLabel: string) => {
      if (hasInteractedRef.current) return;
      hasInteractedRef.current = true;
      trackEvent("popup_cta_clicked", {
        popup_id:        popupId,
        page_url:        pageUrl,
        cta_label:       ctaLabel,
        time_visible_ms: elapsed(),
        timestamp:       ts(),
      });
    },
    [popupId, pageUrl],
  );

  return { trackCtaClicked, trackDismissedX, trackDismissedOutside };
}
