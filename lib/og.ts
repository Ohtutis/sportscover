// Shared helpers for every `opengraph-image.tsx` (next/og ImageResponse). next/og cannot use next/font,
// so the two site families are fetched from Google Fonts at build time (the Vercel build has network)
// and memoised per process. `OgFrame` renders the 1200×630 shell: shield top-left, wordmark bottom-right,
// a hairline above the wordmark. Written with createElement so this stays a .ts module.
import { createElement, type ReactNode } from "react";
import { SHIELD_PATH, SHIELD_RATIO, SHIELD_VIEWBOX } from "../components/brand/Shield";
import { WORDMARK_PATH, WORDMARK_RATIO, WORDMARK_VIEWBOX } from "../components/brand/Wordmark";

export type OgFontFamily = "Anton" | "Space Grotesk";
export type OgFontWeight = 400 | 700;
export type OgTone = "stock" | "arena";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/** The token values the image shell paints with (CSS custom properties do not exist inside Satori). */
export const OG_COLORS = {
  stock: { bg: "#F4F3EF", ink: "#14191F", muted: "#5F636A", hairline: "#E8E7E2", shield: "#172C50", wordmark: "#172C50" },
  arena: { bg: "#080C12", ink: "#FFFFFF", muted: "#AEB6C2", hairline: "rgba(255,255,255,0.12)", shield: "#C7D0DC", wordmark: "#FFFFFF" },
} as const;

// Google serves TTF (which Satori can read; it cannot read woff2) to this user agent.
const TTF_USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0";
const fontCache = new Map<string, Promise<ArrayBuffer>>();

async function fetchGoogleFont(family: OgFontFamily, weight: OgFontWeight, text?: string): Promise<ArrayBuffer> {
  // Anton ships one weight; asking css2 for `:wght@` on it is unnecessary.
  const spec = family === "Anton" ? "Anton" : `${family.replace(/ /g, "+")}:wght@${weight}`;
  const url = `https://fonts.googleapis.com/css2?family=${spec}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
  const css = await fetch(url, { headers: { "User-Agent": TTF_USER_AGENT } });
  if (!css.ok) throw new Error(`loadGoogleFont: ${family} ${weight} → HTTP ${css.status}`);
  const match = /src:\s*url\(([^)]+)\)\s*format\(['"](?:truetype|opentype|woff)['"]\)/.exec(await css.text());
  if (!match) throw new Error(`loadGoogleFont: no TTF/OTF/WOFF source in the CSS for ${family} ${weight}`);
  const file = await fetch(match[1]);
  if (!file.ok) throw new Error(`loadGoogleFont: font file for ${family} ${weight} → HTTP ${file.status}`);
  return file.arrayBuffer();
}

/**
 * Fetch a Google font as an ArrayBuffer for `ImageResponse({ fonts: [{ name, data, weight }] })`.
 * Memoised per (family, weight, text) for the life of the build process; a failed fetch is not cached.
 */
export function loadGoogleFont(family: OgFontFamily, weight: OgFontWeight, text?: string): Promise<ArrayBuffer> {
  const key = `${family}:${weight}:${text ?? ""}`;
  let pending = fontCache.get(key);
  if (!pending) {
    pending = fetchGoogleFont(family, weight, text);
    fontCache.set(key, pending);
    pending.catch(() => fontCache.delete(key));
  }
  return pending;
}

/** The shield as a plain SVG element (flat fill — Satori renders inline SVG through resvg; gradients are avoided here on purpose). */
export function ogShield(tone: OgTone, height = 72) {
  const width = Math.round(height * SHIELD_RATIO);
  return createElement(
    "svg",
    { viewBox: SHIELD_VIEWBOX, width, height, style: { display: "flex" } },
    createElement("path", { d: SHIELD_PATH, fill: OG_COLORS[tone].shield, fillRule: "evenodd", clipRule: "evenodd" }),
  );
}

/** The wordmark as a plain SVG element. */
export function ogWordmark(tone: OgTone, height = 28) {
  const width = Math.round(height * WORDMARK_RATIO);
  return createElement(
    "svg",
    { viewBox: WORDMARK_VIEWBOX, width, height, style: { display: "flex" } },
    createElement("path", { d: WORDMARK_PATH, fill: OG_COLORS[tone].wordmark, fillRule: "evenodd", clipRule: "evenodd" }),
  );
}

export interface OgFrameProps {
  tone: OgTone;
  children?: ReactNode;
}

/**
 * The 1200×630 shell every route's OG image uses. Satori rules: every box is display:flex, no CSS
 * variables, no Tailwind. Register "Space Grotesk" (and "Anton" for the headline) via `loadGoogleFont`
 * in the route's `ImageResponse` options; the frame itself only names the families.
 */
export function OgFrame({ tone, children }: OgFrameProps) {
  const c = OG_COLORS[tone];
  return createElement(
    "div",
    {
      style: {
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        background: c.bg,
        color: c.ink,
        padding: "56px 64px 48px",
        fontFamily: "Space Grotesk",
      },
    },
    createElement("div", { style: { display: "flex", alignItems: "center", height: 72 } }, ogShield(tone, 72)),
    createElement("div", { style: { display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "24px 0" } }, children),
    createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", alignItems: "center", borderTop: `1px solid ${c.hairline}`, paddingTop: 24, height: 60 } },
      ogWordmark(tone, 26),
    ),
  );
}
