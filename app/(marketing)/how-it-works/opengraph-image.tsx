import { ImageResponse } from "next/og";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../lib/og";
import { pageFor } from "../../../lib/seo/titles";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "How custom trading cards are made — six gates between your photos and the print";

const HEADLINE = "SIX GATES BETWEEN YOUR PHOTOS AND THE PRINT.";

export default async function Image() {
  const meta = pageFor("/how-it-works");
  const [anton, grotesk] = await Promise.all([
    loadGoogleFont("Anton", 400, HEADLINE),
    loadGoogleFont("Space Grotesk", 400, meta.description),
  ]);
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 76, lineHeight: 1, letterSpacing: -0.5, maxWidth: 940 }}>
            {HEADLINE}
          </div>
          <div style={{ display: "flex", fontSize: 26, lineHeight: 1.4, color: OG_COLORS.stock.muted, maxWidth: 860 }}>
            {meta.description}
          </div>
        </div>
      </OgFrame>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
      ],
    },
  );
}
