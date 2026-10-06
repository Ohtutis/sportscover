// The /free-proof art map. SERVER ONLY. The page (a server component) calls `freeProofArtMap()` once and passes
// the result to the client form as a prop; the client picks the chosen sport's entry. Never import this module
// (or lib/assets.ts behind it) into a client component: lib/assets.ts carries ~10 KB of provenance notes.
//
// Every image comes from a `free-proof.<slug>.*` key in lib/assets.ts (produced and audited by
// scripts/site-assets.ts: square-corner audit on every card face, sha256 denylist on every source). A key that is
// missing or still `locate` simply leaves its slot out of the map, and the form falls back to the neutral
// placeholder for that item, never another sport's athlete. Every image here shows a FICTIONAL roster athlete,
// so the form mounts <FictionalLabel /> wherever it renders one.
//
//   free-proof.<slug>.card.<CODE>   card FRONT, 5 : 7, square-cut, 600 px wide; CODE is SN CA FS HE SS PR (+ SR)
//   free-proof.<slug>.poster        the sport's poster art, flat, 3 : 4
//   free-proof.<slug>.banner        the sport's banner art, flat
//   free-proof.<slug>.blanket       the sport's blanket laid flat, a mockup (never a draped shot: those stretch the art)
//   free-proof.<slug>.photo.<n>     the same athlete's generated phone photos (n = 1, 4, 2: everyday, smile, in uniform)
//   free-proof.<slug>.identity      the athlete's identity plate, three views (how-it-works card 03)
//   free-proof.<slug>.kit           the athlete's kit plate, laid flat (card 03)

import { FP_PHOTO_NUMBERS, SITE_ASSETS } from "../assets";
import { sports } from "../catalog/sports";

/** The six finishes in lineup order, then Senior Night (only the eight sports with a Senior Night set; ice hockey has none). */
export const FREE_PROOF_FINISH_CODES = ["SN", "CA", "FS", "HE", "SS", "PR", "SR"] as const;
export type FreeProofFinishCode = (typeof FREE_PROOF_FINISH_CODES)[number];

/** One image, as compact as the client needs it: `<Image src alt width={w} height={h}>`. */
export interface FreeProofImage {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** The finish the picture shows (poster / banner / blanket; card faces are keyed by it already). */
  finish?: FreeProofFinishCode;
}

export interface FreeProofSportArt {
  /** Card fronts by finish code; a finish without an audited front is absent. */
  cards: Partial<Record<FreeProofFinishCode, FreeProofImage>>;
  poster?: FreeProofImage;
  banner?: FreeProofImage;
  blanket?: FreeProofImage;
  /**
   * The athlete's phone photos, in the order the hero fans them (back to front: everyday, smile, in uniform) —
   * the "before" the proof is built from. Present only when all three are audited.
   */
  photos?: FreeProofImage[];
  /** The identity plate (three views) and the kit plate: what the athlete was rebuilt from (card 03). */
  identity?: FreeProofImage;
  kit?: FreeProofImage;
}

/** Sport slug → its art. A sport with no audited image at all is absent from the map. */
export type FreeProofArtMap = Record<string, FreeProofSportArt>;

export const freeProofKey = (
  slug: string,
  item: "poster" | "banner" | "blanket" | "identity" | "kit" | `card.${FreeProofFinishCode}` | `photo.${number}`,
) =>
  `free-proof.${slug}.${item}`;

const FINISH_IN_ALT: ReadonlyArray<[FreeProofFinishCode, RegExp]> = [
  ["SN", /Stadium Night/],
  ["CA", /Chrome All-Star/],
  ["FS", /Fire & Smoke/],
  ["HE", /Heritage/],
  ["SS", /Signature Spotlight/],
  ["PR", /Prism Rush/],
  ["SR", /Senior Night/],
];

function image(key: string): FreeProofImage | undefined {
  const a = SITE_ASSETS[key];
  if (!a || a.status !== "verified" || !a.out) return undefined;
  return { src: a.out, w: a.width, h: a.height, alt: a.alt };
}

function withFinish(img: FreeProofImage | undefined): FreeProofImage | undefined {
  if (!img) return undefined;
  const hit = FINISH_IN_ALT.find(([, re]) => re.test(img.alt));
  return hit ? { ...img, finish: hit[0] } : img;
}

/** The compact per-sport art map for /free-proof (all 17 sports; only the ones with audited art appear). */
export function freeProofArtMap(): FreeProofArtMap {
  const map: FreeProofArtMap = {};
  for (const s of sports) {
    const cards: FreeProofSportArt["cards"] = {};
    for (const code of FREE_PROOF_FINISH_CODES) {
      const img = image(freeProofKey(s.slug, `card.${code}`));
      if (img) cards[code] = img;
    }
    const entry: FreeProofSportArt = { cards };
    const poster = withFinish(image(freeProofKey(s.slug, "poster")));
    const banner = withFinish(image(freeProofKey(s.slug, "banner")));
    const blanket = withFinish(image(freeProofKey(s.slug, "blanket")));
    if (poster) entry.poster = poster;
    if (banner) entry.banner = banner;
    if (blanket) entry.blanket = blanket;
    const photos = FP_PHOTO_NUMBERS.map((n) => image(freeProofKey(s.slug, `photo.${n}`)));
    if (photos.every(Boolean)) entry.photos = photos as FreeProofImage[];
    const identity = image(freeProofKey(s.slug, "identity"));
    const kit = image(freeProofKey(s.slug, "kit"));
    if (identity) entry.identity = identity;
    if (kit) entry.kit = kit;
    if (Object.keys(cards).length || poster || banner || blanket) map[s.slug] = entry;
  }
  return map;
}

/**
 * The sports with a per-sport twin of /free-proof (app/(marketing)/free-proof/for/[sport]) — every catalog sport
 * whose example art includes a card front or a poster. next.config.ts rewrites `/free-proof?sport=<one of these>`
 * to its twin, so the list is the rewrite's allow-list too.
 */
export function freeProofSportSlugs(): string[] {
  const map = freeProofArtMap();
  return sports.map((s) => s.slug).filter((slug) => map[slug] && (Object.keys(map[slug].cards).length > 0 || map[slug].poster));
}
