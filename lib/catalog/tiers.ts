// What each package contains — the same wording as the Etsy listings' WHAT YOU GET blocks.

import { tiers, type Family } from "./prices";

export const deliverables: Record<Family, string[]> = {
  cards: [
    "Custom trading card — FRONT",
    "Custom trading card — BACK",
    "Certificate of Authenticity",
    "Card flip video",
    "Live registry page linked from the QR code on the card",
    "High-resolution digital files ready for printing",
  ],
  posters: [
    "Custom poster in TWO print sizes — 18 x 24 in and 24 x 36 in, 300 DPI",
    "Phone and desktop wallpapers",
    "High-resolution digital files ready for printing",
  ],
  set: [
    "Custom poster — 18 x 24 and 24 x 36 in, 300 DPI",
    "Custom trading card — FRONT and BACK",
    "Certificate of Authenticity",
    "Card flip video",
    "Phone and desktop wallpapers",
    "Live registry page linked from the QR code on the card",
    "High-resolution digital files ready for printing",
  ],
  snset: [
    "Custom poster — 18 x 24 and 24 x 36 in, 300 DPI",
    "Custom trading card — FRONT and BACK",
    "Certificate of Authenticity",
    "Card flip video",
    "Phone and desktop wallpapers",
    "Live registry page linked from the QR code on the card",
    "High-resolution digital files ready for printing",
  ],
};

/** Per-tier lines that differ from the family list (printed items). */
export const tierNotes: Record<string, string[]> = {
  "GDE-ANY-CARD-P12": ["12 printed cards — square-cut, UV-coated, 2.5 × 3.5 in", "Free printed Certificate of Authenticity", "Printed and shipped free in the US"],
  "GDE-ANY-CARD-P24": ["24 printed cards — square-cut, UV-coated, 2.5 × 3.5 in", "Free printed Certificate of Authenticity", "Printed and shipped free in the US"],
  "GDE-ANY-CARD-PACK": ["Sealed pack: 18 cards — 4 holographic chase, 14 standard", "Ships separately from our pack partner, 3–4 weeks"],
  // Posters DO ship with the certificate (GAPS #5: every live poster listing promises it).
  "GDE-ANY-POST-P1824": ["18 × 24 in matte poster, 189 g/m²", "Free printed Certificate of Authenticity", "Printed and shipped free in the US"],
  "GDE-ANY-POST-P2436": ["24 × 36 in matte poster, 189 g/m²", "Free printed Certificate of Authenticity", "Printed and shipped free in the US"],
  "GDE-ANY-POST-P3040": ["30 × 40 in matte poster, 189 g/m² — printed package only; digital orders receive the two sizes above", "Free printed Certificate of Authenticity", "Printed and shipped free in the US"],
  "GDE-ANY-SET-PRINT": ["12 printed cards + 18 × 24 poster + printed certificate", "Every digital file included", "Printed and shipped free in the US"],
  "GDE-ANY-SET-DLX": ["24 printed cards + 24 × 36 poster + printed certificate", "Every digital file included", "Printed and shipped free in the US"],
  "GDE-ANY-SET-ULT": ["Deluxe Set + sealed foil pack (18 cards — 4 holographic chase, 14 standard)", "Ships in three tracked packages"],
};

export const TRUE_COUNTS = [
  "17 sports",
  "7 styles — 6 finishes + Senior Night",
  "Square-cut, UV-coated 2.5 × 3.5 in cards",
  "Free printed Certificate of Authenticity with every shipped package",
  "A registered card ID on every card",
];

/**
 * The score bug (DESIGN §4.17): each TRUE_COUNTS string, linked to the page that proves it, with the
 * figure inside it set in Anton above the rest of the sentence. `figure` stays a case-insensitive
 * substring of `label` (tested) and `TrueNumbers` takes it OUT of the line it sets above — the two
 * were rendered whole, one under the other, so the footer read "1717 sports" (design review
 * 2026-09-07). `numeral` marks the three entries that carry a real figure; "Free" and "A registered
 * card ID" are sentences, not numbers, so they are set as sentences and get no Anton numeral.
 */
export interface TrueCountLink {
  figure: string;
  label: string;
  href: string;
  /** The figure is a real figure → it is set in Anton and lifted out of the label. */
  numeral?: boolean;
}
export const TRUE_COUNT_LINKS: TrueCountLink[] = [
  { figure: "17", label: TRUE_COUNTS[0], href: "/trading-cards#sports", numeral: true },
  { figure: "7", label: TRUE_COUNTS[1], href: "/trading-cards#finishes", numeral: true },
  { figure: "2.5 × 3.5 in", label: TRUE_COUNTS[2], href: "/trading-cards#spec", numeral: true },
  { figure: "Free", label: TRUE_COUNTS[3], href: "/guarantee" },
  { figure: "ID", label: TRUE_COUNTS[4], href: "/registry" },
];

/**
 * The sentence to set under the numeral: the label with the figure lifted out of it, so nothing is
 * read twice. Entries without `numeral` keep the whole sentence (there is no numeral above it).
 */
export function trueCountRest(item: TrueCountLink): string {
  if (!item.numeral) return item.label;
  const at = item.label.toLowerCase().indexOf(item.figure.toLowerCase());
  if (at < 0) return item.label;
  return `${item.label.slice(0, at)}${item.label.slice(at + item.figure.length)}`.replace(/\s+/g, " ").trim();
}

/** Audited file counts (GAPS #10): 27 files + one live page in a complete set; the SR set adds one. Rendered through this constant, never typed. */
export const FILE_COUNTS = { set: 27, snset: 28 } as const;

/** Every physical card/poster tier includes the family's digital files — one line says so (COPY §2.2 tier table). */
export const EVERY_DIGITAL_FILE_LINE = "Every digital file above";

/**
 * "What's in the box" for a TierCard, in the order the COPY tier tables list it. Digital tiers get
 * the family deliverables; printed card/poster tiers get their notes with the digital-files line
 * before the shipping line; set tiers already carry "Every digital file included" in their notes.
 */
export function boxContents(sku: string): string[] {
  const tier = tiers.find((t) => t.sku === sku);
  if (!tier) return [];
  if (!tier.physical) return [...deliverables[tier.family]];
  const notes = tierNotes[sku] ?? [];
  if (tier.family === "set" || tier.family === "snset" || notes.length < 2) return [...notes];
  return [...notes.slice(0, -1), EVERY_DIGITAL_FILE_LINE, notes[notes.length - 1]];
}
