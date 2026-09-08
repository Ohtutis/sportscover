import Image from "next/image";
import { FictionalLabel } from "../../../../components/FictionalLabel";
import { asset, hasAsset, type ImageSpec } from "../../../../lib/assets";
import { sports, type Sport } from "../../../../lib/catalog/sports";

/**
 * Photographs of the product in a life — the room a poster hangs in, the hand a card is held in — as
 * opposed to the flat faces the rest of the page draws (owner review, 2026-09-07: *"poster page
 * missing showing posters in different settings"*).
 *
 * Two rules make this safe to build before the photographs exist:
 *
 * 1. **Nothing is read with `asset()` directly.** `hasAsset()` answers `false` for a key that is still
 *    `locate` AND for a key the manifest has never heard of, so a page can be coded against a key the
 *    asset builder has not landed yet without a chance of throwing or of rendering an empty box.
 * 2. **A caption is never invented.** COPY writes no line for a photograph, so the caption is the
 *    plainest description available: the asset's own alt line up to its first em dash — the clause the
 *    alt patterns (COPY §0.5) use to say what is in the frame, before the finish and the C13 tail. A
 *    page may hand in a better sentence per key; it may never hand in one that is not about that frame.
 */

export interface Showcase {
  key: string;
  spec: ImageSpec;
  /** The sport in the frame, from the key's last segment or from the alt line; undefined when neither names one. */
  sport?: Sport;
  caption: string;
}

/** Longest name first, so "track & field" and "ice hockey" win over their own substrings. */
const BY_NAME_LENGTH = [...sports].sort((a, b) => b.name.length - a.name.length);

/** `wall.baseball` and `life.poster.room.baseball` both name their sport in the last segment. */
export function sportFromKey(key: string): Sport | undefined {
  const slug = key.split(".").pop() ?? "";
  return sports.find((s) => s.slug === slug);
}

/** The sport a frame shows, read back out of its COPY §0.5 alt line. */
export function sportFromAlt(alt: string): Sport | undefined {
  const haystack = alt.toLowerCase();
  return BY_NAME_LENGTH.find((s) => haystack.includes(s.name.toLowerCase()));
}

/** The plainest description of a frame COPY writes no line for: the alt up to its first em dash. */
export function captionFromAlt(alt: string): string {
  const head = alt.split(" — ")[0].trim();
  return head.endsWith(".") ? head : `${head}.`;
}

/** One showcase, or null when the key is still `locate` — or has never been in the manifest at all. */
export function showcase(key: string, captions: Record<string, string> = {}): Showcase | null {
  if (!hasAsset(key)) return null;
  const spec = asset(key);
  return {
    key,
    spec,
    sport: sportFromKey(key) ?? sportFromAlt(spec.alt),
    caption: captions[key] ?? captionFromAlt(spec.alt),
  };
}

/** The first key that has landed. Preference order is the caller's; `null` means: render nothing. */
export function firstShowcase(keys: readonly string[], captions: Record<string, string> = {}): Showcase | null {
  for (const key of keys) {
    const found = showcase(key, captions);
    if (found) return found;
  }
  return null;
}

export interface ShowcaseListOptions {
  /** Stop after this many frames. */
  limit?: number;
  /** Public paths already on the page — the same file is never shown twice (several keys share one output). */
  exclude?: readonly string[];
}

/** Every key that has landed, in the caller's order, one file each. */
export function showcaseList(
  keys: readonly string[],
  captions: Record<string, string> = {},
  { limit, exclude = [] }: ShowcaseListOptions = {},
): Showcase[] {
  const seen = new Set(exclude);
  const out: Showcase[] = [];
  for (const key of keys) {
    if (limit !== undefined && out.length >= limit) break;
    const found = showcase(key, captions);
    if (!found || seen.has(found.spec.src)) continue;
    seen.add(found.spec.src);
    out.push(found);
  }
  return out;
}

export interface ShowcaseFigureProps {
  item: Showcase;
  sizes: string;
  /**
   * Tailwind aspect class for the reserved box, or `"natural"` — the asset's own ratio, so the box
   * reserves exactly the picture and `object-cover` crops nothing.
   *
   * A fixed ratio is right for a ROW of frames, which has to sit on one baseline. It is wrong for a
   * single frame whose subject is the product: `aspect-[4/5]` on a 1.37 : 1 photograph cut 42 % of the
   * width off `/trading-cards` — 276 px from each side, straight through the card the athlete is
   * holding up — and `aspect-[3/2]` on a square one cut 33 % of the height off `/complete-set`, top
   * and bottom, on the page whose H2 is "EVERYTHING YOU GET." (layout audit, 2026-09-08).
   */
  aspect?: string;
  /** Name the sport above the caption (a row of frames whose whole point is that they differ). */
  showSport?: boolean;
  /** A parent renders C13 once for the group. */
  labelled?: boolean;
  /**
   * Draw the caption. Off for a row whose caption would only describe the picture to someone who can
   * already see it (owner review, 2026-09-07): the sentence is the asset's own alt line, so a sighted
   * reader gets it twice and a screen-reader user gets it twice. `showSport` still names the sport,
   * which is the thing a buyer actually needs from a wall gallery.
   */
  showCaption?: boolean;
  className?: string;
}

/**
 * One photograph in a reserved box: `object-cover` inside a fixed ratio, so a frame of any shape
 * reserves exactly its space and the page cannot shift when it loads. Never `priority`, never eager —
 * every one of these sits below the first screen or beside copy that is the LCP.
 */
export function ShowcaseFigure({ item, sizes, aspect = "aspect-[4/3]", showSport = false, labelled = false, showCaption = true, className = "" }: ShowcaseFigureProps) {
  const natural = aspect === "natural";
  return (
    <figure className={className || undefined}>
      <div
        className={`relative ${natural ? "" : aspect} w-full overflow-hidden rounded-ui bg-arena`}
        style={natural ? { aspectRatio: `${item.spec.width} / ${item.spec.height}` } : undefined}
      >
        <Image src={item.spec.src} alt={item.spec.alt} fill sizes={sizes} className="object-cover" />
      </div>
      {showSport && item.sport ? (
        <p className="mt-3 font-body text-small font-bold uppercase tracking-[0.04em] text-ink">{item.sport.name}</p>
      ) : null}
      {showCaption ? (
        <figcaption className="mt-2 max-w-[44ch] font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-muted-text">
          {item.caption}
        </figcaption>
      ) : null}
      {!labelled && item.spec.fictional ? <FictionalLabel className="mt-2" /> : null}
    </figure>
  );
}

export interface ShowcaseRowProps {
  items: Showcase[];
  sizes: string;
  aspect?: string;
  /** Name the sport over each caption. */
  showSport?: boolean;
  /** Draw the per-frame caption (see ShowcaseFigure). */
  showCaption?: boolean;
  className?: string;
}

/**
 * A row of photographs: the DESIGN §2.6 snap scroller under `lg`, a grid above it — two columns for a
 * short row, three once there are enough frames to fill them. C13 once for the whole row (§4.22).
 */
export function ShowcaseRow({ items, sizes, aspect = "aspect-[4/3]", showSport = true, showCaption = true, className = "" }: ShowcaseRowProps) {
  if (!items.length) return null;
  const columns = items.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <div className={className || undefined}>
      <ul className={`-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-5 px-5 pb-2 md:gap-4 lg:mx-0 lg:grid ${columns} lg:gap-6 lg:overflow-visible lg:px-0`}>
        {items.map((item) => (
          <li key={item.key} className="w-[76vw] max-w-[340px] shrink-0 snap-start md:w-[300px] lg:w-auto lg:max-w-none">
            <ShowcaseFigure item={item} sizes={sizes} aspect={aspect} showSport={showSport} showCaption={showCaption} labelled />
          </li>
        ))}
      </ul>
      <FictionalLabel className="mt-4" />
    </div>
  );
}
