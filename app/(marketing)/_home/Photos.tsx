// 09 · Your athlete's photos (DESIGN §5.1-09, COPY §2.1-9). No image — the ledger is the object.
import { Ledger } from "../../../components/Ledger";
import { TrustLine } from "../../../components/TrustLine";
import { block } from "../../../lib/blocks";
import { ArrowLink, HomeHeading, HomeSection, SectionRule, sectionId } from "./Section";

export const PHOTOS_H2 = "YOUR ATHLETE'S PHOTOS STAY YOURS.";
/** What we ask for and what we never ask for — said once, in the ledger, not also in the body. */
export const PHOTOS_LEDGER = [
  { key: "We ask for", value: "4–10 photos and nothing else." },
  { key: "Never", value: "No date of birth, no home address, no school name." },
];

export function Photos() {
  return (
    <HomeSection n={9}>
      <SectionRule n={9} />
      <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10">
        <div className="lg:col-span-7">
          <HomeHeading id={sectionId(9)} title={PHOTOS_H2} className="-mt-6" />
          <p className="mt-4 max-w-[62ch] font-body text-body font-medium text-pretty">{block("photo-privacy")}</p>
          <TrustLine />
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
            <ArrowLink href="/privacy#subprocessors">Who processes the photos</ArrowLink>
            <ArrowLink href="/privacy/biometric">The likeness check, in writing</ArrowLink>
          </div>
        </div>
        <div className="mt-10 lg:col-span-4 lg:col-start-9 lg:mt-0">
          {/* `lg` rows: the ledger is the only object in this column and the block's two halves must
              end together (the audit's ≤ 120 px rule) — at the default size it stopped 122 px short. */}
          <Ledger rows={PHOTOS_LEDGER} size="lg" />
        </div>
      </div>
    </HomeSection>
  );
}
