#!/usr/bin/env tsx
/**
 * Grade generated backgrounds against the same rules the prompts were built from.
 *
 *   npx tsx art-pipeline/qa.ts                          # grade everything on disk
 *   npx tsx art-pipeline/qa.ts --finish chrome-allstar
 *
 * Writes art-pipeline/out/qa-report.json and prints the failures. Pass --reroll to
 * regenerate every failing cell with the judge's own complaints fed back into the
 * prompt (see check.ts retryHint), up to --max-attempts times.
 */
import { existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { FINISHES, finishBySlug } from "./finishes.js";
import { SPORTS, sportBySlug } from "./sports.js";
import { backgroundPrompt } from "./prompts.js";
import { checkBackground, retryHint, type Verdict } from "./check.js";
import { referenceFor } from "./refs.js";
import { generateImage, loadEnv, MODEL, JUDGE_MODEL } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";

loadEnv();

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const OUT = "art-pipeline/out/backgrounds";
const reroll = has("reroll");
const maxAttempts = Number(flag("max-attempts", "3"));

const approved: Set<string> = new Set(
  existsSync("art-pipeline/approved.json")
    ? (JSON.parse(readFileSync("art-pipeline/approved.json", "utf8")).approved ?? [])
    : [],
);

const finishes = flag("finish") ? [finishBySlug(flag("finish"))!] : FINISHES;
const sports = flag("sport") ? flag("sport").split(",").map((s) => sportBySlug(s.trim())!) : SPORTS;

const cells = finishes.flatMap((f) =>
  sports.map((s) => ({ finish: f, sport: s, path: join(OUT, f.slug, `${s.slug}.png`) })),
).filter((c) => existsSync(c.path));

console.log(`judge ${JUDGE_MODEL}   grading ${cells.length} image(s)\n`);

const report: Record<string, { verdict: string; attempts: number; worstIssue: string; failed: string[]; approved: boolean }> = {};
let passed = 0;

for (const c of cells) {
  const tag = `${c.finish.slug}/${c.sport.slug}`;
  let v: Verdict;
  try {
    v = await checkBackground(c.path, c.finish, c.sport);
  } catch (e) {
    // Losing one cell to a transport error must not throw away the whole sweep and the
    // report for every cell already graded.
    console.log(`  ERROR ${tag}  ${(e as Error).message.slice(0, 120)}`);
    report[tag] = { verdict: "error", attempts: 0, worstIssue: (e as Error).message.slice(0, 200), failed: [], approved: approved.has(tag) };
    continue;
  }
  let attempts = 1;

  const locked = approved.has(tag);

  // KEEP THE BEST ATTEMPT, NOT THE LAST. A re-roll is a fresh roll of the dice, so it can
  // easily come back worse than what it replaced — this loop overwrote a wrestling frame
  // the user had just accepted with two progressively worse ones, and the good frame was
  // gone. Score each attempt by how many checks it failed and restore the best at the end.
  const score = (x: Verdict) => x.checks.filter((ch) => !ch.pass).length;
  let best: { image: Uint8Array; verdict: Verdict; attempt: number } =
    { image: readFileSync(c.path), verdict: v, attempt: 1 };

  while (reroll && !locked && v.verdict === "fail" && attempts < maxAttempts) {
    attempts++;
    process.stdout.write(`  reroll ${tag} (attempt ${attempts}) — ${v.worstIssue}\n`);
    // referenceFor, NOT finish.ref — a re-roll that references the original basketball
    // set re-injects the exact court the plate exists to remove, so QA made things worse.
    const ref = await refFor(referenceFor(c.finish));
    const r = await generateImage({
      prompt: backgroundPrompt(c.finish, c.sport) + retryHint(v),
      refs: [ref],
      aspectRatio: "2:3",
    });
    mkdirSync(dirname(c.path), { recursive: true });
    writeFileSync(c.path, r.image);
    v = await checkBackground(c.path, c.finish, c.sport);
    if (score(v) < score(best.verdict)) best = { image: r.image, verdict: v, attempt: attempts };
  }

  if (best.attempt !== attempts) {
    writeFileSync(c.path, best.image);
    v = best.verdict;
    console.log(`  kept  ${tag}  attempt ${best.attempt} of ${attempts} — later rolls scored worse`);
  }

  const failed = v.checks.filter((x) => !x.pass);
  report[tag] = { verdict: v.verdict, attempts, worstIssue: v.worstIssue, failed: failed.map((x) => x.id), approved: locked };
  if (v.verdict === "pass") {
    passed++;
    console.log(`  PASS ${tag}${attempts > 1 ? `  (after ${attempts} attempts)` : ""}`);
  } else {
    console.log(`  FAIL ${tag}${locked ? " [approved — not re-rolled]" : ""}  ${v.worstIssue}`);
    for (const f of failed) console.log(`       ${f.id}: ${f.note}`);
  }
}

const out = "art-pipeline/out/qa-report.json";
writeFileSync(out, JSON.stringify({ model: MODEL, judge: JUDGE_MODEL, gradedAt: new Date().toISOString(), report }, null, 2));
console.log(`\n${passed}/${cells.length} passed  ->  ${out}`);
