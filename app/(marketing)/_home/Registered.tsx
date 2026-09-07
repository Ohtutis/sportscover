// 05 · Registered, not just printed (DESIGN §5.1-05, COPY §2.1-5). The back shown here is the
// QR-patched derivative, so the ring and the ID beside it agree (DESIGN §6.4, GAPS #4).
//
// Owner review 2026-09-07: the card column ended 175 px above the lookup form and 303 px above the
// end of the section, so the left half of the band was blank for 431 px before the next section's
// padding even started. The lookup is not part of either column's argument — it is what the whole
// section asks you to do — so it now runs the full width UNDER the row, on its own rule. That leaves
// two columns of nearly equal height (the card against the heading, body and edition panel) and no
// ragged half.
import { Suspense } from "react";
import { LookupMiss } from "../../../components/LookupMiss";
import { Arrow } from "../../../components/BeforeAfter";
import { CardFace } from "../../../components/CardFace";
import { EditionPanel } from "../../../components/EditionPanel";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { LookupForm } from "../../../components/LookupForm";
import { QrRing } from "../../../components/QrRing";
import { asset } from "../../../lib/assets";
import { CANON } from "../../../lib/copy/canon";
import { getCard } from "../../../lib/registry/cards";
import { HomeHeading, HomeSection, SectionRule, sectionId } from "./Section";

export const REGISTERED_H2 = "REGISTERED, NOT JUST PRINTED.";
export const REGISTERED_BODY = `${CANON.registeredIdLine} Scan it — the card's own page opens with the edition, the stats and the season. Registered pages stay up for at least five years.`;
export const DEMO_CARD_ID = "GDE-SN-BKB-2026-12";
export const DEMO_LABEL = "Example edition · Fictional athlete";

export function Registered() {
  const back = asset("home.qr-ring");
  const demo = getCard(DEMO_CARD_ID);
  return (
    <HomeSection n={5} id="registry">
      <SectionRule n={5} />
      <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-10">
        {/* No mat: a dark card on a dark 8 % mat spent a quarter of the column on grey ground (fill
            ratio 74 %). The card floats on the page's own stock with its shadow, and the ring is drawn
            over the QR the ID belongs to (DESIGN §4.5 as revised 2026-09-07). */}
        <figure className="mx-auto max-w-[340px] lg:col-span-5">
          <div className="relative w-full">
            <CardFace {...back} labelled sizes="(min-width: 1024px) 340px, 76vw" />
            <QrRing />
          </div>
          <figcaption className="mt-4">
            <FictionalLabel />
          </figcaption>
        </figure>
        <div className="flex justify-center py-8 lg:col-span-1 lg:py-0">
          <Arrow />
        </div>
        <div className="mt-2 lg:col-span-6 lg:mt-0">
          <HomeHeading id={sectionId(5)} title={REGISTERED_H2} className="-mt-6" />
          <p className="mt-4 max-w-[62ch] font-body text-body text-pretty">{REGISTERED_BODY}</p>
          {demo ? <EditionPanel card={demo} tone="stock" demoLabel={DEMO_LABEL} className="mt-8" /> : null}
        </div>
      </div>
      <LookupForm
        inline
        missSlot={
          <Suspense fallback={null}>
            <LookupMiss />
          </Suspense>
        }
        className="mt-12 border-t border-hairline pt-8"
      />
    </HomeSection>
  );
}
