// The one metadata table every page reads (CONTRACTS §4.3, COPY §3, GAPS #24). tests assert the
// lengths here — ≤ 60 characters for the rendered <title> (head phrase + TITLE_SUFFIX, or the
// absolute string) and ≤ 155 for the description — so no page file ever invents a title.
// F2/F3 rows exist so lib/seo/intents.ts can map every keyword to a table key; only `phase: "F1"`
// rows reach the sitemap, and never a pattern row (`[segment]` paths — /blog/[slug] is F1, its posts
// reach the sitemap through lib/blog.ts; /sports/[sport] and /senior-night/[sport] are F1 since
// 2026-10-06 and reach it through lib/seo/sport-facts.ts and lib/seo/senior-night-facts.ts, which also
// carry each page's real title and description — the pattern rows here only let matchesPagePath() and
// the intents resolve them). Pattern rows ({Sport}, {Finish}) are measured with the longest name
// substituted (Cheerleading, Signature Spotlight). The banned words of COPY §0.4 never appear here.

import { INTAKE_COPY, INTAKE_PATH, INTAKE_THANKS_PATH, PROOF_CLOCK } from "../intake/copy";
import { PHOTO_RULES } from "../intake/types";

export type Phase = "F1" | "F2" | "F3";

export interface PageMeta {
  path: string;
  /** Head phrase; the root template appends TITLE_SUFFIX unless `absolute` is set. */
  title: string;
  description: string;
  phase: Phase;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  noindex?: boolean;
  /** The title is complete as written — the root template does not append the suffix (GAPS #24). */
  absolute?: boolean;
}

export const TITLE_SUFFIX = " | Game Day Edition";
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

const page = (p: PageMeta): [string, PageMeta] => [p.path, p];

/**
 * The free-proof rows take their words from the page's own copy (lib/intake/copy.ts) when those words
 * fit this table's limits, and the measured line beside them when they do not. On 2026-10-04 they did
 * not: INTAKE_COPY.title renders 61 characters with the suffix, the description is 178 and the thanks
 * title 68 — so the fallbacks ship until the copy is trimmed, and then the copy takes over by itself.
 */
const fitTitle = (copy: string, fallback: string): string => (copy.length + TITLE_SUFFIX.length <= TITLE_MAX ? copy : fallback);
const fitDescription = (copy: string, fallback: string): string => (copy.length <= DESCRIPTION_MAX ? copy : fallback);

export const PAGES: Record<string, PageMeta> = Object.fromEntries([
  page({
    path: "/",
    title: "Game Day Edition — Custom Sports Trading Cards & Posters",
    absolute: true,
    description:
      "Custom sports trading cards and posters from your photos. One registered edition per athlete; you approve a proof before anything prints.",
    phase: "F1",
    priority: 1,
    changeFrequency: "weekly",
  }),
  page({
    path: "/trading-cards",
    title: "Custom Trading Cards From Your Photos",
    description:
      "Custom trading cards composed around your athlete: front and back, square-cut, UV-coated, a registered card ID on the back. Built for them.",
    phase: "F1",
    priority: 0.9,
    changeFrequency: "weekly",
  }),
  page({
    path: "/posters",
    title: "Custom Sports Posters From Your Photos",
    description:
      "Custom sports posters composed around your athlete, in two print sizes at 300 DPI. Art for the wall, built for one athlete; the stats live on the card.",
    phase: "F1",
    priority: 0.9,
    changeFrequency: "weekly",
  }),
  page({
    path: "/complete-set",
    title: "Sports Poster and Trading Card Set",
    description:
      "The complete edition from your photos: poster, card front and back, certificate, flip video, wallpapers and the card's own page. Counted, not implied.",
    phase: "F1",
    priority: 0.9,
    changeFrequency: "weekly",
  }),
  page({
    path: "/senior-night",
    title: "Senior Night Gift: Poster & Card Set",
    description:
      "A senior night gift built from your athlete's photos: a gold senior edition with class year, career line and senior quote. Files a week before the night.",
    phase: "F1",
    priority: 0.9,
    changeFrequency: "weekly",
  }),
  page({
    path: "/how-it-works",
    title: "How Custom Trading Cards Are Made",
    description:
      "Six checks between your photos and the print: photos, uniform, reference set, four shots, verification, proof. Made by a person; AI is a tool.",
    phase: "F1",
    priority: 0.7,
    changeFrequency: "monthly",
  }),
  page({
    path: "/guarantee",
    title: "Our Promise: Proof First, Refund in Full",
    description:
      "You approve a proof before anything is finalized; if we can't get there, every cent back. Shipping by package, the refund ladder, what new means for you.",
    phase: "F1",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
  page({
    path: "/photo-guide",
    title: "What Photos to Send for a Custom Card",
    description:
      "The nine things the photo check looks for — face size, angles, kit, eyes, who's closest to the camera. Send 4–10; we tell you before any art is made.",
    phase: "F1",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
  page({
    path: "/about",
    title: "About the Independent Custom Card Studio",
    description:
      "Who is asking for your athlete's photos: a designer in Lithuania, three professional labs in the US, and a registry that keeps each card's page five years.",
    phase: "F1",
    priority: 0.5,
    changeFrequency: "monthly",
  }),
  page({
    path: "/registry",
    title: "Look Up a Registered Card",
    description:
      "Type the registered card ID from the back of any Game Day Edition card or certificate to open its page — the edition, the finish, the season.",
    phase: "F1",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
  page({
    path: "/faq",
    title: "FAQ — Custom Cards, Photos, Delivery",
    description:
      "Every question we are asked, in one place: products, photos, sports without numbers, timing, AI, privacy, refunds, Etsy or here, teams and the registry.",
    phase: "F1",
    priority: 0.5,
    changeFrequency: "monthly",
  }),
  page({
    path: "/contact",
    title: "Contact",
    description: "How to reach Game Day Edition about an order, a card page, a team or your athlete's photos.",
    phase: "F1",
    priority: 0.3,
    changeFrequency: "yearly",
  }),
  page({
    path: "/accessibility",
    title: "Accessibility Statement",
    description:
      "Game Day Edition builds to WCAG 2.2 AA — keyboard, screen readers, reduced motion, real alt text. How to tell us when something is hard to use.",
    phase: "F1",
    priority: 0.2,
    changeFrequency: "yearly",
  }),
  page({
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "What we collect to make your athlete's edition, who processes it, how long we keep it, and what we never do with it. Written for the parent of a minor.",
    phase: "F1",
    priority: 0.2,
    changeFrequency: "yearly",
  }),
  page({
    path: "/privacy/biometric",
    title: "Biometric Data Policy",
    description:
      "Our written policy for the likeness check: what is measured, why, with whose consent, who can access it, and when it is destroyed.",
    phase: "F1",
    priority: 0.2,
    changeFrequency: "yearly",
  }),
  // D29 (owner, 2026-10-04) — the free-proof request is the site's conversion and the Meta ads land here.
  page({
    path: INTAKE_PATH,
    title: fitTitle(INTAKE_COPY.title, "Free Proof First — Pay If You Love It"),
    description: fitDescription(
      INTAKE_COPY.description,
      `Send ${PHOTO_RULES.min}–${PHOTO_RULES.max} photos and see a watermarked proof of your athlete's cards, poster, banner or blanket, free within ${PROOF_CLOCK}. Pay only if you love it.`,
    ),
    phase: "F1",
    priority: 0.9,
    changeFrequency: "monthly",
  }),
  page({
    path: INTAKE_THANKS_PATH,
    title: fitTitle(INTAKE_COPY.thanks.title, "Photos Received"),
    description: fitDescription(
      INTAKE_COPY.thanks.lead,
      `Your photos arrived. We check them first, then email your free watermarked proof within ${PROOF_CLOCK}. Nothing to pay now.`,
    ),
    phase: "F1",
    priority: 0.1,
    changeFrequency: "yearly",
    // A confirmation page: never indexed, never in the sitemap (next.config.ts NOINDEX_SOURCES too).
    noindex: true,
  }),
  // The blog (spec §4.12; built 2026-10-04 in app/(marketing)/blog). The index row carries the same
  // words as lib/blog.ts BLOG_INDEX, which the page falls back to when this row is missing.
  page({
    path: "/blog",
    title: "Blog: Guides for Sports Parents",
    description:
      "Plain answers for sports parents: what photos to send, how a custom card is made, the free proof, senior night planning and the card registry.",
    phase: "F1",
    priority: 0.5,
    changeFrequency: "weekly",
  }),
  page({
    path: "/blog/[slug]",
    // Pattern row: every post's own title and description come from lib/blog.ts (postMetadata), and its
    // sitemap row from blogPages(). This row only lets matchesPagePath() and the intents resolve a post.
    title: "Guide for Sports Parents",
    description: "A plain answer for sports parents from Game Day Edition — photos, proofs, senior night, gifts and the card registry.",
    phase: "F1",
    priority: 0.5,
    changeFrequency: "monthly",
  }),
  page({
    path: "/terms",
    title: "Terms of Service",
    description:
      "The terms for custom editions: licence, approvals, cancellation and refunds, delivery dates, the registered card page and its five-year pledge.",
    phase: "F1",
    priority: 0.2,
    changeFrequency: "yearly",
  }),
  // --- The SEO pages built 2026-10-06 (docs/SEO-PLAN-GDE-2026-10.md §4). The two pattern rows are
  // resolved per sport by their fact tables; the concrete pages read their own title/description there.
  page({
    path: "/senior-night/[sport]",
    // COPY §3: "Poster & " is trimmed when the sport name pushes the title past 60.
    title: "{Sport} Senior Night Gift: Card Set",
    description:
      "{Sport} senior night gift from your athlete's photos — a gold senior edition card and poster. Add the date; we schedule the proof against it.",
    phase: "F1",
    priority: 0.8,
    changeFrequency: "weekly",
  }),
  page({
    path: "/christmas-gift",
    title: "Christmas Gift: Custom Poster & Card Set",
    description:
      "A Christmas gift built from your athlete's photos: poster, card front and back and the card's own registered page. Order-by dates for under the tree.",
    phase: "F1",
    priority: 0.7,
    changeFrequency: "weekly",
  }),
  page({
    path: "/teams",
    title: "End-of-Season Team Gifts: One Setup",
    description:
      "One team setup for the end of the season: you set the crest, the colors and the deadline once; every family orders and pays for their own athlete.",
    phase: "F1",
    priority: 0.7,
    changeFrequency: "monthly",
  }),
  page({
    path: "/banners",
    title: "Custom Sports Banners From Your Photos",
    description:
      "A custom sports banner built from your athlete's photos — printed vinyl at 1 × 2, 2 × 4 or 3 × 6 ft, or the full-size file. A free watermarked proof first.",
    phase: "F1",
    priority: 0.8,
    changeFrequency: "weekly",
  }),
  page({
    path: "/sports",
    title: "Custom Cards & Posters by Sport",
    description:
      "All seventeen sports, one studio: which sports get a jersey number on the card, which get a name and crest, and each sport's own page where it has one.",
    phase: "F1",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
  page({
    path: "/sports/[sport]",
    title: "Custom {Sport} Cards & Posters",
    description: "Custom {sport} trading cards and posters from your photos — front and back, registered card ID, proof before print.",
    phase: "F1",
    priority: 0.8,
    changeFrequency: "weekly",
  }),
  // --- F2 / F3 routes: table keys for lib/seo/intents.ts; not built, not in the sitemap ---
  page({
    path: "/order/new",
    title: "Start an Order",
    description: "Start a custom edition: choose the package, the sport and the finish, then send 4–10 photos of your athlete.",
    phase: "F2",
    priority: 0.5,
    changeFrequency: "monthly",
    noindex: true,
  }),
  page({
    path: "/styles/[finish]",
    title: "The {Finish} Finish",
    description: "The {Finish} finish for custom trading cards and posters — what the material does and what the layout keeps.",
    phase: "F3",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
]);

/** The <title> the browser shows for a table entry. */
export function fullTitle(meta: PageMeta): string {
  return meta.absolute ? meta.title : `${meta.title}${TITLE_SUFFIX}`;
}

/** The longest names a pattern row can carry — the length test measures pattern titles with these. */
export const LONGEST_SUBSTITUTIONS = { "{Sport}": "Cheerleading", "{sport}": "cheerleading", "{Finish}": "Signature Spotlight" } as const;

/** A pattern title / description with the longest real names substituted. */
export function substituteLongest(text: string): string {
  return Object.entries(LONGEST_SUBSTITUTIONS).reduce((s, [token, value]) => s.split(token).join(value), text);
}

export function pageFor(path: string): PageMeta {
  const meta = PAGES[path];
  if (!meta) throw new Error(`titles: "${path}" is not in PAGES — add the row before building the page`);
  return meta;
}

/** Routes that reach the sitemap: built in F1, indexable, and a real path (a `[segment]` row never is). */
export const f1Pages = (): PageMeta[] => Object.values(PAGES).filter((p) => p.phase === "F1" && !p.noindex && !p.path.includes("["));

/** Whether a concrete path matches a table key, with `[sport]` / `[finish]` segments allowed. */
export function matchesPagePath(path: string): boolean {
  if (PAGES[path]) return true;
  return Object.keys(PAGES).some((key) => {
    if (!key.includes("[")) return false;
    const re = new RegExp(`^${key.replace(/\[[^\]]+\]/g, "[a-z0-9-]+")}$`);
    return re.test(path);
  });
}

/** The 404 title head phrase (COPY §3). */
export const NOT_FOUND_TITLE = "Not Found";
