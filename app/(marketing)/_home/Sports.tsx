// 07 · Seventeen sports (DESIGN §5.1-07, COPY §2.1-7). Fifteen sports have an audited square-cut
// front; pickleball and skateboarding have no card export at all (their keys are `locate`), so they
// render as navy tiles of the same geometry — never a rounded export, never a placeholder card frame.
//
// Owner review 2026-09-07: every tile was a 191 × 201 plate holding a 120 × 169 card, so a third of
// each tile was dead black ground, and the two art-less sports were shaped differently from the other
// fifteen — a navy box with the sport's name set as a headline and "PLAIN BACK" under it, and no
// caption row at all. Now every tile is the card's own 5 : 7 box floating on the page with its own
// shadow (no plate), the two art-less sports use that same box, and the sport's name and back line sit
// in the caption row for all seventeen. The back line is printed only where it DIFFERS from the rule
// the subhead already states ("numbered sports carry their number") — it was repeating under fifteen
// tiles in a row.
import Link from "next/link";
import { Shield } from "../../../components/brand/Shield";
import { CardFace } from "../../../components/CardFace";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { SectionHeading } from "../../../components/SectionHeading";
import { assetOrNull } from "../../../lib/assets";
import { backLine, sports, type Sport } from "../../../lib/catalog/sports";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { HomeSection, sectionId, sectionIndex } from "./Section";

export const SPORTS_H2 = "SEVENTEEN SPORTS. THEIR NAME, THEIR CLUB CREST.";
export const SPORTS_SUBHEAD = `Numbered sports carry their number. ${CANON.numberlessLine}`;

const TILE_SIZES = "(min-width: 1024px) 200px, (min-width: 640px) 22vw, (min-width: 480px) 29vw, 44vw";

/** The back line the subhead already states for every numbered sport — printed only where it differs. */
const DEFAULT_BACK_LINE = "their number";

function SportTile({ sport }: { sport: Sport }) {
  const face = assetOrNull(`sport.${sport.slug}.front`);
  const href = ctaFor("cards", { sport: sport.slug }).primary.href;
  const line = backLine(sport);
  return (
    <li>
      <Link href={href} className="group block">
        {face ? (
          <CardFace {...face} labelled surface="stock" sizes={TILE_SIZES} />
        ) : (
          // No card export exists for this sport yet: the same 5 : 7 box, the shield, and the caption
          // row below saying exactly what a card tile's caption row says.
          <span className="flex aspect-[5/7] w-full items-center justify-center rounded-none bg-navy shadow-[var(--shadow-card-stock)]">
            <Shield tone="arena" size={44} />
          </span>
        )}
        {/* One reserved height for the caption row, so a tile with a back line and a tile without it
            are the same object. */}
        <div className="mt-3 sm:min-h-[3.2em]">
          <p className="font-body text-[0.9375rem] font-medium text-ink transition-[text-decoration-thickness] duration-hover ease-out group-hover:underline">{sport.name}</p>
          {line === DEFAULT_BACK_LINE ? null : (
            <p className="mt-1 font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-muted-text">{line}</p>
          )}
        </div>
      </Link>
    </li>
  );
}

export function Sports() {
  return (
    <HomeSection n={7} container="gallery">
      <SectionHeading as="h2" id={sectionId(7)} index={sectionIndex(7)} title={SPORTS_H2} subhead={SPORTS_SUBHEAD} />
      {/* Two columns under 480 px: three made the card 68 px wide at 390 and nothing on it could be read. */}
      <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-6 min-[480px]:grid-cols-3 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-6 lg:gap-x-8">
        {sports.map((sport) => (
          <SportTile key={sport.slug} sport={sport} />
        ))}
      </ul>
      <FictionalLabel className="mt-6" />
    </HomeSection>
  );
}
