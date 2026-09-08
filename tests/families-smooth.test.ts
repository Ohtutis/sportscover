// The 2026-09-08 "finished and smooth" pass over the product-family pages, /senior-night and
// /how-it-works: the layout defects the responsive audit measured, and the copy the voice audit
// found reading as studio notes rather than as a sentence to a parent.
//
// Rules that are about geometry are asserted on the classes that produce it (the browser numbers are
// in the fix report); rules that are about words are asserted on the rendered text, so a prop name or
// a DOM id can never satisfy — or break — a copy assertion.
import { describe, expect, it, vi } from "vitest";

// The sport-picker island calls `useRouter`, and `renderToStaticMarkup` has no app-router context.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: () => {}, push: () => {}, refresh: () => {}, back: () => {}, forward: () => {}, prefetch: () => {} }),
}));

import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HowItWorksPage from "../app/(marketing)/how-it-works/page";
import { SPORT_GRID_COLUMNS } from "../app/(marketing)/(families)/_shared/numberless-block";
import { SPORT_PICKER_ID } from "../app/(marketing)/(families)/_shared/sport-picker";

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
/** Source without comments — these rules are about rendered code, not about the notes beside it. */
const strip = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(rel, out);
    else if (rel.endsWith(".tsx")) out.push(rel);
  }
  return out;
}

/** Visible text of a rendered page: tags gone, JSON-LD gone, entities resolved. */
const visibleText = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#x[0-9a-f]+;/gi, "'")
    .replace(/\s+/g, " ");

describe("the price ladder never orphans a tier (DESIGN §2.2)", () => {
  const src = read("app/(marketing)/(families)/_shared/tier-row.tsx");

  it("takes its column count from the tier count at md, not only at lg", () => {
    // Three tiers used to set 2 + 1 from 768 to 1023: two cards in row one and the third alone in
    // row two beside an empty slot the same size.
    expect(strip(src)).toContain('visible.length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"');
    expect(strip(src)).not.toMatch(/md:grid-cols-2 md:grid/);
  });

  it("puts the slack inside the ruled table, not between the table and the chip", () => {
    // The cards are stretched to one height; the shortest one has to absorb the difference. Inside
    // the `dl` it is the table's last row and every card's bottom rule lands on one line.
    const card = strip(read("components/TierCard.tsx"));
    expect(card).toMatch(/<dl className="mt-6 grow /);
  });
});

describe("a placeholder is still a card box (DoD §11.4)", () => {
  /*
    Scoped to the surfaces this pass owns. `app/(marketing)/_home/Finishes.tsx` still writes
    `rounded-ui` on the 5 : 7 placeholder it draws when a finish has no exported face; all six do, so
    it never renders today, and the file belongs to the home pass — it is filed as a request, not
    silenced with an allowlist entry that would read as a pass.
  */
  it("no aspect-[5/7] element carries rounded-ui", () => {
    const offenders: string[] = [];
    const scope = [...walk("app/(marketing)/(families)"), ...walk("app/(marketing)/senior-night"), ...walk("app/(marketing)/trading-cards"), ...walk("app/(marketing)/posters"), ...walk("app/(marketing)/complete-set"), ...walk("app/(marketing)/how-it-works"), ...walk("components")];
    for (const file of scope) {
      const src = read(file);
      for (const cls of src.match(/className="[^"]*aspect-\[5\/7\][^"]*"/g) ?? []) {
        if (/\brounded-ui\b/.test(cls)) offenders.push(`${file}: ${cls}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("says why a tile is empty instead of setting the sport name like a finished card", () => {
    const grid = read("app/(marketing)/(families)/_shared/numberless-block.tsx");
    expect(grid).toContain('export const NO_EXAMPLE_YET = "Built to order — no example card yet."');
    const sn = read("app/(marketing)/senior-night/page.tsx");
    expect(sn).toContain('const NO_EXAMPLE_YET = "Built to order — no example card yet."');
    expect(sn).toContain("{NO_EXAMPLE_YET}");
  });
});

describe("one scale for the 17-sport grid", () => {
  it("the card grid and the poster list share a single column scale", () => {
    const src = read("app/(marketing)/(families)/_shared/numberless-block.tsx");
    expect(SPORT_GRID_COLUMNS).toBe("grid-cols-3 md:grid-cols-5 xl:grid-cols-6");
    // Both branches interpolate the constant; neither writes its own grid-cols-*.
    expect(src.match(/\$\{SPORT_GRID_COLUMNS\}/g) ?? []).toHaveLength(2);
    expect(strip(src)).not.toMatch(/grid grid-cols-\d/);
  });
});

describe("/senior-night sections 03 and 04", () => {
  const src = read("app/(marketing)/senior-night/page.tsx");

  it("the nine sports are a snap scroller under sm and a capped grid above it", () => {
    const section = src.slice(src.indexOf('id="sn-sports"'), src.indexOf('id="sn-class"'));
    for (const cls of ["snap-x", "snap-mandatory", "overflow-x-auto", "sm:grid", "sm:grid-cols-3", "sm:overflow-visible"]) {
      expect(section, cls).toContain(cls);
    }
    expect(section).toContain('w-[62vw] max-w-[260px] shrink-0 snap-start');
    // 347 px tiles made section 04 the tallest band on the page.
    expect(section).toContain("sm:max-w-[720px]");
    expect(section).not.toContain("max-w-[1120px]");
  });

  it("the three senior-edition cells are one row from md, so the certificate is never alone", () => {
    const section = src.slice(src.indexOf('id="sn-what"'), src.indexOf('id="sn-sports"'));
    expect(section).toContain("md:grid-cols-3");
    expect(section).not.toContain("md:grid-cols-2");
  });
});

describe("the sport picker keeps the reader where they are", () => {
  const picker = read("app/(marketing)/(families)/_shared/sport-picker.tsx");
  const island = read("app/(marketing)/(families)/_shared/sport-picker-auto.tsx");

  it("replaces the URL instead of submitting, and never scrolls the page", () => {
    expect(island).toContain("useRouter");
    expect(island).toContain("{ scroll: false }");
    expect(island).toContain("router.replace(");
    expect(strip(island)).not.toContain("requestSubmit");
  });

  it("shows the fallback button only to a browser without JavaScript", () => {
    expect(picker).toContain("<noscript");
    // It used to be server-rendered visible and hidden on hydration, so it popped out of the row.
    expect(strip(picker)).not.toContain("data-sport-submit");
    expect(strip(island)).not.toContain("hidden = ");
  });

  it("gives the no-JavaScript submit somewhere to land", () => {
    expect(SPORT_PICKER_ID).toBe("sport-picker");
    expect(picker).toContain("id={SPORT_PICKER_ID}");
    expect(picker).toContain("scroll-mt-24");
    expect(picker).toContain("action={`${action}#${SPORT_PICKER_ID}`}");
  });
});

describe("the to-scale sheet hangs the sport the reader picked", () => {
  const src = read("app/(marketing)/posters/page.tsx");

  it("maps a sport to its own poster art and falls back to football", () => {
    expect(src).toContain("const SHEET_POSTER_KEYS");
    for (const slug of ["basketball", "softball", "baseball", "football"]) expect(src, slug).toContain(`${slug}: [`);
    expect(src).toContain("posterArt(sport.slug)");
    expect(src).toContain('...(SHEET_POSTER_KEYS[slug] ?? []), "posters.finish.SN"');
    expect(src).toContain("<ToScaleSheet art={scaleArt}");
  });
});

describe("the calculator answers where the reader can see it", () => {
  const src = read("components/OrderByCalculator.tsx");
  const copy = read("lib/copy/calc.ts");

  it("scrolls the result into view and moves focus to it", () => {
    expect(src).toContain('scrollIntoView({ block: "nearest" })');
    expect(src).toContain("node.focus({ preventScroll: true })");
    expect(src).toContain("scroll-mt-24");
  });

  it("announces one sentence, not the whole ledger", () => {
    expect(src).toContain('aria-live="off"');
    expect(src).toContain("planSummary(");
    expect(copy).toContain("export const planSummary");
    // 413 characters was the measured payload of the old <output> live region.
    expect(copy).toContain("For ${night}:");
  });

  it("says what the files date actually is, not that it was timed to the night", () => {
    expect(copy).toContain("after you order, whichever night it is");
    expect(copy).not.toContain("before the night`");
  });
});

describe("copy voice — the pages talk to a parent, not to the studio", () => {
  const html = renderToStaticMarkup(createElement(HowItWorksPage));
  const text = visibleText(html);

  it("/how-it-works uses no studio jargon in anything a reader sees", () => {
    for (const word of [/\bartefacts?\b/i, /\bgates?\b/i, /\bre-rolled\b/i, /\bkit plate\b/i, /\breference plate\b/i, /\bcomposite\b/i]) {
      expect(text, String(word)).not.toMatch(word);
    }
  });

  it("keeps the anchors other pages link to", () => {
    // FourFears links /how-it-works#likeness and the home proof wall links #gates: the words changed,
    // the ids did not.
    expect(html).toContain('id="gates"');
    expect(html).toContain('id="likeness"');
  });

  it("drops the defence nobody asked for from the two family subheads", () => {
    for (const file of ["app/(marketing)/trading-cards/page.tsx", "app/(marketing)/posters/page.tsx"]) {
      expect(strip(read(file)), file).not.toContain("Not a template with a photo dropped in");
    }
  });

  it("the finish row explains the finishes without a third sense of the word plate", () => {
    const row = read("app/(marketing)/(families)/_shared/finishes-row.tsx");
    expect(strip(row)).not.toContain("speaks through material");
    expect(strip(row)).not.toMatch(/\bplate\b/);
    expect(row).toContain("Six materials, one layout");
  });
});
