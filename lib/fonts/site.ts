import { Anton, Barlow, Space_Grotesk } from "next/font/google";

// Anton has one weight. Space Grotesk is a variable font (300–700 in one file) — omit `weight`.
// Barlow SemiBold only (form labels, table heads, ID/time lines) plus 500 for chips; it never sets
// above-the-fold text, so it is not preloaded (DESIGN §10.1).
//
// `fallback` is not decoration: next/font builds an `<family> Fallback` face with `size-adjust`,
// `ascent-override` and `descent-override` computed from the FIRST entry, and without one it computes
// them against Arial. Anton is a condensed poster face — measured against Arial the swap moved the
// hero H1 and the CTA row 53 px after first paint (audit 2026-09-08, S6). The lists below are the same
// stacks `app/globals.css` already names for `--font-display` / `--font-body` / `--font-label`, so the
// metric-adjusted fallback and the CSS fallback are finally the same font.
export const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton", fallback: ["Impact", "Arial Narrow", "sans-serif"] });
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});
export const barlow = Barlow({
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-barlow",
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

/** Put on <html>. Every marketing route gets exactly these three families and nothing else. */
export const siteFontClass = `${anton.variable} ${spaceGrotesk.variable} ${barlow.variable}`;
