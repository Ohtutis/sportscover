import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FAMILY_LABELS, formatUsd, type Family } from "../lib/catalog/prices";
import type { ImageSpec } from "./CardFace";
import { FictionalLabel } from "./FictionalLabel";
import { ArrowRightIcon } from "./icons";
import { Mat } from "./Mat";

/**
 * One of the three product families on the home page (DESIGN §5.1-03): media in a 4 : 5 arena mat
 * (`media` = CardFaces composed by the page, or `image` = a room shot filling the box), the family
 * name, "from {price}", three truths and the CTA. The whole card is one link.
 */
export interface FamilyCardProps {
  family: Family;
  /** fromPrice(family, now) — rendered with formatUsd, never typed. */
  from: number;
  truths: [string, string, string];
  /** A photo that fills the 4 : 5 box (the poster room shot). */
  image?: ImageSpec;
  /** Composed faces on the arena mat (cards, complete set). Wins over `image`. */
  media?: ReactNode;
  /** The composed media shows a fictional athlete and the page has not labelled the group. */
  fictional?: boolean;
  href: string;
  cta: string;
  sizes?: string;
  className?: string;
}

export function FamilyCard({
  family,
  from,
  truths,
  image,
  media,
  fictional,
  href,
  cta,
  sizes = "(min-width: 1024px) 400px, (min-width: 768px) 45vw, 90vw",
  className = "",
}: FamilyCardProps) {
  const showLabel = fictional ?? image?.fictional ?? false;
  return (
    <article className={`h-full ${className}`.trim()}>
      <Link
        href={href}
        className="group flex h-full flex-col rounded-ui border border-hairline bg-stock p-4 transition-[border-color] duration-hover ease-out hover:border-ink lg:p-6"
      >
        {media ? (
          <Mat tone="arena" aspect="aspect-[4/5]" plate={false} className="overflow-hidden rounded-ui">
            {media}
          </Mat>
        ) : image ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-ui bg-arena">
            <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover object-[50%_38%]" />
          </div>
        ) : null}
        {showLabel ? <FictionalLabel className="mt-2" /> : null}
        <h3 className="mt-5 font-display text-h3 uppercase">{FAMILY_LABELS[family]}</h3>
        <p className="mt-1 font-body text-[1.25rem] font-bold tabular-nums">from {formatUsd(from)}</p>
        <ul className="mt-4 space-y-2 font-body text-[0.9375rem] text-ink">
          {truths.map((truth) => (
            <li key={truth} className="flex gap-2">
              <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-ink" />
              <span>{truth}</span>
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-2 pt-6 font-body text-small font-medium text-ink">
          {cta}
          <ArrowRightIcon size={16} className="text-accent transition-transform duration-hover ease-out group-hover:translate-x-0.5" />
        </span>
      </Link>
    </article>
  );
}
