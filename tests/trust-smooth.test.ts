// The "finished and smooth" pass over the trust pages, the registry and /c (2026-09-08 layout and
// motion audits). Everything here is a rule that was broken once and is cheap to break again:
// tap-target floors on the accordion, the H3 recipe on /guarantee, a mobile index for /faq, the
// copy voice of the canon sentences, and the two clipboard failure states.
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import { FaqList } from "../components/FaqList";
import { CANON, LOOKUP_STRINGS } from "../lib/copy/canon";

const read = (rel: string): string => fs.readFileSync(path.join(process.cwd(), rel), "utf8");

const ITEMS = [
  { id: "faq-a", q: "A short question?", a: "A short answer." },
  { id: "faq-b", q: "Another question?", a: "Another answer." },
];

describe("FaqList — the accordion is a 44 px tap target (DESIGN §2.6, layout audit blocker 9)", () => {
  const html = renderToStaticMarkup(createElement(FaqList, { items: ITEMS }));

  it("every summary carries the 44 px floor and the row keeps its rhythm", () => {
    const summaries = html.match(/<summary class="([^"]+)"/g) ?? [];
    expect(summaries).toHaveLength(ITEMS.length);
    for (const s of summaries) expect(s).toContain("min-h-11");
    // The padding moved off the <details> and onto the taller summary; py-5 would make a 84 px row.
    expect(html).toContain("border-t border-hairline py-3");
    expect(html).not.toContain("border-t border-hairline py-5");
  });

  it("the open-state rule is one rule: the plus rotates, the border stays", () => {
    expect(html).toContain("group-open:rotate-45");
    expect((html.match(/border-t border-hairline/g) ?? []).length).toBe(ITEMS.length);
  });

  it("openFirst opens exactly the first row — /faq no longer keeps a second copy of this markup", () => {
    const open = renderToStaticMarkup(createElement(FaqList, { items: ITEMS, openFirst: true }));
    expect((open.match(/<details[^>]*\sopen=""/g) ?? []).length).toBe(1);
    expect(open).toContain('<details id="faq-a" open=""');
    expect(read("app/(marketing)/faq/page.tsx")).not.toContain("function OpenAnswer");
  });
});

describe("/faq", () => {
  const src = read("app/(marketing)/faq/page.tsx");

  it("sets the group titles with a full stop, like every other H1/H2 (checklist §11-2)", () => {
    expect(src).toContain("titleWithStop(group.title)");
    expect(src).toMatch(/const titleWithStop = \(title: string\): string =>/);
  });

  it("carries a group index below lg, where the sticky rail is hidden (smooth audit S16)", () => {
    expect(src).toContain('aria-label="Jump to a group"');
    expect(src).toMatch(/lg:hidden/);
    // Plain anchors to the same headings: no JavaScript, nothing hidden behind a scroller.
    expect(src).toContain('href={`#faq-${group.group}`}');
    expect(src).toContain("inline-flex min-h-11 items-center");
  });
});

describe("/guarantee", () => {
  it("sets its block titles in the site's H3 recipe, not at 16 px (DESIGN §3)", () => {
    const src = read("app/(marketing)/guarantee/page.tsx");
    expect(src).toContain('<h3 className="font-display text-h3 uppercase text-ink">{limit.title}</h3>');
    expect(src).not.toContain('font-body text-[1rem] font-bold text-ink">{limit.title}');
  });
});

describe("copy voice — the site talks to a parent, never to the studio", () => {
  /** The words the 2026-09-08 audit found doing process work in front of a buyer. */
  const JARGON = [/reference plate/i, /kit plate/i, /\bplates?\b/i, /\bgates?\b/i, /artefacts?/i, /composite/i, /re-rolled/i, /\bframes?\b/i];

  const sentences = [
    ...Object.values(CANON).flatMap((v) => (Array.isArray(v) ? [...v] : [String(v)])),
    ...Object.values(LOOKUP_STRINGS),
  ];

  it("every canon sentence is free of studio vocabulary", () => {
    for (const sentence of sentences) {
      for (const word of JARGON) expect(sentence, `${word} in: ${sentence}`).not.toMatch(word);
    }
  });

  it("the trust pages this pass owns carry none of it either", () => {
    const pages = [
      "app/(marketing)/about/page.tsx",
      "app/(marketing)/guarantee/page.tsx",
      "app/(marketing)/terms/page.tsx",
      "app/(marketing)/privacy/page.tsx",
      "app/(marketing)/registry/page.tsx",
    ];
    for (const page of pages) {
      // Rendered copy only — a code comment may still name the studio's own object.
      const body = read(page).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      expect(body, `${page} still says "plate"`).not.toMatch(/reference plate|kit plate/i);
      expect(body, `${page} still says "not a template with a photo dropped in"`).not.toMatch(/not a template with a photo dropped in/i);
    }
  });
});

describe("clipboard refusal is visible, never silent (smooth audit S13)", () => {
  it("CopyIdButton says so and selects the printed ID", () => {
    const src = read("components/CopyIdButton.tsx");
    expect(src).toContain("COPY_FAILED_TOAST");
    expect(src).toContain("selectValue");
    expect(src).not.toMatch(/catch \{\s*\/\/[^\n]*\n\s*\}/);
  });

  it("ShareRow says so and offers the link to select by hand", () => {
    const src = read("components/ShareRow.tsx");
    expect(src).toContain("LINK_COPY_FAILED");
    expect(src).toContain('aria-label="Card page link — select and copy"');
    expect(src).toContain('buttonClass(variant, "sm", "min-h-11")');
  });
});

describe("/c fonts — a finish never re-downloads a site family (smooth audit S5)", () => {
  const src = read("lib/fonts/finishes.ts");

  it("Stadium Night and Signature Spotlight point at the site instances", () => {
    expect(src).toContain("[--ff-display:var(--font-anton)]");
    expect(src).toContain("[--ff-supporting:var(--font-barlow)]");
    expect(src).toContain("[--ff-display:var(--font-space-grotesk)]");
  });

  it("does not load Anton, Barlow or Space Grotesk a second time", () => {
    expect(src).not.toMatch(/^import \{[\s\S]*?\bAnton\b[\s\S]*?\} from "next\/font\/google";/m);
    expect(src).not.toMatch(/=\s*(Anton|Barlow|Space_Grotesk)\(/);
  });
});
