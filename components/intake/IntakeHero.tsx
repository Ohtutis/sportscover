import Image from "next/image";
import { assetOrNull, type ImageSpec } from "../../lib/assets";
import { INTAKE_COPY, INTAKE_PATH } from "../../lib/intake/copy";
import { BracketFrame } from "../BracketFrame";
import { Breadcrumbs } from "../Breadcrumbs";
import { PRIMARY_BUTTON_CLASS } from "../CtaPair";
import { FictionalLabel } from "../FictionalLabel";
import { STEP_PROOF_KEY } from "../ProofPath";
import { ScrollLink } from "./ScrollLink";
import { UI } from "./strings";

export const HERO_TITLE_ID = "free-proof-title";
export const STEP_ONE_HREF = "#step-1";

/** The page's one big orange button (with the conversion card's submit): Anton on the accent, 56 px. */
export const HERO_CTA_CLASS = `inline-flex min-h-14 items-center justify-center rounded-ui px-8 py-3 text-center font-display text-[1.0625rem] uppercase leading-tight tracking-[0.04em] transition-[filter] duration-hover ease-out ${PRIMARY_BUTTON_CLASS}`;

/**
 * The parent's phone photos dealt over the proof's lower-left corner, back to front — the same athlete
 * as the proof (Marcus Ellison, components/ProofPath.tsx explains why it is never another athlete's).
 * `.before.1` is the gym photo in the jersey the card shows, so it lands on top.
 */
export const HERO_PHOTO_KEYS = ["hero.story.1.before.3", "hero.story.1.before.2", "hero.story.1.before.1"] as const;

/** Where each photo lands, as fractions of the visual's own box, so the hand keeps its shape at every width. */
const HAND = [
  { place: "left-[2%] bottom-[7%] -rotate-[9deg]", z: "z-10" },
  { place: "left-[9%] bottom-[3%] -rotate-[2deg]", z: "z-20" },
  { place: "left-[16%] bottom-0 rotate-[5deg]", z: "z-30" },
] as const;

/**
 * Rendered widths, measured from the boxes below: the proof fills the bracket frame (87 % of the visual,
 * less the frame's padding) and each photo is 22 % of the visual. The visual is the right half of the
 * gallery container from `lg` (616 px at 1440), and full width up to 560 px below it.
 */
const PROOF_SIZES = "(min-width: 1360px) 504px, (min-width: 1024px) 37vw, (min-width: 640px) 456px, 72vw";
const PHOTO_SIZES = "(min-width: 1024px) 136px, (min-width: 640px) 124px, 22vw";

/**
 * "This is what you get first" (owner review 2026-10-06: the right half of this hero was empty). The
 * real watermarked proof, as an exhibit in the bracket frame with its file-tab label, and the phone
 * photos it was built from lying over its corner in the home hero's house style — square prints with a
 * white ring and the card shadow, dealt at an angle. No plate under anything, no motion. Every box has
 * a fixed ratio (the frame's image box, the photos' 3 : 4, the room under the corner is padding), so
 * the visual reserves its height before a byte arrives: CLS 0. The proof is the page's one eager image.
 */
export function HeroVisual({ className = "" }: { className?: string }) {
  const proof = assetOrNull(STEP_PROOF_KEY);
  const photos = HERO_PHOTO_KEYS.map((k) => assetOrNull(k)).filter((p): p is ImageSpec => p !== null);
  if (!proof) return null;
  return (
    <div data-hero-visual="" className={`relative mx-auto w-full max-w-[560px] lg:max-w-none ${className}`.trim()}>
      {/* The padding is the ground the photos hang into: 13 % on the left, 14 % of the width below. */}
      <div className={photos.length ? "pb-[14%] pl-[13%]" : undefined}>
        <BracketFrame label={INTAKE_COPY.heroVisual.frameLabel}>
          <div className="relative aspect-[1400/1077] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
            <Image src={proof.src} alt={proof.alt} fill sizes={PROOF_SIZES} loading="eager" fetchPriority="high" className="object-contain" />
            {/* C13 once for the group — the proof and the photos are the same fictional athlete. Bottom-RIGHT: the photos cover the left corner. */}
            {proof.fictional || photos.some((p) => p.fictional) ? <FictionalLabel inFrame compact className="left-auto! right-3!" /> : null}
          </div>
        </BracketFrame>
      </div>
      {photos.map((photo, i) => {
        const hand = HAND[(HAND.length - photos.length + i) % HAND.length];
        return (
          <div key={photo.src} className={`absolute w-[22%] ${hand.place} ${hand.z}`}>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)] ring-[5px] ring-white">
              <Image src={photo.src} alt={photo.alt} fill sizes={PHOTO_SIZES} className="object-cover" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The landing hero of /free-proof (owner review 2026-10-04, point 1; 2026-10-06: "a visual is missing").
 * Two columns from `lg`, 6 / 6 like the home hero: the H1 stays the largest thing on the page; under it
 * ONE sentence, then the orange "Start my free proof →" that glides to step 1 (a plain `#step-1` anchor
 * without JavaScript), the small no-payment note, and the three claims as quiet type — muted Barlow
 * labels with no tick and no fill, so the page's orange stays on its two buttons. Beside them, the
 * proof itself (`HeroVisual`). Below `lg` the visual follows the copy, full width up to 560 px.
 *
 * The H1 runs at 20ch rather than the recipe's 16ch: "FREE PROOF FIRST. PAY IF YOU LOVE IT." broke into
 * three lines at 16ch on a 1440 screen; at 20ch it sets as two, one sentence per line.
 */
export function IntakeHero() {
  return (
    <section aria-labelledby={HERO_TITLE_ID} className="pt-6 md:pt-10">
      <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: UI.breadcrumb, href: INTAKE_PATH }]} className="mb-6" />
      <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
        <div className="lg:col-span-6">
          <h1 id={HERO_TITLE_ID} className="max-w-[20ch] font-display text-display uppercase text-balance">
            {INTAKE_COPY.h1}
          </h1>
          <p className="mt-5 max-w-[46ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">{INTAKE_COPY.heroLine}</p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-start">
            <ScrollLink href={STEP_ONE_HREF} className={`${HERO_CTA_CLASS} w-full sm:w-auto`}>
              {INTAKE_COPY.heroCta}
            </ScrollLink>
            <p className="font-body text-small text-muted-text max-sm:text-center">{INTAKE_COPY.heroCtaNote}</p>
          </div>
          {/* One claim per line on a phone: wrapped inline, the middots fell at line ends (the TrustLine lesson, 2026-09-07). */}
          <ul className="mt-8 flex flex-col items-start gap-y-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
            {INTAKE_COPY.claims.map((claim, i) => (
              <li key={claim} className="flex items-center gap-3 font-label text-label font-semibold uppercase leading-none tracking-[0.12em] text-muted-text">
                {i > 0 ? (
                  <span aria-hidden="true" className="hidden sm:inline">
                    ·
                  </span>
                ) : null}
                <span>{claim}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12 lg:col-span-6 lg:mt-0">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
