// The share card of a sport page: the lib/og shell on stock, the facts row's H1 in Anton and its verdict
// under it. Text only — no listing slide is ever rendered whole (GAPS #7). One image per sport page,
// generated at build time; fonts are fetched then, and with no network the shell still renders with
// next/og's bundled face rather than failing the page.
import { ImageResponse } from "next/og";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../../lib/og";
import { sportFactsFor, sportPageSports } from "../../../../lib/seo/sport-facts";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A custom sports trading card and poster built from your athlete's photos, with a free proof first";

export function generateStaticParams() {
  return sportPageSports().map((s) => ({ sport: s.slug }));
}

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

export default async function OpengraphImage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  const facts = sportFactsFor(sport);
  const headline = facts?.h1 ?? "CUSTOM SPORTS CARDS BY SPORT.";
  const verdict = facts?.verdict ?? "";
  const loaded = await fonts(headline, verdict);
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Anton",
              fontSize: 96,
              lineHeight: 0.95,
              letterSpacing: "0.005em",
              textTransform: "uppercase",
              color: OG_COLORS.stock.ink,
              maxWidth: 980,
            }}
          >
            {headline}
          </div>
          {verdict ? (
            <div style={{ display: "flex", fontFamily: "Space Grotesk", fontSize: 30, lineHeight: 1.35, color: OG_COLORS.stock.muted, maxWidth: 900 }}>
              {verdict}
            </div>
          ) : null}
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, ...(loaded ? { fonts: loaded } : {}) },
  );
}
