import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { FictionalLabel } from "../FictionalLabel";
import { CheckCircleIcon } from "../icons";
import type { ArtState } from "./model";

// The pictures /free-proof draws in code (owner review 2026-10-06, evening: "mixing sports is not cool").
// No hooks, no browser API, no asset map: the server band (components/ProofPath.tsx) and the form island
// share them, so a grey placeholder or a watermark looks the same wherever it appears.
//
// - `PhotoPrint` — one phone photo as a print (square corners, white ring, card shadow): the example athlete's
//   own "before" photos (v5, owner review 2026-10-07), the same fictional athlete as the art beside them.
// - `PhotoPlaceholder` — "your photo": a soft grey print with a drawn silhouette and the label, only where no
//   example photo exists.
// - `NeutralArt` — the grey set: a card, poster, banner or blanket with the same silhouette, and for a
//   card the finish shown as its frame (a swatch of the finish's material), so a look still reads before
//   a sport is chosen.
// - `Watermark` — "PROOF" tiled on the diagonal in CSS, over any example proof.
// - `ArtImage` — one art-map picture, contained (a card is never cropped).
// - `ArtNote` — the line under a group of pictures: C13 over their sport's art; C13 and "Example shown: <sport>"
//   before a choice; C13 and "built to order" for a sport with no example yet. All three are laid in the same
//   grid cell and only one is visible, so the line's height never changes when the sport arrives (CLS 0).

/** Each finish as a material swatch — the frame of its grey card. Gradients only; no orange token anywhere. */
export const FINISH_SWATCH: Record<string, string> = {
  SN: "linear-gradient(135deg, #0e1a2e 0%, #33435e 52%, #c9ced6 100%)",
  CA: "linear-gradient(135deg, #f4f6f8 0%, #8d96a3 42%, #f8f9fb 62%, #4f5864 100%)",
  FS: "linear-gradient(135deg, #1b0d08 0%, #6e1f0e 50%, #c2471c 100%)",
  HE: "linear-gradient(135deg, #efe3c8 0%, #b08a57 55%, #5a3e22 100%)",
  SS: "linear-gradient(135deg, #0d0d10 0%, #393944 55%, #d9c27a 100%)",
  PR: "linear-gradient(135deg, #e04fd0 0%, #6b5bff 38%, #2ec9e6 72%, #9fe85c 100%)",
  SR: "linear-gradient(135deg, #0f1b33 0%, #24365c 52%, #c9a227 100%)",
};

const GROUND = "#E8E7E2";
const FIGURE = "#CFCEC7";
const BARS = "#D9D8D2";

/** The athlete, drawn: a head and shoulders rising from the bottom edge, centred on `cx`. */
function Figure({ cx, base, scale }: { cx: number; base: number; scale: number }) {
  const s = scale;
  return (
    <g fill={FIGURE}>
      <circle cx={cx} cy={base - 66 * s} r={14 * s} />
      <path d={`M${cx - 30 * s} ${base} C${cx - 30 * s} ${base - 30 * s} ${cx - 20 * s} ${base - 46 * s} ${cx} ${base - 46 * s} C${cx + 20 * s} ${base - 46 * s} ${cx + 30 * s} ${base - 30 * s} ${cx + 30 * s} ${base} Z`} />
    </g>
  );
}

export type NeutralShape = "card" | "poster" | "banner" | "blanket" | "photo";

/** The viewBox of each shape: its real proportions (card 5 : 7, poster 3 : 4, banner 3 : 1, blanket 5 : 6, photo 3 : 4). */
const VIEW: Record<NeutralShape, [number, number]> = { card: [100, 140], poster: [105, 140], banner: [150, 50], blanket: [100, 120], photo: [105, 140] };
export const NEUTRAL_RATIO: Record<NeutralShape, string> = { card: "5/7", poster: "3/4", banner: "3/1", blanket: "5/6", photo: "3/4" };

function NeutralSvg({ shape }: { shape: NeutralShape }) {
  const [w, h] = VIEW[shape];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" className="absolute inset-0 h-full w-full">
      <rect width={w} height={h} fill={GROUND} />
      {shape === "banner" ? (
        <>
          <Figure cx={28} base={50} scale={0.55} />
          <rect x={58} y={16} width={70} height={8} fill={BARS} />
          <rect x={58} y={29} width={46} height={5} fill={BARS} />
        </>
      ) : shape === "blanket" ? (
        <>
          <Figure cx={50} base={120} scale={1.05} />
          <path d="M0 92 L100 92" stroke="#DCDBD5" strokeWidth={1.5} />
        </>
      ) : (
        <>
          <Figure cx={shape === "card" ? 50 : 52} base={h} scale={shape === "card" ? 1.25 : 1.3} />
          {shape === "card" ? (
            <>
              <rect x={12} y={108} width={52} height={9} fill={BARS} />
              <rect x={12} y={121} width={34} height={5} fill={BARS} />
            </>
          ) : null}
        </>
      )}
    </svg>
  );
}

/**
 * A grey example of a product in the chosen shape. With `finish`, the card wears that finish's material as
 * its frame; without it, a hairline. It lays out its own box at the shape's ratio; a caller that sizes the
 * box itself passes `h-full w-full`.
 */
export function NeutralArt({ shape, finish, className = "" }: { shape: Exclude<NeutralShape, "photo">; finish?: string; className?: string }) {
  const swatch = finish ? FINISH_SWATCH[finish] : undefined;
  const frame: CSSProperties | undefined = swatch ? { backgroundImage: swatch } : undefined;
  return (
    <span
      data-neutral={shape}
      aria-hidden="true"
      style={{ aspectRatio: NEUTRAL_RATIO[shape], ...frame }}
      className={`relative block overflow-hidden rounded-none ${swatch ? "p-[5%]" : "border border-ink/10"} ${className}`.trim()}
    >
      <span className="relative block h-full w-full overflow-hidden">
        <NeutralSvg shape={shape} />
      </span>
    </span>
  );
}

/**
 * "Your photo" — what the page shows wherever it means the parent's own photos (the hero fan, the second
 * how-it-works card). A print: square corners, a white ring, the card shadow; inside, the grey ground, the
 * drawn silhouette and the label in Barlow. Decorative: the step's own words carry the meaning.
 */
export function PhotoPlaceholder({ className = "", ring = "ring-[3px]" }: { className?: string; ring?: string }) {
  return (
    <span
      data-photo-placeholder=""
      aria-hidden="true"
      className={`@container block aspect-[3/4] overflow-hidden rounded-none bg-white shadow-[var(--shadow-card-stock)] ring-white ${ring} ${/\babsolute\b/.test(className) ? "" : "relative"} ${className}`.replace(/\s+/g, " ").trim()}
    >
      <NeutralSvg shape="photo" />
      <span className="absolute inset-x-0 bottom-[7%] text-center font-label text-[clamp(0.5rem,11cqw,0.75rem)] font-semibold uppercase leading-none tracking-[0.1em] text-muted-text">
        {INTAKE_COPY.art.photoLabel}
      </span>
    </span>
  );
}

/** Anything with a picture and its words: an art-map image (lib/intake/sport-art.ts) or an ImageSpec (lib/assets.ts). */
export interface PrintImage {
  src: string;
  alt: string;
}

/**
 * One phone photo as a print — the look of `PhotoPlaceholder` with the real photograph in it, cropped to the
 * print's 3 : 4. `decorative` drops the alt where the words beside it carry the meaning (the step cards).
 */
export function PhotoPrint({
  image,
  sizes,
  className = "",
  ring = "ring-[3px]",
  decorative = true,
  eager = false,
}: {
  image: PrintImage;
  sizes: string;
  className?: string;
  ring?: string;
  decorative?: boolean;
  eager?: boolean;
}) {
  return (
    <span
      data-photo-print=""
      className={`block aspect-[3/4] overflow-hidden rounded-none bg-hairline shadow-[var(--shadow-card-stock)] ring-white ${ring} ${/\babsolute\b/.test(className) ? "" : "relative"} ${className}`.replace(/\s+/g, " ").trim()}
    >
      <Image src={image.src} alt={decorative ? "" : image.alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} className="object-cover" />
    </span>
  );
}

/**
 * The proof watermark, drawn in CSS: "PROOF" in Anton tiled on a −24° diagonal across the whole picture
 * (every other row offset half a step, like a real proof stamp), white at 40 % with a faint hairline of ink
 * so it reads on a light card and a dark one without hiding the art. Sparse on purpose (v6, 2026-10-07: at
 * 48 tiles it sat on every face and the art looked worse than it is — the stamp must read second). Every
 * size is a share of the box (`cqw`), so a 120 px thumb and a 500 px hero carry the same pattern.
 */
export function Watermark({ className = "" }: { className?: string }) {
  return (
    <span data-watermark="" aria-hidden="true" className={`@container pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}>
      <span className="absolute left-1/2 top-1/2 grid w-[200%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] grid-cols-4 gap-x-[12cqw] gap-y-[15cqw] text-center">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className={`font-display text-[10cqw] uppercase leading-none tracking-[0.1em] text-white/40 [text-shadow:0_0_1px_rgb(20_25_31/0.35)] ${i % 8 >= 4 ? "translate-x-[50%]" : ""}`.trim()}>
            {INTAKE_COPY.art.watermark}
          </span>
        ))}
      </span>
    </span>
  );
}

/** One art-map picture filling its box, never cropped. `decorative` drops the alt (a step picture beside its title). */
export function ArtImage({
  image,
  sizes,
  decorative = false,
  eager = false,
  className = "",
}: {
  image: PrintImage;
  sizes: string;
  decorative?: boolean;
  eager?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={image.src}
      alt={decorative ? "" : image.alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className={`object-contain ${className}`.trim()}
    />
  );
}

/** The sentence for a chosen sport that has no example yet — named, or the "other" wording — and the example it shows instead. */
export const noExampleLine = (sport: string | null, example: string): string =>
  sport ? INTAKE_COPY.art.noExample(sport, example) : INTAKE_COPY.art.noExampleOther(example);

/**
 * The line under a group of pictures. `art` → C13 (every art-map picture is a fictional roster athlete);
 * `pick` → C13 and "Example shown: <example>. Pick their sport…"; `none` → C13 and built to order, with the
 * sport's name. `art` and `pick` are stacked in one grid cell and only the current one is visible, so nothing
 * below moves when a sport arrives from the link; `none` (only ever after a tap) takes the cell alone.
 */
export function ArtNote({
  state,
  sport,
  example,
  label = true,
  className = "",
}: {
  state: ArtState;
  sport: string | null;
  /** The example sport's name ("Football") — what the pictures show before a choice, or for a sport with none. */
  example: string;
  label?: boolean;
  className?: string;
}) {
  // `label={false}`: the pictures carry C13 in their own frame, so the art line stays empty and the others are one sentence.
  const c13 = label ? <FictionalLabel /> : null;
  const sentence = (text: string) => (
    <span className={`block max-w-[60ch] font-body text-small font-medium text-pretty text-ink ${c13 ? "mt-2" : "border-t border-hairline pt-2"}`}>{text}</span>
  );
  // `art` and `pick` share one cell: the server renders `pick` and a sport from the link turns it into `art` with no
  // tap, so the slot keeps the taller one's height (CLS 0). `none` only ever follows a tap (Other, or a sport with no
  // example), so it replaces the stack instead of reserving its three lines for everyone.
  const lines: [ArtState, ReactNode][] =
    state === "none"
      ? [
          [
            "none",
            <span key="none" className="block">
              {c13}
              {sentence(noExampleLine(sport, example))}
            </span>,
          ],
        ]
      : [
          ["art", c13],
          [
            "pick",
            <span key="pick" className="block">
              {c13}
              {sentence(INTAKE_COPY.art.pick(example))}
            </span>,
          ],
        ];
  return (
    <div data-art-note={state} aria-live="polite" className={`grid ${className}`.trim()}>
      {lines.map(([s, node]) => (
        <div key={s} aria-hidden={s === state ? undefined : true} className={`col-start-1 row-start-1 ${s === state ? "" : "invisible"}`.trim()}>
          {node}
        </div>
      ))}
    </div>
  );
}

// --- the how-it-works pictures (components/ProofPath.tsx draws the box; these fill it) ------------

/** Every step picture's print look: square corners, a white ring, the card shadow. */
const PRINT = "absolute overflow-hidden rounded-none bg-hairline shadow-[var(--shadow-card-stock)] ring-[3px] ring-white";
/** The step box is the card's inner width × 140–200 px: a picture in it is never drawn wider than ~150 px. */
export const STEP_ART_SIZES = "(min-width: 1280px) 150px, (min-width: 768px) 130px, 100px";

/**
 * Card 01 — the sports in the fan, each in the finish its poster leads with (lib/assets.ts FP_SPORTS): four
 * sports, four finishes (Heritage, Prism Rush, Stadium Night, Chrome All-Star). The one picture on /free-proof
 * that shows more than one sport, on purpose (owner, 2026-10-07: "show several sports in different styles";
 * later the same day: "not the cheer card here" — baseball took its place) — this card IS the sport-and-style
 * choice.
 */
export const FAN_SPORTS = ["football", "volleyball", "basketball", "baseball"] as const;

/** The three phone photos every sport carries, in the order the art map lists them (lib/assets.ts FP_PHOTO_NUMBERS = 1, 4, 2). */
export const PHOTO_SHOTS = ["everyday", "smile", "kit"] as const;
export type PhotoShot = (typeof PHOTO_SHOTS)[number];
/** The `before/photo<n>.png` behind each shot — tested against FP_PHOTO_NUMBERS, never read on the client. */
export const PHOTO_SHOT_NUMBER: Record<PhotoShot, number> = { everyday: 1, smile: 4, kit: 2 };

/**
 * Card 02 — the mini mix of phone photos that works on every page (owner, 2026-10-07: "more of them — a couple
 * of athletes mixed, a couple of different kits and clothes, men and women"): five roster athletes, three in kit
 * and two in everyday clothes, three boys and two girls, in the order they fan. Fixed like card 01: the upload
 * is the same whatever sport is chosen.
 */
export const MIX_PHOTOS: readonly { slug: string; shot: PhotoShot }[] = [
  { slug: "football", shot: "smile" },
  { slug: "volleyball", shot: "kit" },
  { slug: "softball", shot: "everyday" },
  { slug: "basketball", shot: "kit" },
  { slug: "baseball", shot: "kit" },
];

/** Where each poster of the fan lies: a hand of four, the outer two lower and turned out, the right on top. */
const FAN = ["left-[2%] top-[12%] z-10 -rotate-[8deg]", "left-[22%] top-[4%] z-20 -rotate-[3deg]", "left-[42%] top-[4%] z-30 rotate-[3deg]", "left-[62%] top-[12%] z-40 rotate-[8deg]"] as const;

/** Card 01: four posters fanned like a hand of cards; a grey poster in any slot without an image. */
export function StepFan({ posters }: { posters: readonly (PrintImage | null)[] }) {
  return (
    <>
      {FAN.map((place, i) => (
        <span key={i} className={`${PRINT} aspect-[3/4] w-[34%] ${place}`}>
          {posters[i] ? <ArtImage image={posters[i]} sizes={STEP_ART_SIZES} decorative /> : <NeutralArt shape="poster" className="h-full w-full" />}
        </span>
      ))}
    </>
  );
}

/** Where each of the five photos lies: a loose fan, the outer ones lower and turned out, the right on top. */
const PILE = [
  "left-[1%] top-[16%] z-10 -rotate-[9deg]",
  "left-[18%] top-[4%] z-20 -rotate-[4deg]",
  "left-[35%] top-[10%] z-30 rotate-[1deg]",
  "left-[52%] top-[3%] z-40 rotate-[5deg]",
  "left-[69%] top-[15%] z-50 rotate-[10deg]",
] as const;

/** Card 02: the five phone photos of the mix fanned on the page; a grey "your photo" print in any slot without one. */
export function StepPhotos({ photos }: { photos: readonly (PrintImage | null)[] }) {
  return (
    <>
      {PILE.map((place, i) => {
        const photo = photos[i] ?? null;
        const className = `absolute w-[30%] ${place}`;
        return photo ? <PhotoPrint key={i} image={photo} sizes={STEP_ART_SIZES} className={className} /> : <PhotoPlaceholder key={i} className={className} />;
      })}
    </>
  );
}

/**
 * Card 03 — what makes the work ours (owner, 2026-10-07: "explain how we are different"): the athlete's
 * identity plate (three views) and kit plate, both built from the photos and checked before any design.
 * Two prints, the kit lying over the plate's lower-right corner; a plain grey print where one is missing.
 */
export function StepLikeness({ identity, kit }: { identity: PrintImage | null; kit: PrintImage | null }) {
  return (
    <>
      <span data-likeness="identity" className={`${PRINT} left-[2%] top-[5%] z-10 aspect-[600/448] w-[62%] -rotate-2`}>
        {identity ? <ArtImage image={identity} sizes={STEP_ART_SIZES} decorative /> : null}
      </span>
      <span data-likeness="kit" className={`${PRINT} bottom-[5%] right-[2%] z-20 aspect-square w-[42%] rotate-3`}>
        {kit ? <ArtImage image={kit} sizes={STEP_ART_SIZES} decorative /> : null}
      </span>
    </>
  );
}

/**
 * Card 04 — the proof as the parent receives it: the poster and the card front on a dark proof sheet under
 * the PROOF watermark, the stamp line along its foot. Composed in code from the shown sport's art, so every
 * sport has one and the sheet is never another sport's.
 */
export function StepProofSheet({ poster, card, finish }: { poster: PrintImage | null; card: PrintImage | null; finish?: string }) {
  return (
    <span data-proof-sheet="" className={`${PRINT} inset-x-[3%] inset-y-[3%] bg-arena`}>
      <span className="absolute inset-x-0 bottom-[14%] top-0 flex items-center justify-center gap-[4%] px-[4%]">
        <span className="relative block aspect-[3/4] h-[84%] shrink-0 overflow-hidden">
          {poster ? <ArtImage image={poster} sizes={STEP_ART_SIZES} decorative /> : <NeutralArt shape="poster" className="h-full w-full" />}
        </span>
        <span className="relative block aspect-[5/7] h-[72%] shrink-0 overflow-hidden">
          {card ? <ArtImage image={card} sizes={STEP_ART_SIZES} decorative /> : <NeutralArt shape="card" finish={finish} className="h-full w-full" />}
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 flex h-[14%] items-center justify-center px-[4%] font-label text-[0.5rem] font-semibold uppercase leading-none tracking-[0.14em] text-white/70">
        {INTAKE_COPY.art.proofStamp}
      </span>
      <Watermark />
    </span>
  );
}

/** Card 05 (and any slot without a picture of its own): the approval tick. */
export function StepTick() {
  return (
    <span className="absolute inset-0 flex items-center justify-center text-ink">
      <CheckCircleIcon strokeWidth={1.25} className="h-[62%] w-auto" />
    </span>
  );
}
