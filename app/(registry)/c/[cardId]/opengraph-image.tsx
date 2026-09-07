// The /c share card (CONTRACTS §5.6, §6.2): public — the card front on the arena with the edition
// strip and the athlete's name; unlisted — the same frame with NO name; private and deleted — the
// shield alone. A record whose art is still pending puts the shield where the front would be.
//
// Everything is resolved at build time (`dynamicParams = false` upstream, `generateStaticParams`
// here): the faces are read from disk and re-encoded to PNG because Satori rasterises PNG/JPEG, not
// WebP, and the two Google fonts are fetched once per build. Both steps are best-effort — a build
// without network, or without the optional encoder, still ships a correct (plainer) image rather
// than failing. Nothing here types a card-art path; `cardArtDir` owns that.
import path from "node:path";
import fs from "node:fs";
import { ImageResponse } from "next/og";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, ogShield, ogWordmark } from "../../../../lib/og";
import { formatEt } from "../../../../lib/capacity";
import { styleByName } from "../../../../lib/catalog/styles";
import { cardArtDir, cardArtFor } from "../../../../lib/registry/art";
import { getCard, registeredAtOf, renderableCards, visibilityOf } from "../../../../lib/registry/cards";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Registered Game Day Edition — card page";

export function generateStaticParams() {
  return renderableCards().map((c) => ({ cardId: c.cardId }));
}

const C = OG_COLORS.arena;
const CARD_HEIGHT = 430;
const CARD_WIDTH = Math.round((CARD_HEIGHT * 5) / 7);

/** The front face as a PNG data URI, or null when it cannot be produced (Satori cannot read WebP). */
async function frontDataUri(cardId: string): Promise<string | null> {
  const art = cardArtFor(cardId);
  if (!art) return null;
  const file = path.join(cardArtDir(cardId), "front.webp");
  if (!fs.existsSync(file)) return null;
  try {
    const { default: sharp } = await import("sharp");
    const png = await sharp(file).resize({ width: CARD_WIDTH * 2 }).png({ compressionLevel: 9 }).toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

async function fonts() {
  try {
    const [anton, grotesk] = await Promise.all([loadGoogleFont("Anton", 400), loadGoogleFont("Space Grotesk", 700)]);
    return [
      { name: "Anton", data: anton, weight: 400 as const, style: "normal" as const },
      { name: "Space Grotesk", data: grotesk, weight: 700 as const, style: "normal" as const },
    ];
  } catch {
    // No network in this build: Satori falls back to its bundled face. The image still ships.
    return [];
  }
}

export default async function OgImage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const card = getCard(cardId);
  const visibility = card ? visibilityOf(card) : "private";
  // The face itself PRINTS the athlete's name, so an unlisted real customer's share card would leak
  // the very name the unlisted title withholds (CONTRACTS §6.2 "no name on unlisted OG"). A public
  // record, and a fictional demo whose unlisted state is only a staging choice, may show the front.
  const showsFace = Boolean(card) && (visibility === "public" || (visibility === "unlisted" && Boolean(card?.isFictional)));
  const named = Boolean(card) && visibility === "public";
  const front = showsFace && card ? await frontDataUri(card.cardId) : null;
  const finish = card ? (styleByName(card.styleName)?.name ?? card.styleName) : "";
  const strip =
    card && visibility !== "private" ? `${card.cardId}   ·   ${finish}   ·   Registered ${formatEt(registeredAtOf(card), "medium")}` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          display: "flex",
          background: C.bg,
          color: C.ink,
          padding: "56px 64px 48px",
          fontFamily: "Space Grotesk",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", paddingRight: 48 }}>
          <div style={{ display: "flex" }}>{ogShield("arena", 72)}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {card && named ? (
              <div style={{ display: "flex", fontFamily: "Anton", fontSize: 76, lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.01em" }}>
                {`${card.firstName} ${card.lastName}`}
              </div>
            ) : (
              <div style={{ display: "flex", fontFamily: "Anton", fontSize: 56, lineHeight: 1, textTransform: "uppercase" }}>
                {visibility === "private" ? "Registered with Game Day Edition" : "Registered Edition"}
              </div>
            )}
            {strip ? (
              <div style={{ display: "flex", flexDirection: "column", marginTop: 28 }}>
                <div style={{ display: "flex", height: 2, background: C.shield, width: 520 }} />
                <div style={{ display: "flex", marginTop: 16, fontSize: 19, color: C.muted, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                  {strip}
                </div>
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", borderTop: `1px solid ${C.hairline}`, paddingTop: 24 }}>
            {ogWordmark("arena", 26)}
          </div>
        </div>
        <div style={{ display: "flex", width: CARD_WIDTH, alignItems: "center", justifyContent: "center" }}>
          {front ? (
            <img src={front} width={CARD_WIDTH} height={CARD_HEIGHT} alt="" style={{ objectFit: "contain" }} />
          ) : (
            <div
              style={{
                display: "flex",
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${C.hairline}`,
                background: "#14191F",
              }}
            >
              {ogShield("arena", 140)}
            </div>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
