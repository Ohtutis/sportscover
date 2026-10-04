// The blog's one table (master plan §7.5, spec §4.12): every post, newest first; the sitemap rows; the
// metadata a post route renders. A post is a TSX module under content/blog/<slug>.tsx exporting
// `post: BlogPost`; its body is written in the primitives of components/blog (no markdown library).
//
// Rules every post keeps (tested in tests/blog.test.ts): an H1 ending with a full stop; a <title> head
// phrase that stays ≤ 60 characters with the site suffix; a description ≤ 155; a category that is one
// of the 13 Pinterest boards (marketing/templates/BOARDS.md, verbatim); its primary page AND
// /how-it-works or /photo-guide linked inside the first 150 words; exactly one /free-proof CTA (the
// PostCta at the end); no price, no sale, no calendar date promising delivery, Etsy named at most once
// in the prose, and every fictional athlete labelled. Facts come from the canon (lib/copy/canon.ts,
// content/blocks, lib/catalog, lib/intake/copy.ts) — a post never invents one.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BRAND, OWNER_NAME } from "./site";
import { post as freeProofFirst } from "../content/blog/free-proof-first-how-ordering-works";
import { post as seniorNightFootball } from "../content/blog/senior-night-football-gift-ideas-poster-cards-banner-blanket";
import { post as seniorNightVolleyball } from "../content/blog/senior-night-volleyball-gifts-poster-ideas-timeline";
import { post as whatPhotos } from "../content/blog/what-photos-make-a-good-custom-sports-card";
import { post as howItIsMade } from "../content/blog/how-a-custom-sports-trading-card-is-made";
import { post as registeredEdition } from "../content/blog/what-is-a-registered-trading-card-edition";
import { post as posterOrCards } from "../content/blog/custom-sports-poster-or-trading-cards-which-to-choose";

export const BLOG_PATH = "/blog";

/** The 13 boards, exactly as marketing/templates/BOARDS.md names them — a post's category is one of these. */
export const BLOG_CATEGORIES = [
  "Senior Night Ideas",
  "Custom Sports Posters",
  "Trading Card Gift Ideas",
  "Sports Mom Gift Ideas",
  "Basketball Gift Ideas",
  "Football Gift Ideas",
  "Volleyball and Soccer Gifts",
  "Baseball and Softball Gifts",
  "Cheer and Dance Gifts",
  "Hockey and Lacrosse Gifts",
  "Wrestling and Track Gifts",
  "Swim Tennis and Golf Gifts",
  "End of Season Team Gifts",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export type BlogOccasion = "senior-night" | "christmas" | "end-of-season";

export interface BlogPost {
  slug: string;
  /** The <title> head phrase; the root template appends " | Game Day Edition" (≤ 60 in all). Title Case, no full stop. */
  title: string;
  /** The H1 — Anton uppercase, ends with a full stop, short enough for two lines (DESIGN §3). */
  h1: string;
  /** Meta description and the line under the post on /blog — ≤ 155 characters. */
  description: string;
  category: BlogCategory;
  /** Sport slug (lib/catalog/sports.ts) when the post is about one sport. */
  sport?: string;
  occasion?: BlogOccasion;
  /** The one money page the post links inside its first 150 words. */
  primaryPage: string;
  /** YYYY-MM-DD. */
  publishedAt: string;
  /** YYYY-MM-DD — set when a post is revised in place (spec §4.12: update, never duplicate). */
  updatedAt?: string;
  /** Rounded up from the prose word count at ~225 words a minute (tested). */
  readingMinutes: number;
  /** A lib/assets.ts key for the BlogPosting image. */
  image?: string;
  body: () => ReactNode;
}

/**
 * Registry order is the tie-break when two posts share a date — the newest-first sort below is stable,
 * so the order written here is the order /blog shows for posts published on the same day.
 */
const REGISTRY: BlogPost[] = [
  // The path every CTA on the site now opens (D29) leads the list…
  freeProofFirst,
  // …then the season (senior night is September–November and January–February, BOARDS.md)…
  seniorNightFootball,
  seniorNightVolleyball,
  // …then the evergreen trust posts the master plan puts first among the guides.
  whatPhotos,
  howItIsMade,
  registeredEdition,
  posterOrCards,
];

const lastModifiedOf = (p: BlogPost): string => p.updatedAt ?? p.publishedAt;

/** Every post, newest first (by publish date; registry order breaks a tie). */
export const posts: BlogPost[] = [...REGISTRY].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const postBySlug = (slug: string): BlogPost | undefined => posts.find((p) => p.slug === slug);

export const postPath = (p: Pick<BlogPost, "slug">): string => `${BLOG_PATH}/${p.slug}`;

/** One sitemap row per post (the /blog index itself is a row in lib/seo/titles.ts). */
export function blogPages(): { path: string; lastModified: string }[] {
  return posts.map((p) => ({ path: postPath(p), lastModified: lastModifiedOf(p) }));
}

/** "Oct 4, 2026" — a calendar date, read in UTC so the day never shifts with the server's zone. */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** The /blog index strings. The page prefers the lib/seo/titles.ts row when one exists. */
export const BLOG_INDEX = {
  title: "Blog: Guides for Sports Parents",
  h1: "GUIDES FOR SPORTS PARENTS.",
  standfirst: "Plain answers for sports parents: the photos to send, how a card is made, the free proof, senior night and the registry.",
  description:
    "Plain answers for sports parents: what photos to send, how a custom card is made, the free proof, senior night planning and the card registry.",
} as const;

/**
 * A post's metadata. Canonical and OG URLs are relative (the root layout's metadataBase resolves them);
 * the OG image comes from the route's opengraph-image file, so none is named here.
 */
export function postMetadata(post: BlogPost): Metadata {
  const path = postPath(post);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    authors: [{ name: OWNER_NAME, url: "/about" }],
    openGraph: {
      type: "article",
      url: path,
      title: `${post.title} | ${BRAND}`,
      description: post.description,
      siteName: BRAND,
      locale: "en_US",
      publishedTime: post.publishedAt,
      modifiedTime: lastModifiedOf(post),
      authors: [OWNER_NAME],
      section: post.category,
    },
  };
}
