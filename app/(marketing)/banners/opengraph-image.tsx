import { ImageResponse } from "next/og";
import { bannerTiers } from "../../../lib/catalog/prices";
import { freeProofMode } from "../../../lib/cta";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../lib/og";

/**
 * The /banners share card: text only on the stock frame (Satori cannot read the site's WebP art, and a
 * fictional athlete could not carry its C13 label here). The sizes come from the banner ladder's tier
 * keys, never typed; no price on the card.
 */
const PRINTED = bannerTiers.filter((t) => t.enabled && t.physical);
const SIZES = PRINTED.map((t) => t.tierKey.split("X").join(" × "));

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `Game Day Edition: custom sports banners from your athlete's photos, printed vinyl at ${SIZES.join(", ")} ft or the full-size file`;

const HEADLINE = "CUSTOM SPORTS BANNERS FROM YOUR PHOTOS.";
const RECORD = `PRINTED VINYL · ${SIZES.join(" · ")} FT · OR THE FILE`;

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
    ? "Built from your athlete's own photos. A free watermarked proof comes first."
    : "Built from your athlete's own photos. You approve a proof before anything prints.";
  const loaded = await fonts(`${RECORD}${subline}`);
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.08em", color: c.muted }}>{RECORD}</div>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 80, lineHeight: 0.95, color: c.ink, maxWidth: 1000 }}>{HEADLINE}</div>
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: c.ink, maxWidth: 900 }}>{subline}</div>
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, ...(loaded ? { fonts: loaded } : {}) },
  );
}
