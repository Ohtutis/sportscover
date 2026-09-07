import Image from "next/image";
import { ALT_TO_SCALE } from "../lib/alt";
import type { ImageSpec } from "./CardFace";

/**
 * The to-scale sheet on /posters (DESIGN §4.15): one unit = one inch. A 5 ft 9 in figure, the floor,
 * the dashed 58 in hang line, and the 18 × 24 and 24 × 36 posters hung at that centre.
 *
 * Two things changed on 2026-09-07 (owner review). **The posters carry the real artwork**: the biggest
 * object on the posters page used to be a stick figure between two empty grey rectangles, which is a
 * diagram of a product rather than the product. The frames are next/image boxes positioned in the same
 * inch grid as the drawing, so the size comparison is still exact and the art is the thing being sized.
 * **The figure is a person, not a stick**: the same 69 in tall, the same 16 in across the shoulders,
 * drawn as a filled outline so it reads as a ruler with a body rather than as clip art.
 *
 * The sheet must not contradict its own label: `hangY` is derived from the floor and HANG_HEIGHT_IN,
 * and each poster's `y` from that centre, so a centre can never drift off the 58 in line (it used to
 * sit at 22 in — knee height — while the label said 58). The label lives in the clear band left of
 * the figure. With no artwork the posters are drawn as frames — hairline mount inside an ink edge, ink
 * type on a pale ground — because a solid fill at this size reads as an image that failed to load.
 */
const FLOOR_Y = 80;
/** Museum hang: the centre of the picture 58 in above the floor. */
export const HANG_HEIGHT_IN = 58;

export const SHEET = {
  viewBox: "0 0 96 84",
  width: 96,
  height: 84,
  floorY: FLOOR_Y,
  hangY: FLOOR_Y - HANG_HEIGHT_IN,
  figure: { x: 35, headTop: 11, headR: 3, shoulderY: 19, shoulderHalf: 8, hipY: 50 },
  poster1824: { x: 47, y: FLOOR_Y - HANG_HEIGHT_IN - 24 / 2, w: 18, h: 24 },
  poster2436: { x: 68, y: FLOOR_Y - HANG_HEIGHT_IN - 36 / 2, w: 24, h: 36 },
} as const;

/** The centre of each poster, in inches above the floor — both are the hang height, by construction. */
export const posterCentreIn = (poster: { y: number; h: number }): number => SHEET.floorY - (poster.y + poster.h / 2);

/** A box in the inch grid, as CSS percentages of the sheet — one scale for the drawing and the art. */
export const boxStyle = (b: { x: number; y: number; w: number; h: number }) => ({
  left: `${(b.x / SHEET.width) * 100}%`,
  top: `${(b.y / SHEET.height) * 100}%`,
  width: `${(b.w / SHEET.width) * 100}%`,
  height: `${(b.h / SHEET.height) * 100}%`,
});

const LABEL = "font-label font-semibold uppercase tracking-[0.06em] fill-[var(--color-ink)]";

/**
 * The 5 ft 9 in figure, in inches: head top at y = 11, feet on the floor at y = 80. Half the outline is
 * written out — down the left side from the neck to the crotch — and mirrored, so the two sides can
 * never drift apart. Proportions are the standard adult ones at this height: 9 in head, 16 in across
 * the shoulders, fingertips 26 in off the floor, knees at 19 in.
 */
const HALF: readonly (readonly [number, number])[] = [
  [-1.6, 19.0], // neck
  [-1.9, 21.6],
  [-4.6, 22.6], // trapezius
  [-7.2, 24.4], // shoulder
  [-8.0, 27.0], // deltoid, 16 in across
  [-7.5, 34.0],
  [-6.9, 42.5], // elbow
  [-6.2, 50.5], // wrist
  [-5.9, 54.5], // fingertips, 26 in off the floor
  [-4.4, 54.3],
  [-4.8, 50.0],
  [-5.3, 42.5],
  [-5.1, 30.0], // armpit
  [-4.4, 37.5], // waist
  [-6.0, 45.5], // hip
  [-6.1, 50.0],
  [-4.9, 61.5], // knee, 19 in off the floor
  [-3.4, 72.0],
  [-3.1, 77.5], // ankle
  [-4.7, 80.0], // toe, on the floor
  [-1.0, 80.0],
  [-1.3, 77.5],
  [-1.9, 61.5],
  [-1.3, 49.0],
  [0, 46.0], // crotch
];

function figurePath(cx: number): string {
  const left = HALF.map(([dx, y]) => `${cx + dx} ${y}`);
  const right = [...HALF].reverse().slice(1).map(([dx, y]) => `${cx - dx} ${y}`);
  return `M${left.join("L")}L${right.join("L")}Z`;
}

export interface PosterArt {
  /** The 18 × 24 frame (3 : 4 — the art's own ratio, so nothing is cropped). */
  small: ImageSpec;
  /** The 24 × 36 frame (2 : 3 — the same design, cropped to the taller sheet). */
  large: ImageSpec;
}

function PosterFrame({ x, y, w, h, size, title }: { x: number; y: number; w: number; h: number; size: string; title: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="var(--color-arena)" fillOpacity="0.06" stroke="var(--color-ink)" strokeWidth="0.25" vectorEffect="non-scaling-stroke">
        <title>{title}</title>
      </rect>
      <rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} fill="none" stroke="var(--color-hairline)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
      <text x={x + w / 2} y={y + h / 2 + 1} fontSize="3" textAnchor="middle" fill="var(--color-ink)" className="font-display">
        {size}
      </text>
    </g>
  );
}

export interface ToScaleSheetProps {
  /** The artwork hung in the two frames. Without it the frames are drawn empty, exactly as before. */
  art?: PosterArt | null;
  sizes?: string;
  className?: string;
}

export function ToScaleSheet({ art, sizes = "(min-width: 1024px) 260px, 30vw", className = "" }: ToScaleSheetProps) {
  const f = SHEET.figure;
  const a = SHEET.poster1824;
  const b = SHEET.poster2436;
  return (
    <div className={`relative w-full ${className}`.trim()} style={{ aspectRatio: `${SHEET.width} / ${SHEET.height}` }}>
      {art ? (
        <>
          {/* alt="" on purpose: the sheet is ONE figure and the SVG over it carries its label. The two
              frames hold the same design at two sizes, so real alt text here would say the identical
              sentence twice inside a picture that has already named itself. */}
          <div className="absolute overflow-hidden shadow-[var(--shadow-card-stock)]" style={boxStyle(a)}>
            <Image src={art.small.src} alt="" fill sizes={sizes} className="object-cover" />
          </div>
          <div className="absolute overflow-hidden shadow-[var(--shadow-card-stock)]" style={boxStyle(b)}>
            <Image src={art.large.src} alt="" fill sizes={sizes} className="object-cover" />
          </div>
        </>
      ) : null}
      <svg viewBox={SHEET.viewBox} role="img" aria-label={ALT_TO_SCALE} className="absolute inset-0 h-full w-full">
        <title>{ALT_TO_SCALE}</title>
        {/* floor */}
        <line x1="0" y1={SHEET.floorY} x2="96" y2={SHEET.floorY} stroke="var(--color-hairline)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        {/* 58 in hang line */}
        <line
          x1="0"
          y1={SHEET.hangY}
          x2="96"
          y2={SHEET.hangY}
          stroke="var(--color-ink)"
          strokeOpacity="0.4"
          strokeWidth="0.25"
          strokeDasharray="1 1"
          vectorEffect="non-scaling-stroke"
        />
        {/* the label sits in the clear band left of the figure, never across it */}
        <text x="0.6" y={SHEET.hangY - 1.4} fontSize="2" className={LABEL}>
          {/* one text node: the number is asserted against HANG_HEIGHT_IN in tests/components.test.ts */}
          58 IN · HANG CENTER
        </text>
        {/* the 5 ft 9 in figure: head top at y = 11, feet on the floor at y = 80 → 69 in */}
        <g fill="var(--color-ink)" fillOpacity="0.14" stroke="var(--color-ink)" strokeWidth="0.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
          <ellipse cx={f.x} cy={15.2} rx={2.7} ry={4.2} />
          <path d={figurePath(f.x)} />
        </g>
        <text x={f.x} y={SHEET.floorY + 3} fontSize="2" textAnchor="middle" className={LABEL}>
          5 FT 9 IN
        </text>
        {/* 18 × 24, centre on the hang line — the frame edge is drawn over the artwork, never instead of it */}
        {art ? (
          <rect x={a.x} y={a.y} width={a.w} height={a.h} fill="none" stroke="var(--color-ink)" strokeWidth="0.25" vectorEffect="non-scaling-stroke">
            <title>18 × 24 in poster</title>
          </rect>
        ) : (
          <PosterFrame x={a.x} y={a.y} w={a.w} h={a.h} size="18 × 24" title="18 × 24 in poster" />
        )}
        <text x={a.x + a.w / 2} y={a.y - 1.2} fontSize="2" textAnchor="middle" className={LABEL}>
          18 IN
        </text>
        <text x={a.x - 1.2} y={a.y + a.h / 2} fontSize="2" textAnchor="middle" transform={`rotate(-90 ${a.x - 1.2} ${a.y + a.h / 2})`} className={LABEL}>
          24 IN
        </text>
        {/* 24 × 36, centre on the same line */}
        {art ? (
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none" stroke="var(--color-ink)" strokeWidth="0.25" vectorEffect="non-scaling-stroke">
            <title>24 × 36 in poster</title>
          </rect>
        ) : (
          <PosterFrame x={b.x} y={b.y} w={b.w} h={b.h} size="24 × 36" title="24 × 36 in poster" />
        )}
        <text x={b.x + b.w / 2} y={b.y - 1.2} fontSize="2" textAnchor="middle" className={LABEL}>
          24 IN
        </text>
        <text x={b.x + b.w + 1.2} y={b.y + b.h / 2} fontSize="2" textAnchor="middle" transform={`rotate(90 ${b.x + b.w + 1.2} ${b.y + b.h / 2})`} className={LABEL}>
          36 IN
        </text>
      </svg>
    </div>
  );
}
