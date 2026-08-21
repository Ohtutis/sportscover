#!/usr/bin/env tsx
/**
 * Targeted revisions — change ONE thing without regenerating an order.
 *
 *   npx tsx art-pipeline/revise.ts --athlete soccer-age-07 --target hero \
 *     --note "chin up and a small confident smile instead of the serious expression"
 *   npx tsx art-pipeline/revise.ts --athlete soccer-age-07 --list
 *   npx tsx art-pipeline/revise.ts --athlete soccer-age-07 --target hero --clear
 *
 * WHY A FILE AND NOT A PROMPT EDIT
 * Every real order gets a revision round: somebody looks at the pack and says the socks are
 * wrong, or he looks too serious in the hero. Two things must be true when that happens —
 * the fix must touch only what was asked about, and it must SURVIVE. A note typed into a
 * prompt is lost the next time anything re-runs, and then the customer's correction quietly
 * reverts.
 *
 * So revisions are data, next to the spec. `_revisions.json` maps a target to an
 * instruction, the instruction is appended to that target's prompt, and — because it is part
 * of the prompt — the cache hash changes for that target ALONE. Adding one line therefore
 * regenerates exactly one frame and leaves the other three untouched, still cached, still
 * agreeing with each other.
 *
 * Targets: `hero`, `action2`, `action3`, `back`, `kit` (the wardrobe plate), `identity`.
 * Wardrobe FACTS belong in `_spec.json` instead — "the socks are white" is a corrected
 * decision, not a revision note. Use this for the things a spec cannot express: expression,
 * energy, framing, how a pose reads.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { athleteBySlug } from "./athletes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const OUT = "art-pipeline/out/athletes";
const TARGETS = ["hero", "action2", "action3", "back", "kit", "kit-back", "identity"];

export function revisionsFor(athleteSlug: string): Record<string, string> {
  const f = join(OUT, athleteSlug, "_revisions.json");
  if (!existsSync(f)) return {};
  try { return JSON.parse(readFileSync(f, "utf8")); } catch { return {}; }
}

/** The note for one target, as prompt text. Empty when there is none. */
export function revisionText(athleteSlug: string, target: string): string {
  const note = revisionsFor(athleteSlug)[target];
  if (!note) return "";
  return [
    ``,
    `REVISION — this frame was reviewed and sent back with one correction. It overrides`,
    `anything above that contradicts it, and everything else stays exactly as specified:`,
    `${note}`,
  ].join("\n");
}

// The module is also a CLI. Guard so importing it does not run the commands.
if (process.argv[1]?.endsWith("revise.ts")) {
  const slug = flag("athlete");
  const a = slug ? athleteBySlug(slug) : undefined;
  if (!a) throw new Error(`pass --athlete <slug>`);
  const file = join(OUT, a.slug, "_revisions.json");
  const current = revisionsFor(a.slug);

  if (has("list") || (!flag("target") && !has("clear"))) {
    const keys = Object.keys(current);
    console.log(`revisions for ${a.slug}${keys.length ? "" : " — none"}`);
    for (const k of keys) console.log(`  ${k.padEnd(9)} ${current[k]}`);
    process.exit(0);
  }

  const target = flag("target");
  if (!TARGETS.includes(target)) throw new Error(`--target must be one of: ${TARGETS.join(", ")}`);

  if (has("clear")) {
    delete current[target];
    writeFileSync(file, JSON.stringify(current, null, 2));
    console.log(`cleared  ${a.slug}/${target} — re-run that stage to rebuild it without the note`);
  } else {
    const note = flag("note");
    if (!note) throw new Error(`pass --note "<what to change>"`);
    current[target] = note;
    writeFileSync(file, JSON.stringify(current, null, 2));
    console.log(`revision ${a.slug}/${target}`);
    console.log(`  ${note}`);
    console.log(`\nRe-run the stage. Only ${target} changes — the rest stay cached and consistent:`);
    console.log(`  npm run art:athlete -- --athlete ${a.slug} --stage ${target === "kit" ? "kit" : target === "identity" ? "identity" : "poses"}`);
  }
}
