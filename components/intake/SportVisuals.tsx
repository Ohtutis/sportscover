"use client";

import { useSyncExternalStore } from "react";
import type { FreeProofArtMap } from "../../lib/intake/sport-art";
import { FictionalLabel } from "../FictionalLabel";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { SHOWCASE_SPORT, artState, cardImage, choiceStore, exampleName, previewFinish, shownArt, sportArt, sportName, type PageChoice } from "./model";
import {
  ArtImage,
  ArtNote,
  FAN_SPORTS,
  LIKENESS_SPORTS,
  MIX_PHOTOS,
  NeutralArt,
  PHOTO_SHOTS,
  PhotoPlaceholder,
  PhotoPrint,
  StepFan,
  StepLikeness,
  StepPhotos,
  StepProofSheet,
  StepTick,
  Watermark,
} from "./visuals";

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
  { place: "left-0 bottom-[6%] -rotate-[9deg]", z: "z-30" },
  { place: "left-[8%] bottom-[2%] -rotate-[2deg]", z: "z-[31]" },
  { place: "left-[16%] bottom-0 rotate-[5deg]", z: "z-[32]" },
] as const;

/** The poster is 52 % and the card 34 % of the column's width; the column is the right half of the gallery from lg. */
const HERO_PHOTO_SIZES = "(min-width: 1360px) 160px, (min-width: 1024px) 12vw, (min-width: 640px) 140px, 24vw";
const HERO_POSTER_SIZES = "(min-width: 1360px) 340px, (min-width: 1024px) 26vw, (min-width: 640px) 300px, 52vw";
const HERO_CARD_SIZES = "(min-width: 1360px) 230px, (min-width: 1024px) 17vw, (min-width: 640px) 200px, 34vw";
const PILL = "inline-flex h-7 items-center whitespace-nowrap rounded-[4px] px-2.5 font-label text-label font-semibold uppercase tracking-[0.12em]";

/**
 * "This is what you get" — the hero's right half, v9 (owner, 2026-10-07: "I wanted it completely redone"; and the
 * house rule of 2026-09-07: products float on the page with a soft shadow, never in a box). No sheet, no bracket
 * frame: the sport's poster stands large with the card front over its lower-right corner, the two labelled
 * ("THEIR EDITION" on the poster, C13 on the card), one PROOF stamp across the art, and three of that athlete's
 * phone photos fanned in front of the poster's lower-left corner with "Your photos →" on the front print — the
 * transformation read without a word of copy. Before a sport is chosen (or for a sport with no example yet) it is
 * the page's example sport, and the line under it says so.
 */
export function HeroVisual({ art, example = SHOWCASE_SPORT, className = "" }: { art: FreeProofArtMap; example?: string; className?: string }) {
  return <HeroVisualView art={art} choice={useChoice()} example={example} className={className} />;
}

/** The hero visual for a given choice — pure, so the static render and the tests draw it without the store. */
export function HeroVisualView({
  art,
  choice,
  example = SHOWCASE_SPORT,
  className = "",
}: {
  art: FreeProofArtMap;
  choice: PageChoice;
  example?: string;
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
      <div
        data-hero-visual=""
        data-sport={choice.sport || undefined}
        data-example={state === "art" ? undefined : example}
        className={`relative mx-auto aspect-[10/7.6] w-full max-w-[600px] lg:max-w-none ${className}`.trim()}
      >
        {/* The art: the poster large, the card over its lower-right corner, one PROOF stamp across both. */}
        <div data-hero-art="" className="absolute inset-x-0 top-0 h-[92%]">
          <span className="absolute left-[24%] top-0 block aspect-[3/4] w-[52%] -rotate-[2deg] overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
            {poster ? <ArtImage image={poster} sizes={HERO_POSTER_SIZES} eager /> : <NeutralArt shape="poster" className="h-full w-full" />}
            <span className={`${PILL} absolute left-3 top-3 z-10 bg-ink text-white`}>{INTAKE_COPY.heroVisual.frameLabel}</span>
          </span>
          <span className="absolute right-0 top-[24%] z-20 block aspect-[5/7] w-[34%] rotate-[3deg] overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
            {card ? <ArtImage image={card} sizes={HERO_CARD_SIZES} eager /> : <NeutralArt shape="card" finish={choice.style ? finish : undefined} className="h-full w-full" />}
            {/* C13 once, on the card — only over real art. */}
            {poster || card ? <FictionalLabel inFrame compact /> : null}
          </span>
          <Watermark variant="stamp" />
        </div>
        {HAND.map((hand, i) => (
          <div key={i} className={`absolute w-[24%] ${hand.place} ${hand.z}`}>
            {photos?.[i] ? <PhotoPrint image={photos[i]} sizes={HERO_PHOTO_SIZES} ring="ring-[5px]" decorative={i < front} eager /> : <PhotoPlaceholder ring="ring-[5px]" />}
            {/* The label hangs off the front print: the fan is the parent's photos, the art what they become. */}
            {i === front ? (
              <span aria-hidden="true" data-photos-label="" className={`${PILL} absolute -bottom-3 left-1/2 -translate-x-1/2 bg-ink text-white`}>
                {INTAKE_COPY.heroVisual.photosLabel}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      {/* The transformation in nine words, for a reader who skips the copy (ads brief §2). */}
      <p data-hero-micro="" className="mt-8 font-display text-[1.0625rem] uppercase leading-snug tracking-[0.02em] text-ink">
        {INTAKE_COPY.heroVisual.microLine}
      </p>
      <ArtNote state={state} sport={sportName(choice.sport, choice.sportOther)} example={exampleName(art, example)} label={false} className="mt-3" />
    </div>
  );
}

/**
 * One how-it-works picture on /free-proof: 01 the fan of four sports in four finishes, 02 the mix of phone
 * photos and 03 the two likeness packs (all three the same on every page: the choice, the upload and the
 * method are the same whatever the sport), then in the shown sport 04 the poster and card on the proof sheet.
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
  if (step === 2) return <StepLikeness pairs={LIKENESS_SPORTS.map((slug) => ({ identity: sportArt(art, slug)?.identity ?? null, kit: sportArt(art, slug)?.kit ?? null }))} />;
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
