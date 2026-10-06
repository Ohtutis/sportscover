// The duplication gate (SEO master plan §4 "measure duplication instead of guessing"): a generated page
// family must differ in FACTS, not in a sentence with the sport name swapped. For each family the test
// renders every page, keeps only the page's own prose (<p> and <li> text outside [data-shared], headings,
// nav, buttons, figcaptions and FAQ question wording), collapses sport names and numbers into placeholders, and counts each
// sentence shape across the family. A shape on three or more pages is templated; a page fails when more
// than 20 % of its own sentences are templated (the plan's threshold, taken from pages that already read
// as unique). A page with fewer than 12 own sentences fails too — it is thin.
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/image", async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const d = mod.default as Record<string, unknown> | undefined;
  return { ...mod, default: d && typeof d === "object" && "default" in d && !("$$typeof" in d) ? d.default : d };
});
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
  useRouter: () => ({ replace: () => {}, push: () => {}, refresh: () => {}, back: () => {}, forward: () => {}, prefetch: () => {} }),
}));

import { seniorNightSports } from "../lib/seo/senior-night-facts";
import { sportPageSports } from "../lib/seo/sport-facts";

export const TEMPLATED_MAX_SHARE = 0.2;
export const MIN_OWN_SENTENCES = 12;

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " " };
const decode = (s: string): string => s.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (m) => ENTITIES[m] ?? m);

/** Remove every element carrying `data-shared=""` with its whole subtree, counting nested tags of the same name. */
export function stripShared(html: string): string {
  let out = html;
  for (;;) {
    const open = /<([a-z0-9]+)(?:\s[^>]*)?\sdata-shared=""(?:\s[^>]*)?>/i.exec(out);
    if (!open) return out;
    const tag = open[1].toLowerCase();
    const re = new RegExp(`<(/?)${tag}(?=[\\s>/])[^>]*>`, "gi");
    re.lastIndex = open.index + open[0].length;
    let depth = 1;
    let end = out.length;
    for (let m = re.exec(out); m; m = re.exec(out)) {
      if (m[0].endsWith("/>")) continue;
      depth += m[1] ? -1 : 1;
      if (depth === 0) {
        end = m.index + m[0].length;
        break;
      }
    }
    out = `${out.slice(0, open.index)} ${out.slice(end)}`;
  }
}

/** Strip every subtree the plan allows to repeat, then keep the text of <p> and <li>. */
export function ownSentences(html: string): string[] {
  let h = stripShared(html);
  // Headings, nav, buttons, captions and FAQ QUESTION wording (<summary>) are allowed to repeat; the
  // answers inside <details> are the page's own facts and count.
  h = h.replace(/<script[\s\S]*?<\/script>|<nav[\s\S]*?<\/nav>|<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>|<button[\s\S]*?<\/button>|<figcaption[\s\S]*?<\/figcaption>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>|<summary[\s\S]*?<\/summary>/g, " ");
  const texts = [...h.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => decode(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim());
  const sentences: string[] = [];
  for (const t of texts) for (const s of t.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/)) if (s.split(/\s+/).length >= 4) sentences.push(s.trim());
  return sentences;
}

const SPORT_WORDS =
  /\b(basketball|football|baseball|softball|soccer|ice hockey|hockey|volleyball|wrestling|wrestlers?|cheerleading|cheerleaders?|cheer|lacrosse|gymnastics|swimming|tennis|golf|pickleball|skateboarding|track(?: & field)?)\b/gi;

/** The shape of a sentence: lowercase, sport words → {sport}, numbers → {n}, punctuation stripped. */
export const shapeOf = (s: string): string =>
  s.toLowerCase().replace(SPORT_WORDS, "{sport}").replace(/\d+([.,]\d+)?/g, "{n}").replace(/[^a-z{}\s]/g, "").replace(/\s+/g, " ").trim();

export function templatedShare(pages: Record<string, string[]>): Record<string, { share: number; templated: string[]; own: number }> {
  const owners = new Map<string, Set<string>>();
  for (const [page, sentences] of Object.entries(pages)) for (const s of sentences) owners.set(shapeOf(s), (owners.get(shapeOf(s)) ?? new Set()).add(page));
  const out: Record<string, { share: number; templated: string[]; own: number }> = {};
  for (const [page, sentences] of Object.entries(pages)) {
    const templated = sentences.filter((s) => (owners.get(shapeOf(s))?.size ?? 0) >= 3);
    out[page] = { share: sentences.length ? templated.length / sentences.length : 0, templated, own: sentences.length };
  }
  return out;
}

async function renderFamily(load: () => Promise<{ default: (p: { params: Promise<{ sport: string }> }) => Promise<ReactElement> | ReactElement }>, slugs: string[]) {
  const mod = await load();
  const pages: Record<string, string[]> = {};
  for (const slug of slugs) {
    const el = await mod.default({ params: Promise.resolve({ sport: slug }) });
    pages[slug] = ownSentences(renderToStaticMarkup(el));
  }
  return pages;
}

const FAMILIES: { name: string; load: () => Promise<never>; slugs: () => string[] }[] = [
  { name: "/sports/[sport]", load: () => import("../app/(marketing)/sports/[sport]/page") as Promise<never>, slugs: () => sportPageSports().map((s) => s.slug) },
  { name: "/senior-night/[sport]", load: () => import("../app/(marketing)/senior-night/[sport]/page") as Promise<never>, slugs: () => seniorNightSports().map((s) => s.slug) },
];

describe("stripShared", () => {
  it("removes a shared subtree with nested tags of the same name, and keeps the rest", () => {
    const html = '<div><div data-shared=""><div><p>shared one.</p></div><p>shared two.</p></div><p>own text here now.</p></div>';
    expect(stripShared(html)).toBe("<div> <p>own text here now.</p></div>");
    expect(ownSentences(html)).toEqual(["own text here now."]);
  });
});

describe("shapeOf / templatedShare", () => {
  it("collapses the sport and the numbers, so a name swap is the same shape", () => {
    expect(shapeOf("Custom football cards from 4 photos.")).toBe(shapeOf("Custom baseball cards from 10 photos!"));
    expect(shapeOf("Their helmet hides the face.")).not.toBe(shapeOf("Their visor hides the face."));
  });
  it("counts a shape on three pages as templated, two as fine", () => {
    const r = templatedShare({ a: ["One two three four five.", "Alpha beta gamma delta."], b: ["One two three four five.", "Epsilon zeta eta theta."], c: ["One two three four five.", "Iota kappa lambda mu."] });
    expect(r.a.share).toBe(0.5);
    expect(templatedShare({ a: ["One two three four five."], b: ["One two three four five."] }).a.share).toBe(0);
  });
});

for (const family of FAMILIES) {
  describe(`${family.name} — facts, not name swaps`, () => {
    it(`every page keeps templated sentences at or under ${TEMPLATED_MAX_SHARE * 100} % and has at least ${MIN_OWN_SENTENCES} of its own`, async () => {
      const pages = await renderFamily(family.load as never, family.slugs());
      const result = templatedShare(pages);
      const report = Object.entries(result)
        .map(([page, r]) => `${page}: ${r.own} own, ${(r.share * 100).toFixed(0)} % templated${r.templated.length ? `\n    e.g. "${r.templated[0].slice(0, 90)}"` : ""}`)
        .join("\n  ");
      if (process.env.SEO_GATE_DEBUG) {
        for (const [page, r] of Object.entries(result)) console.log(`\n${family.name} ${page} (${r.own} own, ${(r.share * 100).toFixed(0)} %):\n  TEMPLATED: ${r.templated.join("\n  TEMPLATED: ")}`);
      }
      for (const [page, r] of Object.entries(result)) {
        expect(r.own, `${family.name} ${page} is thin\n  ${report}`).toBeGreaterThanOrEqual(MIN_OWN_SENTENCES);
        expect(r.share, `${family.name} ${page} reads as a template\n  ${report}`).toBeLessThanOrEqual(TEMPLATED_MAX_SHARE);
      }
      expect(createElement).toBeDefined();
    });
  });
}
