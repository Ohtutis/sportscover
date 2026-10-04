// The one place a page asks for its CTA pair (CONTRACTS §4.9). Every Etsy href goes through
// /go/etsy/<sku> — never a marketplace URL in a component.
//
// Three modes, two flags in lib/site.ts, one function:
//   FREE_PROOF_FIRST (D29, the owner's 2026-10-04 decision — the live mode): the primary opens the
//     free-proof form (`/free-proof`, prefilled from the page it sits on) and Etsy is the outline
//     "Also on Etsy →" beside it. Nothing is paid on the site: the proof comes first, payment after
//     approval by secure payment link or on Etsy.
//   SITE_SELLS_DIRECT (F2): every primary moves to /order/new and Etsy stays the outline secondary.
//     It wins over FREE_PROOF_FIRST the day it flips.
//   Both false: the F1 Etsy-primary site — "Order on Etsy →" (GAPS #25 exception) + "Look up a card".
// A demo card printed on an Etsy listing image links back to Etsy only, in every mode (S19/D26).
import { sportByCode, sportBySlug, type Sport } from "./catalog/sports";
import { styleByCode, styleByName, styleBySlug, type Style } from "./catalog/styles";
import { INTAKE_PATH } from "./intake/copy";
import { optionOf, PRODUCTS, productByKey, type ProductKey } from "./intake/products";
import { CLASS_YEARS } from "./intake/types";
import { channelOf, styleCode, type CardRecord, type Channel } from "./registry/cards";
import { FREE_PROOF_FIRST, SITE_SELLS_DIRECT } from "./site";

export type CtaKind = "primary" | "outline" | "etsy";

export interface CtaLink {
  label: string;
  href: string;
  kind?: CtaKind;
  /**
   * A shorter label for the one place a full label cannot fit: the header's primary button below
   * 640 px, beside the mark and the menu button (measured: "Get a free proof →" leaves 0.4 px at
   * 360 px). Every other surface renders `label`.
   */
  shortLabel?: string;
}

/** Props of components/CtaPair.tsx (wave0-libs) — the type lives here so lib never imports a component. */
export interface CtaPairProps {
  primary: CtaLink;
  secondary?: CtaLink;
  size?: "md" | "lg";
  tone?: "stock" | "arena";
  /** Stack the pair in one column at every width (a tier card is too narrow for two buttons side by side). */
  stack?: boolean;
  className?: string;
}

export type CtaContext = "header" | "home" | "cards" | "posters" | "set" | "senior-night" | "card-page";

export interface CtaOptions {
  /** An explicit tier / listing SKU (e.g. GDE-ANY-CARD-P12). Wins over every derived SKU; in free-proof mode it also prefills the option. */
  sku?: string;
  /** Sport slug or code — picks the sport's own listing when it is live, and prefills the free-proof form. */
  sport?: string;
  /** Style code or name — prefills the free-proof form (F2 deep links read it too). */
  style?: string;
  channel?: Channel;
}

/** The test seam: which mode to render without touching lib/site.ts. `freeProofFirst` defaults to the site flag. */
export interface CtaEnv {
  sellsDirect: boolean;
  freeProofFirst?: boolean;
}

const SITE_ENV: CtaEnv = { sellsDirect: SITE_SELLS_DIRECT, freeProofFirst: FREE_PROOF_FIRST };

/**
 * Whether the site runs proof-first right now (D29): FREE_PROOF_FIRST, and not yet selling direct.
 * Pages ask this before they print anything that only holds in that mode (the four-step ProofPath,
 * "pay after you approve").
 */
export const freeProofMode = (env: CtaEnv = SITE_ENV): boolean => !env.sellsDirect && (env.freeProofFirst ?? FREE_PROOF_FIRST);

/**
 * Labels from COPY §1.3 "CTA labels" and §2.15 (7), plus the three D29 labels. Which free-proof label
 * a context gets: `seeProofFirst` on Senior Night (a senior's parent is buying against a date, and
 * the label says the proof comes before anything is final), `getFreeProof` everywhere else, and
 * `freeProofShort` only as the header's `shortLabel` on a phone.
 */
export const CTA_LABELS = {
  orderOnEtsy: "Order on Etsy →",
  alsoOnEtsy: "Also on Etsy →",
  getYoursOnEtsy: "Get yours on Etsy →",
  lookUpACard: "Look up a card",
  startAnOrder: "Start an order",
  startSeniorEdition: "Start their senior edition",
  orderForAthlete: "Order for your athlete",
  getFreeProof: "Get a free proof →",
  seeProofFirst: "See your proof first →",
  freeProofShort: "Free proof →",
} as const;

export const DEFAULT_SKU = "GDE-ANY-SET";
export const SENIOR_NIGHT_ANY_SKU = "GDE-ANY-SNSET";

export const etsyHref = (sku: string): string => `/go/etsy/${sku}`;
/** F2 only (SITE_SELLS_DIRECT): the Stripe order form. */
export const orderHref = (sku: string, sport?: Sport): string =>
  `/order/new?sku=${encodeURIComponent(sku)}${sport ? `&sport=${encodeURIComponent(sport.slug)}` : ""}`;

const findSport = (sport?: string): Sport | undefined =>
  sport ? (sportBySlug(sport.toLowerCase()) ?? sportByCode(sport.toUpperCase())) : undefined;

const findStyle = (style?: string): Style | undefined =>
  style ? (styleByCode(style.toUpperCase()) ?? styleByName(style) ?? styleBySlug(style.toLowerCase())) : undefined;

// --- D29: the free-proof link -----------------------------------------------------------------------

/**
 * What the free-proof form opens with. The query is the contract with `/free-proof` (docs/SITE-F2A-
 * FREE-PROOF-2026-10.md § "Prefill"; read by components/intake/model.ts `parsePrefill`): `product` is a
 * comma list of ProductKeys; `option` is either ONE bare option key that applies to every listed
 * product offering it (`digital`) or `product:option` pairs (`cards:p12,poster:p1824`); `sport` a
 * sport slug; `style` a style code; `classOf` a four-digit class year. Every parameter is optional and
 * the form treats each as a suggestion the parent can change.
 */
export type OptionPrefill = string | Partial<Record<ProductKey, string>>;

export interface FreeProofPrefill {
  products?: readonly ProductKey[];
  /** `p12` / `digital`, or `{ cards: "p12", poster: "p1824" }` — anything no listed product offers is dropped. */
  option?: OptionPrefill;
  /** Slug or code; written as the slug. */
  sport?: string;
  /** Code, name or slug; written as the code (`SN`, `SR` …). */
  style?: string;
  /** Senior Night class year; dropped unless the form offers it. */
  classOf?: string;
}

/**
 * `/free-proof?product=cards,poster&option=digital&sport=basketball&style=SR&classOf=2027` — always
 * in this order, never a value the form cannot take (an unknown product, option, sport, style or year
 * is dropped, not passed through), and plain `/free-proof` when nothing is known.
 */
export function freeProofHref(prefill: FreeProofPrefill = {}): string {
  const params: string[] = [];
  const products = [...new Set(prefill.products ?? [])].map((key) => productByKey(key)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (products.length) params.push(`product=${products.map((p) => p.key).join(",")}`);
  const option = prefill.option;
  if (typeof option === "string") {
    const key = option.trim();
    if (key && products.some((p) => optionOf(p, key))) params.push(`option=${encodeURIComponent(key)}`);
  } else if (option) {
    const pairs = products.filter((p) => option[p.key] && optionOf(p, option[p.key] as string)).map((p) => `${p.key}:${option[p.key]}`);
    if (pairs.length) params.push(`option=${pairs.join(",")}`);
  }
  const sport = findSport(prefill.sport);
  if (sport) params.push(`sport=${sport.slug}`);
  const style = findStyle(prefill.style);
  if (style) params.push(`style=${style.code}`);
  if (prefill.classOf && CLASS_YEARS.includes(prefill.classOf)) params.push(`classOf=${prefill.classOf}`);
  return params.length ? `${INTAKE_PATH}?${params.join("&")}` : INTAKE_PATH;
}

/**
 * The Complete Set tiers as form options — what lib/catalog/tiers.ts `boxContents` says each one holds
 * (a test reads those lines back): the digital set is both products' files; the printed sets pair a
 * card count with a poster size.
 */
export const SET_TIER_OPTIONS: Record<string, OptionPrefill> = {
  "GDE-ANY-SET-DIG": "digital",
  "GDE-ANY-SET-PRINT": { cards: "p12", poster: "p1824" },
  "GDE-ANY-SET-DLX": { cards: "p24", poster: "p2436" },
};

/** The form option a tier SKU stands for: `GDE-BKB-CARD-P12` → `p12`, `GDE-ANY-POST-DIG` → `digital`, a set → its pair. */
export function optionForSku(sku: string | undefined): OptionPrefill | undefined {
  if (!sku) return undefined;
  const anySku = sku.replace(/^GDE-[A-Z]{3}-/, "GDE-ANY-");
  for (const product of PRODUCTS) for (const opt of product.options) if (opt.sku === anySku) return opt.key;
  return SET_TIER_OPTIONS[anySku];
}

/** What each page's primary prefills (D29). The header and the home page open the form empty. */
function freeProofPrefill(ctx: CtaContext, o: CtaOptions, card?: CardRecord): FreeProofPrefill {
  const option = optionForSku(o.sku);
  switch (ctx) {
    case "cards":
      return { products: ["cards"], option, sport: o.sport, style: o.style };
    case "posters":
      return { products: ["poster"], option, sport: o.sport, style: o.style };
    case "set":
      return { products: ["cards", "poster"], option, sport: o.sport, style: o.style };
    case "senior-night":
      return { products: ["cards", "poster"], sport: o.sport, style: "SR" };
    case "card-page":
      return card ? { products: ["cards"], sport: card.sportCode, style: styleCode(card.styleName) } : { products: ["cards"] };
    default:
      return {};
  }
}

// --- the Etsy SKU rules (unchanged since F1) ----------------------------------------------------------

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
 * assert every mode without touching lib/site.ts.
 */
export function ctaFor(ctx: CtaContext, o?: CtaOptions | CardRecord, env: CtaEnv = SITE_ENV): CtaPairProps {
  const card = isCard(o) ? o : undefined;
  const opts: CtaOptions = isCard(o) ? { channel: channelOf(o) } : (o ?? {});
  const sku = derivedSku(ctx, opts, card);
  const tone = ctx === "card-page" ? "arena" : "stock";
  const secondaryLookup: CtaLink = { label: CTA_LABELS.lookUpACard, href: "/registry", kind: "outline" };
  const secondaryEtsy: CtaLink = { label: CTA_LABELS.alsoOnEtsy, href: etsyHref(sku), kind: "etsy" };

  // A demo card printed on Etsy listing images may only ever link back to Etsy (S19/D26), in every phase.
  if (ctx === "card-page" && opts.channel === "demo-etsy") {
    return { primary: { label: CTA_LABELS.getYoursOnEtsy, href: etsyHref(sku), kind: "outline" }, tone };
  }

  if (env.sellsDirect) {
    const label =
      ctx === "senior-night" ? CTA_LABELS.startSeniorEdition : ctx === "card-page" ? CTA_LABELS.orderForAthlete : CTA_LABELS.startAnOrder;
    return {
      primary: { label, href: orderHref(sku, findSport(opts.sport)), kind: "primary" },
      secondary: secondaryEtsy,
      tone,
    };
  }

  if (freeProofMode(env)) {
    const primary: CtaLink = {
      label: ctx === "senior-night" ? CTA_LABELS.seeProofFirst : CTA_LABELS.getFreeProof,
      href: freeProofHref(freeProofPrefill(ctx, opts, card)),
      kind: "primary",
      ...(ctx === "header" ? { shortLabel: CTA_LABELS.freeProofShort } : {}),
    };
    // The header keeps the registry lookup beside its button; every other surface offers Etsy.
    return { primary, secondary: ctx === "header" ? secondaryLookup : secondaryEtsy, tone };
  }

  return { primary: { label: CTA_LABELS.orderOnEtsy, href: etsyHref(sku), kind: "primary" }, secondary: secondaryLookup, tone };
}
