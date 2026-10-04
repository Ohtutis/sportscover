// /llms.txt (llmstxt.org): what Game Day Edition is, the pages that answer the questions people ask,
// and every blog post — so a language model that reads the site quotes it correctly. Nothing here is
// written for this file: the summary is TAGLINE plus canon sentences (content/blocks, lib/copy/canon.ts,
// lib/intake/copy.ts, lib/catalog), the page lines are the lib/seo/titles.ts rows (first sentence of each
// description), the blog lines are lib/blog.ts. URLs are always the canonical www origin, never the
// host a preview happens to run on. Static, regenerated hourly.
//
// Only Next's route exports live in this file (Next type-checks a route module's exports); the test
// reads the text through GET().

import { block } from "../../lib/blocks";
import { postPath, posts } from "../../lib/blog";
import { SHIPPING_SENTENCE } from "../../lib/catalog/delivery";
import { TRUE_COUNTS } from "../../lib/catalog/tiers";
import { CANON } from "../../lib/copy/canon";
import { INTAKE_COPY, INTAKE_PATH } from "../../lib/intake/copy";
import { PAGES } from "../../lib/seo/titles";
import { BRAND, CANONICAL_ORIGIN, TAGLINE } from "../../lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

/** The marketing pages, in the order a parent meets them. */
const KEY_PAGES = [
  "/",
  INTAKE_PATH,
  "/trading-cards",
  "/posters",
  "/complete-set",
  "/senior-night",
  "/how-it-works",
  "/guarantee",
  "/photo-guide",
  "/registry",
  "/faq",
  "/about",
] as const;

/** The free-proof row until lib/seo/titles.ts carries one: the page's own title and description. */
const FALLBACK: Record<string, { title: string; description: string }> = {
  [INTAKE_PATH]: { title: INTAKE_COPY.title, description: INTAKE_COPY.description },
};

const firstSentence = (text: string): string => text.split(/(?<=[.!?])\s+(?=[A-Z0-9])/)[0];
const url = (path: string): string => `${CANONICAL_ORIGIN}${path}`;

export function GET() {
  const summary = [
    block("independent-studio"),
    CANON.weAreNewShort.split(/(?<=\.)\s+/).slice(0, 2).join(" "),
    `${TRUE_COUNTS[0]}, ${TRUE_COUNTS[1]}.`,
    INTAKE_COPY.subhead,
    CANON.registeredIdLine,
    CANON.aiActLine,
    SHIPPING_SENTENCE,
  ].join(" ");

  const pages = KEY_PAGES.flatMap((path) => {
    const row = PAGES[path] ?? FALLBACK[path];
    return row ? [`- [${row.title}](${url(path)}): ${firstSentence(row.description)}`] : [];
  });

  const blog = posts.map((post) => `- [${post.title}](${url(postPath(post))}): ${post.description}`);

  const text = [`# ${BRAND}`, "", `> ${TAGLINE}.`, "", summary, "", "## Pages", "", ...pages, "", "## Blog", "", ...blog, ""].join("\n");

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
