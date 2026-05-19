import posthog from "posthog-js";

export type AnalyticsPayload = Record<string, unknown>;

// Short ID to correlate client events with server-side email alerts
function genEventId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Client-side dedup: drop same event+entity within 2 s (handles rapid re-renders / retries)
const _seen = new Map<string, number>();
const DEDUP_MS = 2_000;

function isDuplicate(key: string): boolean {
  const last = _seen.get(key);
  if (last && Date.now() - last < DEDUP_MS) return true;
  _seen.set(key, Date.now());
  return false;
}

// sendBeacon survives page unload / navigation — fallback to fetch(keepalive)
function deliver(body: string): void {
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(
      "/api/track-event",
      new Blob([body], { type: "application/json" }),
    );
    if (sent) return;
  }
  fetch("/api/track-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function trackEvent(eventName: string, payload: AnalyticsPayload): void {
  if (typeof window === "undefined") return;

  // Dedup on event name + primary entity identifier (covers popup, blog, domain, and search events)
  const entity =
    payload.popup_id ?? payload.blog_slug ?? payload.domain_slug ?? payload.query ?? "";
  const dedupKey = `${eventName}:${entity}:${payload.cta_label ?? ""}`;
  if (isDuplicate(dedupKey)) return;

  console.log("[analytics:client] event fired:", eventName, payload);

  // Popup events bypass PostHog — they go directly to the server email pipeline
  if (!eventName.startsWith("popup_")) {
    posthog.capture(eventName, payload);
  }

  deliver(
    JSON.stringify({
      event: eventName,
      payload: { ...payload, event_id: genEventId() },
    }),
  );
}
