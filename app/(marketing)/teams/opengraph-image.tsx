import { ImageResponse } from "next/og";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../lib/og";

/**
 * The /teams share card: text only on the stock frame — the H1 and the three claims the page makes. No
 * price and no count of teams: there is no "trusted by" figure until the database has one.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Game Day Edition team orders: one team setup, and every family orders its own athlete's cards and poster";

const HEADLINE = "ONE TEAM SETUP. EVERY FAMILY ORDERS THEIR OWN.";
const CLAIMS = ["SAME PRICE PER ATHLETE", "CREST APPROVED ONCE", "NO MINIMUM · NO DEPOSIT"];
const SUBLINE = "Email us the sport, the roster size and the event date. Every card is built one at a time.";

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
  const loaded = await fonts(`${CLAIMS.join("")}${SUBLINE}`);
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CLAIMS.map((claim) => (
              <div
                key={claim}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 999,
                  border: `1px solid ${c.hairline}`,
                  color: c.muted,
                  fontSize: 18,
                  letterSpacing: "0.08em",
                }}
              >
                {claim}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontFamily: "Anton", fontSize: 80, lineHeight: 0.95, color: c.ink, maxWidth: 1040 }}>{HEADLINE}</div>
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: c.ink, maxWidth: 900 }}>{SUBLINE}</div>
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, ...(loaded ? { fonts: loaded } : {}) },
  );
}
