// The 17 sports. `numbered` = the kit carries a jersey number (copy may promise "their number");
// `hasBackNumber` = the shirt back carries it (from art-pipeline/kits.ts). Codes are the ones the
// printed card IDs and the Etsy SKUs use. Listing IDs are the live Etsy listings (2026-09-05; banner and
// Senior Night banner ids 2026-10-02/04; the basketball Senior Night set 4580022282 from 2026-09-22).

export interface Sport {
  slug: string;
  code: string;
  name: string;
  numbered: boolean;
  hasBackNumber: boolean;
  /** True when the sport has a live card, poster or Senior Night listing (a banner-only sport such as lacrosse stays false). */
  live: boolean;
  /** Poster art exists for this sport (GAPS #16) — the /posters sport picker lists only these. */
  hasPosterArt?: boolean;
  cardListingId?: string;
  posterListingId?: string;
  seniorNightListingId?: string;
  /** The sport's own banner listing (etsy/BANNER-ROLLOUT-2026-10.md, live 2026-10-02) — 11 sports have one. */
  bannerListingId?: string;
  /** The Senior Night banner listing (SR style, live 2026-10-02/04) — 8 sports have one. */
  seniorNightBannerListingId?: string;
}

export const sports: Sport[] = [
  { slug: "basketball", code: "BKB", name: "Basketball", numbered: true, hasBackNumber: true, live: true, hasPosterArt: true, cardListingId: "4562666649", posterListingId: "4562700100", seniorNightListingId: "4580022282", bannerListingId: "4587149341", seniorNightBannerListingId: "4588343385" },
  { slug: "football", code: "FTB", name: "Football", numbered: true, hasBackNumber: true, live: true, hasPosterArt: true, cardListingId: "4563878038", posterListingId: "4564301710", seniorNightListingId: "4568844304", bannerListingId: "4579998618", seniorNightBannerListingId: "4587228297" },
  { slug: "baseball", code: "BSB", name: "Baseball", numbered: true, hasBackNumber: true, live: true, hasPosterArt: true, cardListingId: "4567592965", posterListingId: "4568369175", seniorNightListingId: "4568844985", bannerListingId: "4587163355", seniorNightBannerListingId: "4588346087" },
  { slug: "softball", code: "SFB", name: "Softball", numbered: true, hasBackNumber: true, live: true, hasPosterArt: true, cardListingId: "4570918285", posterListingId: "4570922925", seniorNightListingId: "4569506845", bannerListingId: "4587165630", seniorNightBannerListingId: "4588353382" },
  { slug: "soccer", code: "SOC", name: "Soccer", numbered: true, hasBackNumber: true, live: true, hasPosterArt: true, cardListingId: "4567599879", posterListingId: "4568359117", seniorNightListingId: "4568841851", bannerListingId: "4587139658", seniorNightBannerListingId: "4587237982" },
  { slug: "ice-hockey", code: "ICH", name: "Ice Hockey", numbered: true, hasBackNumber: true, live: true, hasPosterArt: true, cardListingId: "4574711059", posterListingId: "4574712739", bannerListingId: "4587152501" },
  { slug: "volleyball", code: "VBL", name: "Volleyball", numbered: true, hasBackNumber: true, live: true, hasPosterArt: true, cardListingId: "4567597109", posterListingId: "4568365063", seniorNightListingId: "4568846696", bannerListingId: "4587127673", seniorNightBannerListingId: "4587235630" },
  { slug: "lacrosse", code: "LAX", name: "Lacrosse", numbered: true, hasBackNumber: true, live: false, bannerListingId: "4587174104" },
  { slug: "wrestling", code: "WRS", name: "Wrestling", numbered: true, hasBackNumber: false, live: true, hasPosterArt: true, cardListingId: "4570935692", posterListingId: "4570924637", seniorNightListingId: "4569522144", bannerListingId: "4587162250", seniorNightBannerListingId: "4588344745" },
  { slug: "cheerleading", code: "CHR", name: "Cheerleading", numbered: false, hasBackNumber: false, live: true, hasPosterArt: true, cardListingId: "4564284709", posterListingId: "4564287163", seniorNightListingId: "4568849272", bannerListingId: "4587147815", seniorNightBannerListingId: "4587240396" },
  { slug: "gymnastics", code: "GYM", name: "Gymnastics", numbered: false, hasBackNumber: false, live: false },
  { slug: "track-field", code: "TRK", name: "Track & Field", numbered: true, hasBackNumber: false, live: false, bannerListingId: "4587172821" },
  { slug: "swimming", code: "SWM", name: "Swimming", numbered: false, hasBackNumber: false, live: false },
  { slug: "tennis", code: "TEN", name: "Tennis", numbered: false, hasBackNumber: false, live: false },
  { slug: "golf", code: "GLF", name: "Golf", numbered: false, hasBackNumber: false, live: false },
  { slug: "pickleball", code: "PKB", name: "Pickleball", numbered: false, hasBackNumber: false, live: false },
  { slug: "other-sport", code: "OTH", name: "Skateboarding", numbered: true, hasBackNumber: false, live: false },
];

export const sportByCode = (code: string): Sport | undefined => sports.find((s) => s.code === code);
export const sportBySlug = (slug: string): Sport | undefined => sports.find((s) => s.slug === slug);

/** The one sentence that is true for every sport: numbered sports get their number, the rest their crest. */
export const identityLine = (s: Sport): string =>
  s.numbered ? "their number, their club crest" : "their club crest, their name";

/** The five sports that never carry a jersey number — in copy, alt text or example data (COPY §0.1). */
export const NUMBERLESS_CODES: readonly string[] = ["CHR", "GYM", "SWM", "TEN", "GLF", "PKB"];
export const isNumberless = (s: Pick<Sport, "code">): boolean => NUMBERLESS_CODES.includes(s.code);

export type BackLine = "their number" | "their name, their club crest" | "plain back";

/**
 * What the shirt back carries on the card (C9): a numbered sport with a back number gets the
 * number; a numberless sport gets name + crest; a numbered sport whose kit has no back number
 * (wrestling, track & field, pickleball, skateboarding) gets a plain back.
 */
export function backLine(s: Sport): BackLine {
  if (!s.numbered) return "their name, their club crest";
  return s.hasBackNumber ? "their number" : "plain back";
}

/** The sports the /posters page can show and sell today (GAPS #16), in roster order. */
export const postersSports = (): Sport[] => sports.filter((s) => s.hasPosterArt);

/**
 * The sports that have their OWN Etsy listing for a family. Every other sport is still built to
 * order, but its buyer goes to the all-sports Complete Set listing and picks the sport there — so a
 * picker must never imply a listing that does not exist (an earlier build sent nine sports to the
 * basketball listing, and then to a set listing from the trading-card page).
 */
export const sportsWithOwnListing = (family: "cards" | "posters" | "senior-night"): Sport[] =>
  sports.filter((s) =>
    family === "cards" ? Boolean(s.cardListingId) : family === "posters" ? Boolean(s.posterListingId) : Boolean(s.seniorNightListingId),
  );

/** Whether this sport has its own listing for the family (false → the all-sports listing). */
export const hasOwnListing = (sport: Sport, family: "cards" | "posters" | "senior-night"): boolean =>
  sportsWithOwnListing(family).some((s) => s.slug === sport.slug);
