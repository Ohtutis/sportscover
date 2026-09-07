import { CardFace } from "../../../../components/CardFace";
import { FictionalLabel } from "../../../../components/FictionalLabel";
import { assetOrNull } from "../../../../lib/assets";
import { backLine, sports } from "../../../../lib/catalog/sports";
import { CANON } from "../../../../lib/copy/canon";
import { Section } from "./section";

/**
 * Section 05 — the sports that never wear a number (COPY §2.2 (5) / §2.3 (5) / §2.4 (5), DESIGN §5.2-5).
 * The body is C9 verbatim from the canon; the poster page uses its first sentence only. What each
 * sport's card back carries comes from `backLine()` — the catalog, not a sentence someone typed — so a
 * numberless sport can never be captioned with a number (DESIGN checklist #16).
 */
export const NUMBERLESS_TITLE = "NO NUMBER? NO PROBLEM.";
export const POSTER_NAME_TITLE = "THEIR NAME ON THE WALL.";
export const CHECKOUT_NOTE = "At checkout the number field disappears for these sports.";
export const POSTER_NAME_BODY = "The poster carries the athlete's name, team and season.";

/** C9's first sentence — the numberless half, derived from the canon string, never retyped. */
export const numberlessFirstSentence = (): string => `${CANON.numberlessLine.split(". ")[0]}.`;

/**
 * C9 cut at its em dash: the sports that wear no number, without the half that says what their
 * CARD carries. The poster page states a fact about the poster and may not borrow the card's
 * sentence — a poster never carries a number in any sport.
 */
export const numberlessSportsClause = (): string => `${CANON.numberlessLine.split(" — ")[0]}.`;

const TILE_SIZES = "(min-width: 1024px) 200px, (min-width: 768px) 22vw, 30vw";

/**
 * The 17-sport grid: a card front where one is exported, a text tile where none is (GAPS #3,
 * F1-ART-03). `faces={false}` is the poster page's grid — the same seventeen sports, named only.
 * A card front and a card-back caption ("plain back", "their number") are facts about the CARD;
 * there is no per-sport poster export to show instead, so the poster page shows the roster, not
 * another product's artwork.
 */
export function SportGrid({ className = "", faces = true }: { className?: string; faces?: boolean }) {
  if (!faces) {
    return (
      <ul className={`grid grid-cols-2 gap-x-8 sm:grid-cols-3 lg:grid-cols-4 ${className}`.trim()}>
        {sports.map((sport) => (
          <li key={sport.slug} className="border-t border-hairline py-3 font-body text-small font-bold uppercase tracking-[0.04em] text-ink">
            {sport.name}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className={className || undefined}>
      <ul className="grid grid-cols-3 gap-x-4 gap-y-8 md:grid-cols-4 lg:grid-cols-6">
        {sports.map((sport) => {
          const spec = assetOrNull(`sport.${sport.slug}.front`);
          return (
            <li key={sport.slug}>
              {spec ? (
                <CardFace {...spec} labelled sizes={TILE_SIZES} />
              ) : (
                <div className="flex aspect-[5/7] items-center justify-center rounded-ui border border-hairline bg-stock p-3 text-center font-body text-small text-muted-text">
                  {sport.name}
                </div>
              )}
              <p className="mt-2 font-body text-small font-bold uppercase tracking-[0.04em] text-ink">{sport.name}</p>
              <p className="font-body text-small text-muted-text">{backLine(sport)}</p>
            </li>
          );
        })}
      </ul>
      <FictionalLabel className="mt-4" />
    </div>
  );
}

/** The cheerleading front + back pair — the proof that a numberless card is a complete card. */
function CheerPair() {
  const front = assetOrNull("cards.cheer.front");
  const back = assetOrNull("cards.cheer.back");
  if (!front || !back) return null;
  return (
    <div>
      {/* Floated, not matted: two dark faces on a dark 8 % mat spent a quarter of the block on grey. */}
      <div className="flex w-full items-center justify-center gap-[7%]">
        <div className="w-[44%] rotate-[-3deg]">
          <CardFace {...front} labelled sizes="(min-width: 1024px) 240px, 40vw" />
        </div>
        <div className="w-[44%] rotate-[3deg]">
          <CardFace {...back} labelled sizes="(min-width: 1024px) 240px, 40vw" />
        </div>
      </div>
      <FictionalLabel className="mt-6" />
    </div>
  );
}

export interface NumberlessSectionProps {
  /** The poster page tells the same truth with its own heading and no cheer pair. */
  variant: "card" | "poster";
}

export function NumberlessSection({ variant }: NumberlessSectionProps) {
  const poster = variant === "poster";
  return (
    <Section
      index={5}
      id="sports"
      title={poster ? POSTER_NAME_TITLE : NUMBERLESS_TITLE}
      container="gallery"
    >
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        {poster ? null : (
          <div className="lg:col-span-5">
            <CheerPair />
          </div>
        )}
        <div className={poster ? "lg:col-span-7" : "mt-8 lg:col-span-5 lg:col-start-8 lg:mt-0"}>
          {poster ? (
            <p className="max-w-[62ch] font-body text-body font-medium text-pretty text-ink">
              {POSTER_NAME_BODY} {numberlessSportsClause()}
            </p>
          ) : (
            <>
              <p className="max-w-[62ch] font-body text-body font-medium text-pretty text-ink">{CANON.numberlessLine}</p>
              <p className="mt-4 max-w-[62ch] font-body text-small text-muted-text">{CHECKOUT_NOTE}</p>
            </>
          )}
        </div>
      </div>
      <SportGrid className="mt-14" faces={!poster} />
    </Section>
  );
}
