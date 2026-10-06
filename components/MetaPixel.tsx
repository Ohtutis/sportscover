"use client";

import { useEffect } from "react";
import { META_PIXEL_ID } from "../lib/site";

/**
 * The Meta pixel (D29: the owner runs Meta ads to /free-proof from 2026-10-04; the request is the
 * conversion). D19 kept honest, in code:
 *
 *  - The id is `META_PIXEL_ID` in lib/site.ts (a pixel id is public — it is in every page that loads
 *    it), overridable by `NEXT_PUBLIC_META_PIXEL_ID`. Empty, malformed or not digits → nothing loads.
 *  - US-first (2026-10-06): before loading, the page asks `/api/geo`; a visitor in the EU, the EEA,
 *    the UK or Switzerland — or one whose country is unknown — gets no pixel. A visitor who pressed
 *    "Turn off ad measurement" on /privacy (localStorage `AD_OPT_OUT_KEY`) gets none either.
 *  - Mounted by ONE file, `app/(marketing)/free-proof/layout.tsx`. The root and marketing layouts never
 *    mount it, so `/c`, `/order`, `/registry` and every other page never load it (a test scans for any
 *    other import).
 *  - No `<noscript>` image beacon. No automatic events: `autoConfig` off (no button-click or page-
 *    metadata scraping) and `disablePushState` (no PageView on later client navigations), so a parent
 *    who leaves /free-proof for another page sends nothing more from it.
 *  - A browser that sends Global Privacy Control gets no pixel at all.
 *
 * One PageView per page load that reaches /free-proof; the Lead on the thanks page and anything else
 * go through `lib/track.ts`, whose payloads never carry a name, an email or a photo.
 */

export const META_PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";

/** localStorage key set by the /privacy opt-out button; while it is "1" the pixel never loads in this browser. */
export const AD_OPT_OUT_KEY = "gde_no_ad_measurement";

/**
 * Where an advertising cookie needs consent before it is set (ePrivacy / UK PECR / Swiss FADP): the 27 EU
 * states, Iceland, Liechtenstein, Norway, the UK and Switzerland. The pixel is simply not loaded there.
 */
export const NO_PIXEL_COUNTRIES: readonly string[] = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT",
  "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

/** Whether the pixel may load for a visitor in `country` (an empty or unknown country never loads it). */
export const pixelAllowedIn = (country: string): boolean => /^[A-Z]{2}$/.test(country) && !NO_PIXEL_COUNTRIES.includes(country);

/** Whether this browser opted out on /privacy. Storage blocked counts as not opted out only if reading works. */
export function optedOut(storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined" ? window.localStorage : null): boolean {
  try {
    return storage?.getItem(AD_OPT_OUT_KEY) === "1";
  } catch {
    return true;
  }
}

/** A pixel id is digits only; anything else is a typo (or an injection) and loads nothing. */
export function metaPixelId(raw: string | undefined = process.env.NEXT_PUBLIC_META_PIXEL_ID || META_PIXEL_ID): string | null {
  const id = (raw ?? "").trim();
  return /^\d{5,20}$/.test(id) ? id : null;
}

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: unknown;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};

export interface PixelHost {
  fbq?: unknown;
  _fbq?: unknown;
  navigator?: { globalPrivacyControl?: boolean };
}

export interface PixelDocument {
  createElement(tag: "script"): { async: boolean; src: string };
  getElementsByTagName(tag: "script"): ArrayLike<{ parentNode: { insertBefore(node: unknown, ref: unknown): unknown } | null }>;
  head: { appendChild(node: unknown): unknown };
}

/**
 * Meta's standard base code, written out so it can be read and tested: a queueing `fbq` stub, one
 * async `<script>` for fbevents.js, then init + PageView. Returns false when it did nothing (GPC on).
 * Idempotent: a second call in the same page load neither adds a script nor sends a second PageView.
 */
export function loadMetaPixel(id: string, w: PixelHost = window as unknown as PixelHost, d: PixelDocument = document as unknown as PixelDocument): boolean {
  if (w.navigator?.globalPrivacyControl === true) return false;
  if (typeof w.fbq === "function") return true;

  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  } as Fbq;
  w.fbq = n;
  if (!w._fbq) w._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  n.disablePushState = true;

  const script = d.createElement("script");
  script.async = true;
  script.src = META_PIXEL_SRC;
  const first = d.getElementsByTagName("script")[0];
  if (first?.parentNode) first.parentNode.insertBefore(script, first);
  else d.head.appendChild(script);

  n("set", "autoConfig", false, id);
  n("init", id);
  n("track", "PageView");
  return true;
}

/** Renders nothing, ever; after hydration, loads the pixel only for a valid id, an allowed country and no opt-out. */
export function MetaPixel() {
  const id = metaPixelId();
  useEffect(() => {
    if (!id || optedOut()) return;
    let cancelled = false;
    fetch("/api/geo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { country: "" }))
      .then((g: { country?: string }) => {
        if (!cancelled && pixelAllowedIn(String(g.country ?? ""))) loadMetaPixel(id);
      })
      .catch(() => {
        // No country, no pixel.
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  return null;
}
