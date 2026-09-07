// Delivery promises — the verbatim chips from the live Etsy listings. One delivery claim per page.

export const CHIPS = {
  standard: "DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7",
  seniorNight: "FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS",
} as const;

export const LEAD_TIMES = {
  digitalBusinessDays: [1, 2] as const,
  printShipBusinessDays: [5, 7] as const,
  sealedPackWeeks: [3, 4] as const,
} as const;

export type ChipKind = "digital" | "prints" | "pack";

/**
 * One ` · `-separated segment of the standard chip for a TierCard (GAPS #23): the digital and
 * print segments are cut from CHIPS.standard, never re-typed; the pack segment is built from
 * LEAD_TIMES.sealedPackWeeks because the live chip carries no pack clause.
 */
export function chipSegment(kind: ChipKind): string {
  const segments = CHIPS.standard.split(" · ");
  if (kind === "digital") return segments[0];
  if (kind === "prints") return segments[1];
  const [min, max] = LEAD_TIMES.sealedPackWeeks;
  return `SEALED PACK SHIPS IN ${min}–${max} WEEKS`;
}

export const SHIPPING_SENTENCE = "Printed and shipped free in the US. Physical and digital orders: US only for now.";
export const STAGED_DELIVERY_SENTENCE =
  "Digital files arrive first. Printed items ship after you approve the proof and may arrive in separate packages.";
