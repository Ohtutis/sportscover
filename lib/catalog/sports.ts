// The 17 sports. `numbered` = the kit carries a jersey number (copy may promise "their number");
// `hasBackNumber` = the shirt back carries it (from art-pipeline/kits.ts). Codes are the ones the
// printed card IDs and the Etsy SKUs use. Listing IDs are the live Etsy listings (2026-09-05).

export interface Sport {
  slug: string;
  code: string;
  name: string;
  numbered: boolean;
  hasBackNumber: boolean;
  /** True when at least one Etsy listing for this sport is live. */
  live: boolean;
  cardListingId?: string;
  posterListingId?: string;
  seniorNightListingId?: string;
}

export const sports: Sport[] = [
  { slug: "basketball", code: "BKB", name: "Basketball", numbered: true, hasBackNumber: true, live: true, cardListingId: "4562666649", posterListingId: "4562700100" },
  { slug: "football", code: "FTB", name: "Football", numbered: true, hasBackNumber: true, live: true, cardListingId: "4563878038", posterListingId: "4564301710", seniorNightListingId: "4568844304" },
  { slug: "baseball", code: "BSB", name: "Baseball", numbered: true, hasBackNumber: true, live: true, cardListingId: "4567592965", posterListingId: "4568369175", seniorNightListingId: "4568844985" },
  { slug: "softball", code: "SFB", name: "Softball", numbered: true, hasBackNumber: true, live: true, seniorNightListingId: "4569506845" },
  { slug: "soccer", code: "SOC", name: "Soccer", numbered: true, hasBackNumber: true, live: true, cardListingId: "4567599879", posterListingId: "4568359117", seniorNightListingId: "4568841851" },
  { slug: "ice-hockey", code: "ICH", name: "Ice Hockey", numbered: true, hasBackNumber: true, live: false },
  { slug: "volleyball", code: "VBL", name: "Volleyball", numbered: true, hasBackNumber: true, live: true, cardListingId: "4567597109", posterListingId: "4568365063", seniorNightListingId: "4568846696" },
  { slug: "lacrosse", code: "LAX", name: "Lacrosse", numbered: true, hasBackNumber: true, live: false },
  { slug: "wrestling", code: "WRS", name: "Wrestling", numbered: true, hasBackNumber: false, live: true, seniorNightListingId: "4569522144" },
  { slug: "cheerleading", code: "CHR", name: "Cheerleading", numbered: false, hasBackNumber: false, live: true, cardListingId: "4564284709", posterListingId: "4564287163", seniorNightListingId: "4568849272" },
  { slug: "gymnastics", code: "GYM", name: "Gymnastics", numbered: false, hasBackNumber: false, live: false },
  { slug: "track-field", code: "TRK", name: "Track & Field", numbered: true, hasBackNumber: false, live: false },
  { slug: "swimming", code: "SWM", name: "Swimming", numbered: false, hasBackNumber: false, live: false },
  { slug: "tennis", code: "TEN", name: "Tennis", numbered: false, hasBackNumber: false, live: false },
  { slug: "golf", code: "GLF", name: "Golf", numbered: false, hasBackNumber: false, live: false },
  { slug: "pickleball", code: "PKB", name: "Pickleball", numbered: true, hasBackNumber: false, live: false },
  { slug: "other-sport", code: "OTH", name: "Skateboarding", numbered: true, hasBackNumber: false, live: false },
];

export const sportByCode = (code: string): Sport | undefined => sports.find((s) => s.code === code);
export const sportBySlug = (slug: string): Sport | undefined => sports.find((s) => s.slug === slug);

/** The one sentence that is true for every sport: numbered sports get their number, the rest their crest. */
export const identityLine = (s: Sport): string =>
  s.numbered ? "their number, their club crest" : "their club crest, their name";
