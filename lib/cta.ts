// The one place a page asks for its CTA pair (CONTRACTS §4.9). Every Etsy href goes through
// /go/etsy/<sku> — never a marketplace URL in a component. F1 sells on Etsy, so the primary button is
// "Order on Etsy →" (GAPS #25 exception: a primary may target /go/etsy while SITE_SELLS_DIRECT is
// false); flipping SITE_SELLS_DIRECT in lib/site.ts moves every primary to /order/new and demotes
// Etsy to the outline "Also on Etsy →" (EtsyButton) in one change.
import { sportByCode, sportBySlug, type Sport } from "./catalog/sports";
import { channelOf, styleCode, type CardRecord, type Channel } from "./registry/cards";
import { SITE_SELLS_DIRECT } from "./site";

export type CtaKind = "primary" | "outline" | "etsy";

export interface CtaLink {
  label: string;
  href: string;
  kind?: CtaKind;
}

/** Props of components/CtaPair.tsx (wave0-libs) — the type lives here so lib never imports a component. */
export interface CtaPairProps {
  primary: CtaLink;
  secondary?: CtaLink;
  size?: "md" | "lg";
  tone?: "stock" | "arena";
  className?: string;
}

export type CtaContext = "header" | "home" | "cards" | "posters" | "set" | "senior-night" | "card-page";

export interface CtaOptions {
  /** An explicit tier / listing SKU (e.g. GDE-ANY-CARD-P12). Wins over every derived SKU. */
  sku?: string;
  /** Sport slug or code — picks the sport's own listing when it is live. */
  sport?: string;
  /** Style code or name — reserved for F2 deep links. */
  style?: string;
  channel?: Channel;
}

/** Labels from COPY §1.3 "CTA labels" and §2.15 (7). */
export const CTA_LABELS = {
  orderOnEtsy: "Order on Etsy →",
  alsoOnEtsy: "Also on Etsy →",
  getYoursOnEtsy: "Get yours on Etsy →",
  lookUpACard: "Look up a card",
  startAnOrder: "Start an order",
  startSeniorEdition: "Start their senior edition",
  orderForAthlete: "Order for your athlete",
} as const;

export const DEFAULT_SKU = "GDE-ANY-SET";
export const SENIOR_NIGHT_ANY_SKU = "GDE-ANY-SNSET";

export const etsyHref = (sku: string): string => `/go/etsy/${sku}`;
export const orderHref = (sku: string, sport?: Sport): string =>
  `/order/new?sku=${encodeURIComponent(sku)}${sport ? `&sport=${encodeURIComponent(sport.slug)}` : ""}`;

const findSport = (sport?: string): Sport | undefined =>
  sport ? (sportBySlug(sport.toLowerCase()) ?? sportByCode(sport.toUpperCase())) : undefined;

/** Senior Night: the sport's own set listing when it is live, else the any-sport set. */
export function seniorNightSku(sport?: string): string {
  const s = findSport(sport);
  return s?.seniorNightListingId ? `GDE-${s.code}-SNSET` : SENIOR_NIGHT_ANY_SKU;
}

/**
 * GAPS #18 — the SKU a card page's CTA targets: a Senior Night card → the sport's SN set listing;
 * a sport with its own card listing → that card listing; anything else → the Complete Set.
 */
export function cardPageSku(card: CardRecord): string {
  const code = card.sportCode;
  if (styleCode(card.styleName) === "SR") return `GDE-${code}-SNSET`;
  if (sportByCode(code)?.cardListingId) return `GDE-${code}-CARD`;
  return DEFAULT_SKU;
}

const isCard = (o: CtaOptions | CardRecord | undefined): o is CardRecord => Boolean(o && "cardId" in o);

function derivedSku(ctx: CtaContext, o: CtaOptions, card?: CardRecord): string {
  if (o.sku) return o.sku;
  const sport = findSport(o.sport);
  switch (ctx) {
    case "senior-night":
      return seniorNightSku(o.sport);
    case "card-page":
      return card ? cardPageSku(card) : DEFAULT_SKU;
    case "cards":
      return sport?.cardListingId ? `GDE-${sport.code}-CARD` : "GDE-ANY-CARD";
    case "posters":
      return sport?.posterListingId ? `GDE-${sport.code}-POST` : "GDE-ANY-POST";
    default:
      return DEFAULT_SKU;
  }
}

/**
 * The CTA pair for a page context. `ctaFor("card-page", card)` applies the GAPS #18 SKU rule and the
 * channel rule (demo-etsy → one outline "Get yours on Etsy →", no secondary). `env` exists so tests can
 * assert the F2 flip without touching lib/site.ts.
 */
export function ctaFor(
  ctx: CtaContext,
  o?: CtaOptions | CardRecord,
  env: { sellsDirect: boolean } = { sellsDirect: SITE_SELLS_DIRECT },
): CtaPairProps {
  const card = isCard(o) ? o : undefined;
  const opts: CtaOptions = isCard(o) ? { channel: channelOf(o) } : (o ?? {});
  const sku = derivedSku(ctx, opts, card);
  const tone = ctx === "card-page" ? "arena" : "stock";
  const secondaryLookup: CtaLink = { label: CTA_LABELS.lookUpACard, href: "/registry", kind: "outline" };

  // A demo card printed on Etsy listing images may only ever link back to Etsy (S19/D26), in every phase.
  if (ctx === "card-page" && opts.channel === "demo-etsy") {
    return { primary: { label: CTA_LABELS.getYoursOnEtsy, href: etsyHref(sku), kind: "outline" }, tone };
  }

  if (!env.sellsDirect) {
    return { primary: { label: CTA_LABELS.orderOnEtsy, href: etsyHref(sku), kind: "primary" }, secondary: secondaryLookup, tone };
  }

  const label =
    ctx === "senior-night" ? CTA_LABELS.startSeniorEdition : ctx === "card-page" ? CTA_LABELS.orderForAthlete : CTA_LABELS.startAnOrder;
  return {
    primary: { label, href: orderHref(sku, findSport(opts.sport)), kind: "primary" },
    secondary: { label: CTA_LABELS.alsoOnEtsy, href: etsyHref(sku), kind: "etsy" },
    tone,
  };
}
