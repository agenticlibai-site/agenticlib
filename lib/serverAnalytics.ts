import { sendEmail } from "./email";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TrackPayload {
  popup_id?: unknown;
  time_visible_ms?: unknown;
  dismiss_method?: unknown;
  cta_label?: unknown;
  page_url?: unknown;
  timestamp?: unknown;
  event_id?: unknown;
  [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeStr(v: unknown, fallback = "unknown"): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function validatePayload(raw: unknown): TrackPayload {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as TrackPayload;
  return {};
}

// ── In-memory dedup (per-process, 5 s window) ─────────────────────────────────

const recentHashes = new Set<string>();

function isDuplicate(event: string, payload: TrackPayload): boolean {
  const popupId    = safeStr(payload.popup_id, "unknown");
  const eventId    = safeStr(payload.event_id, "");
  const timeBucket = Math.floor(Date.now() / 1_000);
  const hash = eventId
    ? `${event}:${popupId}:${eventId}`
    : `${event}:${popupId}:${timeBucket}`;
  if (recentHashes.has(hash)) return true;
  recentHashes.add(hash);
  setTimeout(() => recentHashes.delete(hash), 5_000);
  return false;
}

// ── In-memory email cooldown (5 min per event+popup) ─────────────────────────

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1_000;

function canSendEmail(key: string): boolean {
  const last = cooldowns.get(key);
  if (last && Date.now() - last < COOLDOWN_MS) return false;
  cooldowns.set(key, Date.now());
  return true;
}

// ── Email builders ────────────────────────────────────────────────────────────

function getSubject(event: string, payload: TrackPayload): string {
  switch (event) {
    case "popup_cta_clicked":       return `Popup CTA Clicked — "${safeStr(payload.cta_label, "unknown")}"`;
    case "popup_dismissed_x":       return "Popup Closed (X)";
    case "popup_dismissed_outside": return "Popup Closed (Outside Click)";
    case "popup_dismissed_esc":     return "Popup Closed (ESC)";
    case "popup_shown":             return "Popup Shown";
    default:                        return `Popup Event: ${event}`;
  }
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 14px;font-weight:600;color:#3f3f46;background:#f4f4f5;white-space:nowrap;">${label}</td>
    <td style="padding:8px 14px;color:#18181b;">${value}</td>
  </tr>`;
}

function buildEmailHtml(event: string, payload: TrackPayload): string {
  const timeMs  = safeNum(payload.time_visible_ms, 0);
  const timeStr = timeMs > 0
    ? (timeMs >= 1_000 ? `${(timeMs / 1_000).toFixed(1)}s` : `${timeMs}ms`)
    : "—";

  const rows = [
    row("Event",        event),
    row("Page URL",     safeStr(payload.page_url,  "—")),
    row("CTA Selected", safeStr(payload.cta_label, "—")),
    row("Time Visible", timeStr),
    row("Timestamp",    safeStr(payload.timestamp, new Date().toUTCString())),
    row("Event ID",     safeStr(payload.event_id,  "—")),
  ].join("\n");

  return `
  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#18181b;">
    <h2 style="margin-bottom:4px;">Popup Interaction</h2>
    <p style="color:#71717a;margin-top:0;font-size:13px;">${new Date().toUTCString()}</p>
    <table style="border-collapse:collapse;width:100%;margin-top:12px;">${rows}</table>
    <p style="margin-top:20px;color:#a1a1aa;font-size:11px;">AgenticLib Analytics</p>
  </div>`;
}

// ── Popup events that trigger immediate email ─────────────────────────────────

const POPUP_EVENTS = new Set([
  "popup_shown",
  "popup_cta_clicked",
  "popup_dismissed_x",
  "popup_dismissed_outside",
  "popup_dismissed_esc",
]);

// ── Public trackEvent ─────────────────────────────────────────────────────────

export async function trackEvent(event: string, rawPayload: unknown): Promise<void> {
  if (!POPUP_EVENTS.has(event)) return;

  const payload = validatePayload(rawPayload);
  if (isDuplicate(event, payload)) return;

  const popupId = safeStr(payload.popup_id, "unknown");
  if (!canSendEmail(`${event}:${popupId}`)) {
    console.log("[serverAnalytics] cooldown active, skipping:", event);
    return;
  }

  // Fire-and-forget — don't block the route response
  void sendEmail({
    subject: getSubject(event, payload),
    html:    buildEmailHtml(event, payload),
  }).catch((err) => console.error("[serverAnalytics] email failed:", event, err));
}
