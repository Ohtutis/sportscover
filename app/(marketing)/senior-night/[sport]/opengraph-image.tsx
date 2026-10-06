// The share card of a senior-night spoke: the hub's layout (app/(marketing)/senior-night/opengraph-image.tsx)
// with the spoke's own words — the gold edition pill, the H1 in the measured word order, the row's verdict
// and the Senior Night delivery chips. Text only on the lib/og frame: Satori cannot read the WebP art
// through a relative path at build time, and no listing slide is ever shown whole (GAPS #7). One image per
// spoke, generated at build time (the /blog/[slug] pattern); with no network the frame still renders with
// next/og's bundled face rather than failing the page.
import { ImageResponse } from "next/og";
import { CHIPS } from "../../../../lib/catalog/delivery";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../../lib/og";
import { seniorNightFactsFor, seniorNightSports } from "../../../../lib/seo/senior-night-facts";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A sport's senior night: a gold senior edition card and poster built from your athlete's photos";

const EDITION_PILL = "SENIOR EDITION · 1 OF 1";
const GOLD = "#C9A227";
const FALLBACK_HEADLINE = "ONE LAST HOME GAME.";

export function generateStaticParams() {
  return seniorNightSports().map((sport) => ({ sport: sport.slug }));
}

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

async function fonts(): Promise<OgFont[] | undefined> {
  try {
    const [anton, grotesk, groteskBold] = await Promise.all([
      loadGoogleFont("Anton", 400),
      loadGoogleFont("Space Grotesk", 400),
      loadGoogleFont("Space Grotesk", 700),
    ]);
    return [
      { name: "Anton", data: anton, weight: 400, style: "normal" },
      { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
      { name: "Space Grotesk", data: groteskBold, weight: 700, style: "normal" },
    ];
  } catch {
    return undefined;
  }
}

export default async function OpengraphImage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  const facts = seniorNightFactsFor(sport);
  const headline = facts?.h1 ?? FALLBACK_HEADLINE;
  const verdict = facts?.verdict ?? "";
  const c = OG_COLORS.stock;
  const chips = CHIPS.seniorNight.split(" · ");
  const loaded = await fonts();
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
              border: `2px solid ${GOLD}`,
              color: GOLD,
              fontFamily: "Anton",
              fontSize: 22,
              letterSpacing: "0.06em",
            }}
          >
            {EDITION_PILL}
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 24, maxWidth: 1000, fontFamily: "Anton", fontSize: 80, lineHeight: 0.95, color: c.ink }}>
          {headline}
        </div>
        {verdict ? (
          <div
            style={{
              display: "flex",
              marginTop: 20,
              maxWidth: 900,
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: 26,
              lineHeight: 1.3,
              color: c.ink,
            }}
          >
            {verdict}
          </div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
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
    { ...OG_SIZE, ...(loaded ? { fonts: loaded } : {}) },
  );
}
