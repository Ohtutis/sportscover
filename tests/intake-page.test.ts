// /free-proof and /free-proof/thanks (builder A, 2026-10-04): the server pages rendered to static markup —
// the form island included, since it must render without `window` — plus the pure form model in
// components/intake/model.ts. next/navigation is mocked (no app router under Vitest); next/image renders.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
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
const { styles } = await import("../lib/catalog/styles");
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

let html = "";
let warn: ReturnType<typeof vi.spyOn>;
beforeAll(() => {
  // SectionHeading warns in dev that "WHAT WOULD YOU LIKE MADE?" ends with "?" — the copy's choice.
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  html = decode(renderToStaticMarkup(FreeProofPage() as ReactElement));
});
afterAll(() => warn.mockRestore());

const count = (re: RegExp) => (html.match(re) ?? []).length;

describe("/free-proof — the page a Meta ad lands on", () => {
  it("is the titles-table row, indexable", () => {
    expect(pageMetadata.alternates?.canonical).toBe(INTAKE_PATH);
    expect(pageMetadata.robots).toBeUndefined();
  });

  it("opens on the H1, the subhead, the three claims as labels and the four steps in order", () => {
    expect(count(/<h1[\s>]/g)).toBe(1);
    expect(html).toMatch(new RegExp(`<h1[^>]*>${INTAKE_COPY.h1.replace(/[.?]/g, "\\$&")}</h1>`));
    expect(html).toContain(INTAKE_COPY.subhead);
    for (const claim of INTAKE_COPY.claims) expect(html).toContain(`${claim}</li>`);
    let at = html.indexOf(INTAKE_COPY.h1);
    for (const step of INTAKE_COPY.steps) {
      const next = html.indexOf(step.title, at);
      expect(next, step.title).toBeGreaterThan(at);
      expect(html).toContain(step.body);
      at = next;
    }
    expect(html).toContain('aria-current="step"');
  });

  it("renders every section title from INTAKE_COPY, numbered 01–06, in order", () => {
    const titles = Object.values(INTAKE_COPY.sections).map((s) => s.title);
    expect(titles).toHaveLength(6);
    let at = 0;
    titles.forEach((title, i) => {
      const next = html.indexOf(`>${title}</h2>`, at);
      expect(next, title).toBeGreaterThan(at);
      expect(html).toContain(`0${i + 1} / 06`);
      at = next;
    });
    expect(html).toContain(INTAKE_COPY.sections.style.subhead);
    expect(html).toContain(INTAKE_COPY.sections.athlete.subhead);
    expect(html).toContain(INTAKE_COPY.sections.contact.subhead);
    expect(html).toContain(INTAKE_COPY.sections.consent.subhead);
    expect(html).toContain(fs.readFileSync(path.join(ROOT, "content/blocks/photos-that-work-best.md"), "utf8").trim());
  });

  it("four product tiles — real checkboxes — with their options as radio rows, prices only from the helpers", () => {
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
    expect(count(/id="fp-product-(cards|poster|banner|blanket)"/g)).toBe(4);
    const allowed = new Set([
      ...PRODUCTS.flatMap((p) => [...p.options.map((o) => optionPriceLabel(o)), productFromLabel(p)]).filter(Boolean).map((l) => (l as string).replace(/^from /, "")),
      setFromLabel().replace(/^from /, ""),
    ]);
    const prices = html.match(/\$\d+(\.\d{2})?/g) ?? [];
    expect(prices.length).toBeGreaterThan(5);
    for (const price of prices) expect(allowed, price).toContain(price);
    expect(html).toContain(`priced as a set — ${setFromLabel()}.`);
  });

  it("each product tile shows its lib/assets.ts picture when the key is verified, the typographic tile otherwise", () => {
    for (const p of PRODUCTS) {
      const key = `product.${p.key}`;
      // next/image serves it through /_next/image?url=<encoded path>
      if (hasAsset(key)) expect(html.includes(encodeURIComponent(asset(key).src)) || html.includes(`src="${asset(key).src}"`), key).toBe(true);
      else expect(html, key).toMatch(new RegExp(`aria-hidden="true"[^>]*>${p.name}</span>`));
    }
  });

  it("seven style tiles (six finishes + Senior Night) and the recommend tile, one radio group", () => {
    expect(count(/name="fp-style"/g)).toBe(8);
    for (const s of styles) {
      expect(html).toMatch(new RegExp(`id="fp-style-${s.code}"`));
      expect(html).toContain(s.name);
      expect(html).toContain(s.material);
    }
    expect(styles).toHaveLength(7);
    expect(html).toContain('id="fp-style-recommend"');
    expect(html).toContain(INTAKE_COPY.styleRecommendLabel);
    expect(html).toContain(INTAKE_COPY.styleRecommendDetail);
    expect(html).toContain("Example — fictional athlete · photo and artwork generated");
  });

  it("every consent sentence verbatim, in CONSENT_ORDER, the crest row hidden until a crest is attached", () => {
    let at = 0;
    for (const key of CONSENT_ORDER) {
      const next = html.indexOf(CONSENTS[key].text, at);
      expect(next, key).toBeGreaterThan(at);
      at = next;
    }
    expect(html).toMatch(/<div hidden=""[^>]*>(?:(?!<\/div>)[\s\S])*id="fp-consents-crest"/);
    for (const href of ["/privacy", "/privacy/biometric", "/terms"]) expect(html).toContain(`href="${href}"`);
    expect(count(/Parent\/guardian consent required/g)).toBeGreaterThanOrEqual(1);
  });

  it("the photo section: the 4–10 rule, the accepted types, the must-haves, the avoid list and the crest help", () => {
    expect(html).toContain(`accept="${[...PHOTO_RULES.types, ...PHOTO_RULES.extensions].join(",")}"`);
    expect(html).toMatch(/<input[^>]*type="file"[^>]*multiple/);
    for (const line of [...INTAKE_COPY.photoMustHaves, ...INTAKE_COPY.photoAvoid, INTAKE_COPY.crestHelp]) expect(html).toContain(line);
    expect(html).toContain('id="fp-photos-choose"');
  });

  it("one submit with the no-payment line under it, the Etsy route as a quiet outline link after it, a honeypot", () => {
    expect(count(/type="submit"/g)).toBe(1);
    const submit = html.indexOf(INTAKE_COPY.submit);
    expect(submit).toBeGreaterThan(html.indexOf(CONSENTS.marketing.text));
    expect(html.indexOf(INTAKE_COPY.noPayment, submit)).toBeGreaterThan(submit);
    const etsy = /<a href="\/etsy" class="([^"]*)">(?:(?!<\/a>)[\s\S])*<\/a>/.exec(html);
    expect(etsy?.[0]).toContain(INTAKE_COPY.etsyAlt);
    expect(etsy?.[1]).not.toMatch(/bg-accent/);
    expect(html.indexOf(INTAKE_COPY.etsyAlt)).toBeGreaterThan(submit);
    const honeypot = /<div aria-hidden="true" class="sr-only">(?:(?!<\/div>)[\s\S])*<\/div>/.exec(html)?.[0] ?? "";
    const input = /<input[^>]*name="website"[^>]*>/.exec(honeypot)?.[0] ?? "";
    expect(input).toMatch(/tabindex="-1"/i);
    expect(input).toMatch(/autocomplete="off"/i);
    expect(input).toMatch(/type="text"/);
    expect(html).not.toMatch(/name="website"[^>]*hidden/);
  });

  it("reads back the request in a summary rail and a compact bar, with the path as its spine", () => {
    expect(count(new RegExp(`>${INTAKE_COPY.summaryTitle}<`, "g"))).toBe(2);
    expect(html).toContain('aria-labelledby="fp-summary-title"');
    for (const step of INTAKE_COPY.steps) expect(count(new RegExp(step.title, "g"))).toBeGreaterThanOrEqual(2);
  });

  it("mounts the Turnstile box only when a site key is passed", () => {
    expect(html).not.toContain("data-turnstile");
    const props = {
      products: [],
      styles: [],
      productsLead: "",
      setLine: "",
      photosSubhead: "",
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
    expect(out).toMatch(new RegExp(`<h1[^>]*>${INTAKE_COPY.thanks.h1.replace(/[.?]/g, "\\$&")}</h1>`));
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

  it("a filled form builds a payload the shared validator accepts", () => {
    const { payload, statRows } = model.buildPayload(filled(), { photos: photoMeta(5), crest: null }, source);
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
