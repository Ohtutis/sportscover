// /free-proof and /free-proof/thanks: the server pages rendered to static markup — the form island
// included, since it must render without `window` — plus the pure form model in components/intake/model.ts.
// v2 (builder A2, 2026-10-04): the owner's design review — a landing hero, four how-it-works cards, five
// numbered steps, the permissions panel and the conversion card, a sticky "Your order" panel.
// v4 (builder F, 2026-10-06 evening): the sport first and ONE sport on the whole page — six steps, the grey
// set before a sport, "your photo" placeholders, products 2 × 2 with compact option rows, no quantity, no
// marketing consent, bigger how-it-works pictures with a CSS watermark, the leave-out tiles as labels.
// next/navigation is mocked (no app router under Vitest); next/image renders.
import { beforeAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return { ...actual, useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }), useSearchParams: () => new URLSearchParams("") };
});

const { default: FreeProofPage, metadata: pageMetadata } = await import("../app/(marketing)/free-proof/page");
const { default: ThanksPage, metadata: thanksMetadata } = await import("../app/(marketing)/free-proof/thanks/page");
const twin = await import("../app/(marketing)/free-proof/for/[sport]/page");
const { IntakeForm } = await import("../components/intake/IntakeForm");
const { INTAKE_COPY, INTAKE_PATH, INTAKE_THANKS_PATH, PROOF_CLOCK } = await import("../lib/intake/copy");
const { CONSENTS, CONSENT_ORDER, PHOTO_RULES, parseProofRequest } = await import("../lib/intake/types");
const { PRODUCTS, optionPrice, optionPriceLabel, productFromLabel, setFromLabel } = await import("../lib/intake/products");
const { BUNDLE_STEPS, DUE_TODAY_LABEL, bundleTotal, formatPercent, formatUsd } = await import("../lib/catalog/prices");
const { styles } = await import("../lib/catalog/styles");
const { CANON, PROOF_PATH_LABEL } = await import("../lib/copy/canon");
const { CardTextPreview, SummaryRail } = await import("../components/intake/SummaryRail");
const { ProductPicker } = await import("../components/intake/ProductPicker");
const { StylePicker } = await import("../components/intake/StylePicker");
const { SportPicker } = await import("../components/intake/SportPicker");
const { HeroVisualView, StepVisualView } = await import("../components/intake/SportVisuals");
const { FAN_SPORTS, LIKENESS_SPORTS, MIX_PHOTOS, PHOTO_SHOTS } = await import("../components/intake/visuals");
const { DUE_TODAY_LABEL: DUE_TODAY } = await import("../lib/catalog/prices");
const { sports, isNumberless } = await import("../lib/catalog/sports");
const { sportPageSports } = await import("../lib/seo/sport-facts");
const { SPORT_OTHER } = await import("../lib/intake/types");
const { INPUT, SELECT, TEXTAREA, border: fieldBorder } = await import("../components/intake/fields");
const { contrastRatio } = await import("../lib/color");
const { asset, hasAsset } = await import("../lib/assets");
const { SUPPORT_EMAIL } = await import("../lib/site");
const model = await import("../components/intake/model");
const { freeProofArtMap } = await import("../lib/intake/sport-art");
/** The real art map and the page's example sport in it (v5: what /free-proof shows before a sport is chosen). */
const REAL = freeProofArtMap();
const SHOW = REAL[model.SHOWCASE_SPORT];
const { UI } = await import("../components/intake/strings");
const UI_SPORT = UI.summary.sport;

const ROOT = process.cwd();
const decode = (s: string) =>
  s.replace(/&(#\d+|#x[0-9a-f]+|amp|lt|gt|quot);/gi, (m, e: string) => {
    if (e === "amp") return "&";
    if (e === "lt") return "<";
    if (e === "gt") return ">";
    if (e === "quot") return '"';
    if (e.startsWith("#x")) return String.fromCodePoint(parseInt(e.slice(2), 16));
    if (e.startsWith("#")) return String.fromCodePoint(Number(e.slice(1)));
    return m;
  });
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let html = "";
beforeAll(() => {
  html = decode(renderToStaticMarkup(FreeProofPage() as ReactElement));
});

const count = (re: RegExp) => (html.match(re) ?? []).length;
/** The markup between two marker strings (both must exist, in order). */
const between = (from: string, to: string) => {
  const a = html.indexOf(from);
  const b = html.indexOf(to, a + 1);
  expect(a, from).toBeGreaterThan(-1);
  expect(b, to).toBeGreaterThan(a);
  return html.slice(a, b);
};

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
/** The form controls in a fragment of well-formed markup, and whether any ancestor (or the control) carries `hidden`. */
function controls(fragment: string): { id: string; type: string; hidden: boolean }[] {
  const out: { id: string; type: string; hidden: boolean }[] = [];
  const stack: boolean[] = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  for (let m = re.exec(fragment); m; m = re.exec(fragment)) {
    const [, close, rawTag, attrs, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (close) {
      stack.pop();
      continue;
    }
    const hiddenHere = /\shidden(?:=""|\s|$)/.test(attrs);
    if (tag === "input" || tag === "select" || tag === "textarea") {
      out.push({ id: /\sid="([^"]*)"/.exec(attrs)?.[1] ?? "", type: /\stype="([^"]*)"/.exec(attrs)?.[1] ?? tag, hidden: hiddenHere || stack.some(Boolean) });
    }
    if (!VOID.has(tag) && !selfClose) stack.push(hiddenHere);
  }
  return out;
}

/** An option's site price, through the products helper (prices.ts underneath). */
const priceOf = (product: string, option: string): number => optionPrice(PRODUCTS.find((p) => p.key === product)!.options.find((o) => o.key === option)!);
/** The bundle a set of choices makes, computed here straight from bundleTotal — the figure the page must show. */
const bundleOf = (choices: [string, string][]) => bundleTotal(choices.map(([product, option]) => ({ product, price: priceOf(product, option) })));

/** A small art map for the rendering tests: two sports with art, so "no other sport's art" can be checked by src. */
const pic = (slug: string, what: string, w = 600, h = 840) => ({ src: `/images/free-proof/${slug}/${slug}-${what}.webp`, w, h, alt: `Custom ${slug} ${what} — example artwork, fictional athlete` });
const ART = {
  football: {
    cards: { SN: pic("football", "card-sn"), CA: pic("football", "card-ca"), HE: pic("football", "card-he") },
    poster: pic("football", "poster", 600, 800),
    banner: pic("football", "banner", 900, 300),
    photos: [pic("football", "phone-photo-1", 336, 450), pic("football", "phone-photo-4", 336, 450), pic("football", "phone-photo-2", 336, 450)],
    identity: pic("football", "identity-three-views", 600, 448),
    kit: pic("football", "kit-plate", 480, 480),
  },
  volleyball: {
    cards: { SN: pic("volleyball", "card-sn"), SR: pic("volleyball", "card-sr") },
    poster: pic("volleyball", "poster", 600, 800),
    blanket: pic("volleyball", "blanket", 600, 720),
  },
};
const choice = (sport: string, style = "", sportOther = "") => ({ sport, sportOther, style: style as never });
/** The product tiles exactly as the page builds them (prices from the helpers). */
const tiles = () =>
  PRODUCTS.map((p) => ({
    key: p.key,
    name: p.name,
    blurb: p.blurb,
    fromLabel: productFromLabel(p),
    options: p.options.map((o) => ({ key: o.key, label: o.label, detail: o.detail, priceLabel: optionPriceLabel(o), printed: o.printed, price: optionPrice(o) })),
  }));
const styleTiles = () => styles.map((st) => ({ code: st.code, name: st.name, material: st.material }));
/** The image paths a fragment draws (next/image serves them through /_next/image?url=…). */
const srcs = (markup: string) =>
  [...markup.matchAll(/<img [^>]*src="([^"]*)"/g)].map((m) => {
    const u = decodeURIComponent(m[1]);
    return /[?&]url=([^&]*)/.exec(u)?.[1] ?? u;
  });

describe("/free-proof — the page a Meta ad lands on", () => {
  it("is the titles-table row, indexable", () => {
    expect(pageMetadata.alternates?.canonical).toBe(INTAKE_PATH);
    expect(pageMetadata.robots).toBeUndefined();
  });

  it("opens as a landing (v8): eyebrow → H1 (the result) → one sentence → the orange CTA to the form → the claims as quiet type", () => {
    expect(count(/<h1[\s>]/g)).toBe(1);
    expect(html).toMatch(new RegExp(`<h1[^>]*>${esc(INTAKE_COPY.h1)}</h1>`));
    const eyebrow = html.indexOf(`data-hero-eyebrow="" class="[^"]*">${INTAKE_COPY.eyebrow}`.replace(/\[\^"\]\*/, ""));
    const h1 = html.indexOf(INTAKE_COPY.h1);
    const line = html.indexOf(INTAKE_COPY.heroLine);
    const cta = /<a href="#create"[^>]*class="([^"]*)"[^>]*>([^<]*)<\/a>/.exec(html);
    expect(cta?.[2]).toBe(INTAKE_COPY.heroCta);
    expect(INTAKE_COPY.heroCta).toBe("Create my free proof →");
    expect(cta?.[1]).toMatch(/\bbg-accent\b/);
    const ctaAt = html.indexOf(cta![0]);
    expect(html).toMatch(new RegExp(`data-hero-eyebrow="" class="[^"]*">${esc(INTAKE_COPY.eyebrow)}</p>`));
    expect(eyebrow === -1 || eyebrow < h1).toBe(true);
    expect(h1).toBeLessThan(line);
    expect(line).toBeLessThan(ctaAt);
    // The CTA lands on the form's own heading, which can take focus; step 1 keeps its anchor for deep links.
    expect(html).toMatch(/<section id="create"[^>]*>.*?<h2 id="create-title" tabindex="-1" data-step-focus=""[^>]*>LET'S CREATE YOUR ATHLETE\.<\/h2>/);
    expect(html).toContain(INTAKE_COPY.formIntro.line);
    expect(html).toContain('id="step-1"');
    expect(INTAKE_COPY.claims).toEqual(["NOTHING TO PAY TODAY", "NO CARD REQUIRED", `PROOF IN ${PROOF_CLOCK.toUpperCase()}`]);
    // The old long subhead is gone from the hero; the claims stay as muted labels, never an accent.
    expect(html).not.toContain(INTAKE_COPY.subhead);
    for (const claim of INTAKE_COPY.claims) {
      const li = new RegExp(`<li class="([^"]*)">(?:<span aria-hidden="true"[^>]*>·</span>)?<span>${esc(claim)}</span></li>`).exec(html);
      expect(li, claim).not.toBeNull();
      expect(li?.[1]).toMatch(/text-muted-text/);
      expect(li?.[1]).not.toMatch(/accent/);
    }
  });

  it("five how-it-works cards in order — the picture filling the top, then numeral, title and line; the fifth the promise bar — in the site's shared band, AFTER the form (v8)", () => {
    // v8 (ads brief §3–§4): the three-beat strip is what sits between the hero and the form; the band follows the form.
    expect(html.indexOf('data-proof-strip=""')).toBeLessThan(html.indexOf('id="create"'));
    expect(html.indexOf('id="step-1"')).toBeLessThan(html.indexOf('data-proof-band=""'));
    expect(html.indexOf('data-proof-band=""')).toBeLessThan(html.indexOf('id="examples"'));
    const band = between('data-proof-band=""', 'id="examples"');
    expect(html).toContain('<section id="how-it-works" data-proof-band=""');
    expect(band).toContain(`>${PROOF_PATH_LABEL}</p>`);
    let at = 0;
    for (const card of INTAKE_COPY.stepCards) {
      const n = band.indexOf(`>${card.n}</span>`, at);
      expect(n, card.n).toBeGreaterThan(at);
      expect(band.indexOf(card.title, n)).toBeGreaterThan(n);
      expect(band).toContain(card.line);
      at = n;
    }
    expect(count(new RegExp(`<ol aria-label="${esc(PROOF_PATH_LABEL)}"`, "g"))).toBe(1);
    // v4 (owner: "the pictures are far too small"): each picture is the card's full width, 140 → 200 px tall, ABOVE the numeral.
    expect(count(/data-step-visual="" class="relative h-\[8\.75rem\] w-full[^"]*xl:h-\[12\.5rem\]"/g)).toBe(4);
    for (const card of band.split('<li data-step-card=""').slice(1)) expect(card.indexOf("data-step-visual")).toBeLessThan(card.indexOf("font-display"));
    expect(INTAKE_COPY.stepCards[1].line).toContain(`${PHOTO_RULES.min}–${PHOTO_RULES.max}`);
    // v6 (owner, 2026-10-07): 01 the fan of four sports in four finishes, 02 the mix of five phone photos and 03 the
    // two likeness packs (a boy, a girl) are the same on every page (the choice, the upload and the method mix sports
    // on purpose); 04 is the example sport's poster and card on the proof sheet under the CSS watermark; 05 the
    // promise bar. Nothing grey, nothing from another sport in 04; C13 shows under the row.
    const cards = band.split('<li data-step-card=""').slice(1);
    expect(cards).toHaveLength(5);
    expect(srcs(cards[0])).toEqual(FAN_SPORTS.map((s) => REAL[s].poster!.src));
    expect(cards[1].match(/data-photo-print=""/g)).toHaveLength(5);
    expect(srcs(cards[1])).toEqual(MIX_PHOTOS.map(({ slug, shot }) => REAL[slug].photos![PHOTO_SHOTS.indexOf(shot)].src));
    expect(srcs(cards[2])).toEqual(LIKENESS_SPORTS.flatMap((s) => [REAL[s].identity!.src, REAL[s].kit!.src]));
    expect(cards[2].match(/data-likeness="identity"/g)).toHaveLength(2);
    expect(srcs(cards[3])).toEqual([SHOW.poster!.src, SHOW.cards.SN!.src]);
    expect(cards[3]).toContain('data-proof-sheet=""');
    expect(cards[3]).toContain('data-watermark=""');
    expect(cards[3]).toContain(INTAKE_COPY.art.proofStamp);
    expect(cards[4]).toMatch(/^ data-step-wide="" data-surface="arena"/);
    expect(cards[4]).toContain(`>${INTAKE_COPY.stepCards[4].title}</p>`);
    // No zero figure on the promise (owner: they still pay after the proof); the rail keeps "Today $0" as the due-now fact.
    expect(cards[4]).not.toContain(DUE_TODAY);
    for (const line of INTAKE_COPY.promise) expect(cards[4]).toContain(`<span>${line}</span>`);
    expect(band).not.toContain("data-neutral=");
    expect(band).not.toContain("data-photo-placeholder");
    for (const src of srcs(cards[3])) expect(src).toMatch(new RegExp(`^/images/free-proof/${model.SHOWCASE_SPORT}/`));
    expect(band).toMatch(/data-band-note="art" class="mt-6"><div>/);
    expect(band).toContain(CANON.fictionalLabel);
    // The intake duplicate is gone: one component, imported.
    expect(fs.existsSync(path.join(ROOT, "components/intake/ProofPath.tsx")) ? fs.readFileSync(path.join(ROOT, "components/intake/ProofPath.tsx"), "utf8") : "").not.toMatch(/export function ProofPath\b/);
    expect(fs.readFileSync(path.join(ROOT, "components/intake/IntakeHero.tsx"), "utf8")).not.toContain("stepCards");
  });

  it("the band's pictures: 01, 02 and 03 fixed (the fan, the mix, the likeness packs — grey where the map has no file); 04 follows the chosen sport and look; never a third sport", () => {
    const step = (n: number, c: ReturnType<typeof choice>, example?: string) => decode(renderToStaticMarkup(createElement(StepVisualView, { step: n, art: ART, choice: c, example })));
    // 01: the fan is the same whatever is chosen — the two fan sports the fixture has, grey posters for the others.
    for (const c of [choice("football"), choice("volleyball"), choice("")]) {
      const one = step(0, c);
      expect(srcs(one), c.sport).toEqual([ART.football.poster.src, ART.volleyball.poster.src]);
      expect(one.match(/data-neutral="poster"/g), c.sport).toHaveLength(2);
    }
    // 02: the mix — the fixture carries football's photos only, so one print and four grey "your photo" slots.
    const two = step(1, choice("volleyball"));
    expect(srcs(two)).toEqual([ART.football.photos[1].src]);
    expect(two.match(/data-photo-placeholder=""/g)).toHaveLength(4);
    // 03: the two likeness packs whatever is chosen — football's plate and kit; volleyball's slots plain (the fixture has none).
    for (const c of [choice("football"), choice("volleyball"), choice("")]) {
      const three = step(2, c);
      expect(srcs(three), c.sport).toEqual([ART.football.identity.src, ART.football.kit.src]);
      expect(three.match(/data-likeness="identity"/g), c.sport).toHaveLength(2);
    }
    const three = step(2, choice("football"));
    // 04 follows the look too: Chrome All-Star chosen → the CA front beside the poster, under the watermark, the stamp line along the foot.
    const four = step(3, choice("football", "CA"));
    expect(srcs(four)).toEqual([ART.football.poster.src, ART.football.cards.CA.src]);
    expect(four).toContain('data-proof-sheet=""');
    expect(four).toContain('data-watermark=""');
    expect(four).toContain(INTAKE_COPY.art.proofStamp);
    expect(four.match(new RegExp(`>${INTAKE_COPY.art.watermark}<`, "g"))!.length).toBeGreaterThan(10);
    for (const out of [three, four]) expect(out).toMatch(/alt=""/);
    expect(four).not.toContain("volleyball");
    // No choice yet, a sport with no art, and "Other": the page's example sport (the showcase, football), never a
    // third sport — and a per-sport page's example (volleyball) wins over the showcase.
    for (const c of [choice("gymnastics"), choice(SPORT_OTHER, "", "rowing"), choice("")]) expect(srcs(step(3, c)), c.sport).toEqual([ART.football.poster.src, ART.football.cards.SN.src]);
    expect(srcs(step(3, choice(""), "volleyball"))).toEqual([ART.volleyball.poster.src, ART.volleyball.cards.SN.src]);
  });

  it("the hero: the copy, and the example sport's proof with three of its athlete's phone photos over the corner — real art before any choice", () => {
    const hero = between(`aria-labelledby="free-proof-title"`, 'data-proof-strip=""');
    expect(hero).toContain("lg:grid lg:grid-cols-12");
    expect(hero.match(/lg:col-span-6/g)?.length).toBe(2);
    const visual = hero.slice(hero.indexOf('data-hero-visual=""'));
    expect(hero.indexOf('data-hero-visual=""')).toBeGreaterThan(hero.indexOf(INTAKE_COPY.heroCta));
    // The exhibit: the bracket frame and its file-tab label, the sheet at the proof's ratio, the CSS watermark.
    expect(visual).toContain(`>${INTAKE_COPY.heroVisual.frameLabel}</span>`);
    expect(visual).toContain("aspect-[1400/1077]");
    // v6: one PROOF stamp across the sheet, not the tiled watermark — the edition reads as the product first.
    expect(visual).toContain('data-watermark="stamp"');
    expect(visual).not.toContain('data-watermark=""');
    // v5 (owner review 2026-10-07): phone photos in, proof out — the showcase sport's poster and card, and three of
    // that athlete's phone photos (back to front: everyday, smile, in uniform). No grey print, no grey set.
    expect(visual.match(/data-photo-print=""/g)).toHaveLength(3);
    expect(visual.match(/ring-white ring-\[5px\]/g)).toHaveLength(3);
    expect(visual).not.toContain("data-photo-placeholder");
    expect(visual).not.toContain("data-neutral=");
    expect(srcs(visual)).toEqual([SHOW.poster!.src, SHOW.cards.SN!.src, ...SHOW.photos!.map((p) => p.src)]);
    expect(visual).toContain(`data-example="${model.SHOWCASE_SPORT}"`);
    expect(visual).toContain(CANON.fictionalLabel);
    // v6: the exhibit reads "your photos → their edition": the label on the front print, the file tab on the sheet.
    expect(visual).toMatch(new RegExp(`data-photos-label=""[^>]*>${esc(INTAKE_COPY.heroVisual.photosLabel)}</span>`));
    expect(INTAKE_COPY.heroVisual.frameLabel).toBe("THEIR EDITION · FREE PROOF");
    // v6: nothing to choose in the hero (owner: "the first visual must say what happens, not ask them to pick") —
    // no button, no sport strip, no radio; the sport is asked once, in step 1.
    expect(hero).not.toMatch(/<button|data-strip-sport|name="fp-sport"/);
    // The line under it names the example and how to see their sport.
    expect(hero).toContain('data-art-note="pick"');
    expect(hero).toContain(INTAKE_COPY.art.pick(model.exampleName(REAL)));
    expect(INTAKE_COPY.art.pick(model.exampleName(REAL))).toBe("Example shown: Football. Pick their sport and every picture switches to it.");
    // The proof is the first thing seen: the poster and card eager at high priority, the photos eager without it —
    // and nothing else on the page is eager.
    const heroImgs = visual.match(/<img [^>]*>/g) ?? [];
    expect(heroImgs.filter((i) => /loading="eager"/.test(i))).toHaveLength(5);
    expect(heroImgs.filter((i) => /fetchpriority="high"/i.test(i))).toHaveLength(2);
    expect(count(/loading="eager"/g)).toBe(5);
  });

  it("the hero in a chosen sport: its poster and card under the watermark, eager, C13 in the frame — and only that sport", () => {
    const out = decode(renderToStaticMarkup(createElement(HeroVisualView, { art: ART, choice: choice("volleyball", "SR") })));
    expect(srcs(out).sort()).toEqual([ART.volleyball.cards.SR.src, ART.volleyball.poster.src].sort());
    expect(out).not.toContain("football");
    expect(out.match(/<img [^>]*loading="eager"/g)).toHaveLength(2);
    expect(out).toContain(CANON.fictionalLabel);
    // In the hero the art line is C13 in the frame, so the note under it is not rendered at all (no empty slot).
    expect(out).not.toContain("data-art-note=");
    expect(out.match(/data-photo-placeholder=""/g)).toHaveLength(3);
    // A finish the sport has no front for falls back to its first finish — still the same sport.
    expect(srcs(decode(renderToStaticMarkup(createElement(HeroVisualView, { art: ART, choice: choice("volleyball", "PR") }))))).toContain(ART.volleyball.cards.SN.src);
    // A sport with no example, and "Other": the example sport's art (football here, never a third sport), and the
    // line says theirs is built to order and names what the pictures show.
    const none = decode(renderToStaticMarkup(createElement(HeroVisualView, { art: ART, choice: choice("gymnastics") })));
    expect(srcs(none)).toEqual([ART.football.poster.src, ART.football.cards.SN.src, ...ART.football.photos.map((p) => p.src)]);
    expect(none).not.toContain("volleyball");
    expect(none).toMatch(/data-art-note="none"/);
    expect(none).toContain(`<span class="block max-w-[60ch] font-body text-small font-medium text-pretty text-ink border-t border-hairline pt-2">${INTAKE_COPY.art.noExample("Gymnastics", "Football")}</span>`);
    const other = decode(renderToStaticMarkup(createElement(HeroVisualView, { art: ART, choice: choice(SPORT_OTHER, "", "rowing") })));
    expect(srcs(other)).toContain(ART.football.poster.src);
    expect(other).toContain(INTAKE_COPY.art.noExample("rowing", "Football"));
    // Only the current line is in the page (owner, 2026-10-07: a reserved slot read as an empty gap).
    expect(none).not.toContain("col-start-1 row-start-1");
    expect(none).not.toContain('aria-hidden="true" class="invisible"');
  });

  it("four numbered steps (v8) — STEP n OF 4 above each H2, one supporting sentence — what, who, the photos, where; step 1 holds the sport, the product and the look as three parts", () => {
    expect(INTAKE_COPY.stepLabel(1)).toBe("STEP 1 OF 4");
    const steps = [
      ["step-1", INTAKE_COPY.steps4.make],
      ["step-2", INTAKE_COPY.steps4.athlete],
      ["step-3", INTAKE_COPY.steps4.photos],
      ["step-4", INTAKE_COPY.steps4.contact],
    ] as const;
    expect(INTAKE_COPY.steps4.make.title).toBe("WHAT ARE WE MAKING?");
    expect(INTAKE_COPY.steps4.contact.title).toBe("WHERE SHOULD WE SEND YOUR PROOF?");
    let at = 0;
    steps.forEach(([id, step], i) => {
      const start = html.indexOf(`id="${id}"`, at);
      expect(start, id).toBeGreaterThan(at);
      const label = html.indexOf(`>${INTAKE_COPY.stepLabel(i + 1)}</p>`, start);
      const title = html.indexOf(`>${step.title}</h2>`, start);
      expect(label, id).toBeGreaterThan(start);
      expect(title, id).toBeGreaterThan(label);
      at = title;
    });
    expect(html).not.toContain('id="step-5"');
    expect(html).not.toContain("OF 6");
    // Step 1's three parts, in order, each a small heading the controls are named by.
    const step1 = between('id="step-1"', 'id="step-2"');
    const parts = ["fp-s-sport", "fp-s-products", "fp-s-style"].map((id) => step1.indexOf(`<h3 id="${id}"`));
    expect(parts.every((p) => p > -1)).toBe(true);
    expect([...parts].sort((a, b) => a - b)).toEqual(parts);
    expect(step1).toContain(`>${INTAKE_COPY.make.sport}</h3>`);
    expect(step1).toContain(`>${INTAKE_COPY.make.product}</h3>`);
    expect(step1).toContain(`>${INTAKE_COPY.make.look}</h3>`);
    // The permissions and the submit card follow step 4, unnumbered; the privacy line sits between them and step 4.
    expect(html.indexOf('data-privacy-box=""')).toBeGreaterThan(html.indexOf('id="step-4"'));
    expect(html.indexOf('aria-labelledby="fp-s-consent"')).toBeGreaterThan(html.indexOf('data-privacy-box=""'));
    expect(html.indexOf('id="fp-submit"')).toBeGreaterThan(html.indexOf('aria-labelledby="fp-s-consent"'));
    expect(html).toContain(INTAKE_COPY.privacyBox.title);
    expect(html).toContain(INTAKE_COPY.privacyBox.line);
  });

  it("step 1: seventeen sports as large chips — the nine with their own pages first, in roster order, the rest behind 'More sports' — then 'Other sport or activity'", () => {
    const step1 = between('id="step-1"', 'id="step-2"');
    const radios = [...step1.matchAll(/<input id="fp-sport-([a-z-]+)" type="radio"[^>]*name="fp-sport"[^>]*value="([a-z-]+)"/g)].map((m) => m[2]);
    const featured = sports.filter((s) => sportPageSports().some((f) => f.slug === s.slug)).map((s) => s.slug);
    expect(featured).toHaveLength(9);
    expect(radios).toEqual([...featured, ...sports.map((s) => s.slug).filter((s) => !featured.includes(s)), SPORT_OTHER]);
    expect(radios).toHaveLength(18);
    // Nothing is chosen on arrival (no ?sport=); the eight others wait behind the disclosure; "Other"'s field is hidden.
    expect(step1).not.toMatch(/name="fp-sport"[^>]*checked=""/);
    expect(step1).toMatch(/<ul id="fp-sport-more" hidden=""/);
    expect(step1).toMatch(/<button type="button" aria-expanded="false" aria-controls="fp-sport-more"[^>]*>More sports/);
    expect(step1).toMatch(/<div hidden="" data-sport-other=""/);
    expect(step1).toContain(`>${INTAKE_COPY.sportStep.other}</span>`);
    // Large tappable chips: 56 px, the whole chip is the label; the radio is visually hidden but real.
    for (const label of step1.match(/<label for="fp-sport-[a-z-]+" class="[^"]*"/g) ?? []) expect(label).toMatch(/min-h-14/);
    expect(step1.match(/<input id="fp-sport-[a-z-]+" type="radio"[^>]*class="sr-only"/g)).toHaveLength(18);
    // The sport is asked ONCE: no sport select anywhere else on the page.
    expect(html).not.toContain('id="fp-athlete-sportSlug"');
    expect(html).not.toMatch(/<select[^>]*sport/i);
  });

  it("every one of the 17 sports and 'Other' is selectable, and a sport without example art says it is built to order", () => {
    const withArt = new Set(Object.keys(ART));
    const choices = sports.map((s) => ({ slug: s.slug, name: s.name, featured: ["basketball", "football"].includes(s.slug) }));
    const picker = (value: string, other = "") =>
      decode(
        renderToStaticMarkup(
          createElement(SportPicker, { sports: choices, value, other, onChange: () => {}, onOther: () => {}, withArt, labelledBy: "fp-s-sport", errors: {} }),
        ),
      );
    for (const s of [...sports.map((x) => x.slug), SPORT_OTHER]) {
      const out = picker(s, s === SPORT_OTHER ? "rowing" : "");
      expect(out, s).toMatch(new RegExp(`<input id="fp-sport-${s}" type="radio"[^>]*name="fp-sport" checked="" value="${s}"`));
      expect(out.match(/checked=""/g), s).toHaveLength(1);
      // The validator takes every one of them (with "Other", only with its words).
      const parsed = parseProofRequest({ athlete: { sportSlug: s, sportOther: "rowing" } });
      expect(parsed.ok ? {} : parsed.errors, s).not.toHaveProperty("athlete.sportSlug");
      expect(parsed.ok ? {} : parsed.errors, s).not.toHaveProperty("athlete.sportOther");
    }
    // A chosen sport behind "More sports" opens the group, so the choice is never hidden.
    expect(picker("golf")).toMatch(/<ul id="fp-sport-more" class=/);
    expect(picker("golf")).toMatch(/aria-expanded="true"/);
    // No example art → one plain line under the chips, never "unavailable"; a sport with art gets none.
    expect(picker("golf")).toContain(`<p data-sport-note="" class="mt-5 max-w-[60ch] font-body text-small font-medium text-pretty text-ink">${INTAKE_COPY.art.noExample("Golf", "Football")}</p>`);
    expect(picker("football")).not.toContain("data-sport-note");
    expect(INTAKE_COPY.art.noExample("Golf", "Football")).toBe(
      "No Golf example yet, so the pictures show Football. We build yours from your photos, and you see the proof before you pay.",
    );
    expect(INTAKE_COPY.art.noExample("Golf", "Football")).not.toMatch(/unavailable|not available|can't|cannot/i);
    // On the real page every catalog sport has its own example art, so no catalog sport ever gets the line.
    for (const s of sports) expect(model.sportArt(REAL, s.slug), s.slug).not.toBeNull();
    // "Other": a required field of at most 40 characters, the same promise beside it as its help line.
    const other = picker(SPORT_OTHER, "rowing");
    expect(other).toMatch(/<div data-sport-other="" class=/);
    expect(other).toMatch(/<input id="fp-athlete-sportOther" type="text"[^>]*maxLength="40"[^>]*required=""/i);
    expect(other).toContain(`>${INTAKE_COPY.sportStep.otherField}</label>`);
    expect(other).toContain(`>${INTAKE_COPY.sportStep.otherPromise}</p>`);
    expect(other).toContain(`placeholder="${INTAKE_COPY.sportStep.otherPlaceholder}"`);
    // The step-1 wording carries no em dash (house rule for new prose).
    for (const line of [...Object.values(INTAKE_COPY.sportStep), INTAKE_COPY.art.pick("Football"), INTAKE_COPY.art.noExampleOther("Football"), INTAKE_COPY.art.noExample("Golf", "Football"), INTAKE_COPY.moreThanOne]) expect(line).not.toContain("—");
  });

  it("what to make (v8): three category cards as radios — trading card, poster, complete set (best value) — banner and blanket as 'more to make', formats behind a disclosure, prices only from the helpers, no quantity", () => {
    for (const c of INTAKE_COPY.make.categories) {
      expect(html).toMatch(new RegExp(`<input[^>]*id="fp-category-${c.key}"[^>]*type="radio"[^>]*name="fp-category"`));
      expect(html).toContain(c.name);
      expect(html).toContain(c.line);
    }
    expect(INTAKE_COPY.make.categories.map((c) => c.key)).toEqual(["card", "poster", "set"]);
    // The set's badge is ink, never the accent; SELECTED appears only once something is chosen.
    expect(html).toMatch(/bg-ink px-2\.5 font-display[^"]*text-white">Best value</);
    expect(html).not.toContain(`>${INTAKE_COPY.selectedBadge}</span>`);
    // The banner and the blanket stay, as "more to make": two real checkboxes under the three cards.
    expect(count(/<input[^>]*id="fp-product-[a-z]+"[^>]*type="checkbox"/g)).toBe(2);
    expect(html).toMatch(/<input[^>]*id="fp-product-banner"[^>]*type="checkbox"/);
    expect(html).toMatch(/<input[^>]*id="fp-product-blanket"[^>]*type="checkbox"/);
    expect(html.indexOf('id="fp-product-banner"')).toBeGreaterThan(html.indexOf('id="fp-category-set"'));
    expect(html).toContain(`>${INTAKE_COPY.make.more}</p>`);
    expect(html).not.toContain('id="fp-product-set"');
    expect(html).not.toContain(">MOST POPULAR</span>");
    // Formats and sizes wait behind a closed disclosure; nothing chosen on arrival, so no option row is in the page.
    expect(html).toMatch(new RegExp(`<button type="button" aria-expanded="false" aria-controls="fp-formats"[^>]*>(?:<span[^>]*>›</span>)?${esc(INTAKE_COPY.make.formats)}</button>`));
    expect(html).toMatch(/<div id="fp-formats" hidden=""/);
    expect(html).not.toMatch(/id="fp-product-[a-z]+-option-[a-z0-9]+"/);
    // Three across from md, one column on a phone.
    expect(html).toMatch(/<ul class="grid items-stretch gap-y-4 md:grid-cols-3 md:gap-x-4">/);
    // No quantity anywhere: no stepper, no output, no word — one muted line under the cards instead.
    expect(html).not.toMatch(/quantity/i);
    expect(html).not.toMatch(/<output/);
    expect(html).not.toContain("One more");
    expect(html).toMatch(new RegExp(`<p data-more-than-one="" class="[^"]*text-muted-text">${esc(INTAKE_COPY.moreThanOne)}</p>`));
    expect(INTAKE_COPY.moreThanOne).toBe("Need more than one? Say so when you see the proof.");
    // Pricing v1 (2026-10-07): under the cards, the bundle ladder — three rungs from BUNDLE_STEPS, none reached
    // on arrival, and the line that says what the ladder is. No set line any more.
    expect(html).not.toContain("data-set-note");
    const ladder = between('data-bundle-ladder=""', 'data-more-than-one=""');
    expect(html.indexOf('data-bundle-ladder=""')).toBeGreaterThan(html.indexOf('id="fp-product-blanket"'));
    expect(html.indexOf('data-bundle-ladder=""')).toBeLessThan(html.indexOf('id="fp-s-style"'));
    expect(ladder).toContain(`>${INTAKE_COPY.bundle.title}</p>`);
    const rungs = [...ladder.matchAll(/<li data-bundle-step="(\d)"[^>]*>([^<]*)<\/li>/g)].map((m) => [Number(m[1]), m[2]]);
    expect(rungs).toEqual(BUNDLE_STEPS.map((st, i) => [st.count, INTAKE_COPY.bundle.step(st.count, i === BUNDLE_STEPS.length - 1, formatPercent(st.percent / 100))]));
    expect(rungs.map((r) => r[1])).toEqual(["2 products \u221215%", "3 products \u221220%", "all 4 \u221225%"]);
    expect(ladder).not.toContain("data-reached");
    expect(ladder).not.toContain("bg-accent");
    expect(ladder).toMatch(new RegExp(`<p data-bundle-nudge="" aria-live="polite"[^>]*>${esc(INTAKE_COPY.bundle.lead)}</p>`));
    // Every dollar figure on the page is a helper's output (or the zero-due figure from prices.ts).
    const cheapest = (key: string) => Math.min(...PRODUCTS.find((p) => p.key === key)!.options.map(optionPrice));
    const allowed = new Set([
      ...PRODUCTS.flatMap((p) => [...p.options.map((o) => optionPriceLabel(o)), productFromLabel(p)]).map((l) => l.replace(/^from /, "")),
      formatUsd(bundleTotal([{ product: "cards", price: cheapest("cards") }, { product: "poster", price: cheapest("poster") }]).total),
      DUE_TODAY_LABEL,
    ]);
    const prices = html.match(/\$\d+(\.\d{2})?/g) ?? [];
    expect(prices.length).toBeGreaterThan(5);
    for (const p of prices) expect(allowed, p).toContain(p);
    // Nothing is chosen on arrival: no SELECTED badge.
    expect(html).not.toContain(`>${INTAKE_COPY.selectedBadge}</span>`);
    expect(setFromLabel()).toMatch(/^from \$/);
  });

  it("a chosen category shows SELECTED on its picture; its option rows wait in the formats box (one row per option, the chosen description only); the bundle ladder follows the choice", () => {
    const products = tiles();
    const state = model.initialState().products;
    const render = (s: typeof state) =>
      decode(renderToStaticMarkup(createElement(ProductPicker, { products, state: s, onToggle: () => {}, onOption: () => {}, onCategory: () => {} })));
    const one = render({ ...state, cards: { selected: true, option: "p12" } });
    const cards = one.slice(one.indexOf('<li data-category-card="card"'), one.indexOf('<li data-category-card="poster"'));
    expect(cards).toMatch(/<input[^>]*id="fp-category-card"[^>]*checked=""/);
    expect(cards).toMatch(new RegExp(`<span class="[^"]*absolute right-2 top-2 z-10[^"]*">${INTAKE_COPY.selectedBadge}</span>`));
    expect(cards).toMatch(/border-ink ring-1 ring-ink shadow-\[var\(--shadow-card-stock\)\]/);
    expect(one).not.toMatch(/id="fp-category-poster"[^>]*checked=""/);
    // The chosen product's option rows live in the formats box (closed by default): the radio, the name and the price, 44 px.
    const formats = one.slice(one.indexOf('<div id="fp-formats"'));
    const rows = formats.match(/<label for="fp-product-cards-option-[a-z0-9]+" class="([^"]*)">/g) ?? [];
    expect(rows).toHaveLength(3);
    for (const row of rows) expect(row).toMatch(/grid min-h-11 [^"]*grid-cols-\[1\.25rem_minmax\(0,1fr\)_auto\] items-center/);
    expect(formats).toMatch(/<p id="fp-product-cards-option-p12-detail" class="[^"]*text-muted-text">/);
    expect(formats).toMatch(/<p id="fp-product-cards-option-digital-detail" hidden=""/);
    expect(formats).not.toMatch(/fp-product-poster-option/);
    // The bundle ladder follows the choice: the reached rung on the accent (ink on orange), and the nudge for
    // the next product — the first not chosen, at the option its card holds — computed from bundleTotal.
    const nudge = (html: string) => /<p data-bundle-nudge="" aria-live="polite"[^>]*>([^<]*)<\/p>/.exec(html)?.[1];
    const reached = (html: string) => [...html.matchAll(/<li data-bundle-step="(\d)" data-reached=""[^>]*class="([^"]*)"/g)].map((m) => [Number(m[1]), m[2]]);
    const saving = (from: [string, string][], to: [string, string][]) => formatUsd(Math.round((bundleOf(to).discount - bundleOf(from).discount) * 100) / 100);
    expect(reached(one)).toEqual([]);
    expect(nudge(one)).toBe(INTAKE_COPY.bundle.nudgeFirst("a poster", saving([["cards", "p12"]], [["cards", "p12"], ["poster", "digital"]])));
    expect(nudge(one)).toBe(`Add a poster: save ${formatUsd(bundleOf([["cards", "p12"], ["poster", "digital"]]).discount)} on the order.`);
    const pair = render({ ...state, cards: { selected: true, option: "p12" }, poster: { selected: true, option: "p1824" } });
    expect(reached(pair)).toHaveLength(1);
    expect(reached(pair)[0][0]).toBe(2);
    expect(reached(pair)[0][1]).toMatch(/\bbg-accent text-ink\b/);
    expect(pair).toMatch(/<li data-bundle-step="2" data-reached="" aria-current="step"/);
    const two: [string, string][] = [["cards", "p12"], ["poster", "p1824"]];
    expect(nudge(pair)).toBe(INTAKE_COPY.bundle.nudgeMore("a banner", saving(two, [...two, ["banner", "digital"]])));
    const three = render({ ...state, cards: { selected: true, option: "p12" }, poster: { selected: true, option: "p1824" }, banner: { selected: true, option: "2x4" } });
    expect(reached(three).map((r) => r[0])).toEqual([3]);
    // An unchosen blanket holds its first option, the digital files (2026-10-07), like every other product.
    expect(nudge(three)).toBe(INTAKE_COPY.bundle.nudgeMore("a blanket", saving([...two, ["banner", "2x4"]], [...two, ["banner", "2x4"], ["blanket", "digital"]])));
    const all = render({ cards: { selected: true, option: "p12" }, poster: { selected: true, option: "p1824" }, banner: { selected: true, option: "2x4" }, blanket: { selected: true, option: "50x60" } });
    expect(reached(all).map((r) => r[0])).toEqual([4]);
    expect(nudge(all)).toBe(INTAKE_COPY.bundle.top(formatPercent(0.25)));
    // Banner + blanket are a bundle like any other pair; the nudge then names the first product not chosen.
    const others = render({ ...state, banner: { selected: true, option: "digital" }, blanket: { selected: true, option: "30x40" } });
    expect(reached(others).map((r) => r[0])).toEqual([2]);
    expect(nudge(others)).toBe(INTAKE_COPY.bundle.nudgeMore("trading cards", saving([["banner", "digital"], ["blanket", "30x40"]], [["cards", "digital"], ["banner", "digital"], ["blanket", "30x40"]])));
    // The blanket is priced now: its "from" on the tile and every size row (in the formats box) carries a price.
    expect(others).toMatch(new RegExp(`id="fp-product-blanket-from" class="[^"]*">${esc(productFromLabel(PRODUCTS[3]))}</span>`));
    for (const o of PRODUCTS[3].options) expect(others).toContain(`>${optionPriceLabel(o)}</span>`);
    // Honest comparison only: no sale, no former price, no clock.
    for (const html of [one, pair, three, all, others]) expect(html.replace(/<[^>]*>/g, " ")).not.toMatch(/\bsale\b|\bwas\b|regular price|limited time|\bends?\b|% off/i);
  });

  it("the product pictures are the shown sport's — the card, the poster, both on the set, the banner and the blanket tiles — the grey product where it has none, and never another sport", () => {
    const products = tiles();
    const state = model.initialState().products;
    const render = (art: (typeof ART)[keyof typeof ART] | null, style = "") =>
      decode(
        renderToStaticMarkup(
          createElement(ProductPicker, {
            products,
            state,
            onToggle: () => {},
            onOption: () => {},
            onCategory: () => {},
            art: art as never,
            style: style as never,
            note: { state: art ? "art" : "pick", sport: null, example: "Football" },
          }),
        ),
      );
    const football = render(ART.football, "HE");
    // card · poster · set (poster, then card) · banner; the blanket has no file in the fixture.
    expect(srcs(football)).toEqual([ART.football.cards.HE.src, ART.football.poster.src, ART.football.poster.src, ART.football.cards.HE.src, ART.football.banner.src]);
    expect(football.match(/data-product-media="neutral"/g)).toHaveLength(1);
    expect(football).not.toContain("volleyball");
    expect(football).toContain('data-art-note="art"');
    const volleyball = render(ART.volleyball);
    expect(srcs(volleyball)).toEqual([ART.volleyball.cards.SN.src, ART.volleyball.poster.src, ART.volleyball.poster.src, ART.volleyball.cards.SN.src, ART.volleyball.blanket.src]);
    expect(volleyball).not.toContain("football");
    // No art handed in at all: grey products everywhere (the component's fallback; the page always hands one in).
    const grey = render(null);
    expect(grey).not.toMatch(/<img /);
    expect(grey.match(/data-product-media="neutral"/g)).toHaveLength(5);
    for (const shape of ["card", "poster", "banner", "blanket"]) expect(grey).toContain(`data-neutral="${shape}"`);
    expect(grey).toContain('data-art-note="pick"');
    // v5: the page itself, before a sport is chosen, shows the example sport everywhere — nothing grey.
    const part = between('id="fp-s-products"', 'id="fp-s-style"');
    expect(part).not.toContain('data-product-media="neutral"');
    expect(srcs(part)).toEqual([SHOW.cards.SN!.src, SHOW.poster!.src, SHOW.poster!.src, SHOW.cards.SN!.src, SHOW.banner!.src, SHOW.blanket!.src]);
    expect(part).toContain('data-art-note="pick"');
    expect(part).toContain(CANON.fictionalLabel);
  });

  it("the look (v8): 'choose the best style for me' first and chosen by default, then the seven tiles with the chosen sport's card in each finish — one radio group", () => {
    expect(count(/name="fp-style"/g)).toBe(8);
    expect(styles).toHaveLength(7);
    for (const s of styles) {
      expect(html).toMatch(new RegExp(`id="fp-style-${s.code}"`));
      expect(html).toMatch(new RegExp(`id="fp-style-${s.code}-name"[^>]*>${esc(s.name)}</span>`));
      expect(html).toMatch(new RegExp(`id="fp-style-${s.code}-detail"[^>]*>${esc(s.material)}</span>`));
    }
    // The recommended card comes first, full width, checked on arrival (model.initialState().style), with its tag; no dark tile any more.
    const recommended = /<label for="fp-style-recommend" data-style-recommended="" class="([^"]*)">/.exec(html);
    expect(recommended?.[1]).toMatch(/border-ink ring-1 ring-ink/);
    expect(html).toMatch(/<input[^>]*id="fp-style-recommend"[^>]*checked=""/);
    expect(html).toMatch(new RegExp(`id="fp-style-recommend-name"[^>]*font-display[^>]*>${esc(INTAKE_COPY.chooseForMeTitle)}</span>`));
    expect(html).toContain(`>${INTAKE_COPY.make.recommendedTag}</span>`);
    expect(html).toContain(INTAKE_COPY.chooseForMeLine);
    expect(html.indexOf('id="fp-style-recommend"')).toBeLessThan(html.indexOf('id="fp-style-SN"'));
    expect(html).toContain(`>${INTAKE_COPY.make.own}</p>`);
    expect(model.initialState().style).toBe("recommend");
    // v5: before a sport, the example sport's card in each of the seven finishes, and the pick line under them.
    const step3 = between('id="fp-s-style"', 'id="step-2"');
    expect(step3.match(/data-style-face="art"/g)).toHaveLength(7);
    expect(step3).not.toContain('data-style-face="neutral"');
    expect(srcs(step3).sort()).toEqual(Object.values(SHOW.cards).map((c) => c!.src).sort());
    expect(step3).toContain('data-art-note="pick"');
    // In a sport: its fronts where it has them, the grey card in the finish's frame where not — never another sport.
    const picker = (art: (typeof ART)[keyof typeof ART] | null) =>
      decode(renderToStaticMarkup(createElement(StylePicker, { styles: styleTiles(), value: "", onChange: () => {}, labelledBy: "x", art: art as never, note: { state: "art", sport: null, example: "Football" } })));
    const fb = picker(ART.football);
    expect(srcs(fb).sort()).toEqual(Object.values(ART.football.cards).map((c) => c.src).sort());
    expect(fb.match(/data-style-face="neutral"/g)).toHaveLength(4);
    expect(fb).not.toContain("volleyball");
    expect(fb).toContain(CANON.fictionalLabel);
    const vb = picker(ART.volleyball);
    expect(srcs(vb)).toEqual([ART.volleyball.cards.SN.src, ART.volleyball.cards.SR.src]);
  });

  it("the athlete step is a short grid — name, number, team before '+ Add optional details' — no sport, no colours, no need-it-by date, the headline first behind the toggle", () => {
    const step4 = between('id="step-2"', 'id="step-3"');
    const all = controls(step4);
    const visible = all.filter((c) => !c.hidden).map((c) => c.id);
    expect(visible).toEqual(["fp-athlete-firstName", "fp-athlete-lastName", "fp-athlete-jerseyNumber", "fp-athlete-team"]);
    // The Senior Night pair joins the grid only with SR; everything optional waits behind the disclosure, the headline first.
    const hidden = all.filter((c) => c.hidden).map((c) => c.id);
    for (const id of ["fp-athlete-classOf", "fp-athlete-eventDate", "fp-athlete-headline", "fp-athlete-position", "fp-athlete-season", "fp-athlete-notes"]) expect(hidden, id).toContain(id);
    const optional = step4.slice(step4.indexOf('id="fp-athlete-optional"'));
    const optionalIds = controls(optional).map((c) => c.id);
    expect(optionalIds.slice(0, 3)).toEqual(["fp-athlete-headline", "fp-athlete-position", "fp-athlete-season"]);
    // Gone (owner, 2026-10-06): the sport select (asked once, in step 1), the team colours, the need-it-by date.
    expect(html).not.toContain('id="fp-athlete-sportSlug"');
    expect(html).not.toMatch(/type="color"/);
    expect(html).not.toContain('id="fp-contact-neededBy"');
    expect(html).not.toMatch(/Team colors|Need it by|Main color/);
    expect(step4).toMatch(new RegExp(`<button type="button" aria-expanded="false" aria-controls="fp-athlete-optional"[^>]*>${esc(INTAKE_COPY.optionalToggle)}</button>`));
    expect(step4).toMatch(/<div id="fp-athlete-optional" hidden=""/);
    // "school" appears only inside the crest copy (the crest's owner), never as a field.
    expect(html).not.toMatch(/(?:id|name|for)="[^"]*school/i);
    expect(html).not.toMatch(/<label[^>]*font-label[^>]*>[^<]*school/i);
  });

  it("Required / Optional are small grey tags, never asterisks", () => {
    const tag = (word: string) => new RegExp(`<span aria-hidden="true" class="[^"]*text-muted-text[^"]*">${word}</span>`, "g");
    // The consent rows carry no tag since 2026-10-06 (one "All three are needed" line instead — tests/intake-consent.test.ts).
    expect(count(tag(INTAKE_COPY.requiredTag))).toBeGreaterThanOrEqual(5);
    expect(count(tag(INTAKE_COPY.optionalTag))).toBeGreaterThanOrEqual(8);
    expect(html).not.toMatch(/<label[^>]*>[^<]*\*\s*</);
    expect(html).not.toMatch(/\(optional\)<\/label>/i);
  });

  it("the photo step: the big drop zone IS the button, the 4–10 rule, the example gallery (four to send, three to leave out, no self-check boxes) and the crest", () => {
    expect(html).toContain(`accept="${[...PHOTO_RULES.types, ...PHOTO_RULES.extensions].join(",")}"`);
    expect(html).toMatch(/<input[^>]*type="file"[^>]*multiple/);
    const zone = /<button id="fp-photos-choose" type="button" data-fp-dropzone=""[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/button>/.exec(html);
    expect(zone?.[1]).toMatch(/min-h-\[23rem\]/);
    expect(zone?.[2]).toContain(INTAKE_COPY.dropTitle);
    expect(zone?.[2]).toContain(INTAKE_COPY.dropOr);
    expect(zone?.[2]).toContain(INTAKE_COPY.dropHint);
    // tests/intake-photos.test.ts covers the gallery tile by tile.
    const step5 = between('id="step-3"', 'id="step-4"');
    for (const line of INTAKE_COPY.photosLines) expect(step5).toContain(line);
    for (const [slug, caption] of Object.entries(INTAKE_COPY.photoExamples.captions)) {
      expect(step5).toContain(`<span>${caption}</span></figcaption>`);
      const key = `intake.example.${slug}`;
      if (hasAsset(key)) expect(step5.includes(encodeURIComponent(asset(key).src)), key).toBe(true);
    }
    expect(controls(step5).filter((c) => c.type === "checkbox")).toEqual([]);
    expect(asset("intake.example.bad").alt).toMatch(/generated example/);
    expect(step5).toContain(INTAKE_COPY.crestHelp);
    expect(count(/Parent\/guardian consent required/g)).toBeGreaterThanOrEqual(1);
  });

  it("step 4 asks where to send the proof: your name and the email — no phone, no country", () => {
    const step6 = between('id="step-4"', 'data-privacy-box=""');
    expect(controls(step6).map((c) => c.id)).toEqual(["fp-contact-name", "fp-contact-email"]);
    expect(html).not.toContain('id="fp-contact-phone"');
    expect(html).not.toContain('id="fp-contact-country"');
  });

  it("permissions: a white card, the three required sentences verbatim with their own checkbox, the crest row hidden until a crest is attached — and no marketing permission", () => {
    const panel = between('aria-labelledby="fp-s-consent"', 'aria-labelledby="fp-cta-title"');
    expect(panel).toMatch(/^aria-labelledby="fp-s-consent" class="[^"]*\bbg-white\b/);
    expect(panel).toMatch(/\[&amp;_input\]:accent-ink|\[&_input\]:accent-ink/);
    expect(panel).not.toMatch(/\bbg-accent\b|\btext-accent\b|\bborder-accent\b/);
    const shown = CONSENT_ORDER.filter((k) => k !== "marketing");
    let at = 0;
    for (const key of shown) {
      const next = panel.indexOf(CONSENTS[key].text, at);
      expect(next, key).toBeGreaterThan(at);
      expect(panel).toMatch(new RegExp(`<input id="fp-consents-${key}" type="checkbox"[^>]*name="consent-${key}"`));
      at = next;
    }
    expect(count(/<input id="fp-consents-[a-z]+" type="checkbox"/g)).toBe(shown.length);
    // The owner (2026-10-06): the optional "let us show the finished card" row is not needed — gone from the form.
    expect(html).not.toContain(CONSENTS.marketing.text);
    expect(html).not.toContain('id="fp-consents-marketing"');
    expect(html).not.toContain("let us show the finished card");
    for (const key of ["guardian", "biometric", "license"]) expect(panel).toMatch(new RegExp(`id="fp-consents-${key}"[^>]*required=""`));
    expect(panel).toMatch(/<div hidden=""[^>]*>(?:(?!<\/div>)[\s\S])*id="fp-consents-crest"/);
    for (const href of ["/privacy", "/privacy/biometric", "/terms"]) expect(panel).toContain(`href="${href}"`);
  });

  it("the conversion card holds the one submit: title, Today + the zero-due figure, the line, the button, the note — then the quiet Etsy link and a honeypot", () => {
    expect(count(/type="submit"/g)).toBe(1);
    const card = between('aria-labelledby="fp-cta-title"', 'href="/go/etsy/GDE-ANY-SET"');
    const parts = [
      `>${INTAKE_COPY.ctaCard.title}</h2>`,
      `>${INTAKE_COPY.ctaCard.todayLabel}</span>`,
      `>${DUE_TODAY_LABEL}</span>`,
      INTAKE_COPY.ctaCard.line,
      `>${INTAKE_COPY.ctaCard.button}</button>`,
      `>${INTAKE_COPY.ctaCard.note}</p>`,
    ];
    let at = 0;
    for (const part of parts) {
      const next = card.indexOf(part, at);
      expect(next, part).toBeGreaterThanOrEqual(at);
      at = next;
    }
    expect(card).toMatch(/<button id="fp-submit" type="submit"[^>]*class="[^"]*\bbg-accent\b/);
    expect(html.indexOf(`>${INTAKE_COPY.ctaCard.button}</button>`)).toBeGreaterThan(html.indexOf(CONSENTS.license.text));
    expect(INTAKE_COPY.ctaCard.button).toBe("Create my free proof →");
    expect(INTAKE_COPY.ctaCard.note).toBe("No payment information required.");
    // v3 (2026-10-06): one muted line and the house outline EtsyButton (tests/intake-consent.test.ts).
    const etsy = /<a href="\/go\/etsy\/GDE-ANY-SET" class="([^"]*)">(?:(?!<\/a>)[\s\S])*<\/a>/.exec(html);
    expect(etsy?.[0]).toContain("Also on Etsy →");
    expect(etsy?.[1]).not.toMatch(/bg-accent/);
    expect(html.indexOf(INTAKE_COPY.etsyAltShort)).toBeGreaterThan(html.indexOf(`>${INTAKE_COPY.ctaCard.button}</button>`));
    const honeypot = /<div aria-hidden="true" class="sr-only">(?:(?!<\/div>)[\s\S])*<\/div>/.exec(html)?.[0] ?? "";
    const input = /<input[^>]*name="website"[^>]*>/.exec(honeypot)?.[0] ?? "";
    expect(input).toMatch(/tabindex="-1"/i);
    expect(input).toMatch(/autocomplete="off"/i);
    expect(input).toMatch(/type="text"/);
    expect(html).not.toMatch(/name="website"[^>]*hidden/);
  });

  it("the summary: a white 20 px panel with the title, the example preview card, Today and the zero-due figure, the three checks — and the empty state on arrival", () => {
    expect(count(new RegExp(`>${INTAKE_COPY.summary.title}</h2>`, "g"))).toBe(2);
    const rail = /<aside aria-labelledby="fp-summary-title" class="([^"]*)">([\s\S]*?)<\/aside>/.exec(html);
    expect(rail?.[1]).toMatch(/rounded-\[20px\]/);
    expect(rail?.[1]).toMatch(/\bbg-white\b/);
    expect(rail?.[1]).toMatch(/border-hairline/);
    // v8: the look is answered on arrival ("choose the best style for me"), so the rail already lists it; no empty line.
    expect(rail?.[2]).not.toContain(INTAKE_COPY.summary.empty);
    expect(rail?.[2]).toContain(UI.summary.recommend);
    expect(rail?.[2]).toContain(`>${INTAKE_COPY.summary.today}</dt>`);
    expect(rail?.[2]).toContain(`>${DUE_TODAY_LABEL}</dd>`);
    for (const check of INTAKE_COPY.summary.checks) expect(rail?.[2]).toContain(`<span>${check}</span>`);
    // v5: before a sport, the preview is the example sport's card (with C13 on it) — never a grey card.
    expect(rail?.[2]).toContain('data-card-preview=""');
    expect(rail?.[2]).not.toContain('data-neutral="card"');
    expect(srcs(rail![2])).toEqual([SHOW.cards.SN!.src]);
    // Nothing chosen yet: no "after approval" figure.
    expect(rail?.[2]).not.toContain(INTAKE_COPY.summary.afterApproval);
  });

  it("'Your order' with two or more products (pricing v1): bought separately struck, the bundle saving on the accent, the total — and Today stays $0", () => {
    const state = model.initialState().products;
    const render = (s: typeof state, variant: "rail" | "bar") =>
      decode(renderToStaticMarkup(createElement(SummaryRail, { products: tiles(), state: s, styles: styleTiles(), style: "", athlete: null, variant, sport: "Football" })));
    const chosen: [string, string][] = [["cards", "p12"], ["poster", "p1824"], ["banner", "2x4"], ["blanket", "50x60"]];
    const s = {
      cards: { selected: true, option: "p12" },
      poster: { selected: true, option: "p1824" },
      banner: { selected: true, option: "2x4" },
      blanket: { selected: true, option: "50x60" },
    };
    const b = bundleOf(chosen);
    for (const variant of ["rail", "bar"] as const) {
      const out = render(s, variant);
      expect(out).toMatch(new RegExp(`data-summary-separately=""[^>]*><dt[^>]*>${INTAKE_COPY.summary.separately}</dt><dd[^>]*><s>${esc(formatUsd(b.alaCarte))}</s></dd>`));
      expect(out).toMatch(
        new RegExp(`data-summary-saving=""[^>]*><dt[^>]*>${INTAKE_COPY.summary.bundleSaving}</dt><dd><span class="[^"]*\\bbg-accent\\b[^"]*\\btext-ink\\b[^"]*">${esc(INTAKE_COPY.summary.savingValue(formatUsd(b.discount), formatPercent(b.discountRate)))}</span>`),
      );
      expect(INTAKE_COPY.summary.savingValue(formatUsd(b.discount), formatPercent(b.discountRate))).toBe(`\u2212${formatUsd(b.discount)} (25%)`);
      expect(out).toMatch(new RegExp(`data-summary-total=""[^>]*><dt[^>]*>${INTAKE_COPY.summary.afterApproval}</dt><dd[^>]*>${esc(formatUsd(b.total))}</dd>`));
      // In that order, and the saving is never orange TEXT.
      expect(out.indexOf("data-summary-separately")).toBeLessThan(out.indexOf("data-summary-saving"));
      expect(out.indexOf("data-summary-saving")).toBeLessThan(out.indexOf("data-summary-total"));
      expect(out).not.toMatch(/\btext-accent\b/);
      expect(out.replace(/<[^>]*>/g, " ")).not.toMatch(/\bsale\b|\bwas\b|regular price|limited time|\bends?\b|% off/i);
    }
    expect(render(s, "rail")).toContain(`>${DUE_TODAY_LABEL}</dd>`);
    // One product: its price after approval, nothing struck, no saving line.
    const one = render({ ...state, poster: { selected: true, option: "p2436" } }, "rail");
    expect(one).toMatch(new RegExp(`data-summary-total=""[^>]*><dt[^>]*>${INTAKE_COPY.summary.afterApproval}</dt><dd[^>]*>${esc(formatUsd(priceOf("poster", "p2436")))}</dd>`));
    expect(one).not.toContain("data-summary-separately");
    expect(one).not.toContain("data-summary-saving");
    expect(one).not.toMatch(/<s>/);
  });

  it("orange only where the owner allows it: the three CTAs to the form, the submit and the three summary ticks", () => {
    const fills = html.match(/class="[^"]*\bbg-accent\b[^"]*"/g) ?? [];
    // hero CTA + closing CTA + the sticky bar's CTA + submit + 3 ticks; SELECTED badges appear only once something is chosen.
    expect(fills).toHaveLength(7);
    expect(html).not.toContain("MOST POPULAR");
    expect(html).not.toMatch(/\btext-accent\b/);
    // The one other orange: the four bracket corners of the proof exhibit in the hero (DESIGN §4.6), and nowhere else.
    const corners = html.match(/class="[^"]*\bborder-accent\b[^"]*"/g) ?? [];
    expect(corners).toHaveLength(4);
    for (const c of corners) expect(c).toMatch(/pointer-events-none absolute size-7 border-accent/);
    const visual = between('data-hero-visual=""', 'data-proof-strip=""');
    expect(visual.match(/\bborder-accent\b/g)).toHaveLength(4);
    // The finish swatches are gradients of the finishes, never the accent token.
    expect(html).not.toMatch(/style="[^"]*var\(--color-accent\)/);
    // Native controls are ink; the one accent-accent left is ConsentRow's own class, overridden by the quiet panel.
    const accentControls = html.match(/<input[^>]*class="[^"]*\baccent-accent\b[^"]*"/g) ?? [];
    expect(accentControls.every((tag) => /id="fp-consents-/.test(tag))).toBe(true);
  });

  it("text measures: every paragraph is capped at 60–62ch or narrower", () => {
    const paragraphs = html.match(/<p\b[^>]*>/g) ?? [];
    const wide = paragraphs.filter((p) => /max-w-\[(\d+)ch\]/.test(p) && Number(/max-w-\[(\d+)ch\]/.exec(p)![1]) > 62);
    expect(wide).toEqual([]);
  });

  it("mounts the Turnstile box only when a site key is passed", () => {
    expect(html).not.toContain("data-turnstile");
    const props = {
      sports: [],
      art: {},
      products: [],
      styles: [],
      photosSubhead: "",
      examples: { good: null, bad: null },
      todayIso: "2026-10-04",
    };
    expect(renderToStaticMarkup(createElement(IntakeForm, { ...props, turnstileSiteKey: "1x00000000000000000000AA" }))).toContain("data-turnstile");
    expect(renderToStaticMarkup(createElement(IntakeForm, props))).not.toContain("data-turnstile");
  });

  it("the page's own source never types a price, a provider name or a banned word — and the form island never imports the asset map", () => {
    const files = [
      ...fs.readdirSync(path.join(ROOT, "components/intake")).map((f) => path.join("components/intake", f)),
      "app/(marketing)/free-proof/page.tsx",
      "app/(marketing)/free-proof/_shared/view.tsx",
      "app/(marketing)/free-proof/for/[sport]/page.tsx",
      "app/(marketing)/free-proof/thanks/page.tsx",
    ];
    for (const f of files) {
      const src = fs.readFileSync(path.join(ROOT, f), "utf8");
      expect(src, f).not.toMatch(/\$\d/);
      expect(src, f).not.toMatch(/stripe|paypal|\binstant|\byouth\b|\bpdf\b|cheaper/i);
      // lib/assets.ts (and the server-only art map behind it) stays out of every client module — types only.
      if (f.startsWith("components/intake/")) {
        expect(src, f).not.toMatch(/^import (?!type )[^;]*from "\.\.\/\.\.\/lib\/assets"/m);
        expect(src, f).not.toMatch(/^import (?!type )[^;]*from "\.\.\/\.\.\/lib\/intake\/sport-art"/m);
      }
    }
    // The server view (the page and its per-sport twins) resolves the art map once and hands it over.
    const view = fs.readFileSync(path.join(ROOT, "app/(marketing)/free-proof/_shared/view.tsx"), "utf8");
    expect(view).toContain("freeProofArtMap()");
    expect(fs.readFileSync(path.join(ROOT, "app/(marketing)/free-proof/page.tsx"), "utf8")).toContain("<FreeProofView />");
  });
});

describe("/free-proof/for/<sport> — the per-sport twin next.config.ts rewrites /free-proof?sport=<slug> to (v5)", () => {
  it("is prerendered for the seventeen sports only, with /free-proof's own metadata and canonical", () => {
    expect(twin.dynamicParams).toBe(false);
    expect(twin.generateStaticParams().map((p) => p.sport)).toEqual(sports.map((x) => x.slug));
    expect(twin.metadata).toEqual(pageMetadata);
    expect(twin.metadata.alternates?.canonical).toBe(INTAKE_PATH);
  });

  it("is /free-proof with the link's sport as the example: every picture in it from the first byte, nothing from football", async () => {
    const out = decode(renderToStaticMarkup((await twin.default({ params: Promise.resolve({ sport: "basketball" }) })) as ReactElement));
    const bk = REAL.basketball;
    const hero = out.slice(out.indexOf('data-hero-visual=""'), out.indexOf('data-proof-strip=""'));
    expect(srcs(hero)).toEqual([bk.poster!.src, bk.cards.SN!.src, ...bk.photos!.map((p) => p.src)]);
    expect(hero).toContain('data-example="basketball"');
    expect(hero).toContain(INTAKE_COPY.art.pick("Basketball"));
    // Everything that follows the sport is basketball's: the exhibit, card 04, the product tiles.
    const cards = out.slice(out.indexOf('data-proof-band=""')).split('<li data-step-card=""').slice(1, 5);
    const tiles = out.slice(out.indexOf('id="step-2"'), out.indexOf('id="step-3"'));
    for (const src of [...srcs(hero), ...srcs(cards[3]), ...srcs(tiles)]) expect(src, src).toMatch(/^\/images\/free-proof\/basketball\//);
    // The same page otherwise: the form, the six steps, the same headline.
    expect(out).toContain(INTAKE_COPY.h1);
    expect(out).toContain('id="step-4"');
  });
});

describe("/free-proof/thanks", () => {
  const render = async (ref?: string | string[]) =>
    decode(renderToStaticMarkup((await ThanksPage({ searchParams: Promise.resolve(ref === undefined ? {} : { ref }) })) as ReactElement));

  it("is never indexed", () => {
    expect(thanksMetadata.robots).toEqual({ index: false, follow: false });
    expect(thanksMetadata.alternates?.canonical).toBe(INTAKE_THANKS_PATH);
  });

  it("shows the copy: H1, lead, the next steps in order, reply, nothing to pay, two outline links", async () => {
    const out = await render("GDE-R-20261004-7KQ2MX");
    expect(out).toMatch(new RegExp(`<h1[^>]*>${esc(INTAKE_COPY.thanks.h1)}</h1>`));
    expect(out).toContain(INTAKE_COPY.thanks.lead);
    let at = 0;
    for (const line of INTAKE_COPY.thanks.next) {
      const next = out.indexOf(line, at);
      expect(next, line).toBeGreaterThan(at);
      at = next;
    }
    expect(out).toContain(INTAKE_COPY.thanks.reply);
    expect(out).toContain(INTAKE_COPY.thanks.nothingToPay);
    expect(out).toMatch(/href="\/"[^>]*>Back to the home page</);
    expect(out).toMatch(/href="\/photo-guide"[^>]*>The photo guide</);
    expect(out).not.toContain("bg-accent");
  });

  it("prints the reference only when it is a well-formed request id", async () => {
    const good = await render("GDE-R-20261004-7KQ2MX");
    expect(good).toContain(INTAKE_COPY.thanks.referenceLabel);
    expect(good).toContain(">GDE-R-20261004-7KQ2MX<");
    for (const bad of ["<script>alert(1)</script>", "GDE-R-2026-XYZ", "gde-r-20261004-7kq2mx", ""]) {
      const out = await render(bad);
      expect(out, bad).not.toContain(INTAKE_COPY.thanks.referenceLabel);
      expect(out, bad).not.toContain("<script>alert(1)");
    }
    expect(await render()).not.toContain(INTAKE_COPY.thanks.referenceLabel);
    expect(await render(["GDE-R-20261004-7KQ2MX", "x"])).toContain(">GDE-R-20261004-7KQ2MX<");
  });
});

describe("the form model (components/intake/model.ts)", () => {
  const photoMeta = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `IMG_${i}.jpg`, size: 1_500_000, type: "image/jpeg" }));
  const filled = () => {
    const s = model.initialState();
    s.products.cards = { selected: true, option: "p12" };
    s.products.poster = { selected: true, option: "digital" };
    s.style = "SN";
    s.athlete = { ...s.athlete, firstName: "Marcus", lastName: "Ellison", sportSlug: "basketball", jerseyNumber: "12", position: "Guard", team: "Cedar Ridge Bears" };
    s.athlete.stats = [{ value: "", label: "" }, { value: "18.4", label: "PPG" }, { value: "", label: "" }];
    s.contact = { ...s.contact, name: "Dana Ellison", email: "dana@example.com" };
    s.consents = { ...s.consents, guardian: true, biometric: true, license: true };
    return s;
  };
  const source = model.captureSource("/free-proof", "?utm_source=meta&utm_campaign=fall&fbclid=abc&email=x@y.z", "https://l.facebook.com/");

  it("captureSource reports the session's ENTRY page when one was recorded, and the form's own tags still win (2026-10-06)", () => {
    const entry = { path: "/senior-night/volleyball", referrer: "https://www.google.com/", utm: { utm_source: "pinterest" } };
    const withEntry = model.captureSource("/free-proof", "", "https://www.gamedayedition.com/senior-night", entry);
    expect(withEntry.landingPath).toBe("/senior-night/volleyball");
    expect(withEntry.referrer).toBe("https://www.google.com/");
    expect(withEntry.utm).toEqual({ utm_source: "pinterest" });
    const tagged = model.captureSource("/free-proof", "?utm_source=meta", "", entry);
    expect(tagged.utm).toEqual({ utm_source: "meta" });
    expect(model.captureSource("/free-proof", "", "", null).landingPath).toBe("/free-proof");
  });

  it("a filled form builds a payload the shared validator accepts — phone and country travel empty, the server keeps its default", () => {
    const { payload, statRows } = model.buildPayload(filled(), { photos: photoMeta(5), crest: null }, source);
    expect(payload.contact).toMatchObject({ phone: "", country: "" });
    const r = parseProofRequest(payload);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // v4: no quantity in the form — every chosen option, printed or digital, goes as one.
    expect(r.value.products).toEqual([
      { product: "cards", option: "p12", quantity: 1 },
      { product: "poster", option: "digital", quantity: 1 },
    ]);
    expect(r.value.athlete.stats).toEqual([{ value: "18.4", label: "PPG" }]);
    expect(statRows).toEqual([1]);
    expect(r.value.source.utm).toEqual({ utm_source: "meta", utm_campaign: "fall", fbclid: "abc" });
    expect(r.value.consents.crest).toBe(false);
    expect(r.value.contact.country).toBe("United States");
  });

  it("v4: no quantity control and quantity 1 in the payload; no marketing consent, no team colours, no need-it-by date — absent, not sent empty", () => {
    const s = filled();
    s.products.banner = { selected: true, option: "3x6" };
    s.products.blanket = { selected: true, option: "60x80" };
    const { payload } = model.buildPayload(s, { photos: photoMeta(4), crest: null }, source);
    expect((payload.products as { quantity: number }[]).map((p) => p.quantity)).toEqual([1, 1, 1, 1]);
    expect(Object.keys(model.initialState().products.cards)).toEqual(["selected", "option"]);
    expect(Object.keys(payload.consents as object)).toEqual(["guardian", "biometric", "license", "crest"]);
    expect(payload.athlete).not.toHaveProperty("colors");
    expect(payload.contact).not.toHaveProperty("neededBy");
    expect(model.initialState().contact).not.toHaveProperty("neededBy");
    expect(model.initialState().athlete).not.toHaveProperty("colors");
    // The parser stays tolerant: an older tab that still sends them is accepted, the marketing box read as given.
    const older = parseProofRequest({ ...payload, athlete: { ...(payload.athlete as object), colors: { primary: "#112233", secondary: "" } }, contact: { ...(payload.contact as object), neededBy: "2026-11-01" }, consents: { ...(payload.consents as object), marketing: true } });
    expect(older.ok).toBe(true);
    const r = parseProofRequest(payload);
    expect(r.ok && r.value.consents.marketing).toBe(false);
    expect(r.ok && r.value.athlete.colors).toEqual({ primary: "", secondary: "" });
    expect(r.ok && r.value.contact.neededBy).toBe("");
  });

  it("the sport is asked once (step 1): changing it keeps everything typed, and drops only the number when the new sport never wears one", () => {
    const s = filled();
    s.athlete = { ...s.athlete, jerseyNumber: "12", team: "Cedar Ridge Bears", headline: "This is my court" };
    const football = model.chooseSport(s, "football");
    expect(football.athlete).toMatchObject({ sportSlug: "football", jerseyNumber: "12", firstName: "Marcus", team: "Cedar Ridge Bears", headline: "This is my court" });
    const cheer = model.chooseSport(football, "cheerleading");
    expect(cheer.athlete).toMatchObject({ sportSlug: "cheerleading", jerseyNumber: "", firstName: "Marcus", lastName: "Ellison", team: "Cedar Ridge Bears", headline: "This is my court" });
    for (const sp of sports) expect(model.chooseSport(s, sp.slug).athlete.jerseyNumber, sp.slug).toBe(isNumberless(sp) ? "" : "12");
    // "Other" keeps the number field (optional); an unknown value changes nothing.
    expect(model.chooseSport(s, SPORT_OTHER).athlete).toMatchObject({ sportSlug: SPORT_OTHER, jerseyNumber: "12" });
    expect(model.chooseSport(s, "quidditch")).toBe(s);
    expect(model.isSportChoice("other-sport")).toBe(true);
    expect(model.isSportChoice(SPORT_OTHER)).toBe(true);
  });

  it("'Other sport or activity' travels as SPORT_OTHER plus the typed words — never as other-sport (Skateboarding)", () => {
    const s = model.chooseSport(filled(), SPORT_OTHER);
    s.athlete.sportOther = "  Rowing  ";
    const r = parseProofRequest(model.buildPayload(s, { photos: photoMeta(4), crest: null }, source).payload);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.athlete).toMatchObject({ sportSlug: "other", sportOther: "Rowing", jerseyNumber: "12" });
    expect(SPORT_OTHER).not.toBe("other-sport");
    // The typed words go only with "Other": a catalog sport never carries them.
    const fb = model.chooseSport(s, "football");
    expect((model.buildPayload(fb, { photos: photoMeta(4), crest: null }, source).payload.athlete as Record<string, string>).sportOther).toBe("");
    // "Other" without words is refused with its own sentence, on its own field.
    s.athlete.sportOther = " ";
    const empty = parseProofRequest(model.buildPayload(s, { photos: photoMeta(4), crest: null }, source).payload);
    expect(empty.ok ? {} : empty.errors).toHaveProperty("athlete.sportOther");
    expect(model.errorTarget("athlete.sportOther")).toBe("fp-athlete-sportOther");
    expect(model.errorTarget("athlete.sportSlug")).toBe("fp-sport-basketball");
    expect(model.sportName(SPORT_OTHER, "rowing")).toBe("rowing");
    expect(model.sportName("other-sport")).toBe("Skateboarding");
    expect(model.sportName("")).toBeNull();
  });

  it("one sport on the whole page: art for a sport with art, the grey set before a sport and for a sport (or 'Other') without", () => {
    expect(model.artState(ART, "")).toBe("pick");
    expect(model.artState(ART, "football")).toBe("art");
    expect(model.artState(ART, "golf")).toBe("none");
    expect(model.artState(ART, SPORT_OTHER)).toBe("none");
    expect(model.sportArt(ART, "football")).toBe(ART.football);
    expect(model.sportArt(ART, SPORT_OTHER)).toBeNull();
    expect(model.sportArt({ golf: { cards: {} } }, "golf")).toBeNull();
    // A slot that asks for a finish the sport lacks: exact → null; "any card of this sport" → its first finish.
    expect(model.cardImage(ART.volleyball as never, "CA")).toBeNull();
    expect(model.cardImage(ART.volleyball as never, "CA", true)).toBe(ART.volleyball.cards.SN);
    expect(model.productImage(ART.football as never, "blanket", "")).toBeNull();
    expect(model.productImage(ART.football as never, "cards", "HE")).toBe(ART.football.cards.HE);
    // The pictures above the form hear the choice through the shared store; the server snapshot is always empty.
    const heard: number[] = [];
    const stop = model.choiceStore.subscribe(() => heard.push(1));
    model.choiceStore.set({ sport: "football", sportOther: "", style: "SN" });
    model.choiceStore.set({ sport: "football", sportOther: "", style: "SN" });
    expect(model.choiceStore.get()).toEqual({ sport: "football", sportOther: "", style: "SN" });
    expect(model.choiceStore.getServer()).toEqual({ sport: "", sportOther: "", style: "" });
    model.choiceStore.set({ sport: "", sportOther: "", style: "" });
    stop();
    expect(heard).toHaveLength(2);
  });

  it("drops what does not apply: a numberless sport's number, the SR fields without SR, the crest consent without a crest", () => {
    const s = filled();
    s.athlete = { ...s.athlete, sportSlug: "gymnastics", classOf: "2027", eventDate: "2026-11-01" };
    s.consents.crest = true;
    const { payload } = model.buildPayload(s, { photos: photoMeta(4), crest: null }, source);
    const a = payload.athlete as Record<string, unknown>;
    expect(a.jerseyNumber).toBe("");
    expect(a.classOf).toBe("");
    expect(a.eventDate).toBe("");
    expect((payload.consents as Record<string, boolean>).crest).toBe(false);
    s.style = "SR";
    const sr = model.buildPayload(s, { photos: photoMeta(4), crest: null }, source).payload.athlete as Record<string, unknown>;
    expect(sr.classOf).toBe("2027");
  });

  it("maps every error key to a control id, and stat errors back to the row they came from", () => {
    expect(model.errorTarget("athlete.firstName")).toBe("fp-athlete-firstName");
    expect(model.errorTarget("consents.biometric")).toBe("fp-consents-biometric");
    expect(model.errorTarget("products")).toBe("fp-product-cards");
    expect(model.errorTarget("style")).toBe("fp-style-SN");
    expect(model.errorTarget("photos")).toBe("fp-photos-choose");
    expect(model.errorTarget("athlete.stats.0", [2])).toBe("fp-athlete-stats-2-value");
    expect(model.errorTarget("athlete.sportSlug")).toBe(`fp-sport-${sports[0].slug}`);
    expect(model.statErrorsByRow({ "athlete.stats.0": "x", "contact.email": "y" }, [2])).toEqual({ 2: "x" });
    const s = filled();
    s.athlete.stats = [{ value: "", label: "" }, { value: "", label: "" }, { value: "9", label: "" }];
    const built = model.buildPayload(s, { photos: photoMeta(4), crest: null }, source);
    const r = parseProofRequest(built.payload);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(model.statErrorsByRow(r.errors, built.statRows)).toEqual({ 2: r.errors["athlete.stats.0"] });
  });

  it("an error behind '+ Add optional details' opens the group; the visible fields' errors do not", () => {
    expect(model.OPTIONAL_DETAIL_KEYS[0]).toBe("athlete.headline");
    expect(model.hasOptionalDetailError({ "athlete.stats.1": "x" })).toBe(true);
    expect(model.hasOptionalDetailError({ "athlete.season": "x" })).toBe(true);
    expect(model.hasOptionalDetailError({ "athlete.headline": "x" })).toBe(true);
    expect(model.hasOptionalDetailError({ "athlete.firstName": "x", "contact.email": "y", "athlete.classOf": "z", "athlete.sportOther": "w" })).toBe(false);
  });

  it("the summary sum (pricing v1): the chosen options through bundleTotal — one of each, any two or more products bundled", () => {
    const products = PRODUCTS.map((p) => ({ key: p.key, options: p.options.map((o) => ({ key: o.key, printed: o.printed, price: optionPrice(o) })) }));
    const s = model.initialState();
    expect(model.chosenLines(products, s.products)).toEqual([]);
    expect(model.orderTotal(products, s.products)).toBeNull();
    s.products.cards = { selected: true, option: "p12" };
    expect(model.orderTotal(products, s.products)).toEqual(bundleOf([["cards", "p12"]]));
    expect(model.orderTotal(products, s.products)!.total).toBe(priceOf("cards", "p12"));
    s.products.poster = { selected: true, option: "p1824" };
    expect(model.chosenLines(products, s.products)).toEqual([
      { product: "cards", price: priceOf("cards", "p12") },
      { product: "poster", price: priceOf("poster", "p1824") },
    ]);
    // Cards + poster at the printed-set options cost exactly the Printed Set (the set tier is the same bundle).
    expect(model.orderTotal(products, s.products)!.total).toBe(bundleOf([["cards", "p12"], ["poster", "p1824"]]).total);
    s.products.poster.option = "digital";
    expect(model.orderTotal(products, s.products)).toEqual(bundleOf([["cards", "p12"], ["poster", "digital"]]));
    s.products.blanket = { selected: true, option: "50x60" };
    s.products.banner = { selected: true, option: "3x6" };
    const four = model.orderTotal(products, s.products)!;
    expect(four).toEqual(bundleOf([["cards", "p12"], ["poster", "digital"], ["banner", "3x6"], ["blanket", "50x60"]]));
    expect(four.discountRate).toBe(0.25);
  });

  it("the ladder's rung and nudge (pricing v1): the reached step by product count, the next product and what it saves on top", () => {
    expect([0, 1, 2, 3, 4].map(model.bundleStepIndex)).toEqual([-1, -1, 0, 1, 2]);
    const products = PRODUCTS.map((p) => ({ key: p.key, options: p.options.map((o) => ({ key: o.key, printed: o.printed, price: optionPrice(o) })) }));
    const s = model.initialState().products;
    expect(model.bundleNudge(products, s)).toBeNull();
    s.poster = { selected: true, option: "p2436" };
    // The first product not chosen, at the option its card holds (cards → digital until switched).
    expect(model.bundleNudge(products, s)).toEqual({ add: "cards", saving: bundleOf([["poster", "p2436"], ["cards", "digital"]]).discount, first: true });
    s.cards = { selected: true, option: "p24" };
    const before = bundleOf([["cards", "p24"], ["poster", "p2436"]]).discount;
    const after = bundleOf([["cards", "p24"], ["poster", "p2436"], ["banner", "digital"]]).discount;
    expect(model.bundleNudge(products, s)).toEqual({ add: "banner", saving: Math.round((after - before) * 100) / 100, first: false });
    expect(model.bundleNudge(products, s)!.saving).toBeGreaterThan(0);
    s.banner = { selected: true, option: "1x2" };
    s.blanket = { selected: true, option: "60x80" };
    expect(model.bundleNudge(products, s)).toBeNull();
  });

  describe("the live text preview in 'Your order' (owner, 2026-10-06)", () => {
    const front = (code: string) => model.cardImage(ART.football as never, code, true);
    const stylesData = styleTiles();
    const typed = { ...model.initialState().athlete, firstName: "Jordan", lastName: "Okafor", jerseyNumber: "23", sportSlug: "basketball", team: "Riverside Hawks" };
    const preview = (athlete: typeof typed | null, style: string) =>
      decode(renderToStaticMarkup(createElement(CardTextPreview, { image: front(model.previewFinish(style as never)), athlete, style: style as never, sizes: "192px" })));
    const summary = (athlete: typeof typed | null, variant: "rail" | "bar", style = "", art: unknown = ART.football, sport: string | null = "Football") =>
      decode(
        renderToStaticMarkup(
          createElement(SummaryRail, { products: [], state: model.initialState().products, styles: stylesData, style: style as never, athlete, variant, art: art as never, sport }),
        ),
      );

    it("updates with what is typed: the last name large, the first name above it, #number, position · team", () => {
      const before = preview(typed, "SN");
      expect(before).toMatch(/data-preview-text=""[^>]*>[\s\S]*>Jordan<\/p>[\s\S]*>Okafor<\/p>[\s\S]*>#23 · Riverside Hawks<\/p>/);
      expect(before).toContain("font-display uppercase");
      const after = preview({ ...typed, lastName: "Okafor-Whitfield", position: "Point guard" }, "SN");
      expect(after).toContain(">Okafor-Whitfield</p>");
      expect(after).toContain(">#23 · Point guard · Riverside Hawks</p>");
      // A long name shrinks to fit the card — it is never cut.
      expect(/font-size:([\d.]+)cqw/.exec(after.slice(after.indexOf("Okafor-Whitfield") - 120))?.[1]).toBe((172 / "Okafor-Whitfield".length).toFixed(2));
      // The summary passes the state through, in the rail and in the phone bar alike.
      for (const variant of ["rail", "bar"] as const) expect(summary(typed, variant)).toContain(">Okafor</p>");
    });

    it("follows the finish: centred for Chrome All-Star and Heritage, flush left for every other style", () => {
      for (const st of styles) {
        const out = preview(typed, st.code);
        const centred = st.code === "CA" || st.code === "HE";
        expect(out, st.code).toContain(`data-align="${centred ? "center" : "left"}"`);
        expect(out, st.code).toContain(centred ? "items-center text-center" : "items-start text-left");
      }
      // Until a style is chosen (or "recommend"), the Stadium Night front, flush left.
      expect(model.previewFinish("")).toBe("SN");
      expect(model.previewFinish("recommend")).toBe("SN");
      expect(preview(typed, "")).toContain('data-align="left"');
      // Senior Night adds the class year in the senior gold; a numberless sport never shows a number.
      expect(preview({ ...typed, classOf: "2027" }, "SR")).toContain(">Class of 2027</p>");
      expect(preview({ ...typed, classOf: "2027" }, "SN")).not.toContain("Class of");
      expect(preview({ ...typed, sportSlug: "gymnastics" }, "SN")).not.toContain("#23");
    });

    it("carries the caption under the mockup and keeps C13 on the card image, in both summaries", () => {
      for (const variant of ["rail", "bar"] as const) {
        const out = summary(typed, variant);
        const card = out.indexOf('data-card-preview=""');
        expect(card, variant).toBeGreaterThan(-1);
        expect(out.indexOf(INTAKE_COPY.previewCaption), variant).toBeGreaterThan(card);
        expect(out.slice(card, out.indexOf(INTAKE_COPY.previewCaption)), variant).toContain(CANON.fictionalLabel);
      }
      // The bar's mockup is 120 px wide — the minimum the owner set for the phone.
      expect(summary(typed, "bar")).toContain('<div class="w-[7.5rem] shrink-0">');
    });

    it("is the chosen sport's card in the chosen finish — the grey card in that finish's frame where it has none — and names the sport", () => {
      for (const variant of ["rail", "bar"] as const) {
        const fb = summary(typed, variant, "HE");
        expect(srcs(fb), variant).toEqual([ART.football.cards.HE.src]);
        expect(fb).toContain(`>${UI_SPORT}</span><span class="block text-muted-text">Football</span>`);
        // A finish the sport has no front of → the grey card wearing that finish, never another finish's or sport's athlete.
        const vb = summary(typed, variant, "CA", ART.volleyball, "Volleyball");
        expect(srcs(vb), variant).toEqual([]);
        expect(vb).toMatch(/data-neutral="card" aria-hidden="true" style="aspect-ratio:5\/7;background-image:linear-gradient/);
        expect(vb).not.toContain(CANON.fictionalLabel);
        // Before a sport: the grey card, no sport line, the empty state.
        const none = summary(null, variant, "", null, null);
        expect(srcs(none)).toEqual([]);
        expect(none).toContain(INTAKE_COPY.summary.empty);
      }
    });

    it("draws nothing that was not typed — never a placeholder name, number or season", () => {
      expect(model.previewText(model.initialState().athlete, "SN")).toBeNull();
      expect(model.previewText(model.initialState().athlete, "SR")).toBeNull();
      const empty = preview(model.initialState().athlete, "SN");
      expect(empty).not.toContain("data-preview-text");
      expect(empty).toContain('data-card-preview=""');
      for (const variant of ["rail", "bar"] as const) expect(summary(null, variant)).not.toContain("data-preview-text");
      // Only the first name typed: only the first name drawn.
      const first = model.previewText({ ...model.initialState().athlete, firstName: "Jordan" }, "SN");
      expect(first).toEqual({ first: "Jordan", last: "", number: "", meta: "", classLine: "" });
    });

    it("hears step 3 through the shared store when the form does not pass the athlete in", () => {
      const heard: number[] = [];
      const stop = model.athleteStore.subscribe(() => heard.push(1));
      model.athleteStore.set(typed);
      expect(model.athleteStore.get()).toBe(typed);
      model.athleteStore.set(typed);
      model.athleteStore.set(null);
      stop();
      model.athleteStore.set(typed);
      expect(heard).toHaveLength(2);
      expect(model.athleteStore.getServer()).toBeNull();
      model.athleteStore.set(null);
    });
  });

  it("every field reads as a field: white fill, a 1.5 px ink-60 edge, full ink on focus, §4.21's 56 px", () => {
    for (const recipe of [INPUT, SELECT, TEXTAREA]) {
      expect(recipe).toContain("bg-white");
      expect(recipe).toContain("border-[1.5px]");
      expect(recipe).toContain("focus:border-ink");
      expect(recipe).not.toContain("outline-none");
    }
    expect(INPUT).toContain("h-14");
    expect(SELECT).toContain("h-14");
    expect(fieldBorder(false)).toBe("border-ink/60");
    expect(fieldBorder(true)).toBe("border-fail");
    // The edge against the stock page: ink at 60 % over the white fill, 4.2 : 1 (it was ink 40 % over stock, 2.5 : 1).
    const mix = (alpha: number, under: [number, number, number]) =>
      `#${[0x14, 0x19, 0x1f].map((c, i) => Math.round(alpha * c + (1 - alpha) * under[i]).toString(16).padStart(2, "0")).join("")}`;
    expect(contrastRatio(mix(0.6, [255, 255, 255]), "#F4F3EF")).toBeGreaterThanOrEqual(4);
    expect(contrastRatio(mix(0.4, [0xf4, 0xf3, 0xef]), "#F4F3EF")).toBeLessThan(3);
    // The rendered athlete step uses it: every visible athlete input and select is white with the ink-60 edge.
    const step4 = between('id="step-2"', 'id="step-3"');
    for (const tag of step4.match(/<(input|select)[^>]*id="fp-athlete-(firstName|lastName|jerseyNumber|team)"[^>]*>/g) ?? []) {
      expect(tag).toMatch(/bg-white/);
      expect(tag).toMatch(/border-ink\/60/);
    }
  });

  it("reads an ad's deep link, and ignores what it doesn't know", () => {
    const get = (q: string) => (k: string) => new URLSearchParams(q).get(k);
    expect(model.parsePrefill(get("product=cards,poster&option=p12&sport=basketball&style=SN&classOf=2027"))).toEqual({
      products: ["cards", "poster"],
      options: { cards: "p12" },
      sport: "basketball",
      style: "SN",
      classOf: "2027",
    });
    expect(model.parsePrefill(get("option=p1824"))).toMatchObject({ products: [], options: { poster: "p1824" } });
    expect(model.parsePrefill(get("option=digital")).options).toEqual({});
    expect(model.parsePrefill(get("product=cards&option=cards:p24,banner:3x6")).options).toEqual({ cards: "p24", banner: "3x6" });
    expect(model.parsePrefill(get("product=mug&sport=quidditch&style=ZZ&classOf=1999"))).toEqual({ products: [], options: {}, sport: undefined, style: undefined, classOf: undefined });
    expect(model.parsePrefill(get("style=recommend")).style).toBe("recommend");
    // v8 (ads brief §16): the words an ad writer uses, and a campaign that implies the look; `style=` still wins.
    expect(model.parsePrefill(get("product=card")).products).toEqual(["cards"]);
    expect(model.parsePrefill(get("product=complete-set")).products).toEqual(["cards", "poster"]);
    expect(model.parsePrefill(get("product=set,blanket")).products).toEqual(["cards", "poster", "blanket"]);
    expect(model.parsePrefill(get("campaign=senior-night")).style).toBe("SR");
    expect(model.parsePrefill(get("campaign=senior-night&style=CA")).style).toBe("CA");
    expect(model.parsePrefill(get("campaign=black-friday")).style).toBeUndefined();
    const set = model.applyPrefill(model.initialState(), model.parsePrefill(get("sport=football&product=complete-set")));
    expect(model.categoryOf(set.products)).toBe("set");
    expect(model.categoryOf(model.chooseCategory(set, "poster").products)).toBe("poster");
    expect(model.chooseCategory(set, "card").products.blanket.selected).toBe(false);
    const applied = model.applyPrefill(model.initialState(), model.parsePrefill(get("option=p1824&style=sr")));
    expect(applied.products.poster).toEqual({ selected: true, option: "p1824" });
    expect(applied.style).toBe("SR");
  });

  it("prefills the sport from ?sport= (ads and every site CTA pass it) — and it stays changeable", () => {
    const get = (q: string) => (k: string) => new URLSearchParams(q).get(k);
    for (const sp of sports) {
      const state = model.applyPrefill(model.initialState(), model.parsePrefill(get(`sport=${sp.slug}&product=cards`)));
      expect(state.athlete.sportSlug, sp.slug).toBe(sp.slug);
      expect(state.products.cards.selected).toBe(true);
    }
    // A code is accepted as input; an unknown sport is ignored, never an error.
    expect(model.parsePrefill(get("sport=FOOTBALL")).sport).toBe("football");
    expect(model.applyPrefill(model.initialState(), model.parsePrefill(get("sport=quidditch"))).athlete.sportSlug).toBe("");
    // Prefilled, then changed in step 1: the last choice wins and the typed name stays.
    const pre = model.applyPrefill(model.initialState(), model.parsePrefill(get("sport=volleyball")));
    pre.athlete.firstName = "Ava";
    const changed = model.chooseSport(pre, "cheerleading");
    expect(changed.athlete).toMatchObject({ sportSlug: "cheerleading", firstName: "Ava" });
    // The island reads the URL in its own Suspense boundary (the page stays static) and hands the prefill to the form.
    const island = fs.readFileSync(path.join(ROOT, "components/intake/PrefillFromUrl.tsx"), "utf8");
    expect(island).toContain("useSearchParams");
    expect(fs.readFileSync(path.join(ROOT, "components/intake/IntakeForm.tsx"), "utf8")).toMatch(/<Suspense fallback=\{null\}>\s*<PrefillFromUrl onPrefill=\{onPrefill\} \/>/);
  });

  it("screens photos: type, size, duplicates and the ten-photo limit", () => {
    const f = (name: string, size = 1000, type = "image/jpeg", lastModified = 1) => ({ name, size, type, lastModified });
    const existing = Array.from({ length: 8 }, (_, i) => f(`e${i}.jpg`));
    const { accepted, rejected } = model.screenPhotos(existing, [
      f("e0.jpg"),
      f("notes.txt", 10, "text/plain"),
      f("huge.jpg", PHOTO_RULES.maxBytes + 1),
      f("IMG_9.HEIC", 5000, ""),
      f("ok.png", 10, "image/png"),
      f("eleventh.webp", 10, "image/webp"),
    ]);
    expect(accepted.map((x) => x.name)).toEqual(["IMG_9.HEIC", "ok.png"]);
    expect(rejected).toEqual([
      { name: "e0.jpg", reason: "duplicate" },
      { name: "notes.txt", reason: "type" },
      { name: "huge.jpg", reason: "size" },
      { name: "eleventh.webp", reason: "limit" },
    ]);
    expect(model.canPreview(f("IMG_9.HEIC", 1, ""))).toBe(false);
    expect(model.isCrestFile(f("crest.svg", 100, "image/svg+xml"))).toBe(true);
  });

  it("captures the source without anything personal, and splits the set sentence out of the products subhead", () => {
    expect(source).toEqual({ landingPath: "/free-proof", referrer: "https://l.facebook.com/", utm: { utm_source: "meta", utm_campaign: "fall", fbclid: "abc" } });
    const { lead, set } = model.splitSetSentence(INTAKE_COPY.sections.products.subhead);
    expect(`${lead} ${set}`).toBe(INTAKE_COPY.sections.products.subhead);
    expect(set).toMatch(/set\.$/);
    expect(model.setLineWithPrice(set, setFromLabel())).toBe(`${set.slice(0, -1)} — ${setFromLabel()}.`);
    expect(model.validRequestRef("GDE-R-20261004-7KQ2MX")).toBe("GDE-R-20261004-7KQ2MX");
    expect(model.validRequestRef("nope")).toBeNull();
  });

  it("the storage fallback names the support address the mailto uses", () => {
    expect(INTAKE_COPY.errors.storageMissing(SUPPORT_EMAIL)).toContain(SUPPORT_EMAIL);
  });
});
