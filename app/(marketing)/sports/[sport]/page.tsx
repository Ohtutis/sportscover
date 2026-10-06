// /sports/[sport] — one page per sport that has a facts row AND a live listing (SEO plan 2026-10-06 §4,
// spec §4.5). Answer first: the H1 is the measured head phrase, the verdict under it, then what is on
// the card, the photos that work, the season, the price, the sport's own questions and the pages around
// it. Static: every slug is known at build time (`dynamicParams = false` → anything else is a 404); the
// hour of revalidation is for the two things that move with the clock, the ladder's prices and the
// Christmas line.
//
// Every sentence outside a `data-shared` block is read from the sport's own row in
// lib/seo/sport-facts.ts. Blocks that are identical on every sport page by design (the CTA block, the
// delivery chips, the catalog truth chip, the price ladder, the photo-guide and Christmas pointers) carry
// `data-shared=""`, which the duplication gate (tests/seo-families.test.ts) strips before it measures.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { CardFace } from "../../../../components/CardFace";
import { CtaPair } from "../../../../components/CtaPair";
import { DeliveryChips } from "../../../../components/DeliveryChips";
import { FaqList, type FaqListItem } from "../../../../components/FaqList";
import { FictionalLabel } from "../../../../components/FictionalLabel";
import { Pill } from "../../../../components/Pill";
import { SectionHeading } from "../../../../components/SectionHeading";
import { TrustLine } from "../../../../components/TrustLine";
import { Shield } from "../../../../components/brand/Shield";
import { assetOrNull, type ImageSpec } from "../../../../lib/assets";
import { postBySlug, postPath, type BlogPost } from "../../../../lib/blog";
import { faqById } from "../../../../lib/catalog/faq";
import { isChristmasWindow } from "../../../../lib/catalog/seasons";
import { backLine, isNumberless, sports, type Sport } from "../../../../lib/catalog/sports";
import { styleByName, styles } from "../../../../lib/catalog/styles";
import { CANON } from "../../../../lib/copy/canon";
import { ctaFor, freeProofMode } from "../../../../lib/cta";
import { cards, isIndexable } from "../../../../lib/registry/cards";
import { seniorNightFactsFor, seniorNightPath, type SeniorNightFacts } from "../../../../lib/seo/senior-night-facts";
import { sportFactsFor, sportPagePath, sportPageSports, type SportFacts } from "../../../../lib/seo/sport-facts";
import { TITLE_SUFFIX } from "../../../../lib/seo/titles";
import { ShowcaseFigure, showcase } from "../../(families)/_shared/showcase";
import { TierRow } from "../../(families)/_shared/tier-row";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return sportPageSports().map((s) => ({ sport: s.slug }));
}

type Params = { params: Promise<{ sport: string }> };

/** The sport and its facts row, or null when the slug has no page of its own. */
function pageData(slug: string): { sport: Sport; facts: SportFacts } | null {
  const sport = sportPageSports().find((s) => s.slug === slug);
  const facts = sport ? sportFactsFor(sport.slug) : undefined;
  return sport && facts ? { sport, facts } : null;
}

/** The shape of `pageMeta()` (lib/seo/meta.ts), built from the row: the root template appends the brand. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { sport: slug } = await params;
  const data = pageData(slug);
  if (!data) return {};
  const { facts } = data;
  const path = sportPagePath(facts.slug);
  return {
    title: facts.titleHead,
    description: facts.description,
    alternates: { canonical: path },
    openGraph: { url: path, title: `${facts.titleHead}${TITLE_SUFFIX}`, description: facts.description, type: "website" },
  };
}

/* Owner review 2026-09-07: the band gap is 96 px a side, the air is spent inside the blocks. */
const SECTION = "py-14 md:py-20 lg:py-24";
const SECTION_TOTAL = 8;
const index = (n: number): string => `${String(n).padStart(2, "0")} / ${String(SECTION_TOTAL).padStart(2, "0")}`;
const LABEL = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";
const LINK = "underline decoration-1 underline-offset-4 hover:decoration-2";
/** A season fact is a paragraph of the row's own words (the duplication gate reads <p>, so it counts as this sport's prose). */
const SEASON_FACT = "font-body text-[1.25rem] font-bold text-pretty text-ink md:text-sub";

/** "late January or February" → "Late January or February": a fact fragment set as its own line. */
const capitalize = (s: string): string => (s ? `${s.charAt(0).toUpperCase()}${s.slice(1)}` : s);

/** A facts row's H1 as link text: "CUSTOM FOOTBALL CARD." → "Custom football card". */
const headLabel = (h1: string): string => capitalize(h1.replace(/\.$/, "").toLowerCase());

/**
 * The FAQ: the sport's own questions, and for a sport that wears no number the shared C9 answer first
 * (faq-12) — one list, the page's only FAQPage markup.
 */
function faqItems(sport: Sport, facts: SportFacts): FaqListItem[] {
  const numberless = isNumberless(sport) ? faqById("faq-12") : undefined;
  return [...(numberless ? [numberless] : []), ...facts.questions].map(({ id, q, a }) => ({ id, q, a }));
}

interface RelatedLink {
  href: string;
  label: string;
  detail?: string;
}

interface RelatedGroup {
  title: string;
  links: RelatedLink[];
}

/** The order the finishes are presented in everywhere else, so a sport's example cards read the same way. */
const FINISH_ORDER = styles.map((s) => s.name);

/**
 * Section 07: the hub, the two neighboring sport pages (the list wraps, so every page has two), the
 * sport's senior-night spoke, /banners when the sport sells one, the blog posts the row names, and the
 * sport's public example cards on the registry.
 */
function relatedGroups(sport: Sport, facts: SportFacts, sn: SeniorNightFacts | undefined): RelatedGroup[] {
  const list = sportPageSports();
  const at = list.findIndex((s) => s.slug === sport.slug);
  const neighbors = [list[(at - 1 + list.length) % list.length], list[(at + 1) % list.length]].filter(
    (s, i, all): s is Sport => Boolean(s) && s.slug !== sport.slug && all.findIndex((o) => o?.slug === s.slug) === i,
  );
  const groups: RelatedGroup[] = [
    {
      title: "More sports",
      links: [
        { href: "/sports", label: `All ${sports.length} sports` },
        ...neighbors.map((s) => ({ href: sportPagePath(s.slug), label: headLabel(sportFactsFor(s.slug)?.h1 ?? s.name) })),
      ],
    },
  ];
  if (sn) groups.push({ title: "Senior night", links: [{ href: seniorNightPath(sport.slug), label: capitalize(sn.head.phrase) }] });
  if (sport.bannerListingId) groups.push({ title: "Banners", links: [{ href: "/banners", label: "Custom sports banners" }] });
  const posts = facts.posts.map((slug) => postBySlug(slug)).filter((p): p is BlogPost => Boolean(p));
  if (posts.length) groups.push({ title: "From the blog", links: posts.map((p) => ({ href: postPath(p), label: p.title })) });
  const examples = cards
    .filter((c) => c.sportCode === sport.code && isIndexable(c))
    .sort((a, b) => FINISH_ORDER.indexOf(a.styleName) - FINISH_ORDER.indexOf(b.styleName));
  if (examples.length) {
    groups.push({
      title: "Example cards",
      links: examples.map((c) => ({
        href: `/c/${c.cardId}`,
        label: styleByName(c.styleName)?.name ?? c.styleName,
        detail: `${c.firstName} ${c.lastName}`,
      })),
    });
  }
  return groups;
}

/** A card box with no export behind it: 5 : 7, radius 0, the silver shield and the name (the senior-night placeholder). */
function PlaceholderCard({ name }: { name: string }) {
  return (
    <div className="flex aspect-[5/7] flex-col items-center justify-center gap-3 rounded-none border border-white/15 bg-navy p-[8%] text-center shadow-[var(--shadow-card-stock)]">
      <Shield tone="arena" size={40} />
      <span className="font-display text-h3 uppercase leading-none text-white">{name}.</span>
    </div>
  );
}

/**
 * The hero object: the sport's own card front, floated on the page's stock at a slight angle with the
 * card shadow (the family heroes' recipe). Nothing is preloaded: on a phone the LCP is the headline.
 */
function HeroCard({ face, name }: { face: ImageSpec | null; name: string }) {
  return (
    <figure data-exhibit="" className="flex flex-col justify-center lg:h-full">
      <div className="mx-auto w-[62%] max-w-[320px] rotate-[-3deg] sm:w-[46%] lg:w-[70%]">
        {face ? (
          <CardFace {...face} labelled sizes="(min-width: 1024px) 320px, (min-width: 640px) 46vw, 62vw" />
        ) : (
          <PlaceholderCard name={name} />
        )}
      </div>
      {face?.fictional ? (
        <figcaption className="mt-8">
          <FictionalLabel />
        </figcaption>
      ) : null}
    </figure>
  );
}

/** The link to the sport's senior-night spoke, with that sport's gold senior card beside it when one exists. */
function SeniorNightLink({ href, label, card }: { href: string; label: string; card: ImageSpec | null }) {
  return (
    <div data-shared="" data-exhibit="">
      <Link href={href} className={`group grid items-center gap-6 border-t border-hairline pt-4 ${card ? "grid-cols-[minmax(0,8.5rem)_1fr]" : ""}`.trim()}>
        {card ? (
          <span className="block rotate-[2deg]">
            <CardFace {...card} labelled sizes="136px" />
          </span>
        ) : null}
        <span className="block">
          <span className={`block ${LABEL}`}>The senior edition</span>
          <span className="mt-2 block font-display text-h3 uppercase underline-offset-4 group-hover:underline">
            {label} <span aria-hidden="true">→</span>
          </span>
        </span>
      </Link>
      {card?.fictional ? <FictionalLabel className="mt-4" /> : null}
    </div>
  );
}

export default async function SportPage({ params }: Params) {
  const { sport: slug } = await params;
  const data = pageData(slug);
  if (!data) notFound();
  const { sport, facts } = data;

  const now = new Date();
  const path = sportPagePath(sport.slug);
  const cta = ctaFor("sport", { sport: sport.slug });
  const proofFirst = freeProofMode();
  const card = assetOrNull(facts.art.card);
  const wall = facts.art.wall ? showcase(facts.art.wall) : null;
  const sn = seniorNightFactsFor(sport.slug);
  // Softball's and wrestling's evergreen front IS their senior front (one export): the season section
  // then links the spoke without showing the hero's card a second time.
  const senior = facts.art.seniorCard ? assetOrNull(facts.art.seniorCard) : null;
  const seniorCard = senior && senior.src !== card?.src ? senior : null;
  const christmas = isChristmasWindow(now);
  const faq = faqItems(sport, facts);
  const related = relatedGroups(sport, facts, sn);
  const upper = sport.name.toUpperCase();

  return (
    <>
      {/* 01 · Hero: the head phrase, the verdict, the claims, the one delivery claim and the CTA pair. */}
      <section aria-labelledby="sport-hero" className="pt-8 pb-14 md:pb-20 lg:pb-24">
        <div className="container-gallery">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Sports", href: "/sports" },
              { name: sport.name, href: path },
            ]}
          />
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-7">
              <SectionHeading
                as="h1"
                id="sport-hero"
                title={facts.h1}
                subhead={facts.verdict}
                // Claims as type, never as a second row of buttons (owner review 2026-09-07): one accent.
                pills={
                  <>
                    <Pill variant="label" tone="accent">
                      FROM YOUR PHOTOS
                    </Pill>
                    {proofFirst ? (
                      <>
                        <span aria-hidden="true" className="font-label text-label font-semibold leading-none text-muted-text">
                          ·
                        </span>
                        <Pill variant="label" tone="outline">
                          FREE PROOF FIRST
                        </Pill>
                      </>
                    ) : null}
                  </>
                }
              />
              <div data-shared="" className="mt-8">
                <DeliveryChips kind="standard" />
                <CtaPair {...cta} size="lg" className="mt-6" />
                <TrustLine className="mt-5" />
              </div>
            </div>
            <div className="mt-12 lg:col-span-5 lg:mt-0">
              <HeroCard face={card} name={sport.name} />
            </div>
          </div>
        </div>
      </section>

      {/* 02 · What's on the card: the row's front and back lines, the catalog's back-of-kit truth, the wall. */}
      <section aria-labelledby="sport-card" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="sport-card" index={index(2)} title="WHAT'S ON THE CARD." />
          <div className="mt-10 grid gap-x-12 gap-y-12 lg:mt-12 lg:grid-cols-12">
            <div className={wall ? "lg:col-span-6" : "lg:col-span-8"}>
              <h3 className="font-display text-h3 uppercase">The front</h3>
              <p className="mt-3 max-w-[56ch] font-body text-body text-pretty text-ink">{facts.frontLine}</p>
              <h3 className="mt-10 font-display text-h3 uppercase">The back</h3>
              <p className="mt-3 max-w-[56ch] font-body text-body text-pretty text-ink">{facts.backLine}</p>
              <div data-shared="" className="mt-6">
                <Pill variant="label" tone="accent">
                  {`Back of the kit: ${backLine(sport)}`}
                </Pill>
              </div>
            </div>
            {wall ? (
              <div data-exhibit="" className="lg:col-span-6">
                <h3 className="font-display text-h3 uppercase">On the wall</h3>
                <ShowcaseFigure item={wall} aspect="natural" sizes="(min-width: 1024px) 540px, 92vw" className="mt-4" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 03 · Photos that work: the sport's own traps, then the pointer to the whole guide. */}
      <section aria-labelledby="sport-photos" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="sport-photos" index={index(3)} title={`PHOTOS THAT WORK FOR ${upper}.`} />
          <ol className="mt-10 grid gap-x-12 md:grid-cols-2 lg:mt-12">
            {facts.photoTraps.map((trap, i) => (
              <li key={trap} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-hairline py-5">
                <span aria-hidden="true" className="font-display text-h3 leading-none tabular-nums text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-[52ch] font-body text-body text-pretty text-ink">{trap}</p>
              </li>
            ))}
          </ol>
          <p data-shared="" className="mt-8 max-w-[62ch] font-body text-body text-pretty text-ink">
            <Link href="/photo-guide" className={LINK}>
              The photo guide
            </Link>{" "}
            lists everything the photo check looks for, from face size to who is closest to the camera.
          </p>
        </div>
      </section>

      {/* 04 · The season: when it is played and when the night usually falls (typical, never a promise). */}
      <section aria-labelledby="sport-season" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="sport-season" index={index(4)} title="THE SEASON." />
          <div className="mt-10 grid gap-x-12 gap-y-12 lg:mt-12 lg:grid-cols-12">
            <dl className="grid content-start gap-y-8 lg:col-span-7">
              <div className="border-t border-hairline pt-4">
                <dt className={LABEL}>When the season runs</dt>
                <dd className="mt-2">
                  <p className={SEASON_FACT}>{capitalize(facts.season.plays)}</p>
                </dd>
              </div>
              <div className="border-t border-hairline pt-4">
                <dt className={LABEL}>When senior night usually falls</dt>
                <dd className="mt-2">
                  <p className={SEASON_FACT}>{capitalize(facts.season.seniorNight)}</p>
                </dd>
              </div>
            </dl>
            {sn ? (
              <div className="lg:col-span-5">
                <SeniorNightLink href={seniorNightPath(sport.slug)} label={capitalize(sn.head.phrase)} card={seniorCard} />
              </div>
            ) : null}
          </div>
          {christmas ? (
            <p data-shared="" className="mt-10 max-w-[62ch] font-body text-body text-pretty text-ink">
              Giving it as a Christmas gift?{" "}
              <Link href="/christmas-gift" className={LINK}>
                The Christmas gift page
              </Link>{" "}
              has the order-by dates for the files and the printed pieces.
            </p>
          ) : null}
        </div>
      </section>

      {/* 05 · The price: the card ladder for this sport — every number from the catalog, through TierCard. */}
      <section aria-labelledby="sport-price" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="sport-price" index={index(5)} title="THE CARDS, PRICED." />
          <div data-shared="" className="mt-10 lg:mt-12">
            <div data-price-ladder="">
              <TierRow family="cards" context="cards" sport={sport} />
            </div>
            <p className="mt-4 max-w-[62ch] font-body text-small text-pretty text-muted-text">
              The poster has its own price ladder on{" "}
              <Link href={`/posters?sport=${sport.slug}`} className={LINK}>
                the posters page
              </Link>
              , and{" "}
              <Link href={`/complete-set?sport=${sport.slug}`} className={LINK}>
                the complete set
              </Link>{" "}
              puts the poster and the cards in one order.
            </p>
          </div>
        </div>
      </section>

      {/* 06 · The sport's own questions — the page's one FAQPage markup. */}
      <section aria-labelledby="sport-faq" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="sport-faq" index={index(6)} title={`${upper} QUESTIONS.`} />
          <FaqList items={faq} jsonLd openFirst className="mt-10 max-w-[52rem] lg:mt-12" />
        </div>
      </section>

      {/* 07 · Related: navigation, so the duplication gate reads none of it as prose. */}
      <section aria-labelledby="sport-related" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="sport-related" index={index(7)} title="RELATED." />
          <nav aria-labelledby="sport-related" className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            {related.map((group) => {
              // The example cards are the one long list: a row of their own, the links set in columns.
              const wide = group.links.length > 4;
              return (
                <div key={group.title} className={`border-t border-hairline pt-4 ${wide ? "md:col-span-2 lg:col-span-3" : ""}`.trim()}>
                  <h3 className={LABEL}>{group.title}</h3>
                  <ul className={`mt-3 ${wide ? "grid gap-x-12 gap-y-4 sm:grid-cols-2 lg:grid-cols-4" : "space-y-3"}`}>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={`font-body text-body font-medium text-ink ${LINK}`}>
                          {link.label}
                        </Link>
                        {link.detail ? <span className="block font-body text-small text-muted-text">{link.detail}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>
      </section>

      {/* 08 · Closing: the same CTA block every sport page ends on. */}
      <section aria-labelledby="sport-start" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="sport-start" index={index(8)} title="START WITH YOUR PHOTOS." />
          <div data-shared="" className="mt-8">
            {proofFirst ? <p className="max-w-[62ch] font-body text-body text-pretty text-ink">{CANON.proofFirstLine}</p> : null}
            <CtaPair {...cta} size="lg" className={proofFirst ? "mt-6" : undefined} />
            <DeliveryChips kind="standard" className="mt-6" />
            <TrustLine className="mt-5" />
          </div>
        </div>
      </section>
    </>
  );
}
