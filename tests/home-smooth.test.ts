// The 2026-09-08 "finished and smooth" round (fixer A — home, shared chrome, motion). Each test below
// is the invariant of one finding from the motion/interaction audit or the layout audit; the measured
// before/after numbers are in the round's report. Everything here is a source or static-render
// assertion — these are server components and thin client islands whose whole behaviour is in markup.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CardFlip, FLIP_ARIA, FLIP_LABELS } from "../components/CardFlip";
import { FlipSideSwitch } from "../components/FlipSideSwitch";
import { SiteFooter } from "../components/SiteFooter";
import { MobileMenu } from "../components/MobileMenu";
import { HEADER_LINKS, MOBILE_EXTRA_LINKS, FOOTER_COLUMNS } from "../lib/nav";

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const IMG = { src: "/images/cards/x.webp", alt: "Card front — fictional athlete", width: 750, height: 1050 };

describe("home story — pausing shows the product, and so does a dot pressed while paused", () => {
  const src = read("app/(marketing)/_home/HeroStory.tsx");

  it("resolves the phase to the assembled frame whenever the story is paused (B1)", () => {
    // Freezing `data-phase` at the running beat held `deal` or `gather` for ever: no poster, no card,
    // no chips. "still" is the server frame — the scene `step` points at, complete.
    expect(src).toContain('const phase = still || paused ? "still" : STORY_BEATS[beat].phase;');
  });

  it("a dot still sets the scene, so pressing one while paused shows THAT example assembled (B2)", () => {
    // `go(i)` sets the step to scene i's first beat; with B1 in place the paused render of that step
    // is the assembled scene, so the two controls no longer fight each other.
    expect(src).toContain("const go = useCallback((i: number) => setStep(i * STORY_BEATS.length), []);");
  });

  it("the pause control has a changing label and NO aria-pressed (S14)", () => {
    expect(src).toContain("aria-label={paused ? STORY_LABELS.play : STORY_LABELS.pause}");
    expect(src).not.toContain("aria-pressed={paused}");
  });

  it("the scene dots answer the pointer (N1)", () => {
    expect(src).toContain("group-hover:bg-ink/60");
  });

  it("scenes cross-fade in place — no scaling in from a corner (layout audit)", () => {
    const css = read("app/globals.css");
    expect(css).not.toMatch(/--fan-x\) - 18%/);
    expect(css).toContain("[data-story-scene][data-state=\"idle\"] [data-story-part=\"photo\"] {\n  opacity: 0;\n  transition-delay: 0ms;\n}");
  });
});

describe("CardFlip / FlipSideSwitch carry their band (B3, B4, N2, N8, S14)", () => {
  it("defaults to the stock caption and self-corrects inside an arena surface", () => {
    const html = render(createElement(CardFlip, { front: IMG, back: IMG }));
    // #5F636A on #F4F3EF is 5.44 : 1; the old hard-wired #AEB6C2 measured 1.84 : 1 on the same ground.
    expect(html).toContain("text-muted-text");
    expect(html).toContain("arena:text-arena-muted");
    // Unprefixed (space-preceded) — `arena:text-arena-muted` is the variant and is expected.
    expect(html).not.toMatch(/\stext-arena-muted/);
  });

  it("takes an explicit tone for a band it cannot infer", () => {
    const arena = render(createElement(CardFlip, { front: IMG, back: IMG, tone: "arena" }));
    expect(arena).toMatch(/\stext-arena-muted/);
    expect(arena).not.toContain("text-muted-text");
  });

  it("passes the band to the faces, so a stock card gets the stock shadow", () => {
    const html = render(createElement(CardFlip, { front: IMG, back: IMG }));
    expect(html).toContain("shadow-[var(--shadow-card-stock)]");
    expect(html).toContain("arena:shadow-[var(--shadow-card-arena)]");
  });

  it("says Tap on a touch pointer and Click on a mouse (N8)", () => {
    const html = render(createElement(CardFlip, { front: IMG, back: IMG }));
    expect(html).toContain(FLIP_LABELS.flip);
    expect(html).toContain(FLIP_LABELS.click);
    expect(html).toContain("[@media(pointer:fine)]:hidden");
  });

  it("names the action and drops aria-pressed (S14), and the caption lights up on hover (N2)", () => {
    const html = render(createElement(CardFlip, { front: IMG, back: IMG }));
    expect(html).toContain(`aria-label="${FLIP_ARIA.toBack}"`);
    expect(html).not.toContain("aria-pressed");
    expect(html).toContain("group-hover:text-ink");
  });

  it("the reduced-motion switch is readable on stock — it was white on cream (B4)", () => {
    const stock = render(createElement(FlipSideSwitch, { side: "front", onChange: () => {} }));
    expect(stock).toContain("bg-ink text-stock");
    expect(stock).toContain("border-ink/40 text-ink");
    // 44 px, not 40: reduced motion REPLACES the flip with this control.
    expect(stock).toContain("h-11");
    const arena = render(createElement(FlipSideSwitch, { side: "front", onChange: () => {}, tone: "arena" }));
    expect(arena).toContain("border-white bg-white text-ink");
  });
});

describe("shared chrome — prefetch, tap targets and the document outline", () => {
  it("the footer columns never prefetch: the header already did, and /etsy cannot be (S2, S3)", () => {
    const html = render(createElement(SiteFooter));
    const links = html.match(/<a [^>]*href="\/[^"]*"[^>]*>/g) ?? [];
    expect(links.length).toBeGreaterThanOrEqual(FOOTER_COLUMNS.flatMap((c) => c.links).length);
    // next/link renders prefetch={false} as no prefetch machinery at all — assert the source instead.
    const src = read("components/SiteFooter.tsx");
    expect(src).not.toMatch(/<Link href=\{l\.href\} className/);
    expect(src).toContain("<Link href={l.href} prefetch={false}");
    expect(src).toContain('<Link href="/etsy" prefetch={false}');
  });

  it("no /go/etsy href on the home page is a next/link (S2)", () => {
    const sports = read("app/(marketing)/_home/Sports.tsx");
    expect(sports).not.toMatch(/^import Link/m);
    expect(sports).toContain("<a href={href}");
  });

  it("the mobile sheet's extra links are 44 px targets and do not prefetch (S12, S3)", () => {
    const html = render(
      createElement(MobileMenu, { links: HEADER_LINKS, extraLinks: MOBILE_EXTRA_LINKS }),
    );
    const extras = html.match(/inline-flex min-h-11 items-center py-2 font-body text-body/g) ?? [];
    expect(extras.length).toBe(MOBILE_EXTRA_LINKS.length);
    expect(read("components/MobileMenu.tsx")).toContain("prefetch={false}");
    // The CTA block sits at the foot of the sheet — 45 % of an iPad viewport was empty under it.
    expect(read("components/MobileMenu.tsx")).toContain("mt-auto flex flex-col gap-3 pt-10");
  });

  it("the footer's column titles are not headings (S15)", () => {
    const html = render(createElement(SiteFooter));
    expect(html).not.toMatch(/<h[123]/);
  });

  it("every in-page anchor clears the sticky header, not just the home spine (S7)", () => {
    const css = read("app/globals.css");
    expect(css).toContain("[id] { scroll-margin-top: 5rem; }");
    expect(css).not.toContain('h2[id^="s-"] { scroll-margin-top: 5rem; }');
  });

  it("duration-hover is a real rule, so the 180 ms token is what hovers actually run (S1)", () => {
    expect(read("app/globals.css")).toContain("@utility duration-hover { transition-duration: var(--duration-hover); }");
  });

  it("the site fonts declare the fallback their metrics are computed against (S6)", () => {
    const src = read("lib/fonts/site.ts");
    expect(src).toContain('fallback: ["Impact", "Arial Narrow", "sans-serif"]');
    expect(src).toContain('"Helvetica Neue"');
    expect(src).toContain('"Arial Narrow"');
  });
});
