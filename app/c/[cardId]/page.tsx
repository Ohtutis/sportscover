// Public collectible-card page — resolves the QR code on the printed card.
// Static for every public, unlisted and private record; unlisted and private pages are noindex;
// private ones render only a neutral notice (the printed QR must never 404); deleted/unknown IDs 404. Per-card artwork, flip and downloads arrive with the F1 rebuild.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "../../../components/BrandMark";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { styleByName } from "../../../lib/catalog/styles";
import { sportByCode } from "../../../lib/catalog/sports";
import { channelOf, getCard, renderableCards, showsJerseyNumber, visibilityOf, type CardRecord } from "../../../lib/registry/cards";
import { BRAND } from "../../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return renderableCards().map((c) => ({ cardId: c.cardId }));
}

function registeredDate(c: CardRecord): string {
  return new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export async function generateMetadata({ params }: { params: Promise<{ cardId: string }> }): Promise<Metadata> {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) return { title: "Card not found" };
  const vis = visibilityOf(card);
  if (vis === "private" || vis === "deleted") return { title: "Registered edition", robots: { index: false, follow: false } };
  const name = `${card.firstName} ${card.lastName}`;
  // Unlisted pages never put the athlete's name in any meta tag — link-preview scrapers fall back to
  // `description` when OG is absent, and the URL is the only thing protecting the page.
  const desc = vis === "public" ? card.playerHighlight || `${name} · ${card.team} · ${card.styleName} — Registered ${BRAND}` : `${card.styleName} — a registered ${BRAND} card`;
  return {
    title: vis === "public" ? `${name} · ${card.team} · ${card.styleName}` : `${card.styleName} — Registered edition`,
    description: desc,
    robots: vis === "public" ? undefined : { index: false, follow: false },
    alternates: { canonical: `/c/${card.cardId}` },
    openGraph: vis === "public" ? { title: `${name} — ${card.styleName} · ${BRAND}`, description: desc, type: "article" } : undefined,
  };
}

export default async function CardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const card = getCard(cardId);
  if (!card) notFound();
  const vis = visibilityOf(card);
  if (vis === "private" || vis === "deleted") {
    return (
      <main className="card-page">
        <header className="card-page-header"><BrandMark light /></header>
        <section className="card-panel">
          <span className="eyebrow">REGISTERED EDITION</span>
          <h1>This card is registered with {BRAND}.</h1>
          <p>The owner has kept this page private.</p>
        </section>
      </main>
    );
  }

  const style = styleByName(card.styleName);
  const sport = sportByCode(card.sportCode);
  const stats = (card.stats && card.stats.length ? card.stats : [{ label: "PPG", value: card.ppg }, { label: "APG", value: card.apg }, { label: "RPG", value: card.rpg }]).filter((s) => s.value);
  const showNumber = showsJerseyNumber(card);
  const identity = [showNumber ? `#${card.jerseyNumber}` : null, card.position, card.team, card.season].filter(Boolean).join(" · ");
  const isSenior = style?.code === "SR";
  const channel = channelOf(card);
  const etsySku = `GDE-${card.sportCode}-${isSenior ? "SNSET-PRINT" : "CARD-P12"}`;

  return (
    <main className="card-page">
      <header className="card-page-header"><BrandMark light /><span className="pill pill-outline">REGISTERED EDITION</span></header>

      <section className="card-hero">
        {card.isFictional && <FictionalLabel />}
        <p className="card-meta">{sport?.name ?? card.sportCode} · {card.styleName}</p>
        <h1>{card.firstName} {card.lastName}</h1>
        <p className="card-identity">{identity}</p>
        {stats.length > 0 && (
          <div className="stat-row">
            {stats.map((s) => (
              <div className="stat-chip" key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>
            ))}
          </div>
        )}
        {card.playerHighlight && <p className="card-highlight">{card.playerHighlight}</p>}
      </section>

      <section className="edition-panel" aria-label="Edition details">
        <div><span>Edition ID</span><strong>{card.cardId}</strong></div>
        <div><span>Finish</span><strong>{card.styleName}</strong></div>
        <div><span>Sport</span><strong>{sport?.name ?? card.sportCode}</strong></div>
        <div><span>Season</span><strong>{card.season}</strong></div>
        <div><span>Registered</span><strong>{registeredDate(card)}</strong></div>
        {isSenior && <div><span>Edition</span><strong>Senior edition · 1 of 1</strong></div>}
        <p className="edition-note">One registered edition per athlete, per finish, per season. Physical cards are not individually numbered; the sealed pack is 18 cards — 4 holographic chase, 14 standard. Artwork is generated with AI tools from the athlete's photos and finished by a person.</p>
      </section>

      <section className="card-actions">
        <a className="button" href={`/go/etsy/${etsySku}`}>{channel === "site" || channel === "etsy" ? "Order another edition on Etsy" : "Get yours on Etsy"}</a>
        <Link className="text-link-light" href="/registry">What is a registered edition?</Link>
      </section>

      <footer className="card-page-footer">
        {vis === "unlisted" ? (
          <p>This page is unlisted: it opens only from the card's QR code or exact ID, and search engines are asked not to index it.</p>
        ) : card.isFictional ? (
          <p>Public demo edition. The athlete is fictional; the artwork shows the finish.</p>
        ) : (
          <p>Public — shared with the guardian's permission.</p>
        )}
        <p>To unlist, make public or delete a page, or to report this card: <Link href="/contact">contact us</Link> with the card ID.</p>
      </footer>
    </main>
  );
}
