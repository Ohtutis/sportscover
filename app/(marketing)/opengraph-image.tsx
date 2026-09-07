// The default OG image for every marketing route without one of its own (CONTRACTS §5.2). Composed
// in code from the shell in lib/og.ts — Anton headline, Space Grotesk subhead, silver-free stock
// tone. Fonts are fetched at build time; if the build has no network the shell still renders with
// next/og's bundled fallback face rather than failing the page.
import { ImageResponse } from "next/og";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../lib/og";
import { HERO_H1, HERO_SUBHEAD } from "./_home/Hero";

// The share card prints a price, so it must age out with the pages (SALE_EXPIRES_AT).
export const revalidate = 3600;

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Game Day Edition — custom sports trading cards and posters from your photos";

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

async function fonts(): Promise<OgFont[] | undefined> {
  try {
    const [anton, grotesk] = await Promise.all([loadGoogleFont("Anton", 400, HERO_H1), loadGoogleFont("Space Grotesk", 400, HERO_SUBHEAD)]);
    return [
      { name: "Anton", data: anton, weight: 400, style: "normal" },
      { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
    ];
  } catch {
    return undefined;
  }
}

export default async function OpengraphImage() {
  const loaded = await fonts();
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Anton",
              fontSize: 76,
              lineHeight: 0.95,
              letterSpacing: "0.005em",
              textTransform: "uppercase",
              color: OG_COLORS.stock.ink,
              maxWidth: 940,
            }}
          >
            {HERO_H1}
          </div>
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: OG_COLORS.stock.muted, maxWidth: 820 }}>{HERO_SUBHEAD}</div>
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, ...(loaded ? { fonts: loaded } : {}) },
  );
}
