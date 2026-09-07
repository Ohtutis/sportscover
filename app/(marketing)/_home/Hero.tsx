// 01 · Hero (DESIGN §5.1-01, COPY §2.1-1). The "after" is composed in code from three faces
// (GAPS #1) — never a flat composite image, never a certificate or a pack.
//
// 2026-09-07, owner review. Three changes:
//   1. The two claims are labels, not lozenges (`Pill variant="label"`). A filled accent pill beside an
//      outlined one, sitting eight pixels above a filled accent button beside an outlined button, is the
//      button pattern printed twice — people tried to click the claims. The accent claim survives as a
//      3 px tick beside the type.
//   2. The single "after" plate became a looping story (`HeroStory`): a phone photo drops in, the poster
//      and the card assemble out of it, the card turns, and the next athlete — another sport, one of them
//      an adult — does the same. Scenes come from `hero.story.<n>.*`; whatever is not verified yet falls
//      back, whole scenes at a time, to the faces that are. One scene renders as a correct static hero.
//   3. The two columns are stretched to one row (`lg:items-stretch`), and the art is a mat that fills its
//      grid track, so the four edges of the story line up with the four edges of the text column instead
//      of floating in the middle of it.
import Image from "next/image";
import { Arrow } from "../../../components/BeforeAfter";
import { CardFace } from "../../../components/CardFace";
import { CtaPair } from "../../../components/CtaPair";
import { DeliveryChips } from "../../../components/DeliveryChips";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Pill } from "../../../components/Pill";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { SITE_ASSET_KEYS, assetOrNull, type ImageSpec } from "../../../lib/assets";
import { formatUsd, getTier, sitePrice, tiers } from "../../../lib/catalog/prices";
import { sports, type Sport } from "../../../lib/catalog/sports";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { HeroStory } from "./HeroStory";
import { sectionId } from "./Section";

export const HERO_H1 = "THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.";
export const HERO_SUBHEAD = "Custom sports trading cards and posters from your photos. One registered edition per athlete.";

/** The one accessible name for the whole narration — the frames are never announced one by one. */
export const HERO_STORY_SUMMARY = `Before and after: a phone photo becomes a registered edition — ${CANON.fictionalLabel}`;

/** {from:digital} — the cheapest enabled tier with no physical goods (COPY §0.2). */
function digitalFrom(now: Date): number {
  const digital = tiers.filter((t) => t.enabled && !t.physical);
  if (!digital.length) throw new Error("Hero: no enabled digital tier for the {from:digital} token");
  return Math.min(...digital.map((t) => sitePrice(t, now)));
}

/**
 * `assetOrNull` throws on a key the manifest has never heard of, and the story keys land in
 * `lib/assets.ts` on someone else's clock. A key that is missing and a key that is still `locate` mean
 * the same thing here: this scene is not ready, show another one.
 */
function maybeAsset(key: string): ImageSpec | null {
  return SITE_ASSET_KEYS.includes(key) ? assetOrNull(key) : null;
}

/** The sport a card face depicts, read back out of its COPY §0.5 alt line. Longest name wins. */
const SPORTS_BY_NAME_LENGTH = [...sports].sort((a, b) => b.name.length - a.name.length);
export function sportFromAlt(alt: string): Sport | undefined {
  const haystack = alt.toLowerCase();
  return SPORTS_BY_NAME_LENGTH.find((s) => haystack.includes(s.name.toLowerCase()));
}

export interface StoryScene {
  before: ImageSpec;
  front: ImageSpec;
  back: ImageSpec | null;
  poster: ImageSpec | null;
  sport?: Sport;
}

/**
 * Scene `n` from the contract keys, or the named fallback when it is not verified yet. Whole scenes
 * only: a real "before" photo of one athlete beside a fallback card of another would be a lie.
 */
interface SceneKeys {
  before: string;
  front: string;
  back?: string;
  poster?: string;
}

function sceneFromKeys(keys: SceneKeys): StoryScene | null {
  const before = maybeAsset(keys.before);
  const front = maybeAsset(keys.front);
  if (!before || !front) return null;
  return {
    before,
    front,
    back: keys.back ? maybeAsset(keys.back) : null,
    poster: keys.poster ? maybeAsset(keys.poster) : null,
    sport: sportFromAlt(front.alt),
  };
}

function resolveScene(n: number, fallback?: SceneKeys): StoryScene | null {
  const contract = sceneFromKeys({
    before: `hero.story.${n}.before`,
    front: `hero.story.${n}.card.front`,
    back: `hero.story.${n}.card.back`,
    poster: `hero.story.${n}.poster`,
  });
  return contract ?? (fallback ? sceneFromKeys(fallback) : null);
}

/**
 * Scene 1 is Marcus, basketball — the athlete the rest of the page shows. Scenes 2 and 3 are other
 * sports and one adult athlete; until those exports land, scene 2 falls back to the football pair that
 * is already verified and scene 3 simply does not render.
 */
export function storyScenes(): StoryScene[] {
  return [
    resolveScene(1, {
      before: "home.hero.before",
      front: "home.hero.after.front",
      back: "home.hero.after.back",
      poster: "home.hero.after.poster",
    }),
    resolveScene(2, { before: "home.hero.before.football", front: "sport.football.front" }),
    resolveScene(3),
  ].filter((s): s is StoryScene => s !== null);
}

const PHOTO_SIZES = "(min-width: 1024px) 168px, (min-width: 640px) 22vw, 28vw";
const CARD_SIZES = "(min-width: 1024px) 180px, (min-width: 640px) 22vw, 30vw";
// The poster is `hidden sm:block`; the 1 px candidate keeps it off the phone entirely.
const POSTER_SIZES = "(max-width: 639px) 1px, (min-width: 1024px) 200px, 24vw";

/**
 * One scene of the story, laid out in the stage box. Percentages, never pixels: the box has a fixed
 * ratio at each breakpoint, so every frame keeps its place from 320 px to 1728 px and reserves its own
 * space — nothing here can shift the page. `data-story-part` is what globals.css animates.
 */
function Scene({ scene }: { scene: StoryScene }) {
  return (
    <>
      <div data-story-part="photo" className="absolute left-[2%] top-[13%] w-[36%] sm:top-[8%] sm:w-[26%]">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)] ring-[6px] ring-white">
          <Image src={scene.before.src} alt={scene.before.alt} fill sizes={PHOTO_SIZES} className="object-cover" />
          <FictionalLabel inFrame compact />
        </div>
      </div>
      <div data-story-part="arrow" className="absolute left-[39%] top-1/2 w-[9%] -translate-y-1/2 sm:left-[29.5%] sm:top-[37%] sm:w-[7%]">
        <Arrow direction="right" size="h-auto w-full" />
      </div>
      {scene.poster ? (
        <div data-story-part="product" data-story-step="1" className="absolute hidden sm:block sm:left-[37%] sm:top-[11%] sm:w-[36%]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
            <Image src={scene.poster.src} alt={scene.poster.alt} fill sizes={POSTER_SIZES} className="object-contain" />
          </div>
        </div>
      ) : null}
      <div data-story-part="product" data-story-step="2" className="absolute left-[54%] top-[8%] w-[40%] sm:left-[68%] sm:top-[44%] sm:w-[25%]">
        {scene.back ? (
          <div className="perspective-[1200px]">
            <div data-story-flip="" className="relative aspect-[5/7] w-full rounded-none transform-3d">
              <div className="absolute inset-0 rounded-none backface-hidden">
                <CardFace {...scene.front} labelled fill sizes={CARD_SIZES} />
              </div>
              <div className="absolute inset-0 rotate-y-180 rounded-none backface-hidden">
                <CardFace {...scene.back} labelled fill sizes={CARD_SIZES} />
              </div>
            </div>
          </div>
        ) : (
          <CardFace {...scene.front} labelled sizes={CARD_SIZES} />
        )}
      </div>
    </>
  );
}

/** Sport first, then the canon example line — one string, two fixed lines, never a jump. */
function caption(scene: StoryScene): string {
  return scene.sport ? `${scene.sport.name} · ${CANON.galleryCaptionShort}` : CANON.galleryCaptionShort;
}

export function Hero({ now }: { now: Date }) {
  const scenes = storyScenes();
  const printedSet = getTier("GDE-ANY-SET-PRINT");
  if (!printedSet) throw new Error("Hero: GDE-ANY-SET-PRINT is missing from the ladder");
  return (
    <section aria-labelledby={sectionId(1)} className="pb-12 pt-8 lg:pb-24 lg:pt-16">
      <div className="container-gallery lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
        <div className="lg:col-span-6">
          <SectionHeading
            as="h1"
            id={sectionId(1)}
            title={HERO_H1}
            subhead={HERO_SUBHEAD}
            pills={
              <>
                <Pill variant="label" tone="accent">
                  FROM YOUR PHOTOS
                </Pill>
                <span aria-hidden="true" className="font-label text-label font-semibold leading-none text-muted-text">
                  ·
                </span>
                <Pill variant="label" tone="outline">
                  REGISTERED EDITION
                </Pill>
              </>
            }
          />
          <p className="mt-6 font-body text-body font-medium tabular-nums">
            from {formatUsd(digitalFrom(now))} digital · {formatUsd(sitePrice(printedSet, now))} printed set
          </p>
          <DeliveryChips kind="standard" className="mt-4" />
          <CtaPair {...ctaFor("home")} size="lg" className="mt-6" />
          <TrustLine />
        </div>
        <div className="mt-10 lg:col-span-6 lg:mt-0">
          <HeroStory
            summary={HERO_STORY_SUMMARY}
            labels={scenes.map((s, i) => s.sport?.name.toLowerCase() ?? `${i + 1}`)}
            captions={scenes.map((s) => caption(s))}
            scenes={scenes.map((s, i) => <Scene key={i} scene={s} />)}
            className="rounded-ui bg-hairline p-4 md:p-6 lg:h-full lg:p-8"
          />
        </div>
      </div>
    </section>
  );
}
