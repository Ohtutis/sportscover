import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { BracketFrame } from "../../../components/BracketFrame";
import { ButtonLink } from "../../../components/ButtonLink";
import { CardFace } from "../../../components/CardFace";
import { CtaPair } from "../../../components/CtaPair";
import { DeliveryChips } from "../../../components/DeliveryChips";
import { FaqList } from "../../../components/FaqList";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Shield } from "../../../components/brand/Shield";
import { OrderByCalculator } from "../../../components/OrderByCalculator";
import { Pill } from "../../../components/Pill";
import { Plate } from "../../../components/Plate";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { asset, assetOrNull, hasAsset, type ImageSpec } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { toEtDate } from "../../../lib/capacity";
import { faqSubset } from "../../../lib/catalog/faq";
import { sportBySlug } from "../../../lib/catalog/sports";
import { CALC_COPY } from "../../../lib/copy/calc";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor, etsyHref, seniorNightSku, SENIOR_NIGHT_ANY_SKU } from "../../../lib/cta";
import { pageMeta } from "../../../lib/seo/meta";
import { SUPPORT_EMAIL } from "../../../lib/site";
import { GiftNote } from "./_gift-note";

export const revalidate = 3600;

export const metadata: Metadata = pageMeta("/senior-night");

const GIFT_NOTE_ID = "gift-note";

/** COPY §2.5 (1) — the group label of the composed hero cluster, and its OG-image alt. */
export const SN_HERO_GROUP_LABEL =
  "Senior Night edition: custom basketball poster and trading card, front and back, in the gold senior finish — example artwork, fictional athlete";

/** COPY §2.5 (4) — nine sports, in COPY's order. Never dance, track, band or lacrosse. */
const SN_SPORTS: { slug: string; caption?: string }[] = [
  { slug: "football" },
  { slug: "volleyball" },
  { slug: "cheerleading", caption: "name + crest — no number" },
  { slug: "soccer" },
  { slug: "basketball" },
  { slug: "wrestling" },
  { slug: "softball" },
  { slug: "baseball" },
  { slug: "ice-hockey" },
];

/** COPY §2.5 (6) — the four canon blocks, each under its heading. */
const TRUST_BLOCKS = [
  { title: "Our promise", body: block("our-promise") },
  { title: "How it's made", body: block("how-its-made") },
  { title: "Photo privacy", body: block("photo-privacy") },
  { title: "Independent studio", body: block("independent-studio") },
] as const;

/**
 * Section 05 is about a whole class ordering at once, and it was a heading and two sentences. Where
 * the site map carries the photograph of a team's order — the stack of tubes and card boxes before it
 * is handed out — the section leads with it. COPY writes no line for that frame, so the caption is the
 * plainest description of what is in it (INTEGRATION-NOTES § fix-imagery); with no photograph the
 * section reads exactly as it did.
 */
const TEAM_ORDER_KEYS = ["moment.team.senior", "life.team.order", "life.team.order.baseball"] as const;

const TEAM_ORDER_CAPTION = "A team's order staged on a table: posters, shipping tubes, stacks of cards and the box they ship in.";

/**
 * The hero object (owner review, 2026-09-07). Where the site map carries the senior-night moment —
 * the athlete, his parents and the framed poster under the lights, the card still in his hand — that
 * photograph IS the hero: one frame carries both products, the same athlete on each, and the reason
 * anybody buys them. Until such a key lands the object falls back to the cluster composed in code
 * from the three SR layers (GAPS #7: layers, never the whole listing slide).
 */
const SN_MOMENT_KEYS = ["moment.senior.field", "life.gift.moment"] as const;

/** The first of these keys the manifest has produced, or null. `hasAsset` is safe on a key it has never heard of. */
function firstAsset(keys: readonly string[]): ImageSpec | null {
  for (const key of keys) if (hasAsset(key)) return asset(key);
  return null;
}

/* Owner review 2026-09-07: 256 px between bands while the blocks inside sat 8–24 px apart. */
const SECTION = "py-14 md:py-20 lg:py-24";
const INDEX_ROW = "flex items-center justify-between gap-4 border-t border-hairline pt-3";
const INDEX_TEXT = "font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-muted-text";

/** The three SR layers, laid out in code — the object when no senior-night photograph exists yet. */
function SeniorNightCluster() {
  const poster = asset("sn.hero.poster");
  const front = asset("sn.hero.front");
  const back = asset("sn.hero.back");
  return (
    <div className="relative w-full">
      <div className="mx-auto w-[66%] rotate-[-2deg]">
        <Image
          src={poster.src}
          alt={poster.alt}
          width={poster.width}
          height={poster.height}
          sizes="(min-width: 1024px) 420px, 45vw"
          className="h-auto w-full shadow-[var(--shadow-card-stock)]"
        />
      </div>
      <div className="absolute bottom-[4%] right-[20%] hidden w-[22%] sm:block">
        <CardFace {...back} labelled sizes="(min-width: 1024px) 150px, 16vw" />
      </div>
      <div className="absolute bottom-0 right-0 w-[24%]">
        <CardFace {...front} labelled sizes="(min-width: 1024px) 165px, 18vw" />
      </div>
    </div>
  );
}

/**
 * The hero media. Nothing here is preloaded: the mobile LCP is the headline, and a preload hint
 * fetches the hero art ahead of everything else whatever the layout does with those pixels
 * afterwards. The box is reserved by an aspect ratio, so the photograph shifts nothing as it loads.
 */
function SeniorNightHeroMedia() {
  const moment = firstAsset(SN_MOMENT_KEYS);
  return (
    <figure
      // One photograph names itself in its own alt; the composed cluster is three images and takes
      // the group label instead.
      aria-label={moment ? undefined : SN_HERO_GROUP_LABEL}
      className="flex w-full flex-col justify-center lg:h-full"
    >
      {/* No mat. The SR poster and the two card faces are dark art; a dark 8 % mat inside a ruled plate
          put a grey border around them and shrank the product by a sixth (owner review, 2026-09-07).
          They float on the page's own stock with the card shadow instead. */}
      <div className="w-full">
        <div className="relative w-full">
          {moment ? (
            /* The photograph keeps its own ratio — the showcase frames are landscape, and a fixed
               square box would crop a third of the field away. width/height reserve the box. */
            <Image
              src={moment.src}
              alt={moment.alt}
              width={moment.width}
              height={moment.height}
              sizes="(min-width: 1024px) 620px, 92vw"
              className="h-auto w-full rounded-none shadow-[var(--shadow-card-stock)]"
            />
          ) : (
            <SeniorNightCluster />
          )}
          {/* Gold is the only pill allowed inside the media; the accent claim lives in the text
              column, and the edition line is claimed once per screen — there, not here. */}
          <div className="absolute left-0 top-0">
            <Plate tone="arena" padding="sm">
              <Pill tone="gold">FROM YOUR PHOTOS</Pill>
            </Plate>
          </div>
        </div>
      </div>
      <figcaption className="mt-6">
        <FictionalLabel />
      </figcaption>
    </figure>
  );
}

/**
 * A Senior Night sport tile: the card IS the tile, then the sport name. It used to be a ruled plate
 * around a 4 : 5 arena mat with the card at 76 % of it — 285 × 356 of tile for a 182 × 254 card, 51 px
 * of dead black down each side, nine times over (owner review, 2026-09-07). The card now runs the full
 * width of its column and floats on the page's own stock. Ice hockey has no SR front (GAPS #17), so it
 * renders the navy text tile — silver shield, the name in Anton with a full stop — at the card's own
 * 5 : 7, and carries its name once, inside the tile.
 */
function SportTile({ slug, caption }: { slug: string; caption?: string }) {
  const sport = sportBySlug(slug);
  const face = assetOrNull(`sn.sport.${slug}.front`);
  const name = sport?.name ?? slug;
  return (
    <a href={etsyHref(seniorNightSku(slug))} className="group block outline-offset-4">
      {face ? (
        <CardFace {...face} labelled sizes="(min-width: 1024px) 280px, 30vw" />
      ) : (
        <div className="flex aspect-[5/7] items-center justify-center rounded-ui bg-navy p-[8%] shadow-[var(--shadow-card-stock)]">
          <span className="flex flex-col items-center gap-3 text-center">
            <Shield tone="arena" size={40} />
            <span className="font-display text-h3 uppercase leading-none text-white">{name}.</span>
          </span>
        </div>
      )}
      {face ? (
        <span className="mt-4 block font-body text-[0.9375rem] font-medium text-ink underline-offset-4 group-hover:underline">{name}</span>
      ) : null}
      {caption ? <span className="mt-1 block font-body text-small text-muted-text">{caption}</span> : null}
    </a>
  );
}

export default function SeniorNightPage() {
  const todayEt = toEtDate(new Date());
  const cta = ctaFor("senior-night");
  const faq = faqSubset("senior-night");
  const teamOrder = firstAsset(TEAM_ORDER_KEYS);

  return (
    <>
      <div className="print:hidden">
        {/* 01 · Hero */}
        <section aria-labelledby="sn-hero" className="pt-8 pb-16 md:pb-24 lg:pb-32">
          <div className="container-gallery">
            <Breadcrumbs
              trail={[
                { name: "Home", href: "/" },
                { name: "Senior Night", href: "/senior-night" },
              ]}
            />
            {/*
              One text column, one object column, stretched to one row (owner review 2026-09-07). The
              chips and the CTA used to be a third grid item: they fell into row two, which the tall
              media had already sized, so the buttons sat ~300 px below the end of the copy at 1280.
            */}
            <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
              <div className="lg:col-span-6">
                <SectionHeading
                  as="h1"
                  id="sn-hero"
                  title="ONE LAST HOME GAME."
                  subhead="A senior edition built from your athlete's own photos — gold Senior Night finish, class year, four-year career line and their senior quote, on a card and poster that are theirs alone."
                  // A claim is not a button: a filled lozenge above a filled button is the button
                  // pattern printed twice. The claim is type; the accent survives as the 3 px tick.
                  pills={
                    <Pill variant="label" tone="accent">
                      SENIOR EDITION · 1 OF 1
                    </Pill>
                  }
                />
                <DeliveryChips kind="seniorNight" className="mt-6" />
                <CtaPair {...cta} size="lg" className="mt-6" />
                <TrustLine />
              </div>
              <div className="mt-10 lg:col-span-6 lg:mt-0">
                <SeniorNightHeroMedia />
              </div>
            </div>
          </div>
        </section>

        {/* 02 · Order-by calculator */}
        <section aria-labelledby="sn-calc" className={SECTION}>
          <div className="container-site">
            <SectionHeading as="h2" id="sn-calc" index="02 / 06" title={CALC_COPY.heading} />
            <div className="mt-8 max-w-[40rem] rounded-ui border border-hairline p-6 lg:mt-12 lg:p-10">
              <OrderByCalculator todayEt={todayEt} cta={cta.primary} giftNoteId={GIFT_NOTE_ID} />
            </div>
            <p className="mt-4 max-w-[62ch] font-body text-small text-muted-text">{CANON.seniorDateLine}</p>
          </div>
        </section>

        {/* 03 · What makes it a senior edition */}
        <section aria-labelledby="sn-what" className={SECTION}>
          <div className="container-site">
            <SectionHeading as="h2" id="sn-what" index="03 / 06" title="WHAT MAKES IT A SENIOR EDITION." />
            {/*
              One system for three cells (owner review, 2026-09-07). They used to be three different
              shapes — a 640 px bracketed card with its heading UNDER it, a bare paragraph, and a small
              grey-plated image pair — so the three headings sat at y 394, 645 and 1038 and the middle
              cell left about 800 px of white. Every cell is now heading → sentence → exhibit, the two
              exhibits share one 4 : 3 box, and the cell with no exhibit (the certificate is deliberately
              not shown — GAPS #32) is last, so the short cell ends the row instead of holing it.
            */}
            <div className="mt-10 grid items-start gap-x-10 gap-y-12 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
              <div>
                <h3 className="font-display text-h3 uppercase">The back</h3>
                <p className="mt-3 max-w-[42ch] font-body text-small text-muted-text">
                  Career highs, class year, the four-year line — FR · SO · JR · SR — the senior quote, the athlete signature line, and
                  SENIOR EDITION · 1 OF 1 beside the registered card ID.
                </p>
                <BracketFrame fictional className="mt-6">
                  <div className="flex aspect-[4/3] items-center justify-center">
                    <div className="h-full aspect-[5/7]">
                      <CardFace {...asset("sn.back")} labelled sizes="(min-width: 1024px) 175px, 42vw" />
                    </div>
                  </div>
                </BracketFrame>
              </div>
              <div>
                <h3 className="font-display text-h3 uppercase">The badge and sticker</h3>
                <p className="mt-3 max-w-[42ch] font-body text-small text-muted-text">Die-cut bonus files in the senior gold.</p>
                <BracketFrame fictional className="mt-6">
                  {/* No mat here either: the die-cuts are black and gold, they read on stock, and the
                      8 % hairline mat they used to sit on was filled 26 % (measured). They stack in the
                      same 4 : 3 box the card opposite them uses, so the two exhibits are one system. */}
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-[6%]">
                    <Image
                      src={asset("sn.badge").src}
                      alt={asset("sn.badge").alt}
                      width={asset("sn.badge").width}
                      height={asset("sn.badge").height}
                      sizes="(min-width: 1024px) 125px, 26vw"
                      className="h-auto w-[36%]"
                    />
                    <Image
                      src={asset("sn.sticker").src}
                      alt={asset("sn.sticker").alt}
                      width={asset("sn.sticker").width}
                      height={asset("sn.sticker").height}
                      sizes="(min-width: 1024px) 235px, 50vw"
                      className="h-auto w-[68%]"
                    />
                  </div>
                </BracketFrame>
              </div>
              <div>
                <h3 className="font-display text-h3 uppercase">The certificate</h3>
                <p className="mt-3 max-w-[42ch] font-body text-small text-muted-text">
                  A printed Certificate of Authenticity ships with every printed set.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 04 · Nine sports */}
        <section aria-labelledby="sn-sports" className={SECTION}>
          <div className="container-gallery">
            <SectionHeading
              as="h2"
              id="sn-sports"
              index="04 / 06"
              title="NINE SENIOR NIGHTS, MEASURED."
              subhead="The sports parents search for by name. Every other sport gets its senior edition at the order."
            />
            <div className="mt-10 grid max-w-[1120px] grid-cols-3 gap-x-6 gap-y-10 sm:gap-x-8 lg:mt-12">
              {SN_SPORTS.map((tile) => (
                <SportTile key={tile.slug} slug={tile.slug} caption={tile.caption} />
              ))}
            </div>
            <FictionalLabel className="mt-8 max-w-[1120px]" />
            <p className="mt-8 font-body text-body">
              <a href={etsyHref(SENIOR_NIGHT_ANY_SKU)} className="underline-offset-4 decoration-1 hover:underline">
                Another sport? Choose it at the order — all 17 get the senior edition.
              </a>
            </p>
          </div>
        </section>

        {/* 05 · The whole senior class */}
        <section aria-labelledby="sn-class" className={SECTION}>
          <div className="container-site">
            <div className="mx-auto max-w-[52ch] text-center">
              <div className={`${INDEX_ROW} justify-center`}>
                <span aria-hidden="true" className={INDEX_TEXT}>
                  05 / 06
                </span>
              </div>
              <h2 id="sn-class" className="mt-6 font-display text-h2 uppercase text-balance">
                THE WHOLE SENIOR CLASS?
              </h2>
              <p className="mx-auto mt-6 font-body text-body text-pretty">
                One link for every family. You set the crest, the colors and the deadline once; every parent orders and pays for their own
                athlete, and every card is built and proofed on its own.
              </p>
              {teamOrder ? (
                <figure className="mt-8">
                  <div className="overflow-hidden rounded-ui bg-arena">
                    <Image
                      src={teamOrder.src}
                      alt={teamOrder.alt}
                      width={teamOrder.width}
                      height={teamOrder.height}
                      sizes="(min-width: 1024px) 560px, 92vw"
                      className="h-auto w-full"
                    />
                  </div>
                  <figcaption className="mt-2 font-body text-[0.75rem] font-medium text-muted-text">{TEAM_ORDER_CAPTION}</figcaption>
                  {teamOrder.fictional ? <FictionalLabel className="mt-2" /> : null}
                </figure>
              ) : null}
              <div className="mt-8 flex justify-center">
                <ButtonLink href={`mailto:${SUPPORT_EMAIL}?subject=Senior%20night%20team`}>Email us about the class</ButtonLink>
              </div>
            </div>
          </div>
        </section>

        {/* 06 · Trust stack */}
        <section aria-label="Our promise, how it's made, photo privacy and the studio" className={SECTION}>
          <div className="container-site">
            <div className={INDEX_ROW}>
              <span aria-hidden="true" className={INDEX_TEXT}>
                06 / 06
              </span>
            </div>
            <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-12">
              {TRUST_BLOCKS.map((b) => (
                <div key={b.title}>
                  <h3 className="font-display text-h3 uppercase">{b.title}</h3>
                  <p className="mt-3 max-w-[62ch] font-body text-body text-pretty">{b.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 max-w-[62ch] font-body text-small text-muted-text">{CANON.seniorDateLine}</p>
            <FaqList items={faq} jsonLd className="mt-12" />
            <div className="mt-12 border-t border-hairline pt-8">
              <CtaPair {...cta} size="lg" />
              <DeliveryChips kind="seniorNight" className="mt-6" />
              <TrustLine />
            </div>
          </div>
        </section>
      </div>
      <GiftNote id={GIFT_NOTE_ID} />
    </>
  );
}
