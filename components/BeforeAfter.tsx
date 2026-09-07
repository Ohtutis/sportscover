import Image from "next/image";
import type { ReactNode } from "react";
import type { ImageSpec } from "./CardFace";
import { FictionalLabel } from "./FictionalLabel";

/**
 * The one recurring device (DESIGN §4.16): a phone photo pinned flat on the stock mat (3 : 4,
 * 6 px white ring, C13 in frame) → the accent arrow → the product. `after` is always product —
 * CardFaces and/or a poster box — never a pose render, never a pack face. The arrow is never
 * animated; it turns downward on mobile (and everywhere with `arrow="down"`). Without `before` the
 * device is arrow + after (home §05: card back → EditionPanel).
 */
export interface BeforeAfterProps {
  before?: ImageSpec;
  /** A composed "before" (e.g. four photos) instead of one image. */
  beforeNode?: ReactNode;
  after: ReactNode;
  arrow?: "auto" | "right" | "down";
  beforeSizes?: string;
  /** Accessible name of the whole device. */
  label?: string;
  className?: string;
}

export function Arrow({ direction = "auto", className = "" }: { direction?: "auto" | "right" | "down"; className?: string }) {
  const size = direction === "down" ? "h-14 w-6 rotate-90" : direction === "right" ? "h-6 w-14" : "h-14 w-6 rotate-90 lg:h-6 lg:w-14 lg:rotate-0";
  return (
    <svg viewBox="0 0 56 24" aria-hidden="true" focusable="false" className={`shrink-0 stroke-accent ${size} ${className}`.trim()}>
      <path d="M2 12h46M40 4l8 8-8 8" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BeforeAfter({ before, beforeNode, after, arrow = "auto", beforeSizes = "(min-width: 1024px) 168px, 40vw", label, className = "" }: BeforeAfterProps) {
  const hasBefore = Boolean(before || beforeNode);
  const layout =
    arrow === "down"
      ? "flex flex-col items-center gap-3"
      : arrow === "right"
        ? "grid grid-cols-[auto_auto_1fr] items-center gap-4 lg:gap-6"
        : "flex flex-col items-center gap-3 lg:grid lg:grid-cols-[auto_auto_1fr] lg:gap-6";
  // The before box holds an `Image fill` (out of flow), so it has no intrinsic width: inside the
  // `auto` grid track a percentage width resolves to 0 and the whole column collapses. It gets an
  // explicit width wherever the grid layout applies, and the percentage only in the flex column.
  const beforeBox =
    arrow === "down" ? "w-full max-w-[168px]" : arrow === "right" ? "w-[168px]" : "w-full max-w-[168px] lg:w-[168px]";
  return (
    <div aria-label={label} role={label ? "group" : undefined} className={`${layout} ${className}`.trim()}>
      {hasBefore ? (
        <div className={`relative shrink-0 ${beforeBox}`}>
          {beforeNode ?? (before ? (
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none ring-[6px] ring-white shadow-[var(--shadow-card-stock)]">
              <Image src={before.src} alt={before.alt} fill sizes={beforeSizes} className="object-cover" />
              {before.fictional !== false ? <FictionalLabel inFrame compact /> : null}
            </div>
          ) : null)}
        </div>
      ) : null}
      <Arrow direction={arrow} />
      <div className="min-w-0 w-full">{after}</div>
    </div>
  );
}
