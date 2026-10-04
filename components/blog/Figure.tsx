import Image from "next/image";
import { CardFace } from "../CardFace";
import { FictionalLabel } from "../FictionalLabel";
import { assetOrNull, type ImageSpec } from "../../lib/assets";

/**
 * A post's picture. The manifest is the only door (DESIGN §6.1): a figure names `lib/assets.ts` keys,
 * never a path, so an unknown key throws at build time and a key still marked `locate` simply renders
 * nothing. Every image on the site today is a fictional roster athlete, and C13 is not optional
 * (DESIGN §4.22): whenever one of the pictures is fictional the caption ends with <FictionalLabel />.
 *
 * Variants follow the radius rule (DESIGN §4): `photo` is a photograph (rounded-ui); `artefact` depicts
 * a card, proof or plate (radius 0); `card` is a card face through CardFace (5 : 7, never cropped).
 * Several keys make a two-column set — the "four photos from one phone" kind of exhibit. A set's cells
 * share the first picture's orientation (3 : 4 portrait, 1 : 1 square, 4 : 3 landscape), so a row of
 * square product tiles is never cropped to the portrait box a row of phone photos needs.
 */
export type FigureVariant = "photo" | "artefact" | "card";

export interface FigureProps {
  /** One `lib/assets.ts` key, or several for a set. */
  asset: string | string[];
  /** A plain description of what the picture shows — never a claim the picture cannot carry. */
  caption?: string;
  variant?: FigureVariant;
  sizes?: string;
}

export function Figure({ asset, caption, variant = "photo", sizes }: FigureProps) {
  const keys = Array.isArray(asset) ? asset : [asset];
  const specs = keys.map((key) => assetOrNull(key)).filter((spec): spec is ImageSpec => Boolean(spec));
  if (!specs.length) return null;
  const fictional = specs.some((spec) => spec.fictional);
  const set = specs.length > 1;
  const ratio = specs[0].width / specs[0].height;
  const cell = Math.abs(ratio - 1) < 0.05 ? "aspect-square" : ratio < 1 ? "aspect-[3/4]" : "aspect-[4/3]";

  const picture = (spec: ImageSpec) => {
    if (variant === "card") {
      return <CardFace key={spec.src} {...spec} labelled sizes={sizes ?? "(min-width: 640px) 260px, 60vw"} />;
    }
    return (
      <Image
        key={spec.src}
        src={spec.src}
        alt={spec.alt}
        width={spec.width}
        height={spec.height}
        sizes={sizes ?? (set ? "(min-width: 768px) 300px, 45vw" : "(min-width: 768px) 640px, 92vw")}
        className={`h-auto w-full ${set ? `${cell} object-cover` : ""} ${variant === "photo" ? "rounded-ui" : "rounded-none"}`.replace(/\s+/g, " ").trim()}
      />
    );
  };

  return (
    <figure data-blog-figure="" className="mt-10">
      {variant === "card" ? (
        <div className={set ? "grid max-w-[34rem] grid-cols-2 gap-4" : "w-[220px] sm:w-[260px]"}>{specs.map(picture)}</div>
      ) : set ? (
        <div className="grid grid-cols-2 gap-3">{specs.map(picture)}</div>
      ) : (
        picture(specs[0])
      )}
      {caption || fictional ? (
        <figcaption className="mt-3">
          {caption ? <span className="block font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-muted-text">{caption}</span> : null}
          {fictional ? <FictionalLabel className={caption ? "mt-2" : ""} /> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
