// What each package contains — the same wording as the Etsy listings' WHAT YOU GET blocks.

import type { Family } from "./prices";

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
    "Phone and desktop wallpapers with safe zones",
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
  "GDE-ANY-POST-P1824": ["18 × 24 in matte poster, 189 g/m²", "Printed and shipped free in the US"],
  "GDE-ANY-POST-P2436": ["24 × 36 in matte poster, 189 g/m²", "Printed and shipped free in the US"],
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
