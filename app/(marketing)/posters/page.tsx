import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { RECORD_STYLE } from "../../../components/EditionPanel";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { JsonLd } from "../../../components/JsonLd";
import { Mat } from "../../../components/Mat";
import { Pill } from "../../../components/Pill";
import { Plate } from "../../../components/Plate";
import { SectionHeading } from "../../../components/SectionHeading";
import { ToScaleSheet } from "../../../components/ToScaleSheet";
import { asset } from "../../../lib/assets";
import { tiersFor } from "../../../lib/catalog/prices";
import { postersSports } from "../../../lib/catalog/sports";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { productFamily } from "../../../lib/seo/jsonld";
import { pageMeta } from "../../../lib/seo/meta";
import { pageFor } from "../../../lib/seo/titles";
import { ClosingSection } from "../(families)/_shared/closing";
import { FinishesSection } from "../(families)/_shared/finishes-row";
import { HeroCtaBlock } from "../(families)/_shared/hero";
import { NumberlessSection } from "../(families)/_shared/numberless-block";
import { Section } from "../(families)/_shared/section";
import { SpecSheetSection } from "../(families)/_shared/spec-sheet";
import { SportPicker, pickSport } from "../(families)/_shared/sport-picker";
import { TierRow } from "../(families)/_shared/tier-row";

/**
 * `/posters` — the poster family (COPY §2.3, DESIGN §5.2). The room shot is the page's one priority
 * image; section 03 is the to-scale sheet (pure SVG, one unit = one inch), not a photograph, so the
 * poster is measured against a person rather than against a frame. The picker lists only the sports
 * with poster art today (GAPS #16).
 */
export const revalidate = 3600;

const PATH = "/posters";

export const metadata: Metadata = pageMeta(PATH);

const H1 = "CUSTOM SPORTS POSTERS FROM YOUR PHOTOS.";
const SUBHEAD =
  "Not a template with a photo dropped in — composed around your athlete. The poster is art for the wall; the stats live on the card.";
const ROOM_CAPTION = "18 × 24 SHOWN · FRAMED";
const SCALE_TITLE = "TO SCALE. THE PERSON IS THE RULER.";
const SCALE_BODY =
  "Hung at a 58-inch center, the way galleries hang. The athlete on the sheet stands 5 ft 9 in — measure the poster against them, not against the frame.";

export default async function PostersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const now = new Date();
  const params = await searchParams;
  const options = postersSports();
  const sport = pickSport(params.sport, options, "basketball");
  const cta = ctaFor("posters", { sport: sport.slug });
  const room = asset("posters.room");
  const meta = pageFor(PATH);

  return (
    <>
      {/* 01 · Hero + the ladder */}
      <section aria-labelledby="s-01" className="pt-8 pb-16 md:pb-24 lg:pt-12 lg:pb-32">
        <div className="container-gallery">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Posters", href: PATH }]} />
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                id="s-01"
                title={H1}
                subhead={SUBHEAD}
                pills={
                  <>
                    <Pill tone="accent">FROM YOUR PHOTOS</Pill>
                    <Pill tone="outline">TWO PRINT SIZES</Pill>
                    <Pill tone="outline">300 DPI</Pill>
                  </>
                }
              />
              <HeroCtaBlock cta={cta} notes={[CANON.shipping]} className="mt-8" />
            </div>
            <div className="mt-10 lg:col-span-6 lg:mt-0">
              <div className="overflow-hidden rounded-ui border border-hairline">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={room.src}
                    alt={room.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 660px, 100vw"
                    className="object-cover object-[50%_40%]"
                  />
                  <Plate tone="stock" padding="sm" className={`absolute bottom-3 left-3 ${RECORD_STYLE}`}>
                    {ROOM_CAPTION}
                  </Plate>
                </div>
              </div>
              <FictionalLabel className="mt-2" />
            </div>
          </div>

          <div className="mt-12">
            <SportPicker action={PATH} options={options} selected={sport} />
            <TierRow family="posters" context="posters" sport={sport} now={now} className="mt-8" />
          </div>
        </div>
      </section>

      {/* 02 · The spec sheet */}
      <SpecSheetSection family="posters" />

      {/* 03 · To scale */}
      <Section index={3} title={SCALE_TITLE}>
        <Mat tone="stock">
          <ToScaleSheet />
        </Mat>
        <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-ink">{SCALE_BODY}</p>
      </Section>

      {/* 04 · One athlete, six finishes */}
      <FinishesSection variant="poster" />

      {/* 05 · Their name on the wall */}
      <NumberlessSection variant="poster" />

      {/* 06 · "Still deciding?" lives inside the closing CTA block · 07 · Blocks + FAQ + CTA */}
      <ClosingSection faq="posters" cta={cta} />

      <JsonLd
        data={productFamily({
          family: "posters",
          path: PATH,
          name: meta.title,
          description: meta.description,
          images: [room.src, asset("posters.finish.SN").src],
          tiers: tiersFor("posters", true),
          now,
        })}
      />
    </>
  );
}
