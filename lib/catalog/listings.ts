// SKU → live Etsy listing. Every outbound link goes through /go/etsy/<sku>, which resolves here.
// Link form is the shop subdomain (Etsy "Share & Save"), never a bare etsy.com URL.

import { sports } from "./sports";

export const ETSY_LISTING_BASE = "https://gamedayedition.etsy.com/listing/";
export const COMPLETE_SET_LISTING_ID = "4562711454";
export const SENIOR_NIGHT_ANY_LISTING_ID = "4564565764";

export const listingUrl = (listingId: string): string => `${ETSY_LISTING_BASE}${listingId}`;

/** Any-sport card/poster CTAs (pricing table) land on the flagship sport's listing, not the Complete Set. */
const flagship = sports.find((s) => s.slug === "basketball");

/**
 * Resolve a SKU like GDE-BKB-CARD-P12 / GDE-ANY-SET-DIG / GDE-FTB-SNSET-PRINT to a listing id.
 * Unknown or tail sports fall back to the Complete Set (or the any-sport Senior Night set).
 */
export function listingIdForSku(sku: string): string {
  const m = /^GDE-([A-Z]{3})-(CARD|POST|SET|SNSET)(?:-[A-Z0-9]+)?$/.exec(sku.toUpperCase());
  if (!m) return COMPLETE_SET_LISTING_ID;
  const [, code, product] = m;
  const sport = sports.find((s) => s.code === code);
  if (product === "SNSET") return sport?.seniorNightListingId ?? SENIOR_NIGHT_ANY_LISTING_ID;
  if (product === "SET") return COMPLETE_SET_LISTING_ID;
  if (product === "CARD") return sport?.cardListingId ?? flagship?.cardListingId ?? COMPLETE_SET_LISTING_ID;
  if (product === "POST") return sport?.posterListingId ?? flagship?.posterListingId ?? COMPLETE_SET_LISTING_ID;
  return COMPLETE_SET_LISTING_ID;
}

export const listingUrlForSku = (sku: string): string => listingUrl(listingIdForSku(sku));
