import { ImageResponse } from "next/og";
import { CHIPS } from "../../../lib/catalog/delivery";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../lib/og";

// The share card prints a price, so it must age out with the pages (SALE_EXPIRES_AT).
export const revalidate = 3600;

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Senior Night — a gold senior edition card and poster set built from your athlete's photos";

const HEADLINE = "ONE LAST HOME GAME.";
const SUBHEAD = "A gold senior edition from your athlete's own photos — class year, four-year career line, senior quote.";
const EDITION_PILL = "SENIOR EDITION · 1 OF 1";

/**
 * The /senior-night OG card (COPY §3: "SR hero with {chips:seniorNight}"). Text only, on the stock
 * frame: Satori cannot read our WebP art through a relative path at build time, and no listing slide
 * may be shown whole (GAPS #7). Gold is used the way the page uses it — inside the edition pill only.
 */
export default async function Image() {
  const c = OG_COLORS.stock;
  const [anton, grotesk, groteskBold] = await Promise.all([
    loadGoogleFont("Anton", 400),
    loadGoogleFont("Space Grotesk", 400),
    loadGoogleFont("Space Grotesk", 700),
  ]);
  const chips = CHIPS.seniorNight.split(" · ");
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 44,
              padding: "0 18px",
              borderRadius: 999,
              border: "2px solid #C9A227",
              color: "#C9A227",
              fontFamily: "Anton",
              fontSize: 22,
              letterSpacing: "0.06em",
            }}
          >
            {EDITION_PILL}
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontFamily: "Anton", fontSize: 86, lineHeight: 0.95, color: c.ink }}>{HEADLINE}</div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            maxWidth: 820,
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            fontSize: 26,
            lineHeight: 1.3,
            color: c.ink,
          }}
        >
          {SUBHEAD}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
          {chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                alignItems: "center",
                height: 38,
                padding: "0 14px",
                borderRadius: 999,
                border: `1px solid ${c.hairline}`,
                color: c.muted,
                fontFamily: "Space Grotesk",
                fontSize: 18,
                letterSpacing: "0.08em",
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </OgFrame>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
        { name: "Space Grotesk", data: groteskBold, weight: 700, style: "normal" },
      ],
    },
  );
}
