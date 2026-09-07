// 12 · Occasions + the closing CTA (DESIGN §5.1-12, COPY §2.1-12). The Christmas plate renders only
// inside its server-date window, so the row is two-up out of season. The Senior Night plate carries
// no delivery chips — one delivery claim per page (DESIGN §5.1-12, checklist 9).
//
// Owner review 2026-09-07: the senior-night and the team plate are the two moments on this page that
// are about people rather than about a product, and both were text under a card render or text alone.
// Each now leads with the photograph of that moment where the site map has one — a family with the
// framed poster, a team's order stacked and ready — and falls back to what was here before.
import Image from "next/image";
import { ButtonLink } from "../../../components/ButtonLink";
import { CardFace } from "../../../components/CardFace";
import { CtaPair } from "../../../components/CtaPair";
import { DeliveryChips } from "../../../components/DeliveryChips";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Mat } from "../../../components/Mat";
import { TrustLine } from "../../../components/TrustLine";
import { asset, assetOrNull, hasAsset, type ImageSpec } from "../../../lib/assets";
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

/**
 * COPY has no line for these two photographs, so each caption is the plainest description of what the
 * frame holds (flagged in docs/f1/INTEGRATION-NOTES.md § fix-imagery). The caption is keyed to the
 * asset that actually resolved, so a fallback can never inherit another photograph's description.
 */
const PHOTO_CAPTION: Record<string, string> = {
  "life.gift.moment": "A family on the court with the framed poster, at a senior night ceremony.",
  "life.team.order": "A team's order staged on a table: posters, shipping tubes, stacks of cards and the box they ship in.",
  "life.team.order.baseball": "A team's order staged on a table: posters, shipping tubes, stacks of cards and the box they ship in.",
};

/** Photographs this plate may lead with, best first; empty for an occasion that has none. */
const OCCASION_PHOTOS: Record<Occasion["id"], readonly string[]> = {
  "senior-night": ["life.gift.moment"],
  christmas: [],
  "end-of-season": ["life.team.order", "life.team.order.baseball"],
};

/** The first verified key of the list with its caption, or null — never an empty frame. */
function firstPhoto(keys: readonly string[]): { spec: ImageSpec; key: string } | null {
  for (const key of keys) if (hasAsset(key)) return { spec: asset(key), key };
  return null;
}

function OccasionPlate({ occasion, now }: { occasion: Occasion; now: Date }) {
  const copy = OCCASION_COPY[occasion.id];
  const photo = firstPhoto(OCCASION_PHOTOS[occasion.id]);
  // The card render stays as the senior plate's fallback: better a real product than no media at all.
  const face = !photo && occasion.id === "senior-night" ? assetOrNull("sn.sport.baseball.front") : null;
  const christmas = christmasDates(now);
  const body =
    occasion.id === "christmas"
      ? `Order by ${formatEt(christmas.printedBy, "medium")} for printed sets under the tree; digital files by ${formatEt(christmas.digitalBy, "medium")}.`
      : copy.body;
  return (
    <article className="flex flex-col rounded-ui border border-hairline p-6">
      {photo ? (
        <figure>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-ui bg-arena">
            <Image
              src={photo.spec.src}
              alt={photo.spec.alt}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 768px) 42vw, 88vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 font-body text-[0.75rem] font-medium text-muted-text">
            {PHOTO_CAPTION[photo.key] ?? photo.spec.alt}
          </figcaption>
          {photo.spec.fictional ? <FictionalLabel className="mt-2" /> : null}
        </figure>
      ) : face ? (
        <>
          <Mat tone="arena" plate={false} aspect="aspect-[4/3]" className="overflow-hidden rounded-ui">
            <div className="w-[48%]">
              <CardFace {...face} labelled surface="arena" sizes="(min-width: 1024px) 200px, 40vw" />
            </div>
          </Mat>
          <FictionalLabel className="mt-2" />
        </>
      ) : null}
      <BlockTitle className={photo || face ? "mt-5" : ""}>{copy.title}</BlockTitle>
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
