import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CardFace } from "../../../components/CardFace";
import { EditionPanel } from "../../../components/EditionPanel";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Ledger } from "../../../components/Ledger";
import { JsonLd } from "../../../components/JsonLd";
import { SectionHeading } from "../../../components/SectionHeading";
import { asset } from "../../../lib/assets";
import { LEAD_TIMES } from "../../../lib/catalog/delivery";
import { formatUsd, getTier, sitePrice, tiersFor } from "../../../lib/catalog/prices";
import { sports } from "../../../lib/catalog/sports";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { productFamily } from "../../../lib/seo/jsonld";
import { pageMeta } from "../../../lib/seo/meta";
import { pageFor } from "../../../lib/seo/titles";
import { ClosingSection } from "../(families)/_shared/closing";
import { DEMO_LABEL, demoCard } from "../(families)/_shared/demo-card";
import { FinishesSection } from "../(families)/_shared/finishes-row";
import { ClaimLabels, HeroCtaBlock, HeroPlate } from "../(families)/_shared/hero";
import { NumberlessSection } from "../(families)/_shared/numberless-block";
import { Section } from "../(families)/_shared/section";
import { ShowcaseFigure, firstShowcase } from "../(families)/_shared/showcase";
import { SpecSheetSection, setFolderRows } from "../(families)/_shared/spec-sheet";
import { pickSport } from "../(families)/_shared/sport-picker";
import { TierRow } from "../(families)/_shared/tier-row";

/**
 * `/complete-set` — everything we make for one athlete (COPY §2.4, DESIGN §5.2). The hero is composed
 * in code from the poster and the two card faces (GAPS #1) — no certificate layer, no sealed pack
 * imagery anywhere (GAPS #12). Section 03 counts the files through `FILE_COUNTS` and shows the stages
 * the packages arrive in; the "everything counted" slide is never shown (GAPS #10).
 */
export const revalidate = 3600;

const PATH = "/complete-set";

export const metadata: Metadata = pageMeta(PATH);

const H1 = "THE COMPLETE EDITION: POSTER, CARDS, CERTIFICATE, REGISTRY.";
const SUBHEAD =
  "Everything we make for one athlete, counted — the poster, the card front and back, the certificate, the flip video, the wallpapers and the card's own registered page.";
const STAGES_TITLE = "EVERYTHING COUNTED. DELIVERED IN STAGES.";
const ULTIMATE_LINE = "Ultimate ships as three tracked packages.";

const [digitalMin, digitalMax] = LEAD_TIMES.digitalBusinessDays;
const [shipMin, shipMax] = LEAD_TIMES.printShipBusinessDays;
const [packMin, packMax] = LEAD_TIMES.sealedPackWeeks;

/**
 * The count stays a Ledger of facts (GAPS #10); beside it goes the set as it lands on a table, where
 * the site map has that photograph. COPY writes no line for these frames, so the caption is the
 * plainest description of the frame that resolved (INTEGRATION-NOTES § fix-imagery). The poster on an
 * arena mat is the fallback, exactly as it was.
 */
const LIFE_SET_KEYS = [
  // The showcase names the asset contract publishes for a photographed set; the `life.*` keys below
  // are the sets already in the map, so this slot has a real photograph today and takes the better
  // one the moment it lands. `moment.team.senior` is last on purpose: a team's order is six
  // athletes' packages, and this section counts what ONE order contains — it may only ever stand in
  // for an empty slot, never displace the set itself.
  "set.showcase.printed",
  "set.showcase.deluxe",
  "life.set.printed",
  "life.set.deluxe",
  "moment.team.senior",
] as const;

const LIFE_SET_CAPTION: Record<string, string> = {
  "life.set.printed": "The printed set on a table: the poster, the shipping tube and a fan of cards.",
  "life.set.deluxe": "The printed set on a table: the poster, the shipping tube and rows of cards.",
};

interface Stage {
  name: string;
  detail: string;
}

/** COPY §2.4 (3) — the sealed-pack stop exists only with the Ultimate tier (GAPS #12). */
function stages(): Stage[] {
  const rows: Stage[] = [
    { name: "Files", detail: `${digitalMin}–${digitalMax} business days from your order` },
    { name: "Printed cards and poster", detail: `ship ${shipMin}–${shipMax} business days from your order, in separate packages` },
  ];
  if (getTier("GDE-ANY-SET-ULT")?.enabled) rows.push({ name: "Sealed pack", detail: `${packMin}–${packMax} weeks, separately` });
  return rows;
}

export default async function CompleteSetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const now = new Date();
  const params = await searchParams;
  const sport = pickSport(params.sport, sports, "basketball");
  const cta = ctaFor("set", { sport: sport.slug });
  const card = demoCard();
  const poster = asset("set.hero.poster");
  const front = asset("set.hero.front");
  const back = asset("set.hero.back");
  const meta = pageFor(PATH);
  const life = firstShowcase(LIFE_SET_KEYS, LIFE_SET_CAPTION);
  const timeline = stages();
  const printed = getTier("GDE-ANY-SET-PRINT");
  const anchorLine = printed ? `The printed set — 12 cards, an 18 × 24 poster and the certificate — for ${formatUsd(sitePrice(printed, now))}.` : null;
  const ultimate = Boolean(getTier("GDE-ANY-SET-ULT")?.enabled);

  return (
    <>
      {/* 01 · Hero + the ladder */}
      <section aria-labelledby="s-01" className="pt-8 pb-16 md:pb-24 lg:pt-12 lg:pb-32">
        <div className="container-gallery">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Complete Set", href: PATH }]} />
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                id="s-01"
                // The H1 is a four-item list (COPY §2.4 (1)), so it cannot hold DESIGN's 16 ch measure.
                // It used to be knocked all the way down to `text-h2` — the same size as every H2 on the
                // page, which left /complete-set with no visual H1 at all (layout audit, 2026-09-08). It
                // sets between the two instead, on a measure wide enough for three lines at 1440 and
                // four at 390.
                className="[&>h1]:max-w-[24ch] [&>h1]:text-[clamp(2.25rem,1.35rem+2.6vw,3.25rem)]"
                title={H1}
                subhead={SUBHEAD}
                pills={
                  <ClaimLabels
                    claims={[{ text: "EVERYTHING COUNTED", tone: "accent" }, { text: "REGISTERED EDITION" }, { text: "SHIPS IN STAGES" }]}
                  />
                }
              />
              {anchorLine ? <p className="mt-8 max-w-[52ch] font-body text-body font-bold text-ink">{anchorLine}</p> : null}
              {/* One claim system, the way /trading-cards was trimmed (handoff #21): price line,
                  delivery chips, button. C11 and C12 used to stack two more grey claims between the
                  chips and the CTA; C12 is the whole of section 03 below and C11 is on every tier card. */}
              <HeroCtaBlock cta={cta} notes={[]} className="mt-8" />
            </div>
            {/* Nothing here is preloaded: the mobile LCP is the headline (owner review, 2026-09-07). */}
            {/* Poster, front, back — floated on the page's own stock at a few degrees with the card
                shadow (owner review, 2026-09-07). They used to sit on a dark 16 : 10 mat inside a grey
                plate: two grounds behind three objects that are already dark. */}
            <div className="mt-12 lg:col-span-6 lg:mt-0">
              <HeroPlate>
                {/* Capped (layout audit, 2026-09-08): the object column is the full page under `lg`, so
                    the cluster drew larger on a tablet than on a desktop and section 01 ran 2 593 px.
                    The cap is the width the column has at 1440. */}
                <div className="mx-auto flex w-full max-w-[640px] items-center justify-center gap-[4%]">
                  <div className="relative aspect-[3/4] w-[40%] rotate-[-4deg] overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
                    <Image src={poster.src} alt={poster.alt} fill sizes="(min-width: 1024px) 210px, 40vw" className="object-contain" />
                  </div>
                  <div className="w-[24%] rotate-[-1deg]">
                    <CardFace {...front} labelled sizes="(min-width: 1024px) 125px, 24vw" />
                  </div>
                  <div className="w-[24%] rotate-[4deg]">
                    <CardFace {...back} labelled sizes="(min-width: 1024px) 125px, 24vw" />
                  </div>
                </div>
                <FictionalLabel className="mt-8 text-center" />
              </HeroPlate>
            </div>
          </div>

          {/* No sport picker here: the Complete Set is ONE Etsy listing for every sport, so choosing
              a sport would change nothing. The buyer picks the sport at checkout. */}
          <div className="mt-12 lg:mt-16">
            <TierRow family="set" context="set" sport={sport} now={now} />
          </div>
        </div>
      </section>

      {/* 02 · Everything you get */}
      <SpecSheetSection family="set" />

      {/* 03 · Everything counted, delivered in stages */}
      <Section index={3} title={STAGES_TITLE} container="gallery">
        {/* The timeline owns the full width, so its rule runs the width of the section instead of
            ending under two stops; the count the heading promises is the five-folder Ledger under
            it (DESIGN §5.2-3) — a section that says "everything counted" has to show the count. */}
        <ol className="border-t border-hairline lg:flex lg:border-t-0">
          {timeline.map((stage, i) => (
            <li key={stage.name} className="flex gap-3 border-b border-hairline py-4 lg:flex-1 lg:flex-col lg:border-b-0 lg:border-t lg:pt-4">
              <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-ink lg:mt-0" />
              <span>
                <span className="block font-label text-label font-semibold uppercase tracking-[0.12em] text-ink">
                  {String(i + 1).padStart(2, "0")} · {stage.name}
                </span>
                <span className="mt-1 block font-body text-small text-muted-text">{stage.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-[62ch] font-body text-body text-pretty text-ink">{CANON.deliveryClocks}</p>
        {ultimate ? <p className="mt-4 max-w-[62ch] font-body text-small text-muted-text">{ULTIMATE_LINE}</p> : null}

        {/* Two columns that end together (owner review, 2026-09-07). The ledger used to stop 693 px
            above the bottom of the column beside it, because that column carried the photograph AND
            the edition panel — a 500 px dark block stacked under a 350 px picture. The panel moved out
            to its own row under both, and the photograph took the taller 4 : 5 crop, so the row is now
            a table beside a picture and the two finish within about a line of each other. */}
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10">
          <div className="lg:col-span-7">
            <Ledger rows={setFolderRows()} size="lg" />
          </div>
          <div className="mt-10 lg:col-span-5 lg:mt-0">
            {life ? (
              /* The asset's own ratio. `aspect-[3/2]` on a square photograph threw away 33 % of its
                 height — 128 px off the top and 128 off the bottom at 834, clipping the poster at both
                 ends and cutting the shipping tube in half, on the page whose H2 is "EVERYTHING YOU
                 GET." (layout audit, 2026-09-08). */
              <ShowcaseFigure item={life} aspect="natural" sizes="(min-width: 1024px) 510px, 92vw" labelled />
            ) : (
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
                <Image src={poster.src} alt={poster.alt} fill sizes="(min-width: 1024px) 340px, 70vw" className="object-contain" />
              </div>
            )}
            <FictionalLabel className="mt-3" />
          </div>
        </div>
        {card ? <EditionPanel card={card} tone="stock" demoLabel={DEMO_LABEL} className="mt-14 lg:max-w-[42rem]" /> : null}
      </Section>

      {/* 04 · One athlete, six finishes */}
      <FinishesSection variant="card" />

      {/* 05 · Sports without numbers */}
      <NumberlessSection variant="card" />

      {/* 06 · "Still deciding?" lives inside the closing CTA block · 07 · Blocks + FAQ + CTA */}
      <ClosingSection faq="complete-set" cta={cta} />

      <JsonLd
        data={productFamily({
          family: "set",
          path: PATH,
          name: meta.title,
          description: meta.description,
          images: [poster.src, front.src, back.src],
          tiers: tiersFor("set", true),
          now,
        })}
      />
    </>
  );
}
