import Image from "next/image";
import type { ReactNode } from "react";
import { assetOrNull, type ImageSpec } from "../lib/assets";
import { PROOF_PATH, PROOF_PATH_LABEL } from "../lib/copy/canon";
import { INTAKE_COPY } from "../lib/intake/copy";
import { FictionalLabel } from "./FictionalLabel";
import { CheckCircleIcon } from "./icons";

/**
 * The proof-first path, four steps (D29 — owner, 2026-10-04: "make everything much clearer … the parent
 * must grasp the path at a glance"). ONE component in two shapes, so the path reads the same on every
 * page that carries it:
 *
 * - `cards` (default) — the four how-it-works cards (`INTAKE_COPY.stepCards`): a big Anton numeral, a
 *   two-word title and one line, and beside the numeral the picture of that step (owner review
 *   2026-10-06: "a visual is missing where I circled"). 01 the product tiles · 02 the parent's phone
 *   photos · 03 the watermarked proof those photos became · 04 the approval tick. 4 across from `lg`,
 *   2 × 2 below it (one column under 375 px, where a card would drop under 160 px).
 * - `list` — the same four steps as lines of record (`PROOF_PATH`): a hairline numeral ring, the step and
 *   its detail. Nothing to press, no accent, no image.
 *
 * `ProofPathBand` is how the money pages mount it (owner review 2026-10-06: the list wedged under the
 * hero CTA "looks dropped in"): its own band directly under the hero, the section rule with the label in
 * the index slot, the cards, and C13 once for the row — every picture in it is a fictional roster athlete.
 *
 * The pictures tell ONE athlete's story: the phone photos are Marcus Ellison's (`hero.story.1.before.*`)
 * and so is the proof (`show.proof.basketball`, his watermarked proof sheet). `home.process.proof` is a
 * baseball proof of a different athlete, and a photo of one child beside the proof of another would be a
 * claim we do not make (lib/assets.ts notes the same). A key that is not verified renders no picture —
 * never a stand-in from someone else.
 *
 * Server-rendered, no JS, no motion; every picture is lazy, decorative (`alt=""` — the title beside it
 * carries the meaning) and sits in a box of fixed size, so nothing shifts when it arrives.
 */

/** The phone photos (step 02) and the proof (step 03) — one athlete, see above. */
export const STEP_PHOTO_KEYS = ["hero.story.1.before.2", "hero.story.1.before.1"] as const;
export const STEP_PROOF_KEY = "show.proof.basketball";
/** Step 01: the product tiles of /free-proof's step 1 (lib/assets.ts `product.*`). */
export const STEP_PRODUCT_KEYS = ["product.cards", "product.poster"] as const;

export type ProofPathVariant = "cards" | "list";

export interface ProofPathProps {
  variant?: ProofPathVariant;
  className?: string;
}

/** The DOM id of the band's label (the band and its list are both named by it). */
export const PROOF_BAND_LABEL_ID = "proof-path-label";

/** Each step's picture box: 84 × 64 on a phone, 112 × 80 from md, 128 × 96 from xl (≥ 56 / ≥ 72 px tall). */
const VISUAL_BOX = "relative h-16 w-[5.25rem] shrink-0 md:h-20 md:w-28 xl:h-24 xl:w-32";
/** The thumbs are photographs of the product, the parent's photos and the proof sheet: a print laid on the page — square corners, a white ring, the card shadow (the home hero's photo stack, smaller). */
const THUMB = "absolute overflow-hidden rounded-none bg-hairline shadow-[var(--shadow-card-stock)] ring-[3px] ring-white";
const THUMB_SIZES = "(min-width: 1280px) 80px, (min-width: 768px) 70px, 52px";
const PROOF_SIZES = "(min-width: 1280px) 128px, (min-width: 768px) 112px, 84px";

const maybe = (key: string): ImageSpec | null => assetOrNull(key);

function Thumb({ image, className, sizes = THUMB_SIZES, contain = false }: { image: ImageSpec; className: string; sizes?: string; contain?: boolean }) {
  return (
    <span className={`${THUMB} ${className}`}>
      <Image src={image.src} alt="" fill sizes={sizes} className={contain ? "object-contain" : "object-cover"} />
    </span>
  );
}

/** The picture for step `i` (0-based), or null when its keys are not verified. */
function stepVisual(i: number): { node: ReactNode; fictional: boolean } | null {
  if (i === 0) {
    const [cards, poster] = STEP_PRODUCT_KEYS.map(maybe);
    if (!cards || !poster) return null;
    return {
      fictional: cards.fictional || poster.fictional,
      node: (
        <>
          <Thumb image={poster} className="left-0 top-0 aspect-square w-[62%] -rotate-3" />
          <Thumb image={cards} className="bottom-0 right-0 aspect-square w-[62%] rotate-3" />
        </>
      ),
    };
  }
  if (i === 1) {
    const photos = STEP_PHOTO_KEYS.map(maybe).filter((p): p is ImageSpec => p !== null);
    if (photos.length < 2) return null;
    return {
      fictional: photos.some((p) => p.fictional),
      node: (
        <>
          <Thumb image={photos[0]} className="left-[8%] top-[4%] aspect-[3/4] w-[46%] -rotate-6" />
          <Thumb image={photos[1]} className="right-[6%] top-[2%] aspect-[3/4] w-[46%] rotate-[5deg]" />
        </>
      ),
    };
  }
  if (i === 2) {
    const proof = maybe(STEP_PROOF_KEY);
    if (!proof) return null;
    // The proof sheet at its own ratio (1.3 : 1, the box is 1.31 : 1): never cropped — the watermark is the point.
    return { fictional: proof.fictional, node: <Thumb image={proof} className="inset-0" sizes={PROOF_SIZES} contain /> };
  }
  return {
    fictional: false,
    node: (
      <span className="absolute inset-0 flex items-center justify-center text-ink">
        <CheckCircleIcon strokeWidth={1.25} className="h-full w-auto" />
      </span>
    ),
  };
}

function Cards({ className }: { className: string }) {
  return (
    <ol
      aria-label={PROOF_PATH_LABEL}
      className={`grid auto-rows-fr grid-cols-1 gap-3 min-[375px]:grid-cols-2 sm:gap-4 lg:grid-cols-4 ${className}`.trim()}
    >
      {INTAKE_COPY.stepCards.map((card, i) => {
        const visual = stepVisual(i);
        return (
          <li key={card.n} data-step-card="" className="flex min-w-0 flex-col rounded-[20px] border border-hairline bg-white p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-2">
              <span aria-hidden="true" className="font-display text-[2.5rem] leading-none tabular-nums text-ink md:text-[3.25rem]">
                {card.n}
              </span>
              {visual ? (
                <span aria-hidden="true" data-step-visual="" className={VISUAL_BOX}>
                  {visual.node}
                </span>
              ) : null}
            </div>
            <p className="mt-4 font-body text-[1.0625rem] font-bold leading-snug text-ink md:mt-6">{card.title}</p>
            <p className="mt-1 max-w-[60ch] font-body text-small text-muted-text">{card.line}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** Whether the cards show any fictional athlete (then C13 rides under the row, once). */
export function proofPathShowsFictional(): boolean {
  return INTAKE_COPY.stepCards.some((_, i) => stepVisual(i)?.fictional);
}

function List({ className }: { className: string }) {
  return (
    <div data-proof-path="" className={`max-w-[40rem] ${className}`.trim()}>
      <p aria-hidden="true" className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
        {PROOF_PATH_LABEL}
      </p>
      <ol aria-label={PROOF_PATH_LABEL} className="mt-3 grid gap-y-3">
        {PROOF_PATH.map((s) => (
          <li key={s.step} className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
            <span
              aria-hidden="true"
              className="inline-flex size-7 items-center justify-center rounded-full border border-ink font-display text-[0.875rem] leading-none tabular-nums text-ink"
            >
              {s.step}
            </span>
            <p className="pt-0.5 font-body text-[0.9375rem] leading-snug text-pretty text-ink">
              <span className="font-bold">{s.title}</span>
              <span className="text-muted-text"> — {s.detail}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProofPath({ variant = "cards", className = "" }: ProofPathProps) {
  return variant === "list" ? <List className={className} /> : <Cards className={className} />;
}

export interface ProofPathBandProps {
  /**
   * The page's own container, so the band's rule runs exactly as wide as the hero above it. `none` when
   * the band sits inside a section that already has one (the family pages, between the hero row and the
   * tier ladder of section 01).
   */
  container?: "site" | "gallery" | "none";
  /** No bottom padding: what follows opens on its own rule and its own air (/free-proof's step 1). */
  flushBottom?: boolean;
  className?: string;
}

/**
 * The band under a money-page hero (owner review 2026-10-06). It carries no index — like the hero, it is
 * outside the numbered spine — so the label sits on the rule where an index would. `py-16 md:py-20
 * lg:py-24` is its own air: with the hero's bottom padding above it, the clear ground between the
 * hero's last element and this rule is never under 64 px.
 */
export function ProofPathBand({ container = "gallery", flushBottom = false, className = "" }: ProofPathBandProps) {
  const padding = flushBottom ? "pt-16 md:pt-20 lg:pt-24" : "py-16 md:py-20 lg:py-24";
  const body = (
    <>
      <div data-proof-band-rule="" className="border-t border-hairline pt-3">
        <p id={PROOF_BAND_LABEL_ID} className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
          {PROOF_PATH_LABEL}
        </p>
      </div>
      <ProofPath className="mt-6 lg:mt-8" />
      {proofPathShowsFictional() ? <FictionalLabel className="mt-6" /> : null}
    </>
  );
  return (
    <section data-proof-band="" aria-labelledby={PROOF_BAND_LABEL_ID} className={`${padding} ${className}`.trim()}>
      {container === "none" ? body : <div className={container === "site" ? "container-site" : "container-gallery"}>{body}</div>}
    </section>
  );
}
