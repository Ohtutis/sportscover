import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { DeliveryChips } from "../../../components/DeliveryChips";
import { FaqList, type FaqListItem } from "../../../components/FaqList";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { assetOrNull } from "../../../lib/assets";
import { christmasDates, formatEt, toEtDate, US_TRANSIT_BUSINESS_DAYS, type IsoDate } from "../../../lib/capacity";
import { LEAD_TIMES } from "../../../lib/catalog/delivery";
import { FAMILY_LABELS } from "../../../lib/catalog/prices";
import { isChristmasWindow, occasionById } from "../../../lib/catalog/seasons";
import { sports } from "../../../lib/catalog/sports";
import { tierNotes } from "../../../lib/catalog/tiers";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor, freeProofHref, freeProofMode } from "../../../lib/cta";
import { PRODUCTS, productFromLabel, setFromLabel, type Product } from "../../../lib/intake/products";
import { pageMeta } from "../../../lib/seo/meta";
import { hubLine, sportPagePath, sportPageSports } from "../../../lib/seo/sport-facts";
import { ClaimLabels } from "../(families)/_shared/hero";

/**
 * `/christmas-gift` (spec §4.4, SEO plan 2026-10-06): the answer first. The parent's question is "will
 * it be under the tree?", so the order-by table sits under the H1, and every date in it is computed by
 * `christmasDates(now)` (lib/capacity.ts) — never typed. The URL carries no year: the page rolls to the
 * next Christmas by itself after Dec 24.
 *
 * The holiday version runs from the Christmas window's start (lib/catalog/seasons.ts) to Dec 24 of the
 * year its dates are for. Outside it — before the window, and from Dec 25 while the window is still
 * open — the table shows the coming Christmas and one line says when the holiday version returns.
 */
export const revalidate = 3600;

const PATH = "/christmas-gift";

export const metadata: Metadata = pageMeta(PATH);

export const CHRISTMAS_H1 = "CHRISTMAS GIFTS FOR ATHLETES.";

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
] as const;

/** A catalog count as a word: the headings count, they never type the figure. */
const numberWord = (n: number): string => NUMBER_WORDS[n] ?? String(n);
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);
/** "a, b and c" */
const joinAnd = (items: string[]): string =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/* ---------- the plan: what today means for Christmas ---------- */

/** on-time: both rows still hold · printed-late: past the printed date · all-late: past the digital date too. */
export type ChristmasState = "on-time" | "printed-late" | "all-late";

export interface ChristmasPlan {
  /** The Christmas the dates are for. */
  year: number;
  printedBy: IsoDate;
  digitalBy: IsoDate;
  /** Today in US Eastern. */
  today: IsoDate;
  /** The holiday version: inside the Christmas window, in the months before the Christmas the dates are for. */
  season: boolean;
  state: ChristmasState;
  /** The day the holiday version next begins (the window's start), for the off-season line; null without a window. */
  nextSeason: IsoDate | null;
}

/** The Christmas window from lib/catalog/seasons.ts (Oct 20 → Jan 5 today) — read, never retyped. */
const WINDOW = occasionById("christmas")?.window;
const pad2 = (n: number): string => String(n).padStart(2, "0");

export function christmasPlan(now: Date): ChristmasPlan {
  const { year, printedBy, digitalBy } = christmasDates(now);
  const today = toEtDate(now);
  const state: ChristmasState = today > digitalBy ? "all-late" : today > printedBy ? "printed-late" : "on-time";
  // Jan 1–5 is inside the window but a whole year before the Christmas the dates now point at, and
  // Dec 25–31 already points at next year's: neither is the run-up, so both read the off-season line.
  const runUp = today.slice(0, 4) === String(year) && (!WINDOW || today.slice(5, 7) >= pad2(WINDOW.start.m));
  const season = isChristmasWindow(now) && runUp;
  let nextSeason: IsoDate | null = null;
  if (WINDOW) {
    const thisYear = Number(today.slice(0, 4));
    const startOf = (y: number): IsoDate => `${y}-${pad2(WINDOW.start.m)}-${pad2(WINDOW.start.d)}`;
    nextSeason = today < startOf(thisYear) ? startOf(thisYear) : startOf(thisYear + 1);
  }
  return { year, printedBy, digitalBy, today, season, state, nextSeason };
}

/** The table's two rows: what the computed dates say, in US date form. */
export function orderByRows(plan: ChristmasPlan): { key: "printed" | "digital"; label: string; date: IsoDate; text: string }[] {
  return [
    { key: "printed", label: "Printed card, poster or set under the tree", date: plan.printedBy, text: formatEt(plan.printedBy, "long") },
    { key: "digital", label: "Digital files by Christmas Eve", date: plan.digitalBy, text: formatEt(plan.digitalBy, "long") },
  ];
}

export const PRINTED_LATE_LINE =
  "Printed orders placed now can no longer be promised for Christmas Eve. Gift the digital files first; the printed piece follows.";
export const ALL_LATE_LINE =
  "Orders placed now can no longer be promised for Christmas Eve, digital files included. Wrap a note for the tree; the files arrive first and the printed piece follows.";

/** The one line under the table that today calls for, or null in the run-up while both dates hold. */
export function stateLine(plan: ChristmasPlan): string | null {
  if (!plan.season) {
    const opens = plan.nextSeason ? ` This page switches to its holiday version on ${formatEt(plan.nextSeason, "long")}.` : "";
    return `Planning ahead? These dates are for Christmas ${plan.year}.${opens}`;
  }
  if (plan.state === "printed-late") return PRINTED_LATE_LINE;
  if (plan.state === "all-late") return ALL_LATE_LINE;
  return null;
}

/** A printed banner's own shipping line (lib/catalog/tiers.ts): banners are not on the card/poster clock the table counts. */
const BANNER_SHIP_LINE = Object.entries(tierNotes)
  .filter(([sku]) => /^GDE-ANY-BAN-/.test(sku))
  .flatMap(([, lines]) => lines)
  .find((line) => /^ships\b/i.test(line));

/* ---------- copy built from the catalog ---------- */

export function christmasVerdict(season: boolean, proofFirst: boolean): string {
  const lead = season ? "Under the tree this year: a trading card or a poster built from their own photos" : "A trading card or a poster built from their own photos";
  return proofFirst ? `${lead}, with a free proof before you pay.` : `${lead}. You approve a proof before anything prints.`;
}

/** The three questions; the first one's answer is built from the computed dates, so it stays true all year. */
export function christmasQuestions(plan: ChristmasPlan): FaqListItem[] {
  const own = sportPageSports().map((s) => s.name.toLowerCase());
  return [
    {
      id: "q-christmas-arrive",
      q: "Will it arrive before Christmas?",
      a: `Yes, when it is ordered in time. For Christmas ${plan.year}, order a printed card, poster or set by ${formatEt(plan.printedBy, "long")}, and digital files by ${formatEt(plan.digitalBy, "long")}. Both dates count US Eastern business days.`,
    },
    {
      id: "q-christmas-late",
      q: "What if I'm late?",
      a: `Order the digital files and wrap a note for the tree. ${CANON.stagedDelivery}`,
    },
    {
      id: "q-christmas-sports",
      q: "Which sports?",
      a: `All ${numberWord(sports.length)}. ${capitalize(joinAnd(own))} have their own pages here; every other sport is built to order the same way.`,
    },
  ];
}

/** The tile image for a product (`product.<key>` in lib/assets.ts), or null when the map has none. */
const productImage = (p: Product) => assetOrNull(`product.${p.key}`);

/* ---------- layout ---------- */

const SECTION = "py-14 md:py-20 lg:py-24";
/* The closing band follows the questions directly: the band above already spent its bottom air. */
const CLOSING = "pb-14 md:pb-20 lg:pb-24";
const INDEX_ROW = "flex items-center justify-between gap-4 border-t border-hairline pt-3";
const INDEX_TEXT = "font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-muted-text";
const TEXT_LINK =
  "inline-flex min-h-11 items-center font-body text-[0.9375rem] font-medium text-ink underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:decoration-2";
const PROSE_LINK = "text-ink underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:decoration-2";
const SMALL_NOTE = "max-w-[62ch] font-body text-small text-pretty text-muted-text";
const HEADING_LINK = "inline-flex min-h-11 items-center decoration-2 underline-offset-4 hover:underline";

export function ChristmasGiftBody({ now }: { now: Date }) {
  const plan = christmasPlan(now);
  const proofFirst = freeProofMode();
  const cta = ctaFor("set");
  const line = stateLine(plan);
  const exhibit = assetOrNull("life.set.printed");
  const ownPages = sportPageSports();
  const [digitalMin, digitalMax] = LEAD_TIMES.digitalBusinessDays;

  return (
    <>
      {/* 01 · Hero: the H1, the verdict and the order-by table */}
      <section aria-labelledby="christmas-hero" className="pt-8 pb-16 md:pb-24 lg:pb-32">
        <div className="container-gallery">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Christmas gift", href: PATH },
            ]}
          />
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                id="christmas-hero"
                title={CHRISTMAS_H1}
                subhead={christmasVerdict(plan.season, proofFirst)}
                pills={
                  <ClaimLabels
                    claims={[
                      { text: "FROM YOUR PHOTOS", tone: "accent" },
                      ...(proofFirst ? [{ text: "FREE PROOF FIRST" }] : []),
                      { text: "DIGITAL OR PRINTED" },
                    ]}
                  />
                }
              />
              {/* A definition list, not a table: on a phone each label sits above its date instead of being
                  squeezed into a 90 px column beside a nowrap date. */}
              <div className="mt-8 max-w-[36rem] rounded-ui border border-hairline px-5 py-4" data-order-by="">
                <p className="pb-2 font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">For Christmas {plan.year}</p>
                <dl>
                  {orderByRows(plan).map((row) => (
                    <div
                      key={row.key}
                      className="flex flex-col gap-1 border-t border-hairline py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    >
                      <dt className="font-body text-[0.9375rem] font-medium text-ink">{row.label}</dt>
                      <dd className="font-body text-[0.9375rem] font-bold text-ink sm:text-right sm:whitespace-nowrap">
                        Order by <time dateTime={row.date}>{row.text}</time>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              {line ? (
                <p className="mt-4 max-w-[52ch] font-body text-body font-bold text-pretty text-ink" data-christmas-state={plan.season ? plan.state : "off-season"}>
                  {line}
                </p>
              ) : null}
              <p className={`mt-4 ${SMALL_NOTE}`}>
                Counted in US Eastern business days, with {US_TRANSIT_BUSINESS_DAYS} business days for delivery inside the US. The dates are
                for cards, posters and sets{BANNER_SHIP_LINE ? `; a printed banner ${lowerFirst(BANNER_SHIP_LINE)}` : ""}.
              </p>
              <p data-shared="" className={`mt-3 ${SMALL_NOTE}`}>
                {CANON.deliveryClocks}
              </p>
              <div data-shared="" className="mt-8">
                <CtaPair {...cta} size="lg" />
                <TrustLine className="mt-4" />
              </div>
            </div>
            {exhibit ? (
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
            ) : null}
          </div>
        </div>
      </section>

      {/* 02 · The four gifts */}
      <section aria-labelledby="christmas-gifts" className={SECTION}>
        <div className="container-gallery">
          <SectionHeading
            as="h2"
            id="christmas-gifts"
            index="02 / 06"
            title={`${numberWord(PRODUCTS.length).toUpperCase()} GIFTS, ONE SET OF PHOTOS.`}
            subhead="Send the photos once and ask for one gift or all of them."
          />
          <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {PRODUCTS.map((product) => {
              const image = productImage(product);
              return (
                <li key={product.key} className="flex flex-col">
                  {image ? (
                    <figure>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw"
                        className="h-auto w-full rounded-ui"
                      />
                      {image.fictional ? (
                        <figcaption className="mt-3">
                          <FictionalLabel />
                        </figcaption>
                      ) : null}
                    </figure>
                  ) : null}
                  <h3 className="mt-5 font-display text-h3 uppercase">{product.name}.</h3>
                  {/* The product's catalog blurb and price line (lib/intake/products.ts): the same words wherever
                      the four products are listed, so they are marked shared, not counted as this page's prose. */}
                  <p data-shared="" className="mt-2 font-body text-body text-pretty">
                    {product.blurb}
                  </p>
                  <p data-shared="" className="mt-3 font-body text-body font-bold text-ink">
                    {capitalize(productFromLabel(product))}
                  </p>
                  <Link href={freeProofHref({ products: [product.key] })} className={`mt-auto pt-2 ${TEXT_LINK}`}>
                    {proofFirst ? "Start a free proof" : "Start here"}
                    <span className="sr-only"> for the {product.name.toLowerCase()}</span>
                    <span aria-hidden="true">&nbsp;→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-10 max-w-[62ch] font-body text-body text-pretty">
            Cards and a poster together are priced as a{" "}
            <Link href="/complete-set" className={PROSE_LINK}>
              {FAMILY_LABELS.set}
            </Link>
            , {setFromLabel()}.
          </p>
        </div>
      </section>

      {/* 03 · By sport */}
      <section aria-labelledby="christmas-sports" className={SECTION}>
        <div className="container-gallery">
          <SectionHeading
            as="h2"
            id="christmas-sports"
            index="03 / 06"
            title="BY SPORT."
            subhead={`${capitalize(numberWord(ownPages.length))} sports have a page of their own. All ${numberWord(sports.length)} are built to order.`}
          />
          <ul className="mt-10 grid border-t border-hairline sm:grid-cols-2 sm:gap-x-10 lg:mt-12 lg:grid-cols-3">
            {ownPages.map((sport) => (
              <li key={sport.slug} className="border-b border-hairline py-4">
                <h3 className="font-display text-h3 uppercase">
                  <Link href={sportPagePath(sport.slug)} className={HEADING_LINK}>
                    {sport.name}
                    <span aria-hidden="true">&nbsp;→</span>
                  </Link>
                </h3>
                <p data-shared="" className="mt-1 font-body text-small text-muted-text">
                  {hubLine(sport)}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link href="/sports" className={TEXT_LINK}>
              Every other sport →
            </Link>
          </p>
        </div>
      </section>

      {/* 04 · Gift the digital first */}
      <section aria-labelledby="christmas-digital" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="christmas-digital" index="04 / 06" title="GIFT THE DIGITAL FIRST." />
          <ul className="mt-8 max-w-[62ch] list-disc space-y-3 pl-5 font-body text-body text-pretty marker:text-muted-text lg:mt-10">
            {proofFirst ? <li>The proof is free: you see the watermarked artwork before paying anything.</li> : null}
            <li>
              Digital files land {digitalMin}–{digitalMax} business days after you order, so they can still make the tree once the printed
              date has passed.
            </li>
            <li>
              Wrap a note with them. The order-by calculator on the{" "}
              <Link href="/senior-night" className={PROSE_LINK}>
                senior night page
              </Link>{" "}
              prints a gift note for a gift that lands after the night, and the same idea works under a tree.
            </li>
            <li data-shared="">{CANON.stagedDelivery}</li>
          </ul>
        </div>
      </section>

      {/* 05 · Questions */}
      <section aria-labelledby="christmas-faq" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="christmas-faq" index="05 / 06" title="CHRISTMAS QUESTIONS." />
          <FaqList items={christmasQuestions(plan)} jsonLd className="mt-8 lg:mt-10" />
        </div>
      </section>

      {/* 06 · Closing */}
      <section aria-label="Start a Christmas gift" className={CLOSING}>
        <div className="container-site">
          <div className={INDEX_ROW}>
            <span aria-hidden="true" className={INDEX_TEXT}>
              06 / 06
            </span>
          </div>
          <div data-shared="" className="mt-8">
            <CtaPair {...cta} size="lg" />
            <DeliveryChips kind="standard" className="mt-6" />
            <TrustLine className="mt-4" />
          </div>
        </div>
      </section>
    </>
  );
}

export default function ChristmasGiftPage() {
  return <ChristmasGiftBody now={new Date()} />;
}
