import Image from "next/image";
import Link from "next/link";
import { CardFace } from "../../../../components/CardFace";
import { FictionalLabel } from "../../../../components/FictionalLabel";
import { assetOrNull } from "../../../../lib/assets";
import { finishes } from "../../../../lib/catalog/styles";
import { Section } from "./section";

/**
 * Section 04 — one athlete, six finishes (COPY §2.2 (4), DESIGN §5.2-4). One athlete, six materials,
 * one layout: the tiles differ only in the finish. **No mat**: the art is already dark, so a dark 8 %
 * mat behind it was a grey box the tile spent a quarter of its area on (owner review, 2026-09-07). The
 * face floats on the page's own stock with the card shadow and fills the tile edge to edge. Finish names are Space Grotesk 700 uppercase text
 * (GAPS #15 — no finish fonts and no SVG labels outside `/c`), and the row carries C13 once for the
 * whole group. The card row uses the six basketball fronts; the poster row the six football posters —
 * one athlete each, never a mixture, and never a room shot at tile size.
 */
export const FINISHES_TITLE = "ONE ATHLETE. SIX FINISHES.";
/*
  The old line — "The finish speaks through material … never through a different layout" — was a
  design-system rule read out to the customer, and the word "plate" in the middle of it meant a
  material, a third sense of a word the site was already using two ways (smooth audit, 2026-09-08).
  What a parent needs from this row is what changes and what does not.
*/
export const FINISHES_SUBHEAD =
  "Six materials, one layout: silver foil, chrome, ember, classic card, spotlight and prism. The finish changes the material and the light, never where anything sits.";
export const SENIOR_NIGHT_LINE =
  "Ordering for senior night? The Senior Night edition replaces the finish picker with class year, career line and senior quote.";
export const SENIOR_NIGHT_LINK = "/senior-night";

const TILE = "w-[62vw] max-w-[260px] shrink-0 snap-start md:w-[240px] lg:w-auto lg:max-w-none";
const TILE_SIZES = "(min-width: 1024px) 200px, (min-width: 768px) 240px, 62vw";
const NAME = "mt-3 font-body text-small font-bold uppercase tracking-[0.04em] text-ink";

export function FinishesRow({ variant }: { variant: "card" | "poster" }) {
  return (
    <div>
      <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-5 px-5 pb-2 md:gap-4 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
        {finishes.map((style) => {
          const spec = variant === "poster" ? assetOrNull(`posters.finish.${style.code}`) : assetOrNull(`finish.${style.code}.front`);
          return (
            <li key={style.code} className={TILE}>
              {spec ? (
                variant === "poster" ? (
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
                    <Image src={spec.src} alt={spec.alt} fill sizes={TILE_SIZES} className="object-contain" />
                  </div>
                ) : (
                  <CardFace {...spec} labelled sizes={TILE_SIZES} />
                )
              ) : (
                <div className="flex aspect-[5/7] items-center justify-center rounded-none border border-dashed border-hairline bg-stock p-4 text-center font-body text-small text-muted-text">
                  {style.material}
                </div>
              )}
              <p className={NAME}>{style.name}</p>
            </li>
          );
        })}
      </ul>
      <FictionalLabel className="mt-4" />
      <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-ink">
        <Link href={SENIOR_NIGHT_LINK} className="text-ink decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:underline">
          {SENIOR_NIGHT_LINE}
        </Link>
      </p>
    </div>
  );
}

export function FinishesSection({ variant }: { variant: "card" | "poster" }) {
  return (
    <Section index={4} id="finishes" title={FINISHES_TITLE} subhead={FINISHES_SUBHEAD} container="gallery">
      <FinishesRow variant={variant} />
    </Section>
  );
}

/** Asset keys the row depends on — the families test asserts they resolve (both rows are verified today). */
export const finishRowKeys = (variant: "card" | "poster"): string[] =>
  finishes.map((style) => (variant === "poster" ? `posters.finish.${style.code}` : `finish.${style.code}.front`));
