// Truth lint: strings that must never appear on the site (docs/SITE-BUILD-SPEC-2026-09.md §8).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["app", "lib", "components", "content"];
const EXT = new Set([".ts", ".tsx", ".md", ".mdx", ".css"]);

const FORBIDDEN: Array<[RegExp, string]> = [
  [/cover\s?moment/i, "old brand"],
  [/\binstant(ly)?\b/i, "'instant' anything"],
  [/\b25 cards\b/i, "25 cards"],
  [/18\s*\+\s*4/, "'18 + 4' (pack is 18 total)"],
  [/rounded corners/i, "cards are square-cut"],
  [/free shipping worldwide/i, "US only"],
  [/\btopps\b|\bpanini\b|upper deck|graded slab/i, "competitor / slab comparison"],
  [/\bAI generator\b/i, "'AI generator' framing"],
  [/neon future|vintage trading card/i, "dropped finish"],
  [/\bpdf\b/i, "deliverables are PNG only"],
  [/\bverified (edition|card|athlete|review|buyer|purchase|customer|seller)s?\b|>\s*verified\s*</i, "'Verified' badge wording — the registry says Registered (§8)"],
  [/\b(customer|verified|real|5-star) reviews?\b|\b\d(\.\d)? ?stars\b|\b\d\.\d\/5\b/i, "review / star-rating claim (§8: none until real ones exist)"],
  [/\b(10|22) (collectible )?cards\b/i, "pack is 18 cards total"],
  [/stripe payment link/i, "stale process copy"],
  [/(?<![-\w])16 ?pt\b(?![-\w])/i, "unconfirmed stock claim"],
  [/semi-?gloss/i, "unconfirmed stock claim"],
  [/\bcheaper\b|same price on etsy/i, "Etsy comparison wording"],
  [/onCoverMomentTurnstile|cover-moment-idempotency/, "old identifier"],
  [/\byouth\b/i, "never 'youth' (COPY §0.1)"],
  [/\bvintage\b/i, "'Vintage' in any form (dropped finish)"],
];

/**
 * Files that are already scheduled for deletion and may keep a hit until then — never a live page.
 * Empty since Wave 1: app/site-client.tsx (the F0 home client) has been deleted (CONTRACTS §5.2).
 */
const EXEMPT: Record<string, RegExp[]> = {};

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(entry.name))) out.push(p);
  }
  return out;
}

const files = ROOTS.flatMap((r) => walk(path.join(process.cwd(), r)));

describe("forbidden strings", () => {
  it("scans a non-empty set of files", () => expect(files.length).toBeGreaterThan(5));
  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    it(rel, () => {
      const text = fs.readFileSync(file, "utf8");
      const exempt = EXEMPT[rel] ?? [];
      const hits = FORBIDDEN.filter(([re]) => !exempt.some((e) => e.source === re.source) && re.test(text)).map(([, why]) => why);
      expect(hits, `forbidden: ${hits.join("; ")}`).toEqual([]);
    });
  }
  it("no hand-typed dollar amounts outside lib/catalog/prices.ts", () => {
    const offenders = files
      .filter((f) => !f.endsWith(path.join("lib", "catalog", "prices.ts")) && /\.(tsx?|mdx?)$/.test(f))
      .filter((f) => /\$\d/.test(fs.readFileSync(f, "utf8")));
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([]);
  });
  it("no hand-typed dollar amounts in scripts/ either (docs/ stays unscanned)", () => {
    const offenders = walk(path.join(process.cwd(), "scripts"))
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => /\$\d/.test(fs.readFileSync(f, "utf8")));
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([]);
  });
});
