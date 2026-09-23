// Source map for `scripts/card-assets.ts`: cardId → the audited files that become
// public/cards/<id>/{front,back}.webp (+ flip.mp4). Transcribed from docs/f1/ASSETS-LISTING.md §5
// and re-verified on 2026-09-07 with thumbnails, a corner audit and a QR decode of every candidate
// (findings in docs/f1/INTEGRATION-NOTES.md, "card-assets").
//
// Rules the map encodes:
// - A face must depict THAT athlete in THAT finish, square-cut at all four corners (DESIGN §6.2).
//   Where a 2x (1500×2100) export passes the audit it is preferred; where only the 1x listing
//   export (750×1050) passes, the 1x is used and the output is not upscaled.
// - Nothing from the Nia-era set is ever a source (FORBIDDEN_SOURCE_PREFIXES).
// - `sourceKind: "order"` entries are real customers: read only with `--allow-orders`, written only
//   to that customer's own public/cards/<id>/ (GAPS #9). Their paths are gitignored.
// - `pending` entries pre-declare the target path an open art ticket lands on, so closing the
//   ticket is: drop the files in, delete the id from ART_PENDING, run `cards:assets`.
// - Flip renders: only a dark (arena) render from square-cut faces may be mapped. On
//   2026-09-07 no such render exists — every SR render and every *LIGHT render sits on a light
//   ground, and the two dark renders (GDE_SN, GDE_SN_Order03) were made from pre-square-corner
//   faces — so no `mp4` is mapped; `/c` uses the CSS flip and no video fallback until the dark
//   re-renders land (ticket F1-ART-04 in INTEGRATION-NOTES).

import type { ArtTicket } from "./art";

export type ArtSourceKind = "demo" | "order";

export interface ArtSource {
  /** Repo-relative path of the front face PNG (750×1050, 1500×2100 or a 816×1110 print file with bleed). */
  front: string;
  /** Repo-relative path of the back face PNG — the printed QR on it is re-patched to the registry QR. */
  back: string;
  /** Optional dark-ground flip render (1080×1350 H.264); re-encoded to 720 px, ≤ 1 MB. */
  mp4?: string;
  sourceKind: ArtSourceKind;
  /** Set while the source files are still an open ticket: missing files are reported, not failed. */
  pending?: ArtTicket;
  note?: string;
}

/**
 * Nia-era exports (pre-square-corner, swoosh) and other never-sources. A source path under any of
 * these prefixes is refused before it is read, whatever the map says.
 */
export const FORBIDDEN_SOURCE_PREFIXES: readonly string[] = [
  "card-flip/assets/ca/",
  "card-flip/assets/fs/",
  "card-flip/assets/he/",
  "card-flip/assets/pr/",
  "card-flip/assets/ss/",
  "card-flip/assets/card-front.png",
  "card-flip/assets/card-back.png",
  "print-sources/output/",
  "exports/",
  "marketing/cards/",
  "public/images/",
];

const L = "etsy/listing-images";
const SR = `${L}/03-senior-night/src`;
const A = "card-flip/assets";

export const DEMO_ART_SOURCES: Record<string, ArtSource> = {
  // ---- Ticket F1-ART-02 (owner decision) — target paths pre-declared, no file exists ----
  "GDE-SN-BKB-2026-23": {
    front: `${A}/basketball-sn-nia/card-front.png`,
    back: `${A}/basketball-sn-nia/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-02",
    note: "Regenerate with audit and export square-cut, or the owner sets the record private. Every Nia-era export is refused as a source.",
  },

  // ---- Marcus Ellison — Stadium Night (the demo card everywhere) ----
  "GDE-SN-BKB-2026-12": {
    front: `${L}/01-basketball-card/src/BK-SN-card-FRONT.png`,
    back: `${L}/01-basketball-card/src/BK-SN-card-BACK.png`,
    sourceKind: "demo",
    note: "1x 09-01 exports pass the corner audit; card-flip/assets/marcus-sn (2x, 08-26) fails it at all four corners. Back encodes the Nia URL on disk — patched.",
  },

  // ---- Senior Night ----
  "GDE-SR-BKB-2026-12": {
    front: `${SR}/sr-card-front.png`,
    back: `${SR}/sr-card-back.png`,
    sourceKind: "demo",
    note: "1x only (no basketball-sr 2x export). Back encodes the Nia URL on disk — patched.",
  },
  "GDE-SR-FTB-2026-54": {
    front: `${A}/football-sr/card-front.png`,
    back: `${A}/football-sr/card-back.png`,
    sourceKind: "demo",
    note: "2x 09-05. Back encodes the Nia URL on disk (1x ftb-sr-back too) — patched.",
  },
  "GDE-SR-VBL-2026-05": {
    front: `${A}/volleyball-sr/card-front.png`,
    back: `${A}/volleyball-sr/card-back.png`,
    sourceKind: "demo",
    note: "2x 09-05; the vbl-/vlb- 1x pair differ only in export time, both decode to this id.",
  },
  "GDE-SR-SOC-2026-10": { front: `${A}/soccer-sr/card-front.png`, back: `${A}/soccer-sr/card-back.png`, sourceKind: "demo" },
  "GDE-SR-BSB-2026-07": { front: `${A}/baseball-sr/card-front.png`, back: `${A}/baseball-sr/card-back.png`, sourceKind: "demo" },
  "GDE-SR-SFB-2026-03": { front: `${A}/softball-sr/card-front.png`, back: `${A}/softball-sr/card-back.png`, sourceKind: "demo" },
  "GDE-SR-WRS-2026-01": {
    front: `${A}/wrestling-sr/card-front.png`,
    back: `${A}/wrestling-sr/card-back.png`,
    sourceKind: "demo",
    note: "Plain back — no number on the shirt; alt text must not claim one.",
  },
  "GDE-SR-CHR-2026-01": {
    front: `${A}/cheer-sr/card-front.png`,
    back: `${A}/cheer-sr/card-back.png`,
    sourceKind: "demo",
    note: "Numberless sport: 01 is an edition number.",
  },

  // ---- Evergreen finishes ----
  "GDE-FS-FTB-2026-54": {
    front: `${L}/01-football-card/src/FB-FS-card-FRONT.png`,
    back: `${L}/01-football-card/src/FB-FS-card-BACK.png`,
    sourceKind: "demo",
    note: "1x 09-01; card-flip/assets/football-fs (2x, 08-27) fails the corner audit. Back encodes the Nia URL — patched.",
  },
  "GDE-HE-FTB-2026-54": {
    front: `${L}/01-football-card/src/FB-HE-front.png`,
    back: `${A}/football-he/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-05",
    note: "Front = 1x 09-01 (passes). The only Heritage football back on disk (FB-HE-card-BACK.png, 2x, 08-27) fails the corner audit at all four corners; the back path is the square-cut re-export target (ticket F1-ART-05 in INTEGRATION-NOTES).",
  },
  "GDE-PR-CHR-2026-01": {
    front: `${L}/01-cheerleading-card/src/CH-PR-card-FRONT.png`,
    back: `${L}/01-cheerleading-card/src/CH-PR-card-BACK.png`,
    sourceKind: "demo",
    note: "1x 09-01; card-flip/assets/cheer-pr (2x, 08-28) fails the corner audit. Numberless sport.",
  },
  "GDE-SS-CHR-2026-01": {
    front: `${L}/01-cheerleading-card/src/CH-SS-front.png`,
    back: `${A}/cheer-ss/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-05",
    note: "Front = 1x 09-01 (passes). Both Signature Spotlight cheer backs on disk (CH-SS-card-BACK.png and 03-senior-night/src/chr-ss-back.png, 08-27) fail the corner audit; the back path is the square-cut re-export target (ticket F1-ART-05).",
  },
  "GDE-HE-BSB-2026-07": { front: `${A}/baseball-he/card-front.png`, back: `${A}/baseball-he/card-back.png`, sourceKind: "demo", note: "2x 09-03." },
  "GDE-CA-SOC-2026-10": { front: `${A}/soccer-ca/card-front.png`, back: `${A}/soccer-ca/card-back.png`, sourceKind: "demo", note: "2x 09-03." },
  "GDE-SS-VBL-2026-05": { front: `${A}/volleyball-ss/card-front.png`, back: `${A}/volleyball-ss/card-back.png`, sourceKind: "demo", note: "2x 09-03." },

  // ---- Ticket F1-ART-01 — Figma exports, target paths pre-declared (ASSETS-LISTING §5.1) ----
  "GDE-CA-SFB-2026-03": {
    front: `${A}/softball-ca/card-front.png`,
    back: `${A}/softball-ca/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-01",
    note: "Softball file, Chrome All-Star page: FRONT 190:136, BACK 102:85 at 2x.",
  },
  "GDE-SN-SFB-2026-03": {
    front: `${A}/softball-sn/card-front.png`,
    back: `${A}/softball-sn/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-01",
    note: "Softball file, Stadium Night page (0:1): FRONT 40:2, BACK 49:2 at 2x. marketing/cards/softball-* is pre-square-corner and refused.",
  },
  "GDE-FS-WRS-2026-01": {
    front: `${A}/wrestling-fs/card-front.png`,
    back: `${A}/wrestling-fs/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-01",
    note: "Wrestling file, Fire & Smoke page: FRONT 190:204, BACK 166:71 at 2x.",
  },
  "GDE-HE-WRS-2026-01": {
    front: `${A}/wrestling-he/card-front.png`,
    back: `${A}/wrestling-he/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-01",
    note: "Wrestling file, Heritage page: FRONT 190:291, BACK 166:180 at 2x.",
  },

  // ---- Real customers — `--allow-orders` only, own unlisted page only (GAPS #9) ----
  "GDE-SS-TEN-2026-12": {
    front: "orders/4164205493/exports/_flip-src/card-front.png",
    back: "orders/4164205493/exports/_flip-src/card-back.png",
    sourceKind: "order",
    note: "2x square-cut faces measured 09-05; the back decodes to this id on disk. The order's flip render sits on a slate ground, not the arena — not mapped until re-rendered FLIP_BG=8,12,18,255.",
  },
  "GDE-SN-BKB-2026-51": {
    front: `${A}/order03-sn/card-front.png`,
    back: `${A}/order03-sn/card-back.png`,
    sourceKind: "order",
    note: "The 08-26 export fails the corner audit at all four corners (white ground), and its back encodes the Nia URL. Blocked until a square-cut 2x re-export from Figma iLHCW0lDPPYW5BNpriGL8r; the page renders without the flip section meanwhile.",
  },

  // ---- Ticket F1-ART-08 — the eighteen listing demo cards (registry deploy 2026-09-23), target paths pre-declared ----
  "GDE-CA-ICH-2026-17": {
    front: `${A}/ice-hockey-ca/card-front.png`,
    back: `${A}/ice-hockey-ca/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the ice hockey sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-SN-ICH-2026-17": {
    front: `${A}/ice-hockey-sn/card-front.png`,
    back: `${A}/ice-hockey-sn/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the ice hockey sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-SS-GYM-2026-01": {
    front: `${A}/gymnastics-ss/card-front.png`,
    back: `${A}/gymnastics-ss/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the gymnastics sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-HE-GYM-2026-01": {
    front: `${A}/gymnastics-he/card-front.png`,
    back: `${A}/gymnastics-he/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the gymnastics sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-PR-PKB-2026-02": {
    front: `${A}/pickleball-pr/card-front.png`,
    back: `${A}/pickleball-pr/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the pickleball sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-CA-PKB-2026-02": {
    front: `${A}/pickleball-ca/card-front.png`,
    back: `${A}/pickleball-ca/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the pickleball sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-CA-TEN-2026-01": {
    front: `${A}/tennis-ca/card-front.png`,
    back: `${A}/tennis-ca/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the tennis sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-SS-TEN-2026-01": {
    front: `${A}/tennis-ss/card-front.png`,
    back: `${A}/tennis-ss/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the tennis sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-HE-GLF-2026-01": {
    front: `${A}/golf-he/card-front.png`,
    back: `${A}/golf-he/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the golf sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-SN-GLF-2026-01": {
    front: `${A}/golf-sn/card-front.png`,
    back: `${A}/golf-sn/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the golf sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-FS-LAX-2026-22": {
    front: `${A}/lacrosse-fs/card-front.png`,
    back: `${A}/lacrosse-fs/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the lacrosse sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-PR-LAX-2026-22": {
    front: `${A}/lacrosse-pr/card-front.png`,
    back: `${A}/lacrosse-pr/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the lacrosse sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-PR-TRK-2026-08": {
    front: `${A}/track-pr/card-front.png`,
    back: `${A}/track-pr/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the track & field sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-FS-TRK-2026-08": {
    front: `${A}/track-fs/card-front.png`,
    back: `${A}/track-fs/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the track & field sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-SN-SWM-2026-01": {
    front: `${A}/swimming-sn/card-front.png`,
    back: `${A}/swimming-sn/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the swimming sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-SS-SWM-2026-01": {
    front: `${A}/swimming-ss/card-front.png`,
    back: `${A}/swimming-ss/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the swimming sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-SS-OTH-2026-12": {
    front: `${A}/skateboarding-ss/card-front.png`,
    back: `${A}/skateboarding-ss/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the skateboarding sport file; the QR on this back is already printed on the listing images.",
  },
  "GDE-CA-OTH-2026-12": {
    front: `${A}/skateboarding-ca/card-front.png`,
    back: `${A}/skateboarding-ca/card-back.png`,
    sourceKind: "demo",
    pending: "F1-ART-08",
    note: "Square-cut 2x export of FRONT and BACK from the skateboarding sport file; the QR on this back is already printed on the listing images.",
  },

  // ---- Order #4180204338 — Avery O'Neal, unlisted; read only with --allow-orders (GAPS #9) ----
  "GDE-FS-FTB-2026-80": {
    front: "orders/4180204338/print/GDE-FS-FTB-2026-80-CARD-FRONT-816x1110.png",
    back: "orders/4180204338/print/GDE-FS-FTB-2026-80-CARD-BACK-816x1110.png",
    sourceKind: "order",
    note: "816×1110 print files with bleed (trimmed by the converter); the back's QR decodes to this id. Built only into this customer's own public/cards/<id>/, never committed.",
  },
  // card:new sources insert above
};

export function artSourceFor(cardId: string): ArtSource | undefined {
  return DEMO_ART_SOURCES[cardId];
}

export function isForbiddenSource(repoRelativePath: string): boolean {
  const p = repoRelativePath.replace(/^\.\//, "");
  return FORBIDDEN_SOURCE_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix));
}

/** Sources that may be read only with `--allow-orders`: anything under orders/ or an order export folder. */
export function isOrderSource(repoRelativePath: string): boolean {
  const p = repoRelativePath.replace(/^\.\//, "");
  return p.startsWith("orders/") || /^card-flip\/assets\/order/i.test(p);
}
