import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { ButtonLink } from "../../../components/ButtonLink";
import { PRIMARY_BUTTON_CLASS } from "../../../components/CtaPair";
import { FaqList, type FaqListItem } from "../../../components/FaqList";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { assetOrNull, type ImageSpec } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { faqById, type FaqItem } from "../../../lib/catalog/faq";
import { TEAM_ORDER_MAILTO } from "../../../lib/catalog/seasons";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor, freeProofHref, freeProofMode } from "../../../lib/cta";
import { PRODUCTS, productFromLabel, setFromLabel } from "../../../lib/intake/products";
import { pageMeta } from "../../../lib/seo/meta";
import { SUPPORT_EMAIL } from "../../../lib/site";
import { ClaimLabels } from "../(families)/_shared/hero";

/**
 * `/teams` (spec §4.18, honest for TODAY). The spec's team link, coach dashboard and set-up form are F2
 * and do not exist yet, so this page says what a team can do now: one email sets the team up, and every
 * family orders, approves and pays for its own athlete. No team count, no "trusted by", no discount talk;
 * every price is the single-athlete price from lib/intake/products.ts.
 */
export const revalidate = 3600;

const PATH = "/teams";

export const metadata: Metadata = pageMeta(PATH);

export const TEAMS_H1 = "ONE TEAM SETUP. EVERY FAMILY ORDERS THEIR OWN.";
export const EMAIL_LABEL = "Email us about your team";
export const ONE_ATHLETE_LABEL = "Or start one athlete's free proof";

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export function teamsSubhead(proofFirst: boolean): string {
  const middle = proofFirst
    ? "Each family sends its own photos through the free-proof form, approves its proof and pays for its athlete."
    : "Each family orders and pays for its own athlete, and approves its own proof.";
  return `The coach or a team parent emails us the sport, the roster size and the event date. ${middle} Every card is built one at a time.`;
}

/** The four steps of today's team order. */
export function teamSteps(proofFirst: boolean): { title: string; body: string }[] {
  return [
    {
      title: "Email us.",
      body: "The coach or a team parent sends the sport, the roster size and the event date. Nothing about any athlete yet.",
    },
    {
      title: "We confirm the crest and the deadline, once.",
      body: "One check for the whole team, before the first family orders.",
    },
    {
      title: "Each family sends its photos.",
      body: proofFirst
        ? "Through the free-proof form, naming the team, so every card carries the crest confirmed in step two."
        : "With its own order, naming the team, so every card carries the crest confirmed in step two.",
    },
    {
      title: "Proofs go to each family. Prints ship to each home.",
      body: proofFirst
        ? "Every family approves its own watermarked proof, and its printed pieces ship to its own address."
        : "Every family approves its own proof, and its printed pieces ship to its own address.",
    },
  ];
}

/** faq-30 and faq-31 from the master FAQ (lib/catalog/faq.ts), then this page's own two. */
export function teamQuestions(): FaqListItem[] {
  const shared = ["faq-30", "faq-31"].map((id) => faqById(id)).filter((item): item is FaqItem => Boolean(item));
  return [
    ...shared.map(({ id, q, a }) => ({ id, q, a })),
    {
      id: "q-teams-finish",
      q: "Same finish for everyone?",
      a: "Your choice. Name one finish in your email and every family's card is built in it, or let each family choose its own.",
    },
    {
      id: "q-teams-invoice",
      q: "Can the club pay one invoice?",
      a: `Ask us by email at ${SUPPORT_EMAIL} before the first family orders. Without one, every family pays for its own athlete.`,
    },
  ];
}

/** A whole team's order staged on a table, softball first, baseball when that file is the one the map has. */
function teamExhibit(): ImageSpec | null {
  return assetOrNull("life.team.order") ?? assetOrNull("life.team.order.baseball");
}

/* ---------- layout ---------- */

const SECTION = "py-14 md:py-20 lg:py-24";
/* The closing band follows the questions directly: the band above already spent its bottom air. */
const CLOSING = "pb-14 md:pb-20 lg:pb-24";
const INDEX_ROW = "flex items-center justify-between gap-4 border-t border-hairline pt-3";
const INDEX_TEXT = "font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-muted-text";
const TEXT_LINK =
  "inline-flex min-h-11 items-center font-body text-[0.9375rem] font-medium text-ink underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:decoration-2";
const PROSE_LINK = "text-ink underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:decoration-2";

/** The mailto primary and the one-athlete outline, then the TrustLine: identical at the top and the bottom. */
function TeamCta({ proofFirst }: { proofFirst: boolean }) {
  const secondary = proofFirst
    ? { label: ONE_ATHLETE_LABEL, href: freeProofHref() }
    : { label: "Or order for one athlete", href: ctaFor("set").primary.href };
  return (
    <div data-shared="">
      {/* Wraps instead of overflowing: the two labels are long, and at 1024 px the hero's text column is 470 px. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink href={TEAM_ORDER_MAILTO} variant="bare" size="lg" className={`${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}>
          {EMAIL_LABEL}
        </ButtonLink>
        <ButtonLink href={secondary.href} variant="outline" size="lg" className="w-full sm:w-auto">
          {secondary.label}
        </ButtonLink>
      </div>
      <TrustLine className="mt-4" />
    </div>
  );
}

export function TeamsBody() {
  const proofFirst = freeProofMode();
  const exhibit = teamExhibit();
  const privacy = faqById("faq-31");
  const logoSentence = block("logo-sentence");

  return (
    <>
      {/* 01 · Hero */}
      <section aria-labelledby="teams-hero" className="pt-8 pb-16 md:pb-24 lg:pb-32">
        <div className="container-gallery">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Teams", href: PATH },
            ]}
          />
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                id="teams-hero"
                title={TEAMS_H1}
                subhead={teamsSubhead(proofFirst)}
                pills={
                  <ClaimLabels
                    claims={[{ text: "SAME PRICE PER ATHLETE", tone: "accent" }, { text: "CREST APPROVED ONCE" }, { text: "NO MINIMUM · NO DEPOSIT" }]}
                  />
                }
              />
              <div className="mt-8">
                <TeamCta proofFirst={proofFirst} />
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

      {/* 02 · How it works today */}
      <section aria-labelledby="teams-how" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="teams-how" index="02 / 06" title="HOW IT WORKS TODAY." />
          <ol className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {teamSteps(proofFirst).map((step, i) => (
              <li key={step.title} className="border-t border-hairline pt-4">
                <span aria-hidden="true" className="font-display text-h2 leading-none text-muted-text tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-h3 uppercase">{step.title}</h3>
                <p className="mt-3 font-body text-body text-pretty">{step.body}</p>
                {i === 1 ? (
                  <p data-shared="" className="mt-3 font-body text-small text-pretty text-muted-text">
                    {logoSentence}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
          {privacy ? (
            <p data-shared="" className="mt-10 max-w-[62ch] font-body text-body font-bold text-pretty text-ink">
              {privacy.q} {privacy.a}
            </p>
          ) : null}
        </div>
      </section>

      {/* 03 · What each family pays */}
      <section aria-labelledby="teams-pay" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="teams-pay" index="03 / 06" title="WHAT EACH FAMILY PAYS." />
          <dl className="mt-8 max-w-[40rem] divide-y divide-hairline border-y border-hairline lg:mt-10">
            {PRODUCTS.map((product) => (
              <div key={product.key} className="flex items-baseline justify-between gap-6 py-3">
                <dt className="font-body text-body text-ink">{product.name}</dt>
                <dd className="text-right font-body text-body font-bold text-ink">{capitalize(productFromLabel(product))}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-6 py-3">
              <dt className="font-body text-body text-ink">Cards and a poster together</dt>
              <dd className="text-right font-body text-body font-bold text-ink">{capitalize(setFromLabel())}</dd>
            </div>
          </dl>
          <p className="mt-6 max-w-[62ch] font-body text-body text-pretty">
            Each family pays for its own athlete, at the same price as a single order. Setup is free. A club invoice for the whole roster:{" "}
            <a href={TEAM_ORDER_MAILTO} className={PROSE_LINK}>
              ask us by email
            </a>
            .
          </p>
        </div>
      </section>

      {/* 04 · Senior class or end of season */}
      <section aria-labelledby="teams-occasion" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="teams-occasion" index="04 / 06" title="SENIOR CLASS OR END OF SEASON." />
          <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-10">
            <div>
              <h3 className="font-display text-h3 uppercase">The whole senior class.</h3>
              <p className="mt-3 max-w-[52ch] font-body text-body text-pretty">
                Every senior&apos;s family orders the gold Senior Night edition for its own athlete, with the class year and the senior quote
                on the back.
              </p>
              <p data-shared="" className="mt-3 max-w-[52ch] font-body text-small text-pretty text-muted-text">
                {CANON.seniorDateLine}
              </p>
              <Link href="/senior-night" className={`mt-2 ${TEXT_LINK}`}>
                Senior night →
              </Link>
            </div>
            <div>
              <h3 className="font-display text-h3 uppercase">The end-of-season team gift.</h3>
              <p className="mt-3 max-w-[52ch] font-body text-body text-pretty">
                Every family orders the card, the poster or both for its own athlete, in the finish the team picked or one of its own.
              </p>
              <p data-shared="" className="mt-3 max-w-[52ch] font-body text-small text-pretty text-muted-text">
                {CANON.deliveryClocks}
              </p>
              <Link href="/sports" className={`mt-2 ${TEXT_LINK}`}>
                Every sport →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 05 · Questions */}
      <section aria-labelledby="teams-faq" className={SECTION}>
        <div className="container-site">
          <SectionHeading as="h2" id="teams-faq" index="05 / 06" title="TEAM QUESTIONS." />
          <FaqList items={teamQuestions()} jsonLd className="mt-8 lg:mt-10" />
        </div>
      </section>

      {/* 06 · Closing */}
      <section aria-label="Set up your team" className={CLOSING}>
        <div className="container-site">
          <div className={INDEX_ROW}>
            <span aria-hidden="true" className={INDEX_TEXT}>
              06 / 06
            </span>
          </div>
          <div className="mt-8">
            <TeamCta proofFirst={proofFirst} />
          </div>
        </div>
      </section>
    </>
  );
}

export default function TeamsPage() {
  return <TeamsBody />;
}
