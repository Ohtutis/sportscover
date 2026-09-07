// Single source for site identity. Code defaults are the real brand; env vars only override.

const strip = (u: string) => u.replace(/\/$/, "");

// Brand identity is CODE, not configuration. The Vercel project still carries env vars from the
// pre-rename era (NEXT_PUBLIC_BRAND_NAME, NEXT_PUBLIC_OWNER_NAME, NEXT_PUBLIC_SITE_URL pointing at
// sportscover.vercel.app); reading them put the old brand and a wrong canonical host on the live site
// on 2026-09-06. On Vercel the canonical origin is therefore fixed; NEXT_PUBLIC_SITE_URL is honoured
// only for local development (e.g. http://localhost:3000).
export const CANONICAL_ORIGIN = "https://www.gamedayedition.com";
export const SITE_URL = process.env.VERCEL ? CANONICAL_ORIGIN : strip(process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_ORIGIN);
export const BRAND = "Game Day Edition";
export const SUPPORT_EMAIL = "hello@gamedayedition.com";
export const OWNER_NAME = "John Birch";
export const TAGLINE = "Custom sports posters & trading cards from your photo";
export const ETSY_SHOP_URL = "https://gamedayedition.etsy.com";

/** Seller identification. The footer imprint renders only when the block is complete. */
export const IMPRINT = {
  legalName: process.env.NEXT_PUBLIC_IMPRINT_LEGAL_NAME || "",
  companyCode: process.env.NEXT_PUBLIC_IMPRINT_COMPANY_CODE || "",
  vat: process.env.NEXT_PUBLIC_IMPRINT_VAT || "",
  address: process.env.NEXT_PUBLIC_IMPRINT_ADDRESS || "",
  responsiblePerson: OWNER_NAME,
};

export function imprintComplete(): boolean {
  return Boolean(IMPRINT.legalName && IMPRINT.companyCode && IMPRINT.address);
}

export const VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
  pinterest: process.env.NEXT_PUBLIC_PINTEREST_DOMAIN_VERIFY || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION || "",
};

// --- F1 additions (CONTRACTS §4.9, GAPS #25 / #31) --------------------------------------------

/** F2 flips this to true → every CtaPair switches to /order/new with Etsy as the outline secondary. */
export const SITE_SELLS_DIRECT = false;

/** Real delivered orders. 0 → the "So far: {n} editions delivered." sentence is omitted (rendered only when ≥ 5). */
export const DELIVERED_COUNT = 0;

export const OWNER_CITY = process.env.NEXT_PUBLIC_OWNER_CITY || "";

export type SocialPlatform = "Etsy" | "Instagram" | "TikTok" | "YouTube" | "Facebook" | "Pinterest";
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

/** Footer social row, COPY §1.2 order. Etsy is always present; the others only when their env var is set. */
export const SOCIAL_LINKS: SocialLink[] = (
  [
    { platform: "Etsy", url: ETSY_SHOP_URL },
    { platform: "Instagram", url: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { platform: "TikTok", url: process.env.NEXT_PUBLIC_TIKTOK_URL },
    { platform: "YouTube", url: process.env.NEXT_PUBLIC_YOUTUBE_URL },
    { platform: "Facebook", url: process.env.NEXT_PUBLIC_FACEBOOK_URL },
    { platform: "Pinterest", url: process.env.NEXT_PUBLIC_PINTEREST_URL },
  ] as { platform: SocialPlatform; url: string | undefined }[]
).filter((l): l is SocialLink => Boolean(l.url && l.url.trim()));

/** Social profile URLs for Organization JSON-LD `sameAs` (Etsy is added there separately). */
export const SOCIAL_URLS: string[] = SOCIAL_LINKS.filter((l) => l.platform !== "Etsy").map((l) => l.url);

/**
 * Whether the real founder photo (public/brand/founder.jpg, D10) exists. Server-only by nature; the
 * check goes through `process.getBuiltinModule` (Node ≥ 22.3) instead of a static `node:fs` import
 * because this module is also imported by client components (app/error.tsx needs SUPPORT_EMAIL) and a
 * Node built-in in a client bundle fails the build. In the browser it simply returns false.
 */
export function founderPhotoExists(): boolean {
  if (typeof window !== "undefined" || typeof process === "undefined" || typeof process.getBuiltinModule !== "function") return false;
  const fs = process.getBuiltinModule("node:fs");
  return fs.existsSync(`${process.cwd()}/public/brand/founder.jpg`);
}
