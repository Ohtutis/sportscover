import type { ReactNode } from "react";
import { SectionHeading } from "../../../../components/SectionHeading";

/**
 * The band every product-family section opens with (DESIGN §2.5, §5.2): the hairline rule with the
 * section index, then title → subhead → pills.
 *
 * **The denominator counts the bands that are actually drawn** (owner review, 2026-09-07). It used to
 * say `/ 07` because COPY numbers seven sections, but section 06 ("Still deciding?") is the short strip
 * inside the closing block and never a band of its own — so the spine read 02, 03, 04, 05, 07 and a
 * reader looking for 06 could not find it. The rendered bands are the hero (01, the H1, no rule), the
 * spec sheet (02), the family's own section (03), the finishes (04), the sports (05) and the closing
 * block (06). Six bands, six numbers, no gap — the same spine `/senior-night` already used.
 *
 * There is no rail layout any more. It put the whole heading — its rule included — in a 3-column track,
 * so the section opener was a 252 px stub instead of a rule across the container (owner review: *"make
 * it full width like the home pages"*), and it left the spec sheet's two columns ending 460 px apart.
 * One column, heading above body, fixes both.
 */
export const FAMILY_SECTION_TOTAL = 6;

export const sectionIndex = (n: number): string => `${String(n).padStart(2, "0")} / ${String(FAMILY_SECTION_TOTAL).padStart(2, "0")}`;

/**
 * Between-band air used to be `py-16 md:py-24 lg:py-32` — 256 px between two sections while the blocks
 * inside them sat 8–24 px apart. The rhythm is inverted back (owner review, 2026-09-07): the band gap
 * comes down to 96 px a side and the space is spent inside the blocks instead.
 */
export const SECTION_PADDING = "py-14 md:py-20 lg:py-24";

export interface SectionProps {
  /** Section number in the 6-band spine. */
  index: number;
  /** DOM id of the section (the anchor COPY gives it), e.g. "spec". */
  id?: string;
  title: string;
  subhead?: string;
  pills?: ReactNode;
  /** Gallery container for media rows; page container for text, ledgers and the FAQ. */
  container?: "site" | "gallery";
  children: ReactNode;
  className?: string;
}

export function Section({ index, id, title, subhead, pills, container = "site", children, className = "" }: SectionProps) {
  const headingId = `s-${String(index).padStart(2, "0")}`;
  return (
    <section id={id} aria-labelledby={headingId} className={`${SECTION_PADDING} ${className}`.trim()}>
      <div className={container === "gallery" ? "container-gallery" : "container-site"}>
        <SectionHeading as="h2" id={headingId} index={sectionIndex(index)} title={title} subhead={subhead} pills={pills} />
        <div className="mt-10 lg:mt-12">{children}</div>
      </div>
    </section>
  );
}
