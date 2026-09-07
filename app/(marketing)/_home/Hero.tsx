// 01 · Hero (DESIGN §5.1-01, COPY §2.1-1). The "after" is composed in code from three faces
// (GAPS #1) — never a flat composite image, never a certificate or a pack.
//
// 2026-09-07, second owner review. His words, in substance: *"the hero sliders are too messy — why is
// there a grey background behind the animated slider? why do we show it is made from ONE photo when in
// reality it is made from more? is 'look up a card' really the most important call to action there? a
// lot of this is not needed — the hero should seduce and convince that this is cool; the price and how
// fast we deliver go lower down."* Four answers:
//
//   1. The left column is now H1 → subhead → ONE primary button → one quiet text link. The price line,
//      the delivery chips, the trust line and the two claim labels are gone from above the fold; the
//      numbers moved to `HeroStrip` directly under the hero, which is where he asked for them.
//   2. The grey plate is gone. The composition floats on the stock page on its own shadows, the way the
//      two heroes he pointed at do — no mat, no fill, no border.
//   3. The story tells the truth about the input: FOUR of the parent's phone photos are dealt in, one
//      after another, and the edition is built out of the pile. One photo was a claim we do not make.
//   4. Small chips report the real steps beside the art as they happen — intake, reference plate, proof,
//      registry. Every one is a step the pipeline actually has, and the registration date is read out of
//      `lib/registry/cards.ts`, never typed.
import Image from "next/image";
import type { CSSProperties } from "react";
import { CardFace } from "../../../components/CardFace";
import { CtaPair } from "../../../components/CtaPair";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { SectionHeading } from "../../../components/SectionHeading";
import { SITE_ASSETS, SITE_ASSET_KEYS, assetOrNull, type ImageSpec } from "../../../lib/assets";
import { formatEt } from "../../../lib/capacity";
import { sports, type Sport } from "../../../lib/catalog/sports";
import { styles, type Style } from "../../../lib/catalog/styles";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { getCard, registeredAtOf } from "../../../lib/registry/cards";
import { HeroStory } from "./HeroStory";
import { sectionId } from "./Section";

export const HERO_H1 = "THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.";
export const HERO_SUBHEAD = "Custom sports trading cards and posters from your photos. One registered edition per athlete.";

/** The quiet second action: the proof of the claim, not a second offer. Target = §08's H2. */
export const HERO_SECONDARY = { label: "See how it's made ↓", href: `#${sectionId(8)}` } as const;

/** The one accessible name for the whole narration — the frames are never announced one by one. */
export const HERO_STORY_SUMMARY = `Before and after: a parent's phone photos become a registered edition — ${CANON.fictionalLabel}`;

/**
 * `assetOrNull` throws on a key the manifest has never heard of, and the story keys land in
 * `lib/assets.ts` on someone else's clock. A key that is missing and a key that is still `locate` mean
 * the same thing here: this part is not ready, use another one.
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

/** The finish, read out of the same alt line ("… — Senior Night finish — …"). Longest name wins. */
const STYLES_BY_NAME_LENGTH = [...styles].sort((a, b) => b.name.length - a.name.length);
export function styleFromAlt(alt: string): Style | undefined {
  const haystack = alt.toLowerCase();
  return STYLES_BY_NAME_LENGTH.find((s) => haystack.includes(s.name.toLowerCase()));
}

export interface StoryScene {
  /** The parent's phone photos, in the order they are dealt (2–4; one while the deck keys land). */
  deck: ImageSpec[];
  front: ImageSpec;
  back: ImageSpec | null;
  poster: ImageSpec | null;
  sport?: Sport;
  style?: Style;
  /** "Registered · Aug 27, 2026" — from the registry record of the card the back depicts. */
  registered: string | null;
}

interface SceneKeys {
  /** The single-photo key, used while `…before.1…4` is still being produced. */
  before: string;
  front: string;
  back?: string;
  poster?: string;
}

/**
 * The hand of photos for scene `n`: `hero.story.<n>.before.1 … .4`, in order, skipping whatever is not
 * verified yet. While none of them exists the scene deals the one `…before` photo it has always had —
 * a hand of one, dealt the same way, rather than an empty stage.
 */
export function deckFor(n: number, fallback: string): ImageSpec[] {
  const deck = [1, 2, 3, 4].map((i) => maybeAsset(`hero.story.${n}.before.${i}`)).filter((a): a is ImageSpec => a !== null);
  if (deck.length) return deck;
  const single = maybeAsset(`hero.story.${n}.before`) ?? maybeAsset(fallback);
  return single ? [single] : [];
}

/**
 * The registration chip. The card ID is the one the back asset is QR-patched to (DESIGN §6.4), and the
 * date is the registry's own — a date typed into the hero would be the first thing to go stale.
 */
export function registeredChip(backKey: string | undefined): string | null {
  const cardId = backKey && SITE_ASSETS[backKey] ? SITE_ASSETS[backKey].cardId : undefined;
  const card = cardId ? getCard(cardId) : undefined;
  return card ? `Registered · ${formatEt(registeredAtOf(card), "medium")}` : null;
}

/**
 * Scene `n` from the contract keys, or the named fallback when it is not verified yet. Whole scenes
 * only: a real "before" photo of one athlete beside a fallback card of another would be a lie.
 */
function sceneFromKeys(n: number, keys: SceneKeys): StoryScene | null {
  const deck = deckFor(n, keys.before);
  const front = maybeAsset(keys.front);
  if (!deck.length || !front) return null;
  const backKey = keys.back && maybeAsset(keys.back) ? keys.back : undefined;
  return {
    deck,
    front,
    back: backKey ? maybeAsset(backKey) : null,
    poster: keys.poster ? maybeAsset(keys.poster) : null,
    sport: sportFromAlt(front.alt),
    style: styleFromAlt(front.alt),
    registered: registeredChip(backKey),
  };
}

function resolveScene(n: number, fallback?: SceneKeys): StoryScene | null {
  const contract = sceneFromKeys(n, {
    before: `hero.story.${n}.before`,
    front: `hero.story.${n}.card.front`,
    back: `hero.story.${n}.card.back`,
    poster: `hero.story.${n}.poster`,
  });
  return contract ?? (fallback ? sceneFromKeys(n, fallback) : null);
}

/**
 * Scene 1 is Marcus, basketball — the athlete the rest of the page shows. Scenes 2 and 3 are other
 * sports; until those exports land, scene 2 falls back to the football pair that is already verified
 * and scene 3 simply does not render.
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

const PHOTO_SIZES = "(min-width: 1024px) 130px, (min-width: 640px) 15vw, 25vw";
const CARD_SIZES = "(min-width: 1024px) 200px, (min-width: 640px) 24vw, 32vw";
// The poster is `hidden sm:block`; the 1 px candidate keeps it off the phone entirely.
const POSTER_SIZES = "(max-width: 639px) 1px, (min-width: 1024px) 180px, 22vw";

/**
 * Where each dealt photo lands in the fan, where it goes when the hand closes into the pile the
 * edition is built out of, and how long after the deal starts it is dealt. Percentages are of the
 * photo's own box, so the whole hand keeps its shape at every width. 150 ms apart, as asked.
 */
const HAND = [
  { fx: "0%", fy: "13%", fr: "-10deg", px: "16%", py: "14%", pr: "-6deg", delay: "0ms" },
  { fx: "34%", fy: "0%", fr: "-4deg", px: "22%", py: "10%", pr: "-2deg", delay: "150ms" },
  { fx: "68%", fy: "5%", fr: "3deg", px: "28%", py: "12%", pr: "2deg", delay: "300ms" },
  { fx: "102%", fy: "18%", fr: "9deg", px: "34%", py: "16%", pr: "6deg", delay: "450ms" },
] as const;

/**
 * The chips beside the art. Every one is a step the pipeline really has — `art:intake` counts the
 * photos, the identity plate is approved and locked before a pose is generated, the watermarked proof
 * is approved before anything prints, and the card is registered on the day the registry says.
 * They appear one beat apart (globals.css gates them on `data-phase`), never all at once.
 */
export function sceneChips(scene: StoryScene): string[] {
  const n = scene.deck.length;
  return [`${n} photo${n === 1 ? "" : "s"} in`, "Reference plate locked", "Proof approved", scene.registered].filter(
    (c): c is string => c !== null,
  );
}

const CHIP_CLASS =
  "inline-flex items-center gap-1.5 rounded-[4px] border border-hairline bg-stock px-2 py-1 font-label text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.1em] text-ink shadow-[0_1px_2px_rgb(20_25_31/.10)] sm:text-label";

/**
 * One scene of the story, laid out in the stage box. Percentages, never pixels: the box has a fixed
 * ratio at each breakpoint, so every frame keeps its place from 320 px to 1728 px and reserves its own
 * space — nothing here can shift the page. `data-story-part` / `data-story-chip` is what globals.css
 * animates; nothing in this markup is positioned by JavaScript.
 */
function Scene({ scene }: { scene: StoryScene }) {
  const chips = sceneChips(scene);
  return (
    <>
      {scene.deck.map((photo, i) => {
        const hand = HAND[i % HAND.length];
        return (
          <div
            key={photo.src + i}
            data-story-part="photo"
            className="absolute left-[1%] top-[5%] w-[27%] sm:left-0 sm:top-[14%] sm:w-[17%]"
            style={
              {
                "--fan-x": hand.fx,
                "--fan-y": hand.fy,
                "--fan-r": hand.fr,
                "--pile-x": hand.px,
                "--pile-y": hand.py,
                "--pile-r": hand.pr,
                "--deal-delay": hand.delay,
                zIndex: 10 + i,
              } as CSSProperties
            }
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)] ring-[5px] ring-white">
              <Image src={photo.src} alt={photo.alt} fill sizes={PHOTO_SIZES} className="object-cover" />
              {/* C13 rides the photo that ends up ON TOP — on the first one the pile buries it. */}
              {i === scene.deck.length - 1 ? <FictionalLabel inFrame compact /> : null}
            </div>
          </div>
        );
      })}
      {scene.poster ? (
        <div data-story-part="product" data-story-step="1" className="absolute z-0 hidden sm:block sm:left-[36%] sm:top-[14%] sm:w-[26%]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
            <Image src={scene.poster.src} alt={scene.poster.alt} fill sizes={POSTER_SIZES} className="object-contain" />
          </div>
        </div>
      ) : null}
      <div data-story-part="product" data-story-step="2" className="absolute left-[60%] top-[18%] z-20 w-[35%] sm:left-[62%] sm:top-[24%] sm:w-[33%]">
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
      {scene.sport && scene.style ? (
        <p
          data-story-part="label"
          className="absolute right-0 top-[6%] z-30 font-label text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.12em] text-muted-text sm:text-label"
        >
          {scene.sport.name} · {scene.style.name}
        </p>
      ) : null}
      <div
        data-story-chips=""
        className="absolute bottom-[1%] left-0 z-30 flex w-[56%] flex-col items-start gap-[3%] sm:bottom-[3%] sm:w-[40%] sm:gap-[2.5%]"
      >
        {chips.map((chip, i) => (
          <span key={chip} data-story-chip="" className={CHIP_CLASS}>
            {i === chips.length - 1 && scene.registered ? <span aria-hidden="true" className="inline-block h-3 w-[3px] shrink-0 bg-accent" /> : null}
            {chip}
          </span>
        ))}
      </div>
    </>
  );
}

/** Sport first, then the canon example line — one string, two fixed lines, never a jump. */
function caption(scene: StoryScene): string {
  return scene.sport ? `${scene.sport.name} · ${CANON.galleryCaptionShort}` : CANON.galleryCaptionShort;
}

export function Hero() {
  const scenes = storyScenes();
  const { primary } = ctaFor("home");
  return (
    <section aria-labelledby={sectionId(1)} className="pb-10 pt-8 lg:pb-16 lg:pt-16">
      <div className="container-gallery lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
        <div className="flex flex-col justify-center lg:col-span-5">
          <SectionHeading as="h1" id={sectionId(1)} title={HERO_H1} subhead={HERO_SUBHEAD} />
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <CtaPair primary={primary} size="lg" className="w-full sm:w-auto" />
            <a
              href={HERO_SECONDARY.href}
              className="inline-flex min-h-11 items-center whitespace-nowrap font-body text-body font-medium decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:underline"
            >
              {HERO_SECONDARY.label}
            </a>
          </div>
        </div>
        <div className="mt-10 lg:col-span-7 lg:mt-0">
          <HeroStory
            summary={HERO_STORY_SUMMARY}
            labels={scenes.map((s, i) => s.sport?.name.toLowerCase() ?? `${i + 1}`)}
            captions={scenes.map((s) => caption(s))}
            scenes={scenes.map((s, i) => <Scene key={i} scene={s} />)}
            className="lg:h-full"
          />
        </div>
      </div>
    </section>
  );
}
