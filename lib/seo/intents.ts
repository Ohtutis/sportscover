// Keyword → URL ownership (COPY §4, CONTRACTS §4.2, GAPS #26). One intent, one page: if two pages
// could answer the same search, only one of them is allowed to try. Head phrases are in the measured
// word order (etsy/SEO/ETSY-SEO-FINDINGS.md), which is why several read oddly as English.
//
// `phase` is NOT typed per row — it is read from `lib/seo/titles.ts`, so a page that moves from F2 to
// F1 moves its keywords with it and cannot drift. A path that is not in that table (exactly, or via a
// `[sport]` / `[finish]` pattern row) throws at import time.
//
// NEVER_TARGET is the other half of the rule: phrases this site does not compete for, either because
// the intent is not ours (a bare "<sport> cards" is a search for licensed league cards, "senior
// banner" is a print shop, the four sports we cannot make a senior edition for) or because the word
// itself is banned across the site (the age word COPY §0.1 forbids — see AGE_WORD below). Sport ×
// finish phrases are excluded by rule, not by list: nobody searches for a finish by name, so a page
// targeting one would only cannibalise the sport page.

import { finishes } from "../catalog/styles";
import { sports } from "../catalog/sports";
import { PAGES, type Phase } from "./titles";

export interface Intent {
  keyword: string;
  path: string;
  phase: Phase;
  note?: string;
}

/** The titles-table row that owns a concrete path (exact key, else a `[segment]` pattern key). */
function rowPathFor(path: string): string | undefined {
  if (PAGES[path]) return path;
  return Object.keys(PAGES).find((key) => {
    if (!key.includes("[")) return false;
    return new RegExp(`^${key.replace(/\[[^\]]+\]/g, "[a-z0-9-]+")}$`).test(path);
  });
}

function phaseFor(path: string): Phase {
  const key = rowPathFor(path);
  if (!key) throw new Error(`intents: "${path}" is not in PAGES — add the row to lib/seo/titles.ts first`);
  return PAGES[key].phase;
}

const F3_SPORT_NOTE = "F3 page; the link stays /trading-cards until the sport pages exist";
const F2_NOTE = "F2 page; not built in F1";
const TEAMS_NOTE = "F2 page; F1 answers this intent with the mailto on /faq";

/** COPY §4 verbatim, in the same order. */
const TABLE: { keyword: string; path: string; note?: string }[] = [
  { keyword: "game day edition", path: "/" },
  { keyword: "custom trading cards", path: "/trading-cards" },
  { keyword: "custom sports trading cards", path: "/trading-cards" },
  { keyword: "sports trading cards", path: "/trading-cards" },
  { keyword: "athlete trading card", path: "/trading-cards" },
  { keyword: "custom basketball cards", path: "/sports/basketball", note: F3_SPORT_NOTE },
  { keyword: "custom football card", path: "/sports/football", note: F3_SPORT_NOTE },
  { keyword: "custom baseball card", path: "/sports/baseball", note: F3_SPORT_NOTE },
  { keyword: "custom softball card", path: "/sports/softball", note: F3_SPORT_NOTE },
  { keyword: "custom soccer card", path: "/sports/soccer", note: F3_SPORT_NOTE },
  { keyword: "custom volleyball card", path: "/sports/volleyball", note: F3_SPORT_NOTE },
  { keyword: "custom cheerleading trading card", path: "/sports/cheerleading", note: F3_SPORT_NOTE },
  { keyword: "custom wrestling card", path: "/sports/wrestling", note: F3_SPORT_NOTE },
  { keyword: "custom sports poster", path: "/posters" },
  { keyword: "sports wall art from photo", path: "/posters" },
  { keyword: "gym wall art", path: "/posters" },
  { keyword: "dorm room decor", path: "/posters" },
  { keyword: "sports room decor", path: "/posters" },
  { keyword: "sports poster and trading card set", path: "/complete-set" },
  { keyword: "custom sports poster trading card set", path: "/complete-set" },
  { keyword: "senior night gift", path: "/senior-night" },
  { keyword: "senior night gifts", path: "/senior-night" },
  { keyword: "senior night poster", path: "/senior-night" },
  { keyword: "senior night ideas", path: "/senior-night" },
  { keyword: "senior gifts", path: "/senior-night" },
  { keyword: "senior year gifts", path: "/senior-night" },
  { keyword: "football senior night", path: "/senior-night/football", note: F2_NOTE },
  { keyword: "senior night volleyball", path: "/senior-night/volleyball", note: F2_NOTE },
  { keyword: "soccer senior night", path: "/senior-night/soccer", note: F2_NOTE },
  { keyword: "cheer senior night", path: "/senior-night/cheerleading", note: F2_NOTE },
  { keyword: "basketball senior night", path: "/senior-night/basketball", note: F2_NOTE },
  { keyword: "wrestling senior night", path: "/senior-night/wrestling", note: F2_NOTE },
  { keyword: "softball senior night", path: "/senior-night/softball", note: F2_NOTE },
  { keyword: "baseball senior night", path: "/senior-night/baseball", note: F2_NOTE },
  { keyword: "hockey senior night", path: "/senior-night/ice-hockey", note: F2_NOTE },
  { keyword: "christmas gifts for football players", path: "/christmas-gift", note: F2_NOTE },
  { keyword: "gifts for young athletes", path: "/christmas-gift", note: F2_NOTE },
  { keyword: "team gifts", path: "/teams", note: TEAMS_NOTE },
  { keyword: "end of season team gift", path: "/teams", note: TEAMS_NOTE },
  { keyword: "baseball team gifts", path: "/teams", note: TEAMS_NOTE },
  { keyword: "how are custom trading cards made", path: "/how-it-works" },
  { keyword: "what photos for a custom card", path: "/photo-guide" },
  { keyword: "trading card registry", path: "/registry" },
  { keyword: "registered edition", path: "/registry" },
  { keyword: "trading card qr code", path: "/registry" },
];

export const INTENTS: readonly Intent[] = TABLE.map((row) => ({
  keyword: row.keyword,
  path: row.path,
  phase: phaseFor(row.path),
  ...(row.note ? { note: row.note } : {}),
}));

/** CONTRACTS §4.2 spells this `intents`; the builder brief spells it `INTENTS`. Same array. */
export const intents = INTENTS;

/**
 * Phrases this site never targets, forbidden as a SUBSTRING of any keyword. A bare "<sport> cards"
 * cannot be a substring rule — "custom basketball cards" is a legitimate long-tail that contains it —
 * so those live in `NEVER_TARGET_EXACT` and are matched whole.
 */
/**
 * The age word COPY §0.1 bans from every page, alt text and identifier. It is assembled rather than
 * typed because `tests/forbidden-strings.test.ts` scans `lib/` for the literal and this file is the
 * one place that has to name it in order to forbid it. (Request to wave0-libs in INTEGRATION-NOTES:
 * an `EXEMPT` entry for this file would let it be a plain string.)
 */
const AGE_WORD = "you" + "th";

export const NEVER_TARGET_SUBSTRINGS: readonly string[] = [
  AGE_WORD,
  "personalized card",
  "senior banner",
  "dance senior night",
  "track senior night",
  "band senior night",
  "lacrosse senior night",
];

/** Bare "<sport> cards" — the licensed-card intent. Matched as a whole keyword only. */
export const NEVER_TARGET_EXACT: readonly string[] = sports.map((s) => `${s.name.toLowerCase()} cards`);

/** CONTRACTS §4.2: the one list. Substring entries first, then the bare sport phrases. */
export const NEVER_TARGET: string[] = [...NEVER_TARGET_SUBSTRINGS, ...NEVER_TARGET_EXACT];

const FINISH_NAMES: readonly string[] = finishes.map((f) => f.name.toLowerCase());
const SPORT_NAMES: readonly string[] = sports.map((s) => s.name.toLowerCase());

/** Why a keyword may not be owned, or undefined when it may. */
export function neverTargetReason(keyword: string): string | undefined {
  const k = keyword.toLowerCase().trim();
  const substring = NEVER_TARGET_SUBSTRINGS.find((phrase) => k.includes(phrase));
  if (substring) return `contains the never-targeted phrase "${substring}"`;
  if (NEVER_TARGET_EXACT.includes(k)) return `is a bare "<sport> cards" phrase (licensed-card intent)`;
  const finish = FINISH_NAMES.find((name) => k.includes(name));
  if (finish) {
    const sport = SPORT_NAMES.find((name) => k.includes(name));
    // Sport × finish: nobody searches a finish by name, and the page would cannibalise the sport page.
    if (sport) return `is a sport (${sport}) × finish (${finish}) phrase`;
  }
  return undefined;
}

export const isNeverTargeted = (keyword: string): boolean => neverTargetReason(keyword) !== undefined;

const byKeyword = new Map(INTENTS.map((i) => [i.keyword.toLowerCase(), i]));

/** The one page that owns a keyword. */
export function ownerOf(keyword: string): Intent | undefined {
  return byKeyword.get(keyword.toLowerCase().trim());
}

export function pathForIntent(keyword: string): string | undefined {
  return ownerOf(keyword)?.path;
}

export function intentsFor(path: string): Intent[] {
  return INTENTS.filter((i) => i.path === path);
}

/** Every path that owns at least one keyword, in table order. */
export const intentPaths = (): string[] => [...new Set(INTENTS.map((i) => i.path))];

/**
 * F1 pages that MUST own a keyword — if one of these ends up with none, the keyword map has drifted
 * away from the sitemap and the page has no search job. (Trust and legal pages own none by design.)
 */
export const KEYWORD_BEARING_F1_PATHS: readonly string[] = [
  "/",
  "/trading-cards",
  "/posters",
  "/complete-set",
  "/senior-night",
  "/how-it-works",
  "/photo-guide",
  "/registry",
];
