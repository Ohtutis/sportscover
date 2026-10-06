import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { EtsyButton } from "../../../components/EtsyButton";
import { FaqList, type FaqListItem } from "../../../components/FaqList";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { JsonLd } from "../../../components/JsonLd";
import { SectionHeading } from "../../../components/SectionHeading";
import { TierCard } from "../../../components/TierCard";
import { TrustLine } from "../../../components/TrustLine";
import { asset } from "../../../lib/assets";
import { chipSegment } from "../../../lib/catalog/delivery";
import { bannerTiers, type Tier } from "../../../lib/catalog/prices";
import { shippingRows } from "../../../lib/catalog/shipping";
import { sports, type Sport } from "../../../lib/catalog/sports";
import { styleByCode } from "../../../lib/catalog/styles";
import { boxContents, deliverables, tierNotes } from "../../../lib/catalog/tiers";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor, freeProofHref, freeProofMode } from "../../../lib/cta";
import { productFamily } from "../../../lib/seo/jsonld";
import { pageMeta } from "../../../lib/seo/meta";
import { seniorNightFactsFor, seniorNightPath, seniorNightSports } from "../../../lib/seo/senior-night-facts";
import { pageFor } from "../../../lib/seo/titles";
import { ClaimLabels } from "../(families)/_shared/hero";

/**
 * `/banners` — the banner family (SEO plan 2026-10-06). One page owns every "<sport> banner" search:
 * per-sport banner pages would be eleven thin copies of one product. Answer first: the head phrase in
 * the H1, the ladder straight after the hero, then the sports, where it hangs and the questions.
 *
 * Every number on the page comes from the catalog: the sizes from the banner ladder's tier keys, the
 * prices from `TierCard` (`priceDisplay`), the sport counts from `lib/catalog/sports.ts`, the shipping
 * line from `tierNotes`. The page's own words name no lab, no material beyond "printed vinyl" and no
 * hardware: the banner lab is not final (docs/SUPPLIERS.md), so the page says what every option already
 * says. (The exhibit's alt is the asset map's description of its photograph, rendered as written.)
 */
export const revalidate = 3600;

const PATH = "/banners";

export const metadata: Metadata = pageMeta(PATH);

export const BANNERS_H1 = "CUSTOM SPORTS BANNERS FROM YOUR PHOTOS.";

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
] as const;

/** A catalog count as a word ("eleven"): the headings count, they never type the figure. */
const numberWord = (n: number): string => NUMBER_WORDS[n] ?? String(n);
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);
/** "a, b and c" */
const joinAnd = (items: string[]): string =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/* ---------- the ladder, read from lib/catalog ---------- */

/** The banner ladder in render order: the digital tier first, then the printed sizes in ladder order. */
export const BANNER_LADDER: Tier[] = [
  ...bannerTiers.filter((t) => t.enabled && !t.physical),
  ...bannerTiers.filter((t) => t.enabled && t.physical),
];

const PRINTED: Tier[] = BANNER_LADDER.filter((t) => t.physical);

/** "1X2" → "1 × 2 ft": the size a printed tier's key carries (its Etsy variant name says the same). */
export const bannerSize = (t: Tier): string => `${t.tierKey.split("X").join(" × ")} ft`;

/** The printed sizes, smallest first: ["1 × 2 ft", "2 × 4 ft", "3 × 6 ft"]. */
export const BANNER_SIZES: string[] = PRINTED.map(bannerSize);

/** A printed banner's own shipping line ("Ships separately, 1–2 weeks") — the listing's promise, not the card/poster chip. */
export const shipLineOf = (sku: string): string | undefined => tierNotes[sku]?.find((line) => /^ships\b/i.test(line));

/** The ladder's shipping line, read from the printed tiers (each carries the same one). */
export const BANNER_SHIP_LINE: string = PRINTED.map((t) => shipLineOf(t.sku)).find((line): line is string => Boolean(line)) ?? "";

/** The digital row of the shipping table: a file is delivered, not shipped. */
const DIGITAL_SHIPS_FROM = shippingRows.find((row) => row.key === "digital")?.shipsFrom ?? "";

/** The banner file line of `deliverables.banner` ("Print-ready digital file at full banner size"). */
const FILE_LINE = deliverables.banner.find((line) => /file/i.test(line)) ?? deliverables.banner[0];

export interface BannerTierParts {
  box: string[];
  shipsFrom: string;
  chip: string;
}

/**
 * What a banner TierCard says. `boxContents()` reads the card / poster / set ladder only, so a banner
 * tier falls through to its own catalog lines: the digital tier lists `deliverables.banner`; a printed
 * tier lists its product line, and its shipping line moves to the "Ships from" cell and the chip rather
 * than being printed three times on one card. `shipsFromFor()` is not used: its pattern covers
 * CARD / POST / SET / SNSET only, so a banner SKU falls through to the digital sentence — on a printed
 * banner too, and with a resolution ("300 dpi") that no banner fact states.
 */
export function bannerTierParts(tier: Tier): BannerTierParts {
  const fromCatalog = boxContents(tier.sku);
  if (!tier.physical) {
    return { box: fromCatalog.length ? fromCatalog : [...deliverables.banner], shipsFrom: DIGITAL_SHIPS_FROM, chip: chipSegment("digital") };
  }
  const ship = shipLineOf(tier.sku) ?? BANNER_SHIP_LINE;
  const notes = fromCatalog.length ? fromCatalog : (tierNotes[tier.sku] ?? []);
  return { box: notes.filter((line) => line !== ship), shipsFrom: ship, chip: ship };
}

/* ---------- the sports ---------- */

/** Every sport with its own banner listing, in roster order. */
export const BANNER_SPORTS: Sport[] = sports.filter((s) => Boolean(s.bannerListingId));

/** Senior Night banners: a sport with an SN banner listing AND a senior night page to send the reader to. */
export const SN_BANNER_SPORTS: Sport[] = seniorNightSports().filter((s) => Boolean(s.seniorNightBannerListingId));

export const bannerSku = (s: Sport): string => `GDE-${s.code}-BAN`;

/** "an ice hockey banner", "a football banner". */
const withArticle = (word: string): string => `${/^[aeiou]/i.test(word) ? "an" : "a"} ${word}`;

/** The spoke's measured head phrase as its link text ("Senior night volleyball", "Cheer senior night"). */
const spokeLabel = (s: Sport): string => capitalize(seniorNightFactsFor(s.slug)?.head.phrase ?? `${s.name.toLowerCase()} senior night`);

/* ---------- copy built from the facts above ---------- */

/** The verdict under the H1: "sports banner" in the first sentence (the measured head phrase), true today. */
export function bannersVerdict(proofFirst: boolean): string {
  const lead = `A sports banner built from your athlete's own photos: printed vinyl in ${numberWord(PRINTED.length)} sizes, or the full-size file to print anywhere.`;
  return proofFirst ? `${lead} A free watermarked proof comes first.` : `${lead} You approve a proof before anything prints.`;
}

/** The three questions, answered only from the ladder, its shipping line, the staged-delivery canon and the photos. */
export function bannerQuestions(): FaqListItem[] {
  return [
    {
      id: "q-banners-sizes",
      q: "Which sizes can I order?",
      a: `Printed vinyl in ${numberWord(PRINTED.length)} sizes: ${joinAnd(BANNER_SIZES)}, each with the digital file included. Or order the file alone: a ${lowerFirst(FILE_LINE)}.`,
    },
    {
      id: "q-banners-shipping",
      q: "Does the banner ship with the rest of the order?",
      a: `No. A printed banner ${lowerFirst(BANNER_SHIP_LINE)}. ${CANON.stagedDelivery}`,
    },
    {
      id: "q-banners-photos",
      q: "Do I need different photos for the banner?",
      a: "No. The banner is built from the same photos as the card and the poster, so one set of photos covers all three. Ask for them in the same request.",
    },
  ];
}

/* ---------- layout ---------- */

/* The band rhythm of /senior-night and the family pages: 96 px a side at most, the space spent inside. */
const SECTION = "py-14 md:py-20 lg:py-24";
/* The closing band follows the questions directly: the band above already spent its bottom air. */
const CLOSING = "pb-14 md:pb-20 lg:pb-24";
const INDEX_ROW = "flex items-center justify-between gap-4 border-t border-hairline pt-3";
const INDEX_TEXT = "font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-muted-text";
const TEXT_LINK =
  "inline-flex min-h-11 items-center font-body text-[0.9375rem] font-medium text-ink underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:decoration-2";
const PROSE_LINK = "text-ink underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:decoration-2";

export function BannersBody({ now }: { now: Date }) {
  const proofFirst = freeProofMode();
  const cta = ctaFor("banners");
  const exhibit = asset("product.banner");
  const seniorStyle = styleByCode("SR")?.name ?? "Senior Night";
  const sizesClaim = `${PRINTED.map((t) => t.tierKey.split("X").join(" × ")).join(" · ")} FT VINYL`;
  // Four across only from `xl`: a printed banner's chip is its own shipping line ("SHIPS SEPARATELY, 1–2
  // WEEKS"), ~190 px of nowrap label that overflows a 1024 px four-up card. Two across until there is room.
  const columns = BANNER_LADDER.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3";

  return (
    <>
      {/* 01 · Hero */}
      <section aria-labelledby="banners-hero" className="pt-8 pb-16 md:pb-24 lg:pb-32">
        <div className="container-gallery">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Banners", href: PATH },
            ]}
          />
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                id="banners-hero"
                title={BANNERS_H1}
                subhead={bannersVerdict(proofFirst)}
                pills={
                  <ClaimLabels
                    claims={[
                      { text: "FROM YOUR PHOTOS", tone: "accent" },
                      { text: sizesClaim },
                      ...(proofFirst ? [{ text: "FREE PROOF FIRST" }] : []),
                    ]}
                  />
                }
              />
              <div data-shared="" className="mt-8">
                <CtaPair {...cta} size="lg" />
                <TrustLine className="mt-4" />
              </div>
            </div>
            {/* Nothing is preloaded: on a phone the LCP is the headline. width/height reserve the box. */}
            <figure className="mt-12 flex flex-col justify-center lg:col-span-6 lg:mt-0">
              <Image
                src={exhibit.src}
                alt={exhibit.alt}
                width={exhibit.width}
                height={exhibit.height}
                sizes="(min-width: 1024px) 560px, 92vw"
                className="mx-auto h-auto w-full max-w-[560px] rounded-ui shadow-[var(--shadow-card-stock)]"
              />
              {exhibit.fictional ? (
                <figcaption className="mx-auto mt-4 w-full max-w-[560px]">
                  <FictionalLabel />
                </figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      </section>

      {/* 02 · The ladder */}
      <section aria-labelledby="banners-sizes" className={SECTION}>
        <div className="container-gallery">
          <SectionHeading
            as="h2"
            id="banners-sizes"
            index="02 / 06"
            title={`${numberWord(PRINTED.length).toUpperCase()} SIZES, ONE FILE.`}
            subhead="Every printed size comes with the digital file, and the file is sold on its own too."
          />
          {/* A snap scroller under `md`, a grid above it — the TierRow recipe of the family pages. */}
          <ul
            className={`mt-10 -mx-5 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-pl-5 px-5 pb-2 md:mx-0 md:grid md:overflow-visible md:px-0 lg:mt-12 ${columns}`}
          >
            {BANNER_LADDER.map((tier) => {
              const parts = bannerTierParts(tier);
              // The tier's own option on the free-proof form; the outline "Also on Etsy →" opens the shop
              // front, because no any-sport banner listing exists (lib/catalog/listings.ts).
              const pair = ctaFor("banners", { sku: tier.sku });
              const tierCta = pair.secondary?.kind === "etsy" ? pair : { primary: pair.primary, tone: pair.tone };
              return (
                <li key={tier.sku} className="flex w-[82vw] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none">
                  <TierCard tier={tier} now={now} box={parts.box} shipsFrom={parts.shipsFrom} chip={parts.chip} cta={tierCta} className="w-full" />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 03 · The sports with a banner listing, and the senior night banners */}
      <section aria-labelledby="banners-sports" className={SECTION}>
        <div className="container-gallery">
          <SectionHeading
            as="h2"
            id="banners-sports"
            index="03 / 06"
            title={`${numberWord(BANNER_SPORTS.length).toUpperCase()} SPORTS.`}
            subhead="Each has its own banner listing on Etsy, and every one starts from your athlete's photos."
          />
          <ul className="mt-10 grid border-t border-hairline sm:grid-cols-2 sm:gap-x-10 lg:mt-12 lg:grid-cols-3">
            {BANNER_SPORTS.map((sport) => (
              <li key={sport.slug} className="flex flex-col gap-2 border-b border-hairline py-5">
                <h3 className="font-display text-h3 uppercase">{sport.name}.</h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link href={freeProofHref({ products: ["banner"], sport: sport.slug })} className={TEXT_LINK}>
                    Free proof
                    <span className="sr-only"> of {withArticle(sport.name.toLowerCase())} banner</span>
                    <span aria-hidden="true">&nbsp;→</span>
                  </Link>
                  <EtsyButton sku={bannerSku(sport)} label={`${sport.name} banner on Etsy →`} />
                </div>
              </li>
            ))}
            {/* Any other sport is built to order too: the twelfth cell says so, and the grid has no hole in it. */}
            {proofFirst ? (
              <li className="flex flex-col gap-2 border-b border-hairline py-5">
                <h3 className="font-display text-h3 uppercase">Another sport.</h3>
                <Link href={freeProofHref({ products: ["banner"] })} className={TEXT_LINK}>
                  Start a banner proof
                  <span aria-hidden="true">&nbsp;→</span>
                </Link>
              </li>
            ) : null}
          </ul>

          <div className="mt-14">
            <h3 className="font-display text-h3 uppercase">Senior night banners.</h3>
            <p className="mt-3 max-w-[62ch] font-body text-body text-pretty">
              {capitalize(numberWord(SN_BANNER_SPORTS.length))} sports also have a senior night banner, in the gold {seniorStyle} style.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-8">
              {SN_BANNER_SPORTS.map((sport) => (
                <li key={sport.slug}>
                  <Link href={seniorNightPath(sport.slug)} className={TEXT_LINK}>
                    {spokeLabel(sport)}
                  </Link>
                </li>
              ))}
            </ul>
            {proofFirst ? (
              <p className="mt-4">
                <Link href={freeProofHref({ products: ["banner"], style: "SR" })} className={TEXT_LINK}>
                  Free proof of a senior night banner →
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* 04 · Where it hangs */}
      <section aria-labelledby="banners-where" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="banners-where" index="04 / 06" title="WHERE IT HANGS." />
          <div className="mt-8 max-w-[62ch] space-y-4 font-body text-body text-pretty lg:mt-10">
            <p>Made for three places: the field fence on game day, the gym wall all season, and the front of the table on senior night.</p>
            <p>One set of photos makes all three: the banner, the card and the poster show the same athlete, built from the same pictures.</p>
            <p>
              Not sure which photos to send? The{" "}
              <Link href="/photo-guide" className={PROSE_LINK}>
                photo guide
              </Link>{" "}
              lists what the photo check looks for before any art is made.
            </p>
          </div>
        </div>
      </section>

      {/* 05 · Questions */}
      <section aria-labelledby="banners-faq" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="banners-faq" index="05 / 06" title="BANNER QUESTIONS." />
          <FaqList items={bannerQuestions()} jsonLd className="mt-8 lg:mt-10" />
        </div>
      </section>

      {/* 06 · Closing */}
      <section aria-label="Start your banner" className={CLOSING}>
        <div className="container-site">
          <div className={INDEX_ROW}>
            <span aria-hidden="true" className={INDEX_TEXT}>
              06 / 06
            </span>
          </div>
          <div data-shared="" className="mt-8">
            <CtaPair {...cta} size="lg" />
            <TrustLine className="mt-4" />
          </div>
        </div>
      </section>

      <JsonLd
        data={productFamily({
          family: "banner",
          path: PATH,
          name: "Custom sports banner",
          description: pageFor(PATH).description,
          images: [asset("product.banner").src],
          tiers: bannerTiers,
          now,
        })}
      />
    </>
  );
}

export default function BannersPage() {
  return <BannersBody now={new Date()} />;
}
