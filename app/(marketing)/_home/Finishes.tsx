// 06 · Six finishes, one athlete (DESIGN §5.1-06, COPY §2.1-6). Finish names are Space Grotesk 700
// uppercase text — no SVG labels and no finish fonts outside /c (GAPS #15).
import Link from "next/link";
import { CardFace } from "../../../components/CardFace";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Mat } from "../../../components/Mat";
import { Pill } from "../../../components/Pill";
import { SectionHeading } from "../../../components/SectionHeading";
import { assetOrNull } from "../../../lib/assets";
import { styleByCode, styleHrefF1, styles, type Style } from "../../../lib/catalog/styles";
import { HomeSection, sectionId } from "./Section";

export const FINISHES_H2 = "SIX FINISHES. ONE ATHLETE.";
export const FINISHES_SUBHEAD = "Same athlete, same photos. The finish changes the material, not the layout.";
export const SENIOR_TILE_PILL = "SENIOR NIGHT EDITION";

const TILE_SIZES = "(min-width: 1024px) 180px, 62vw";

function Tile({ style, assetKey }: { style: Style; assetKey: string }) {
  // A key that is still `locate` renders the text fallback, never an empty box (CONTRACTS §5.8).
  const face = assetOrNull(assetKey);
  const gold = style.isOccasion;
  return (
    <li className="w-[62vw] max-w-[260px] shrink-0 snap-start lg:w-auto lg:max-w-none">
      <Link href={styleHrefF1(style)} className="group block">
        <div
          className={`overflow-hidden rounded-ui border transition-[border-color] duration-hover ease-out ${
            gold ? "border-gold" : "border-hairline group-hover:border-ink"
          }`}
        >
          {/* The mat is a flex row: two bare children make the card an unsized flex item and it
              collapsed to 0 × 0 — the Senior Night tile showed its gold pill on an empty mat. One
              block child owns the width, and the pill sits under the face inside it. */}
          <Mat tone="arena" plate={false}>
            <div className="w-full">
              {face ? (
                <CardFace {...face} labelled surface="arena" sizes={TILE_SIZES} />
              ) : (
                <span className="flex aspect-[5/7] w-full items-center justify-center bg-navy p-4 text-center font-body text-[0.9375rem] font-bold uppercase tracking-[0.04em] text-white">
                  {style.name}
                </span>
              )}
              {gold ? (
                <span className="mt-3 flex justify-center">
                  <Pill tone="gold">{SENIOR_TILE_PILL}</Pill>
                </span>
              ) : null}
            </div>
          </Mat>
        </div>
        {/* Two reserved lines: only SIGNATURE SPOTLIGHT wraps, and without the box the material lines
            under the row sat at two different heights (review 2026-09-07). */}
        <p className="mt-3 min-h-[2.6em] font-body text-[0.9375rem] font-bold uppercase leading-[1.3] tracking-[0.04em] text-ink">{style.name}</p>
        <p className="mt-1 font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-muted-text">{style.material}</p>
      </Link>
    </li>
  );
}

export function Finishes() {
  const senior = styleByCode("SR");
  return (
    <HomeSection n={6} container="gallery">
      <SectionHeading as="h2" id={sectionId(6)} index="06 / 13" title={FINISHES_H2} subhead={FINISHES_SUBHEAD} />
      <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 pb-2 lg:mt-12 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
        {styles
          .filter((s) => !s.isOccasion)
          .map((style) => (
            <Tile key={style.code} style={style} assetKey={`finish.${style.code}.front`} />
          ))}
        {senior ? <Tile key={senior.code} style={senior} assetKey="finish.SR.tile" /> : null}
      </ul>
      <FictionalLabel className="mt-4" />
    </HomeSection>
  );
}
