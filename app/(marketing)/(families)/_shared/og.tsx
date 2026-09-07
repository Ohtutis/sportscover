import { ImageResponse } from "next/og";
import { formatUsd, fromPrice, type Family } from "../../../../lib/catalog/prices";
import { loadGoogleFont, OG_COLORS, OG_SIZE, OgFrame } from "../../../../lib/og";

/**
 * The share card for a product family. Satori draws the objects — a card front and back, or a poster
 * at its own proportion — as measured rectangles, the same language as the to-scale sheet: it cannot
 * decode the WebP the site ships (every card face and poster is WebP; an image element pointing at one
 * throws inside `ImageResponse`), and a photograph of a fictional athlete could not carry its C13 label here.
 * The price comes from the ladder through `fromPrice()`, never typed.
 */
const ACCENT = "#FF6B2B";
const SILVER = "#C7D0DC";
const ARENA = "#080C12";

export type OgObjects = "cards" | "poster" | "set";

export interface FamilyOgOptions {
  family: Family;
  /** The page title, set in Anton. */
  title: string;
  /** One line under it, in Space Grotesk. */
  subtitle: string;
  objects: OgObjects;
}

interface Rect {
  label: string;
  width: number;
  height: number;
}

const CARD = (label: string, width = 180): Rect => ({ label, width, height: Math.round((width * 7) / 5) });
const POSTER = (label: string, width = 210): Rect => ({ label, width, height: Math.round((width * 4) / 3) });

function rects(objects: OgObjects): Rect[] {
  if (objects === "poster") return [POSTER("18 × 24"), POSTER("24 × 36", 150)];
  if (objects === "set") return [POSTER("18 × 24", 170), CARD("FRONT", 120), CARD("BACK", 120)];
  return [CARD("FRONT"), CARD("BACK")];
}

function objectRow(objects: OgObjects) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
      {rects(objects).map((rect) => (
        <div
          key={rect.label}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            width: rect.width,
            height: rect.height,
            background: ARENA,
            border: `1px solid ${SILVER}`,
            color: SILVER,
            fontSize: 15,
            letterSpacing: "0.12em",
            paddingBottom: 12,
          }}
        >
          {rect.label}
        </div>
      ))}
    </div>
  );
}

/** The ImageResponse an `opengraph-image.tsx` returns. */
export async function familyOgImage({ family, title, subtitle, objects }: FamilyOgOptions): Promise<ImageResponse> {
  const price = `From ${formatUsd(fromPrice(family))}`;
  // Satori subsets the font to the characters we ask for, so the heading is uppercased HERE — a
  // CSS text-transform would ask for glyphs the subset never fetched (mixed-case tofu).
  const heading = title.toUpperCase();
  const [anton, grotesk] = await Promise.all([
    loadGoogleFont("Anton", 400, `${heading}${price}`),
    loadGoogleFont("Space Grotesk", 400, `${subtitle}${price}${rects(objects).map((r) => r.label).join("")}`),
  ]);
  const c = OG_COLORS.stock;
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", width: "100%", alignItems: "center", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontFamily: "Anton", fontSize: 62, lineHeight: 1, color: c.ink }}>{heading}</div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 25, color: c.muted, maxWidth: 560 }}>{subtitle}</div>
            <div style={{ display: "flex", marginTop: 30 }}>
              <div
                style={{
                  display: "flex",
                  background: ACCENT,
                  color: c.ink,
                  borderRadius: 999,
                  padding: "10px 22px",
                  fontFamily: "Anton",
                  fontSize: 24,
                  letterSpacing: "0.06em",
                }}
              >
                {price}
              </div>
            </div>
          </div>
          {objectRow(objects)}
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
