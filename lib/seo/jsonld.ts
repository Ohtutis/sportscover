// Structured data builders (CONTRACTS §4.1). Every builder returns a plain object with @context and
// @type; pages hand it to <JsonLd>. Prices are numbers from sitePrice() — never a "$" string.
// Never aggregateRating, never review (spec §8: none until real, consented ones exist).

import { isSaleActive, SALE_EXPIRES_AT, sitePrice, type Family, type Tier } from "../catalog/prices";
import {
  BRAND,
  ETSY_SHOP_URL,
  founderPhotoExists,
  IMPRINT,
  imprintComplete,
  OWNER_NAME,
  SITE_URL,
  SOCIAL_URLS,
  SUPPORT_EMAIL,
} from "../site";

export type JsonLdObject = Record<string, unknown>;

const CONTEXT = "https://schema.org";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;
export const LOGO_URL = `${SITE_URL}/brand/shield.png`;
export const FOUNDER_PHOTO_URL = `${SITE_URL}/brand/founder.jpg`;
export const FOUNDER_JOB_TITLE = "Designer and founder";

/** A site path → absolute URL; absolute URLs pass through. */
export const absoluteUrl = (pathOrUrl: string): string => (/^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl}`);

/** "2026-09-24T23:59:59-04:00" + 1 → "2026-09-25" — calendar arithmetic on the date part, no time zone. */
export function isoDatePlusDays(iso: string, days: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) throw new Error(`isoDatePlusDays: "${iso}" does not start with a date`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days)).toISOString().slice(0, 10);
}

function founder(withContext: boolean): JsonLdObject {
  return {
    ...(withContext ? { "@context": CONTEXT } : {}),
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: OWNER_NAME,
    ...(founderPhotoExists() ? { image: FOUNDER_PHOTO_URL } : {}),
  };
}

/** Organization — emitted once, in the root layout. Address only once the imprint is complete. */
export function organization(): JsonLdObject {
  const o: JsonLdObject = {
    "@context": CONTEXT,
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: BRAND,
    url: SITE_URL,
    logo: LOGO_URL,
    email: SUPPORT_EMAIL,
    founder: founder(false),
    sameAs: [ETSY_SHOP_URL, ...SOCIAL_URLS],
  };
  if (imprintComplete()) {
    o.legalName = IMPRINT.legalName;
    o.address = { "@type": "PostalAddress", streetAddress: IMPRINT.address, addressCountry: "LT" };
  }
  return o;
}

/** WebSite — emitted once, in the root layout. No SearchAction (the registry lookup is a POST). */
export function website(): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: BRAND,
    url: SITE_URL,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** The founder Person for /about. */
export function person(): JsonLdObject {
  return {
    ...founder(true),
    jobTitle: FOUNDER_JOB_TITLE,
    worksFor: { "@id": ORGANIZATION_ID },
    url: `${SITE_URL}/about`,
  };
}

export function breadcrumbList(trail: { name: string; href: string }[]): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absoluteUrl(t.href) })),
  };
}

/** FAQPage for exactly the items a page renders — at most one per page. */
export function faqPage(items: { q: string; a: string }[]): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function article(a: { title: string; description: string; path: string; datePublished: string; dateModified: string; image?: string }): JsonLdObject {
  const url = absoluteUrl(a.path);
  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline: a.title,
    description: a.description,
    url,
    mainEntityOfPage: url,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    ...(a.image ? { image: absoluteUrl(a.image) } : {}),
    author: { "@type": "Person", "@id": FOUNDER_ID, name: OWNER_NAME },
    publisher: { "@type": "Organization", "@id": ORGANIZATION_ID, name: BRAND, logo: { "@type": "ImageObject", url: LOGO_URL } },
  };
}

export const PRODUCT_CATEGORY: Record<Family, string> = {
  cards: "Custom sports trading cards",
  posters: "Custom sports posters",
  set: "Custom sports poster and trading card set",
  snset: "Custom sports poster and trading card set",
};

export const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "US",
  // Honest for made-to-order goods: no change-of-mind returns; defects are reprinted or refunded
  // without a return (CONTRACTS §9.2 #4 — a lawyer may prefer MerchantReturnFiniteReturnWindow).
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
  merchantReturnLink: `${SITE_URL}/guarantee`,
} as const;

export const SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 5, maxValue: 7, unitCode: "DAY" },
  },
} as const;

/**
 * Product + AggregateOffer for a family page — the site's own offers only, one per enabled tier,
 * `url` = the page's tier anchor. `priceValidUntil` only while the sale runs (a past date is
 * invalid markup); free US shipping on physical tiers; the no-returns policy on every offer.
 */
export function productFamily(p: { family: Family; path: string; name: string; description: string; images: string[]; tiers: Tier[]; now?: Date }): JsonLdObject {
  const now = p.now ?? new Date();
  const tiers = p.tiers.filter((t) => t.enabled);
  const sale = isSaleActive(now);
  const offers = tiers.map((t) => ({
    "@type": "Offer",
    url: `${SITE_URL}${p.path}#tier-${t.sku}`,
    name: t.name,
    price: sitePrice(t, now),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    ...(sale ? { priceValidUntil: isoDatePlusDays(SALE_EXPIRES_AT, 1) } : {}),
    ...(t.physical ? { shippingDetails: SHIPPING_DETAILS } : {}),
    hasMerchantReturnPolicy: RETURN_POLICY,
  }));
  const prices = offers.map((o) => o.price);
  return {
    "@context": CONTEXT,
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images.map(absoluteUrl),
    url: absoluteUrl(p.path),
    brand: { "@type": "Brand", name: BRAND },
    category: PRODUCT_CATEGORY[p.family],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: prices.length ? Math.min(...prices) : 0,
      highPrice: prices.length ? Math.max(...prices) : 0,
      offerCount: offers.length,
      offers,
    },
  };
}

/** Public /c only. */
export function imageObject(i: { url: string; width: number; height: number; caption: string; path: string }): JsonLdObject {
  const url = absoluteUrl(i.url);
  return {
    "@context": CONTEXT,
    "@type": "ImageObject",
    contentUrl: url,
    url,
    width: i.width,
    height: i.height,
    caption: i.caption,
    representativeOfPage: true,
    mainEntityOfPage: absoluteUrl(i.path),
  };
}

/** Public /c only — the 5 s flip. */
export function videoObject(v: { name: string; description: string; thumbnailUrl: string; contentUrl: string; uploadDate: string; path: string }): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "VideoObject",
    name: v.name,
    description: v.description,
    thumbnailUrl: absoluteUrl(v.thumbnailUrl),
    contentUrl: absoluteUrl(v.contentUrl),
    uploadDate: v.uploadDate,
    duration: "PT5S",
    url: absoluteUrl(v.path),
  };
}
