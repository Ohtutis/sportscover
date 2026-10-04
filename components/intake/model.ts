// The free-proof form's state and the pure functions around it: the initial state, the URL prefill,
// the payload the API receives (raw input for parseProofRequest — the same validator runs on the client
// first), the error-key → control-id map, the photo screening and the source capture. No React here, so
// every rule is unit-tested (tests/intake-page.test.ts) without a browser.

import { isNumberless, sportBySlug } from "../../lib/catalog/sports";
import { styles } from "../../lib/catalog/styles";
import { PRODUCTS, PRODUCT_KEYS, optionOf, productByKey, type ProductKey } from "../../lib/intake/products";
import {
  CLASS_YEARS,
  CONSENT_ORDER,
  CREST_RULES,
  CURRENT_SEASON,
  MAX_QUANTITY,
  MAX_STATS,
  PHOTO_RULES,
  REQUEST_ID,
  STYLE_RECOMMEND,
  isPhotoFile,
  type ConsentKey,
  type FileMeta,
  type ProofRequestInput,
  type SourceInfo,
  type StyleChoice,
} from "../../lib/intake/types";

export interface ProductState {
  selected: boolean;
  option: string;
  quantity: number;
}

export interface StatRow {
  value: string;
  label: string;
}

export interface AthleteState {
  firstName: string;
  lastName: string;
  sportSlug: string;
  jerseyNumber: string;
  position: string;
  team: string;
  season: string;
  classOf: string;
  eventDate: string;
  colors: { primary: string; secondary: string };
  headline: string;
  stats: StatRow[];
  notes: string;
}

export interface ContactState {
  name: string;
  email: string;
  phone: string;
  country: string;
  neededBy: string;
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

export const DEFAULT_COUNTRY = "United States";

export function initialState(): FormState {
  return {
    products: Object.fromEntries(PRODUCTS.map((p) => [p.key, { selected: false, option: p.options[0].key, quantity: 1 }])) as Record<
      ProductKey,
      ProductState
    >,
    style: "",
    athlete: {
      firstName: "",
      lastName: "",
      sportSlug: "",
      jerseyNumber: "",
      position: "",
      team: "",
      season: CURRENT_SEASON,
      classOf: "",
      eventDate: "",
      colors: { primary: "", secondary: "" },
      headline: "",
      stats: Array.from({ length: MAX_STATS }, () => ({ value: "", label: "" })),
      notes: "",
    },
    contact: { name: "", email: "", phone: "", country: DEFAULT_COUNTRY, neededBy: "" },
    consents: Object.fromEntries(CONSENT_ORDER.map((k) => [k, false])) as Record<ConsentKey, boolean>,
    website: "",
  };
}

/** Whether the product's chosen option is a printed one (only printed options take a quantity). */
export function isPrintedChoice(key: ProductKey, option: string): boolean {
  const product = productByKey(key);
  return Boolean(product && optionOf(product, option)?.printed);
}

export const clampQuantity = (n: number): number => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number.isFinite(n) ? n : 1)));

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
  return {
    ...state,
    products,
    style: prefill.style ?? state.style,
    athlete: {
      ...state.athlete,
      sportSlug: prefill.sport ?? state.athlete.sportSlug,
      classOf: prefill.classOf ?? state.athlete.classOf,
    },
  };
}

// --- payload ----------------------------------------------------------------------------------------

export const fileMeta = (file: { name: string; size: number; type: string }): FileMeta => ({ name: file.name, size: file.size, type: file.type });

export interface BuiltPayload {
  payload: ProofRequestInput;
  /** statRows[k] = the form row the k-th SENT stat came from (empty rows are not sent). */
  statRows: number[];
}

/**
 * The raw request the API receives. Only what the parent chose is sent: a digital option always goes
 * with quantity 1, a numberless sport never carries a number, the Senior Night fields only with SR, the
 * crest consent only with a crest, empty stat rows not at all.
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
      return { product: p.key, option: option.key, quantity: option.printed ? clampQuantity(chosen.quantity) : 1 };
    }),
    style: state.style,
    athlete: {
      firstName: state.athlete.firstName,
      lastName: state.athlete.lastName,
      sportSlug: state.athlete.sportSlug,
      jerseyNumber: numberless ? "" : cleanNumber(state.athlete.jerseyNumber),
      position: state.athlete.position,
      team: state.athlete.team,
      season: state.athlete.season,
      classOf: sr ? state.athlete.classOf : "",
      eventDate: sr ? state.athlete.eventDate : "",
      colors: { primary: state.athlete.colors.primary, secondary: state.athlete.colors.secondary },
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
      marketing: state.consents.marketing,
    },
    photos: files.photos,
    crest: files.crest,
    source,
    website: state.website,
    turnstileToken,
  };
  return { payload, statRows: stats.map((s) => s.row) };
}

// --- errors -----------------------------------------------------------------------------------------

export const FIELD_PREFIX = "fp-";

/** The DOM id of a field, from its error key: `athlete.firstName` → `fp-athlete-firstName`. */
export const fieldId = (key: string): string => `${FIELD_PREFIX}${key.replace(/\./g, "-")}`;
export const errorId = (key: string): string => `${fieldId(key)}-error`;

/** The control that takes focus for an error key (groups focus their first control). */
export function errorTarget(key: string, statRows: number[] = []): string {
  if (key === "products") return `${FIELD_PREFIX}product-${PRODUCTS[0].key}`;
  if (key === "style") return `${FIELD_PREFIX}style-${styles[0].code}`;
  if (key === "photos") return `${FIELD_PREFIX}photos-choose`;
  if (key === "crest") return `${FIELD_PREFIX}crest-choose`;
  if (key === "website") return `${FIELD_PREFIX}submit`;
  const stat = /^athlete\.stats\.(\d+)$/.exec(key);
  if (stat) return `${FIELD_PREFIX}athlete-stats-${statRows[Number(stat[1])] ?? 0}-value`;
  return fieldId(key);
}

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

/** Where the request came from — the landing path, the referrer and any campaign tags. Never a name. */
export function captureSource(pathname: string, search: string, referrer: string): SourceInfo {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  for (const key of SOURCE_KEYS) {
    const v = params.get(key);
    if (v) utm[key] = v.slice(0, 200);
  }
  return { landingPath: pathname.slice(0, 300) || "/free-proof", referrer: referrer.slice(0, 300), utm };
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
