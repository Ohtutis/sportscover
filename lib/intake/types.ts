// The free-proof request: one schema, one validator, shared by the form (client) and the API (server).
//
// `parseProofRequest` is deliberately plain TypeScript (no schema library): it returns the normalised
// value or a map of field path → sentence a parent can act on. Field limits are SERVER limits —
// generous — not the design limits in docs/ORDER-FIELDS-SPEC.md (12 / 9 / 25 …), which the form shows
// as hints: the name is never shortened, the type steps down (owner rule 2026-08-23).
//
// Consent sentences are the spec's (SITE-BUILD-SPEC §4.14 step 3, D16) with two words changed for a
// request that may never become an order ("when my request closes — within 30 days if I don't go
// ahead"). Each consent is stored with CONSENT_TEXT_VERSION so a later rewording never rewrites what
// a parent actually agreed to.

import { sportBySlug, isNumberless, sports } from "../catalog/sports";
import { styles, type StyleCode } from "../catalog/styles";
import { optionOf, productByKey, PRODUCT_KEYS, type ProductKey } from "./products";

export const INTAKE_VERSION = "2026-10-04";
export const CONSENT_TEXT_VERSION = "2026-10-04";

/** 4–10 photos (C5, the canon sentence), originals up to 25 MB each; HEIC arrives with an empty MIME type on some browsers, so the extension counts too. */
export const PHOTO_RULES = {
  min: 4,
  max: 10,
  maxBytes: 25 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"],
  extensions: [".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"],
} as const;

export const CREST_RULES = {
  maxBytes: 10 * 1024 * 1024,
  types: [...PHOTO_RULES.types, "image/svg+xml"],
  extensions: [...PHOTO_RULES.extensions, ".svg"],
} as const;

export type ConsentKey = "guardian" | "biometric" | "license" | "marketing" | "crest";

export interface ConsentText {
  key: ConsentKey;
  /** Required for every request (guardian, biometric, license); `crest` is required only when a crest file is attached. */
  required: boolean;
  text: string;
}

export const CONSENTS: Record<ConsentKey, ConsentText> = {
  guardian: {
    key: "guardian",
    required: true,
    text: "I am the athlete, or the parent/legal guardian of the athlete, and I have the right to share these photos.",
  },
  biometric: {
    key: "biometric",
    required: true,
    text: "I consent to Game Day Edition creating a facial-geometry measurement from the photos I upload, used only to check that the artwork looks like the athlete, never shared, and destroyed when my request closes — within 30 days if I don't go ahead. Written policy: /privacy/biometric.",
  },
  license: {
    key: "license",
    required: true,
    text: "I grant permission to create artwork from these photos and the athlete's likeness for this request.",
  },
  marketing: {
    key: "marketing",
    required: false,
    text: "You may show my athlete's finished card or poster in marketing (name optional).",
  },
  crest: {
    key: "crest",
    required: false,
    text: "This is our school's or club's own crest and we are allowed to use it. We never reproduce league or governing-body marks (NFL, FIFA, NCAA, Olympic).",
  },
};

export const CONSENT_ORDER: readonly ConsentKey[] = ["guardian", "biometric", "license", "crest", "marketing"];

export const STYLE_RECOMMEND = "recommend" as const;
export type StyleChoice = StyleCode | typeof STYLE_RECOMMEND;

export interface ProductChoice {
  product: ProductKey;
  option: string;
  quantity: number;
}

export interface StatInput {
  value: string;
  label: string;
}

export interface AthleteInput {
  firstName: string;
  lastName: string;
  sportSlug: string;
  /** Digits only; empty for a numberless sport or when the athlete has none. */
  jerseyNumber: string;
  position: string;
  team: string;
  /** Four-digit season year. */
  season: string;
  /** Senior Night only: four-digit class year. */
  classOf: string;
  /** Senior Night only, optional: the night itself, YYYY-MM-DD. */
  eventDate: string;
  colors: { primary: string; secondary: string };
  headline: string;
  stats: StatInput[];
  notes: string;
}

export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  country: string;
  /** Optional "need it by" date, YYYY-MM-DD. */
  neededBy: string;
}

export interface FileMeta {
  name: string;
  size: number;
  type: string;
}

export interface SourceInfo {
  landingPath: string;
  referrer: string;
  utm: Record<string, string>;
}

/** What the browser sends. Everything optional at the type level — the validator decides. */
export interface ProofRequestInput {
  products?: unknown;
  style?: unknown;
  athlete?: unknown;
  contact?: unknown;
  consents?: unknown;
  photos?: unknown;
  crest?: unknown;
  source?: unknown;
  /** Honeypot — a real browser leaves it empty. */
  website?: unknown;
  turnstileToken?: unknown;
}

/** The validated, normalised request. */
export interface ProofRequest {
  version: typeof INTAKE_VERSION;
  products: ProductChoice[];
  style: StyleChoice;
  athlete: AthleteInput;
  contact: ContactInput;
  consents: Record<ConsentKey, boolean>;
  consentTextVersion: typeof CONSENT_TEXT_VERSION;
  photos: FileMeta[];
  crest: FileMeta | null;
  source: SourceInfo;
  turnstileToken: string;
}

export type ParseResult = { ok: true; value: ProofRequest } | { ok: false; errors: Record<string, string> };

// --- helpers --------------------------------------------------------------------------------------

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR = /^\d{4}$/;

export const CURRENT_SEASON = "2026";
export const SEASON_YEARS: readonly string[] = ["2025", "2026", "2027"];
export const CLASS_YEARS: readonly string[] = ["2026", "2027", "2028", "2029", "2030"];
export const MAX_STATS = 3;
export const MAX_QUANTITY = 10;

export function isPhotoFile(meta: FileMeta, rules: { maxBytes: number; types: readonly string[]; extensions: readonly string[] } = PHOTO_RULES): boolean {
  if (!meta.name || meta.size <= 0 || meta.size > rules.maxBytes) return false;
  const lower = meta.name.toLowerCase();
  const byType = Boolean(meta.type) && rules.types.includes(meta.type);
  const byExtension = rules.extensions.some((ext) => lower.endsWith(ext));
  return byType || byExtension;
}

function parseFile(v: unknown): FileMeta | null {
  const o = obj(v);
  const name = str(o.name, 200);
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.floor(o.size) : 0;
  const type = str(o.type, 100);
  return name ? { name, size, type } : null;
}

/**
 * Validates and normalises a request. Every error is a sentence addressed to the parent, keyed by the
 * field path the form uses for its messages (`products`, `athlete.firstName`, `consents.biometric`, …).
 */
export function parseProofRequest(raw: unknown): ParseResult {
  const input = obj(raw) as ProofRequestInput;
  const errors: Record<string, string> = {};

  // Honeypot: a filled "website" field is a bot. The message is deliberately dull.
  if (str(input.website, 10)) errors.website = "Please try again.";

  // Products — one to four, each product once, option known, quantity 1–10.
  const products: ProductChoice[] = [];
  const seen = new Set<string>();
  for (const item of arr(input.products)) {
    const o = obj(item);
    const productKey = str(o.product, 20);
    const optionKey = str(o.option, 20);
    const product = productByKey(productKey);
    if (!product || !PRODUCT_KEYS.includes(product.key) || seen.has(product.key)) continue;
    const option = optionOf(product, optionKey);
    if (!option) continue;
    const q = typeof o.quantity === "number" ? Math.floor(o.quantity) : 1;
    products.push({ product: product.key, option: option.key, quantity: Math.min(MAX_QUANTITY, Math.max(1, q)) });
    seen.add(product.key);
  }
  if (!products.length) errors.products = "Choose at least one thing to make — cards, a poster, a banner or a blanket.";

  // Style — a style code or "recommend".
  const styleRaw = str(input.style, 12);
  const style: StyleChoice | null = styleRaw === STYLE_RECOMMEND ? STYLE_RECOMMEND : (styles.find((s) => s.code === styleRaw)?.code ?? null);
  if (!style) errors.style = "Pick a style, or let us recommend one.";

  // Athlete
  const a = obj(input.athlete);
  const sport = sportBySlug(str(a.sportSlug, 40));
  const firstName = str(a.firstName, 40);
  const lastName = str(a.lastName, 40);
  if (!firstName) errors["athlete.firstName"] = "The athlete's first name goes on the card.";
  if (!lastName) errors["athlete.lastName"] = "The athlete's last name goes on the card.";
  if (!sport) errors["athlete.sportSlug"] = "Choose the sport.";
  let jerseyNumber = str(a.jerseyNumber, 4).replace(/\D/g, "").slice(0, 3);
  if (sport && isNumberless(sport)) jerseyNumber = "";
  const season = str(a.season, 4) || CURRENT_SEASON;
  if (!YEAR.test(season) || !SEASON_YEARS.includes(season)) errors["athlete.season"] = "Choose the season year.";
  const classOf = str(a.classOf, 4);
  if (style === "SR" && !(YEAR.test(classOf) && CLASS_YEARS.includes(classOf))) errors["athlete.classOf"] = "Senior Night editions carry the class year — choose it.";
  const eventDate = str(a.eventDate, 10);
  if (eventDate && !ISO_DATE.test(eventDate)) errors["athlete.eventDate"] = "Enter the senior night date as a date.";
  const colors = obj(a.colors);
  const primary = str(colors.primary, 7);
  const secondary = str(colors.secondary, 7);
  if (primary && !HEX.test(primary)) errors["athlete.colors.primary"] = "Pick the team's main color.";
  if (secondary && !HEX.test(secondary)) errors["athlete.colors.secondary"] = "Pick the team's second color.";
  const stats: StatInput[] = arr(a.stats)
    .map((s) => ({ value: str(obj(s).value, 12), label: str(obj(s).label, 16) }))
    .filter((s) => s.value || s.label)
    .slice(0, MAX_STATS);
  for (const [i, s] of stats.entries()) {
    if (!s.value || !s.label) errors[`athlete.stats.${i}`] = "A stat needs both a number and a label, e.g. 18.4 and PPG.";
  }

  // Contact
  const c = obj(input.contact);
  const name = str(c.name, 80);
  const email = str(c.email, 254).toLowerCase();
  if (!name) errors["contact.name"] = "Your name, so we know who to write to.";
  if (!EMAIL.test(email)) errors["contact.email"] = "Enter the email address the proof should go to.";
  const neededBy = str(c.neededBy, 10);
  if (neededBy && !ISO_DATE.test(neededBy)) errors["contact.neededBy"] = "Enter the date you need it by as a date.";

  // Files
  const photos = arr(input.photos).map(parseFile).filter((f): f is FileMeta => Boolean(f));
  if (photos.length < PHOTO_RULES.min || photos.length > PHOTO_RULES.max) {
    errors.photos = `Send ${PHOTO_RULES.min}–${PHOTO_RULES.max} photos — you have ${photos.length}.`;
  } else if (!photos.every((p) => isPhotoFile(p))) {
    errors.photos = "Every photo must be a JPG, PNG, HEIC or WebP under 25 MB — send the original file, not a screenshot.";
  }
  const crest = input.crest ? parseFile(input.crest) : null;
  if (crest && !isPhotoFile(crest, CREST_RULES)) errors.crest = "The crest must be a PNG, SVG, JPG, HEIC or WebP under 10 MB.";

  // Consents
  const consentsRaw = obj(input.consents);
  const consents = Object.fromEntries(CONSENT_ORDER.map((k) => [k, consentsRaw[k] === true])) as Record<ConsentKey, boolean>;
  for (const k of CONSENT_ORDER) {
    const required = CONSENTS[k].required || (k === "crest" && Boolean(crest));
    if (required && !consents[k]) errors[`consents.${k}`] = "This one is required before we can build the proof.";
  }

  // Source (never required, always bounded)
  const s = obj(input.source);
  const utmRaw = obj(s.utm);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"]) {
    const v = str(utmRaw[key], 200);
    if (v) utm[key] = v;
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      version: INTAKE_VERSION,
      products,
      style: style as StyleChoice,
      athlete: {
        firstName,
        lastName,
        sportSlug: (sport as NonNullable<typeof sport>).slug,
        jerseyNumber,
        position: str(a.position, 40),
        team: str(a.team, 60),
        season,
        classOf: style === "SR" ? classOf : "",
        eventDate: style === "SR" ? eventDate : "",
        colors: { primary, secondary },
        headline: str(a.headline, 60),
        stats,
        notes: str(a.notes, 1000),
      },
      contact: { name, email, phone: str(c.phone, 40), country: str(c.country, 56) || "United States", neededBy },
      consents,
      consentTextVersion: CONSENT_TEXT_VERSION,
      photos,
      crest,
      source: { landingPath: str(s.landingPath, 300) || "/free-proof", referrer: str(s.referrer, 300), utm },
      turnstileToken: str(input.turnstileToken, 2048),
    },
  };
}

/** The sports the form offers, in roster order (every sport — the proof-first path has no listing dependency). */
export const INTAKE_SPORTS = sports;

/** "GDE-R-20261004-7KQ2MX": a request id — date-sorted, unguessable enough to be a reference, never a card ID. */
export function makeRequestId(now: Date = new Date(), random: () => number = Math.random): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, "");
  const alphabet = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) suffix += alphabet[Math.floor(random() * alphabet.length)];
  return `GDE-R-${d}-${suffix}`;
}

export const REQUEST_ID = /^GDE-R-\d{8}-[A-Z2-9]{6}$/;
