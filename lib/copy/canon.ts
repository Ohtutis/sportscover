// CANON strings C7–C20 (docs/f1/COPY.md §0.3) as named constants — byte-identical everywhere they
// appear: site, Etsy, emails, certificate. C1–C6 stay in content/blocks/*.md and are read with
// block() from lib/blocks.ts; C11 and C12 live in lib/catalog/delivery.ts and are re-exported here
// so a page has one import for every canon sentence. Never retype one of these in JSX.

import { SHIPPING_SENTENCE, STAGED_DELIVERY_SENTENCE } from "../catalog/delivery";
import { TRUST_SEGMENTS } from "../catalog/trust";

export const CANON = {
  /** C7 — the pack line. Never a plus sign, never a different count. */
  packLine: "18 cards — 4 holographic chase, 14 standard",
  /** C8 — the registered-ID line (S10: never "numbered"). */
  registeredIdLine: "Every card carries its registered card ID on the back.",
  /** C9 — the numberless line. */
  numberlessLine:
    "Cheerleading, gymnastics, swimming, tennis and golf don't wear numbers — their card carries their name and club crest instead. Wrestling, track & field, pickleball and skateboarding get a plain back.",
  /** C10 — the delivery clocks; the one wording, everywhere (COPY §5). */
  deliveryClocks:
    "Digital files within 1–2 business days of your order; printed items ship within 5–7 business days of your order. Both clocks start on the day you order — printing begins the moment you approve the proof, so a proof left waiting moves the ship date by the same amount.",
  /** C11 — shipping (delivery.ts). */
  shipping: SHIPPING_SENTENCE,
  /** C12 — staged delivery (delivery.ts). */
  stagedDelivery: STAGED_DELIVERY_SENTENCE,
  /** C13 — the fictional label (`<FictionalLabel>`, not disableable). */
  fictionalLabel: "Example — fictional athlete · photo and artwork generated",
  /** C14 — the trust line; the fourth segment is added by trustLineSegments() only when verified. */
  trustLine: TRUST_SEGMENTS.join(" · "),
  /** C15 — the AI Act line (D17; /c edition panel, certificate, files README). */
  aiActLine: "Artwork generated with AI tools from the athlete's photos and finished by a person.",
  /** C16 — we are new, short. */
  weAreNewShort:
    "Opened August 2026. One designer, three professional labs, every athlete built one at a time. That's why the guarantee reads the way it does.",
  /** C17 — the senior date line. */
  seniorDateLine: "Ordering for a senior night date? Add the date — we schedule proofs against real deadlines.",
  /** C18 — the example gallery caption. */
  galleryCaption:
    "Every example on this site is a fictional athlete from our own roster — we never show a customer's child without written permission.",
  /** C18, short form — the /c demo footer (COPY §2.15 (8)). */
  galleryCaptionShort: "Fictional athlete from our own roster — an example edition.",
  /** C19 — partner names, exactly as declared to Etsy as Production Partners (docs/SUPPLIERS.md). */
  partners: [
    "Professional photo print lab, Santa Cruz CA",
    "Print-on-demand poster printing partner, Charlotte NC",
    "Trading card pack printing partner, Hong Kong",
  ] as const,
  /** C20 — the proof checklist. */
  proofChecklist: "Approving your proof means you checked the name, number, spelling and colors.",
  /** The /c art-pending block (GAPS #8 — overrides COPY §2.15 (2b)); the only wording for that state. */
  artPendingLine:
    "This edition's card art is being prepared. The registry record below is complete — the card face appears here as soon as the export lands.",
} as const;

export type CanonKey = keyof typeof CANON;

/** The registry miss / private / rate-limit / generic error strings (COPY §1.3). */
export const LOOKUP_STRINGS = {
  miss: "No card is registered under that ID. Check the back of the card — mind O versus 0 and I versus 1.",
  private: "This card is registered with Game Day Edition.",
  rateLimited: "Too many lookups in a row. Try again in a minute.",
} as const;

/** The generic error sentence with the support address filled in. */
export const genericErrorLine = (email: string): string =>
  `Something went wrong on our side. Nothing was lost — try again, or email ${email}.`;
