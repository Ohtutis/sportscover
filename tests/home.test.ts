// `/` — the brand home (CONTRACTS §5.2, DESIGN §5.1, COPY §2.1). The section components are
// synchronous server components, so they render with renderToStaticMarkup exactly like components/.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LookupStatus } from "../components/LookupForm";
import { Families } from "../app/(marketing)/_home/Families";
import { Fears } from "../app/(marketing)/_home/Fears";
import { Finishes } from "../app/(marketing)/_home/Finishes";
import { Founder } from "../app/(marketing)/_home/Founder";
import { Hero } from "../app/(marketing)/_home/Hero";
import { Occasions } from "../app/(marketing)/_home/Occasions";
import { Photos } from "../app/(marketing)/_home/Photos";
import { Process } from "../app/(marketing)/_home/Process";
import { ProofBand } from "../app/(marketing)/_home/ProofBand";
import { ProofWall } from "../app/(marketing)/_home/ProofWall";
import { Registered } from "../app/(marketing)/_home/Registered";
import { Sports } from "../app/(marketing)/_home/Sports";
import { metadata } from "../app/(marketing)/page";
import { SITE_ASSETS } from "../lib/assets";
import { CHIPS } from "../lib/catalog/delivery";
import { sports } from "../lib/catalog/sports";
import { styles } from "../lib/catalog/styles";
import { CANON } from "../lib/copy/canon";
import { publishedReviews } from "../lib/reviews";
import { PAGES } from "../lib/seo/titles";

const NOW = new Date("2026-09-07T12:00:00-04:00");

const HOME_DIR = path.join(process.cwd(), "app", "(marketing)", "_home");
const PAGE_FILE = path.join(process.cwd(), "app", "(marketing)", "page.tsx");
const OG_FILE = path.join(process.cwd(), "app", "(marketing)", "opengraph-image.tsx");

const read = (file: string): string => fs.readFileSync(file, "utf8");
const homeFiles = fs.readdirSync(HOME_DIR).map((f) => path.join(HOME_DIR, f));
const ownedFiles = [PAGE_FILE, OG_FILE, ...homeFiles];

/** The twelve rendered sections in DESIGN §5.1 order (13 is the layout's footer). */
const SECTION_ORDER = [
  "Hero",
  "Fears",
  "Families",
  "ProofBand",
  "Registered",
  "Finishes",
  "Sports",
  "Process",
  "Photos",
  "ProofWall",
  "Founder",
  "Occasions",
] as const;

const SECTIONS: { name: (typeof SECTION_ORDER)[number]; html: string }[] = [
  { name: "Hero", html: renderToStaticMarkup(createElement(Hero, { now: NOW })) },
  { name: "Fears", html: renderToStaticMarkup(createElement(Fears)) },
  { name: "Families", html: renderToStaticMarkup(createElement(Families, { now: NOW })) },
  { name: "ProofBand", html: renderToStaticMarkup(createElement(ProofBand)) },
  { name: "Registered", html: renderToStaticMarkup(createElement(Registered, {})) },
  { name: "Finishes", html: renderToStaticMarkup(createElement(Finishes)) },
  { name: "Sports", html: renderToStaticMarkup(createElement(Sports)) },
  { name: "Process", html: renderToStaticMarkup(createElement(Process)) },
  { name: "Photos", html: renderToStaticMarkup(createElement(Photos)) },
  { name: "ProofWall", html: renderToStaticMarkup(createElement(ProofWall)) },
  { name: "Founder", html: renderToStaticMarkup(createElement(Founder)) },
  { name: "Occasions", html: renderToStaticMarkup(createElement(Occasions, { now: NOW })) },
];

/** renderToStaticMarkup escapes text; compare against the copy as it was written. */
const text = (html: string): string =>
  html
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** next/image rewrites every src through the loader — read the public path back out of `url=`. */
const imageSources = (html: string): string[] =>
  [...html.matchAll(/[?&]url=([^&"]+)/g)].map((m) => decodeURIComponent(m[1])).filter((s) => s.startsWith("/images/"));

const PAGE_HTML = SECTIONS.map((s) => s.html).join("\n");
const PAGE_TEXT = text(PAGE_HTML);

const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

/** Every SITE_ASSETS output path that depicts a fictional athlete. */
const FICTIONAL_OUTS = new Set(
  Object.values(SITE_ASSETS)
    .filter((a) => a.fictional && a.out)
    .map((a) => a.out),
);

describe("home — metadata", () => {
  it("comes from PAGES['/'] through pageMeta", () => {
    const page = PAGES["/"];
    expect(page).toBeDefined();
    expect(metadata.title).toEqual({ absolute: page.title });
    expect(metadata.description).toBe(page.description);
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph?.url).toBe("/");
  });

  it("the page is ISR (the sale and the season windows move without a deploy)", () => {
    expect(read(PAGE_FILE)).toMatch(/export const revalidate = 3600;/);
  });
});

describe("home — section order", () => {
  it("renders the twelve sections of DESIGN §5.1 in order", () => {
    const source = read(PAGE_FILE);
    const rendered = [...source.matchAll(/<([A-Z][A-Za-z]*)[\s/>]/g)].map((m) => m[1]);
    expect(rendered).toEqual([...SECTION_ORDER]);
  });

  it("numbers the sections 01 / 13 … 12 / 13", () => {
    for (let n = 1; n <= 12; n += 1) {
      const index = `${String(n).padStart(2, "0")} / 13`;
      if (n === 1) continue; // the hero opens on the H1, with no rule and no index (DESIGN §5.1-01)
      expect(PAGE_HTML, `missing section index ${index}`).toContain(index);
    }
  });

  it("has exactly one h1 and twelve section landmarks", () => {
    expect(count(PAGE_HTML, "<h1")).toBe(1);
    expect(count(PAGE_HTML, "<section aria-labelledby") + count(PAGE_HTML, 'id="registry" aria-labelledby')).toBeGreaterThanOrEqual(11);
  });
});

describe("home — truth lint", () => {
  it("never writes a price literal (prices come from lib/catalog/prices.ts)", () => {
    for (const file of ownedFiles) {
      expect(read(file), `${path.relative(process.cwd(), file)} contains a $<digits> literal`).not.toMatch(/\$\d/);
    }
  });

  it("renders prices through formatUsd all the same", () => {
    expect(PAGE_TEXT).toMatch(/from \$\d+\.\d\d digital · \$\d+\.\d\d printed set/);
  });

  it("says nothing the ban list forbids", () => {
    for (const re of [/\byouth\b/i, /\binstant(ly)?\b/i, /rounded corners/i, /\bvintage\b/i, /\bpdf\b/i, /\b(10|22|25) cards\b/i, /18\s*\+\s*4/]) {
      expect(PAGE_TEXT, `forbidden: ${re}`).not.toMatch(re);
    }
  });

  it("renders no review or star claim while no review has consent", () => {
    expect(publishedReviews()).toHaveLength(0);
    for (const re of [/\b(customer|verified|real|5-star) reviews?\b/i, /\breviews?\b(?!ed)/i, /\d(\.\d)? ?stars\b/i, /\bcoming soon\b/i]) {
      expect(PAGE_TEXT, `review claim: ${re}`).not.toMatch(re);
    }
  });
});

describe("home — fictional labels", () => {
  it("labels every group that shows a fictional athlete (GAPS #30)", () => {
    let groups = 0;
    for (const section of SECTIONS) {
      const shows = imageSources(section.html).some((src) => FICTIONAL_OUTS.has(src));
      const labels = count(text(section.html), CANON.fictionalLabel);
      if (shows) {
        groups += 1;
        expect(labels, `${section.name} shows a fictional athlete and carries no C13`).toBeGreaterThanOrEqual(1);
      }
    }
    expect(groups).toBeGreaterThanOrEqual(6);
    expect(count(PAGE_TEXT, CANON.fictionalLabel)).toBeGreaterThanOrEqual(groups);
  });

  it("shows no image that is not in the manifest", () => {
    const srcs = imageSources(PAGE_HTML);
    const known = new Set(Object.values(SITE_ASSETS).map((a) => a.out));
    for (const src of srcs) expect(known, `${src} is not a SITE_ASSETS output`).toContain(src);
    expect(new Set(srcs).size).toBeGreaterThan(20);
  });
});

describe("home — performance budget", () => {
  it("preloads no hero image and plays no video", () => {
    // The hero art is `hidden sm:block`, and `priority` preloads regardless of CSS: it cost 35 KB of
    // top-priority bandwidth on a phone for pixels the phone never paints. The mobile LCP is the
    // headline, so nothing here is preloaded.
    const priorities = ownedFiles.reduce((n, f) => n + count(read(f), "priority"), 0);
    expect(priorities).toBe(0);
    expect(PAGE_HTML).not.toContain('rel="preload" as="image"');
    expect(PAGE_HTML).not.toContain("<video");
    expect(PAGE_HTML).not.toContain("autoplay");
  });

  it("gives every image a sizes attribute", () => {
    for (const img of PAGE_HTML.split("<img").slice(1)) {
      const tag = img.slice(0, img.indexOf(">"));
      expect(tag, `an <img> without sizes: ${tag.slice(0, 120)}`).toContain("sizes=");
    }
  });

  it("makes one delivery claim — the standard chips, same wording in the hero and the closing CTA", () => {
    expect(PAGE_TEXT).not.toContain(CHIPS.seniorNight.split(" · ")[0]);
    for (const chip of CHIPS.standard.split(" · ")) expect(count(PAGE_TEXT, `>${chip}<`)).toBe(2);
  });
});

describe("home — the 2026-09-07 design review", () => {
  it("§07 falls to two columns under 480 px and the mat hugs the 5 : 7 card (no letterbox bars)", () => {
    const src = read(path.join(HOME_DIR, "Sports.tsx"));
    expect(src).toContain("grid-cols-2");
    expect(src).toContain("min-[480px]:grid-cols-3");
    expect(src).not.toContain("aspect-[4/5]");
    expect(SECTIONS[6].html).toContain("aspect-[500/527]");
  });

  it("§06 reserves the finish name two lines, so the material lines align across the row", () => {
    expect(SECTIONS[5].html).toContain("min-h-[2.6em]");
    // One name element per tile — the two identical branches of the old ternary are gone.
    expect(count(SECTIONS[5].html, "min-h-[2.6em]")).toBe(styles.length);
  });

  it("§11 rules left like every other section — no centred rule, no centred index", () => {
    const src = read(path.join(HOME_DIR, "Founder.tsx"));
    expect(src).not.toContain('align="center"');
    expect(SECTIONS[10].html).not.toContain("justify-center");
    expect(SECTIONS[10].html).toContain("11 / 13");
  });

  it("§10 gives the rejected pair the widest column of the three", () => {
    const src = read(path.join(HOME_DIR, "ProofWall.tsx"));
    expect(src).toContain("lg:col-span-5");
    expect(src).not.toMatch(/lg:col-span-4">\s*<BlockTitle>\{PAIR_TITLE\}/);
  });
});

describe("home — the catalog is the source of truth", () => {
  it("shows all seventeen sports with the right back line", () => {
    expect(sports).toHaveLength(17);
    for (const sport of sports) expect(text(SECTIONS[6].html), `${sport.slug} tile missing`).toContain(sport.name);
    // The five numberless sports never carry a number, in copy or in alt text.
    expect(text(SECTIONS[6].html)).not.toMatch(/(cheerleading|gymnastics|swimming|tennis|golf)[^<]*#\d/i);
  });

  it("shows the six finishes plus Senior Night, named in Space Grotesk (no SVG labels, GAPS #15)", () => {
    for (const style of styles.filter((s) => !s.isOccasion)) expect(text(SECTIONS[5].html)).toContain(style.name);
    expect(text(SECTIONS[5].html)).toContain("SENIOR NIGHT EDITION");
    expect(SECTIONS[5].html).not.toContain("label-");
  });

  it("uses the registry demo card for the edition panel", () => {
    expect(text(SECTIONS[4].html)).toContain("GDE-SN-BKB-2026-12");
    expect(text(SECTIONS[4].html)).toContain("Example edition · Fictional athlete");
    expect(text(SECTIONS[4].html)).not.toContain("Verified");
  });

  it("posts the inline lookup to /registry/lookup and renders the miss string on a miss", () => {
    expect(SECTIONS[4].html).toContain('action="/registry/lookup"');
    // The miss line is a client island (LookupMiss) so `/` still prerenders; test the line itself.
    const missed = renderToStaticMarkup(createElement(LookupStatus, { miss: "1" }));
    expect(text(missed)).toContain("No card is registered under that ID.");
  });

  it("carries the canon sentences verbatim", () => {
    for (const line of [CANON.registeredIdLine, CANON.numberlessLine, CANON.galleryCaption, CANON.weAreNewShort]) {
      expect(PAGE_TEXT).toContain(line);
    }
  });
});
