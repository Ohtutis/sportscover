import { ImageResponse } from "next/og";
import { freeProofMode } from "../../../lib/cta";
import { PRODUCTS } from "../../../lib/intake/products";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../lib/og";

/**
 * The /christmas-gift share card: text only on the stock frame. No order-by date and no price: the card
 * is rendered once and shared all year, and a date on it would outlive the Christmas it was counted for.
 * The gift line is the four product names from lib/intake/products.ts, never typed.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Game Day Edition: Christmas gifts for athletes, a trading card or a poster built from their own photos";

const HEADLINE = "CHRISTMAS GIFTS FOR ATHLETES.";
const RECORD = PRODUCTS.map((p) => p.name.toUpperCase()).join(" · ");

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

/** Fonts are fetched at build time; with no network the shell still renders with next/og's bundled face. */
async function fonts(text: string): Promise<OgFont[] | undefined> {
  try {
    const [anton, grotesk] = await Promise.all([loadGoogleFont("Anton", 400, HEADLINE), loadGoogleFont("Space Grotesk", 400, text)]);
    return [
      { name: "Anton", data: anton, weight: 400, style: "normal" },
      { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
    ];
  } catch {
    return undefined;
  }
}

export default async function OpengraphImage() {
  const c = OG_COLORS.stock;
  const subline = freeProofMode()
    ? "Built from their own photos, with a free proof before you pay. Order-by dates on the page."
    : "Built from their own photos. You approve a proof before anything prints. Order-by dates on the page.";
  const loaded = await fonts(`${RECORD}${subline}`);
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.08em", color: c.muted }}>{RECORD}</div>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 92, lineHeight: 0.95, color: c.ink, maxWidth: 1000 }}>{HEADLINE}</div>
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: c.ink, maxWidth: 900 }}>{subline}</div>
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, ...(loaded ? { fonts: loaded } : {}) },
  );
}
