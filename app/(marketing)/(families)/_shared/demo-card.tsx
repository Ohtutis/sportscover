import fs from "node:fs";
import type { ImageSpec } from "../../../../components/CardFace";
import { altCardBack, altCardFront } from "../../../../lib/alt";
import { sportByCode } from "../../../../lib/catalog/sports";
import { styleByName } from "../../../../lib/catalog/styles";
import { getCard } from "../../../../lib/registry/cards";
import { CARD_ART_SIZE, cardArtFor, cardArtManifestPath } from "../../../../lib/registry/art";

/**
 * The demo edition every family page shows: Marcus Ellison, Stadium Night — a fictional athlete from
 * our own roster, the same record the registry demo opens. The faces come from `cardArtFor()` (the
 * generated, corner-audited, QR-patched pair the card-assets script writes) so the back in the flip decodes
 * to the ID printed beside it; nothing here types a card path. When the art is missing the caller
 * renders the front alone or nothing at all — never a broken frame.
 */
export const DEMO_CARD_ID = "GDE-SN-BKB-2026-12";

export const demoCard = () => getCard(DEMO_CARD_ID);

export const DEMO_LABEL = "Example edition · Fictional athlete";

interface ArtManifest {
  outputs?: { front?: { width?: number; height?: number }; back?: { width?: number; height?: number } };
}

/** Intrinsic size of a generated face, from the card's manifest (750 × 1050 or 900 × 1260). */
function faceSize(cardId: string): { width: number; height: number } {
  try {
    const manifest = JSON.parse(fs.readFileSync(cardArtManifestPath(cardId), "utf8")) as ArtManifest;
    const front = manifest.outputs?.front;
    if (front?.width && front.height) return { width: front.width, height: front.height };
  } catch {
    /* no manifest on disk — fall back to the declared render size */
  }
  return { width: CARD_ART_SIZE.width, height: CARD_ART_SIZE.height };
}

export interface DemoFaces {
  front: ImageSpec;
  back: ImageSpec;
  mp4?: string;
}

/** The demo card's front and back as ImageSpecs, or null when the art has not landed. */
export function demoFaces(): DemoFaces | null {
  const card = demoCard();
  const art = cardArtFor(DEMO_CARD_ID);
  if (!card || !art) return null;
  const sport = sportByCode(card.sportCode);
  const style = styleByName(card.styleName);
  if (!sport || !style) return null;
  const size = faceSize(DEMO_CARD_ID);
  return {
    front: { src: art.front, alt: altCardFront(sport, style), ...size, fictional: true },
    back: { src: art.back, alt: altCardBack(sport, style), ...size, fictional: true },
    ...(art.flipMp4 ? { mp4: art.flipMp4 } : {}),
  };
}
