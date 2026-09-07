// 11 · Founder note (DESIGN §5.1-11, COPY §2.1-11). No photo until public/brand/founder.jpg exists —
// FounderNote decides that itself; nothing is reserved for it.
import { FounderNote } from "../../../components/FounderNote";
import { SectionHeading } from "../../../components/SectionHeading";
import { ArrowLink, HomeSection, sectionId, sectionIndex } from "./Section";

export const FOUNDER_H2 = "A NOTE FROM THE DESIGNER.";
export const FOUNDER_FOOTER_LINE =
  "Designed in Lithuania · Printed by professional labs in the US · Independent — not affiliated with any league, team, school or trading-card company";

export function Founder() {
  return (
    <HomeSection n={11}>
      {/* The opener rules left and runs the full container, like every other section: centred, it drew a
          short 52ch rule with the index under the middle of it, a second rule above the quote (review
          2026-09-07). The note itself keeps its own 52ch measure. */}
      <SectionHeading as="h2" id={sectionId(11)} index={sectionIndex(11)} title={FOUNDER_H2} />
      {/*
        Single column, and deliberately so (owner review 2026-09-07): the section ran 835 px with 567 px
        of text and an empty right half, because a note is not a two-column object and there IS no
        founder photograph — `public/brand/founder.jpg` does not exist and a face is never generated
        (COPY §6 #1). Nothing is reserved for one; the section is simply as tall as what it says.
      */}
      <div className="max-w-[62ch]">
        <FounderNote variant="home" className="mt-10" />
        <p className="mt-8 font-body text-small text-muted-text">{FOUNDER_FOOTER_LINE}</p>
        <ArrowLink href="/about" className="mt-4">
          About the studio
        </ArrowLink>
      </div>
    </HomeSection>
  );
}
