// The sitemap is generated from five tables and nothing else: `lib/seo/titles.ts` (every page that is
// built in F1 and indexable — never a `[segment]` pattern row), `lib/seo/sport-facts.ts` (one row per
// sport page), `lib/seo/senior-night-facts.ts` (one row per senior-night spoke), `lib/blog.ts` (one row
// per published post) and `lib/registry/cards.ts` (every PUBLIC card page). lastmod is only ever a date
// a table carries for a real content change — a page with no history has no lastmod (master plan §6). Unlisted, private and deleted cards never
// appear here — an unlisted page is meant to be reachable only from the QR on the card it belongs to,
// and a sitemap entry would publish the whole list (CONTRACTS §6.2). `/free-proof` is an F1 row;
// `/free-proof/thanks` is noindex and stays out.

import type { MetadataRoute } from "next";
import { blogPages } from "../lib/blog";
import { publicCards, updatedAtOf } from "../lib/registry/cards";
import { seniorNightPages } from "../lib/seo/senior-night-facts";
import { sportPages } from "../lib/seo/sport-facts";
import { f1Pages, PAGES } from "../lib/seo/titles";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = f1Pages().map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const sportRow = PAGES["/sports/[sport]"];
  const sportsRows: MetadataRoute.Sitemap = sportPages().map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(`${p.lastModified}T00:00:00Z`),
    changeFrequency: sportRow.changeFrequency,
    priority: sportRow.priority,
  }));

  const spokeRow = PAGES["/senior-night/[sport]"];
  const spokes: MetadataRoute.Sitemap = seniorNightPages().map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(`${p.lastModified}T00:00:00Z`),
    changeFrequency: spokeRow.changeFrequency,
    priority: spokeRow.priority,
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

  return [...pages, ...sportsRows, ...spokes, ...posts, ...cards];
}
