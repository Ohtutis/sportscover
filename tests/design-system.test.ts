// Design-system + shell half (wave0-shell): tokens, font boundaries, brand marks, nav/cta tables,
// the chrome components, the route groups and the dead-code removal. The component half
// (EtsyButton, CardFlip/BracketFrame radius, contrast pairs, TrueNumbers figures) lives in
// tests/components.test.ts (wave0-libs).
import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cards, channelOf, styleCode, visibilityOf } from "../lib/registry/cards";
import { sportByCode } from "../lib/catalog/sports";
import { CTA_LABELS, cardPageSku, ctaFor, seniorNightSku } from "../lib/cta";
import { FOOTER_COLUMNS, HEADER_LINKS, MOBILE_EXTRA_LINKS, TEAMS_HREF } from "../lib/nav";
import { SITE_SELLS_DIRECT, SOCIAL_LINKS, SUPPORT_EMAIL, founderPhotoExists } from "../lib/site";
import { SHIELD_PATH, Shield } from "../components/brand/Shield";
import { WORDMARK_PATH, Wordmark } from "../components/brand/Wordmark";
import { BrandMark } from "../components/BrandMark";
import { SectionHeading } from "../components/SectionHeading";
import { NotFoundBody } from "../components/NotFoundBody";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { MobileMenu } from "../components/MobileMenu";
import manifest from "../app/manifest";

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p: string) => fs.existsSync(path.join(ROOT, p));

function walk(dir: string, out: string[] = []): string[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.(tsx?|css|mjs)$/.test(entry.name)) out.push(rel);
  }
  return out;
}
const SOURCE = [...walk("app"), ...walk("components"), ...walk("lib")];
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

// `usePathname` is null outside a Next router; the NotFoundBody tests set it per case.
const pathnameState = { value: null as string | null };
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return { ...actual, usePathname: () => pathnameState.value };
});
afterEach(() => {
  pathnameState.value = null;
});

describe("globals.css tokens (CONTRACTS §1.1 + DESIGN §10.1)", () => {
  const css = read("app/globals.css");
  const tokens: Record<string, string> = {
    "--color-stock": "#F4F3EF",
    "--color-hairline": "#E8E7E2",
    "--color-ink": "#14191F",
    "--color-muted": "#6E7278",
    "--color-muted-text": "#5F636A",
    "--color-accent": "#FF6B2B",
    "--color-navy": "#172C50",
    "--color-arena": "#080C12",
    "--color-arena-surface": "#14191F",
    "--color-arena-muted": "#AEB6C2",
    "--color-silver": "#C7D0DC",
    "--color-pass": "#4EAF90",
    "--color-fail": "#D8554B",
    "--color-gold": "#C9A227",
    "--radius-ui": "12px",
    "--radius-card": "0px",
    "--radius-pill": "999px",
    "--duration-hover": "180ms",
    "--duration-panel": "240ms",
    "--duration-flip": "5000ms",
    "--spacing-stack": "38px",
    "--container-site": "75rem",
    "--container-gallery": "85rem",
    "--text-price": "2rem",
    "--text-body": "1.0625rem",
  };
  for (const [token, value] of Object.entries(tokens)) {
    it(`${token} is ${value}`, () => expect(css).toMatch(new RegExp(`${token}:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*;`)));
  }
  it("wipes Tailwind's default palette and radius scales", () => {
    expect(css).toContain("--color-*: initial;");
    expect(css).toContain("--radius-*: initial;");
  });
  it("starts with the Tailwind import and defines the arena variant + the three shared utilities", () => {
    expect(css.startsWith('@import "tailwindcss";')).toBe(true);
    expect(css).toContain('@custom-variant arena (&:where([data-surface="arena"], [data-surface="arena"] *));');
    for (const u of ["bg-silver", "text-silver", "container-site", "container-gallery"]) expect(css).toContain(`@utility ${u}`);
  });
  it("carries the flip keyframes with the signature curve and the ink focus halo", () => {
    for (const k of ["card-flip", "card-flip-back", "card-flip-quick"]) expect(css).toContain(`@keyframes ${k}`);
    expect(css).toContain("--ease-flip: cubic-bezier(0.4, 0, 0.2, 1);");
    expect(css).toMatch(/:focus-visible \{ outline: 2px solid var\(--color-accent\);[^}]*box-shadow: 0 0 0 1px var\(--color-ink\)/);
    expect(css).toContain('[data-surface="arena"] :focus-visible { box-shadow: 0 0 0 1px #fff; }');
  });
  it("has no Cover-Moment-era selectors left", () => {
    for (const sel of [".legal-page", ".eyebrow", ".hero", "--font-inter", "--font-oswald", "var(--blue)"]) expect(css).not.toContain(sel);
  });
});

describe("font boundaries (CONTRACTS §0.2 #10, §2.2)", () => {
  it("nothing under components/ or tests/ imports next/font", () => {
    const offenders = [...walk("components"), ...walk("tests")].filter((f) => /from\s+["']next\/font/.test(read(f)));
    expect(offenders).toEqual([]);
  });
  it("lib/fonts/site is imported only by app/layout.tsx", () => {
    const importers = SOURCE.filter((f) => !f.startsWith("lib/fonts/") && /fonts\/site"/.test(read(f)));
    expect(importers).toEqual(["app/layout.tsx"]);
  });
  it("lib/fonts/finishes is imported only under app/(registry)/c/", () => {
    const importers = SOURCE.filter((f) => !f.startsWith("lib/fonts/") && /fonts\/finishes"/.test(read(f)));
    for (const f of importers) expect(f.startsWith("app/(registry)/c/")).toBe(true);
  });
  it("every finish loader call is literal (no spread) and sets preload: false", () => {
    const src = read("lib/fonts/finishes.ts");
    const calls = [...src.matchAll(/^const \w+ = \w+\((\{[^}]*\})\);/gm)].map((m) => m[1]);
    expect(calls.length).toBe(14);
    for (const call of calls) {
      expect(call).toContain("preload: false");
      expect(call).not.toContain("...");
      expect(call).toMatch(/variable: "--ff-(display|supporting)"/);
    }
    expect(src).toContain("SR:");
    expect(src).toContain("Playfair Display");
  });
  it("the site pair sets exactly the three CSS variables the theme reads", () => {
    const src = read("lib/fonts/site.ts");
    for (const v of ["--font-anton", "--font-space-grotesk", "--font-barlow"]) expect(src).toContain(`variable: "${v}"`);
    expect(src).not.toMatch(/Inter|Oswald/);
    expect(read("app/layout.tsx")).not.toMatch(/Inter|Oswald/);
    expect(read("app/layout.tsx")).toContain("siteFontClass");
  });
});

describe("tree hygiene", () => {
  it("no marketplace literal outside lib/catalog/listings.ts and lib/site.ts", () => {
    const allowed = new Set(["lib/catalog/listings.ts", "lib/site.ts"]);
    const offenders = SOURCE.filter((f) => !allowed.has(f) && /etsy\.com/i.test(read(f)));
    expect(offenders).toEqual([]);
  });
  it("components are synchronous (renderToStaticMarkup must work)", () => {
    const offenders = walk("components").filter((f) => /export\s+(default\s+)?async\s+function/.test(read(f)));
    expect(offenders).toEqual([]);
  });
  it("the shell never writes bg-accent itself — it borrows CtaPair's primary class (DESIGN §10.4)", () => {
    const shell = [
      "components/SiteHeader.tsx",
      "components/MobileMenu.tsx",
      "components/SiteFooter.tsx",
      "components/NotFoundBody.tsx",
      "components/Breadcrumbs.tsx",
      "components/SectionHeading.tsx",
      "components/BrandMark.tsx",
      "components/brand/Shield.tsx",
      "components/brand/Wordmark.tsx",
      "components/icons.tsx",
      "app/error.tsx",
      "app/not-found.tsx",
      "app/layout.tsx",
      "app/(marketing)/layout.tsx",
      "app/(registry)/layout.tsx",
    ];
    const offenders = shell.filter((f) => /bg-accent|text-accent|border-accent/.test(read(f)));
    expect(offenders).toEqual([]);
  });
  it("never removes the focus ring without a replacement", () => {
    const offenders = [...walk("app"), ...walk("components")].filter((f) => /outline-none|focus:outline-0/.test(read(f)));
    expect(offenders).toEqual([]);
  });
  it("only the flip animates; IntersectionObserver lives in CardFlip only", () => {
    // app/site-client.tsx is the F0 home client; the home builder deletes it in Wave 1.
    for (const f of [...walk("app"), ...walk("components")].filter((f) => f !== "app/site-client.tsx")) {
      const src = read(f);
      const animations = (src.match(/\banimate-[\w-]+/g) ?? []).filter((a) => !/^animate-card-flip(-back|-quick)?$/.test(a));
      expect(animations, f).toEqual([]);
      if (/IntersectionObserver/.test(src)) expect(f).toBe("components/CardFlip.tsx");
    }
  });
  it("the dead order-form API and the Cover-Moment-era images are gone", () => {
    for (const p of [
      "app/api/submissions",
      "app/api/_shared.ts",
      "public/images/sport-examples",
      "public/images/hero-basketball.webp",
      "public/images/hero-identity-pack.webp",
      "public/images/transformation.webp",
      "public/file.svg",
      "public/globe.svg",
      "public/window.svg",
      "app/page.tsx",
      "app/registry",
      "app/c",
    ]) {
      expect(exists(p), p).toBe(false);
    }
  });
  it("route groups carry the shells", () => {
    expect(read("app/(marketing)/layout.tsx")).toContain('<main id="main">');
    expect(read("app/(marketing)/layout.tsx")).toMatch(/<SiteHeader \/>[\s\S]*<SiteFooter \/>/);
    expect(read("app/(registry)/layout.tsx")).toContain('data-surface="arena"');
    expect(read("app/(registry)/layout.tsx")).toContain('<SiteHeader tone="arena" />');
    for (const p of [
      "app/(marketing)/page.tsx",
      "app/(marketing)/registry/page.tsx",
      "app/(marketing)/contact/page.tsx",
      "app/(marketing)/privacy/page.tsx",
      "app/(marketing)/privacy/biometric/page.tsx",
      "app/(marketing)/terms/page.tsx",
      "app/(registry)/c/[cardId]/page.tsx",
    ]) {
      expect(exists(p), p).toBe(true);
    }
  });
  it("build plumbing: distDir, eslint ignores, gitignore, scripts", () => {
    expect(read("next.config.ts")).toContain('distDir: process.env.NEXT_DIST_DIR || ".next"');
    expect(read("eslint.config.mjs")).toContain('".next-*/**"');
    expect(read(".gitignore")).toContain(".next-*/");
    const scripts = JSON.parse(read("package.json")).scripts as Record<string, string>;
    expect(scripts["cards:assets"]).toBe("tsx scripts/card-assets.ts");
    expect(scripts["site:assets"]).toBe("tsx scripts/site-assets.ts");
    expect(scripts["card:new"]).toBe("tsx scripts/card-new.ts");
    expect(scripts.typecheck).toBe("tsc --noEmit --incremental false");
  });
});

describe("brand marks (CONTRACTS §3 BrandMark, DESIGN §6.8)", () => {
  it("the glyph paths came through without the artboard rects", () => {
    expect(SHIELD_PATH.length).toBeGreaterThan(5000);
    expect(WORDMARK_PATH.length).toBeGreaterThan(10000);
    for (const p of ["public/brand/shield.svg", "public/brand/wordmark.svg"]) expect(read(p)).toContain("#E5E5E5"); // the source still has them
    for (const f of ["components/brand/Shield.tsx", "components/brand/Wordmark.tsx"]) {
      const src = read(f);
      expect(src).not.toContain("<rect");
      expect(src).not.toContain("#E5E5E5");
      expect(src).not.toContain("#FF6B2B"); // never orange
    }
  });
  it("shield: currentColor on stock, silver gradient on arena, decorative by default", () => {
    const stock = render(createElement(Shield, { size: 28, className: "text-navy" }));
    expect(stock).toContain('fill="currentColor"');
    expect(stock).toContain('aria-hidden="true"');
    expect(stock).not.toContain("linearGradient");
    const arena = render(createElement(Shield, { tone: "arena", size: 48 }));
    expect(arena).toContain("<linearGradient");
    expect(arena).toMatch(/fill="url\(#gde-silver-[A-Za-z0-9]+\)"/);
    expect(arena).toContain('stop-color="#C7D0DC"');
    expect(arena).toContain('height="48"');
    const named = render(createElement(Shield, { title: "Game Day Edition shield" }));
    expect(named).toContain('role="img"');
    expect(named).toContain("<title>Game Day Edition shield</title>");
  });
  it("wordmark is always currentColor", () => {
    const html = render(createElement(Wordmark, { height: 22 }));
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain('height="22"');
    expect(html).not.toContain("<rect");
  });
  it("BrandMark is one home link with both marks hidden from AT", () => {
    const html = render(createElement(BrandMark));
    expect(html).toContain('aria-label="Game Day Edition — home"');
    expect(html).toContain('href="/"');
    expect((html.match(/aria-hidden="true"/g) ?? []).length).toBe(2);
    expect(html).toContain("text-navy");
    const arena = render(createElement(BrandMark, { tone: "arena", size: "md" }));
    expect(arena).toContain("text-white");
    expect(arena).toContain("<linearGradient");
  });
  it("favicon and app icon are the shield on a stock tile", () => {
    for (const p of ["public/favicon.svg", "public/icon.svg"]) {
      const svg = read(p);
      expect(svg).toContain('fill="#F4F3EF"');
      expect(svg).toContain('fill="#172C50"');
      expect(svg).toContain(SHIELD_PATH.slice(0, 40));
      expect(svg).not.toContain("#E5E5E5");
      expect(svg).not.toContain("#0C79D8"); // the generic icon's blue
    }
    const m = manifest();
    expect(m.theme_color).toBe("#F4F3EF");
    expect(m.background_color).toBe("#F4F3EF");
    expect(m.icons?.some((i) => i.src === "/icon.svg")).toBe(true);
    expect(m.name).toBe("Game Day Edition");
  });
});

describe("lib/nav (COPY §1.1–1.2)", () => {
  it("header links, left → right", () => {
    expect(HEADER_LINKS).toEqual([
      { label: "Trading Cards", href: "/trading-cards" },
      { label: "Posters", href: "/posters" },
      { label: "Complete Set", href: "/complete-set" },
      { label: "Senior Night", href: "/senior-night" },
      { label: "How it's made", href: "/how-it-works" },
      { label: "Guarantee", href: "/guarantee" },
      { label: "About", href: "/about" },
    ]);
  });
  it("mobile extras", () => {
    expect(MOBILE_EXTRA_LINKS.map((l) => l.href)).toEqual(["/photo-guide", "/registry", "/faq", "/contact", "/etsy"]);
  });
  it("footer columns and the F1 teams mailto", () => {
    expect(FOOTER_COLUMNS.map((c) => c.title)).toEqual(["Shop", "Trust", "Legal"]);
    expect(FOOTER_COLUMNS[0].links.map((l) => l.label)).toEqual(["Trading Cards", "Posters", "Complete Set", "Senior Night", "Teams & clubs", "Etsy shop"]);
    expect(FOOTER_COLUMNS[1].links.map((l) => l.href)).toEqual(["/guarantee", "/how-it-works", "/photo-guide", "/registry", "/faq", "/contact"]);
    expect(FOOTER_COLUMNS[2].links.map((l) => l.href)).toEqual(["/privacy", "/privacy/biometric", "/terms", "/accessibility"]);
    expect(SITE_SELLS_DIRECT).toBe(false);
    expect(TEAMS_HREF).toBe(`mailto:${SUPPORT_EMAIL}?subject=Team%20order`);
  });
});

describe("lib/cta (CONTRACTS §4.9, GAPS #18 / #25)", () => {
  it("F1 header/home: primary Order on Etsy → /go/etsy/GDE-ANY-SET, secondary Look up a card", () => {
    for (const ctx of ["header", "home", "set"] as const) {
      const pair = ctaFor(ctx);
      expect(pair.primary).toEqual({ label: "Order on Etsy →", href: "/go/etsy/GDE-ANY-SET", kind: "primary" });
      expect(pair.secondary).toEqual({ label: "Look up a card", href: "/registry", kind: "outline" });
      expect(pair.tone).toBe("stock");
    }
    expect(ctaFor("cards").primary.href).toBe("/go/etsy/GDE-ANY-CARD");
    expect(ctaFor("cards", { sport: "basketball" }).primary.href).toBe("/go/etsy/GDE-BKB-CARD");
    expect(ctaFor("posters", { sport: "FTB" }).primary.href).toBe("/go/etsy/GDE-FTB-POST");
    expect(ctaFor("cards", { sku: "GDE-ANY-CARD-P12" }).primary.href).toBe("/go/etsy/GDE-ANY-CARD-P12");
  });
  it("senior night: the sport's own set listing when live, else the any-sport set", () => {
    expect(seniorNightSku()).toBe("GDE-ANY-SNSET");
    expect(seniorNightSku("football")).toBe("GDE-FTB-SNSET");
    expect(seniorNightSku("ice-hockey")).toBe("GDE-ANY-SNSET");
    expect(ctaFor("senior-night", { sport: "wrestling" }).primary.href).toBe("/go/etsy/GDE-WRS-SNSET");
  });
  it("card-page: GAPS #18 SKU rule and the demo-etsy single outline, over every demo-etsy record", () => {
    const demos = cards.filter((c) => channelOf(c) === "demo-etsy" && visibilityOf(c) !== "deleted");
    expect(demos.length).toBeGreaterThan(10);
    for (const card of demos) {
      const code = card.sportCode;
      const expected = styleCode(card.styleName) === "SR" ? `GDE-${code}-SNSET` : sportByCode(code)?.cardListingId ? `GDE-${code}-CARD` : "GDE-ANY-SET";
      expect(cardPageSku(card), card.cardId).toBe(expected);
      const pair = ctaFor("card-page", card);
      expect(pair.primary, card.cardId).toEqual({ label: CTA_LABELS.getYoursOnEtsy, href: `/go/etsy/${expected}`, kind: "outline" });
      expect(pair.secondary).toBeUndefined();
      expect(pair.tone).toBe("arena");
      // the same with the F2 flag — demo cards may only ever link back to Etsy
      expect(ctaFor("card-page", card, { sellsDirect: true }).primary.href).toBe(`/go/etsy/${expected}`);
    }
  });
  it("card-page for a real customer keeps the primary + lookup pair in F1", () => {
    const real = cards.find((c) => channelOf(c) === "etsy");
    expect(real).toBeTruthy();
    const pair = ctaFor("card-page", real!);
    expect(pair.primary.label).toBe("Order on Etsy →");
    expect(pair.primary.href.startsWith("/go/etsy/")).toBe(true);
    expect(pair.secondary?.href).toBe("/registry");
  });
  it("flips to direct ordering when SITE_SELLS_DIRECT is true", () => {
    const pair = ctaFor("header", undefined, { sellsDirect: true });
    expect(pair.primary.label).toBe("Start an order");
    expect(pair.primary.href.startsWith("/order/new?sku=GDE-ANY-SET")).toBe(true);
    expect(pair.secondary).toEqual({ label: "Also on Etsy →", href: "/go/etsy/GDE-ANY-SET", kind: "etsy" });
    expect(ctaFor("senior-night", { sport: "football" }, { sellsDirect: true }).primary.label).toBe("Start their senior edition");
  });
  it("never emits a marketplace URL", () => {
    for (const ctx of ["header", "home", "cards", "posters", "set", "senior-night", "card-page"] as const) {
      const pair = ctaFor(ctx);
      for (const l of [pair.primary, pair.secondary]) if (l) expect(l.href).not.toMatch(/etsy\.com/);
    }
  });
});

describe("chrome components", () => {
  it("SectionHeading: rule + index on h2, no rule on h1, D12 order, warns without a full stop", () => {
    const h2 = render(createElement(SectionHeading, { as: "h2", id: "s-05", index: "05 / 13", title: "REGISTERED, NOT JUST PRINTED.", subhead: "Sub.", pills: createElement("span", null, "PILL") }));
    expect(h2).toContain("border-t border-hairline");
    expect(h2).toContain("05 / 13");
    expect(h2).toMatch(/<h2[^>]*id="s-05"[^>]*>REGISTERED, NOT JUST PRINTED\.<\/h2>/);
    expect(h2.indexOf("</h2>")).toBeLessThan(h2.indexOf("Sub."));
    expect(h2.indexOf("Sub.")).toBeLessThan(h2.indexOf("PILL"));
    expect(h2).toContain("mt-stack");
    const h1 = render(createElement(SectionHeading, { as: "h1", title: "LOOK UP A CARD." }));
    expect(h1).not.toContain("border-t");
    expect(h1).toMatch(/<h1[^>]*>LOOK UP A CARD\.<\/h1>/);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(createElement(SectionHeading, { as: "h2", title: "NO STOP" }));
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
  it("NotFoundBody: generic copy, then the /c variant with the inline lookup on arena", () => {
    const generic = render(createElement(NotFoundBody));
    expect(generic).toContain("THAT PAGE DOES NOT EXIST.");
    expect(generic).toContain("Scanned a card? Check the ID on the back of the card or on the certificate — it reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1.");
    expect(generic).toContain('href="/registry"');
    expect(generic).not.toContain('data-surface="arena"');
    pathnameState.value = "/c/GDE-XX-XXX-2026-99";
    const card = render(createElement(NotFoundBody));
    expect(card).toContain("NO CARD REGISTERED UNDER THIS ID.");
    expect(card).toContain("Check the back of the card — the ID reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1.");
    expect(card).toContain('data-surface="arena"');
    const form = /<form [^>]*>/.exec(card)?.[0] ?? "";
    expect(form).toContain('method="post"');
    expect(form).toContain('action="/registry/lookup"');
    expect(card).toContain('name="id"');
    expect(card).toContain('pattern="[A-Za-z0-9-]{8,24}"');
    expect(card).toContain("Find this edition");
    expect(card).toContain("What is a registered edition?");
    expect((card.match(/<h1/g) ?? []).length).toBe(1);
  });
  it("SiteHeader (stock): skip link, nav, the F1 CTA pair, the menu island", () => {
    const html = render(createElement(SiteHeader));
    expect(html).toContain('href="#main"');
    expect(html).toContain("Skip to content");
    for (const l of HEADER_LINKS) expect(html).toContain(`href="${l.href}"`);
    expect(html).toContain("Order on Etsy →");
    expect(html).toContain('href="/go/etsy/GDE-ANY-SET"');
    expect(html).toContain("Look up a card");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/aria-controls="mobile-menu-[A-Za-z0-9]+"/);
    expect(html).toContain("Never posted without your OK");
    for (const l of MOBILE_EXTRA_LINKS) expect(html).toContain(`href="${l.href}"`);
    expect(html).toContain("bg-stock");
    expect(html).not.toContain("REGISTERED EDITION");
  });
  it("SiteHeader: 44 px tap targets and the outline CTA held back until the nav fits beside it", () => {
    const html = render(createElement(SiteHeader));
    // DESIGN §11 item 19: the header buttons are `sm` (h-10, 40 px) with a 44 px floor.
    expect(html.match(/min-h-11/g)?.length).toBe(2);
    // 1024–1279 px cannot hold seven links plus both buttons; the outline one returns at xl.
    expect(html).toMatch(/class="hidden xl:block"><a [^>]*>Look up a card/);
    expect(html).not.toMatch(/class="hidden lg:block"><a [^>]*>Look up a card/);
  });
  it("HeaderNav never wraps: nowrap labels and the two measured gaps", () => {
    const src = read("components/MobileMenu.tsx");
    expect(src).toContain("gap-3 xl:gap-5");
    expect(src).toMatch(/inline-flex items-center whitespace-nowrap py-1\.5/);
  });
  it("SiteHeader (arena): silver shield, the pill, no shop CTAs", () => {
    const html = render(createElement(SiteHeader, { tone: "arena" }));
    expect(html).toContain("REGISTERED EDITION");
    expect(html).toContain("<linearGradient");
    expect(html).toContain("bg-arena");
    expect(html).not.toContain("Order on Etsy");
    expect(html).not.toContain("/go/etsy/");
    expect(html).toContain('href="#main"');
  });
  it("MobileMenu is closed by default and renders its children (the CTA block) inside the dialog", () => {
    const html = render(createElement(MobileMenu, { links: HEADER_LINKS, extraLinks: MOBILE_EXTRA_LINKS }, createElement("a", { href: "/go/etsy/GDE-ANY-SET" }, "Order on Etsy →")));
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toMatch(/<div id="mobile-menu-[A-Za-z0-9]+"[^>]*hidden=""/);
    expect(html).toContain("size-11");
    expect(html).toContain("text-[1.75rem]");
    expect(html).toContain("Order on Etsy →");
  });
  it("SiteFooter: score bug, columns, C4, socials, imprint fallback, bottom line", () => {
    const html = render(createElement(SiteFooter));
    expect(html).toContain("bg-navy");
    for (const t of ["Shop", "Trust", "Legal"]) expect(html).toContain(`>${t}</h2>`);
    expect(html).toContain('href="/trading-cards#sports"');
    expect(html).toContain("17 sports");
    expect(html).toContain(read("content/blocks/independent-studio.md").trim().replace(/'/g, "&#x27;"));
    expect(html).toContain('aria-label="Game Day Edition on Etsy"');
    expect(html).toContain('href="/etsy"');
    expect(html).toContain(`href="mailto:${SUPPORT_EMAIL}?subject=Team%20order"`);
    expect(html).toContain("Game Day Edition is an independent custom design studio operated from Lithuania.");
    expect(html).not.toContain("TEMPLATE");
    expect(html).toContain(`© ${new Date().getFullYear()} Game Day Edition · Designed in Lithuania · Printed by professional labs in the US`);
    expect(html).toContain("<linearGradient"); // silver shield
    for (const s of SOCIAL_LINKS) expect(html).toContain(`Game Day Edition on ${s.platform}`);
  });
  it("Breadcrumbs (once lib/seo/jsonld.ts lands): nav + aria-current + BreadcrumbList", async () => {
    if (!exists("lib/seo/jsonld.ts")) return;
    const { Breadcrumbs } = await import("../components/Breadcrumbs");
    const html = render(createElement(Breadcrumbs, { trail: [{ name: "Home", href: "/" }, { name: "Trading Cards", href: "/trading-cards" }] }));
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("BreadcrumbList");
  });
  it("founderPhotoExists reflects public/brand/founder.jpg", () => {
    expect(founderPhotoExists()).toBe(exists("public/brand/founder.jpg"));
  });
});
