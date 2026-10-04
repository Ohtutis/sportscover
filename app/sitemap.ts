// The sitemap is generated from three tables and nothing else: `lib/seo/titles.ts` (every page that is
// built in F1 and indexable — never a `[segment]` pattern row), `lib/blog.ts` (one row per published
// post) and `lib/registry/cards.ts` (every PUBLIC card page). Unlisted, private and deleted cards never
// appear here — an unlisted page is meant to be reachable only from the QR on the card it belongs to,
// and a sitemap entry would publish the whole list (CONTRACTS §6.2). `/free-proof` is an F1 row;
// `/free-proof/thanks` is noindex and stays out.

import type { MetadataRoute } from "next";
import { blogPages } from "../lib/blog";
import { publicCards, updatedAtOf } from "../lib/registry/cards";
import { f1Pages } from "../lib/seo/titles";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = f1Pages().map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const posts: MetadataRoute.Sitemap = blogPages().map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(`${p.lastModified}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const cards: MetadataRoute.Sitemap = publicCards().map((c) => ({
    url: `${SITE_URL}/c/${c.cardId}`,
    lastModified: new Date(updatedAtOf(c)),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...pages, ...posts, ...cards];
}
