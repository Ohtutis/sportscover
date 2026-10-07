// The free-proof form's state and the pure functions around it: the initial state, the URL prefill,
// the payload the API receives (raw input for parseProofRequest — the same validator runs on the client
// first), the error-key → control-id map, the photo screening, the source capture, (pricing v1, 2026-10-07)
// the bundle — the summary's "after approval" sum and the ladder's nudge — and (v4, 2026-10-06) the sport chosen in step 1 and
// which picture of it each slot shows. No React here, so every rule is unit-tested
// (tests/intake-page.test.ts) without a browser.

import { BUNDLE_STEPS, bundleTotal, type BundleLine, type BundleTotal } from "../../lib/catalog/prices";
import { isNumberless, sportBySlug, sports } from "../../lib/catalog/sports";
import { styles } from "../../lib/catalog/styles";
import { PRODUCTS, PRODUCT_KEYS, optionOf, productByKey, type ProductKey } from "../../lib/intake/products";
// Types only (erased at build): the art map itself is resolved on the server and arrives as a prop.
import type { FreeProofArtMap, FreeProofImage, FreeProofSportArt } from "../../lib/intake/sport-art";
import {
  CLASS_YEARS,
  CONSENT_ORDER,
  CREST_RULES,
  CURRENT_SEASON,
  MAX_STATS,
  PHOTO_RULES,
  REQUEST_ID,
  SPORT_OTHER,
  STYLE_RECOMMEND,
  isPhotoFile,
  type ConsentKey,
  type FileMeta,
  type ProofRequestInput,
  type SourceInfo,
  type StyleChoice,
} from "../../lib/intake/types";

/**
 * One product's choice. No quantity since v4 (owner, 2026-10-06: "why does one product get a quantity and
 * the others not?") — every chosen option is sent as one; "need more than one?" is answered on the proof.
 */
export interface ProductState {
  selected: boolean;
  option: string;
}

export interface StatRow {
  value: string;
  label: string;
}

export interface AthleteState {
  firstName: string;
  lastName: string;
  /** Chosen in step 1: a catalog slug, SPORT_OTHER, or "" before a choice. */
  sportSlug: string;
  /** What the parent typed for "Other sport or activity" (sent only with SPORT_OTHER). */
  sportOther: string;
  jerseyNumber: string;
  position: string;
  team: string;
  season: string;
  classOf: string;
  eventDate: string;
  headline: string;
  stats: StatRow[];
  notes: string;
}

/**
 * v4 (owner, 2026-10-06): no "need it by" date and no team colours in the form — the date is told in the
 * notes, the colours are read off the kit photo. The payload simply leaves them out; the parser still
 * accepts them, so an older tab's request is never refused.
 */
export interface ContactState {
  name: string;
  email: string;
  phone: string;
  country: string;
}

export interface FormState {
  products: Record<ProductKey, ProductState>;
  style: StyleChoice | "";
  athlete: AthleteState;
  contact: ContactState;
  consents: Record<ConsentKey, boolean>;
  /** Honeypot — a real browser leaves it empty. */
  website: string;
}

export function initialState(): FormState {
  return {
    products: Object.fromEntries(PRODUCTS.map((p) => [p.key, { selected: false, option: p.options[0].key }])) as Record<
      ProductKey,
      ProductState
    >,
    style: "",
    athlete: {
      firstName: "",
      lastName: "",
      sportSlug: "",
      sportOther: "",
      jerseyNumber: "",
      position: "",
      team: "",
      season: CURRENT_SEASON,
      classOf: "",
      eventDate: "",
      headline: "",
      stats: Array.from({ length: MAX_STATS }, () => ({ value: "", label: "" })),
      notes: "",
    },
    // v2 (owner review 2026-10-04): the form no longer asks for a phone or a country. The payload keeps
    // its shape and sends them empty; the server records its own default country (orders ship in the US).
    contact: { name: "", email: "", phone: "", country: "" },
    consents: Object.fromEntries(CONSENT_ORDER.map((k) => [k, false])) as Record<ConsentKey, boolean>,
    website: "",
  };
}

/** Digits only, at most three — the field never holds anything the server would strip. */
export const cleanNumber = (raw: string): string => raw.replace(/\D/g, "").slice(0, 3);

// --- prefill ----------------------------------------------------------------------------------------

export interface Prefill {
  products: ProductKey[];
  options: Partial<Record<ProductKey, string>>;
  sport?: string;
  style?: StyleChoice;
  classOf?: string;
}

const list = (v: string | null): string[] =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * `?product=cards,poster&option=p12&sport=basketball&style=SN&classOf=2027` → what the form starts with.
 * `option` is a list of option keys (each applies to every chosen product that has it) or
 * `product:option` pairs. Unknown values are ignored, never an error: an ad link can't break the form.
 */
export function parsePrefill(get: (key: string) => string | null): Prefill {
  const products = list(get("product"))
    .map((k) => k.toLowerCase())
    .filter((k): k is ProductKey => (PRODUCT_KEYS as readonly string[]).includes(k));
  const unique = [...new Set(products)];
  const options: Partial<Record<ProductKey, string>> = {};
  for (const entry of list(get("option"))) {
    const [a, b] = entry.split(":");
    // `cards:p12` names its product; a bare `p12` applies to the chosen products that offer it — or, when
    // the link chose none, to the one product that offers it (a bare `digital` is ambiguous and ignored).
    const offering = PRODUCTS.filter((p) => p.options.some((o) => o.key.toLowerCase() === a.toLowerCase())).map((p) => p.key);
    const pairs: [ProductKey, string][] = b
      ? (PRODUCT_KEYS as readonly string[]).includes(a.toLowerCase())
        ? [[a.toLowerCase() as ProductKey, b]]
        : []
      : (unique.length ? unique : offering.length === 1 ? offering : []).map((k) => [k, a] as [ProductKey, string]);
    for (const [k, opt] of pairs) {
      const product = productByKey(k);
      const found = product?.options.find((o) => o.key.toLowerCase() === opt.toLowerCase());
      if (found && options[k] === undefined) options[k] = found.key;
    }
  }
  const sport = sportBySlug((get("sport") ?? "").trim().toLowerCase())?.slug;
  const styleRaw = (get("style") ?? "").trim();
  const style: StyleChoice | undefined =
    styleRaw.toLowerCase() === STYLE_RECOMMEND ? STYLE_RECOMMEND : styles.find((s) => s.code === styleRaw.toUpperCase())?.code;
  const classRaw = (get("classOf") ?? get("classof") ?? get("class") ?? "").trim();
  const classOf = CLASS_YEARS.includes(classRaw) ? classRaw : undefined;
  return { products: unique, options, sport, style, classOf };
}

export function applyPrefill(state: FormState, prefill: Prefill): FormState {
  const products = { ...state.products };
  for (const key of prefill.products) products[key] = { ...products[key], selected: true };
  for (const [key, option] of Object.entries(prefill.options) as [ProductKey, string][]) {
    products[key] = { ...products[key], option, selected: true };
  }
  const withSport = prefill.sport ? chooseSport(state, prefill.sport) : state;
  return {
    ...withSport,
    products,
    style: prefill.style ?? state.style,
    athlete: { ...withSport.athlete, classOf: prefill.classOf ?? state.athlete.classOf },
  };
}

// --- the sport (step 1, v4) -------------------------------------------------------------------------

/** Whether a value is a choice step 1 offers: a catalog slug or SPORT_OTHER. */
export const isSportChoice = (slug: string): boolean => slug === SPORT_OTHER || Boolean(sportBySlug(slug));

/**
 * Choosing (or changing) the sport in step 1 — asked ONCE (owner, 2026-10-06). Everything already typed in
 * the athlete step stays; only the jersey number goes, and only when the new sport never wears one. An
 * unknown value changes nothing.
 */
export function chooseSport(state: FormState, slug: string): FormState {
  if (!isSportChoice(slug)) return state;
  const sport = sportBySlug(slug);
  const numberless = sport ? isNumberless(sport) : false;
  return {
    ...state,
    athlete: { ...state.athlete, sportSlug: slug, jerseyNumber: numberless ? "" : state.athlete.jerseyNumber },
  };
}

/** The name a sentence uses for the chosen sport: the catalog name, the typed activity, or null. */
export function sportName(slug: string, other = ""): string | null {
  if (slug === SPORT_OTHER) return other.trim() || null;
  return sportBySlug(slug)?.name ?? null;
}

/**
 * Why the pictures on the page show what they show (owner, 2026-10-06: "one sport on the whole page"): `art` —
 * the chosen sport has example art; `none` — a sport (or "Other") with no example yet, built to order from the
 * photos; `pick` — nothing chosen yet. In both of the last two the page shows its example sport (`shownArt`).
 */
export type ArtState = "art" | "none" | "pick";

export function sportArt(art: FreeProofArtMap, slug: string): FreeProofSportArt | null {
  if (!slug || slug === SPORT_OTHER) return null;
  const entry = art[slug];
  return entry && (Object.keys(entry.cards).length || entry.poster || entry.banner || entry.blanket) ? entry : null;
}

export function artState(art: FreeProofArtMap, slug: string): ArtState {
  if (!slug) return "pick";
  return sportArt(art, slug) ? "art" : "none";
}

/**
 * The page's example sport (owner review 2026-10-07: "too many faceless grey cards until you pick a sport — the
 * page has to hook with the visuals at once and sell the idea that THEIR child ends up on the poster"). Before a
 * sport is chosen every picture on /free-proof shows this one sport's real art, never a grey silhouette and never
 * two sports at once. Football: senior night season, and the sport the most US families play under lights.
 * A link that names a sport (`?sport=…`, served by the per-sport page) shows that sport instead.
 */
export const SHOWCASE_SPORT = "football";

/**
 * The art every picture on the page shows: the chosen sport's when it has any; otherwise the example sport's
 * (`example` — the link's sport on a per-sport page — then SHOWCASE_SPORT). `artState` still says WHY: `art` (their
 * sport), `pick` (nothing chosen yet, the example shows), `none` (their sport has no example yet, the example shows).
 */
export function shownArt(art: FreeProofArtMap, chosen: string, example: string = SHOWCASE_SPORT): FreeProofSportArt | null {
  return sportArt(art, chosen) ?? sportArt(art, example) ?? sportArt(art, SHOWCASE_SPORT);
}

/** What the line under a group of pictures needs: why they show what they show, their sport's name, the example's. */
export interface ArtNoteData {
  state: ArtState;
  sport: string | null;
  example: string;
}

/** The example sport's name for the line under the pictures ("Football"). */
export const exampleName = (art: FreeProofArtMap, example: string = SHOWCASE_SPORT): string =>
  sportName(sportArt(art, example) ? example : SHOWCASE_SPORT) ?? "Football";

/** The finish codes a card front may be shown in, in lineup order (then Senior Night). */
const CARD_ORDER = ["SN", "CA", "FS", "HE", "SS", "PR", "SR"] as const;

/**
 * The card front for a slot: the asked finish when the sport has it; `fallback` lets a slot that only
 * needs "a card of this sport" (the product tile, the step pictures) take the first finish it has.
 */
export function cardImage(entry: FreeProofSportArt | null, code: string, fallback = false): FreeProofImage | null {
  if (!entry) return null;
  const exact = entry.cards[code as keyof FreeProofSportArt["cards"]];
  if (exact || !fallback) return exact ?? null;
  for (const c of CARD_ORDER) if (entry.cards[c]) return entry.cards[c] ?? null;
  return null;
}

/** The product tile's picture in the chosen sport: a card front, the poster, the banner, the blanket — or null (the grey set). */
export function productImage(entry: FreeProofSportArt | null, key: ProductKey, style: StyleChoice | ""): FreeProofImage | null {
  if (!entry) return null;
  if (key === "cards") return cardImage(entry, previewFinish(style), true);
  if (key === "poster") return entry.poster ?? null;
  if (key === "banner") return entry.banner ?? null;
  return entry.blanket ?? null;
}

/**
 * The sport (and look) chosen in the form, for the pictures OUTSIDE it — the hero proof and the
 * how-it-works band sit above the form island. The form writes it from an effect; the server snapshot is
 * always empty, so the static HTML is the grey set and nothing mismatches on hydration.
 */
export interface PageChoice {
  sport: string;
  sportOther: string;
  style: StyleChoice | "";
}

const NO_CHOICE: PageChoice = { sport: "", sportOther: "", style: "" };
let sharedChoice: PageChoice = NO_CHOICE;
const choiceListeners = new Set<() => void>();

export const choiceStore = {
  get: (): PageChoice => sharedChoice,
  getServer: (): PageChoice => NO_CHOICE,
  set(next: PageChoice): void {
    if (next.sport === sharedChoice.sport && next.sportOther === sharedChoice.sportOther && next.style === sharedChoice.style) return;
    sharedChoice = next.sport || next.style || next.sportOther ? next : NO_CHOICE;
    for (const l of choiceListeners) l();
  },
  subscribe(l: () => void): () => void {
    choiceListeners.add(l);
    return () => choiceListeners.delete(l);
  },
};

/**
 * A sport asked for OUTSIDE the form — the hero's sport strip (v6, 2026-10-07). The form subscribes and treats a
 * request exactly like a tap on a step-1 chip, so the strip, step 1 and every picture agree. A counter, not a flag,
 * so asking for the same sport twice (after "Other" was chosen in between) still lands.
 */
let sportRequest: { slug: string; n: number } = { slug: "", n: 0 };
const requestListeners = new Set<() => void>();

export const sportRequestStore = {
  get: (): { slug: string; n: number } => sportRequest,
  request(slug: string): void {
    sportRequest = { slug, n: sportRequest.n + 1 };
    for (const l of requestListeners) l();
  },
  subscribe(l: () => void): () => void {
    requestListeners.add(l);
    return () => requestListeners.delete(l);
  },
};

// --- payload ----------------------------------------------------------------------------------------

export const fileMeta = (file: { name: string; size: number; type: string }): FileMeta => ({ name: file.name, size: file.size, type: file.type });

export interface BuiltPayload {
  payload: ProofRequestInput;
  /** statRows[k] = the form row the k-th SENT stat came from (empty rows are not sent). */
  statRows: number[];
}

/**
 * The raw request the API receives. Only what the parent chose is sent: every option with quantity 1
 * (v4 — no quantity in the form), a numberless sport never carries a number, the typed activity only
 * with "Other", the Senior Night fields only with SR, the crest consent only with a crest, empty stat
 * rows not at all — and nothing for the fields the form no longer asks (team colours, the need-it-by
 * date, the marketing consent): absent, never sent empty or false.
 */
export function buildPayload(
  state: FormState,
  files: { photos: FileMeta[]; crest: FileMeta | null },
  source: SourceInfo,
  turnstileToken = "",
): BuiltPayload {
  const sport = sportBySlug(state.athlete.sportSlug);
  const numberless = sport ? isNumberless(sport) : false;
  const sr = state.style === "SR";
  const stats = state.athlete.stats
    .map((s, row) => ({ value: s.value.trim(), label: s.label.trim(), row }))
    .filter((s) => s.value || s.label);
  const payload: ProofRequestInput = {
    products: PRODUCTS.filter((p) => state.products[p.key].selected).map((p) => {
      const chosen = state.products[p.key];
      const option = optionOf(p, chosen.option) ?? p.options[0];
      return { product: p.key, option: option.key, quantity: 1 };
    }),
    style: state.style,
    athlete: {
      firstName: state.athlete.firstName,
      lastName: state.athlete.lastName,
      sportSlug: state.athlete.sportSlug,
      sportOther: state.athlete.sportSlug === SPORT_OTHER ? state.athlete.sportOther : "",
      jerseyNumber: numberless ? "" : cleanNumber(state.athlete.jerseyNumber),
      position: state.athlete.position,
      team: state.athlete.team,
      season: state.athlete.season,
      classOf: sr ? state.athlete.classOf : "",
      eventDate: sr ? state.athlete.eventDate : "",
      headline: state.athlete.headline,
      stats: stats.map(({ value, label }) => ({ value, label })),
      notes: state.athlete.notes,
    },
    contact: { ...state.contact },
    consents: {
      guardian: state.consents.guardian,
      biometric: state.consents.biometric,
      license: state.consents.license,
      crest: files.crest ? state.consents.crest : false,
    },
    photos: files.photos,
    crest: files.crest,
    source,
    website: state.website,
    turnstileToken,
  };
  return { payload, statRows: stats.map((s) => s.row) };
}

// --- the bundle (pricing v1, 2026-10-07) -------------------------------------------------------------

/** One option as the form prices it: the site price from prices.ts, handed over by the server page. */
export interface PricedOption {
  key: string;
  printed: boolean;
  price: number;
}

type PricedProducts = readonly { key: ProductKey; options: readonly PricedOption[] }[];

/** The chosen options as bundle lines, one of each (v4 has no quantity). */
export function chosenLines(products: PricedProducts, state: Record<ProductKey, ProductState>): BundleLine[] {
  return products
    .filter((p) => state[p.key]?.selected)
    .map((p) => {
      const o = p.options.find((x) => x.key === state[p.key].option) ?? p.options[0];
      return { product: p.key, price: o.price };
    });
}

/**
 * The summary's "after approval" figure: the chosen options through prices.ts `bundleTotal` — the same
 * function that prices the set tiers and the request email, so the three can never disagree. Null when
 * nothing is chosen.
 */
export function orderTotal(products: PricedProducts, state: Record<ProductKey, ProductState>): BundleTotal | null {
  const lines = chosenLines(products, state);
  return lines.length ? bundleTotal(lines) : null;
}

/** The rung of BUNDLE_STEPS a product count has reached: -1 below the first (0 or 1 product). */
export const bundleStepIndex = (productCount: number): number => BUNDLE_STEPS.filter((step) => productCount >= step.count).length - 1;

/**
 * The nudge under the ladder: the first product (in PRODUCTS order) not yet chosen, at the option its card
 * holds, and what adding it would save on top of what the order already saves — "Add a poster: save
 * another $X". `first` is true while the order saves nothing yet. Null before a choice and once all four
 * are chosen.
 */
export interface BundleNudge {
  add: ProductKey;
  saving: number;
  first: boolean;
}

export function bundleNudge(products: PricedProducts, state: Record<ProductKey, ProductState>): BundleNudge | null {
  const current = orderTotal(products, state);
  const next = products.find((p) => !state[p.key]?.selected);
  if (!current || !next) return null;
  const after = orderTotal(products, { ...state, [next.key]: { ...state[next.key], selected: true } });
  if (!after) return null;
  return { add: next.key, saving: Math.round((after.discount - current.discount) * 100) / 100, first: current.discountRate === 0 };
}

// --- the live text preview (owner, 2026-10-06) -------------------------------------------------------

/**
 * How a finish sets the name block on its card front — a known property of the finish, read off the
 * fronts themselves (the "lockup alignment" rule): Chrome All-Star and Heritage centre it, every other
 * finish (and Senior Night) sets it flush left. The preview follows it; the per-finish typefaces stay on
 * /c (they load only there), so the preview uses the site's own Anton and Barlow.
 */
export const PREVIEW_CENTERED_FINISHES: readonly string[] = ["CA", "HE"];
export const previewAlign = (code: string): "center" | "left" => (PREVIEW_CENTERED_FINISHES.includes(code) ? "center" : "left");

/** The finish whose example front the preview shows: the chosen one, Stadium Night until one is chosen (or for "recommend"). */
export const previewFinish = (style: StyleChoice | ""): string => (style && style !== STYLE_RECOMMEND ? style : "SN");

export interface PreviewText {
  first: string;
  last: string;
  /** "#12" — numbered sports only, and only once a digit is typed. */
  number: string;
  /** "Point guard · Cedar Ridge Bears" — whichever of the two is filled. */
  meta: string;
  /** Senior Night only: "Class of 2027", once the class year is chosen. */
  classLine: string;
}

/**
 * What the parent has typed, shaped the way the card sets it — and NOTHING that was not typed: no
 * placeholder name, no example number, no default season. Null when there is nothing to show, so the
 * card front stays the untouched example (with its C13) until the first keystroke.
 */
export function previewText(athlete: Pick<AthleteState, "firstName" | "lastName" | "jerseyNumber" | "sportSlug" | "position" | "team" | "classOf">, style: StyleChoice | ""): PreviewText | null {
  const sport = sportBySlug(athlete.sportSlug);
  const numbered = !(sport && isNumberless(sport));
  const digits = cleanNumber(athlete.jerseyNumber);
  const text: PreviewText = {
    first: athlete.firstName.trim(),
    last: athlete.lastName.trim(),
    number: numbered && digits ? `#${digits}` : "",
    meta: [athlete.position.trim(), athlete.team.trim()].filter(Boolean).join(" · "),
    classLine: style === "SR" && athlete.classOf ? `Class of ${athlete.classOf}` : "",
  };
  return Object.values(text).some(Boolean) ? text : null;
}

/**
 * The athlete fields as the summary sees them. The form's state lives in IntakeForm; AthleteFields
 * publishes every change here and "Your order" subscribes (useSyncExternalStore), so the preview follows
 * each keystroke without the summary being re-plumbed through the form. Plain JS — no React here —
 * client-only by construction: it is written from an effect, and the server snapshot is always null.
 */
type Listener = () => void;
let sharedAthlete: AthleteState | null = null;
const listeners = new Set<Listener>();

export const athleteStore = {
  get: (): AthleteState | null => sharedAthlete,
  getServer: (): AthleteState | null => null,
  set(next: AthleteState | null): void {
    if (next === sharedAthlete) return;
    sharedAthlete = next;
    for (const l of listeners) l();
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

// --- errors -----------------------------------------------------------------------------------------

export const FIELD_PREFIX = "fp-";

/** The DOM id of a field, from its error key: `athlete.firstName` → `fp-athlete-firstName`. */
export const fieldId = (key: string): string => `${FIELD_PREFIX}${key.replace(/\./g, "-")}`;
export const errorId = (key: string): string => `${fieldId(key)}-error`;

/** The control that takes focus for an error key (groups focus their first control). */
export function errorTarget(key: string, statRows: number[] = []): string {
  if (key === "athlete.sportSlug") return `${FIELD_PREFIX}sport-${sports[0].slug}`;
  if (key === "products") return `${FIELD_PREFIX}product-${PRODUCTS[0].key}`;
  if (key === "style") return `${FIELD_PREFIX}style-${styles[0].code}`;
  if (key === "photos") return `${FIELD_PREFIX}photos-choose`;
  if (key === "crest") return `${FIELD_PREFIX}crest-choose`;
  if (key === "website") return `${FIELD_PREFIX}submit`;
  const stat = /^athlete\.stats\.(\d+)$/.exec(key);
  if (stat) return `${FIELD_PREFIX}athlete-stats-${statRows[Number(stat[1])] ?? 0}-value`;
  return fieldId(key);
}

/** The fields behind "+ Add optional details" in the athlete step, in their order — an error on any of them opens the group, so focus can land on it. */
export const OPTIONAL_DETAIL_KEYS: readonly string[] = ["athlete.headline", "athlete.position", "athlete.season", "athlete.notes"];

export const hasOptionalDetailError = (errors: Record<string, unknown>): boolean =>
  Object.keys(errors).some((k) => OPTIONAL_DETAIL_KEYS.includes(k) || /^athlete\.stats\.\d+$/.test(k));

/** Server/client stat errors are keyed by the SENT index; the form shows them on the row they came from. */
export function statErrorsByRow(errors: Record<string, string>, statRows: number[]): Record<number, string> {
  const out: Record<number, string> = {};
  for (const [key, message] of Object.entries(errors)) {
    const m = /^athlete\.stats\.(\d+)$/.exec(key);
    if (m) out[statRows[Number(m[1])] ?? 0] = message;
  }
  return out;
}

// --- files ------------------------------------------------------------------------------------------

export type RejectReason = "type" | "size" | "duplicate" | "limit";

export interface FileLike {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
}

export const fileKey = (f: FileLike): string => `${f.name}::${f.size}::${f.lastModified ?? 0}`;

/** Which incoming photos join the list, and why the others don't (in the order they came). */
export function screenPhotos<T extends FileLike>(existing: readonly T[], incoming: readonly T[]): { accepted: T[]; rejected: { name: string; reason: RejectReason }[] } {
  const seen = new Set(existing.map(fileKey));
  const accepted: T[] = [];
  const rejected: { name: string; reason: RejectReason }[] = [];
  for (const file of incoming) {
    if (file.size > PHOTO_RULES.maxBytes) rejected.push({ name: file.name, reason: "size" });
    else if (!isPhotoFile(fileMeta(file))) rejected.push({ name: file.name, reason: "type" });
    else if (seen.has(fileKey(file))) rejected.push({ name: file.name, reason: "duplicate" });
    else if (existing.length + accepted.length >= PHOTO_RULES.max) rejected.push({ name: file.name, reason: "limit" });
    else {
      accepted.push(file);
      seen.add(fileKey(file));
    }
  }
  return { accepted, rejected };
}

export const isCrestFile = (file: FileLike): boolean => isPhotoFile(fileMeta(file), CREST_RULES);

/** "2.4 MB" / "830 KB" — decimal-free under 10 MB is not worth the noise; one decimal is. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** A browser can only preview what it can decode; HEIC/HEIF shows its file name instead. */
export const canPreview = (f: FileLike): boolean => !/\.(heic|heif)$/i.test(f.name) && !/hei[cf]/i.test(f.type);

// --- source -----------------------------------------------------------------------------------------

export const SOURCE_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

/** The session's first page, as components/EntryAttribution.tsx stored it — the shape only, so this module never imports a client component. */
export interface EntryLike {
  path: string;
  referrer: string;
  utm: Record<string, string>;
}

/**
 * Where the request came from — the landing path, the referrer and any campaign tags. Never a name.
 *
 * With an `entry` (the session's FIRST page, recorded by EntryAttribution in the marketing layout) the
 * landing path and the referrer are the entry's, not the form's: a parent who found /senior-night/volleyball
 * on Google and clicked through reports that page, not "/free-proof" with our own hub as the referrer
 * (SEO master plan §8: "a form on the homepage made every row say /#early-access"). Campaign tags on the
 * form's own URL still win over the entry's — an ad that lands straight on the form carries them here.
 */
export function captureSource(pathname: string, search: string, referrer: string, entry?: EntryLike | null): SourceInfo {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = { ...(entry?.utm ?? {}) };
  for (const key of SOURCE_KEYS) {
    const v = params.get(key);
    if (v) utm[key] = v.slice(0, 200);
  }
  const landingPath = (entry?.path || pathname).slice(0, 300) || "/free-proof";
  const ref = (entry ? entry.referrer : referrer).slice(0, 300);
  return { landingPath, referrer: ref, utm };
}

// --- presentation helpers ---------------------------------------------------------------------------

/**
 * The products subhead carries the set sentence; the page shows that sentence under the tiles with the
 * set's "from" price, and the rest above them. Split on sentence ends — never retyped.
 */
export function splitSetSentence(subhead: string): { lead: string; set: string } {
  const sentences = subhead.match(/[^.]+\./g)?.map((s) => s.trim()) ?? [subhead];
  const set = sentences.find((s) => /\bset\b/i.test(s)) ?? "";
  return { lead: sentences.filter((s) => s !== set).join(" "), set };
}

/** "Cards and a poster together are priced as a set." + "from $X" → one line with the price. */
export const setLineWithPrice = (setSentence: string, fromLabel: string): string =>
  setSentence ? `${setSentence.replace(/\.$/, "")} — ${fromLabel}.` : "";

/** The reference from the thanks page's `?ref=`, only when it is a well-formed request id (REQUEST_ID). */
export function validRequestRef(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && REQUEST_ID.test(value) ? value : null;
}
