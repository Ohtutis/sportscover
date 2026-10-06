import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { INTAKE_COPY } from "../../lib/intake/copy";
import type { FreeProofImage } from "../../lib/intake/sport-art";
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
 * (every other row offset half a step, like a real proof stamp), white at 50 % with a faint hairline of ink
 * so it reads on a light card and a dark one without hiding the art. Every size is a share of
 * the box (`cqw`), so a 120 px thumb and a 500 px hero carry the same pattern.
 */
export function Watermark({ className = "" }: { className?: string }) {
  return (
    <span data-watermark="" aria-hidden="true" className={`@container pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}>
      <span className="absolute left-1/2 top-1/2 grid w-[200%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] grid-cols-6 gap-x-[8cqw] gap-y-[10cqw] text-center">
        {Array.from({ length: 48 }, (_, i) => (
          <span key={i} className={`font-display text-[7cqw] uppercase leading-none tracking-[0.08em] text-white/50 [text-shadow:0_0_1px_rgb(20_25_31/0.3)] ${i % 12 >= 6 ? "translate-x-[50%]" : ""}`.trim()}>
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
  image: FreeProofImage;
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

// --- the four how-it-works pictures (components/ProofPath.tsx draws the box; these fill it) ----------

/** Every step picture's print look: square corners, a white ring, the card shadow. */
const PRINT = "absolute overflow-hidden rounded-none bg-hairline shadow-[var(--shadow-card-stock)] ring-[3px] ring-white";
/** The step box is the card's inner width × 140–200 px: a picture in it is never drawn wider than ~150 px. */
export const STEP_ART_SIZES = "(min-width: 1280px) 150px, (min-width: 768px) 130px, 100px";

/** Step 01 in a sport: its poster and a card front, laid on the page; the grey pair before a sport. */
export function StepPair({ poster, card, finish }: { poster: FreeProofImage | null; card: FreeProofImage | null; finish?: string }) {
  return (
    <>
      <span className={`${PRINT} left-[6%] top-[2%] aspect-[3/4] h-[86%] -rotate-3`}>
        {poster ? <ArtImage image={poster} sizes={STEP_ART_SIZES} decorative /> : <NeutralArt shape="poster" className="h-full w-full" />}
      </span>
      <span className={`${PRINT} bottom-[2%] right-[6%] aspect-[5/7] h-[80%] rotate-3`}>
        {card ? <ArtImage image={card} sizes={STEP_ART_SIZES} decorative /> : <NeutralArt shape="card" finish={finish} className="h-full w-full" />}
      </span>
    </>
  );
}

/**
 * Step 02: two phone photos — the example athlete's own (the smile behind, the photo in uniform in front), or
 * the grey "your photo" prints where none is given.
 */
export function StepPhotos({ photos }: { photos?: readonly PrintImage[] | null }) {
  const back = "absolute left-[10%] top-[3%] h-[84%] w-auto -rotate-6";
  const front = "absolute right-[10%] top-[9%] h-[84%] w-auto rotate-[5deg]";
  if (photos && photos.length >= 2) {
    const [behind, onTop] = photos.slice(-2);
    return (
      <>
        <PhotoPrint image={behind} sizes={STEP_ART_SIZES} className={back} />
        <PhotoPrint image={onTop} sizes={STEP_ART_SIZES} className={front} />
      </>
    );
  }
  return (
    <>
      <PhotoPlaceholder className={back} />
      <PhotoPlaceholder className={front} />
    </>
  );
}

/** Step 03 in a sport: the card front with the PROOF watermark over it; the grey card before a sport. */
export function StepProofCard({ card, finish }: { card: FreeProofImage | null; finish?: string }) {
  return (
    <span className={`${PRINT} left-1/2 top-0 aspect-[5/7] h-full -translate-x-1/2`}>
      {card ? <ArtImage image={card} sizes={STEP_ART_SIZES} decorative /> : <NeutralArt shape="card" finish={finish} className="h-full w-full" />}
      <Watermark />
    </span>
  );
}

/** Step 04 everywhere: the approval tick. */
export function StepTick() {
  return (
    <span className="absolute inset-0 flex items-center justify-center text-ink">
      <CheckCircleIcon strokeWidth={1.25} className="h-[62%] w-auto" />
    </span>
  );
}
