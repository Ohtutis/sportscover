#!/usr/bin/env tsx
/**
 * Re-roll the identity plate until it clears a threshold — or until the photographs are proved
 * to be the ceiling.
 *
 *   npm run art:best -- --athlete "Order 02" --until 0.85 --tries 5
 *   npm run art:best -- --athlete "Order 02" --until 0.85 --tries 5 --model gemini-3-pro-image
 *
 * WHY THIS EXISTS
 * Going back to a customer for more photographs is the most expensive thing in the whole
 * pipeline. Not in euros — in admin, in delay, and in asking someone to redo work they already
 * sat down and did once. So before anyone is asked for anything, the pipeline should spend the
 * twenty cents it takes to find out whether the photographs it already has are good enough.
 *
 * TWO FAILURES THAT LOOK IDENTICAL AND ARE NOT, which is the whole point of the loop:
 *
 *   A WEAK ROLL. The model drew badly this time. Re-rolling fixes it, and the evidence is
 *   plain — Order 02 on Pro scored 0.135, then 0.645 from the same prompt and the same photos.
 *   Nothing was wrong with the input at all.
 *
 *   A WEAK ANCHOR. The photographs do not carry enough of the face. Re-rolling cannot fix it
 *   and only spends money finding the same ceiling again: Order 02 produced six plates across
 *   two models and never passed 0.784, because every photograph in the set is soft.
 *
 * The loop tells them apart by SPREAD. Scores that scatter mean the dice; scores that cluster
 * just under the line mean the photographs, and then asking the customer is the only fix —
 * and by then it is an answer, not a guess, and it names what to ask for.
 *
 * Thresholds come from the frames a human accepted or rejected on 2026-08-22 — see README
 * section 45. Never move one to make a batch pass.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const slug = flag("athlete");
if (!slug) throw new Error("pass --athlete <slug>");
const until = Number(flag("until", "0.85"));
const tries = Number(flag("tries", "4"));
const model = flag("model", "gemini-3.1-flash-image");
const PY = flag("python", ".venv-matte/bin/python");
const frame = flag("frame", "_identity");

const DIR = join("art-pipeline/out/athletes", slug);
const plate = join(DIR, `${frame}.png`);
const beforeDir = join(DIR, "before");

/** The anchor is the customer's own photographs — the ones intake cleared, and only those. */
const verdict = join(beforeDir, "_intake.json");
if (!existsSync(verdict)) throw new Error(`no ${verdict} — run art:intake first`);
const anchorPaths: string[] = JSON.parse(readFileSync(verdict, "utf8")).usable ?? [];
if (!anchorPaths.length) throw new Error("intake cleared no photographs; there is nothing to score against");

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (v: number[]) => { const n = Math.hypot(...v); return v.map((x) => x / n); };

function embed(paths: string[]) {
  const tmp = join(tmpdir(), `best-${process.pid}-${Math.random().toString(36).slice(2)}.json`);
  try {
    execFileSync(PY, ["art-pipeline/lib/face.py", tmp, ...paths], { stdio: "ignore" });
    return JSON.parse(readFileSync(tmp, "utf8")) as { path: string; faces?: { embedding: number[] }[] }[];
  } finally {
    rmSync(tmp, { force: true });
  }
}

// One anchor for the whole search, computed once: the mean of the cleared photographs.
const anchorProbe = embed(anchorPaths);
const anchor = norm(
  anchorProbe
    .filter((e) => e.faces?.length)
    .map((e) => e.faces![0].embedding)
    .reduce((a, v) => a.map((x, i) => x + v[i])),
);

/** The plate's three panels averaged, the same way the identity gate does it. */
function scorePlate(path: string): number | null {
  const faces = embed([path])[0]?.faces ?? [];
  if (!faces.length) return null;
  const m = norm(faces.slice(0, 3).map((f) => f.embedding).reduce((a, v) => a.map((x, i) => x + v[i])));
  return dot(m, anchor);
}

const versionsDir = join(DIR, "_versions");
const scoredDir = join(DIR, "_scored");
const latestVersion = () => {
  const v = existsSync(versionsDir)
    ? readdirSync(versionsDir).filter((f) => new RegExp(`^${frame}-\\d+\\.png$`).test(f))
    : [];
  return v.sort((a, b) => Number(a.match(/-(\d+)\.png$/)![1]) - Number(b.match(/-(\d+)\.png$/)![1])).pop();
};

console.log(`best     ${slug}/${frame} — up to ${tries} rolls on ${model}, stopping at ${until}`);
console.log(`anchor   ${anchorPaths.length} photographs cleared by intake\n`);

const results: { file: string; score: number }[] = [];
for (let i = 1; i <= tries; i++) {
  execFileSync(
    "npx",
    ["tsx", "art-pipeline/gen-athlete.ts", "--athlete", slug, "--stage", "identity",
     "--frame", frame, "--from-photos", beforeDir, "--force"],
    { stdio: "ignore", env: { ...process.env, GEMINI_IMAGE_MODEL: model } },
  );
  const s = scorePlate(plate);
  const v = latestVersion();
  if (s == null || !v) { console.log(`  roll ${i}   no face found — skipped`); continue; }
  results.push({ file: join(versionsDir, v), score: s });
  // A copy whose NAME carries the score, so the folder can be browsed instead of cross-read
  // against a log. Sorting by filename sorts by quality.
  mkdirSync(scoredDir, { recursive: true });
  copyFileSync(join(versionsDir, v), join(scoredDir, `${s.toFixed(3)}-${v}`));
  const mark = s >= until ? "  <- clears the line" : "";
  console.log(`  roll ${i}   ${s.toFixed(3)}${mark}`);
  if (s >= until) break;
}

if (!results.length) throw new Error("every roll failed to produce a readable face");

results.sort((a, b) => b.score - a.score);
const best = results[0];
copyFileSync(best.file, plate);
const side = best.file.replace(/\.png$/, ".json");
if (existsSync(side)) copyFileSync(side, plate.replace(/\.png$/, ".json"));

const scores = results.map((r) => r.score);
const spread = Math.max(...scores) - Math.min(...scores);
console.log(`\nbest     ${best.score.toFixed(3)}  (${best.file.split("/").pop()}) -> restored into ${frame}.png`);
console.log(`         scored copies: ${scoredDir}/  (filename starts with the score)`);

if (best.score >= until) {
  console.log(`         clears ${until}. Approve it to lock it:  npm run art:approve -- --athlete "${slug}" --frame ${frame}`);
} else if (results.length < 2) {
  // A single roll has a spread of zero, and zero is not evidence of a ceiling — it is evidence
  // of one roll. The first version read it as "clustered" and told the customer to send more
  // photographs on the strength of one draw from a distribution 0.09 wide.
  console.log(`         under ${until}, but this is ONE roll and the spread of this model is ~0.09. Roll again before concluding anything.`);
} else if (spread >= 0.08) {
  // Scattered: the dice are still moving, so more rolls are worth their price.
  console.log(`         under ${until}, but the rolls SCATTER (spread ${spread.toFixed(3)}) — the model, not the photographs. More rolls should help.`);
} else {
  // Clustered: every roll found the same ceiling. This is the photographs, and more of the
  // same will not move it. Say what to ask the customer for, using what intake measured.
  const iv = JSON.parse(readFileSync(verdict, "utf8"));
  const asks: string[] = [];
  if ((iv.sharpest ?? 0) < 60) asks.push("one CRISP close-up in daylight — every photo in this set is soft");
  if (!iv.coverage?.turnedLeft) asks.push("one with the head turned about 45° to the left");
  if (!iv.coverage?.turnedRight) asks.push("one with the head turned about 45° to the right");
  console.log(
    `         under ${until} and the rolls CLUSTER (spread ${spread.toFixed(3)}) — this is the ceiling of the photographs,\n` +
    `         not bad luck. More rolls will keep landing here. What to ask the customer for:`,
  );
  for (const a of asks.length ? asks : ["one sharper, well-lit photograph of the face straight on"]) {
    console.log(`           - ${a}`);
  }
  process.exitCode = 1;
}
