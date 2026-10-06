import Image from "next/image";
import type { ReactNode } from "react";
import { assetOrNull, type ImageSpec } from "../lib/assets";
import { PROOF_PATH, PROOF_PATH_LABEL } from "../lib/copy/canon";
import { INTAKE_COPY } from "../lib/intake/copy";
import { FictionalLabel } from "./FictionalLabel";
import { StepPhotos, StepTick } from "./intake/visuals";

/**
 * The proof-first path, four steps (D29 — owner, 2026-10-04: "make everything much clearer … the parent
 * must grasp the path at a glance"). ONE component in two shapes, so the path reads the same on every
 * page that carries it:
 *
 * - `cards` (default) — the four how-it-works cards (`INTAKE_COPY.stepCards`): the picture of the step
 *   filling the card's upper area, then a big Anton numeral, a two-word title and one line. 4 across from
 *   `lg`, 2 × 2 below it (one column under 375 px, where a card would drop under 160 px).
 * - `list` — the same four steps as lines of record (`PROOF_PATH`): a hairline numeral ring, the step and
 *   its detail. Nothing to press, no accent, no image.
 *
 * v4 (owner review 2026-10-06, evening: "the pictures are far too small"): each picture fills the top of
 * its card — 140 px tall on a phone, 200 px at 1440 (it was 64 / 96 px beside the numeral) — and the
 * parent's photos (02) are always the grey "your photo" prints drawn in code, never another child. On
 * /free-proof the page hands its own pictures in (`visuals`): the chosen sport's poster and card (01), the
 * same card under a CSS watermark (03). Every other page keeps the defaults below: the product tiles (01)
 * and the real watermarked proof sheet (03).
 *
 * `ProofPathBand` is how the money pages mount it (owner review 2026-10-06: the list wedged under the
 * hero CTA "looks dropped in"): its own band directly under the hero, the section rule with the label in
 * the index slot, the cards, and C13 once for the row whenever a picture shows a fictional athlete.
 *
 * Server-rendered, no JS, no motion; every picture is lazy, decorative (`alt=""` — the title under it
 * carries the meaning) and sits in a box of fixed size, so nothing shifts when it arrives.
 */

/** Step 03 by default: the real watermarked proof sheet (Marcus Ellison's, `show.proof.basketball`). */
export const STEP_PROOF_KEY = "show.proof.basketball";
/** Step 01 by default: the product tiles of /free-proof's product step (lib/assets.ts `product.*`). */
export const STEP_PRODUCT_KEYS = ["product.cards", "product.poster"] as const;
/**
 * Step 02 by default: two of Marcus Ellison's phone photos — the athlete whose proof step 03 shows — the smile
 * behind, the photo in uniform on top (owner review 2026-10-07: "too many faceless grey cards"). The grey
 * "your photo" prints are the fallback when either key is not verified.
 */
export const STEP_PHOTO_KEYS = ["hero.story.1.before.4", "hero.story.1.before.1"] as const;

export type ProofPathVariant = "cards" | "list";

export interface ProofPathProps {
  variant?: ProofPathVariant;
  /**
   * The four pictures, in step order, when a page draws its own (/free-proof: the chosen sport). A null
   * slot keeps the default picture for that step. Without it, the defaults below.
   */
  visuals?: readonly (ReactNode | null)[];
  className?: string;
}

/** The DOM id of the band's label (the band and its list are both named by it). */
export const PROOF_BAND_LABEL_ID = "proof-path-label";

/** Each step's picture box: the card's full inner width, 140 px tall on a phone, 160 from sm, 176 from lg, 200 from xl. */
const VISUAL_BOX = "relative h-[8.75rem] w-full shrink-0 sm:h-40 lg:h-44 xl:h-[12.5rem]";
/** The thumbs are photographs of the product and the proof sheet: a print laid on the page — square corners, a white ring, the card shadow. */
const THUMB = "absolute overflow-hidden rounded-none bg-hairline shadow-[var(--shadow-card-stock)] ring-[3px] ring-white";
const THUMB_SIZES = "(min-width: 1280px) 150px, (min-width: 768px) 130px, 104px";
const PROOF_SIZES = "(min-width: 1280px) 260px, (min-width: 1024px) 200px, (min-width: 768px) 320px, 140px";

const maybe = (key: string): ImageSpec | null => assetOrNull(key);

function Thumb({ image, className, sizes = THUMB_SIZES, contain = false }: { image: ImageSpec; className: string; sizes?: string; contain?: boolean }) {
  return (
    <span className={`${THUMB} ${className}`}>
      <Image src={image.src} alt="" fill sizes={sizes} className={contain ? "object-contain" : "object-cover"} />
    </span>
  );
}

/** The default picture for step `i` (0-based), or null when its keys are not verified. */
function stepVisual(i: number): { node: ReactNode; fictional: boolean } | null {
  if (i === 0) {
    const [cards, poster] = STEP_PRODUCT_KEYS.map(maybe);
    if (!cards || !poster) return null;
    return {
      fictional: cards.fictional || poster.fictional,
      node: (
        <>
          <Thumb image={poster} className="left-[8%] top-[3%] aspect-square h-[74%] -rotate-3" />
          <Thumb image={cards} className="bottom-[3%] right-[8%] aspect-square h-[74%] rotate-3" />
        </>
      ),
    };
  }
  if (i === 1) {
    const photos = STEP_PHOTO_KEYS.map(maybe);
    const both = photos.every((p): p is ImageSpec => p !== null) ? photos : null;
    return { fictional: Boolean(both), node: <StepPhotos photos={both} /> };
  }
  if (i === 2) {
    const proof = maybe(STEP_PROOF_KEY);
    if (!proof) return null;
    // The proof sheet at its own ratio (1.3 : 1): never cropped — the watermark is the point.
    return { fictional: proof.fictional, node: <Thumb image={proof} className="inset-x-0 top-1/2 aspect-[1400/1077] -translate-y-1/2" sizes={PROOF_SIZES} contain /> };
  }
  return { fictional: false, node: <StepTick /> };
}

function Cards({ className, visuals }: { className: string; visuals?: readonly (ReactNode | null)[] }) {
  return (
    <ol
      aria-label={PROOF_PATH_LABEL}
      className={`grid auto-rows-fr grid-cols-1 gap-3 min-[375px]:grid-cols-2 sm:gap-4 lg:grid-cols-4 ${className}`.trim()}
    >
      {INTAKE_COPY.stepCards.map((card, i) => {
        const node = visuals?.[i] ?? stepVisual(i)?.node ?? null;
        return (
          <li key={card.n} data-step-card="" className="flex min-w-0 flex-col rounded-[20px] border border-hairline bg-white p-4 sm:p-5 lg:p-6">
            {node ? (
              <span aria-hidden="true" data-step-visual="" className={VISUAL_BOX}>
                {node}
              </span>
            ) : null}
            <span aria-hidden="true" className="mt-4 font-display text-[2rem] leading-none tabular-nums text-ink md:mt-5 md:text-[2.5rem]">
              {card.n}
            </span>
            <p className="mt-2 font-body text-[1.0625rem] font-bold leading-snug text-ink">{card.title}</p>
            <p className="mt-1 max-w-[60ch] font-body text-small text-muted-text">{card.line}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** Whether the default cards show any fictional athlete (then C13 rides under the row, once). */
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

export function ProofPath({ variant = "cards", visuals, className = "" }: ProofPathProps) {
  return variant === "list" ? <List className={className} /> : <Cards className={className} visuals={visuals} />;
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
  /** The page's own four pictures (see `ProofPathProps.visuals`). */
  visuals?: readonly (ReactNode | null)[];
  /**
   * What sits under the cards when the page draws its own pictures — /free-proof's C13 follows the chosen
   * sport, so the page renders it. Without `visuals`, C13 once whenever a default picture is fictional.
   */
  after?: ReactNode;
  className?: string;
}

/**
 * The band under a money-page hero (owner review 2026-10-06). It carries no index — like the hero, it is
 * outside the numbered spine — so the label sits on the rule where an index would. `py-16 md:py-20
 * lg:py-24` is its own air: with the hero's bottom padding above it, the clear ground between the
 * hero's last element and this rule is never under 64 px.
 */
export function ProofPathBand({ container = "gallery", flushBottom = false, visuals, after, className = "" }: ProofPathBandProps) {
  const padding = flushBottom ? "pt-16 md:pt-20 lg:pt-24" : "py-16 md:py-20 lg:py-24";
  const body = (
    <>
      <div data-proof-band-rule="" className="border-t border-hairline pt-3">
        <p id={PROOF_BAND_LABEL_ID} className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
          {PROOF_PATH_LABEL}
        </p>
      </div>
      <ProofPath className="mt-6 lg:mt-8" visuals={visuals} />
      {visuals ? after : proofPathShowsFictional() ? <FictionalLabel className="mt-6" /> : null}
    </>
  );
  return (
    <section data-proof-band="" aria-labelledby={PROOF_BAND_LABEL_ID} className={`${padding} ${className}`.trim()}>
      {container === "none" ? body : <div className={container === "site" ? "container-site" : "container-gallery"}>{body}</div>}
    </section>
  );
}
