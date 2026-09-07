// 05 · Registered, not just printed (DESIGN §5.1-05, COPY §2.1-5). The back shown here is the
// QR-patched derivative, so the ring and the ID beside it agree (DESIGN §6.4, GAPS #4).
import { Suspense } from "react";
import { LookupMiss } from "../../../components/LookupMiss";
import { Arrow } from "../../../components/BeforeAfter";
import { CardFace } from "../../../components/CardFace";
import { EditionPanel } from "../../../components/EditionPanel";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { LookupForm } from "../../../components/LookupForm";
import { Mat } from "../../../components/Mat";
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
      <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
        <div className="lg:col-span-5">
          <Mat tone="arena" className="mx-auto max-w-[360px]">
            <div className="relative w-full">
              <CardFace {...back} labelled surface="arena" sizes="(min-width: 1024px) 320px, 76vw" />
              <QrRing />
            </div>
          </Mat>
          <FictionalLabel className="mx-auto mt-2 max-w-[360px]" />
        </div>
        <div className="flex justify-center py-6 lg:col-span-1 lg:py-0">
          <Arrow />
        </div>
        <div className="lg:col-span-6">
          <HomeHeading id={sectionId(5)} title={REGISTERED_H2} />
          <p className="mt-4 max-w-[62ch] font-body text-body text-pretty">{REGISTERED_BODY}</p>
          {demo ? <EditionPanel card={demo} tone="stock" demoLabel={DEMO_LABEL} className="mt-8" /> : null}
          <LookupForm inline missSlot={<Suspense fallback={null}><LookupMiss /></Suspense>} className="mt-8" />
        </div>
      </div>
    </HomeSection>
  );
}
