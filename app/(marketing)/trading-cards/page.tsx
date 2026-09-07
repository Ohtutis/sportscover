import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CardFace } from "../../../components/CardFace";
import { CardFlip } from "../../../components/CardFlip";
import { EditionPanel } from "../../../components/EditionPanel";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { JsonLd } from "../../../components/JsonLd";
import { Mat } from "../../../components/Mat";
import { Pill } from "../../../components/Pill";
import { QrRing } from "../../../components/QrRing";
import { SectionHeading } from "../../../components/SectionHeading";
import { asset, hasAsset, type ImageSpec } from "../../../lib/assets";
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
import { HeroCtaBlock } from "../(families)/_shared/hero";
import { NumberlessSection } from "../(families)/_shared/numberless-block";
import { Section } from "../(families)/_shared/section";
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

const LIFE_CARD_CAPTION: Record<string, string> = {
  "life.card.hand": "A printed card held up in the gym.",
  "life.card.desk": "A printed card on a desk, beside a pen and a coin for scale.",
  "life.card.case": "A printed card standing in a display stand on a shelf.",
  "life.card.binder": "Printed cards in the sleeves of a collector's binder.",
};

/** The first verified key with its caption, or null while every one is still `locate`. */
function lifeCard(): { spec: ImageSpec; caption: string } | null {
  for (const key of LIFE_CARD_KEYS) {
    if (hasAsset(key)) {
      const spec = asset(key);
      return { spec, caption: LIFE_CARD_CAPTION[key] ?? spec.alt };
    }
  }
  return null;
}

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
  const life = lifeCard();
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
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                id="s-01"
                title={H1}
                subhead={SUBHEAD}
                pills={
                  <>
                    <Pill tone="accent">FRONT + BACK</Pill>
                    <Pill tone="outline">REGISTERED EDITION</Pill>
                    <Pill tone="outline">SQUARE-CUT · UV-COATED</Pill>
                  </>
                }
              />
              {anchorLine ? <p className="mt-8 max-w-[62ch] font-body text-body font-bold text-ink">{anchorLine}</p> : null}
              <HeroCtaBlock cta={cta} notes={[CANON.shipping]} className="mt-6" />
            </div>
            {/* A compact static pair, not the flip (DESIGN §5.2-1): the flip lives in section 03,
                where it may autoplay once, and the hero shows both faces at a glance with no
                interaction and nothing that moves above the fold. */}
            <div className="mt-10 lg:col-span-6 lg:mt-0">
              <Mat tone="arena" aspect="aspect-[16/10]" matClassName="justify-center">
                <div className="flex w-full items-center justify-center gap-[6%]">
                  <div className="w-[44%]">
                    <CardFace {...(faces?.front ?? asset("cards.demo.front"))} labelled surface="arena" priority sizes={HERO_SIZES} />
                  </div>
                  <div className="w-[44%]">
                    <CardFace {...(faces?.back ?? asset("cards.demo.back"))} labelled surface="arena" sizes={HERO_SIZES} />
                  </div>
                </div>
              </Mat>
              <FictionalLabel className="mt-2" />
            </div>
          </div>

          <div className="mt-12">
            <SportPicker action={PATH} options={sports} family="cards" selected={sport} />
            <TierRow family="cards" context="cards" sport={sport} now={now} className="mt-8" />
          </div>
        </div>
      </section>

      {/* 02 · The spec sheet */}
      <SpecSheetSection family="cards" />

      {/* 03 · Front + back, registered */}
      {/* The page's differentiator, restored to where DESIGN §5.2-3 puts it: the flip beside the
          registered back, whose QR ring and ID are readable without touching anything. */}
      <Section index={3} title={REGISTERED_TITLE} container="gallery">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
          <div className="lg:col-span-7">
            {faces ? (
              <Mat tone="arena" matClassName="justify-center">
                <CardFlip
                  front={faces.front}
                  back={faces.back}
                  mp4={faces.mp4}
                  maxWidth={360}
                  sizes={FLIP_SIZES}
                  staticBackBeside={
                    <div className="relative w-full">
                      <CardFace {...faces.back} labelled surface="arena" sizes="(min-width: 1024px) 200px, 40vw" />
                      <QrRing />
                    </div>
                  }
                />
              </Mat>
            ) : null}
            <FictionalLabel className="mt-2" />
          </div>
          <div className="mt-8 lg:col-span-5 lg:mt-0">
            {life ? (
              <figure className="mb-8">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-ui bg-arena">
                  <Image
                    src={life.spec.src}
                    alt={life.spec.alt}
                    fill
                    sizes="(min-width: 1024px) 420px, 92vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 font-body text-[0.75rem] font-medium text-muted-text">{life.caption}</figcaption>
                {life.spec.fictional ? <FictionalLabel className="mt-2" /> : null}
              </figure>
            ) : null}
            <p className="max-w-[62ch] font-body text-body text-pretty text-ink">{REGISTERED_BODY}</p>
            {card ? <EditionPanel card={card} tone="stock" demoLabel={DEMO_LABEL} className="mt-8" /> : null}
          </div>
        </div>
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
