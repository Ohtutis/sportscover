import Image from "next/image";
import type { ReactNode } from "react";
import { assetOrNull, type ImageSpec } from "../lib/assets";
import { PROOF_PATH, PROOF_PATH_LABEL } from "../lib/copy/canon";
import { INTAKE_COPY } from "../lib/intake/copy";
import { FictionalLabel } from "./FictionalLabel";
import { CheckCircleIcon } from "./icons";
import { FAN_SPORTS, LIKENESS_SPORTS, MIX_PHOTOS, PHOTO_SHOT_NUMBER, StepFan, StepLikeness, StepPhotos, StepTick } from "./intake/visuals";

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
 * its card — 140 px tall on a phone, 200 px at 1440 (it was 64 / 96 px beside the numeral).
 *
 * v6 (owner, 2026-10-07: "visually four is better, but we explain too little about how we are different",
 * and "the four main ones, and pay as an extra across the whole width, so it is clear they risk nothing"):
 * FIVE cards — 01 the choice (a fan of four sports in four finishes, the one picture that mixes sports on
 * purpose), 02 the phone photos (the athlete's everyday ones), 03 what makes the work ours (the identity and
 * kit plates the athlete was rebuilt from), 04 the proof — and 05, the full width of the row, the promise:
 * pay only if you love it, nothing due today (prices.ts DUE_TODAY_LABEL). On /free-proof the page hands 02–04
 * in for the shown sport (`visuals`); every page keeps the defaults below for the rest — Marcus Ellison's
 * photos, plates and real watermarked proof sheet, one athlete across the row.
 *
 * `ProofPathBand` is how the money pages mount it (owner review 2026-10-06: the list wedged under the
 * hero CTA "looks dropped in"): its own band directly under the hero, the section rule with the label in
 * the index slot, the cards, and C13 once for the row whenever a picture shows a fictional athlete.
 *
 * Server-rendered, no JS, no motion; every picture is lazy, decorative (`alt=""` — the title under it
 * carries the meaning) and sits in a box of fixed size, so nothing shifts when it arrives.
 */

/** Card 04 by default: the real watermarked proof sheet (Marcus Ellison's, `show.proof.basketball`). */
export const STEP_PROOF_KEY = "show.proof.basketball";
/** Card 01 by default: the posters of the four fan sports, each in its lead finish (lib/assets.ts `free-proof.*.poster`). */
export const STEP_FAN_KEYS = FAN_SPORTS.map((slug) => `free-proof.${slug}.poster`);
/**
 * Card 02 on every page: the mix of five phone photos (components/intake/visuals.tsx MIX_PHOTOS — five athletes,
 * kits and everyday clothes, boys and girls). A grey "your photo" print stands in for any key not verified.
 */
export const STEP_PHOTO_KEYS = MIX_PHOTOS.map(({ slug, shot }) => `free-proof.${slug}.photo.${PHOTO_SHOT_NUMBER[shot]}`);
/** Card 03 on every page: the two likeness packs (components/intake/visuals.tsx LIKENESS_SPORTS: a boy and a girl), plate then kit. */
export const STEP_LIKENESS_KEYS = LIKENESS_SPORTS.flatMap((slug) => [`free-proof.${slug}.identity`, `free-proof.${slug}.kit`]);

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

/** The default picture for card `i` (0-based), or null when its keys are not verified. */
function stepVisual(i: number): { node: ReactNode; fictional: boolean } | null {
  if (i === 0) {
    const posters = STEP_FAN_KEYS.map(maybe);
    return { fictional: posters.some((p) => p?.fictional), node: <StepFan posters={posters} /> };
  }
  if (i === 1) {
    const photos = STEP_PHOTO_KEYS.map(maybe);
    return { fictional: photos.some((p) => p?.fictional), node: <StepPhotos photos={photos} /> };
  }
  if (i === 2) {
    const plates = STEP_LIKENESS_KEYS.map(maybe);
    const pairs = LIKENESS_SPORTS.map((_, n) => ({ identity: plates[2 * n], kit: plates[2 * n + 1] }));
    return { fictional: plates.some((p) => p?.fictional), node: <StepLikeness pairs={pairs} /> };
  }
  if (i === 3) {
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
      // Equal rows for the picture cards (a ragged row reads as a mistake); the fifth, wide row takes only its content.
      className={`grid grid-cols-1 gap-3 [grid-template-rows:repeat(4,1fr)_auto] min-[375px]:grid-cols-2 min-[375px]:[grid-template-rows:1fr_1fr_auto] sm:gap-4 lg:grid-cols-4 lg:[grid-template-rows:1fr_auto] ${className}`.trim()}
    >
      {INTAKE_COPY.stepCards.map((card, i) => {
        const node = visuals?.[i] ?? stepVisual(i)?.node ?? null;
        if ("wide" in card && card.wide) return <WideCard key={card.n} card={card} />;
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

/**
 * The fifth card, the full width of the row — the promise, on the dark surface so it is the loudest thing in the
 * band (owner, 2026-10-07: "pay as an extra across the whole width, so it is clear they risk nothing"; "05 must be
 * stronger"; and no zero figure: "to get anything after the proof they still pay — it is about no payment before
 * approval"). Two columns from `sm`: the numeral and the promise set in Anton with the line that spells both
 * outcomes, and the three outcomes with white ticks (INTAKE_COPY.promise). No accent: the page's orange stays on
 * its two buttons.
 */
function WideCard({ card }: { card: { n: string; title: string; line: string } }) {
  return (
    <li
      data-step-card=""
      data-step-wide=""
      data-surface="arena"
      className="col-span-full grid min-w-0 gap-6 rounded-[20px] bg-arena p-5 text-white sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:items-center sm:gap-8 sm:p-6 lg:p-8"
    >
      <div className="min-w-0">
        <span aria-hidden="true" className="font-display text-[2rem] leading-none tabular-nums text-arena-muted md:text-[2.5rem]">
          {card.n}
        </span>
        <p className="mt-2 font-display text-[1.75rem] uppercase leading-none text-balance md:text-[2.25rem]">{card.title}</p>
        <p className="mt-3 max-w-[48ch] font-body text-[0.9375rem] text-arena-muted text-pretty">{card.line}</p>
      </div>
      <ul className="grid gap-3 border-t border-arena-hairline pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
        {INTAKE_COPY.promise.map((line) => (
          <li key={line} className="flex items-center gap-3 font-body text-[1.0625rem] font-bold leading-snug">
            <CheckCircleIcon size={22} className="shrink-0 text-white" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </li>
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
  /** An anchor for the band (/free-proof: the header's "How it works" and the sticky bar glide to it). */
  id?: string;
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
export function ProofPathBand({ container = "gallery", flushBottom = false, visuals, after, id, className = "" }: ProofPathBandProps) {
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
    <section id={id} data-proof-band="" aria-labelledby={PROOF_BAND_LABEL_ID} className={`${padding} ${className}`.trim()}>
      {container === "none" ? body : <div className={container === "site" ? "container-site" : "container-gallery"}>{body}</div>}
    </section>
  );
}
