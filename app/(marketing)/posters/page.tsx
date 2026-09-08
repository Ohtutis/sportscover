import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { RECORD_STYLE } from "../../../components/EditionPanel";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { JsonLd } from "../../../components/JsonLd";
import { Plate } from "../../../components/Plate";
import { SectionHeading } from "../../../components/SectionHeading";
import { ToScaleSheet, type PosterArt } from "../../../components/ToScaleSheet";
import { asset, hasAsset, type ImageSpec } from "../../../lib/assets";
import { formatUsd, getTier, sitePrice, tiersFor } from "../../../lib/catalog/prices";
import { postersSports } from "../../../lib/catalog/sports";
import { ctaFor } from "../../../lib/cta";
import { productFamily } from "../../../lib/seo/jsonld";
import { pageMeta } from "../../../lib/seo/meta";
import { pageFor } from "../../../lib/seo/titles";
import { ClosingSection } from "../(families)/_shared/closing";
import { FinishesSection } from "../(families)/_shared/finishes-row";
import { ClaimLabels, HeroCtaBlock, HeroPlate } from "../(families)/_shared/hero";
import { NumberlessSection } from "../(families)/_shared/numberless-block";
import { Section } from "../(families)/_shared/section";
import { ShowcaseFigure, ShowcaseRow, firstShowcase, showcaseList } from "../(families)/_shared/showcase";
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
// "Not a template with a photo dropped in" opened this subhead until 2026-09-08 — a defence against
// an objection nobody had made, ahead of the sentence that says what a poster is.
const SUBHEAD =
  "Composed around your athlete. The poster is art for the wall; the stats live on the card.";
const ROOM_CAPTION = "18 × 24 SHOWN · FRAMED";
const SCALE_TITLE = "TO SCALE. THE PERSON IS THE RULER.";
const SCALE_BODY =
  "Hung at a 58-inch center, the way galleries hang. The athlete on the sheet stands 5 ft 9 in — measure the poster against them, not against the frame.";

/**
 * A poster is bought for a wall, so the hero is a wall (DESIGN §5.2-1). The **measured** room leads:
 * it is the only frame whose print size is known, so it is the only one that may carry the
 * `18 × 24 SHOWN · FRAMED` plate, and one framed poster above a desk says what one order contains.
 * The wide three-poster wall used to lead here; it now opens the gallery in section 03 instead, where
 * it is one room among several and its own caption says what is on the wall — in the hero it could be
 * read as three posters per order. A room the manifest has not measured still renders without the
 * plate rather than inheriting the claim.
 */
const LIFE_ROOM_KEYS = ["life.poster.room", "life.poster.room.wide", "life.poster.room.baseball"] as const;

/**
 * Section 03's wall gallery (owner review, 2026-09-07: *"poster page missing showing posters in
 * different settings, like we have in Figma"*). Six rooms, six sports, six athletes — one poster
 * framed in each, so a visitor sees the thing hanging in a home rather than floating on a plate.
 *
 * The keys are the asset contract; the rooms already in the map follow them, so the row is never
 * empty and never a box waiting for a file. Every entry is read through `hasAsset()`, and the file
 * the hero is already showing is excluded — the same photograph is never on the page twice.
 */
const WALL_KEYS = ["wall.basketball", "wall.baseball", "wall.football", "wall.soccer", "wall.cheerleading", "wall.volleyball"] as const;

const GALLERY_KEYS = [...WALL_KEYS, ...LIFE_ROOM_KEYS] as const;

const WALL_SIZES = "(min-width: 1024px) 400px, (min-width: 768px) 300px, 76vw";

/**
 * The to-scale photograph beside the drawn sheet, when one exists that shows only sizes we sell.
 * `ToScaleSheet` stays the measurement — the photograph is the same fact in a room, not a
 * replacement for it (DESIGN §4.15, finding 9).
 */
const SCALE_KEYS = ["scale.sizes"] as const;

/**
 * The artwork hung in the to-scale sheet's two rectangles (owner review, 2026-09-07: the sheet was a
 * stick figure between two empty grey boxes). ONE design in both frames, so the only thing that differs
 * between them is the size — which is the whole point of the sheet. The 18 × 24 box is the art's own
 * 3 : 4, so nothing is cropped; the 24 × 36 box is 2 : 3 and takes the same file cropped to it, the way
 * the larger print is recomposed. `hasAsset` keeps the sheet drawing empty frames if the key ever goes.
 */
const SHEET_POSTER_KEYS: Record<string, readonly string[]> = {
  basketball: ["set.hero.poster"],
  softball: ["hero.story.2.poster"],
  baseball: ["sn.hero.baseball.poster"],
  football: ["posters.finish.SN"],
};

function posterArt(slug: string): PosterArt | null {
  for (const key of [...(SHEET_POSTER_KEYS[slug] ?? []), "posters.finish.SN", "posters.finish.FS", "posters.finish.CA"]) {
    if (hasAsset(key)) {
      const spec = asset(key);
      return { small: spec, large: spec };
    }
  }
  return null;
}

function heroRoom(): { spec: ImageSpec; measured: boolean } {
  const measured = asset("posters.room");
  for (const key of LIFE_ROOM_KEYS) {
    if (hasAsset(key)) {
      const spec = asset(key);
      // Several keys may resolve to the same file; the caption follows the FILE, not the key.
      return { spec, measured: spec.src === measured.src };
    }
  }
  return { spec: measured, measured: true };
}

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
  const hero = heroRoom();
  const room = hero.spec;
  const rooms = showcaseList(GALLERY_KEYS, {}, { limit: 6, exclude: [room.src] });
  const scale = firstShowcase(SCALE_KEYS);
  const scaleArt = posterArt(sport.slug);
  const p1824 = getTier("GDE-ANY-POST-P1824");
  const anchorLine = p1824 ? `An 18 × 24 printed poster for ${formatUsd(sitePrice(p1824, now))}.` : null;
  const meta = pageFor(PATH);

  return (
    <>
      {/* 01 · Hero + the ladder */}
      <section aria-labelledby="s-01" className="pt-8 pb-16 md:pb-24 lg:pt-12 lg:pb-32">
        <div className="container-gallery">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Posters", href: PATH }]} />
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                id="s-01"
                title={H1}
                subhead={SUBHEAD}
                pills={<ClaimLabels claims={[{ text: "FROM YOUR PHOTOS", tone: "accent" }, { text: "TWO PRINT SIZES" }, { text: "300 DPI" }]} />}
              />
              {anchorLine ? <p className="mt-8 max-w-[52ch] font-body text-body font-bold text-ink">{anchorLine}</p> : null}
              {/* One claim system, the way /trading-cards was trimmed (handoff #21): the price line,
                  the delivery chips, the button. C11 used to sit between the chips and the CTA as a
                  third grey claim, and it is printed again on every tier card below and on /guarantee. */}
              <HeroCtaBlock cta={cta} notes={[]} className="mt-8" />
            </div>
            {/* Nothing here is preloaded: the mobile LCP is the headline, and a room photograph the
                phone paints below the copy has no claim on the first bytes. */}
            <div className="mt-12 lg:col-span-6 lg:mt-0">
              <HeroPlate>
                {/* The room photograph is the object; it used to sit inside a grey plate that added
                    nothing but a border of ground (owner review, 2026-09-07). It now floats on stock
                    with the card shadow, edge to edge with the copy column. */}
                {/* Capped (layout audit, 2026-09-08): at 834 the object column is the whole page, so a
                    4 : 3 box drew a 770 × 578 room — bigger than the 616 × 462 the same photograph gets
                    at 1440. The cap is the width the column has at 1440, so the desktop is untouched
                    and the tablet stops drawing the product larger than the desktop does. */}
                <div className="relative mx-auto aspect-[4/3] w-full max-w-[620px] overflow-hidden rounded-ui shadow-[var(--shadow-card-stock)]">
                  <Image
                    src={room.src}
                    alt={room.alt}
                    fill
                    sizes="(min-width: 1024px) 560px, (min-width: 640px) 90vw, 100vw"
                    className={hero.measured ? "object-cover object-[50%_40%]" : "object-cover object-center"}
                  />
                  {hero.measured ? (
                    <Plate tone="stock" padding="sm" className={`absolute bottom-3 left-3 ${RECORD_STYLE}`}>
                      {ROOM_CAPTION}
                    </Plate>
                  ) : null}
                </div>
                <FictionalLabel className="mt-4" />
              </HeroPlate>
            </div>
          </div>

          <div className="mt-12 lg:mt-16">
            <SportPicker action={PATH} options={options} family="posters" selected={sport} />
            <TierRow family="posters" context="posters" sport={sport} now={now} className="mt-10" />
          </div>
        </div>
      </section>

      {/* 02 · The spec sheet */}
      <SpecSheetSection family="posters" />

      {/* 03 · To scale, and the same poster on six walls */}
      {/* The drawn sheet answers "how big is it"; the photographs under it answer "where does it
          live" — six rooms, six sports, six athletes (owner review, 2026-09-07). COPY writes no
          heading for a room gallery, so the rooms sit inside this section rather than inventing an
          eighth H2, and every caption is the plainest description of its own frame. */}
      <Section index={3} title={SCALE_TITLE} container="gallery">
        {/* One column, not two. The sheet is a wide, tall object and the sentence beside it is four
            lines, so a 7/5 split ended one column 550 px above the other; and the sheet used to sit on
            a 938 × 840 hairline plate, which made the biggest object on a page about posters a drawing
            on grey. It is line work on the page's own stock now, the two rectangles hold the poster
            instead of standing in for it, and the sentence sits under it. */}
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10">
          <div className={scale ? "lg:col-span-7" : "lg:col-span-12"}>
            <ToScaleSheet art={scaleArt} sizes="(min-width: 1024px) 230px, 30vw" className={scale ? "" : "mx-auto max-w-[56rem]"} />
            {scaleArt ? <FictionalLabel className="mx-auto mt-5 max-w-[56rem]" /> : null}
          </div>
          {scale ? (
            <div className="mt-10 lg:col-span-5 lg:mt-0">
              <ShowcaseFigure item={scale} sizes="(min-width: 1024px) 440px, 92vw" />
            </div>
          ) : null}
        </div>
        <p className="mx-auto mt-10 max-w-[62ch] font-body text-body text-pretty text-ink">{SCALE_BODY}</p>
        {/* The captions here used to read the picture back to someone already looking at it — the
            asset's own alt line, printed under the photograph it describes. The sport is what a buyer
            needs from a wall gallery, and `showSport` says it; the sentence stays in `alt`, where it
            does its job. */}
        <ShowcaseRow items={rooms} sizes={WALL_SIZES} showCaption={false} className="mt-16" />
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
