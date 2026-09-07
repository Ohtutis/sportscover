import { ALT_TO_SCALE } from "../lib/alt";

/**
 * The to-scale sheet on /posters (DESIGN §4.15): pure SVG, one unit = one inch. A 5 ft 9 in outlined
 * figure, the floor, the dashed 58 in hang line, and the 18 × 24 and 24 × 36 posters hung at that
 * centre. Replaces the listing slide that could not be cropped text-free (finding 9). No photo, no cutout.
 *
 * The sheet must not contradict its own label: `hangY` is derived from the floor and HANG_HEIGHT_IN,
 * and each poster's `y` from that centre, so a centre can never drift off the 58 in line (it used to
 * sit at 22 in — knee height — while the label said 58). The label lives in the clear band left of
 * the figure; the posters are drawn as frames — hairline mount inside an ink edge, ink type on a pale
 * ground — because a solid fill at this size reads as an image that failed to load.
 */
const FLOOR_Y = 80;
/** Museum hang: the centre of the picture 58 in above the floor. */
export const HANG_HEIGHT_IN = 58;

export const SHEET = {
  viewBox: "0 0 96 84",
  floorY: FLOOR_Y,
  hangY: FLOOR_Y - HANG_HEIGHT_IN,
  figure: { x: 35, headTop: 11, headR: 3, shoulderY: 19, shoulderHalf: 8, hipY: 50 },
  poster1824: { x: 47, y: FLOOR_Y - HANG_HEIGHT_IN - 24 / 2, w: 18, h: 24 },
  poster2436: { x: 68, y: FLOOR_Y - HANG_HEIGHT_IN - 36 / 2, w: 24, h: 36 },
} as const;

/** The centre of each poster, in inches above the floor — both are the hang height, by construction. */
export const posterCentreIn = (poster: { y: number; h: number }): number => SHEET.floorY - (poster.y + poster.h / 2);

const LABEL = "font-label font-semibold uppercase tracking-[0.06em] fill-[var(--color-ink)]";

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

export function ToScaleSheet({ className = "" }: { className?: string }) {
  const f = SHEET.figure;
  const a = SHEET.poster1824;
  const b = SHEET.poster2436;
  const headCy = f.headTop + f.headR;
  return (
    <svg viewBox={SHEET.viewBox} role="img" aria-label={ALT_TO_SCALE} className={`h-auto w-full ${className}`.trim()}>
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
      <g fill="none" stroke="var(--color-ink)" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
        <circle cx={f.x} cy={headCy} r={f.headR} />
        <path
          d={`M${f.x} ${headCy + f.headR}V${f.shoulderY} M${f.x - f.shoulderHalf} ${f.shoulderY}H${f.x + f.shoulderHalf} M${f.x - f.shoulderHalf} ${f.shoulderY}V${f.hipY - 8} M${f.x + f.shoulderHalf} ${f.shoulderY}V${f.hipY - 8} M${f.x} ${f.shoulderY}V${f.hipY} M${f.x} ${f.hipY}L${f.x - 4} ${SHEET.floorY} M${f.x} ${f.hipY}L${f.x + 4} ${SHEET.floorY}`}
        />
      </g>
      <text x={f.x} y={SHEET.floorY + 3} fontSize="2" textAnchor="middle" className={LABEL}>
        5 FT 9 IN
      </text>
      {/* 18 × 24, centre on the hang line */}
      <PosterFrame x={a.x} y={a.y} w={a.w} h={a.h} size="18 × 24" title="18 × 24 in poster" />
      <text x={a.x + a.w / 2} y={a.y - 1.2} fontSize="2" textAnchor="middle" className={LABEL}>
        18 IN
      </text>
      <text x={a.x - 1.2} y={a.y + a.h / 2} fontSize="2" textAnchor="middle" transform={`rotate(-90 ${a.x - 1.2} ${a.y + a.h / 2})`} className={LABEL}>
        24 IN
      </text>
      {/* 24 × 36, centre on the same line */}
      <PosterFrame x={b.x} y={b.y} w={b.w} h={b.h} size="24 × 36" title="24 × 36 in poster" />
      <text x={b.x + b.w / 2} y={b.y - 1.2} fontSize="2" textAnchor="middle" className={LABEL}>
        24 IN
      </text>
      <text x={b.x + b.w + 1.2} y={b.y + b.h / 2} fontSize="2" textAnchor="middle" transform={`rotate(90 ${b.x + b.w + 1.2} ${b.y + b.h / 2})`} className={LABEL}>
        36 IN
      </text>
    </svg>
  );
}
