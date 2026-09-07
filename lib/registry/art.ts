// Card art for /c/<cardId> — paths, existence and the pending list (CONTRACTS §4.10, GAPS #8).
//
// The page never reads ART_PENDING directly: it decides on cardArtFor(id), which is null for a
// pending id and for any record whose files are missing, and renders the pending block instead of
// the flip hero. The files themselves are produced by `scripts/card-assets.ts` from the sources in
// `lib/registry/art-sources.ts`; every face is audited (square-cut corners, QR decode) before it
// lands under public/cards/<id>/.
//
// Server only: cardArtExists / cardArtFor touch the file system. Import from server components,
// route handlers, scripts and tests — never from a client component.

import fs from "node:fs";
import path from "node:path";
import { cards, visibilityOf } from "./cards";

export interface CardArt {
  /** Public URL path of the front face, e.g. "/cards/GDE-SN-BKB-2026-12/front.webp". */
  front: string;
  /** Public URL path of the back face (QR-patched, decode-tested). */
  back: string;
  /** Optional 720 px H.264 flip render, ≤ 1 MB, `preload="none"`; poster = the front. */
  flipMp4?: string;
  /** Never produced in F1 (GAPS #6: no GIFs); kept in the type for the download row later. */
  flipGif?: string;
  poster?: string;
}

/** 5:7, 2× a 450 px render. Sources smaller than this are never upscaled (manifest records the real size). */
export const CARD_ART_SIZE = { width: 900, height: 1260 } as const;

/** URL root under public/ for generated card art. Nothing outside lib/registry types this literal. */
export const CARD_ART_URL_ROOT = "/cards";

/** Absolute directory that holds public/cards/<id>/ (server side). */
export function cardArtDir(cardId: string): string {
  return path.join(process.cwd(), "public", "cards", cardId);
}

/** Absolute path of the generated manifest.json for a card (server side). */
export function cardArtManifestPath(cardId: string): string {
  return path.join(cardArtDir(cardId), "manifest.json");
}

/** Public URL path of the registry QR code PNG (written by `npm run qr:gen`). */
export function cardQrPath(cardId: string): string {
  return `${CARD_ART_URL_ROOT}/qr/${cardId}.png`;
}

/** Absolute path of the registry QR code PNG (server side). */
export function cardQrFile(cardId: string): string {
  return path.join(process.cwd(), "public", "cards", "qr", `${cardId}.png`);
}

/** Public URL path of the flip video for a card (whether or not it exists — see cardArtExists). */
export function cardFlipPath(cardId: string): string {
  return `${CARD_ART_URL_ROOT}/${cardId}/flip.mp4`;
}

export function cardArtPaths(cardId: string): Required<Pick<CardArt, "front" | "back">> & CardArt {
  const base = `${CARD_ART_URL_ROOT}/${cardId}`;
  return {
    front: `${base}/front.webp`,
    back: `${base}/back.webp`,
    flipMp4: `${base}/flip.mp4`,
    flipGif: `${base}/flip.gif`,
  };
}

/** fs.existsSync under public/ — server only. */
export function cardArtExists(cardId: string): { front: boolean; back: boolean; flipMp4: boolean; flipGif: boolean } {
  const dir = cardArtDir(cardId);
  const has = (file: string) => fs.existsSync(path.join(dir, file));
  return { front: has("front.webp"), back: has("back.webp"), flipMp4: has("flip.mp4"), flipGif: has("flip.gif") };
}

/**
 * The art a page may render, or null. Null for every ART_PENDING id and for any record whose
 * front or back is missing on disk — the page then renders without the flip section.
 */
export function cardArtFor(cardId: string): CardArt | null {
  if (isArtPending(cardId)) return null;
  const exists = cardArtExists(cardId);
  if (!exists.front || !exists.back) return null;
  const paths = cardArtPaths(cardId);
  const art: CardArt = { front: paths.front, back: paths.back };
  if (exists.flipMp4) {
    art.flipMp4 = paths.flipMp4;
    art.poster = paths.front;
  }
  if (exists.flipGif) art.flipGif = paths.flipGif;
  return art;
}

export type ArtTicket = "F1-ART-01" | "F1-ART-02" | "F1-ART-05";
export interface ArtPending {
  cardId: string;
  reason: string;
  ticket: ArtTicket;
}

/**
 * The exact five (GAPS #8). Only a landed export may remove an entry: the test
 * "a pending id has no public/cards/<id>/front.webp" fails otherwise. These records stay public —
 * their QR codes are printed, and a QR that lands on a live registration without art beats one
 * that lands on a neutral page.
 */
export const ART_PENDING: readonly ArtPending[] = [
  {
    cardId: "GDE-CA-SFB-2026-03",
    ticket: "F1-ART-01",
    reason: "No Chrome All-Star softball card face on disk; Figma export from the softball sport file (ASSETS-LISTING 5.1).",
  },
  {
    cardId: "GDE-SN-SFB-2026-03",
    ticket: "F1-ART-01",
    reason:
      "Only a pre-square-corner Stadium Night export exists (marketing/cards, 2026-08-29); square-cut re-export from the softball sport file.",
  },
  {
    cardId: "GDE-FS-WRS-2026-01",
    ticket: "F1-ART-01",
    reason:
      "No Fire & Smoke wrestling card face on disk (marketing/cards/wrestling-front.png is Stadium Night); Figma export from the wrestling sport file.",
  },
  {
    cardId: "GDE-HE-WRS-2026-01",
    ticket: "F1-ART-01",
    reason: "No Heritage wrestling card face on disk (only the Heritage poster exists); Figma export from the wrestling sport file.",
  },
  {
    cardId: "GDE-HE-FTB-2026-54",
    ticket: "F1-ART-05",
    reason: "Square-cut Heritage football FRONT exists, but every BACK on disk is a pre-square-corner export; re-export card-back from the football sport file.",
  },
  {
    cardId: "GDE-SS-CHR-2026-01",
    ticket: "F1-ART-05",
    reason: "Square-cut Signature Spotlight cheerleading FRONT exists, but every BACK on disk is a pre-square-corner export; re-export card-back from the cheerleading sport file.",
  },
  {
    cardId: "GDE-SN-BKB-2026-23",
    ticket: "F1-ART-02",
    reason:
      "Only Nia-era art exists (pre-square-corner, swoosh) and it is denylisted; regenerate with audit (spec 11 F1) or the owner privatises the record.",
  },
];

export const isArtPending = (cardId: string): boolean => ART_PENDING.some((p) => p.cardId === cardId);

export function artPendingFor(cardId: string): ArtPending | undefined {
  return ART_PENDING.find((p) => p.cardId === cardId);
}

/**
 * Every renderable fictional record that is not pending: front and back must exist under
 * public/cards/<id>/ (tests fail otherwise). Real customers are never required here — their art
 * is generated only with `--allow-orders` for their own unlisted pages (GAPS #9).
 */
export const ART_REQUIRED: string[] = cards
  .filter((c) => c.isFictional && visibilityOf(c) !== "deleted" && !isArtPending(c.cardId))
  .map((c) => c.cardId);
