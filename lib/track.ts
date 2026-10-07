// Measurement calls that are safe to make anywhere: every function is a no-op unless the Meta pixel
// has been mounted on the page (components/MetaPixel.tsx — rendered only when NEXT_PUBLIC_META_PIXEL_ID is
// set, and only inside the /free-proof layout; never on /c, /order or the registry — D19, master plan S8).
// Event taxonomy per the master plan: `Lead` only for a real form — the free-proof request is one.

type Fbq = (action: "track" | "trackCustom", event: string, payload?: Record<string, unknown>) => void;

const fbq = (): Fbq | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { fbq?: unknown };
  return typeof w.fbq === "function" ? (w.fbq as Fbq) : null;
};

/** The free-proof request was submitted (thanks page). Never carries a name, an email or a photo URL. */
export function trackLead(payload: { content_category?: string; content_ids?: string[]; num_items?: number } = {}): void {
  fbq()?.("track", "Lead", payload);
}

/**
 * The funnel's own custom events (ads brief §17, 2026-10-07) — `trackCustom`, so they never collide with Meta's
 * standard ones: ProofStart (the first touch of the form), SportSelected, PhotoUpload. Product and style choices
 * stay on the standard CustomizeProduct; the conversion stays Lead, fired on the thanks page only.
 */
export function trackFunnel(event: "ProofStart" | "SportSelected" | "PhotoUpload", payload: { content_ids?: string[]; num_items?: number } = {}): void {
  fbq()?.("trackCustom", event, payload);
}

/** A product tile or a style tile was chosen on the form. */
export function trackCustomize(payload: { content_category?: string; content_ids?: string[] } = {}): void {
  fbq()?.("track", "CustomizeProduct", payload);
}
