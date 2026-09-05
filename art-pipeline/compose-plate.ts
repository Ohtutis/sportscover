#!/usr/bin/env tsx
/**
 * Build ONE identity plate out of the best panel from every roll.
 *
 *   npm run art:compose -- --athlete "Order 02"
 *
 * WHY
 * Every roll is three independent draws: a portrait, a three-quarter and a full-length. They
 * do not succeed together — across Order 02's rolls the best portrait and the best body came
 * from different generations, and picking a plate meant giving one of them up. The rolls are
 * already paid for; the panels inside them are not tied to each other by anything except the
 * file they happen to sit in.
 *
 * So each panel is scored on its OWN terms, which are not the same terms:
 *
 *   panels 1 and 2   cosine against the customer's photographs — these are the face
 *   panel 3          silhouette proportions against their full-length photograph, because the
 *                    face is small here and the frame is what this panel exists to carry
 *
 * Then the winners are composited. Costs nothing: no generation, only arithmetic over rolls
 * that were already made.
 *
 * THE RISK, stated because it is real: the three panels come from different draws, so small
 * things can disagree between them — the fall of the hair, the exact grey of the shirt. They
 * share a prompt, references and lighting instructions, so the disagreement is small, but it
 * is not zero. Look at the result before approving it; that is what the contact sheet is for.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const slug = flag("athlete");
if (!slug) throw new Error("pass --athlete <slug>");
const PY = flag("python", ".venv-matte/bin/python");
const DIR = join("art-pipeline/out/athletes", slug);
const versions = join(DIR, "_versions");
const work = join(tmpdir(), `compose-${process.pid}`);
execFileSync("mkdir", ["-p", work]);

const intake = JSON.parse(readFileSync(join(DIR, "before/_intake.json"), "utf8"));
const anchors: string[] = intake.usable ?? [];
const bodyRefEntry: { path: string; bbox?: number[] } | undefined = intake.bodyRefs?.[0];
const bodyRef: string | undefined = bodyRefEntry?.path;

const plates = readdirSync(versions)
  .filter((f) => /^_identity-\d+\.png$/.test(f))
  .sort((a, b) => Number(a.match(/-(\d+)\./)![1]) - Number(b.match(/-(\d+)\./)![1]));
if (!plates.length) throw new Error(`no rolls in ${versions}`);

console.log(`compose  ${slug} — ${plates.length} rolls, ${anchors.length} anchor photographs\n`);

// Cut every roll into its three panels once.
const panels: { plate: string; idx: number; file: string }[] = [];
for (const p of plates) {
  const f = join(versions, p);
  const m = await sharp(f).metadata();
  const w = Math.floor(m.width! / 3);
  for (let i = 0; i < 3; i++) {
    const out = join(work, `${p.replace(".png", "")}-p${i}.png`);
    await sharp(f).extract({ left: w * i, top: 0, width: w, height: m.height! }).png().toFile(out);
    panels.push({ plate: p, idx: i, file: out });
  }
}

const run = (script: string, out: string, files: string[]) => {
  execFileSync(PY, [script, out, ...files], { stdio: "ignore" });
  return JSON.parse(readFileSync(out, "utf8"));
};
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (v: number[]) => { const n = Math.hypot(...v); return v.map((x) => x / n); };

// --- faces: panels 1 and 2 ------------------------------------------------------------------
const faceOut = join(work, "faces.json");
const facePanels = panels;
const probes = run("art-pipeline/lib/face.py", faceOut, [...anchors, ...facePanels.map((p) => p.file)]);
const anchorEmb = norm(
  probes.filter((e: any) => anchors.includes(e.path) && e.faces?.length)
    .map((e: any) => e.faces[0].embedding)
    .reduce((a: number[], v: number[]) => a.map((x, i) => x + v[i])),
);
const faceScore = new Map<string, number>();
const faceScore3 = new Map<string, number>();
for (const e of probes as any[]) {
  if (!e.faces?.length || anchors.includes(e.path)) continue;
  const v = dot(e.faces[0].embedding, anchorEmb);
  faceScore.set(e.path, v);
  faceScore3.set(e.path, v);
}

// --- body: panel 3 --------------------------------------------------------------------------
const bodyPanels = panels.filter((p) => p.idx === 2);
let bodyScore = new Map<string, number>();
if (bodyRef && existsSync(bodyRef)) {
  // CROP TO HER BEFORE PROFILING. The whole frame holds a toddler holding her hand and the
  // Photos app's own buttons; rembg masks every person it finds, so the silhouette becomes two
  // people and the proportions become nonsense — the first run scored the best body panel at
  // 14% deviation against a reference that was partly a child. The face box says where she is.
  const upright = join(work, "bodyref.png");
  const base = sharp(bodyRef).rotate();
  const bm = await base.metadata();
  const BW = bm.autoOrient?.width ?? bm.width ?? 0;
  const BH = bm.autoOrient?.height ?? bm.height ?? 0;
  const bb = bodyRefEntry?.bbox;
  if (bb) {
    const cx = (bb[0] + bb[2]) / 2;
    const half = (bb[2] - bb[0]) * 2.6;
    const left = Math.max(0, Math.round(cx - half));
    const right = Math.min(BW, Math.round(cx + half));
    // Trim the app chrome top and bottom: it is not part of anybody's silhouette.
    const top = Math.round(BH * 0.06);
    const height = Math.round(BH * 0.88);
    await base.extract({ left, top, width: right - left, height }).png().toFile(upright);
  } else {
    await base.png().toFile(upright);
  }
  const prof = run("art-pipeline/lib/body.py", join(work, "bodies.json"), [upright, ...bodyPanels.map((p) => p.file)]);
  const ref = (prof as any[]).find((e) => e.path === upright);
  if (ref && !ref.error) {
    // Hips are excluded on purpose — see the note in lib/body.py: on a reference with an arm
    // held out they measure the arm.
    const keys = ["shoulderOverHeight", "waistOverHeight"];
    for (const e of prof as any[]) {
      if (e.path === upright || e.error) continue;
      bodyScore.set(e.path, keys.reduce((s, k) => s + Math.abs(e[k] - ref[k]) / ref[k], 0) / keys.length);
    }
  }
}

/**
 * Rolls that were generated WITH the full-length reference attached. Their standing panel is
 * the only one that can carry what that photograph holds — the customer spotted a real tattoo
 * on the forearm in one of them, and a tattoo cannot arrive by chance.
 */
const bodyInformed = new Set(
  plates.filter((p) => {
    const side = join(versions, p.replace(".png", ".json"));
    if (!existsSync(side) || !bodyRef) return false;
    try { return (JSON.parse(readFileSync(side, "utf8")).refs ?? []).includes(bodyRef); } catch { return false; }
  }),
);

const pick = (idx: number) => {
  const set = panels.filter((p) => p.idx === idx);
  if (idx < 2) {
    return set.filter((p) => faceScore.has(p.file)).sort((a, b) => faceScore.get(b.file)! - faceScore.get(a.file)!)[0];
  }
  // THE STANDING PANEL STILL HAS A FACE IN IT. The first version ranked it on body proportions
  // alone and produced exactly what that asks for: a good silhouette wearing a poor likeness,
  // and no tattoo, because proportions cannot see one. So it is ranked on the FACE, among the
  // rolls that had the body photograph attached — the body evidence comes from being in that
  // group at all, and the face decides which of them.
  const pool = bodyInformed.size ? set.filter((p) => bodyInformed.has(p.plate)) : set;
  const scored = pool.filter((p) => faceScore3.has(p.file));
  if (!scored.length) return set.filter((p) => bodyScore.has(p.file)).sort((a, b) => bodyScore.get(a.file)! - bodyScore.get(b.file)!)[0];
  return scored.sort((a, b) => faceScore3.get(b.file)! - faceScore3.get(a.file)!)[0];
};

const chosen = [pick(0), pick(1), pick(2)];
const names = ["portretas", "trys ketvirčiai", "visas ūgis"];
for (let i = 0; i < 3; i++) {
  const c = chosen[i];
  if (!c) throw new Error(`no usable panel ${i + 1} in any roll`);
  const s = i < 2
    ? `veidas ${faceScore.get(c.file)!.toFixed(3)}`
    : `veidas ${faceScore3.get(c.file)?.toFixed(3) ?? "-"}` +
      (bodyScore.has(c.file) ? `  kūnas ${(bodyScore.get(c.file)! * 100).toFixed(1)}%` : "") +
      (bodyInformed.has(c.plate) ? "  su kūno referencija" : "");
  console.log(`  ${names[i].padEnd(16)} ${c.plate.padEnd(20)} ${s}`);
}

const metas = await Promise.all(chosen.map(async (c) => ({ c, m: await sharp(c.file).metadata() })));
const h = Math.min(...metas.map((x) => x.m.height!));
const parts = await Promise.all(metas.map(async (x) => ({
  buf: await sharp(x.c.file).resize({ height: h }).toBuffer(),
  w: Math.round(x.m.width! * h / x.m.height!),
})));
let x = 0;
const comp = parts.map((p) => { const c = { input: p.buf, top: 0, left: x }; x += p.w; return c; });
const faceAvg = ((faceScore.get(chosen[0].file) ?? 0) + (faceScore.get(chosen[1].file) ?? 0) + (faceScore3.get(chosen[2].file) ?? 0)) / 3;
const out = join(DIR, `_identity.COMPOSED-${faceAvg.toFixed(3)}.png`);
await sharp({ create: { width: x, height: h, channels: 3, background: "#808080" } }).composite(comp).png().toFile(out);
rmSync(work, { recursive: true, force: true });
console.log(`\n-> ${out}`);
console.log(`   Look at it before approving — the panels come from different rolls.`);
