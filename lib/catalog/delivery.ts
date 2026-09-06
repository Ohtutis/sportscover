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

export const SHIPPING_SENTENCE = "Printed and shipped free in the US. Physical and digital orders: US only for now.";
export const STAGED_DELIVERY_SENTENCE =
  "Digital files arrive first. Printed items ship after you approve the proof and may arrive in separate packages.";
