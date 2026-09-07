// /c/<cardId> — the QR digital twin (COPY §2.15, DESIGN §5.10, CONTRACTS §6.2).
//
// Fully static: `generateStaticParams` covers every renderable record and `dynamicParams = false`,
// so an unknown ID costs no function invocation and falls to the root 404 (whose NotFoundBody
// renders the /c copy by pathname). `deleted` calls notFound() as defence in depth behind the
// /api/gone rewrite. The page decides on `cardArtFor(id)` — never on ART_PENDING: null means the
// pending block replaces the flip hero and the DOWNLOADS block is omitted, while the registration
// below it stays literally live. This route is the ONLY place that may import lib/fonts/finishes.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shield } from "../../../../components/brand/Shield";
import { CardFlip } from "../../../../components/CardFlip";
import { CtaPair } from "../../../../components/CtaPair";
import { EditionPanel } from "../../../../components/EditionPanel";
import { FictionalLabel } from "../../../../components/FictionalLabel";
import { Pill } from "../../../../components/Pill";
import { ShareRow } from "../../../../components/ShareRow";
import { StatChip } from "../../../../components/StatChip";
import { ButtonLink } from "../../../../components/ButtonLink";
import { ALT_REGISTERED_BACK, altRegisteredFront, videoLabel } from "../../../../lib/alt";
import { sportByCode } from "../../../../lib/catalog/sports";
import { styleByCode, styleByName } from "../../../../lib/catalog/styles";
import { teamAccent } from "../../../../lib/color";
import { CANON } from "../../../../lib/copy/canon";
import { ctaFor } from "../../../../lib/cta";
import { finishFontClass } from "../../../../lib/fonts/finishes";
import { JsonLd } from "../../../../components/JsonLd";
import { breadcrumbList, imageObject } from "../../../../lib/seo/jsonld";
import { CARD_ART_SIZE, cardArtFor } from "../../../../lib/registry/art";
import {
  cardStats,
  getCard,
  parseHighlight,
  renderableCards,
  seniorYears,
  showsJerseyNumber,
  styleCode,
  visibilityOf,
} from "../../../../lib/registry/cards";
import { cardMeta, cardTitle, notFoundMeta } from "../../../../lib/seo/meta";
import { SITE_URL, SUPPORT_EMAIL } from "../../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return renderableCards().map((c) => ({ cardId: c.cardId }));
}

export async function generateMetadata({ params }: { params: Promise<{ cardId: string }> }): Promise<Metadata> {
  const { cardId } = await params;
  const card = getCard(cardId);
  return card ? cardMeta(card) : notFoundMeta;
}

const LABEL = "font-finish-supporting text-label font-semibold uppercase tracking-[0.12em] text-arena-muted";
const SMALL = "font-body text-small text-arena-muted";

export const PRIVACY_LINES = {
  unlisted:
    "This page is unlisted: it opens only from the card's QR code or its exact ID, and search engines are asked not to index it.",
  public: "Public — shared with the parent or guardian's permission.",
  private: "This card is registered with Game Day Edition.",
  report: "Seen something on this page that shouldn't be here? Email us; we act within 48 hours.",
  manage: `To unlist, make public or delete this page, email ${SUPPORT_EMAIL} from the purchase email with the order number.`,
} as const;

const ARTWORK_PENDING_PILL = "ARTWORK PENDING";
const DOWNLOADS_LABEL = "DOWNLOADS";

/**
 * The order the stats are PRINTED in, per sport, when the record's own array disagrees with the
 * card. This page is the card's twin: it may not reorder the card's data. The basketball back
 * prints PPG · APG · RPG (measured on the generated back face of GDE-SN-BKB-2026-12), while the
 * demo records list RPG before APG — the printed card wins, always. A label the card does not
 * print keeps the record's own order, after the printed ones.
 */

/** The neutral notice a `private` record renders: no name, no art, no CTA beyond the lookup (COPY §2.15 (8)). */
function PrivateBody() {
  return (
    <div className="container-site max-w-[40rem] py-16 md:py-24">
      <Shield tone="arena" size={48} />
      <h1 className="mt-8 max-w-[16ch] font-display text-display uppercase text-balance">{PRIVACY_LINES.private}</h1>
      <div className="mt-8">
        <ButtonLink href="/registry" variant="outline-arena">
          Look up a card
        </ButtonLink>
      </div>
    </div>
  );
}

export default async function CardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) notFound();
  const visibility = visibilityOf(card);
  if (visibility === "deleted") notFound();

  // A record whose finish is not in the catalog is a data defect, not a page state: fail the build.
  const style = styleByName(card.styleName) ?? styleByCode(styleCode(card.styleName));
  if (!style) throw new Error(`/c/${card.cardId}: unknown finish "${card.styleName}"`);
  const sport = sportByCode(card.sportCode);
  const senior = style.code === "SR";
  const art = cardArtFor(card.cardId);

  if (visibility === "private") {
    return <PrivateBody />;
  }

  const accent = teamAccent(card.teamColors?.primary);
  const hasTeamColor = Boolean(card.teamColors?.primary);
  const name = `${card.firstName} ${card.lastName}`;
  const meta = [showsJerseyNumber(card) ? `#${card.jerseyNumber}` : null, card.position, card.team, card.season].filter(Boolean).join(" · ");
  const stats = cardStats(card);
  const statsLabel = senior ? "CAREER HIGHS" : "SEASON STATS";
  const highlight = parseHighlight(card);
  // The printed line sometimes opens with the same words as the stats label ("Career highs · …") —
  // print it once, as the label.
  const highlightLine = highlight.line && highlight.line.toUpperCase() !== statsLabel ? highlight.line : undefined;
  const years = senior ? seniorYears(card.classOf) : undefined;
  const showsClassOf = Boolean(card.classOf) && card.ageBand !== "adult" && (Boolean(card.isFictional) || Boolean(card.consentPublicAt));
  const downloads = visibility === "public" && card.isFictional && art ? art : null;
  const faceSizes = "(min-width: 1024px) 340px, 82vw";

  // Structured data only where it is true: a public card is a real, indexable page with a picture of
  // the object; unlisted pages get none, so nothing about them is offered to a crawler.
  const indexable = visibility === "public";
  return (
    <div data-surface="arena" className={finishFontClass(style.code)}>
      {indexable ? (
        <>
          <JsonLd data={breadcrumbList([{ name: "Home", href: "/" }, { name: "Registry", href: "/registry" }, { name: card.cardId, href: `/c/${card.cardId}` }])} />
          {art ? (
            <JsonLd
              data={imageObject({
                url: art.front,
                width: CARD_ART_SIZE.width,
                height: CARD_ART_SIZE.height,
                caption: sport ? altRegisteredFront(sport, style, Boolean(card.isFictional)) : `Registered card front — ${style.name} finish`,
                path: `/c/${card.cardId}`,
              })}
            />
          ) : null}
        </>
      ) : null}
      <div className="container-site max-w-[35rem] pb-16 lg:max-w-(--container-site)">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-12">
          <header className="pt-6 lg:col-span-2">
            <h1
              className={`font-finish-display text-[2.25rem] leading-[0.95] text-balance md:text-[3.5rem] ${style.displayCase === "title" ? "" : "uppercase"}`.trim()}
              style={accent.mode === "text" ? { color: accent.color } : undefined}
            >
              {name}
            </h1>
            <span
              aria-hidden="true"
              className={`mt-5 block h-1 w-12 ${hasTeamColor ? "" : "bg-silver"}`}
              style={hasTeamColor ? { background: accent.color } : undefined}
            />
            <p className="mt-4 font-finish-supporting text-[0.9375rem] uppercase tracking-[0.06em] text-arena-muted">{meta}</p>
            {card.isFictional ? <FictionalLabel tone="arena" className="mt-4 max-w-[40ch]" /> : null}
          </header>

          <div className="mt-6">
            {art ? (
              <CardFlip
                className="mx-auto max-w-[340px]"
                front={{
                  src: art.front,
                  alt: sport ? altRegisteredFront(sport, style, Boolean(card.isFictional)) : `Registered card front — ${style.name} finish`,
                  width: CARD_ART_SIZE.width,
                  height: CARD_ART_SIZE.height,
                }}
                back={{ src: art.back, alt: ALT_REGISTERED_BACK, width: CARD_ART_SIZE.width, height: CARD_ART_SIZE.height }}
                mp4={art.flipMp4}
                videoLabel={videoLabel(card.firstName, card.lastName, style)}
                autoplay={false}
                priority
                maxWidth={340}
                sizes={faceSizes}
              />
            ) : (
              <section aria-label="Card artwork" className="mx-auto max-w-[340px]">
                <div className="flex aspect-[5/7] w-full items-center justify-center border border-arena-hairline bg-arena-surface">
                  <Shield tone="arena" size={72} />
                </div>
                <p className="mt-4">
                  <Pill tone="outline-silver">{ARTWORK_PENDING_PILL}</Pill>
                </p>
                <p className="mt-3 font-body text-small text-white/90">{CANON.artPendingLine}</p>
              </section>
            )}
          </div>

          <div className="mt-8 lg:mt-6">
            <EditionPanel card={card} tone="arena" copyButton lastUpdated labelFont="finish" />

            {stats.length ? (
              <section aria-label={senior ? "Career highs" : "Season stats"} className="mt-8">
                <h2 className={LABEL}>{statsLabel}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stats.map((s) => (
                    <StatChip key={s.label} value={s.value} label={s.label} />
                  ))}
                </div>
              </section>
            ) : null}

            {highlightLine || showsClassOf || years || highlight.quote ? (
              <div className="mt-6">
                {highlightLine ? <p className="font-body text-body text-white/90">{highlightLine}</p> : null}
                {showsClassOf ? <p className="mt-3 font-finish-supporting text-[0.9375rem] uppercase tracking-[0.06em] text-arena-muted">CLASS OF {card.classOf}</p> : null}
                {senior ? (
                  <p className="mt-2 font-finish-supporting text-[0.9375rem] uppercase tracking-[0.06em] text-arena-muted">SENIOR SEASON {card.season}</p>
                ) : null}
                {years ? (
                  <p className="mt-1 font-finish-supporting text-[0.9375rem] uppercase tracking-[0.06em] text-arena-muted">
                    {years.map((y) => `${y.label} ${y.year}`).join(" · ")}
                  </p>
                ) : null}
                {highlight.quote ? (
                  <blockquote className="mt-4 border-l-2 border-gold/60 pl-4 font-finish-display text-[1.125rem] italic text-white/90">
                    {highlight.quote}
                  </blockquote>
                ) : null}
              </div>
            ) : null}

            <section aria-label="Downloads and share" className="mt-8">
              {downloads ? (
                <>
                  {/* front · back · flip (DESIGN §5.10-5). Button labels are set uppercase, so the
                      file format goes in the accessible name, not into the label a parent reads as
                      "CARD FRONT (WEBP)". The flip row appears only when the render exists. */}
                  <h2 className={LABEL}>{DOWNLOADS_LABEL}</h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <ButtonLink href={downloads.front} variant="outline-arena" size="sm" ariaLabel="Download the card front (WebP)">
                      Card front
                    </ButtonLink>
                    <ButtonLink href={downloads.back} variant="outline-arena" size="sm" ariaLabel="Download the card back (WebP)">
                      Card back
                    </ButtonLink>
                    {downloads.flipMp4 ? (
                      <ButtonLink href={downloads.flipMp4} variant="outline-arena" size="sm" ariaLabel="Download the card flip (MP4)">
                        Card flip
                      </ButtonLink>
                    ) : null}
                  </div>
                </>
              ) : null}
              <ShareRow className={downloads ? "mt-4" : ""} url={`${SITE_URL}/c/${card.cardId}`} text={cardTitle(card)} tone="arena" />
            </section>

            {/* The finish, in the words a parent reads: what it is made of. The type pairing
                ("Anton + Barlow") is a studio note about which faces were licensed for the finish —
                it says nothing to the person holding the card, and it is not shown. */}
            <section aria-label="About this finish" className="mt-8">
              <p className="font-body text-small text-white/80">{style.material}</p>
              {senior ? (
                <p className="mt-2">
                  <Link href="/senior-night" className="font-body text-small text-white underline-offset-4 decoration-1 hover:underline">
                    About Senior Night editions
                  </Link>
                </p>
              ) : null}
            </section>

            <div className="mt-8">
              <CtaPair {...ctaFor("card-page", card)} />
            </div>
          </div>
        </div>

        <footer className={`mt-12 border-t border-arena-hairline pt-6 ${SMALL}`}>
          {visibility === "unlisted" ? <p>{PRIVACY_LINES.unlisted}</p> : null}
          {visibility === "public" && !card.isFictional ? <p>{PRIVACY_LINES.public}</p> : null}
          <p className="mt-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Report card ${card.cardId}`)}`}
              className="text-white underline-offset-4 decoration-1 hover:underline"
            >
              Report this card
            </a>{" "}
            — {PRIVACY_LINES.report}
          </p>
          <p className="mt-3">{PRIVACY_LINES.manage}</p>
          {card.isFictional ? <p className="mt-3">{CANON.galleryCaptionShort}</p> : null}
        </footer>
      </div>
    </div>
  );
}
