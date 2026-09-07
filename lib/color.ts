// Contrast helpers (WCAG 2.x relative luminance) and the team-colour rule for /c
// (spec §2.1: team/primary is used as text on the arena only when it reaches 4.85:1; otherwise
// the name stays white and the colour becomes a 4 px rule; a record without a colour gets silver).

export const ARENA = "#080C12";
export const STOCK = "#F4F3EF";
export const INK = "#14191F";
export const WHITE = "#FFFFFF";
export const SILVER = "#C7D0DC";
export const TEAM_TEXT_MIN_CONTRAST = 4.85;

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** "#RGB" / "#RRGGBB" (hash optional) → [r, g, b] in 0–255; null when the string is not a colour. */
export function hexToRgb(hex: string): [number, number, number] | null {
  const m = HEX.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const channel = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance, 0 (black) … 1 (white). Throws on a non-colour so a bad token fails loudly in tests. */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error(`relativeLuminance: "${hex}" is not a hex colour`);
  const [r, g, b] = rgb;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two hex colours (order does not matter), 1 … 21. */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [light, dark] = a >= b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

export interface TeamAccent {
  color: string;
  /** "text" — the colour may carry the athlete name; "rule" — white text plus a 4 px rule in the colour. */
  mode: "text" | "rule";
}

/**
 * How /c may use a record's team/primary: as text when it reaches 4.85:1 on the arena, else as a
 * 4 px rule under white text. No colour, or an invalid one, resolves to the silver rule (spec §4.13).
 */
export function teamAccent(hex: string | undefined): TeamAccent {
  if (!hex || !hexToRgb(hex)) return { color: SILVER, mode: "rule" };
  const normalised = hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
  return contrastRatio(normalised, ARENA) >= TEAM_TEXT_MIN_CONTRAST ? { color: normalised, mode: "text" } : { color: normalised, mode: "rule" };
}
