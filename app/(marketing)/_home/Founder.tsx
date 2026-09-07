// 11 · Founder note (DESIGN §5.1-11, COPY §2.1-11). No photo until public/brand/founder.jpg exists —
// FounderNote decides that itself; nothing is reserved for it.
import { FounderNote } from "../../../components/FounderNote";
import { SectionHeading } from "../../../components/SectionHeading";
import { ArrowLink, HomeSection, sectionId } from "./Section";

export const FOUNDER_H2 = "A NOTE FROM THE DESIGNER.";
export const FOUNDER_FOOTER_LINE =
  "Designed in Lithuania · Printed by professional labs in the US · Independent — not affiliated with any league, team, school or trading-card company";

export function Founder() {
  return (
    <HomeSection n={11}>
      {/* The opener rules left and runs the full container, like every other section: centred, it drew a
          short 52ch rule with the index under the middle of it, a second rule above the quote (review
          2026-09-07). The note itself keeps its own 52ch measure. */}
      <SectionHeading as="h2" id={sectionId(11)} index="11 / 13" title={FOUNDER_H2} />
      <div className="max-w-[52ch]">
        <FounderNote variant="home" className="mt-8 lg:mt-12" />
        <p className="mt-6 font-body text-small text-muted-text">{FOUNDER_FOOTER_LINE}</p>
        <ArrowLink href="/about" className="mt-4">
          About the studio
        </ArrowLink>
      </div>
    </HomeSection>
  );
}
