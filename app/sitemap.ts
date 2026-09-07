// The sitemap is generated from two tables and nothing else: `lib/seo/titles.ts` (every page that is
// built in F1 and indexable) and `lib/registry/cards.ts` (every PUBLIC card page). Unlisted, private
// and deleted cards never appear here — an unlisted page is meant to be reachable only from the QR on
// the card it belongs to, and a sitemap entry would publish the whole list (CONTRACTS §6.2).

import type { MetadataRoute } from "next";
import { publicCards, updatedAtOf } from "../lib/registry/cards";
import { f1Pages } from "../lib/seo/titles";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = f1Pages().map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const cards: MetadataRoute.Sitemap = publicCards().map((c) => ({
    url: `${SITE_URL}/c/${c.cardId}`,
    lastModified: new Date(updatedAtOf(c)),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...pages, ...cards];
}
