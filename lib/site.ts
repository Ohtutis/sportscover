// Single source for site identity. Code defaults are the real brand; env vars only override.

const strip = (u: string) => u.replace(/\/$/, "");

export const SITE_URL = strip(process.env.NEXT_PUBLIC_SITE_URL || "https://www.gamedayedition.com");
export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Game Day Edition";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@gamedayedition.com";
export const OWNER_NAME = process.env.NEXT_PUBLIC_OWNER_NAME || "John Birch";
export const TAGLINE = "Custom sports posters & trading cards from your photo";
export const ETSY_SHOP_URL = "https://gamedayedition.etsy.com";

/** Social profiles for Organization JSON-LD — only the ones that are set are emitted. */
export const SOCIAL_URLS: string[] = [
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_TIKTOK_URL,
  process.env.NEXT_PUBLIC_YOUTUBE_URL,
  process.env.NEXT_PUBLIC_PINTEREST_URL,
  process.env.NEXT_PUBLIC_FACEBOOK_URL,
].filter((u): u is string => Boolean(u && u.trim()));

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
