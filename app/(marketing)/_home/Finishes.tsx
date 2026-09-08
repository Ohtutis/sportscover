// 06 · Six finishes, one athlete (DESIGN §5.1-06, COPY §2.1-6). Finish names are Space Grotesk 700
// uppercase text — no SVG labels and no finish fonts outside /c (GAPS #15).
//
// Owner review 2026-09-07, three defects in one row: the heading said SIX over a row of SEVEN; the
// seventh tile carried a pill nothing else carried, so its plate was 266 px against the others' 222
// and its material line fell 44 px below the rest; and seven tiles across the gallery made each one
// 167 px wide, which is too small to see what a finish IS. So: the row is the six FINISHES, in three
// columns over two rows (a tile is now ~300 px, not 167), and the Senior Night edition — which is an
// occasion, not a finish — stands under it as its own item. The heading counts what the row holds.
import Link from "next/link";
import { CardFace } from "../../../components/CardFace";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Pill } from "../../../components/Pill";
import { SectionHeading } from "../../../components/SectionHeading";
import { assetOrNull } from "../../../lib/assets";
import { finishes, styleByCode, styleHrefF1, type Style } from "../../../lib/catalog/styles";
import { ArrowLink, HomeSection, sectionId, sectionIndex } from "./Section";

export const FINISHES_H2 = "SIX FINISHES. ONE ATHLETE.";
export const FINISHES_SUBHEAD = "Same athlete, same photos. The finish changes the material, not the layout.";
export const SENIOR_TILE_PILL = "SENIOR NIGHT EDITION";
/** COPY §2.2 (4) — the same sentence the product pages put under their finish row. */
export const SENIOR_NIGHT_LINE =
  "Ordering for senior night? The Senior Night edition replaces the finish picker with class year, career line and senior quote.";
export const SENIOR_NIGHT_CTA = "See the Senior Night edition";

const TILE_SIZES = "(min-width: 1024px) 300px, (min-width: 768px) 30vw, 68vw";
const SENIOR_SIZES = "(min-width: 768px) 200px, 44vw";

/**
 * One finish. No plate and no mat: the art is already dark, so a mat behind it is a grey box the tile
 * spends a quarter of its area on (DESIGN §4.5 as revised 2026-09-07). The face floats on the page's
 * own stock with the card shadow.
 */
function Tile({ style }: { style: Style }) {
  const face = assetOrNull(`finish.${style.code}.front`);
  return (
    <li className="w-[68vw] max-w-[300px] shrink-0 snap-start md:mx-auto md:w-full">
      <Link href={styleHrefF1(style)} className="group block">
        {/* The whole tile is the link, so the whole tile answers the pointer — a `group-hover:underline`
            on a 15 px caption under a 300 px card is not a hover state (audit 2026-09-08, N4). Nothing
            scales, nothing lifts (DESIGN §4.19): a hairline ring appears beside the card. */}
        <span className="block ring-2 ring-transparent transition-[box-shadow] duration-hover ease-out group-hover:ring-ink/15">
          {face ? (
            <CardFace {...face} labelled sizes={TILE_SIZES} />
          ) : (
            // A key that is still `locate` renders the text fallback, never an empty box (CONTRACTS §5.8).
            <span className="flex aspect-[5/7] w-full items-center justify-center rounded-none border border-hairline bg-stock p-4 text-center font-body text-small text-muted-text">
              {style.material}
            </span>
          )}
        </span>
        {/* Two reserved lines: only SIGNATURE SPOTLIGHT wraps, and without the box the material lines
            under the row sat at two different heights (review 2026-09-07). */}
        <p className="mt-4 min-h-[2.6em] font-body text-[1rem] font-bold uppercase leading-[1.3] tracking-[0.04em] text-ink transition-[text-decoration-thickness] duration-hover ease-out group-hover:underline">
          {style.name}
        </p>
        <p className="mt-1 font-body text-small font-medium text-muted-text">{style.material}</p>
      </Link>
    </li>
  );
}

/** The seventh style is an occasion, not a finish: its own item, its own gold rule, its own link. */
function SeniorNightItem() {
  const senior = styleByCode("SR");
  if (!senior) return null;
  const face = assetOrNull("finish.SR.tile");
  return (
    <div className="mt-12 rounded-ui border border-gold p-6 sm:flex sm:items-center sm:gap-8 lg:mt-16 lg:p-8">
      {face ? (
        <div className="w-[52%] max-w-[200px] shrink-0 sm:w-[200px]">
          <CardFace {...face} labelled sizes={SENIOR_SIZES} />
        </div>
      ) : null}
      <div className={face ? "mt-6 sm:mt-0" : undefined}>
        <Pill tone="gold">{SENIOR_TILE_PILL}</Pill>
        <p className="mt-4 max-w-[52ch] font-body text-[1.125rem] font-medium text-pretty text-ink">{SENIOR_NIGHT_LINE}</p>
        <ArrowLink href={styleHrefF1(senior)} className="mt-4">
          {SENIOR_NIGHT_CTA}
        </ArrowLink>
      </div>
    </div>
  );
}

export function Finishes() {
  return (
    <HomeSection n={6} container="gallery">
      <SectionHeading as="h2" id={sectionId(6)} index={sectionIndex(6)} title={FINISHES_H2} subhead={FINISHES_SUBHEAD} />
      {/* A scroller on a phone (a 300 px tile beats six 60 px ones); three columns from md up, so the
          six finishes fall into two rows of tiles you can actually read. */}
      <ul className="-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-5 px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10 md:overflow-visible md:px-0 md:pb-0">
        {finishes.map((style) => (
          <Tile key={style.code} style={style} />
        ))}
      </ul>
      <FictionalLabel className="mt-6" />
      <SeniorNightItem />
    </HomeSection>
  );
}
