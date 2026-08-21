#!/usr/bin/env tsx
/**
 * The numeric identity gate: does every pose show the SAME PERSON as the identity plate?
 *
 *   npx tsx art-pipeline/identity-gate.ts --athlete ice-hockey
 *   npx tsx art-pipeline/identity-gate.ts --plate photos/ --against out/athletes/x/hero.png
 *
 * This is the check the per-order tool is built around. `identity_match` in
 * check-athlete.ts asks a vision model, and on the pilot that model failed a frame and then
 * passed the byte-identical file on the next run. Identity has a formula, so it gets the
 * formula: ArcFace embeddings, cosine similarity, one threshold.
 *
 * The plate anchor is the MEAN of the faces found in the plate (its three panels are the
 * same person from three angles by construction), re-normalised. A multi-view average is a
 * better anchor than any single view and it is what makes the customer variant work: there
 * the anchor is the mean over their 3-4 photos instead.
 *
 * THRESHOLD. 0.36+ is the usual "same person" line for ArcFace on real photographs. This
 * pipeline is generative, so the numbers run differently and the threshold is calibrated
 * against frames a human has accepted — see --report and README section 21. Never raise the
 * threshold to make a batch pass.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ATHLETES, athleteBySlug, type Athlete } from "./athletes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const PY = flag("python", ".venv-matte/bin/python");
const THRESHOLD = Number(flag("threshold", "0.36"));
const OUT = "art-pipeline/out/athletes";

interface Face { bbox: number[]; score: number; embedding: number[] }
interface Probe { path: string; width?: number; height?: number; faces?: Face[]; error?: string }

function embed(paths: string[]): Probe[] {
  // Via a temp file, not stdout — see the note at the top of lib/face.py.
  const tmp = join(tmpdir(), `faces-${process.pid}-${paths.length}.json`);
  try {
    execFileSync(PY, ["art-pipeline/lib/face.py", tmp, ...paths], { stdio: "ignore" });
    return JSON.parse(readFileSync(tmp, "utf8"));
  } finally {
    rmSync(tmp, { force: true });
  }
}

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
function mean(vs: number[][]): number[] {
  const m = vs[0].map((_, i) => vs.reduce((s, v) => s + v[i], 0) / vs.length);
  const n = Math.hypot(...m);
  return m.map((v) => v / n);
}
/** Face area as a share of the frame — a face rendered tiny cannot be judged or printed. */
const areaShare = (f: Face, w: number, h: number) =>
  ((f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1])) / (w * h);

const who = flag("athlete");
const athletes: Athlete[] =
  !who || who === "all" ? ATHLETES : who.split(",").map((s) => athleteBySlug(s.trim())!);

for (const a of athletes) {
  const dir = join(OUT, a.slug);
  const plate = join(dir, "_identity.png");
  if (!existsSync(plate)) { console.log(`skip ${a.slug}: no identity plate`); continue; }

  const poses = readdirSync(dir)
    .filter((f) => f.endsWith(".png") && !f.startsWith("_") && !f.includes(".cutout") && !f.includes(".onblack"))
    .map((f) => join(dir, f));
  // Not "no poses" — the plate-vs-photos half is the whole point before poses exist.
  const hasSources = existsSync(join(dir, "before"));
  if (!poses.length && !hasSources) { console.log(`skip ${a.slug}: nothing to compare the plate against`); continue; }

  // THE TWO HALVES OF THE GATE. This one was missing until 2026-08-20, and it is the more
  // important of the two: does the plate still show the person in the customer's photographs?
  // Everything downstream references the plate, so a plate that drifted has already lost the
  // likeness before a single pose is generated — and no later check can recover it.
  const beforeDir = join(dir, "before");
  const sources = existsSync(beforeDir)
    ? readdirSync(beforeDir)
        .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/^kit\./i.test(f))
        .sort().map((f) => join(beforeDir, f))
    : [];

  const probes = embed([plate, ...sources, ...poses]);
  const plateProbe = probes[0];
  const sourceProbes = probes.slice(1, 1 + sources.length);
  if (!plateProbe.faces?.length) {
    console.log(`FAIL ${a.slug}: no face found in the identity plate — it cannot anchor anything`);
    continue;
  }
  const anchor = mean(plateProbe.faces.map((f) => f.embedding));
  console.log(`${a.slug}  anchor from ${plateProbe.faces.length} face(s) in the plate  (threshold ${THRESHOLD})`);

  let sourceRows: { photo: string; similarity: number; verdict: string }[] = [];
  if (sourceProbes.length) {
    const withFaces = sourceProbes.filter((p) => p.faces?.length);
    sourceRows = withFaces.map((p) => {
      const sim = dot(anchor, p.faces![0].embedding);
      return {
        photo: p.path.split("/").pop()!,
        similarity: +sim.toFixed(4),
        verdict: sim >= THRESHOLD ? "pass" : "FAIL",
      };
    });
    const mn = sourceRows.reduce((s, r) => s + r.similarity, 0) / (sourceRows.length || 1);
    console.log(`  PLATE vs THE ${sourceRows.length} SOURCE PHOTOS — mean ${mn.toFixed(3)}`);
    for (const r of sourceRows) {
      console.log(`  ${r.verdict === "pass" ? "ok  " : "FAIL"} ${r.photo}  cosine ${r.similarity.toFixed(3)}`);
    }
    if (sourceRows.some((r) => r.verdict !== "pass")) {
      console.log(`  >> the plate drifted from the customer's photos. Re-roll the PLATE; do not generate poses from it.`);
    }
    if (poses.length) console.log(`  PLATE vs POSES`);
  }

  const rows = probes.slice(1 + sources.length).map((p) => {
    const pose = p.path.split("/").pop()!.replace(/\.png$/, "");
    if (!p.faces?.length) {
      // Correct and expected on the from-behind shot. Not a failure — the pose is defined
      // by the face being hidden, so identity there is carried by the ones that pass.
      return { pose, similarity: null as number | null, faceShare: 0, verdict: "no face" };
    }
    const f = p.faces[0];
    const similarity = dot(anchor, f.embedding);
    const faceShare = areaShare(f, p.width!, p.height!);
    return {
      pose,
      similarity: +similarity.toFixed(4),
      faceShare: +faceShare.toFixed(4),
      verdict: similarity >= THRESHOLD ? "pass" : "FAIL",
    };
  });

  if (!rows.length) console.log(`  (no poses yet)`);
  for (const r of rows) {
    const sim = r.similarity === null ? "  —   " : r.similarity.toFixed(3);
    console.log(
      `  ${r.verdict === "pass" ? "ok  " : r.verdict === "no face" ? "n/a " : "FAIL"} ${a.slug}/${r.pose}` +
      `  cosine ${sim}  face ${(r.faceShare * 100).toFixed(2)}% of frame`,
    );
  }
  writeFileSync(join(dir, "_identity-gate.json"), JSON.stringify({ threshold: THRESHOLD, sourceRows, rows }, null, 2));
  console.log(`  -> ${join(dir, "_identity-gate.json")}`);
}
