// /free-proof — the permissions and the Etsy alternative, v3 (owner review 2026-10-06, two screenshots):
// the grey "PERMISSIONS." panel with a REQUIRED tag per row "looks like too much permission — as if we were
// doing something not legit", and the outline "Prefer Etsy? …" box at the bottom was "visually weak". Now:
// three quick confirmations on a white card — a plain title per row over the verbatim consent sentence,
// which stays the checkbox's label — and one muted line beside the house EtsyButton.
// Static markup only (this suite has no DOM): ConsentFields on its own, and the IntakeForm for the Etsy block.
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return { ...actual, useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }), useSearchParams: () => new URLSearchParams("") };
});

const { ConsentFields } = await import("../components/intake/ConsentFields");
const { IntakeForm } = await import("../components/intake/IntakeForm");
const { ConsentRow } = await import("../components/ConsentRow");
const { INTAKE_COPY } = await import("../lib/intake/copy");
const { CONSENTS, CONSENT_ORDER, parseProofRequest } = await import("../lib/intake/types");
const { CTA_LABELS, etsyHref } = await import("../lib/cta");

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
/** What a parent reads: the markup without its tags. */
const words = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

const panel = (crest: boolean, errors: Record<string, string | undefined> = {}) =>
  decode(renderToStaticMarkup(createElement(ConsentFields, { crest, onChange: () => {}, errors, titleId: "fp-s-consent" })));

const id = (key: string) => `fp-consents-${key}`;
/** The text of the one `<label>` bound to a box — what the box is named by. */
const labelsFor = (html: string, key: string) => [...html.matchAll(new RegExp(`<label for="${id(key)}"[^>]*>([\\s\\S]*?)</label>`, "g"))].map((m) => m[1]);
const inputOf = (html: string, key: string) => new RegExp(`<input id="${id(key)}"[^>]*>`).exec(html)?.[0] ?? "";
/** The row of one consent: from its wrapper to the start of the next row (or the end). */
const rowOf = (html: string, key: string) => {
  const at = html.indexOf(`<input id="${id(key)}"`);
  const start = html.lastIndexOf('<div class="max-w-[62ch]"', at) > html.lastIndexOf('<div hidden=""', at) ? html.lastIndexOf('<div class="max-w-[62ch]"', at) : html.lastIndexOf('<div hidden=""', at);
  const next = CONSENT_ORDER.map((k) => html.indexOf(`<input id="${id(k)}"`)).filter((i) => i > at);
  return html.slice(start, next.length ? Math.min(...next) : undefined);
};

const REQUIRED = ["guardian", "biometric", "license"] as const;
const NO_CREST = panel(false);
const WITH_CREST = panel(true);

describe("permissions: three quick confirmations, not a contract", () => {
  it("a white card with ui corners and a hairline — not the grey panel, no shadow heavier than the summary's", () => {
    const cls = /^<section aria-labelledby="fp-s-consent" class="([^"]*)"/.exec(NO_CREST)?.[1] ?? "";
    for (const c of ["bg-white", "rounded-ui", "border", "border-hairline"]) expect(cls.split(" "), c).toContain(c);
    expect(cls).not.toMatch(/bg-ink\/5|rounded-\[20px\]/);
    // The summary panel wears --shadow-card-stock; nothing heavier may appear here.
    expect(cls.split(" ").filter((c) => c.startsWith("shadow") && c !== "shadow-[var(--shadow-card-stock)]")).toEqual([]);
  });

  it("the heading is the house H2 recipe one size under the step titles, then one plain line, then 'all three' once", () => {
    const h2 = new RegExp(`<h2 id="fp-s-consent" class="([^"]*)">${esc(INTAKE_COPY.consentPanel.title)}</h2>`).exec(NO_CREST);
    expect(h2?.[1].split(" ")).toEqual(expect.arrayContaining(["font-display", "text-h3", "uppercase", "text-balance"]));
    expect(h2?.[1]).not.toContain("text-h2");
    expect(INTAKE_COPY.consentPanel.title).toBe("THREE QUICK CONFIRMATIONS.");
    expect(INTAKE_COPY.consentPanel.line).toBe("The same three every family gives us before we start. Nothing is posted or shared.");
    expect(INTAKE_COPY.consentPanel.needed).toBe("All three are needed to build the proof.");
    // The plain line is one <p>, one sentence per line (a block span each, a real space between them).
    const lineP = /<p class="mt-3 [^"]*">([\s\S]*?)<\/p>/.exec(NO_CREST);
    expect(words(lineP?.[1] ?? "").trim()).toBe(INTAKE_COPY.consentPanel.line);
    expect(lineP?.[1].match(/<span class="block">/g)).toHaveLength(2);
    const line = lineP?.index ?? -1;
    const needed = NO_CREST.indexOf(`>${INTAKE_COPY.consentPanel.needed}</p>`);
    expect(line).toBeGreaterThan(NO_CREST.indexOf("</h2>"));
    expect(needed).toBeGreaterThan(line);
    expect(needed).toBeLessThan(NO_CREST.indexOf(`<input id="${id("guardian")}"`));
    expect(NO_CREST.split(INTAKE_COPY.consentPanel.needed)).toHaveLength(2);
  });

  it("no REQUIRED word and no Required / Optional tag anywhere in the panel — the line above the rows says it once", () => {
    for (const html of [NO_CREST, WITH_CREST]) {
      expect(words(html)).not.toMatch(/required/i);
      expect(html).not.toMatch(new RegExp(`>(${INTAKE_COPY.requiredTag}|${INTAKE_COPY.optionalTag})<`, "i"));
    }
    // The boxes themselves stay `required`: that is what assistive tech announces and what the browser checks.
    for (const key of REQUIRED) expect(inputOf(NO_CREST, key)).toMatch(/\srequired=""/);
  });

  it("three required rows and the optional marketing row: one checkbox per sentence, each sentence verbatim as its label, in CONSENT_ORDER", () => {
    expect(NO_CREST.match(/<input [^>]*type="checkbox"/g)).toHaveLength(CONSENT_ORDER.length);
    let at = 0;
    for (const key of CONSENT_ORDER) {
      // One label per box, and its whole text is the sentence — byte-identical to CONSENTS (the title is not part of it).
      expect(labelsFor(NO_CREST, key), key).toEqual([CONSENTS[key].text]);
      expect(inputOf(NO_CREST, key), key).toMatch(new RegExp(`name="consent-${key}"`));
      const next = NO_CREST.indexOf(CONSENTS[key].text);
      expect(next, key).toBeGreaterThan(at);
      at = next;
    }
    const visible = (html: string) => CONSENT_ORDER.filter((k) => !rowOf(html, k).startsWith('<div hidden=""'));
    expect(visible(NO_CREST)).toEqual(["guardian", "biometric", "license", "marketing"]);
    expect(inputOf(NO_CREST, "marketing")).not.toMatch(/required/);
  });

  it("each row: a plain bold title (≥ 17 px), then the sentence in small muted type (≤ 15 px); the biometric row adds one plain line between", () => {
    expect(INTAKE_COPY.consentTitles).toMatchObject({
      guardian: "You can share these photos",
      biometric: "We may measure the face to check the likeness",
      license: "We may make the artwork from these photos",
      marketing: "Optional — let us show the finished card",
    });
    for (const key of [...REQUIRED, "marketing"] as const) {
      const row = rowOf(NO_CREST, key);
      const title = new RegExp(`<p class="([^"]*)">${esc(INTAKE_COPY.consentTitles[key])}</p>`).exec(row);
      expect(title?.[1].split(" "), key).toEqual(expect.arrayContaining(["font-body", "text-body", key === "marketing" ? "font-medium" : "font-bold"]));
      const label = new RegExp(`<label for="${id(key)}" class="([^"]*)"`).exec(row)?.[1].split(" ") ?? [];
      expect(label, key).toEqual(expect.arrayContaining(["font-body", "text-small", "text-muted-text"]));
      expect(row.indexOf(INTAKE_COPY.consentTitles[key]), key).toBeLessThan(row.indexOf(CONSENTS[key].text));
    }
    const bio = rowOf(NO_CREST, "biometric");
    const note = bio.indexOf(`>${INTAKE_COPY.consentNotes.biometric}</p>`);
    expect(INTAKE_COPY.consentNotes.biometric).toBe(
      "Privacy law asks us to spell this one out: it is only how we check the artwork looks like your athlete, and it is deleted when your request closes.",
    );
    expect(note).toBeGreaterThan(bio.indexOf(INTAKE_COPY.consentTitles.biometric));
    expect(note).toBeLessThan(bio.indexOf(CONSENTS.biometric.text));
    for (const key of ["guardian", "license", "marketing"] as const) expect(rowOf(NO_CREST, key)).not.toContain(INTAKE_COPY.consentNotes.biometric);
  });

  it("the whole row is the tap target: the sentence's label is stretched over the row, the box stays above it", () => {
    const row = rowOf(NO_CREST, "guardian");
    expect(row).toMatch(/<div class="relative flex items-start gap-3">/);
    expect(new RegExp(`<label for="${id("guardian")}" class="[^"]*\\bafter:absolute after:inset-0\\b`).test(row)).toBe(true);
    expect(inputOf(NO_CREST, "guardian")).toMatch(/class="relative z-\[1\][^"]*size-5/);
    // Without a title ConsentRow keeps its contract: the sentence beside the box, grown to 44 px.
    const plain = renderToStaticMarkup(createElement(ConsentRow, { id: "c", name: "c", label: "I consent." }));
    expect(plain).toBe(
      '<div class="flex min-h-6 items-start gap-3"><input id="c" type="checkbox" class="mt-0.5 size-5 shrink-0 rounded-[4px] border border-ink/40 accent-accent" name="c"/><label for="c" class="-my-3 py-3 font-body text-small text-ink">I consent.</label></div>',
    );
  });

  it("the optional marketing row sits alone under a hairline, after every required row", () => {
    const rule = NO_CREST.lastIndexOf("border-t border-hairline", NO_CREST.indexOf(`<input id="${id("marketing")}"`));
    for (const key of [...REQUIRED, "crest"]) expect(rule, key).toBeGreaterThan(NO_CREST.indexOf(`<input id="${id(key)}"`));
    expect(rule).toBeGreaterThan(-1);
  });

  it("the crest row only when a crest is attached — styled like the three, required — and the counts follow it", () => {
    expect(rowOf(NO_CREST, "crest")).toMatch(/^<div hidden=""/);
    expect(inputOf(NO_CREST, "crest")).not.toMatch(/required/);
    const crest = rowOf(WITH_CREST, "crest");
    expect(crest).not.toMatch(/^<div hidden=""/);
    expect(inputOf(WITH_CREST, "crest")).toMatch(/\srequired=""/);
    expect(labelsFor(WITH_CREST, "crest")).toEqual([CONSENTS.crest.text]);
    expect(crest).toMatch(new RegExp(`<p class="[^"]*\\bfont-bold\\b[^"]*">${esc(INTAKE_COPY.consentTitles.crest)}</p>`));
    // Four boxes are required now: the panel never says "three" over four.
    const four = INTAKE_COPY.consentPanel.withCrest;
    expect(WITH_CREST).toContain(`>${four.title}</h2>`);
    expect(WITH_CREST).toContain(`>${four.needed}</p>`);
    expect(words(/<p class="mt-3 [^"]*">([\s\S]*?)<\/p>/.exec(WITH_CREST)?.[1] ?? "").trim()).toBe(four.line);
    expect(words(WITH_CREST)).not.toMatch(/\bthree quick\b|\ball three\b/i);
    expect(WITH_CREST.indexOf(CONSENTS.crest.text)).toBeLessThan(WITH_CREST.indexOf(CONSENTS.marketing.text));
  });

  it("after a send attempt the unticked box is aria-invalid and names the parser's sentence under its row (unchanged)", () => {
    const parsed = parseProofRequest({});
    const errors = parsed.ok ? {} : parsed.errors;
    expect(errors["consents.guardian"]).toBeTruthy();
    const html = panel(false, errors);
    for (const key of REQUIRED) {
      expect(inputOf(html, key), key).toMatch(new RegExp(`aria-describedby="${id(key)}-error"`));
      expect(inputOf(html, key), key).toMatch(/aria-invalid="true"/);
      expect(rowOf(html, key), key).toContain(`<p id="${id(key)}-error"`);
      expect(rowOf(html, key), key).toContain(errors[`consents.${key}`]);
    }
    expect(inputOf(html, "marketing")).not.toMatch(/aria-invalid/);
  });

  it("checkboxes are ink, nothing in the card is orange, no price, and the three policies close it in small type, in a new tab", () => {
    expect(NO_CREST).toMatch(/<fieldset class="[^"]*\[&_input\]:accent-ink/);
    expect(NO_CREST).not.toMatch(/\bbg-accent\b|\btext-accent\b|\bborder-accent\b/);
    expect(NO_CREST).not.toContain("$");
    const marketing = NO_CREST.indexOf(CONSENTS.marketing.text);
    let at = marketing;
    for (const [href, label] of [
      ["/privacy", "Privacy"],
      ["/privacy/biometric", "Biometric policy"],
      ["/terms", "Terms"],
    ]) {
      const link = new RegExp(`<a href="${esc(href)}" target="_blank" rel="noreferrer" class="([^"]*)">${esc(label)}<`).exec(NO_CREST);
      expect(link?.[1].split(" "), href).toEqual(expect.arrayContaining(["text-small", "min-h-11"]));
      expect(link!.index, href).toBeGreaterThan(at);
      at = link!.index;
    }
  });
});

describe("the Etsy alternative: one muted line and the house EtsyButton", () => {
  // An empty form is enough: the Etsy block does not depend on the tiles. The set tile's shape belongs to
  // ProductPicker and moves with it, so the fixture carries both shapes and is cast to the form's own props.
  const props = {
    products: [],
    setTile: { pickLine: null, combos: [], name: "", blurb: "", fromLabel: "", badge: "", savingsLine: null, images: { cards: null, poster: null } },
    setCombos: [],
    styles: [],
    photosSubhead: "",
    examples: { good: null, bad: null },
    todayIso: "2026-10-06",
  } as unknown as Parameters<typeof IntakeForm>[0];
  const form = decode(renderToStaticMarkup(createElement(IntakeForm, props)));
  const href = etsyHref("GDE-ANY-SET");
  const button = new RegExp(`<a href="${esc(href)}" class="([^"]*)">${esc(CTA_LABELS.alsoOnEtsy)}</a>`).exec(form);

  it("the outline 'Also on Etsy →' to /go/etsy/GDE-ANY-SET — auto width, never orange", () => {
    expect(href).toBe("/go/etsy/GDE-ANY-SET");
    expect(button).not.toBeNull();
    const cls = button![1].split(" ");
    expect(cls).toEqual(expect.arrayContaining(["border-[1.5px]", "border-ink", "h-12", "rounded-ui"]));
    expect(cls).not.toContain("w-full");
    expect(button![1]).not.toMatch(/bg-accent/);
  });

  it("under the conversion card: the short muted line, then the button, left-aligned with mt-8 — and no price", () => {
    expect(INTAKE_COPY.etsyAltShort).toBe("Prefer Etsy? Same proof, same process.");
    const submit = form.indexOf('id="fp-submit"');
    const cardEnd = form.indexOf("</section>", submit);
    const line = form.indexOf(`<p class="font-body text-small text-muted-text">${INTAKE_COPY.etsyAltShort}</p>`);
    expect(line).toBeGreaterThan(cardEnd);
    expect(button!.index).toBeGreaterThan(line);
    const block = form.slice(form.lastIndexOf("<div", line), button!.index + button![0].length);
    expect(block).toMatch(/^<div class="mt-8 flex flex-wrap items-center[^"]*">/);
    expect(block).not.toContain("$");
    expect(words(block).trim()).toBe(`${INTAKE_COPY.etsyAltShort} ${CTA_LABELS.alsoOnEtsy}`);
  });

  it("the wide outline box is gone: no bare /etsy link, the long sentence is not rendered", () => {
    expect(form).not.toContain('href="/etsy"');
    expect(form).not.toContain(INTAKE_COPY.etsyAlt);
    expect(form.match(/href="\/go\/etsy\//g)).toHaveLength(1);
  });
});
