#!/usr/bin/env tsx
/**
 * Customer photo intake — the first stage of the per-order pipeline.
 *
 *   npx tsx art-pipeline/intake.ts --photos orders/1042/photos
 *
 * WHY THIS RUNS BEFORE ANYTHING IS SPENT
 * A customer sends whatever they have. The failures are predictable and every one of them
 * is cheap to detect and expensive to discover late — a team photo with twelve kids in it,
 * a face forty pixels wide, a motion-blurred phone shot, and the most common of all: four
 * photos taken from the same angle in the same minute. None of that is visible in the
 * generated poses until eight images have already been paid for and the face is subtly
 * wrong in all of them.
 *
 * Every rejection here has to be something the customer can ACT on. "Photo 3 has four
 * faces in it — send one with only <name>" is useful. "Validation failed" is not.
 *
 * Output: a JSON verdict plus the ranked list of photos to use as the identity anchor.
 * The next stage builds the identity plate from those, and from there the pipeline is the
 * same code that produced the demo roster — see README section 19.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const PY = flag("python", ".venv-matte/bin/python");
const DIR = flag("photos");
if (!DIR) throw new Error("pass --photos <dir>");
if (!existsSync(DIR)) throw new Error(`no such directory: ${DIR}`);

/** Minimum face size as a share of the frame. Below this the plate has nothing to work from. */
const MIN_FACE_SHARE = 0.008;
/** Minimum face box in pixels. A 90 px face upscales into a stranger. */
const MIN_FACE_PX = 180;
/** Two photos this alike are the same shot twice and add no angle coverage. */
const DUPLICATE_ABOVE = 0.92;
/**
 * The same-person test, and it is NOT a pairwise one.
 *
 * The first version failed the set if ANY pair scored under 0.36, and on the first real
 * batch it flagged a genuine set of four photos of one child. Measured (2026-08-20, the
 * seven-year-old ladder set):
 *
 *   pairwise            0.322 – 0.551   (one pair below the line)
 *   leave-one-out       0.526 – 0.605   (spread of 0.08)
 *
 * The failing pair was a training shot with the head down and the face shaded against a
 * wide open laugh with the eyes squeezed shut — the two hardest conditions in the set. Worst
 * pair is a brittle statistic: two extreme but perfectly valid frames always look far apart,
 * and it gets worse with children, since ArcFace is trained mostly on adults.
 *
 * So the statistic changed, NOT the threshold — the distinction matters, because loosening a
 * gate to make a batch pass is exactly what README section 6 forbids. Each photo is now
 * compared against the MEAN of the others, which is both far more stable and the same thing
 * the pipeline does downstream (the identity anchor IS a mean). A real intruder is an
 * outlier and shows up plainly: 0.2 against everyone else's 0.55.
 */
const SAME_PERSON_BELOW = 0.36;
/** ...and a photo that sits this far under its peers is an outlier even if it clears the floor. */
const OUTLIER_MARGIN = 0.15;
const MIN_USABLE = 3;

interface Face { bbox: number[]; score: number; embedding: number[] }
interface Probe { path: string; width?: number; height?: number; faces?: Face[]; error?: string }

const files = readdirSync(DIR)
  // kit.png is a DESIGNATION — a copy of whichever photo shows the real team strip. Counting
  // it as another photo double-weights that one in every identity statistic below.
  .filter((f) => !/^kit\./i.test(f))
  .filter((f) => [".jpg", ".jpeg", ".png", ".webp", ".heic"].includes(extname(f).toLowerCase()))
  .map((f) => join(DIR, f))
  .sort();

if (!files.length) throw new Error(`no images in ${DIR}`);

// Via a temp file, not stdout — see the note at the top of lib/face.py.
const tmp = join(tmpdir(), `intake-${process.pid}.json`);
execFileSync(PY, ["art-pipeline/lib/face.py", tmp, ...files], { stdio: "ignore" });
const probes: Probe[] = JSON.parse(readFileSync(tmp, "utf8"));
rmSync(tmp, { force: true });

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

interface Row {
  path: string;
  ok: boolean;
  reasons: string[];
  faceShare: number;
  facePx: number;
  score: number;
  embedding?: number[];
}

const rows: Row[] = probes.map((p) => {
  const reasons: string[] = [];
  if (p.error) return { path: p.path, ok: false, reasons: ["the file could not be opened"], faceShare: 0, facePx: 0, score: 0 };
  const faces = p.faces ?? [];
  if (!faces.length) {
    return { path: p.path, ok: false, reasons: ["no face found in this photo"], faceShare: 0, facePx: 0, score: 0 };
  }
  const f = faces[0];
  // OTHER PEOPLE IN THE FRAME ARE NORMAL AND MUST NOT BE A FAILURE.
  // The first version failed any photo with more than one face, and on the first real test
  // it rejected both sideline shots — a child in the foreground with teammates and parents
  // behind. That is precisely what a parent's best photos look like, so the rule was
  // throwing away the strongest input a customer has.
  //
  // What actually breaks the pipeline is AMBIGUITY: a team photo where six children are the
  // same size and nothing says which one is yours. So the test is relative, not a count —
  // fail only when the second face is close enough in size to be mistaken for the subject.
  if (faces.length > 1) {
    const a0 = (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]);
    const g = faces[1];
    const a1 = (g.bbox[2] - g.bbox[0]) * (g.bbox[3] - g.bbox[1]);
    if (a1 / a0 > 0.6) {
      reasons.push(
        `${faces.length} people in this photo and no clear subject — send one where the athlete is the closest person to the camera`,
      );
    }
  }
  const w = f.bbox[2] - f.bbox[0], h = f.bbox[3] - f.bbox[1];
  const facePx = Math.min(w, h);
  const faceShare = (w * h) / (p.width! * p.height!);
  if (facePx < MIN_FACE_PX) reasons.push(`the face is only ${Math.round(facePx)} px across — too small; move closer or send the original rather than a screenshot`);
  if (faceShare < MIN_FACE_SHARE) reasons.push("the athlete is too far away in the frame");
  if (f.score < 0.6) reasons.push("the face is unclear — likely blurred or badly lit");
  return { path: p.path, ok: reasons.length === 0, reasons, faceShare, facePx, score: f.score, embedding: f.embedding };
});

const usable = rows.filter((r) => r.ok && r.embedding);

// Angle coverage and identity consistency, both from the same pairwise similarities:
// a pair that is TOO similar is the same shot twice; a pair that is too dissimilar is a
// different child.
const notes: string[] = [];
const pairs: { a: string; b: string; sim: number }[] = [];
for (let i = 0; i < usable.length; i++) {
  for (let j = i + 1; j < usable.length; j++) {
    pairs.push({ a: usable[i].path, b: usable[j].path, sim: dot(usable[i].embedding!, usable[j].embedding!) });
  }
}
const near = pairs.filter((p) => p.sim > DUPLICATE_ABOVE);

// Leave-one-out: each photo against the mean of the others. See the note on
// SAME_PERSON_BELOW for why this replaced the pairwise test.
const loo = usable.map((r, i) => {
  const others = usable.filter((_, k) => k !== i).map((o) => o.embedding!);
  if (!others.length) return { path: r.path, sim: 1 };
  const m = others[0].map((_, d) => others.reduce((s, v) => s + v[d], 0) / others.length);
  const n = Math.hypot(...m);
  return { path: r.path, sim: dot(r.embedding!, m.map((v) => v / n)) };
});
const median = [...loo].sort((a, b) => a.sim - b.sim)[Math.floor(loo.length / 2)]?.sim ?? 1;
const far = loo.filter((x) => x.sim < SAME_PERSON_BELOW || x.sim < median - OUTLIER_MARGIN);
if (far.length) {
  notes.push(
    `these do not all look like the same person — check that no sibling or teammate got mixed in: ` +
    far.map((x) => `${x.path.split("/").pop()} (${x.sim.toFixed(2)} vs the others' ${median.toFixed(2)})`).join(", "),
  );
}
if (usable.length >= 2 && near.length === pairs.length) {
  notes.push("every photo is nearly the same shot — send at least one from a different angle, ideally turned to the side");
}

const verdict = usable.length >= MIN_USABLE && !far.length ? "ok" : "rejected";
const out = join(DIR, "_intake.json");
writeFileSync(out, JSON.stringify({
  verdict,
  usable: usable.map((r) => r.path),
  // Best first: a big, sharp, confidently-detected face makes the strongest anchor.
  anchorOrder: [...usable].sort((a, b) => b.faceShare * b.score - a.faceShare * a.score).map((r) => r.path),
  identity: loo.map((x) => ({ path: x.path, similarityToOthers: +x.sim.toFixed(3) })),
  rejected: rows.filter((r) => !r.ok).map((r) => ({ path: r.path, reasons: r.reasons })),
  notes,
}, null, 2));

console.log(`intake ${DIR}`);
for (const r of rows) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.path.split("/").pop()}  face ${Math.round(r.facePx)} px (${(r.faceShare * 100).toFixed(1)}% of frame)`);
  for (const reason of r.reasons) console.log(`       ${reason}`);
}
for (const n of notes) console.log(`  note ${n}`);
console.log(`\n${verdict.toUpperCase()} — ${usable.length} usable of ${rows.length}, need ${MIN_USABLE}`);
console.log(`-> ${out}`);
if (verdict !== "ok") process.exitCode = 1;
