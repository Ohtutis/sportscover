// 12 · Occasions + the closing CTA (DESIGN §5.1-12, COPY §2.1-12). The Christmas plate renders only
// inside its server-date window, so the row is two-up out of season. The Senior Night plate carries
// no delivery chips — one delivery claim per page (DESIGN §5.1-12, checklist 9).
import { ButtonLink } from "../../../components/ButtonLink";
import { CardFace } from "../../../components/CardFace";
import { CtaPair } from "../../../components/CtaPair";
import { DeliveryChips } from "../../../components/DeliveryChips";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Mat } from "../../../components/Mat";
import { TrustLine } from "../../../components/TrustLine";
import { assetOrNull } from "../../../lib/assets";
import { christmasDates, formatEt } from "../../../lib/capacity";
import { activeOccasions, occasionHref, type Occasion } from "../../../lib/catalog/seasons";
import { ctaFor } from "../../../lib/cta";
import { BlockTitle, HomeHeading, HomeSection, SectionRule, sectionId } from "./Section";

export const CLOSING_H2 = "ONE ATHLETE. ONE EDITION.";

export const OCCASION_COPY = {
  "senior-night": {
    title: "ONE LAST HOME GAME.",
    body: "A gold senior edition: class year, four-year career line, senior quote.",
    cta: "Plan their senior edition",
  },
  christmas: { title: "UNDER THE TREE, NOT ON A PHONE.", body: "", cta: "See Christmas timing" },
  "end-of-season": {
    title: "ONE TEAM SETUP. EVERY FAMILY ORDERS THEIR OWN.",
    body: "You choose the finish, send the crest and colors once, set a deadline. Every card is built and proofed individually.",
    cta: "Email us about a team",
  },
} as const;

function OccasionPlate({ occasion, now }: { occasion: Occasion; now: Date }) {
  const copy = OCCASION_COPY[occasion.id];
  const senior = occasion.id === "senior-night";
  const face = senior ? assetOrNull("sn.sport.baseball.front") : null;
  const christmas = christmasDates(now);
  const body =
    occasion.id === "christmas"
      ? `Order by ${formatEt(christmas.printedBy, "medium")} for printed sets under the tree; digital files by ${formatEt(christmas.digitalBy, "medium")}.`
      : copy.body;
  return (
    <article className="flex flex-col rounded-ui border border-hairline p-6">
      {face ? (
        <>
          <Mat tone="arena" plate={false} aspect="aspect-[4/3]" className="overflow-hidden rounded-ui">
            <div className="w-[48%]">
              <CardFace {...face} labelled surface="arena" sizes="(min-width: 1024px) 200px, 40vw" />
            </div>
          </Mat>
          <FictionalLabel className="mt-2" />
        </>
      ) : null}
      <BlockTitle className={face ? "mt-5" : ""}>{copy.title}</BlockTitle>
      <p className="mt-3 max-w-[62ch] font-body text-body text-pretty">{body}</p>
      <div className="mt-auto pt-6">
        <ButtonLink href={occasionHref(occasion)}>{copy.cta}</ButtonLink>
      </div>
    </article>
  );
}

export function Occasions({ now }: { now: Date }) {
  const occasions = activeOccasions(now);
  return (
    <HomeSection n={12} container="gallery">
      <SectionRule n={12} />
      <div className={`mt-8 grid gap-6 lg:mt-12 ${occasions.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {occasions.map((occasion) => (
          <OccasionPlate key={occasion.id} occasion={occasion} now={now} />
        ))}
      </div>
      <div className="mt-16 border-t border-hairline pt-12 text-center lg:mt-24">
        <HomeHeading id={sectionId(12)} title={CLOSING_H2} align="center" />
        <div className="mt-8 flex flex-col items-center gap-4">
          <CtaPair {...ctaFor("home")} size="lg" className="justify-center" />
          <DeliveryChips kind="standard" className="justify-center" />
          <TrustLine className="justify-center text-center" />
        </div>
      </div>
    </HomeSection>
  );
}
