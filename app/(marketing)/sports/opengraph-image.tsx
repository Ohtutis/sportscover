// The /sports share card: the lib/og shell on stock, the hub's head phrase in Anton and the titles-table
// description under it. Text only — no listing slide is ever rendered whole (GAPS #7), and Satori cannot
// read the WebP card faces through a relative path at build time. Fonts are fetched at build time; with
// no network the shell still renders with next/og's bundled face rather than failing the page.
import { ImageResponse } from "next/og";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../lib/og";
import { pageFor } from "../../../lib/seo/titles";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Custom sports cards by sport: every sport we make, and what each card carries on the back of the kit";

/** The page's H1 (./page.tsx). */
const HEADLINE = "CUSTOM SPORTS CARDS BY SPORT.";

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

async function fonts(headline: string, text: string): Promise<OgFont[] | undefined> {
  try {
    const [anton, grotesk] = await Promise.all([loadGoogleFont("Anton", 400, headline), loadGoogleFont("Space Grotesk", 400, text)]);
    return [
      { name: "Anton", data: anton, weight: 400, style: "normal" },
      { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
    ];
  } catch {
    return undefined;
  }
}

export default async function OpengraphImage() {
  const description = pageFor("/sports").description;
  const loaded = await fonts(HEADLINE, description);
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Anton",
              fontSize: 86,
              lineHeight: 0.95,
              letterSpacing: "0.005em",
              textTransform: "uppercase",
              color: OG_COLORS.stock.ink,
              maxWidth: 980,
            }}
          >
            {HEADLINE}
          </div>
          <div style={{ display: "flex", fontFamily: "Space Grotesk", fontSize: 28, lineHeight: 1.4, color: OG_COLORS.stock.muted, maxWidth: 900 }}>
            {description}
          </div>
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, ...(loaded ? { fonts: loaded } : {}) },
  );
}
