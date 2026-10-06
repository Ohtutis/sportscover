"use client";

import { useSyncExternalStore } from "react";
import type { FreeProofArtMap } from "../../lib/intake/sport-art";
import { BracketFrame } from "../BracketFrame";
import { FictionalLabel } from "../FictionalLabel";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { SHOWCASE_SPORT, artState, cardImage, choiceStore, exampleName, previewFinish, shownArt, sportName, type PageChoice } from "./model";
import { ArtImage, ArtNote, NeutralArt, PhotoPlaceholder, PhotoPrint, StepPair, StepPhotos, StepProofCard, StepTick, Watermark } from "./visuals";

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
 * "This is what you get first" — the hero's right half: phone photos become a proof. An example proof sheet in
 * the bracket frame with its file-tab label (the sport's poster and card front side by side under the CSS
 * watermark), and three of that athlete's phone photos lying over its lower-left corner. Before a sport is
 * chosen (or for a sport with no example yet) it is the page's example sport, and the line under the frame
 * says so. C13 sits in the frame while real art shows.
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
            {photos?.[i] ? (
              <PhotoPrint image={photos[i]} sizes={HERO_PHOTO_SIZES} ring="ring-[5px]" decorative={i < HAND.length - 1} eager />
            ) : (
              <PhotoPlaceholder ring="ring-[5px]" />
            )}
          </div>
        ))}
      </div>
      <ArtNote state={state} sport={sportName(choice.sport, choice.sportOther)} example={exampleName(art, example)} label={false} className="mt-5" />
    </div>
  );
}

/**
 * One how-it-works picture on /free-proof, in the shown sport: 01 its poster and a card front, 02 that
 * athlete's phone photos, 03 the card front under the watermark, 04 the tick.
 */
export function FreeProofStepVisual({ step, art, example = SHOWCASE_SPORT }: { step: number; art: FreeProofArtMap; example?: string }) {
  return <StepVisualView step={step} art={art} choice={useChoice()} example={example} />;
}

/** One step picture for a given choice — pure (see HeroVisualView). */
export function StepVisualView({ step, art, choice, example = SHOWCASE_SPORT }: { step: number; art: FreeProofArtMap; choice: PageChoice; example?: string }) {
  const entry = shownArt(art, choice.sport, example);
  const finish = previewFinish(choice.style);
  const swatch = choice.style ? finish : undefined;
  if (step === 0) return <StepPair poster={entry?.poster ?? null} card={cardImage(entry, finish, true)} finish={swatch} />;
  if (step === 1) return <StepPhotos photos={entry?.photos} />;
  if (step === 2) return <StepProofCard card={cardImage(entry, finish, true)} finish={swatch} />;
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
