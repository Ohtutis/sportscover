// /senior-night/[sport] — one spoke per sport the hub names (SEO plan 2026-10-06; spec §4.3: "the same
// spine with the sport's SR art, the measured word order in the H1, the sport's FAQ"). Every sentence a
// spoke says about its sport is read from its row in lib/seo/senior-night-facts.ts; everything else on
// the page is identical across the nine spokes BY DESIGN and is marked `data-shared` (the trust line, the
// CTA block, the delivery chips, the calculator, the shared FAQ, the banner line, the gift note), so the
// duplication gate (tests/seo-families.test.ts) reads only the row. Static: every slug is known at build
// time (`dynamicParams = false` → anything else is a 404). The share image is ./opengraph-image.tsx.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { BracketFrame } from "../../../../components/BracketFrame";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { CardFace } from "../../../../components/CardFace";
import { CtaPair } from "../../../../components/CtaPair";
import { DeliveryChips } from "../../../../components/DeliveryChips";
import { EtsyButton } from "../../../../components/EtsyButton";
import { FaqList } from "../../../../components/FaqList";
import { FictionalLabel } from "../../../../components/FictionalLabel";
import { OrderByCalculator } from "../../../../components/OrderByCalculator";
import { Pill } from "../../../../components/Pill";
import { SectionHeading } from "../../../../components/SectionHeading";
import { TrustLine } from "../../../../components/TrustLine";
import { Shield } from "../../../../components/brand/Shield";
import { asset, assetOrNull, SITE_ASSETS } from "../../../../lib/assets";
import { postBySlug, postPath } from "../../../../lib/blog";
import { toEtDate } from "../../../../lib/capacity";
import { faqSubset } from "../../../../lib/catalog/faq";
import { bannerTiers } from "../../../../lib/catalog/prices";
import { backLine, sportByCode, sportBySlug, type Sport } from "../../../../lib/catalog/sports";
import { tierNotes } from "../../../../lib/catalog/tiers";
import { CANON } from "../../../../lib/copy/canon";
import { ctaFor, type CtaPairProps } from "../../../../lib/cta";
import { productByKey } from "../../../../lib/intake/products";
import { cards, getCard, isIndexable, styleCode, type CardRecord } from "../../../../lib/registry/cards";
import {
  SENIOR_NIGHT_SPORT_ORDER,
  seasonWord,
  seniorNightFactsFor,
  seniorNightPath,
  seniorNightSports,
  type SeniorNightFacts,
} from "../../../../lib/seo/senior-night-facts";
import { sportFactsFor, sportPagePath, sportPageSports } from "../../../../lib/seo/sport-facts";
import { pageFor, TITLE_SUFFIX } from "../../../../lib/seo/titles";
import { GiftNote } from "../_gift-note";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return seniorNightSports().map((sport) => ({ sport: sport.slug }));
}

type Params = { params: Promise<{ sport: string }> };

/** The row and the catalog sport, or null when the slug is not a spoke. */
function spokeFor(slug: string): { sport: Sport; facts: SeniorNightFacts } | null {
  const sport = sportBySlug(slug);
  const facts = seniorNightFactsFor(slug);
  return sport && facts ? { sport, facts } : null;
}

/** The shape of lib/seo/meta.ts `pageMeta()`, read from the row: the title is the head phrase, the root template adds the brand. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { sport: slug } = await params;
  const spoke = spokeFor(slug);
  if (!spoke) return {};
  const { facts } = spoke;
  const path = seniorNightPath(slug);
  return {
    title: facts.titleHead,
    description: facts.description,
    alternates: { canonical: path },
    // No `images`: the route's opengraph-image.tsx is the share card (file-based metadata wins).
    openGraph: { url: path, title: `${facts.titleHead}${TITLE_SUFFIX}`, description: facts.description, type: "website" },
  };
}

const GIFT_NOTE_ID = "gift-note";

/** The hub's text tile for the one sport with no Senior Night card yet (GAPS #17), word for word. */
const NO_EXAMPLE_YET = "Built to order — no example card yet.";

/* The hub's rhythm (owner review 2026-09-07). */
const SECTION = "py-14 md:py-20 lg:py-24";
const INDEX_ROW = "flex items-center justify-between gap-4 border-t border-hairline pt-3";
const INDEX_TEXT = "font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-muted-text";
const TEXT_LINK = "underline decoration-1 underline-offset-4 hover:decoration-2";

type SectionKey = "hero" | "when" | "back" | "photos" | "banner" | "faq" | "related" | "closing";

/** "02 / 08" — the sections are counted, so a spoke without a banner section counts seven. */
const sectionIndex = (n: number, total: number): string => `${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

/** The sport as the searcher writes it, from the measured head phrase: "cheer", "hockey", "volleyball". */
const searchWord = (facts: SeniorNightFacts): string => facts.head.phrase.replace(/\bsenior night\b/i, "").replace(/\s+/g, " ").trim();

interface BannerFacts {
  /** The product's own blurb, without its full stop. */
  lead: string;
  /** "1 × 2", "2 × 4", "3 × 6". */
  sizes: string[];
  unit: string;
  /** "Ships separately, 1–2 weeks". */
  shipping: string;
}

/**
 * The banner line's facts, read from the catalog and never typed: the product's own blurb
 * (lib/intake/products.ts), the printed sizes from the banner ladder's variant names ("2x4 ft Vinyl
 * Banner" → "2 × 4"), and the banner listings' own shipping promise from tierNotes. A ladder that changes
 * changes the sentence.
 */
function bannerFacts(): BannerFacts | null {
  const blurb = productByKey("banner")?.blurb;
  const printed = bannerTiers.filter((t) => t.physical && t.enabled);
  const sizes = printed.map((t) => /^(\d+)\s*x\s*(\d+)\s*(\w+)/i.exec(t.name)).filter((m): m is RegExpExecArray => Boolean(m));
  const shipping = printed.length ? tierNotes[printed[0].sku]?.at(-1) : undefined;
  if (!blurb || !sizes.length || sizes.length !== printed.length || !shipping) return null;
  return { lead: blurb.replace(/\.$/, ""), sizes: sizes.map(([, w, h]) => `${w} × ${h}`), unit: sizes[0][3], shipping };
}

/** One sentence; a size and the shipping range never break across a line ("2 ×⏎4", "1–⏎2 weeks"). */
function BannerLine({ line }: { line: BannerFacts }) {
  const last = line.sizes.length - 1;
  const shipping = `${line.shipping.charAt(0).toLowerCase()}${line.shipping.slice(1)}`;
  const range = /\d+–\d+\s+\S+$/.exec(shipping);
  return (
    <>
      {line.lead}, printed at{" "}
      {line.sizes.map((size, i) => (
        <Fragment key={size}>
          {i === 0 ? null : i === last ? " or " : ", "}
          <span className="whitespace-nowrap">{i === last ? `${size} ${line.unit}` : size}</span>
        </Fragment>
      ))}{" "}
      from the same photos as the card and poster;{" "}
      {range ? (
        <>
          {shipping.slice(0, range.index)}
          <span className="whitespace-nowrap">{range[0]}</span>
        </>
      ) : (
        shipping
      )}
      .
    </>
  );
}

/**
 * The sport whose senior back `sn.back` shows (the baseball example), read from the card ID the asset
 * carries — the caption says which sport it is. The exhibit stands beside a spoke's back line only when
 * the two kits agree (`backLine`): a numbered shirt back beside "no number anywhere" (cheerleading) or "the
 * back of the kit stays plain" (wrestling) would show the very number the line says is not there.
 */
function exampleBackFor(sport: Sport): Sport | null {
  const cardId = SITE_ASSETS["sn.back"]?.cardId;
  const card = cardId ? getCard(cardId) : undefined;
  const example = card ? sportByCode(card.sportCode) : undefined;
  return example && backLine(example) === backLine(sport) ? example : null;
}

/** The sport's public Senior Night demo cards — the athlete on the spoke's own card front, registered at /c. */
const seniorExampleCards = (sport: Sport): CardRecord[] =>
  cards.filter((c) => c.sportCode === sport.code && isIndexable(c) && styleCode(c.styleName) === "SR");

interface RelatedLink {
  href: string;
  label: string;
  note?: string;
}

/** The hub, the sport's own page, the spokes either side (the order wraps), the row's posts and the example's registered page. */
function relatedLinks(sport: Sport, facts: SeniorNightFacts): RelatedLink[] {
  const order: readonly string[] = SENIOR_NIGHT_SPORT_ORDER;
  const at = order.indexOf(sport.slug);
  const links: RelatedLink[] = [{ href: "/senior-night", label: pageFor("/senior-night").title }];
  const sportFacts = sportFactsFor(sport.slug);
  if (sportFacts && sportPageSports().some((s) => s.slug === sport.slug)) {
    links.push({ href: sportPagePath(sport.slug), label: sportFacts.titleHead });
  }
  if (at >= 0) {
    for (const step of [-1, 1]) {
      const sibling = order[(at + step + order.length) % order.length];
      const siblingFacts = seniorNightFactsFor(sibling);
      if (sibling !== sport.slug && siblingFacts && sportBySlug(sibling)) links.push({ href: seniorNightPath(sibling), label: siblingFacts.titleHead });
    }
  }
  for (const post of facts.posts.map(postBySlug)) if (post) links.push({ href: postPath(post), label: post.title });
  for (const card of seniorExampleCards(sport)) {
    links.push({ href: `/c/${card.cardId}`, label: "The example card's registered page", note: `${card.firstName} ${card.lastName} · ${card.cardId}` });
  }
  return links;
}

/**
 * The CTA block every spoke repeats word for word: the delivery chips, the pair and the trust line, in the
 * hero's order (chips first) or the closing's (pair first). Each piece carries its own `data-shared`
 * rather than one wrapper around all three: the gate strips a shared element up to the first closing tag
 * of its own name, and CtaPair's root is a <div>, so a <div> around the three would end there and leave
 * the trust line's <li>s behind as page prose.
 */
function SharedCtaBlock({ cta, order }: { cta: CtaPairProps; order: "hero" | "closing" }) {
  const chips = (
    <div data-shared="">
      <DeliveryChips kind="seniorNight" className="mt-6" />
    </div>
  );
  const pair = (
    <div data-shared="">
      <CtaPair {...cta} size="lg" className={order === "hero" ? "mt-6" : undefined} />
    </div>
  );
  return (
    <>
      {order === "hero" ? chips : pair}
      {order === "hero" ? pair : chips}
      <div data-shared="">
        <TrustLine className="mt-4" />
      </div>
    </>
  );
}

/** The spoke's object: its own SR card front, or (ice hockey) the hub's navy text tile — never another sport's art. */
function SpokeExhibit({ sport, facts }: { sport: Sport; facts: SeniorNightFacts }) {
  const face = facts.art.card ? assetOrNull(facts.art.card) : null;
  if (!face) {
    return (
      <div className="mx-auto w-full max-w-[320px]">
        <div className="flex aspect-[5/7] flex-col items-center justify-center gap-3 rounded-none border border-white/15 bg-navy p-[8%] text-center shadow-[var(--shadow-card-stock)]">
          <Shield tone="arena" size={40} />
          <span className="font-display text-h3 uppercase leading-none text-white">{sport.name}.</span>
          <span className="font-body text-small text-white/70">{NO_EXAMPLE_YET}</span>
        </div>
      </div>
    );
  }
  return (
    <figure className="mx-auto w-full max-w-[360px]">
      <CardFace {...face} labelled sizes="(min-width: 1024px) 360px, 80vw" />
      <figcaption className="mt-4">
        <FictionalLabel />
      </figcaption>
    </figure>
  );
}

export default async function SeniorNightSportPage({ params }: Params) {
  const { sport: slug } = await params;
  const spoke = spokeFor(slug);
  if (!spoke) notFound();
  const { sport, facts } = spoke;

  const path = seniorNightPath(slug);
  const todayEt = toEtDate(new Date());
  const cta = ctaFor("senior-night", { sport: slug });
  const word = searchWord(facts).toUpperCase();
  const season = seasonWord(facts.when.peakMonth);
  const banner = sport.seniorNightBannerListingId ? bannerFacts() : null;
  const backSport = exampleBackFor(sport);
  const related = relatedLinks(sport, facts);

  // Sections are counted from what this spoke renders: no banner listing, no banner section.
  const sections: SectionKey[] = ["hero", "when", "back", "photos", ...(banner ? (["banner"] as const) : []), "faq", "related", "closing"];
  const index = (key: SectionKey): string => sectionIndex(sections.indexOf(key) + 1, sections.length);

  return (
    <>
      <div className="print:hidden">
        {/* 01 · Hero — the answer first: the head phrase, the verdict, the claim, the delivery chips, the pair. */}
        <section aria-labelledby="sn-sport-hero" className="pt-8 pb-16 md:pb-24 lg:pb-32">
          <div className="container-gallery">
            <Breadcrumbs
              trail={[
                { name: "Home", href: "/" },
                { name: "Senior Night", href: "/senior-night" },
                { name: sport.name, href: path },
              ]}
            />
            <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
              <div className="lg:col-span-7">
                <SectionHeading
                  as="h1"
                  id="sn-sport-hero"
                  title={facts.h1}
                  subhead={facts.verdict}
                  pills={
                    <Pill variant="label" tone="accent">
                      SENIOR EDITION · 1 OF 1
                    </Pill>
                  }
                />
                <SharedCtaBlock cta={cta} order="hero" />
              </div>
              <div className="mt-10 lg:col-span-5 lg:mt-0">
                <SpokeExhibit sport={sport} facts={facts} />
              </div>
            </div>
          </div>
        </section>

        {/* 02 · When the night falls — the row's own timing and walk, then the shared calculator. */}
        <section aria-labelledby="sn-sport-when" className={SECTION}>
          <div className="container-site">
            <SectionHeading
              as="h2"
              id="sn-sport-when"
              index={index("when")}
              title={`WHEN IS ${word} SENIOR NIGHT.`}
              rail={
                <Pill variant="label" tone="outline">
                  {`${season} season`.toUpperCase()}
                </Pill>
              }
            />
            <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-x-12">
              <div className="lg:col-span-5">
                <p className="max-w-[44ch] font-body text-[1.25rem] font-medium leading-snug text-pretty text-ink">{facts.when.line}</p>
                <p className="mt-4 max-w-[52ch] font-body text-body text-pretty text-muted-text">{facts.ritual}</p>
              </div>
              <div className="lg:col-span-7">
                <div data-shared="" className="max-w-[40rem] rounded-ui border border-hairline p-6 lg:p-10">
                  <OrderByCalculator todayEt={todayEt} cta={cta.primary} giftNoteId={GIFT_NOTE_ID} />
                </div>
                <p data-shared="" className="mt-4 max-w-[62ch] font-body text-small text-muted-text">
                  {CANON.seniorDateLine}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 03 · The back — the row's line, beside the one example back the site has (its sport named in the
            caption) wherever that example's kit agrees with the line. */}
        <section aria-labelledby="sn-sport-back" className={SECTION}>
          <div className="container-site">
            <SectionHeading as="h2" id="sn-sport-back" index={index("back")} title="WHAT THE SENIOR EDITION CARRIES." />
            <div className="mt-8 grid items-start gap-10 md:grid-cols-12 lg:mt-12">
              <p className="max-w-[56ch] font-body text-body text-pretty md:col-span-7">{facts.backLine}</p>
              {backSport ? (
                <div data-shared="" className="md:col-span-5">
                  <BracketFrame fictional caption={`The senior edition back, ${backSport.name.toLowerCase()} example.`} className="mx-auto w-full max-w-[280px]">
                    <CardFace {...asset("sn.back")} labelled sizes="(min-width: 768px) 248px, 60vw" />
                  </BracketFrame>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* 04 · Photos for a senior — the row's notes, then the one shared pointer to the guide. */}
        <section aria-labelledby="sn-sport-photos" className={SECTION}>
          <div className="container-site">
            <SectionHeading as="h2" id="sn-sport-photos" index={index("photos")} title="PHOTOS FOR A SENIOR." />
            <ul className="mt-8 grid max-w-[62ch] gap-4 lg:mt-12">
              {facts.photoNotes.map((note) => (
                <li key={note} className="border-t border-hairline pt-4 font-body text-body text-pretty">
                  {note}
                </li>
              ))}
            </ul>
            <p data-shared="" className="mt-8 max-w-[62ch] font-body text-body text-pretty">
              The{" "}
              <Link href="/photo-guide" className={TEXT_LINK}>
                photo guide
              </Link>{" "}
              shows what the photo check looks for before any art is made.
            </p>
          </div>
        </section>

        {/* 05 · The banner — only for a sport with its own Senior Night banner listing. */}
        {banner ? (
          <section aria-labelledby="sn-sport-banner" className={SECTION}>
            <div className="container-site">
              <SectionHeading as="h2" id="sn-sport-banner" index={index("banner")} title="THE BANNER FOR THE NIGHT." />
              <div className="mt-8 max-w-[62ch] lg:mt-12">
                <p data-shared="" className="font-body text-body text-pretty">
                  <BannerLine line={banner} />
                </p>
                <div data-shared="" className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                  <EtsyButton sku={`GDE-${sport.code}-SNBAN`} className="w-full sm:w-auto" />
                  <Link href="/banners" className={`font-body text-body ${TEXT_LINK}`}>
                    {pageFor("/banners").title}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* 06 · The sport's questions (the page's one FAQPage), then the shared senior-night answers without markup. */}
        <section aria-labelledby="sn-sport-faq" className={SECTION}>
          <div className="container-site">
            <SectionHeading as="h2" id="sn-sport-faq" index={index("faq")} title={`${word} SENIOR NIGHT QUESTIONS.`} />
            <FaqList items={facts.questions} jsonLd className="mt-8 lg:mt-12" />
            <div data-shared="" className="mt-12">
              <FaqList items={faqSubset("senior-night")} />
            </div>
          </div>
        </section>

        {/* 07 · Related — a nav, so it reads as navigation and the duplication gate skips it. */}
        <section aria-labelledby="sn-sport-related" className={SECTION}>
          <div className="container-site">
            <SectionHeading as="h2" id="sn-sport-related" index={index("related")} title="RELATED." />
            <nav aria-label="Related pages" className="mt-8 lg:mt-12">
              <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((link) => (
                  <li key={link.href} className="border-t border-hairline pt-3">
                    <Link href={link.href} className="group inline-flex min-h-11 flex-col justify-center py-1">
                      <span className="font-body text-[1.0625rem] font-medium text-ink decoration-1 underline-offset-4 group-hover:underline">
                        {link.label}
                      </span>
                      {link.note ? <span className="mt-1 font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">{link.note}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {/* 08 · Closing — the pair, the one delivery claim again, the trust line. */}
        <section aria-label="Start the senior edition" className={SECTION}>
          <div className="container-site">
            <div className={INDEX_ROW}>
              <span aria-hidden="true" className={INDEX_TEXT}>
                {index("closing")}
              </span>
            </div>
            <div className="mt-8 lg:mt-12">
              <SharedCtaBlock cta={cta} order="closing" />
            </div>
          </div>
        </section>
      </div>
      <div data-shared="">
        <GiftNote id={GIFT_NOTE_ID} />
      </div>
    </>
  );
}
