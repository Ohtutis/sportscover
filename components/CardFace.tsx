import Image from "next/image";
import { FictionalLabel } from "./FictionalLabel";

/**
 * Every card image goes through here (DESIGN §4.4): a 5 : 7 box, `object-contain` (a card is never
 * cropped), radius 0, the card shadow of its surface, and C13 under the face when the athlete is
 * fictional — unless `labelled`, for a group whose parent renders the label once. The corner audit is
 * a build gate on the asset, never CSS: no mask, no scale, no crop lives here.
 */
export interface ImageSpec {
  src: string;
  alt: string;
  width: number;
  height: number;
  fictional?: boolean;
  /** AVIF sibling for LCP keys (lib/assets.ts); unused by CardFace, carried for pages. */
  avif?: string;
}

export interface CardFaceProps extends ImageSpec {
  surface?: "stock" | "arena";
  /** A group parent renders C13 once — suppress the per-face label. */
  labelled?: boolean;
  priority?: boolean;
  sizes?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  /** Fill the parent box (a flip face) instead of laying out its own 5 : 7 box. */
  fill?: boolean;
  className?: string;
}

export const CARD_SIZES_DEFAULT = "(min-width: 768px) 360px, 80vw";

export function CardFace({
  src,
  alt,
  surface = "stock",
  fictional,
  labelled,
  priority,
  sizes = CARD_SIZES_DEFAULT,
  loading,
  fetchPriority,
  fill,
  className = "",
}: CardFaceProps) {
  const shadow =
    surface === "arena"
      ? "shadow-[var(--shadow-card-arena)] after:pointer-events-none after:absolute after:inset-0 after:ring-1 after:ring-inset after:ring-white/10"
      : "shadow-[var(--shadow-card-stock)]";
  const box = fill ? "absolute inset-0" : "relative aspect-[5/7] w-full";
  const face = (
    <div className={`${box} overflow-hidden rounded-none ${shadow} ${className}`.trim()}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} loading={loading} fetchPriority={fetchPriority} className="object-contain" />
    </div>
  );
  if (fictional && !labelled && !fill) {
    return (
      <div className="w-full">
        {face}
        <FictionalLabel tone={surface} className="mt-2" />
      </div>
    );
  }
  return face;
}
