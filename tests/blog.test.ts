// The blog (master plan §7.5–7.6, spec §4.12, builder E brief 2026-10-04): every post renders, keeps the
// internal-link rule (its primary page AND /how-it-works or /photo-guide inside the first 150 words, one
// money page there at most), carries exactly one /free-proof CTA, says nothing the truth lint forbids,
// labels every fictional athlete, and reaches the sitemap rows and /llms.txt.
import { describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PostArticle } from "../components/blog/PostArticle";
import { SITE_ASSETS } from "../lib/assets";
import {
  BLOG_CATEGORIES,
  BLOG_INDEX,
  BLOG_PATH,
  blogPages,
  formatPostDate,
  postBySlug,
  postMetadata,
  postPath,
  posts,
  type BlogPost,
} from "../lib/blog";
import { sportBySlug } from "../lib/catalog/sports";
import { CANON } from "../lib/copy/canon";
import { INTAKE_PATH } from "../lib/intake/copy";
import { getCard } from "../lib/registry/cards";
import { blogPosting } from "../lib/seo/jsonld";
import { BRAND, CANONICAL_ORIGIN, OWNER_NAME } from "../lib/site";

// node_modules -> node_modules.nosync (2026-10-04) takes the /node_modules/ segment out of the resolved
// path, so vitest stops externalizing next/image and hands a default import its CJS exports object
// ({ default, getImageProps }) instead of the component. Unwrap it here; the factory is a no-op when the
// default already is the component (vitest.config.ts `resolve.preserveSymlinks: true` is the real fix).
vi.mock("next/image", async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const d = mod.default as Record<string, unknown> | undefined;
  return { ...mod, default: d && typeof d === "object" && "default" in d && !("$$typeof" in d) ? d.default : d };
});

const ROOT = process.cwd();
const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), "utf8");

/* ---------- rendering helpers ---------- */

const render = (node: ReactNode): string => renderToStaticMarkup(node as ReactElement);
const bodyHtml = (post: BlogPost): string => render(post.body());
const articleHtml = (post: BlogPost): string => render(createElement(PostArticle, { post }));

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " " };
const decode = (s: string): string => s.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (m) => ENTITIES[m] ?? m);
const textOf = (html: string): string => decode(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const countWords = (text: string): number => text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

/** Every link in document order with the number of words of text that precede it. */
function linksWithPosition(html: string): { href: string; at: number }[] {
  const out: { href: string; at: number }[] = [];
  let words = 0;
  for (const m of html.matchAll(/<a\s[^>]*?href="([^"]*)"[^>]*>|<[^>]+>|([^<]+)/g)) {
    if (m[1] !== undefined) out.push({ href: decode(m[1]), at: words });
    else if (m[2]) words += countWords(decode(m[2]));
  }
  return out;
}

const pathOf = (href: string): string => href.split(/[?#]/)[0];
const hrefsTo = (html: string, target: string): string[] =>
  [...html.matchAll(/href="([^"]*)"/g)].map((m) => decode(m[1])).filter((href) => pathOf(href) === target);

/** The PostCta block, and the body without it (the prose a reader reads). */
function splitCta(html: string): { cta: string[]; prose: string } {
  const cta = [...html.matchAll(/<section data-post-cta=""[\s\S]*?<\/section>/g)].map((m) => m[0]);
  return { cta, prose: html.replace(/<section data-post-cta=""[\s\S]*?<\/section>/g, " ") };
}

/** The prose words a post is measured by: no CTA block, no captions. */
const proseWords = (post: BlogPost): number =>
  countWords(textOf(splitCta(bodyHtml(post)).prose.replace(/<figcaption[\s\S]*?<\/figcaption>/g, " ")));

/* ---------- the rules ---------- */

/** The money pages: at most one of them — the post's primary page — inside the first 150 words. */
const MONEY_PAGES = ["/trading-cards", "/posters", "/complete-set", "/senior-night", INTAKE_PATH];

/** tests/forbidden-strings.test.ts, copied (that file scans sources; this one scans the rendered posts). */
const FORBIDDEN: Array<[RegExp, string]> = [
  [/cover\s?moment/i, "old brand"],
  [/\binstant(ly)?\b/i, "'instant' anything"],
  [/\b25 cards\b/i, "25 cards"],
  [/18\s*\+\s*4/, "'18 + 4'"],
  [/rounded corners/i, "cards are square-cut"],
  [/free shipping worldwide/i, "US only"],
  [/\btopps\b|\bpanini\b|upper deck|graded slab/i, "competitor / slab comparison"],
  [/\bAI generator\b/i, "'AI generator' framing"],
  [/neon future|vintage/i, "dropped finish"],
  [/\bpdf\b/i, "deliverables are PNG only"],
  [/\bverified\b/i, "'Verified' — the registry says Registered (D9)"],
  [/\bnumbered\b/i, "cards carry a registered card ID, never 'numbered' (S10, D21)"],
  [/\b(customer|verified|real|5-star) reviews?\b|\b\d(\.\d)? ?stars\b|\b\d\.\d\/5\b/i, "review / star claim"],
  [/\b(10|22) (collectible )?cards\b/i, "pack is 18 cards total"],
  [/stripe/i, "provider name — 'secure payment link'"],
  [/(?<![-\w])16 ?pt\b(?![-\w])|semi-?gloss/i, "unconfirmed stock claim"],
  [/\bcheaper\b|same price on etsy/i, "Etsy comparison wording"],
  [/\byouth\b/i, "never the age word"],
  [/supabase|resend|printful|printify|bay photo|whcc|qpmn|vertex|gemini|nano banana/i, "provider name in copy"],
  [/30\s*[×x]\s*40/i, "the 30 × 40 size is not sold"],
  [/\bsale\b|% off|\bdiscount|\bcoupon/i, "no sale talk in an evergreen post"],
  [/\d\s?%/, "no percentages"],
  [/\bfamilies (love|say|told)|\d+\s+(families|parents|customers)\b/i, "no 'N families' / customer stories"],
  [/colour|favourite|centre\b|organis|\bgrey\b|practis|catalogue|licence|cheque/i, "US spelling"],
];

/** A calendar date in a post body is a delivery promise waiting to go stale (master plan §7.6). */
const DATE_PROMISE =
  /\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)\.?\s+\d{1,2}(st|nd|rd|th)?\b|\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b|\b20\d\d-\d\d-\d\d\b|\b(by|before|in time for)\s+(christmas|thanksgiving|the holidays|new year)/i;

/** BOARDS.md's table, first column — the 13 board names, as the source of truth. */
function boardNames(): string[] {
  return read("marketing/templates/BOARDS.md")
    .split("\n")
    .filter((line) => /^\|\s*[A-Z]/.test(line) && !/^\|\s*Board name/.test(line))
    .map((line) => line.split("|")[1].trim());
}

/* ---------- the registry ---------- */

describe("lib/blog — the table", () => {
  it("has the seven posts, unique kebab-case slugs, newest first", () => {
    expect(posts).toHaveLength(7);
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length);
    for (const p of posts) expect(p.slug, p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (let i = 1; i < posts.length; i++) expect(posts[i - 1].publishedAt >= posts[i].publishedAt).toBe(true);
    expect(postBySlug(posts[0].slug)).toBe(posts[0]);
    expect(postBySlug("no-such-post")).toBeUndefined();
  });

  it("the categories are BOARDS.md's 13 names, verbatim, and every post uses one", () => {
    const boards = boardNames();
    expect(boards).toHaveLength(13);
    expect([...BLOG_CATEGORIES].sort()).toEqual([...boards].sort());
    for (const p of posts) expect(boards, p.slug).toContain(p.category);
  });

  it("blogPages() is one sitemap row per post, with its last modification", () => {
    const rows = blogPages();
    expect(rows.map((r) => r.path)).toEqual(posts.map((p) => postPath(p)));
    for (const [i, row] of rows.entries()) {
      expect(row.path.startsWith(`${BLOG_PATH}/`)).toBe(true);
      expect(row.lastModified).toBe(posts[i].updatedAt ?? posts[i].publishedAt);
      expect(row.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(new Set(rows.map((r) => r.path)).size).toBe(rows.length);
  });

  it("dates are real calendar dates and print in US form", () => {
    for (const p of posts) {
      expect(Number.isNaN(Date.parse(`${p.publishedAt}T00:00:00Z`)), p.slug).toBe(false);
      if (p.updatedAt) expect(p.updatedAt >= p.publishedAt, p.slug).toBe(true);
    }
    expect(formatPostDate("2026-10-04")).toBe("Oct 4, 2026");
  });

  it("the sport and occasion fields name real things", () => {
    for (const p of posts) {
      if (p.sport) expect(sportBySlug(p.sport), p.slug).toBeTruthy();
      if (p.image) expect(SITE_ASSETS[p.image]?.status, p.slug).toBe("verified");
    }
    expect(posts.filter((p) => p.occasion === "senior-night").map((p) => p.sport).sort()).toEqual(["football", "volleyball"]);
  });
});

/* ---------- metadata ---------- */

describe("blog metadata", () => {
  for (const post of posts) {
    it(`${post.slug}: <title> ≤ 60 with the suffix, description ≤ 155, canonical, article`, () => {
      expect(`${post.title} | ${BRAND}`.length, post.title).toBeLessThanOrEqual(60);
      expect(post.title.endsWith(".")).toBe(false);
      expect(post.description.length, post.description).toBeLessThanOrEqual(155);
      expect(post.description.length).toBeGreaterThan(80);
      const meta = postMetadata(post);
      expect(meta.title).toBe(post.title);
      expect(meta.description).toBe(post.description);
      expect(meta.alternates?.canonical).toBe(postPath(post));
      expect((meta.openGraph as { type?: string }).type).toBe("article");
    });
  }

  it("the index strings fit the same limits", () => {
    expect(`${BLOG_INDEX.title} | ${BRAND}`.length).toBeLessThanOrEqual(60);
    expect(BLOG_INDEX.description.length).toBeLessThanOrEqual(155);
    expect(BLOG_INDEX.h1.endsWith(".")).toBe(true);
  });

  it("blogPosting(): BlogPosting by the founder, published by the brand", () => {
    const post = posts[0];
    const ld = blogPosting({
      title: post.title,
      description: post.description,
      path: postPath(post),
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      section: post.category,
    });
    expect(ld["@type"]).toBe("BlogPosting");
    expect((ld.author as { name: string }).name).toBe(OWNER_NAME);
    expect((ld.publisher as { name: string }).name).toBe(BRAND);
    expect(ld.headline).toBe(post.title);
  });
});

/* ---------- every post ---------- */

describe("blog posts — render, links, CTA, truth", () => {
  for (const post of posts) {
    describe(post.slug, () => {
      const body = bodyHtml(post);
      const article = articleHtml(post);
      const { cta, prose } = splitCta(body);
      const proseText = textOf(prose);

      it("renders with one H1 that ends with a full stop, and H2s that do too", () => {
        const h1s = [...article.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => textOf(m[1]));
        expect(h1s).toEqual([post.h1]);
        expect(post.h1.endsWith(".")).toBe(true);
        expect(post.h1.length, "two lines at the display size").toBeLessThanOrEqual(34);
        const h2s = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => textOf(m[1]));
        expect(h2s.length).toBeGreaterThanOrEqual(3);
        for (const h2 of h2s) expect(h2.endsWith("."), h2).toBe(true);
        expect(article).toContain(post.category);
        expect(article).toContain(OWNER_NAME);
        expect(article).toMatch(new RegExp(`datetime="${post.publishedAt}"`, "i"));
      });

      it("is 600–900 words of prose, and the reading time matches", () => {
        const words = proseWords(post);
        expect(words, `${words} words`).toBeGreaterThanOrEqual(600);
        expect(words, `${words} words`).toBeLessThanOrEqual(900);
        expect(post.readingMinutes, `${words} words`).toBe(Math.ceil(words / 225));
      });

      it("links its primary page and /how-it-works or /photo-guide inside the first 150 words — and no other money page", () => {
        const early = linksWithPosition(body).filter((l) => l.at < 150).map((l) => pathOf(l.href));
        expect(early, post.primaryPage).toContain(post.primaryPage);
        expect(early.some((p) => p === "/how-it-works" || p === "/photo-guide")).toBe(true);
        for (const p of early.filter((x) => MONEY_PAGES.includes(x))) expect(p).toBe(post.primaryPage);
      });

      it("carries exactly one /free-proof CTA, at the end, with the TrustLine under it", () => {
        expect(cta).toHaveLength(1);
        const ctaLinks = hrefsTo(cta[0], INTAKE_PATH);
        expect(ctaLinks).toHaveLength(1);
        expect(cta[0]).toContain("Never posted without your OK");
        // nothing after the CTA block
        expect(textOf(body.slice(body.indexOf("</section>", body.indexOf("data-post-cta")) + "</section>".length))).toBe("");
        // the prose links /free-proof only when it IS the primary page (the brief's one exception)
        expect(hrefsTo(prose, INTAKE_PATH)).toHaveLength(post.primaryPage === INTAKE_PATH ? 1 : 0);
        if (post.occasion === "senior-night") {
          expect(ctaLinks[0]).toContain("style=SR");
          expect(ctaLinks[0]).toContain(`sport=${post.sport}`);
        }
      });

      it("every internal link resolves to a page that exists (the free-proof form is builder A's, in flight)", () => {
        const internal = [...body.matchAll(/href="(\/[^"]*)"/g)].map((m) => pathOf(decode(m[1])));
        for (const p of internal) {
          if (p.startsWith("/go/etsy/")) continue;
          if (p.startsWith("/c/")) {
            expect(getCard(p.slice(3)), p).toBeTruthy();
            continue;
          }
          if (p === INTAKE_PATH) continue;
          expect(fs.existsSync(path.join(ROOT, "app/(marketing)", p, "page.tsx")), p).toBe(true);
        }
        expect(body).not.toContain('href="/banners');
      });

      it("says nothing the truth lint forbids — no price, no date promise, Etsy at most once", () => {
        const all = textOf(article);
        expect(article).not.toMatch(/\$\s?\d/);
        for (const [re, why] of FORBIDDEN) expect(all, why).not.toMatch(re);
        expect(proseText).not.toMatch(DATE_PROMISE);
        expect(proseText.match(/\betsy\b/gi)?.length ?? 0).toBeLessThanOrEqual(1);
        const numberless = !post.sport || !sportBySlug(post.sport)?.numbered;
        if (numberless) expect(proseText, "their number on a post that is not about a numbered sport").not.toMatch(/\btheir number\b/i);
      });

      it("labels every fictional athlete it shows", () => {
        const figures = [...body.matchAll(/<figure data-blog-figure=""[\s\S]*?<\/figure>/g)].map((m) => m[0]);
        const imgsInFigures = figures.reduce((n, f) => n + (f.match(/<img\s/g)?.length ?? 0), 0);
        expect(body.match(/<img\s/g)?.length ?? 0, "an image outside a Figure").toBe(imgsInFigures);
        expect(figures.length).toBeGreaterThan(0);
        for (const figure of figures) {
          const outs = [...figure.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => {
            const u = new URL(decode(m[1]), "http://local");
            return u.searchParams.get("url") ?? u.pathname;
          });
          expect(outs.length).toBeGreaterThan(0);
          const fictional = outs.some((out) => Object.values(SITE_ASSETS).some((a) => a.out === out && a.fictional));
          for (const out of outs) expect(Object.values(SITE_ASSETS).some((a) => a.out === out), out).toBe(true);
          if (fictional) expect(figure, "fictional athlete without C13").toContain(CANON.fictionalLabel);
        }
      });
    });
  }
});

/* ---------- the routes ---------- */

describe("blog routes", () => {
  it("/blog lists every post with its board, date and reading time", async () => {
    const { default: BlogIndexPage } = await import("../app/(marketing)/blog/page");
    const html = render(createElement(BlogIndexPage));
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain(BLOG_INDEX.h1);
    for (const post of posts) {
      expect(html).toContain(`href="${postPath(post)}"`);
      expect(html).toContain(post.h1);
      expect(html).toContain(`${post.readingMinutes} min read`);
    }
    expect(html).toContain("BreadcrumbList");
    expect(html).not.toMatch(/\$\s?\d/);
  });

  it("/blog/[slug] is static, and renders BlogPosting + BreadcrumbList", async () => {
    const mod = await import("../app/(marketing)/blog/[slug]/page");
    expect(mod.dynamicParams).toBe(false);
    expect(mod.generateStaticParams()).toEqual(posts.map((p) => ({ slug: p.slug })));
    for (const post of posts) {
      const meta = await mod.generateMetadata({ params: Promise.resolve({ slug: post.slug }) });
      expect(meta.title).toBe(post.title);
      const html = render(await mod.default({ params: Promise.resolve({ slug: post.slug }) }));
      expect(html).toContain('"@type":"BlogPosting"');
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain(`"headline":"${post.title}"`);
    }
  });

  it("the post share image is built on lib/og for every slug", async () => {
    const src = read("app/(marketing)/blog/[slug]/opengraph-image.tsx");
    for (const token of ["OgFrame", "loadGoogleFont", "OG_SIZE", "generateStaticParams"]) expect(src).toContain(token);
  });

  it("/llms.txt: plain text, cached an hour, the summary, the key pages and every post", async () => {
    const { GET } = await import("../app/llms.txt/route");
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("cache-control")).toContain("max-age=3600");
    const text = await res.text();
    expect(text.startsWith(`# ${BRAND}\n`)).toBe(true);
    expect(text).toContain("## Pages");
    expect(text).toContain("## Blog");
    for (const p of ["/free-proof", "/trading-cards", "/posters", "/complete-set", "/senior-night", "/how-it-works", "/guarantee", "/photo-guide", "/registry", "/faq", "/about"]) {
      expect(text, p).toContain(`](${CANONICAL_ORIGIN}${p}):`);
    }
    expect(text).toContain(`](${CANONICAL_ORIGIN}/):`);
    for (const post of posts) expect(text, post.slug).toContain(`- [${post.title}](${CANONICAL_ORIGIN}${postPath(post)}): ${post.description}`);
    expect(text).toContain(CANON.registeredIdLine);
    expect(text).not.toMatch(/\$\s?\d/);
    for (const [re, why] of FORBIDDEN) expect(text, why).not.toMatch(re);
    expect(text).not.toMatch(/localhost|vercel\.app/);
  });
});
