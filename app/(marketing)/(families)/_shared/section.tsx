import type { ReactNode } from "react";
import { SectionHeading } from "../../../../components/SectionHeading";

/**
 * The band every product-family section opens with (DESIGN §2.5, §5.2): the hairline rule with the
 * section index, then title → subhead → pills. The three family pages number seven sections; section
 * 06 ("Still deciding?") is the short strip inside section 07's CTA block, never a band of its own,
 * so the rendered bands are 02, 03, 04, 05 and 07 (the hero is 01 and carries the H1, no rule).
 */
export const FAMILY_SECTION_TOTAL = 7;

export const sectionIndex = (n: number): string => `${String(n).padStart(2, "0")} / ${String(FAMILY_SECTION_TOTAL).padStart(2, "0")}`;

export interface SectionProps {
  /** Section number in the 7-section template. */
  index: number;
  /** DOM id of the section (the anchor COPY gives it), e.g. "spec". */
  id?: string;
  title: string;
  subhead?: string;
  pills?: ReactNode;
  /** Gallery container for media rows; page container for text, ledgers and the FAQ. */
  container?: "site" | "gallery";
  /** "rail" puts the heading in a 3-column rail with the body beside it (the spec sheet). */
  layout?: "stacked" | "rail";
  children: ReactNode;
  className?: string;
}

export function Section({ index, id, title, subhead, pills, container = "site", layout = "stacked", children, className = "" }: SectionProps) {
  const headingId = `s-${String(index).padStart(2, "0")}`;
  const heading = (
    <SectionHeading as="h2" id={headingId} index={sectionIndex(index)} title={title} subhead={subhead} pills={pills} />
  );
  return (
    <section id={id} aria-labelledby={headingId} className={`py-16 md:py-24 lg:py-32 ${className}`.trim()}>
      <div className={container === "gallery" ? "container-gallery" : "container-site"}>
        {layout === "rail" ? (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-3">{heading}</div>
            <div className="mt-8 lg:col-span-9 lg:mt-0">{children}</div>
          </div>
        ) : (
          <>
            {heading}
            <div className="mt-8 lg:mt-12">{children}</div>
          </>
        )}
      </div>
    </section>
  );
}
