// /free-proof and /free-proof/thanks: the server pages rendered to static markup — the form island
// included, since it must render without `window` — plus the pure form model in components/intake/model.ts.
// v2 (builder A2, 2026-10-04): the owner's design review — a landing hero, four how-it-works cards, five
// numbered steps, the permissions panel and the conversion card, a sticky "Your order" panel.
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
const { IntakeForm } = await import("../components/intake/IntakeForm");
const { INTAKE_COPY, INTAKE_PATH, INTAKE_THANKS_PATH } = await import("../lib/intake/copy");
const { CONSENTS, CONSENT_ORDER, PHOTO_RULES, parseProofRequest } = await import("../lib/intake/types");
const { PRODUCTS, PRICE_ON_PROOF, optionPriceLabel, productFromLabel, setFromLabel } = await import("../lib/intake/products");
const { DUE_TODAY_LABEL, formatUsd, getTier, sitePrice } = await import("../lib/catalog/prices");
const { styles } = await import("../lib/catalog/styles");
const { CANON, PROOF_PATH_LABEL } = await import("../lib/copy/canon");
const { STEP_PROOF_KEY } = await import("../components/ProofPath");
const { HERO_PHOTO_KEYS } = await import("../components/intake/IntakeHero");
const { CardTextPreview, SummaryRail } = await import("../components/intake/SummaryRail");
const { ProductPicker } = await import("../components/intake/ProductPicker");
const { INPUT, SELECT, TEXTAREA, border: fieldBorder } = await import("../components/intake/fields");
const { contrastRatio } = await import("../lib/color");
const { asset, hasAsset } = await import("../lib/assets");
const { SUPPORT_EMAIL } = await import("../lib/site");
const model = await import("../components/intake/model");

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

/** The Complete Set tiers the page prices as option pairs (lib/cta.ts SET_TIER_OPTIONS). */
const price = (sku: string) => sitePrice(getTier(sku)!);
const SAVING = Math.round((price("GDE-ANY-CARD-DIG") + price("GDE-ANY-POST-DIG") - price("GDE-ANY-SET-DIG")) * 100) / 100;

describe("/free-proof — the page a Meta ad lands on", () => {
  it("is the titles-table row, indexable", () => {
    expect(pageMetadata.alternates?.canonical).toBe(INTAKE_PATH);
    expect(pageMetadata.robots).toBeUndefined();
  });

  it("opens as a landing: H1 → one sentence → the orange CTA to step 1 → the small note; the claims as quiet type", () => {
    expect(count(/<h1[\s>]/g)).toBe(1);
    expect(html).toMatch(new RegExp(`<h1[^>]*>${esc(INTAKE_COPY.h1)}</h1>`));
    const h1 = html.indexOf(INTAKE_COPY.h1);
    const line = html.indexOf(INTAKE_COPY.heroLine);
    const cta = /<a href="#step-1"[^>]*class="([^"]*)"[^>]*>([^<]*)<\/a>/.exec(html);
    expect(cta?.[2]).toBe(INTAKE_COPY.heroCta);
    expect(cta?.[1]).toMatch(/\bbg-accent\b/);
    const ctaAt = html.indexOf(cta![0]);
    const note = html.indexOf(INTAKE_COPY.heroCtaNote);
    expect(h1).toBeLessThan(line);
    expect(line).toBeLessThan(ctaAt);
    expect(ctaAt).toBeLessThan(note);
    expect(html).toContain('id="step-1"');
    // The old long subhead is gone from the hero; the claims stay as muted labels, never an accent.
    expect(html).not.toContain(INTAKE_COPY.subhead);
    for (const claim of INTAKE_COPY.claims) {
      const li = new RegExp(`<li class="([^"]*)">(?:<span aria-hidden="true"[^>]*>·</span>)?<span>${esc(claim)}</span></li>`).exec(html);
      expect(li, claim).not.toBeNull();
      expect(li?.[1]).toMatch(/text-muted-text/);
      expect(li?.[1]).not.toMatch(/accent/);
    }
  });

  it("four how-it-works cards in order — numeral, picture, two-word title, one line — in the site's shared band, before step 1", () => {
    // v3 (owner review 2026-10-06): the cards are components/ProofPath.tsx's band, the same one every
    // money page carries under its hero — a picture beside each numeral, C13 once for the row.
    const band = between('data-proof-band=""', 'id="step-1"');
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
    expect(count(/data-step-visual=""/g)).toBe(4);
    expect(band.split(CANON.fictionalLabel).length - 1).toBe(1);
    expect(INTAKE_COPY.stepCards[1].line).toContain(`${PHOTO_RULES.min}–${PHOTO_RULES.max}`);
    // The intake duplicate is gone: one component, imported.
    expect(fs.existsSync(path.join(ROOT, "components/intake/ProofPath.tsx")) ? fs.readFileSync(path.join(ROOT, "components/intake/ProofPath.tsx"), "utf8") : "").not.toMatch(/export function ProofPath\b/);
    expect(fs.readFileSync(path.join(ROOT, "components/intake/IntakeHero.tsx"), "utf8")).not.toContain("stepCards");
  });

  it("the hero is two columns: the copy, and the real watermarked proof with the phone photos over its corner", () => {
    // Owner review 2026-10-06: "the whole right half is empty".
    const hero = between(`aria-labelledby="free-proof-title"`, 'data-proof-band=""');
    expect(hero).toContain("lg:grid lg:grid-cols-12");
    expect(hero.match(/lg:col-span-6/g)?.length).toBe(2);
    const visual = hero.slice(hero.indexOf('data-hero-visual=""'));
    expect(hero.indexOf('data-hero-visual=""')).toBeGreaterThan(hero.indexOf(INTAKE_COPY.heroCtaNote));
    // The exhibit: the bracket frame and its file-tab label, the proof at its own ratio, never on a plate.
    expect(visual).toContain(`>${INTAKE_COPY.heroVisual.frameLabel}</span>`);
    expect(visual).toContain("aspect-[1400/1077]");
    expect(visual).not.toMatch(/bg-hairline|<Mat/);
    const proof = asset(STEP_PROOF_KEY);
    const img = new RegExp(`<img [^>]*alt="${esc(proof.alt)}"[^>]*>`).exec(visual)?.[0] ?? "";
    expect(img, "the proof").not.toBe("");
    // The page's one eager image: eager + high fetch priority. React hoists exactly one image preload for
    // it (into <head> in the app) — the proof, at the sizes it is drawn at; nothing else on the page is eager.
    expect(img).toContain('loading="eager"');
    expect(img).toMatch(/fetchpriority="high"/i);
    expect(img).toContain('sizes="(min-width: 1360px) 504px');
    expect(count(/<img [^>]*fetchpriority="high"/gi)).toBe(1);
    expect(count(/loading="eager"/g)).toBe(1);
    const preloads = html.match(/<link rel="preload" as="image"[^>]*>/g) ?? [];
    expect(preloads).toHaveLength(1);
    expect(preloads[0]).toContain(encodeURIComponent(proof.src));
    // Two or three of the same athlete's phone photos, in the home hero's house style; C13 once for the group.
    const photos = HERO_PHOTO_KEYS.filter((k) => hasAsset(k));
    expect(photos.length).toBeGreaterThanOrEqual(2);
    for (const key of photos) expect(visual).toContain(encodeURIComponent(asset(key).src));
    expect(visual.match(/ring-\[5px\] ring-white/g)?.length).toBe(photos.length);
    expect(visual.split(CANON.fictionalLabel).length - 1).toBe(1);
  });

  it("five numbered steps — STEP n OF 5 above each H2, one supporting sentence — then the permissions and the conversion card, unnumbered", () => {
    const steps = [
      ["step-1", INTAKE_COPY.steps5.product],
      ["step-2", INTAKE_COPY.steps5.style],
      ["step-3", INTAKE_COPY.steps5.athlete],
      ["step-4", INTAKE_COPY.steps5.photos],
      ["step-5", INTAKE_COPY.steps5.contact],
    ] as const;
    let at = 0;
    steps.forEach(([id, step], i) => {
      const start = html.indexOf(`id="${id}"`, at);
      expect(start, id).toBeGreaterThan(at);
      const label = html.indexOf(INTAKE_COPY.stepLabel(i + 1), start);
      const title = html.indexOf(`>${step.title}</h2>`, start);
      expect(label, id).toBeGreaterThan(start);
      expect(title, id).toBeGreaterThan(label);
      if ("support" in step) expect(html.indexOf(step.support, title), id).toBeGreaterThan(title);
      at = title;
    });
    expect(html).not.toContain("STEP 6");
    expect(html).not.toMatch(/0\d \/ 0\d/);
    // Step 4's sentence is C5, read from content/blocks.
    expect(between('id="step-4"', 'id="step-5"')).toContain(fs.readFileSync(path.join(ROOT, "content/blocks/photos-that-work-best.md"), "utf8").trim());
    // The H2s use the home page's recipe.
    for (const [, step] of steps) expect(html).toMatch(new RegExp(`<h2[^>]*class="[^"]*font-display text-h2 uppercase[^"]*"[^>]*>${esc(step.title)}</h2>`));
    const consent = html.indexOf(`>${INTAKE_COPY.consentPanel.title}</h2>`);
    const card = html.indexOf(`>${INTAKE_COPY.ctaCard.title}</h2>`);
    expect(consent).toBeGreaterThan(html.indexOf('id="step-5"'));
    expect(card).toBeGreaterThan(consent);
  });

  it("four product cards — no set card — real checkboxes, options as radio rows inside the card, prices only from the helpers", () => {
    for (const p of PRODUCTS) {
      expect(html).toMatch(new RegExp(`<input[^>]*id="fp-product-${p.key}"[^>]*type="checkbox"`));
      expect(html).toContain(p.name);
      expect(html).toContain(p.blurb);
      expect(html).toContain(productFromLabel(p) ?? PRICE_ON_PROOF);
      for (const o of p.options) {
        expect(html).toMatch(new RegExp(`<input[^>]*id="fp-product-${p.key}-option-${o.key}"[^>]*type="radio"`));
        expect(html).toContain(o.detail);
      }
    }
    // Owner, 2026-10-06: "a bundle must never duplicate the single products" — exactly the four products.
    expect(PRODUCTS.map((p) => p.key)).toEqual(["cards", "poster", "banner", "blanket"]);
    expect(count(/<input[^>]*id="fp-product-[a-z]+"[^>]*type="checkbox"/g)).toBe(4);
    expect(html).not.toContain('id="fp-product-set"');
    expect(html).not.toContain(INTAKE_COPY.setTile.name);
    expect(html).not.toContain(`>${INTAKE_COPY.setTile.badge}</span>`);
    const order = PRODUCTS.map((p) => html.indexOf(`id="fp-product-${p.key}"`));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // 2 × 2 from md, 4 across from xl; the chosen card grows on its own (items-start), never a fifth slot.
    expect(html).toMatch(/<ul class="grid items-start[^"]*md:grid-cols-2[^"]*xl:grid-cols-4">/);
    // The options open INSIDE the card: one container per product, its options after a hairline divider.
    for (const p of PRODUCTS) {
      const at = html.indexOf(`id="fp-product-${p.key}"`);
      const open = html.lastIndexOf('<li data-product-card=""', at);
      const last = html.indexOf(`id="fp-product-${p.key}-option-${p.options[p.options.length - 1].key}"`);
      const next = html.indexOf('<li data-product-card=""', open + 1);
      expect(open, p.key).toBeGreaterThan(-1);
      expect(next === -1 || next > last, `${p.key}: its options sit inside its own card`).toBe(true);
    }
    expect(count(/<li data-product-card="" class="[^"]*rounded-\[20px\] border[^"]*">/g)).toBe(4);
    expect(count(/<div hidden="" data-product-options="" class="[^"]*border-t border-hairline[^"]*"><fieldset/g)).toBe(4);
    // The set is a RESULT: one computed line under the cards — "save from" the smallest saving a set tier gives.
    const minSaving = model.minSetSaving(
      PRODUCTS.map((p) => ({ key: p.key, options: p.options.map((o) => ({ key: o.key, printed: o.printed, price: o.sku ? sitePrice(getTier(o.sku)!) : null })) })),
      [{ cards: "digital", poster: "digital", price: price("GDE-ANY-SET-DIG") }, { cards: "p12", poster: "p1824", price: price("GDE-ANY-SET-PRINT") }, { cards: "p24", poster: "p2436", price: price("GDE-ANY-SET-DLX") }],
    );
    expect(minSaving).toBe(SAVING);
    expect(html).toMatch(new RegExp(`<p data-set-note="" aria-live="polite"[^>]*>${esc(INTAKE_COPY.setNote.pick(formatUsd(SAVING)))}</p>`));
    expect(html.indexOf("data-set-note")).toBeGreaterThan(html.indexOf('id="fp-product-blanket"'));
    expect(html.indexOf("data-set-note")).toBeLessThan(html.indexOf('id="step-2"'));
    // Every dollar figure on the page is a helper's output (or the zero-due figure from prices.ts).
    const allowed = new Set([
      ...PRODUCTS.flatMap((p) => [...p.options.map((o) => optionPriceLabel(o)), productFromLabel(p)]).filter(Boolean).map((l) => (l as string).replace(/^from /, "")),
      formatUsd(SAVING),
      DUE_TODAY_LABEL,
    ]);
    const prices = html.match(/\$\d+(\.\d{2})?/g) ?? [];
    expect(prices.length).toBeGreaterThan(5);
    for (const p of prices) expect(allowed, p).toContain(p);
    // Nothing is chosen on arrival: no SELECTED badge, every option panel behind `hidden`.
    expect(html).not.toContain(`>${INTAKE_COPY.selectedBadge}</span>`);
    expect(setFromLabel()).toMatch(/^from \$/);
  });

  it("a chosen card shows SELECTED on its picture and opens its options inside its own border; the set line follows the choice", () => {
    const products = PRODUCTS.map((p) => ({
      key: p.key,
      name: p.name,
      blurb: p.blurb,
      fromLabel: productFromLabel(p) ?? PRICE_ON_PROOF,
      image: hasAsset(`product.${p.key}`) ? asset(`product.${p.key}`) : null,
      options: p.options.map((o) => ({ key: o.key, label: o.label, detail: o.detail, priceLabel: optionPriceLabel(o), printed: o.printed, price: o.sku ? sitePrice(getTier(o.sku)!) : null })),
    }));
    const combos = [
      { cards: "digital", poster: "digital", price: price("GDE-ANY-SET-DIG") },
      { cards: "p12", poster: "p1824", price: price("GDE-ANY-SET-PRINT") },
    ];
    const state = model.initialState().products;
    const render = (s: typeof state) =>
      decode(
        renderToStaticMarkup(
          createElement(ProductPicker, { products, setTile: { pickLine: "PICK", combos }, state: s, onToggle: () => {}, onOption: () => {}, onQuantity: () => {} }),
        ),
      );
    const one = render({ ...state, cards: { ...state.cards, selected: true } });
    const cards = one.slice(one.indexOf('<li data-product-card=""'), one.indexOf('<li data-product-card=""', one.indexOf('<li data-product-card=""') + 1));
    // The chip sits on the picture's corner; the options are inside the same <li>, no longer hidden.
    expect(cards).toMatch(/aspect-square[^>]*>(?:(?!<\/span>)[\s\S])*<span class="[^"]*absolute right-2\.5 top-2\.5[^"]*">SELECTED<\/span>/);
    expect(cards).toMatch(/<div data-product-options="" class="[^"]*border-t border-hairline/);
    expect(cards).toMatch(/border-ink ring-1 ring-ink shadow-\[var\(--shadow-card-stock\)\]/);
    expect(one).toContain("PICK");
    // Both chosen as a set pair: the pair's own saving, from the ladder.
    const pair = render({ ...state, cards: { ...state.cards, selected: true }, poster: { ...state.poster, selected: true } });
    expect(pair).toContain(`${INTAKE_COPY.setNote.matchedLead} ${INTAKE_COPY.setTile.savingsLine(formatUsd(SAVING))}.`);
    // Both chosen but not a set pair: which pairs are, in the option labels' own words.
    const mixed = render({ ...state, cards: { ...state.cards, selected: true, option: "p12" }, poster: { ...state.poster, selected: true } });
    expect(mixed).toContain(INTAKE_COPY.setNote.unmatched(model.setPairsLabel(products, combos)));
    expect(model.setPairsLabel(products, combos)).toBe("Digital files + Digital files or 12 printed cards + 18 × 24 in printed");
    // Banner and blanket bundles are never claimed.
    const others = render({ ...state, banner: { ...state.banner, selected: true }, blanket: { ...state.blanket, selected: true } });
    expect(others).toContain("PICK");
    expect(others).not.toContain(INTAKE_COPY.setNote.matchedLead);
  });

  it("each product card shows its lib/assets.ts picture when the key is verified, the typographic tile otherwise", () => {
    for (const p of PRODUCTS) {
      const key = `product.${p.key}`;
      // next/image serves it through /_next/image?url=<encoded path>
      if (hasAsset(key)) expect(html.includes(encodeURIComponent(asset(key).src)) || html.includes(`src="${asset(key).src}"`), key).toBe(true);
      else expect(html, key).toMatch(new RegExp(`aria-hidden="true"[^>]*>${p.name}</span>`));
    }
  });

  it("eight style tiles, one radio group: the seven editions with only their name and material line, and the dark 'you choose for me' tile", () => {
    expect(count(/name="fp-style"/g)).toBe(8);
    expect(styles).toHaveLength(7);
    for (const s of styles) {
      expect(html).toMatch(new RegExp(`id="fp-style-${s.code}"`));
      expect(html).toMatch(new RegExp(`id="fp-style-${s.code}-name"[^>]*>${esc(s.name)}</span>`));
      expect(html).toMatch(new RegExp(`id="fp-style-${s.code}-detail"[^>]*>${esc(s.material)}</span>`));
    }
    const dark = /<label for="fp-style-recommend"[^>]*>(?:<span[^>]*>SELECTED<\/span>)?<span data-surface="arena" class="([^"]*)"/.exec(html);
    expect(dark?.[1]).toMatch(/\bbg-arena\b/);
    expect(html).toMatch(new RegExp(`id="fp-style-recommend-name"[^>]*font-display[^>]*>${esc(INTAKE_COPY.chooseForMeTitle)}</span>`));
    expect(html).toContain(INTAKE_COPY.chooseForMeLine);
    expect(between('id="step-2"', 'id="step-3"')).toContain(CANON.fictionalLabel);
  });

  it("step 3 is a short grid — at most six fields before '+ Add optional details' — and asks for no school", () => {
    const step3 = between('id="step-3"', 'id="step-4"');
    const all = controls(step3);
    const visible = all.filter((c) => !c.hidden).map((c) => c.id);
    expect(visible).toEqual(["fp-athlete-firstName", "fp-athlete-lastName", "fp-athlete-jerseyNumber", "fp-athlete-sportSlug", "fp-athlete-team"]);
    expect(visible.length).toBeLessThanOrEqual(6);
    // The Senior Night pair joins the grid only with SR; everything optional waits behind the disclosure.
    const hidden = all.filter((c) => c.hidden).map((c) => c.id);
    for (const id of ["fp-athlete-classOf", "fp-athlete-eventDate", "fp-athlete-position", "fp-athlete-season", "fp-athlete-headline", "fp-athlete-notes", "fp-contact-neededBy"]) {
      expect(hidden, id).toContain(id);
    }
    expect(step3).toMatch(new RegExp(`<button type="button" aria-expanded="false" aria-controls="fp-athlete-optional"[^>]*>${esc(INTAKE_COPY.optionalToggle)}</button>`));
    expect(step3).toMatch(/<div id="fp-athlete-optional" hidden=""/);
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

  it("step 4: the big drop zone IS the button, the 4–10 rule, the example gallery (four to send, three to leave out, no self-check boxes) and the crest", () => {
    expect(html).toContain(`accept="${[...PHOTO_RULES.types, ...PHOTO_RULES.extensions].join(",")}"`);
    expect(html).toMatch(/<input[^>]*type="file"[^>]*multiple/);
    const zone = /<button id="fp-photos-choose" type="button" data-fp-dropzone=""[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/button>/.exec(html);
    expect(zone?.[1]).toMatch(/min-h-\[23rem\]/);
    expect(zone?.[2]).toContain(INTAKE_COPY.dropTitle);
    expect(zone?.[2]).toContain(INTAKE_COPY.dropOr);
    expect(zone?.[2]).toContain(INTAKE_COPY.dropHint);
    // 2026-10-06 (owner): the example gallery replaced the ✓ / ✕ pair and the must-have / leave-out checkboxes;
    // tests/intake-photos.test.ts covers it tile by tile.
    const step4 = between('id="step-4"', 'id="step-5"');
    for (const [slug, caption] of Object.entries(INTAKE_COPY.photoExamples.captions)) {
      expect(step4).toContain(`>${caption}</figcaption>`);
      const key = `intake.example.${slug}`;
      if (hasAsset(key)) expect(step4.includes(encodeURIComponent(asset(key).src)), key).toBe(true);
    }
    expect(controls(step4).filter((c) => c.type === "checkbox")).toEqual([]);
    expect(asset("intake.example.bad").alt).toMatch(/generated example/);
    expect(step4).toContain(INTAKE_COPY.crestHelp);
    expect(count(/Parent\/guardian consent required/g)).toBeGreaterThanOrEqual(1);
  });

  it("step 5 is a reward, not a form: your name and the email — no phone, no country", () => {
    const step5 = between('id="step-5"', "fp-s-consent");
    expect(controls(step5).map((c) => c.id)).toEqual(["fp-contact-name", "fp-contact-email"]);
    expect(html).not.toContain('id="fp-contact-phone"');
    expect(html).not.toContain('id="fp-contact-country"');
  });

  it("permissions: a white card (v3, 2026-10-06), every sentence verbatim with its own checkbox, in CONSENT_ORDER, the crest row hidden until a crest is attached", () => {
    const panel = between('aria-labelledby="fp-s-consent"', 'aria-labelledby="fp-cta-title"');
    expect(panel).toMatch(/^aria-labelledby="fp-s-consent" class="[^"]*\bbg-white\b/);
    expect(panel).toMatch(/\[&amp;_input\]:accent-ink|\[&_input\]:accent-ink/);
    expect(panel).not.toMatch(/\bbg-accent\b|\btext-accent\b|\bborder-accent\b/);
    let at = 0;
    for (const key of CONSENT_ORDER) {
      const next = panel.indexOf(CONSENTS[key].text, at);
      expect(next, key).toBeGreaterThan(at);
      expect(panel).toMatch(new RegExp(`<input id="fp-consents-${key}" type="checkbox"[^>]*name="consent-${key}"`));
      at = next;
    }
    expect(count(/<input id="fp-consents-[a-z]+" type="checkbox"/g)).toBe(CONSENT_ORDER.length);
    // The three required sentences stay three boxes, each `required`; the crest row waits behind `hidden`.
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
    expect(html.indexOf(INTAKE_COPY.ctaCard.button)).toBeGreaterThan(html.indexOf(CONSENTS.marketing.text));
    // v3 (2026-10-06): one muted line and the house outline EtsyButton (tests/intake-consent.test.ts).
    const etsy = /<a href="\/go\/etsy\/GDE-ANY-SET" class="([^"]*)">(?:(?!<\/a>)[\s\S])*<\/a>/.exec(html);
    expect(etsy?.[0]).toContain("Also on Etsy →");
    expect(etsy?.[1]).not.toMatch(/bg-accent/);
    expect(html.indexOf(INTAKE_COPY.etsyAltShort)).toBeGreaterThan(html.indexOf(INTAKE_COPY.ctaCard.button));
    const honeypot = /<div aria-hidden="true" class="sr-only">(?:(?!<\/div>)[\s\S])*<\/div>/.exec(html)?.[0] ?? "";
    const input = /<input[^>]*name="website"[^>]*>/.exec(honeypot)?.[0] ?? "";
    expect(input).toMatch(/tabindex="-1"/i);
    expect(input).toMatch(/autocomplete="off"/i);
    expect(input).toMatch(/type="text"/);
    expect(html).not.toMatch(/name="website"[^>]*hidden/);
  });

  it("the summary: a white 20 px panel with the title, Today and the zero-due figure, the three checks — and the empty state on arrival", () => {
    expect(count(new RegExp(`>${INTAKE_COPY.summary.title}</h2>`, "g"))).toBe(2);
    const rail = /<aside aria-labelledby="fp-summary-title" class="([^"]*)">([\s\S]*?)<\/aside>/.exec(html);
    expect(rail?.[1]).toMatch(/rounded-\[20px\]/);
    expect(rail?.[1]).toMatch(/\bbg-white\b/);
    expect(rail?.[1]).toMatch(/border-hairline/);
    expect(rail?.[2]).toContain(INTAKE_COPY.summary.empty);
    expect(rail?.[2]).toContain(`>${INTAKE_COPY.summary.today}</dt>`);
    expect(rail?.[2]).toContain(`>${DUE_TODAY_LABEL}</dd>`);
    for (const check of INTAKE_COPY.summary.checks) expect(rail?.[2]).toContain(`<span>${check}</span>`);
    // Nothing chosen yet: no "after approval" figure.
    expect(rail?.[2]).not.toContain(INTAKE_COPY.summary.afterApproval);
  });

  it("orange only where the owner allows it: the hero CTA, the submit and the three summary ticks", () => {
    const fills = html.match(/class="[^"]*\bbg-accent\b[^"]*"/g) ?? [];
    // hero CTA + submit + 3 ticks; SELECTED badges appear only once something is chosen. The MOST POPULAR
    // badge went with the set card (owner, 2026-10-06) — its copy key stays, unused.
    expect(fills).toHaveLength(5);
    expect(html).not.toContain(INTAKE_COPY.setTile.badge);
    expect(html).not.toMatch(/\btext-accent\b/);
    // The one other orange: the four bracket corners of the proof exhibit in the hero (DESIGN §4.6 — the
    // audit mark around a process artefact), and nowhere else.
    const corners = html.match(/class="[^"]*\bborder-accent\b[^"]*"/g) ?? [];
    expect(corners).toHaveLength(4);
    for (const c of corners) expect(c).toMatch(/pointer-events-none absolute size-7 border-accent/);
    const visual = between('data-hero-visual=""', 'data-proof-band=""');
    expect(visual.match(/\bborder-accent\b/g)).toHaveLength(4);
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
      products: [],
      setTile: { pickLine: null, combos: [] },
      setCombos: [],
      styles: [],
      photosSubhead: "",
      examples: { good: null, bad: null },
      todayIso: "2026-10-04",
    };
    expect(renderToStaticMarkup(createElement(IntakeForm, { ...props, turnstileSiteKey: "1x00000000000000000000AA" }))).toContain("data-turnstile");
    expect(renderToStaticMarkup(createElement(IntakeForm, props))).not.toContain("data-turnstile");
  });

  it("the page's own source never types a price, a provider name or a banned word", () => {
    const files = [
      ...fs.readdirSync(path.join(ROOT, "components/intake")).map((f) => path.join("components/intake", f)),
      "app/(marketing)/free-proof/page.tsx",
      "app/(marketing)/free-proof/thanks/page.tsx",
    ];
    for (const f of files) {
      const src = fs.readFileSync(path.join(ROOT, f), "utf8");
      expect(src, f).not.toMatch(/\$\d/);
      expect(src, f).not.toMatch(/stripe|paypal|\binstant|\byouth\b|\bpdf\b|cheaper/i);
    }
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
    s.products.cards = { selected: true, option: "p12", quantity: 2 };
    s.products.poster = { selected: true, option: "digital", quantity: 4 };
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
    // digital options always go with quantity 1; printed keep theirs
    expect(r.value.products).toEqual([
      { product: "cards", option: "p12", quantity: 2 },
      { product: "poster", option: "digital", quantity: 1 },
    ]);
    expect(r.value.athlete.stats).toEqual([{ value: "18.4", label: "PPG" }]);
    expect(statRows).toEqual([1]);
    expect(r.value.source.utm).toEqual({ utm_source: "meta", utm_campaign: "fall", fbclid: "abc" });
    expect(r.value.consents.crest).toBe(false);
    expect(r.value.contact.country).toBe("United States");
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
    expect(model.statErrorsByRow({ "athlete.stats.0": "x", "contact.email": "y" }, [2])).toEqual({ 2: "x" });
    const s = filled();
    s.athlete.stats = [{ value: "", label: "" }, { value: "", label: "" }, { value: "9", label: "" }];
    const built = model.buildPayload(s, { photos: photoMeta(4), crest: null }, source);
    const r = parseProofRequest(built.payload);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(model.statErrorsByRow(r.errors, built.statRows)).toEqual({ 2: r.errors["athlete.stats.0"] });
  });

  it("an error behind '+ Add optional details' opens the group; the visible fields' errors do not", () => {
    expect(model.hasOptionalDetailError({ "athlete.stats.1": "x" })).toBe(true);
    expect(model.hasOptionalDetailError({ "contact.neededBy": "x" })).toBe(true);
    expect(model.hasOptionalDetailError({ "athlete.colors.primary": "x" })).toBe(true);
    expect(model.hasOptionalDetailError({ "athlete.firstName": "x", "contact.email": "y", "athlete.classOf": "z" })).toBe(false);
  });

  it("the set card is a shortcut: choosing it chooses cards and poster (keeping their options), clearing it clears both", () => {
    const s = model.initialState();
    expect(model.isSetChosen(s.products)).toBe(false);
    s.products.cards.option = "p24";
    const on = model.chooseSet(s.products, true);
    expect(model.isSetChosen(on)).toBe(true);
    expect(on.cards).toEqual({ selected: true, option: "p24", quantity: 1 });
    expect(on.poster).toEqual({ selected: true, option: "digital", quantity: 1 });
    expect(on.banner.selected).toBe(false);
    const off = model.chooseSet({ ...on, banner: { ...on.banner, selected: true } }, false);
    expect(off.cards.selected || off.poster.selected).toBe(false);
    expect(off.banner.selected).toBe(true);
  });

  it("the summary sum: site price × quantity, the set price for a set pair, 'on the proof' when anything is unpriced", () => {
    const products = PRODUCTS.map((p) => ({ key: p.key, options: p.options.map((o) => ({ key: o.key, printed: o.printed, price: o.sku ? sitePrice(getTier(o.sku)!) : null })) }));
    const combos = [
      { cards: "digital", poster: "digital", price: price("GDE-ANY-SET-DIG") },
      { cards: "p12", poster: "p1824", price: price("GDE-ANY-SET-PRINT") },
    ];
    const s = model.initialState();
    expect(model.orderTotal(products, s.products, combos)).toEqual({ kind: "empty" });
    s.products.cards = { selected: true, option: "p12", quantity: 2 };
    expect(model.orderTotal(products, s.products, combos)).toEqual({ kind: "priced", total: Math.round(price("GDE-ANY-CARD-P12") * 2 * 100) / 100, set: false });
    s.products.poster = { selected: true, option: "p1824", quantity: 2 };
    expect(model.orderTotal(products, s.products, combos)).toEqual({ kind: "priced", total: Math.round(price("GDE-ANY-SET-PRINT") * 2 * 100) / 100, set: true });
    s.products.poster.quantity = 1;
    const apart = Math.round((price("GDE-ANY-CARD-P12") * 2 + price("GDE-ANY-POST-P1824")) * 100) / 100;
    expect(model.orderTotal(products, s.products, combos)).toEqual({ kind: "priced", total: apart, set: false });
    s.products.blanket = { selected: true, option: "50x60", quantity: 1 };
    expect(model.orderTotal(products, s.products, combos)).toEqual({ kind: "onProof" });
    expect(model.setSaving(products, combos)).toBe(SAVING);
    expect(model.setSaving(products, [])).toBeNull();
  });

  it("the set as a RESULT (2026-10-06): the smallest saving, the chosen pair's own saving, the matching pairs", () => {
    const products = PRODUCTS.map((p) => ({ key: p.key, options: p.options.map((o) => ({ key: o.key, label: o.label, printed: o.printed, price: o.sku ? sitePrice(getTier(o.sku)!) : null })) }));
    const combos = [
      { cards: "digital", poster: "digital", price: price("GDE-ANY-SET-DIG") },
      { cards: "p12", poster: "p1824", price: price("GDE-ANY-SET-PRINT") },
    ];
    const printSaving = Math.round((price("GDE-ANY-CARD-P12") + price("GDE-ANY-POST-P1824") - price("GDE-ANY-SET-PRINT")) * 100) / 100;
    expect(model.minSetSaving(products, combos)).toBe(Math.min(SAVING, printSaving));
    expect(model.minSetSaving(products, [])).toBeNull();
    const s = model.initialState().products;
    expect(model.setPair(products, s, combos)).toEqual({ kind: "none" });
    s.cards.selected = true;
    expect(model.setPair(products, s, combos)).toEqual({ kind: "none" });
    s.poster.selected = true;
    expect(model.setPair(products, s, combos)).toEqual({ kind: "matched", saved: SAVING });
    s.cards = { selected: true, option: "p12", quantity: 2 };
    expect(model.setPair(products, s, combos)).toEqual({ kind: "unmatched" });
    s.poster = { selected: true, option: "p1824", quantity: 2 };
    // Exactly when the summary counts the set price: same pair, same quantity — the saving times the quantity.
    expect(model.setPair(products, s, combos)).toEqual({ kind: "matched", saved: Math.round(printSaving * 2 * 100) / 100 });
    expect(model.orderTotal(products, s, combos)).toMatchObject({ kind: "priced", set: true });
    s.poster.quantity = 1;
    expect(model.setPair(products, s, combos)).toEqual({ kind: "unmatched" });
    expect(model.orderTotal(products, s, combos)).toMatchObject({ kind: "priced", set: false });
  });

  describe("the live text preview in 'Your order' (owner, 2026-10-06)", () => {
    const front = (code: string) => asset(code === "SR" ? "finish.SR.tile" : `finish.${code}.front`);
    const stylesData = styles.map((st) => ({ code: st.code, name: st.name, material: st.material, image: front(st.code) }));
    const typed = { ...model.initialState().athlete, firstName: "Jordan", lastName: "Okafor", jerseyNumber: "23", sportSlug: "basketball", team: "Riverside Hawks" };
    const preview = (athlete: typeof typed | null, style: string) =>
      decode(renderToStaticMarkup(createElement(CardTextPreview, { image: front(model.previewFinish(style as never)), athlete, style: style as never, sizes: "192px" })));
    const summary = (athlete: typeof typed | null, variant: "rail" | "bar", style = "") =>
      decode(
        renderToStaticMarkup(
          createElement(SummaryRail, { products: [], state: model.initialState().products, styles: stylesData, style: style as never, setCombos: [], athlete, variant }),
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
    // The rendered step 3 uses it: every visible athlete input and select is white with the ink-60 edge.
    const step3 = between('id="step-3"', 'id="step-4"');
    for (const tag of step3.match(/<(input|select)[^>]*id="fp-athlete-(firstName|lastName|jerseyNumber|sportSlug|team)"[^>]*>/g) ?? []) {
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
    const applied = model.applyPrefill(model.initialState(), model.parsePrefill(get("option=p1824&style=sr")));
    expect(applied.products.poster).toEqual({ selected: true, option: "p1824", quantity: 1 });
    expect(applied.style).toBe("SR");
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
