// Next Metadata from the titles table (CONTRACTS §4.3, §6.1). Canonical and OG URLs are RELATIVE —
// the root layout's metadataBase resolves them to the www origin; nothing here builds an absolute URL.

import type { Metadata } from "next";
import { sportByCode } from "../catalog/sports";
import { styleByName } from "../catalog/styles";
import { visibilityOf, type CardRecord } from "../registry/cards";
import { fullTitle, NOT_FOUND_TITLE, pageFor } from "./titles";

export interface PageMetaExtra {
  images?: string[];
  type?: "website" | "article";
}

const NOINDEX: Metadata["robots"] = { index: false, follow: false };

/** Metadata for a route in PAGES. Throws when the path is missing from the table. */
export function pageMeta(path: string, extra?: PageMetaExtra): Metadata {
  const meta = pageFor(path);
  return {
    title: meta.absolute ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title: fullTitle(meta),
      description: meta.description,
      type: extra?.type ?? "website",
      images: extra?.images ?? ["/og.webp"],
    },
    ...(meta.noindex ? { robots: NOINDEX } : {}),
  };
}

/** The share text / OG title of a card page by visibility (COPY §2.15 (5), §3). */
export function cardTitle(card: CardRecord): string {
  const finish = styleByName(card.styleName)?.name ?? card.styleName;
  const vis = visibilityOf(card);
  if (vis === "public") return `${card.firstName} ${card.lastName} · ${finish} — Registered Edition`;
  if (vis === "unlisted") return `${finish} — Registered Edition`;
  return "Registered Edition";
}

/**
 * /c metadata per visibility (CONTRACTS §6.2). Public: absolute title with the name; unlisted: the
 * finish only, noindex; private / deleted: a neutral title, noindex. The OG image comes from the
 * route's opengraph-image file, so no `images` here.
 */
export function cardMeta(card: CardRecord): Metadata {
  const vis = visibilityOf(card);
  const finish = styleByName(card.styleName)?.name ?? card.styleName;
  const path = `/c/${card.cardId}`;
  const title = cardTitle(card);
  let description: string;
  if (vis === "public") {
    description = `${card.firstName} ${card.lastName}, ${card.team}, ${card.season} — a registered Game Day Edition card in the ${finish} finish.`;
  } else if (vis === "unlisted") {
    description = "A registered Game Day Edition trading card. This page is unlisted and opens from the card's QR code.";
  } else {
    description = "This card is registered with Game Day Edition.";
  }
  const absolute = vis === "public" || vis === "unlisted";
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title: absolute ? title : `${title} | Game Day Edition`, description, type: "website" },
    ...(vis === "public" ? {} : { robots: NOINDEX }),
  };
}

/** The sport name a card page prints in its meta line (never a number for a numberless sport — the page decides). */
export const cardSportName = (card: CardRecord): string => sportByCode(card.sportCode)?.name ?? card.sportCode;

export const notFoundMeta: Metadata = { title: NOT_FOUND_TITLE };
