#!/usr/bin/env tsx
/**
 * Generate the finish x sport background matrix.
 *
 *   npx tsx art-pipeline/gen-backgrounds.ts --finish chrome-allstar --sport ice-hockey,soccer
 *   npx tsx art-pipeline/gen-backgrounds.ts --finish all --sport all
 *
 * Re-runs are free: a result is skipped when its prompt hash matches the sidecar
 * next to the PNG. Change a prompt (or pass --force) and only the affected cells
 * are re-billed. Output lands in art-pipeline/out/backgrounds/<finish>/<sport>.png
 * with a _contact-sheet.png for the human QA pass.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { FINISHES, finishBySlug, type Finish } from "./finishes.js";
import { SPORTS, sportBySlug, type Sport } from "./sports.js";
import { backgroundPrompt } from "./prompts.js";
import { referenceFor } from "./refs.js";
import { isApproved } from "./approved.js";
import { generateImage, loadEnv, MODEL } from "./lib/gemini.js";
import { refFor, contactSheet } from "./lib/img.js";

loadEnv();

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const OUT = "art-pipeline/out/backgrounds";
const CONCURRENCY = Number(flag("concurrency", "3"));
const force = has("force");
const dry = has("dry-run");

function pick<T extends { slug: string }>(all: T[], arg: string, what: string): T[] {
  if (!arg || arg === "all") return all;
  return arg.split(",").map((s) => {
    const hit = all.find((x) => x.slug === s.trim());
    if (!hit) throw new Error(`unknown ${what} "${s.trim()}" — have: ${all.map((x) => x.slug).join(", ")}`);
    return hit;
  });
}

const finishes = pick(FINISHES, flag("finish"), "finish");
const sports = pick(SPORTS, flag("sport"), "sport");

interface Job { finish: Finish; sport: Sport; prompt: string; out: string; hash: string; ref: string }

const jobs: Job[] = finishes.flatMap((finish) =>
  sports.map((sport) => {
    const prompt = backgroundPrompt(finish, sport);
    const ref = referenceFor(finish);
    return {
      finish, sport, prompt, ref,
      out: join(OUT, finish.slug, `${sport.slug}.png`),
      hash: createHash("sha256").update(`${MODEL}\n${ref}\n${prompt}`).digest("hex").slice(0, 16),
    };
  }),
);

// A cell a human signed off is never regenerated. qa.ts already refused to re-roll
// approved cells, but the generator did not check at all — so a plain `--sport all` run
// silently replaced approved artwork with a fresh roll of the dice. --force overrides.
const locked = jobs.filter((j) => !force && isApproved(j.finish.slug, j.sport.slug));
if (locked.length) {
  console.log(`locked   ${locked.length} approved cell(s) kept as-is: ${locked.map((j) => j.sport.slug).join(", ")}`);
}

const fresh = jobs.filter((j) => {
  if (!force && isApproved(j.finish.slug, j.sport.slug)) return false;
  if (force || !existsSync(j.out)) return true;
  const side = j.out.replace(/\.png$/, ".json");
  if (!existsSync(side)) return true;
  try { return JSON.parse(readFileSync(side, "utf8")).hash !== j.hash; } catch { return true; }
});

console.log(`model    ${MODEL}`);
console.log(`matrix   ${finishes.length} finishes x ${sports.length} sports = ${jobs.length}`);
console.log(`to build ${fresh.length}  (${jobs.length - fresh.length} cached)`);
console.log(`est cost ~$${(fresh.length * 0.04).toFixed(2)}\n`);

if (dry) {
  console.log(fresh.map((j) => `  ${j.finish.slug}/${j.sport.slug}`).join("\n") || "  (nothing)");
  console.log(`\n--- sample prompt (${fresh[0]?.finish.slug}/${fresh[0]?.sport.slug}) ---\n${fresh[0]?.prompt ?? ""}`);
  process.exit(0);
}

const refCache = new Map<string, Promise<{ data: Buffer; mime: string }>>();
const getRef = (path: string) => {
  if (!refCache.has(path)) refCache.set(path, refFor(path));
  return refCache.get(path)!;
};

let done = 0, failed = 0, tokens = 0;

async function run(j: Job) {
  const tag = `${j.finish.slug}/${j.sport.slug}`;
  try {
    if (!existsSync(j.ref)) throw new Error(`reference missing: ${j.ref}`);
    const ref = await getRef(j.ref);
    const r = await generateImage({ prompt: j.prompt, refs: [ref], aspectRatio: "2:3" });
    mkdirSync(dirname(j.out), { recursive: true });
    writeFileSync(j.out, r.image);
    writeFileSync(
      j.out.replace(/\.png$/, ".json"),
      JSON.stringify({ hash: j.hash, model: MODEL, ref: j.ref, generatedAt: new Date().toISOString(), prompt: j.prompt }, null, 2),
    );
    tokens += r.tokens;
    console.log(`  ok   ${tag}  (${(r.image.length / 1024 | 0)} KB)`);
  } catch (e) {
    failed++;
    console.log(`  FAIL ${tag}  ${(e as Error).message}`);
  } finally {
    done++;
  }
}

const queue = [...fresh];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    for (let j = queue.shift(); j; j = queue.shift()) await run(j);
  }),
);

const built = jobs.filter((j) => existsSync(j.out));
if (built.length) {
  const sheet = "art-pipeline/out/_contact-sheet-backgrounds.png";
  await contactSheet(built.map((j) => ({ path: j.out, label: `${j.finish.code} ${j.sport.slug}` })), sheet);
  console.log(`\ncontact sheet -> ${sheet}`);
}
console.log(`\n${done - failed} ok, ${failed} failed, ${tokens} tokens`);
