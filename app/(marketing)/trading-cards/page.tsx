import type { Metadata } from "next";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CardFace } from "../../../components/CardFace";
import { CardFlip } from "../../../components/CardFlip";
import { EditionPanel } from "../../../components/EditionPanel";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { JsonLd } from "../../../components/JsonLd";
import { QrRing } from "../../../components/QrRing";
import { SectionHeading } from "../../../components/SectionHeading";
import { asset } from "../../../lib/assets";
import { formatUsd, getTier, perCardAnchor, sitePrice, tiersFor } from "../../../lib/catalog/prices";
import { sports } from "../../../lib/catalog/sports";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { pageMeta } from "../../../lib/seo/meta";
import { productFamily } from "../../../lib/seo/jsonld";
import { pageFor } from "../../../lib/seo/titles";
import { ClosingSection } from "../(families)/_shared/closing";
import { DEMO_LABEL, demoCard, demoFaces } from "../(families)/_shared/demo-card";
import { FinishesSection } from "../(families)/_shared/finishes-row";
import { HeroCtaBlock, HeroPlate } from "../(families)/_shared/hero";
import { NumberlessSection } from "../(families)/_shared/numberless-block";
import { Section } from "../(families)/_shared/section";
import { ShowcaseFigure, firstShowcase, showcaseList } from "../(families)/_shared/showcase";
import { SpecSheetSection } from "../(families)/_shared/spec-sheet";
import { SportPicker, pickSport } from "../(families)/_shared/sport-picker";
import { TierRow } from "../(families)/_shared/tier-row";

/**
 * `/trading-cards` — the card family (COPY §2.2, DESIGN §5.2). Seven sections: hero + ladder, the spec
 * sheet, front + back registered, the six finishes, the sports without numbers, the "Still deciding?"
 * strip inside the closing block, and the blocks + FAQ + CTA. The hero flip is the page's one priority
 * image and never autoplays — it is above the fold (CONTRACTS §5.3).
 */
export const revalidate = 3600;

const PATH = "/trading-cards";

export const metadata: Metadata = pageMeta(PATH);

const H1 = "CUSTOM TRADING CARDS FROM YOUR PHOTOS.";
const SUBHEAD =
  "Not a template with a photo dropped in — composed around your athlete: their photos, their kit, their colors, their season. Front and back, with a registered card ID on the back.";
const REGISTERED_TITLE = "FRONT + BACK. REGISTERED.";
// The "not individually numbered / sealed pack" sentence is the EditionPanel's own line
// (EDITION_SENTENCE), and the panel sits a screen below this paragraph — it is said once, there.
const REGISTERED_BODY = `Four shots of your athlete, composed on one card. The back carries the season stats, the highlight line, the athlete signature line, the registered card ID and its QR code. ${CANON.registeredIdLine}`;

const HERO_SIZES = "(min-width: 1024px) 300px, 44vw";
const FLIP_SIZES = "(min-width: 1024px) 360px, 80vw";

/**
 * The spec sheet and the tier ladder stay a table of facts (DESIGN §5.2-2); section 03 is where the
 * card stops being a file and becomes an object someone holds, so it opens the right column with a
 * photograph of a printed card where the site map has one. COPY writes no line for these frames, so
 * each caption is the plainest description of its own photograph (INTEGRATION-NOTES § fix-imagery),
 * keyed to the asset that resolved — a fallback never inherits another frame's words.
 */
const LIFE_CARD_KEYS = ["life.card.hand", "life.card.desk", "life.card.case", "life.card.binder"] as const;

/**
 * The athlete holding their own card — the moment this page is actually selling, and the strongest
 * frames the site has (owner brief, 2026-09-07). Two settings, so the column shows a card in a life
 * rather than a card on a plate; when only one has landed it runs alone at the column's width, and
 * when neither has, the printed-card photographs above take the slot exactly as they did before.
 */
const MOMENT_CARD_KEYS = ["moment.card.bleachers", "moment.card.hallway"] as const;

const LIFE_CARD_CAPTION: Record<string, string> = {
  "life.card.hand": "A printed card held up in the gym.",
  "life.card.desk": "A printed card on a desk, beside a pen and a coin for scale.",
  "life.card.case": "A printed card standing in a display stand on a shelf.",
  "life.card.binder": "Printed cards in the sleeves of a collector's binder.",
};

export default async function TradingCardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const now = new Date();
  const params = await searchParams;
  const sport = pickSport(params.sport, sports, "basketball");
  const cta = ctaFor("cards", { sport: sport.slug });
  const faces = demoFaces();
  const card = demoCard();
  // ONE frame, not two (owner review, 2026-09-07). The column used to run both keys side by side and
  // they are the same picture twice: the same athlete holding the same card, one in bleachers and one
  // in a hallway. The second is not lost — it is the next key in the list the moment the first is gone.
  const moments = showcaseList(MOMENT_CARD_KEYS, LIFE_CARD_CAPTION, { limit: 1 });
  const life = moments.length ? null : firstShowcase(LIFE_CARD_KEYS, LIFE_CARD_CAPTION);
  const p12 = getTier("GDE-ANY-CARD-P12");
  const anchorLine = p12
    ? `Twelve printed cards for ${formatUsd(sitePrice(p12, now))} — less than ${formatUsd(perCardAnchor(now))} per card.`
    : null;
  const meta = pageFor(PATH);

  return (
    <>
      {/* 01 · Hero + the ladder */}
      <section aria-labelledby="s-01" className="pt-8 pb-16 md:pb-24 lg:pt-12 lg:pb-32">
        <div className="container-gallery">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Trading Cards", href: PATH }]} />
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              {/*
                ONE claim system, not three (owner review, 2026-09-07). This hero stacked a middot claim
                line with an accent tick, then the price line, then two outline delivery chips, then a
                grey shipping sentence — four blocks between the subhead and the button, three of them
                claims. The delivery chips are the page's one claim and they stay; the claim line said
                FRONT + BACK (the title of section 03), REGISTERED EDITION (the edition panel in it) and
                SQUARE-CUT · UV-COATED (rows 2 and 3 of the spec sheet), and the shipping sentence is
                said again on every tier card below and on /guarantee. What is left is the price, the
                delivery claim and the button.
              */}
              <SectionHeading as="h1" id="s-01" title={H1} subhead={SUBHEAD} />
              {anchorLine ? <p className="mt-8 max-w-[52ch] font-body text-body font-bold text-ink">{anchorLine}</p> : null}
              <HeroCtaBlock cta={cta} notes={[]} className="mt-8" />
            </div>
            {/* A compact static pair, not the flip (DESIGN §5.2-1): the flip lives in section 03,
                where it may autoplay once, and the hero shows both faces at a glance with no
                interaction and nothing that moves above the fold. Nothing here is preloaded —
                the mobile LCP is the headline.

                The pair used to sit on a dark 16 : 10 mat inside a grey plate: 616 × 697 of ground for
                two cards that filled the middle band of it. They now float on the page's own stock at
                a few degrees with the card shadow — the object the owner asked for. */}
            <div className="mt-12 lg:col-span-6 lg:mt-0">
              <HeroPlate>
                <div className="flex w-full items-center justify-center gap-[6%]">
                  <div className="w-[43%] rotate-[-4deg]">
                    <CardFace {...(faces?.front ?? asset("cards.demo.front"))} labelled sizes={HERO_SIZES} />
                  </div>
                  <div className="w-[43%] rotate-[4deg]">
                    <CardFace {...(faces?.back ?? asset("cards.demo.back"))} labelled sizes={HERO_SIZES} />
                  </div>
                </div>
                <FictionalLabel className="mt-8 text-center" />
              </HeroPlate>
            </div>
          </div>

          <div className="mt-12 lg:mt-16">
            <SportPicker action={PATH} options={sports} family="cards" selected={sport} />
            <TierRow family="cards" context="cards" sport={sport} now={now} className="mt-10" />
          </div>
        </div>
      </section>

      {/* 02 · The spec sheet */}
      <SpecSheetSection family="cards" />

      {/* 03 · Front + back, registered */}
      {/* The page's differentiator, restored to where DESIGN §5.2-3 puts it: the flip beside the
          registered back, whose QR ring and ID are readable without touching anything. */}
      <Section index={3} title={REGISTERED_TITLE} container="gallery">
        {/* Front and back at ONE scale. The flip used to carry a second, smaller back beside it —
            back.webp at 360 px inside the flip and again at 222 px next to it, uncaptioned — so the
            card the section is about appeared at two different sizes. The static back now matches the
            flip's width, which is what "FRONT + BACK" is meant to show. The QR ring points at the real
            QR, so the registered ID is readable without touching anything. */}
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10">
          <div className="lg:col-span-7">
            {faces ? (
              <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:gap-[4%]">
                <div className="w-full max-w-[320px] sm:w-[48%] sm:max-w-none">
                  <CardFlip front={faces.front} back={faces.back} mp4={faces.mp4} maxWidth={360} sizes={FLIP_SIZES} />
                </div>
                <div className="relative w-full max-w-[320px] sm:w-[48%] sm:max-w-none">
                  <CardFace {...faces.back} labelled sizes={FLIP_SIZES} />
                  <QrRing />
                </div>
              </div>
            ) : null}
            <FictionalLabel className="mt-6" />
            <p className="mt-10 max-w-[62ch] font-body text-body text-pretty text-ink">{REGISTERED_BODY}</p>
          </div>
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            {moments.length ? (
              <>
                {moments.map((moment) => (
                  <ShowcaseFigure
                    key={moment.key}
                    item={moment}
                    aspect="aspect-[4/5]"
                    sizes="(min-width: 1024px) 470px, 92vw"
                    labelled
                  />
                ))}
                <FictionalLabel className="mt-3" />
              </>
            ) : life ? (
              <ShowcaseFigure item={life} sizes="(min-width: 1024px) 470px, 92vw" />
            ) : null}
          </div>
        </div>
        {card ? <EditionPanel card={card} tone="stock" demoLabel={DEMO_LABEL} className="mt-14 lg:max-w-[42rem]" /> : null}
      </Section>

      {/* 04 · One athlete, six finishes */}
      <FinishesSection variant="card" />

      {/* 05 · Sports without numbers */}
      <NumberlessSection variant="card" />

      {/* 06 · "Still deciding?" lives inside the closing CTA block · 07 · Blocks + FAQ + CTA */}
      <ClosingSection faq="trading-cards" cta={cta} />

      <JsonLd
        data={productFamily({
          family: "cards",
          path: PATH,
          name: meta.title,
          description: meta.description,
          images: [asset("cards.demo.front").src, asset("cards.demo.back").src],
          tiers: tiersFor("cards", true),
          now,
        })}
      />
    </>
  );
}
