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
import { HERO_H1, HERO_SECONDARY, HERO_STORY_SUMMARY, HERO_SUBHEAD, Hero, sceneChips, sportFromAlt, storyScenes, styleFromAlt } from "../app/(marketing)/_home/Hero";
import { STORY_BEATS, STORY_LABELS } from "../app/(marketing)/_home/HeroStory";
import { HeroStrip, stripCells } from "../app/(marketing)/_home/HeroStrip";
import { Occasions } from "../app/(marketing)/_home/Occasions";
import { Photos } from "../app/(marketing)/_home/Photos";
import { Process } from "../app/(marketing)/_home/Process";
import { ProofBand } from "../app/(marketing)/_home/ProofBand";
import { GALLERY_SPORTS, ProofWall } from "../app/(marketing)/_home/ProofWall";
import { Registered } from "../app/(marketing)/_home/Registered";
import { HOME_INDEXED_SECTIONS, HOME_SECTION_COUNT, sectionIndex } from "../app/(marketing)/_home/Section";
import { Sports } from "../app/(marketing)/_home/Sports";
import { metadata } from "../app/(marketing)/page";
import { SITE_ASSETS, hasAsset } from "../lib/assets";
import { CHIPS, LEAD_TIMES } from "../lib/catalog/delivery";
import { formatUsd, fromPrice } from "../lib/catalog/prices";
import { sports } from "../lib/catalog/sports";
import { finishes, styles } from "../lib/catalog/styles";
import { getCard, registeredAtOf } from "../lib/registry/cards";
import { CANON } from "../lib/copy/canon";
import { CTA_LABELS, ctaFor } from "../lib/cta";
import { formatEt } from "../lib/capacity";
import { publishedReviews } from "../lib/reviews";
import { TRUE_COUNT_LINKS } from "../lib/catalog/tiers";
import { TrueNumbers } from "../components/TrueNumbers";
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

/** What page.tsx mounts, in source order: the twelve sections plus the hero's own strip. */
const PAGE_COMPONENTS = ["Hero", "HeroStrip", ...SECTION_ORDER.slice(1)] as const;

const SECTIONS: { name: (typeof SECTION_ORDER)[number] | "HeroStrip"; html: string }[] = [
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
  // The strip is part of section 01 (it carries the numbers the hero used to), not a fourteenth
  // section. It is appended LAST so every SECTIONS[n] index above keeps its meaning.
  { name: "HeroStrip", html: renderToStaticMarkup(createElement(HeroStrip, { now: NOW })) },
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
  it("renders the twelve sections of DESIGN §5.1 in order, with the hero strip under section 01", () => {
    const source = read(PAGE_FILE);
    const rendered = [...source.matchAll(/<([A-Z][A-Za-z]*)[\s/>]/g)].map((m) => m[1]);
    expect(rendered).toEqual([...PAGE_COMPONENTS]);
  });

  it("counts 01 … 11 with no gap: the spine numbers what it actually prints", () => {
    // The counter used to read "02 / 13 … 12 / 13" — it began at 02, ended at 12 and promised a 13
    // nobody ever sees (the hero carries no index and the footer is the layout's). On a page whose
    // pitch is that everything is counted, the counter has to count (owner review 2026-09-07).
    expect(HOME_SECTION_COUNT).toBe(HOME_INDEXED_SECTIONS.length);
    for (let at = 1; at <= HOME_SECTION_COUNT; at += 1) {
      const index = `${String(at).padStart(2, "0")} / ${HOME_SECTION_COUNT}`;
      expect(PAGE_HTML, `missing section index ${index}`).toContain(index);
    }
    expect(PAGE_HTML, "the spine still promises a section it never prints").not.toContain(`/ ${HOME_SECTION_COUNT + 1}`);
    // The anchor ids do NOT move with the printed index: the hero links #s-08 and /registry is #s-05.
    expect(HOME_INDEXED_SECTIONS).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(PAGE_HTML).toContain('id="s-08"');
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
    // The hero carries no price now (owner review): the one above-the-fold figure is the strip's.
    expect(text(SECTIONS[0].html)).not.toMatch(/\$\d/);
    expect(PAGE_TEXT).toMatch(/from \$\d+\.\d\d/);
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

  it("makes one delivery claim per block — the strip above the fold, the standard chips in the closing CTA", () => {
    expect(PAGE_TEXT).not.toContain(CHIPS.seniorNight.split(" · ")[0]);
    // The hero itself makes none: the owner asked for the clock to move below the headline.
    for (const chip of CHIPS.standard.split(" · ")) {
      expect(text(SECTIONS[0].html)).not.toContain(chip);
      expect(count(PAGE_TEXT, `>${chip}<`)).toBe(1);
    }
  });
});

describe("home — the 2026-09-07 design review", () => {
  it("§07 falls to two columns under 480 px and every tile IS the card — no plate, no dead ground", () => {
    const src = read(path.join(HOME_DIR, "Sports.tsx"));
    expect(src).toContain("grid-cols-2");
    expect(src).toContain("min-[480px]:grid-cols-3");
    expect(src).not.toContain("aspect-[4/5]");
    // The plate is gone (it held a 120 px card in a 191 px box); the card floats in its own 5 : 7 box,
    // and the two sports with no export use that same box (owner review 2026-09-07).
    expect(src).not.toContain("<Mat");
    expect(src).not.toContain("aspect-[500/527]");
    expect(SECTIONS[6].html).toContain("aspect-[5/7]");
    expect(count(SECTIONS[6].html, "aspect-[5/7]")).toBe(sports.length);
    // The back line is printed only where it differs from the rule the subhead states.
    const numbered = sports.filter((s) => s.numbered && s.hasBackNumber);
    expect(numbered.length).toBeGreaterThan(1);
    expect(count(text(SECTIONS[6].html), ">their number<")).toBe(0);
    expect(text(SECTIONS[6].html)).toContain("plain back");
  });

  it("§06 says SIX over six tiles, and the seventh style stands on its own", () => {
    // The heading said SIX over a row of SEVEN, and the seventh tile — the only one with a pill — sat
    // 44 px off the row's baseline (owner review 2026-09-07). Senior Night is an occasion, not a
    // finish: it is its own item under the row now.
    expect(SECTIONS[5].html).toContain("min-h-[2.6em]");
    expect(count(SECTIONS[5].html, "min-h-[2.6em]")).toBe(finishes.length);
    expect(finishes).toHaveLength(6);
    expect(text(SECTIONS[5].html)).toContain("SIX FINISHES. ONE ATHLETE.");
    expect(text(SECTIONS[5].html)).toContain("SENIOR NIGHT EDITION");
    // Six tiles in the row, three columns from md up — never seven across a 167 px grid.
    expect(SECTIONS[5].html).toContain("md:grid-cols-3");
    expect(SECTIONS[5].html).not.toContain("grid-cols-7");
    // No plate under the art: the face floats on the page's own stock (DESIGN §4.5 as revised).
    expect(read(path.join(HOME_DIR, "Finishes.tsx"))).not.toContain("<Mat");
  });

  it("§11 rules left like every other section — no centred rule, no centred index", () => {
    const src = read(path.join(HOME_DIR, "Founder.tsx"));
    expect(src).not.toContain('align="center"');
    expect(SECTIONS[10].html).not.toContain("justify-center");
    expect(SECTIONS[10].html).toContain(sectionIndex(11));
  });

  it("§10 gives the rejected pair the widest column of the three", () => {
    const src = read(path.join(HOME_DIR, "ProofWall.tsx"));
    expect(src).toContain("lg:col-span-5");
    expect(src).not.toMatch(/lg:col-span-4">\s*<BlockTitle>\{PAIR_TITLE\}/);
  });
});

/**
 * The third owner review of 2026-09-07, in substance: "in many places the blocks have fallen in
 * wrongly — everything is too crammed. It must be much cleaner and stronger." What that meant, block
 * by block, was measured at 1440 and at 390 and is recorded in docs/f1/INTEGRATION-NOTES.md
 * "fix-C-home"; these are the invariants of the fixes.
 */
describe("home — the third design review (blocks, rhythm, targets)", () => {
  const src = (file: string): string => read(path.join(HOME_DIR, file));

  it("spends the air INSIDE the blocks: 96 px between bands, never 128", () => {
    const section = src("Section.tsx");
    expect(section).toContain("py-12 md:py-20 lg:py-24");
    expect(section).not.toContain("lg:py-32");
    // Nothing inside a block opens at less than 24 px any more.
    for (const file of ["Families.tsx", "Finishes.tsx", "Sports.tsx", "Process.tsx", "ProofWall.tsx", "Occasions.tsx"]) {
      expect(src(file), `${file} still opens its content at mt-8 or less`).toMatch(/mt-10|mt-12/);
    }
  });

  it("§04 puts its pill on the rule row, where every other section's pill sits", () => {
    expect(src("ProofBand.tsx")).toContain("rail={<Pill tone=\"accent\">");
    const html = SECTIONS[3].html;
    expect(text(html).indexOf("YOU SEE IT FIRST")).toBeLessThan(text(html).indexOf("NOTHING PRINTS UNTIL YOU SAY SO."));
  });

  it("§05 runs the lookup full width under the row — the card column can no longer end 300 px early", () => {
    const html = SECTIONS[4].html;
    expect(html.indexOf('action="/registry/lookup"')).toBeGreaterThan(html.indexOf("GDE-SN-BKB-2026-12"));
    expect(html).toContain("border-t border-hairline pt-8");
    // And the card floats: a dark card on a dark 8 % mat filled 74 % of its plate.
    expect(src("Registered.tsx")).not.toContain("<Mat");
  });

  it("§08 draws its three exhibits at one height and stacks the verdict's keys", () => {
    const process = src("Process.tsx");
    expect(process).toContain("items-stretch");
    expect(process).not.toContain("items-start");
    expect(count(process, "fill>")).toBe(3);
    expect(process).toContain("<Ledger\n            stacked");
  });

  it("§10 shows four editions you can read, stacks the pair on a phone and credits the group once", () => {
    expect(GALLERY_SPORTS).toHaveLength(4);
    const pair = read(path.join(process.cwd(), "components", "ProofRejectedPair.tsx"));
    expect(pair).toContain("flex-col");
    expect(pair).toContain("md:flex-row");
    // One C13 in the section: the pair carries it for everything on the wall.
    expect(count(text(SECTIONS[9].html), CANON.fictionalLabel)).toBe(1);
    expect(text(SECTIONS[9].html)).toContain(CANON.galleryCaption);
  });

  it("§12 reads image → heading → sentence → caption → CTA, with ONE filled button", () => {
    const html = SECTIONS[11].html;
    const t = text(html);
    const h3 = t.indexOf("ONE LAST HOME GAME.");
    const caption = t.indexOf("A family on the court with the framed poster");
    if (caption >= 0) expect(h3).toBeLessThan(caption);
    expect(t.indexOf("A gold senior edition")).toBeLessThan(caption >= 0 ? caption : t.length);
    // The senior night is the offer; the team plate is a quiet link. The second filled button is the
    // page's own closing CTA.
    expect(count(html, "bg-accent text-ink")).toBe(2);
  });

  it("every tap target in this page's own chrome is 44 px", () => {
    expect(src("Section.tsx")).toContain("min-h-11");
    expect(src("Section.tsx")).not.toContain("min-h-6");
    expect(read(path.join(process.cwd(), "components", "SiteFooter.tsx"))).toContain("min-h-11");
    expect(read(path.join(process.cwd(), "components", "FourFears.tsx"))).toContain("min-h-11");
  });

  it("the footer's true numbers are all numbers, on one baseline, and never underlined", () => {
    for (const item of TRUE_COUNT_LINKS) {
      expect(item.numeral, `${item.label} carries no figure`).toBe(true);
      expect(item.figure, `${item.figure} is not a figure`).toMatch(/\d/);
    }
    const html = renderToStaticMarkup(createElement(TrueNumbers, { tone: "arena" }));
    // One fixed-height figure row per cell → the sentences under them start at one height.
    expect(count(html, "flex h-8 items-end md:h-11")).toBe(TRUE_COUNT_LINKS.length);
    // The hover underline belongs to the sentence, never to the numeral.
    expect(html).not.toMatch(/<a [^>]*hover:underline/);
    expect(count(html, "group-hover:underline")).toBe(TRUE_COUNT_LINKS.length);
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

/**
 * Owner review 2026-09-07: the product tiles were three flat renders of one basketball athlete, and
 * the occasions row had a team block with no picture at all. §03 and §12 now read a real-life
 * photograph out of the site map where one exists — and where one does not, they fall back to a
 * render or to text, never to an empty frame.
 */
describe("home — real life, and more than one athlete", () => {
  const familiesSrc = read(path.join(HOME_DIR, "Families.tsx"));
  const occasionsSrc = read(path.join(HOME_DIR, "Occasions.tsx"));
  const familiesHtml = SECTIONS[2].html;
  const occasionsHtml = SECTIONS[11].html;

  /** The first verified key of a preference list — the same choice the section makes. */
  const resolved = (keys: string[]): string | null => keys.find((k) => hasAsset(k)) ?? null;

  it("reads every life-photograph key through hasAsset, so a key the map has not landed cannot throw", () => {
    for (const src of [familiesSrc, occasionsSrc]) {
      expect(src).toContain("hasAsset");
      expect(src).not.toContain('asset("life.');
      expect(src).not.toContain('assetOrNull("life.');
    }
  });

  it("§03 gives each of the three tiles an image — a photograph where the map has one", () => {
    // One <article> per family, and not one of them is an empty box.
    const articles = familiesHtml.split("<article").slice(1);
    expect(articles).toHaveLength(3);
    for (const article of articles) expect(article).toContain("<img");
    for (const keys of [
      ["life.card.desk", "life.card.case", "life.card.binder", "life.card.hand"],
      ["life.poster.room.wide", "life.poster.room", "life.poster.room.baseball"],
      ["life.set.printed", "life.set.deluxe"],
    ]) {
      const key = resolved(keys);
      if (key) expect(imageSources(familiesHtml), key).toContain(SITE_ASSETS[key].out);
    }
  });

  it("§03 falls back to three different athletes, never the same one three times", () => {
    // Cheerleading pair · the basketball room · the football poster with its own card front.
    if (!resolved(["life.card.desk", "life.card.case", "life.card.binder", "life.card.hand"])) {
      expect(familiesSrc).toContain('asset("cards.cheer.front")');
      expect(familiesSrc).toContain('asset("cards.cheer.back")');
    }
    if (!resolved(["life.set.printed", "life.set.deluxe"])) {
      expect(familiesSrc).toContain('asset("posters.finish.FS")');
      expect(familiesSrc).toContain('asset("sport.football.front")');
    }
    expect(familiesSrc).toContain('asset("posters.room")');
  });

  it("§12 shows the senior-night moment and the team's order, each captioned by what is in it", () => {
    const senior = resolved(["life.gift.moment"]);
    const team = resolved(["life.team.order", "life.team.order.baseball"]);
    const srcs = imageSources(occasionsHtml);
    if (senior) {
      expect(srcs).toContain(SITE_ASSETS[senior].out);
      expect(text(occasionsHtml)).toContain("A family on the court with the framed poster, at a senior night ceremony.");
    } else {
      // The senior plate keeps the baseball card render rather than losing its media.
      expect(srcs).toContain(SITE_ASSETS["sn.sport.baseball.front"].out);
    }
    if (team) {
      expect(srcs).toContain(SITE_ASSETS[team].out);
      expect(text(occasionsHtml)).toContain("A team's order staged on a table: posters, shipping tubes, stacks of cards and the box they ship in.");
    }
    // No photograph on either plate: no reserved empty frame is left behind.
    if (!senior && !team) expect(occasionsHtml).not.toContain("<figure");
  });
});

// ---------------------------------------------------------------------------------------------
// §01 · the hero (second owner review, 2026-09-07). His words, in substance: the sliders are messy,
// the grey plate behind them is wrong, one photo is not how the edition is really made, "look up a
// card" is not the most important thing to offer, and the price and the delivery clock belong lower
// down. The hero must seduce. Four groups: the message, the story, the strip, the alignment.
// ---------------------------------------------------------------------------------------------
describe("home §01 — one message, one button", () => {
  const heroHtml = SECTIONS[0].html;
  const t = text(heroHtml);

  it("says the H1, the subhead and nothing else — no claims, no price, no chips, no trust line", () => {
    expect(t).toContain(HERO_H1);
    expect(t).toContain(HERO_SUBHEAD);
    expect(t.indexOf(HERO_H1)).toBeLessThan(t.indexOf(HERO_SUBHEAD));
    for (const gone of ["FROM YOUR PHOTOS", "REGISTERED EDITION", CANON.trustLine.split(" · ")[0], "printed set", "digital ·"]) {
      expect(t, `${gone} is still in the hero`).not.toContain(gone);
    }
    expect(heroHtml, "the delivery chips are still in the hero").not.toContain('aria-label="Delivery times"');
  });

  it("offers ONE primary action and one quiet link to the proof — never a second offer", () => {
    const { primary, secondary } = ctaFor("home");
    expect(t).toContain(primary.label);
    expect(secondary?.label).toBe(CTA_LABELS.lookUpACard);
    expect(t, "the registry lookup is still competing with the order button").not.toContain(CTA_LABELS.lookUpACard);
    expect(t).toContain(HERO_SECONDARY.label);
    // The quiet link is a text link to §08, not a button: no button geometry anywhere near it.
    expect(heroHtml).toContain(`href="${HERO_SECONDARY.href}"`);
    expect(HERO_SECONDARY.href).toBe("#s-08");
    // One filled button, and the quiet link wears no button geometry at all.
    expect(count(heroHtml, "bg-accent text-ink")).toBe(1);
    const link = new RegExp(`<a href="${HERO_SECONDARY.href}" class="([^"]*)"`).exec(heroHtml);
    expect(link).not.toBeNull();
    expect(link![1]).not.toMatch(/rounded|border|bg-/);
  });

  it("keeps the accent for the one button and the one registry mark per scene", () => {
    const scenes = storyScenes();
    const ticks = heroHtml.match(/<span aria-hidden="true" class="inline-block h-3 w-\[3px\] shrink-0 bg-accent"><\/span>/g) ?? [];
    expect(ticks.length).toBe(scenes.filter((s) => s.registered).length);
    expect(heroHtml).not.toContain("text-accent");
  });
});

describe("home §01 — the story", () => {
  const heroHtml = SECTIONS[0].html;
  const heroSrc = read(path.join(HOME_DIR, "Hero.tsx"));
  const scenes = storyScenes();

  it("builds only from scenes that are complete, and always has at least one", () => {
    expect(scenes.length).toBeGreaterThanOrEqual(1);
    expect(scenes.length).toBeLessThanOrEqual(3);
    for (const s of scenes) {
      expect(s.deck.length).toBeGreaterThanOrEqual(1);
      expect(s.deck.length).toBeLessThanOrEqual(4);
      for (const photo of s.deck) expect(photo.src).toMatch(/^\/images\//);
      expect(s.front.src).toMatch(/^\/images\//);
    }
    expect(count(heroHtml, 'data-story-scene=""')).toBe(scenes.length);
  });

  it("deals the athlete's OWN photos — every one of them, never a stand-in from another scene", () => {
    // The owner's complaint: "why do we show it is made from ONE photo when in reality it is from more".
    // Whatever the manifest has landed (1 while the deck keys are built, up to 4 after), all of it is dealt.
    const dealt = count(heroHtml, 'data-story-part="photo"');
    expect(dealt).toBe(scenes.reduce((n, s) => n + s.deck.length, 0));
    expect(count(heroHtml, "object-cover")).toBe(dealt);
    // One hand per scene: four fan positions, four pile positions, four turns 150 ms apart.
    expect(heroSrc).toContain('"--deal-delay"');
    expect(heroSrc).toMatch(/delay: "0ms".*\n.*delay: "150ms".*\n.*delay: "300ms".*\n.*delay: "450ms"/);
  });

  it("floats — the grey plate the owner asked about is gone, and nothing replaced it", () => {
    expect(heroSrc).not.toContain("bg-hairline");
    expect(heroSrc).not.toContain("<Mat");
    expect(heroSrc).not.toContain("<Plate");
    expect(heroHtml).not.toContain("bg-hairline");
    // What holds the composition together instead: the shadow every object already carries.
    expect(heroHtml).toContain("shadow-[var(--shadow-card-stock)]");
  });

  it("reports the real steps beside the art, in the order they happen", () => {
    for (const scene of scenes) {
      const chips = sceneChips(scene);
      expect(chips[0]).toBe(`${scene.deck.length} photo${scene.deck.length === 1 ? "" : "s"} in`);
      expect(chips[1]).toBe("Reference plate locked");
      expect(chips[2]).toBe("Proof approved");
      for (const chip of chips) expect(text(heroHtml)).toContain(chip);
    }
    expect(count(heroHtml, 'data-story-chips=""')).toBe(scenes.length);
  });

  it("reads the registration date out of the registry — a date typed here would go stale", () => {
    expect(heroSrc).toContain("registeredAtOf");
    expect(heroSrc, "a registration date is written into the hero").not.toMatch(/"20\d\d-\d\d-\d\d"/);
    const marcus = getCard("GDE-SN-BKB-2026-12");
    expect(marcus).toBeDefined();
    const scene = scenes.find((s) => s.sport?.slug === "basketball");
    if (scene?.registered) {
      expect(scene.registered).toBe(`Registered · ${formatEt(registeredAtOf(marcus!), "medium")}`);
      expect(text(heroHtml)).toContain(scene.registered);
    }
  });

  it("labels each scene with its sport and its finish, both read off the asset's own alt line", () => {
    expect(styleFromAlt("Custom softball trading card front — Senior Night finish")?.code).toBe("SR");
    expect(styleFromAlt("Custom basketball trading card front — Stadium Night finish")?.code).toBe("SN");
    expect(styleFromAlt("A phone photo of nothing in particular")).toBeUndefined();
    for (const s of scenes) {
      if (s.sport && s.style) expect(text(heroHtml)).toContain(`${s.sport.name} · ${s.style.name}`);
    }
  });

  it("names an unknown key rather than rendering an empty box", () => {
    // `hero.story.<n>.before.<i>` may not be in the manifest yet; resolving must not throw and must
    // not produce a src-less <img>. Every rendered image is a real, verified output.
    for (const img of heroHtml.split("<img").slice(1)) {
      const tag = img.slice(0, img.indexOf(">"));
      expect(tag).toContain("src=");
      expect(tag).toContain("sizes=");
      expect(tag).not.toContain('src=""');
    }
  });

  it("reads the sport off the COPY §0.5 alt line", () => {
    expect(sportFromAlt("Custom basketball trading card front — Stadium Night finish")?.slug).toBe("basketball");
    expect(sportFromAlt("Custom ice hockey trading card front — Stadium Night finish")?.slug).toBe("ice-hockey");
    expect(sportFromAlt("Custom baseball trading card front — Heritage finish")?.slug).toBe("baseball");
    expect(sportFromAlt("Custom softball trading card front — Senior Night finish")?.slug).toBe("softball");
    expect(sportFromAlt("A phone photo of nothing in particular")).toBeUndefined();
  });

  it("captions every scene with its sport and the canon example line, in one fixed-height row", () => {
    const t = text(heroHtml);
    for (const s of scenes) {
      if (s.sport) expect(t).toContain(`${s.sport.name} · ${CANON.galleryCaptionShort}`);
    }
    // One box, one height: a longer athlete name can never resize the column.
    expect(heroHtml).toContain('class="relative mt-3 h-[2.8em] overflow-hidden"');
  });

  it("stacks every scene in ONE box, so no scene change can shift the page", () => {
    expect(count(heroHtml, 'data-story-scene="" data-state')).toBe(scenes.length);
    expect(count(heroHtml, 'data-story-scene="" data-state="active"')).toBe(1);
    expect(count(heroHtml, 'class="absolute inset-0"')).toBeGreaterThanOrEqual(scenes.length);
    expect(heroHtml).toMatch(/aspect-\[4\/3\][^"]*sm:aspect-\[7\/5\]/);
  });

  it("renders complete and still on the server — the correct static hero, front face up", () => {
    // No JS, or reduced motion: `still` is the phase, so globals.css animates nothing and hides nothing.
    expect(heroHtml).toContain('data-phase="still"');
    expect(heroHtml).not.toContain('data-phase="deal"');
    expect(heroHtml).not.toContain("<video");
  });

  it("gives the whole narration ONE accessible name and announces no frame of its own", () => {
    expect(text(heroHtml)).toContain(`role="img" aria-label="${HERO_STORY_SUMMARY}"`);
    expect(HERO_STORY_SUMMARY).toContain(CANON.fictionalLabel);
    expect(count(heroHtml, 'role="img"')).toBe(1);
    expect(heroHtml).not.toContain("aria-live");
  });

  it("puts every card face through CardFace — 5:7, radius 0, contained, never cropped or scaled", () => {
    expect(heroSrc).not.toMatch(/scale-\[/);
    expect(heroSrc).not.toContain("mask");
    expect(heroSrc).toMatch(/<CardFace \{\.\.\.scene\.front\}/);
    expect(heroHtml).toContain("aspect-[5/7]");
  });

  it("runs five beats and reuses the signature flip — same keyframes, same curve, one duration token", () => {
    expect(STORY_BEATS.map((b) => b.phase)).toEqual(["deal", "gather", "build", "flip", "hold"]);
    const css = read(path.join(process.cwd(), "app", "globals.css"));
    expect(css).toContain("--duration-flip-story: 1600ms;");
    expect(css).toContain("animation: card-flip var(--duration-flip-story) var(--ease-flip) both;");
    // No second motion language: the story defines no keyframes of its own.
    expect(css.match(/@keyframes/g)?.length).toBe(3);
    // Each chip is gated on the beat that makes it true, in CSS — no per-frame JavaScript.
    for (const [phase, n] of [["gather", 1], ["build", 2], ["flip", 3], ["hold", 4]] as const) {
      expect(css).toContain(`[data-story][data-phase="${phase}"] [data-story-scene][data-state="active"] [data-story-chips] > :nth-child(-n + ${n})`);
    }
    if (scenes.some((s) => s.back)) expect(heroHtml).toContain('data-story-flip=""');
  });

  it("offers a keyboard-reachable pause and one dot per scene, every control 44 px", () => {
    if (scenes.length < 2) return;
    expect(heroHtml).toContain(`aria-label="${STORY_LABELS.pause}"`);
    for (const s of scenes) {
      if (s.sport) expect(heroHtml).toContain(`aria-label="${STORY_LABELS.show(s.sport.name.toLowerCase())}"`);
    }
    expect(count(heroHtml, "h-11 w-11")).toBe(scenes.length + 1);
    expect(heroHtml).not.toContain('tabindex="-1"');
  });
});

describe("home §01b — the strip under the hero is the catalog, never typed", () => {
  const stripHtml = SECTIONS[12].html;
  const stripSrc = read(path.join(HOME_DIR, "HeroStrip.tsx"));

  it("prints the from-price, both delivery clocks and the catalog counts", () => {
    const cells = stripCells(NOW);
    expect(cells).toHaveLength(4);
    expect(cells[0].figure).toBe(`from ${formatUsd(fromPrice("cards", NOW))}`);
    expect(cells[1].figure).toBe(`${LEAD_TIMES.digitalBusinessDays[0]}–${LEAD_TIMES.digitalBusinessDays[1]} days`);
    expect(cells[1].label).toContain(`${LEAD_TIMES.printShipBusinessDays[0]}–${LEAD_TIMES.printShipBusinessDays[1]}`);
    expect(cells[2].figure).toBe(`${sports.length} sports · ${finishes.length} finishes`);
    expect(cells[3].figure).toBe("Proof first");
    for (const cell of cells) {
      expect(text(stripHtml)).toContain(cell.figure);
      expect(text(stripHtml)).toContain(cell.label);
    }
    // Six finishes is what §06 says; the seventh style is the Senior Night occasion, named as one.
    expect(finishes.length).toBe(styles.length - 1);
    // Nothing in the strip is typed: the figures are the ladder, the delivery table and the catalogs.
    expect(stripSrc).not.toMatch(/\$\d/);
    for (const source of ["fromPrice", "LEAD_TIMES", "sports.length", "finishes.length"]) expect(stripSrc).toContain(source);
  });

  it("is one ruled band aligned to the gallery container, 2 × 2 on a phone", () => {
    expect(stripHtml).toContain("container-gallery");
    expect(stripHtml).toContain("grid-cols-2");
    expect(stripHtml).toContain("lg:grid-cols-4");
    expect(count(stripHtml, "border-t border-hairline")).toBe(4);
    expect(stripHtml).toContain("font-display");
  });

  it("ends the hero's CTA block with the trust line (C14), as DESIGN §4.3 requires", () => {
    for (const segment of CANON.trustLine.split(" · ")) expect(text(stripHtml)).toContain(segment);
  });
});

describe("home §01 — the two columns are one row", () => {
  it("stretches both columns and gives the art the wider track", () => {
    const src = read(path.join(HOME_DIR, "Hero.tsx"));
    expect(src).toContain("lg:items-stretch");
    expect(src).not.toContain("lg:items-center");
    expect(src).toContain("lg:col-span-5");
    expect(src).toContain("lg:col-span-7");
    // Nothing between the story and the page: no plate, no padding, no radius.
    expect(src).toMatch(/className="lg:h-full"/);
  });
});
