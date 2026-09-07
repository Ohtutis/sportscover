// 02 · Four fears, answered (DESIGN §5.1-02, COPY §2.1-2). No rule: the row starts tight under the
// hero, so the opener is the index alone.
import { FourFears } from "../../../components/FourFears";
import { HomeHeading, HomeSection, SectionRule, sectionId } from "./Section";

export const FEARS_H2 = "FOUR THINGS EVERY PARENT ASKS FIRST.";
export const FEARS_SUBHEAD = "Each one is a single click from the proof.";

export function Fears() {
  return (
    <HomeSection n={2} className="pt-8 pb-12 lg:pt-10 lg:pb-20">
      <SectionRule n={2} rule={false} />
      <HomeHeading id={sectionId(2)} title={FEARS_H2} subhead={FEARS_SUBHEAD} />
      <FourFears variant="long" className="mt-8 lg:mt-10" />
    </HomeSection>
  );
}
