"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import type { FreeProofArtMap } from "../../lib/intake/sport-art";
import { BracketFrame } from "../BracketFrame";
import { FictionalLabel } from "../FictionalLabel";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { SHOWCASE_SPORT, artState, cardImage, choiceStore, exampleName, previewFinish, shownArt, sportArt, sportName, sportRequestStore, type PageChoice } from "./model";
import { ScrollLink } from "./ScrollLink";
import type { SportChoiceData } from "./SportPicker";
import { ArtImage, ArtNote, FAN_SPORTS, MIX_PHOTOS, NeutralArt, PHOTO_SHOTS, PhotoPlaceholder, PhotoPrint, StepFan, StepLikeness, StepPhotos, StepProofSheet, StepTick, Watermark } from "./visuals";

/** Step 1's anchor — the hero CTA and the strip's "all sports" link glide to it. */
export const STEP_ONE_HREF = "#step-1";

// The pictures ABOVE the form island that follow the sport chosen in step 1 (owner review 2026-10-06,
// evening: "one sport on the whole page"): the hero's example proof and the how-it-works pictures. They
// read the choice from `choiceStore` (components/intake/model.ts), which the form writes; on the server
// and on the first client render the choice is empty, so the static HTML shows the page's EXAMPLE sport
// (v5, owner review 2026-10-07: "too many faceless grey cards") — SHOWCASE_SPORT, or the sport named in the
// link on a per-sport page — and hydration never mismatches. Every box has a fixed ratio, so a swap of sport
// moves nothing (CLS 0).

const useChoice = (): PageChoice => useSyncExternalStore(choiceStore.subscribe, choiceStore.get, choiceStore.getServer);

/** Where each "your photo" lands, as fractions of the visual's own box, so the hand keeps its shape at every width. */
const HAND = [
  { place: "left-[2%] bottom-[7%] -rotate-[9deg]", z: "z-10" },
  { place: "left-[9%] bottom-[3%] -rotate-[2deg]", z: "z-20" },
  { place: "left-[16%] bottom-0 rotate-[5deg]", z: "z-30" },
] as const;

/** The poster is 60 % and the card 49 % of the sheet's height; the sheet is the right half of the gallery from lg. */
const HERO_PHOTO_SIZES = "(min-width: 1360px) 150px, (min-width: 1024px) 11vw, (min-width: 640px) 130px, 22vw";
const HERO_POSTER_SIZES = "(min-width: 1360px) 240px, (min-width: 1024px) 18vw, (min-width: 640px) 220px, 40vw";
const HERO_CARD_SIZES = "(min-width: 1360px) 200px, (min-width: 1024px) 15vw, (min-width: 640px) 180px, 33vw";

/**
 * "This is what you get" — the hero's right half: your photos become their edition. An example proof sheet in
 * the bracket frame with its file-tab label (the sport's poster and card front side by side under the CSS
 * watermark), three of that athlete's phone photos lying over its lower-left corner with their own label, and
 * under it the strip of sports that switches every picture on the page (v6, owner 2026-10-07: "the hero is
 * too weak … we pick a sport and everything changes"). Before a sport is chosen (or for a sport with no example
 * yet) it is the page's example sport, and the line under the frame says so. C13 sits in the frame while real
 * art shows.
 */
export function HeroVisual({
  art,
  example = SHOWCASE_SPORT,
  sports = [],
  className = "",
}: {
  art: FreeProofArtMap;
  example?: string;
  sports?: readonly SportChoiceData[];
  className?: string;
}) {
  return <HeroVisualView art={art} choice={useChoice()} example={example} sports={sports} className={className} />;
}

/** The hero visual for a given choice — pure, so the static render and the tests draw it without the store. */
export function HeroVisualView({
  art,
  choice,
  example = SHOWCASE_SPORT,
  sports = [],
  className = "",
}: {
  art: FreeProofArtMap;
  choice: PageChoice;
  example?: string;
  sports?: readonly SportChoiceData[];
  className?: string;
}) {
  const entry = shownArt(art, choice.sport, example);
  const state = artState(art, choice.sport);
  const photos = entry?.photos ?? null;
  const finish = previewFinish(choice.style);
  const poster = entry?.poster ?? null;
  const card = cardImage(entry, finish, true);
  const front = HAND.length - 1;
  return (
    <div>
      <div data-hero-visual="" data-sport={choice.sport || undefined} data-example={state === "art" ? undefined : example} className={`relative mx-auto w-full max-w-[560px] lg:max-w-none ${className}`.trim()}>
        {/* The padding is the ground the photos hang into: 13 % on the left, 14 % of the width below. */}
        <div className="pb-[14%] pl-[13%]">
          <BracketFrame label={INTAKE_COPY.heroVisual.frameLabel}>
            <div className="relative aspect-[1400/1077] w-full overflow-hidden rounded-none bg-white shadow-[var(--shadow-card-stock)]">
              <div className="absolute inset-0 flex items-center justify-center gap-[4%] px-[5%]">
                <span className="relative block aspect-[3/4] h-[80%] shrink-0 overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
                  {poster ? <ArtImage image={poster} sizes={HERO_POSTER_SIZES} eager /> : <NeutralArt shape="poster" className="h-full w-full" />}
                </span>
                <span className="relative block aspect-[5/7] h-[68%] shrink-0 overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
                  {card ? <ArtImage image={card} sizes={HERO_CARD_SIZES} eager /> : <NeutralArt shape="card" finish={choice.style ? finish : undefined} className="h-full w-full" />}
                </span>
              </div>
              <Watermark />
              {/* C13 once, bottom-RIGHT (the photos cover the left corner) — only over real art. */}
              {poster || card ? <FictionalLabel inFrame compact className="left-auto! right-3!" /> : null}
            </div>
          </BracketFrame>
        </div>
        {HAND.map((hand, i) => (
          <div key={i} className={`absolute w-[22%] ${hand.place} ${hand.z}`}>
            {photos?.[i] ? <PhotoPrint image={photos[i]} sizes={HERO_PHOTO_SIZES} ring="ring-[5px]" decorative={i < front} eager /> : <PhotoPlaceholder ring="ring-[5px]" />}
            {/* The label hangs off the front print: the fan is the parent's photos, the sheet what they become. */}
            {i === front ? (
              <span
                aria-hidden="true"
                data-photos-label=""
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-ink px-2 py-1 font-label text-label font-semibold uppercase tracking-[0.12em] text-white"
              >
                {INTAKE_COPY.heroVisual.photosLabel}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <ArtNote state={state} sport={sportName(choice.sport, choice.sportOther)} example={exampleName(art, example)} label={false} className="mt-6" />
      <HeroSportStripView sports={sports} art={art} chosen={choice.sport} className="mt-5" />
    </div>
  );
}

const STRIP_LABEL_ID = "free-proof-sport-strip";
/** A strip chip: the sport's card face and its name, 44 px tall; chosen = ink fill, like a step-1 chip. */
const stripChip = (on: boolean): string =>
  `inline-flex min-h-11 items-center gap-2 rounded-ui border-[1.5px] py-1 pl-1 pr-3 font-display text-[0.9375rem] uppercase leading-none tracking-[0.02em] transition-[background-color,border-color,color] duration-hover ease-out focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent ${
    on ? "border-ink bg-ink text-white" : "border-ink/25 bg-white text-ink hover:border-ink"
  }`;
const STRIP_LINK =
  "inline-flex min-h-11 items-center rounded-ui px-2 font-display text-[0.9375rem] uppercase leading-none tracking-[0.02em] text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent";

/**
 * The strip under the hero exhibit: the sports with their own pages as chips, each wearing its card face, and
 * "All N sports" gliding to step 1. A tap asks the form for that sport (`sportRequestStore`) — the same change
 * as a tap on a step-1 chip — so the hero, the band, the tiles and step 1 agree; the chosen sport's chip is
 * filled. Pure: the static render and the tests draw it with the choice handed in. Nothing before the parent
 * chooses: the example sport is named in the line above, not pre-pressed here.
 */
export function HeroSportStripView({
  sports,
  art,
  chosen,
  className = "",
}: {
  sports: readonly SportChoiceData[];
  art: FreeProofArtMap;
  chosen: string;
  className?: string;
}) {
  const featured = sports.filter((s) => s.featured);
  if (!featured.length) return null;
  return (
    <div data-sport-strip="" className={className}>
      <p id={STRIP_LABEL_ID} className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
        {INTAKE_COPY.heroVisual.switchLabel}
      </p>
      {/* One scrolling row on a phone (no wrap, no scrollbar), a wrapping row from lg. */}
      <ul aria-labelledby={STRIP_LABEL_ID} className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-wrap lg:overflow-visible lg:pb-0">
        {featured.map((s) => {
          const face = cardImage(sportArt(art, s.slug), "SN", true);
          const on = chosen === s.slug;
          return (
            <li key={s.slug} className="shrink-0">
              <button type="button" aria-pressed={on} data-strip-sport={s.slug} onClick={() => sportRequestStore.request(s.slug)} className={stripChip(on)}>
                <span className="relative block h-9 w-[1.625rem] shrink-0 overflow-hidden rounded-none bg-hairline">
                  {face ? <Image src={face.src} alt="" fill sizes="32px" className="object-cover" /> : null}
                </span>
                <span>{s.name}</span>
              </button>
            </li>
          );
        })}
        <li className="shrink-0">
          <ScrollLink href={STEP_ONE_HREF} className={STRIP_LINK}>
            {INTAKE_COPY.heroVisual.allSports(sports.length)}
          </ScrollLink>
        </li>
      </ul>
    </div>
  );
}

/**
 * One how-it-works picture on /free-proof: 01 the fan of four sports in four finishes and 02 the mix of phone
 * photos (both the same on every page — the choice and the upload are the same whatever the sport), then in
 * the shown sport 03 the athlete's identity and kit plates and 04 their poster and card on the proof sheet;
 * 05 the tick.
 */
export function FreeProofStepVisual({ step, art, example = SHOWCASE_SPORT }: { step: number; art: FreeProofArtMap; example?: string }) {
  return <StepVisualView step={step} art={art} choice={useChoice()} example={example} />;
}

/** One step picture for a given choice — pure (see HeroVisualView). */
export function StepVisualView({ step, art, choice, example = SHOWCASE_SPORT }: { step: number; art: FreeProofArtMap; choice: PageChoice; example?: string }) {
  const entry = shownArt(art, choice.sport, example);
  const finish = previewFinish(choice.style);
  const swatch = choice.style ? finish : undefined;
  if (step === 0) return <StepFan posters={FAN_SPORTS.map((slug) => sportArt(art, slug)?.poster ?? null)} />;
  if (step === 1) return <StepPhotos photos={MIX_PHOTOS.map(({ slug, shot }) => sportArt(art, slug)?.photos?.[PHOTO_SHOTS.indexOf(shot)] ?? null)} />;
  if (step === 2) return <StepLikeness identity={entry?.identity ?? null} kit={entry?.kit ?? null} />;
  if (step === 3) return <StepProofSheet poster={entry?.poster ?? null} card={cardImage(entry, finish, true)} finish={swatch} />;
  return <StepTick />;
}

/** Under the band on /free-proof: C13 once while real art shows; the same box, empty, otherwise. */
export function FreeProofBandNote({ art, example = SHOWCASE_SPORT }: { art: FreeProofArtMap; example?: string }) {
  const choice = useChoice();
  const shown = shownArt(art, choice.sport, example) !== null;
  return (
    <div data-band-note={shown ? "art" : "none"} className="mt-6">
      <div aria-hidden={shown ? undefined : true} className={shown ? undefined : "invisible"}>
        <FictionalLabel />
      </div>
    </div>
  );
}
