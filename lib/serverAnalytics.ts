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
// NOTE: In serverless each cold-start is a new process, so dedup only catches
// duplicate requests that arrive within the same warm instance.

const recentHashes = new Set<string>();

function isDuplicate(event: string, payload: TrackPayload): boolean {
  const popupId    = safeStr(payload.popup_id, "unknown");
  const eventId    = safeStr(payload.event_id, "");
  const timeBucket = Math.floor(Date.now() / 1_000);
  const hash = eventId
    ? `${event}:${popupId}:${eventId}`
    : `${event}:${popupId}:${timeBucket}`;

  if (recentHashes.has(hash)) {
    console.log("[serverAnalytics] dedup blocked event:", event, "hash:", hash);
    return true;
  }

  recentHashes.add(hash);
  setTimeout(() => recentHashes.delete(hash), 5_000);
  return false;
}

// ── In-memory email cooldown (5 min per event+popup) ─────────────────────────
// Same serverless caveat as dedup: only effective within a warm instance.

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1_000;

function isOnCooldown(key: string): boolean {
  const last = cooldowns.get(key);
  if (last && Date.now() - last < COOLDOWN_MS) return true;
  cooldowns.set(key, Date.now());
  return false;
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

// ── Public trackEvent ─────────────────────────────────────────────────────────

export async function trackEvent(event: string, rawPayload: unknown): Promise<void> {
  console.log("[serverAnalytics] processing event:", event);

  // Prefix check — more resilient than a hardcoded Set
  if (!event.startsWith("popup_")) {
    console.log("[serverAnalytics] non-popup event ignored:", event);
    return;
  }

  const payload = validatePayload(rawPayload);
  console.log("[serverAnalytics] payload:", JSON.stringify(payload));

  if (isDuplicate(event, payload)) {
    // isDuplicate logs the block itself
    return;
  }
  console.log("[serverAnalytics] passed dedup check:", event);

  const popupId     = safeStr(payload.popup_id, "unknown");
  const cooldownKey = `${event}:${popupId}`;
  if (isOnCooldown(cooldownKey)) {
    console.log("[serverAnalytics] cooldown active, skipping email:", event, "popup:", popupId);
    return;
  }
  console.log("[serverAnalytics] passed cooldown check:", event);

  const subject = getSubject(event, payload);
  const html    = buildEmailHtml(event, payload);

  console.log("[serverAnalytics] sending email:", event, "subject:", subject);

  try {
    await sendEmail({ subject, html });
    console.log("[serverAnalytics] email success:", event);
  } catch (err) {
    console.error("[serverAnalytics] email failed:", event, err);
    // Re-throw so the route can log and return a 500, making the failure visible
    throw err;
  }
}
