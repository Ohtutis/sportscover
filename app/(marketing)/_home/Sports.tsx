// 07 · Seventeen sports (DESIGN §5.1-07, COPY §2.1-7). Fifteen sports have an audited square-cut
// front; pickleball and skateboarding have no card export at all (their keys are `locate`), so they
// render as navy text tiles — never a rounded export, never a placeholder card frame.
import Link from "next/link";
import { Shield } from "../../../components/brand/Shield";
import { CardFace } from "../../../components/CardFace";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Mat } from "../../../components/Mat";
import { SectionHeading } from "../../../components/SectionHeading";
import { assetOrNull } from "../../../lib/assets";
import { backLine, sports, type Sport } from "../../../lib/catalog/sports";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { HomeSection, sectionId } from "./Section";

export const SPORTS_H2 = "SEVENTEEN SPORTS. THEIR NAME, THEIR CLUB CREST.";
export const SPORTS_SUBHEAD = `Numbered sports carry their number. ${CANON.numberlessLine}`;

const TILE_SIZES = "(min-width: 1024px) 130px, (min-width: 640px) 17vw, (min-width: 480px) 21vw, 32vw";

const PLATE = "overflow-hidden rounded-ui border border-hairline transition-[border-color] duration-hover ease-out group-hover:border-ink";

/**
 * The mat's own box (review 2026-09-07). A 5 : 7 card drawn at 76 % of the width inside an 8 % inset is
 * 1.0538 × the mat's width tall, so a 4 : 5 mat left a black bar above and below every card. This ratio is
 * that height: the mat hugs the card, and the text tiles use the same box so the rows still line up.
 */
const MEDIA = "aspect-[500/527]";

function SportTile({ sport }: { sport: Sport }) {
  const face = assetOrNull(`sport.${sport.slug}.front`);
  const href = ctaFor("cards", { sport: sport.slug }).primary.href;
  // No card export exists for this sport: a navy text tile that says the same two things the
  // caption row says under a card tile — never a rounded export, never a placeholder card frame.
  if (!face) {
    return (
      <li>
        <Link href={href} className="group block">
          <div className={PLATE}>
            <div className={`flex ${MEDIA} items-center justify-center bg-navy p-[8%] text-center`}>
              <span className="flex flex-col items-center gap-2">
                <Shield tone="arena" size={40} />
                <span className="font-display text-[1.0625rem] uppercase leading-[1.1] text-balance text-white lg:text-[1.25rem]">{sport.name}.</span>
                <span className="font-label text-label font-semibold uppercase tracking-[0.12em] text-arena-muted">{backLine(sport)}</span>
              </span>
            </div>
          </div>
        </Link>
      </li>
    );
  }
  return (
    <li>
      <Link href={href} className="group block">
        <div className={PLATE}>
          <Mat tone="arena" plate={false} aspect={MEDIA}>
            <div className="w-[76%]">
              <CardFace {...face} labelled surface="arena" sizes={TILE_SIZES} />
            </div>
          </Mat>
        </div>
        <p className="mt-3 font-body text-[0.9375rem] font-medium text-ink">{sport.name}</p>
        <p className="mt-1 font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-muted-text">{backLine(sport)}</p>
      </Link>
    </li>
  );
}

export function Sports() {
  return (
    <HomeSection n={7} container="gallery">
      <SectionHeading as="h2" id={sectionId(7)} index="07 / 13" title={SPORTS_H2} subhead={SPORTS_SUBHEAD} />
      {/* Two columns under 480 px: three made the card 68 px wide at 390 and nothing on it could be read. */}
      <ul className="mt-8 grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 sm:grid-cols-4 sm:gap-4 lg:mt-12 lg:grid-cols-6 lg:gap-6">
        {sports.map((sport) => (
          <SportTile key={sport.slug} sport={sport} />
        ))}
      </ul>
      <FictionalLabel className="mt-4" />
    </HomeSection>
  );
}
