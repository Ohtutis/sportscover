#!/usr/bin/env tsx
/**
 * Cut the athlete out of the backdrop and grade the result.
 *
 *   npx tsx art-pipeline/cutout.ts --athlete ice-hockey
 *   npx tsx art-pipeline/cutout.ts --athlete ice-hockey --pose hero --force
 *
 * WHY THE CHECKS HERE ARE PIXEL MATH AND NOT THE VISION JUDGE
 * The background pipeline grades with a model because "does this read as ice hockey" has
 * no formula. Matting failures do: a cropped skate is a bounding box touching the frame
 * edge, a chopped-off stick is a second connected component, a grey fringe around the
 * hair is a measurable colour distance to the backdrop. Arithmetic answers those exactly,
 * for free, every time. Keep the judge for the pose and the face (check-athlete.ts).
 *
 * Writes <pose>.cutout.png (transparent) and <pose>.onblack.png — a preview on near-black,
 * because every finish this composites onto is dark and that is where a halo shows.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { ATHLETES, athleteBySlug, type Athlete } from "./athletes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const OUT = "art-pipeline/out/athletes";
const PY = flag("python", ".venv-matte/bin/python");
const MODEL = flag("model", "birefnet-general");
const force = has("force");

const who = flag("athlete");
const athletes: Athlete[] =
  !who || who === "all"
    ? ATHLETES
    : who.split(",").map((s) => {
        const a = athleteBySlug(s.trim());
        if (!a) throw new Error(`unknown athlete "${s.trim()}"`);
        return a;
      });
const onlyPose = flag("pose");

interface Report {
  pose: string;
  width: number;
  height: number;
  /** Share of the frame the athlete occupies. Too low = the model shot them small. */
  coverage: number;
  /** Distance from the subject's bounding box to each frame edge, in pixels. 0 = cropped. */
  margins: { top: number; right: number; bottom: number; left: number };
  /** Alpha islands >= 0.1% of the subject. More than one = something got detached. */
  islands: number;
  /** Share of the biggest island. Below ~0.97 means the matte is fragmented. */
  largestShare: number;
  /** Share of edge pixels that are partial alpha. ~0 = a hard stencil, hair will look cut. */
  softEdge: number;
  /** Mean colour distance from the backdrop of the pixels just inside the edge. Low = halo. */
  haloDistance: number;
  fails: string[];
}

/** Flood fill on a downscaled mask — enough to count detached limbs and stray blobs. */
function islands(mask: Uint8Array, w: number, h: number) {
  const seen = new Uint8Array(w * h);
  const sizes: number[] = [];
  const stack: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || seen[i]) continue;
    let size = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const p = stack.pop()!;
      size++;
      const x = p % w, y = (p / w) | 0;
      if (x > 0 && mask[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack.push(p - 1); }
      if (x < w - 1 && mask[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack.push(p + 1); }
      if (y > 0 && mask[p - w] && !seen[p - w]) { seen[p - w] = 1; stack.push(p - w); }
      if (y < h - 1 && mask[p + w] && !seen[p + w]) { seen[p + w] = 1; stack.push(p + w); }
    }
    sizes.push(size);
  }
  return sizes.sort((a, b) => b - a);
}

async function grade(cutPath: string, srcPath: string, pose: string): Promise<Report> {
  const img = sharp(cutPath);
  const { width: W = 0, height: H = 0 } = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  // Backdrop colour, sampled from the four corners of the ORIGINAL frame.
  const src = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const sch = src.info.channels;
  const corner = (x: number, y: number) => {
    const p = (y * src.info.width + x) * sch;
    return [src.data[p], src.data[p + 1], src.data[p + 2]];
  };
  const cs = [corner(4, 4), corner(src.info.width - 5, 4), corner(4, src.info.height - 5), corner(src.info.width - 5, src.info.height - 5)];
  const bg = [0, 1, 2].map((k) => cs.reduce((s, c) => s + c[k], 0) / cs.length);

  let opaque = 0, partial = 0;
  let minX = W, minY = H, maxX = -1, maxY = -1;
  const small = 240;
  const sx = Math.max(1, Math.round(W / small));
  const mw = Math.ceil(W / sx), mh = Math.ceil(H / sx);
  const mask = new Uint8Array(mw * mh);

  let haloSum = 0, haloN = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = (y * W + x) * ch;
      const a = data[p + 3];
      if (a > 8) {
        if (a > 250) opaque++; else partial++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        mask[((y / sx) | 0) * mw + ((x / sx) | 0)] = 1;
        // A pixel that is strongly but not fully opaque is on the edge — that is where a
        // backdrop-coloured fringe lives.
        if (a > 60 && a < 245) {
          const d = Math.hypot(data[p] - bg[0], data[p + 1] - bg[1], data[p + 2] - bg[2]);
          haloSum += d; haloN++;
        }
      }
    }
  }

  const total = opaque + partial;
  const sizes = islands(mask, mw, mh);
  const maskTotal = sizes.reduce((s, n) => s + n, 0) || 1;
  const significant = sizes.filter((n) => n / maskTotal >= 0.001).length;

  const r: Report = {
    pose,
    width: W,
    height: H,
    coverage: +(total / (W * H)).toFixed(4),
    margins: { top: minY, right: W - 1 - maxX, bottom: H - 1 - maxY, left: minX },
    islands: significant,
    largestShare: +((sizes[0] ?? 0) / maskTotal).toFixed(4),
    softEdge: +(partial / (total || 1)).toFixed(4),
    haloDistance: +(haloN ? haloSum / haloN : 0).toFixed(1),
    fails: [],
  };

  if (r.coverage < 0.08) r.fails.push(`coverage ${(r.coverage * 100).toFixed(1)}% — athlete rendered too small`);
  if (r.coverage > 0.8) r.fails.push(`coverage ${(r.coverage * 100).toFixed(1)}% — backdrop was not removed`);
  for (const [side, v] of Object.entries(r.margins)) {
    if (v <= 1) r.fails.push(`cropped at the ${side} edge`);
  }
  if (r.islands > 1) r.fails.push(`${r.islands} separate pieces — something detached from the body`);
  if (r.largestShare < 0.97) r.fails.push(`largest piece is only ${(r.largestShare * 100).toFixed(1)}% of the matte`);
  if (r.softEdge < 0.005) r.fails.push(`hard stencil edge (${(r.softEdge * 100).toFixed(2)}% soft) — hair will look cut out`);
  // Only meaningful when there IS a soft edge to measure. On a binarised matte haloN is 0,
  // which made haloDistance 0 and reported a "fringe" on an image that has no fringe at all
  // — two failures for one defect, and the second one pointing at the wrong thing.
  else if (r.haloDistance < 40) r.fails.push(`backdrop fringe on the edge (distance ${r.haloDistance})`);
  return r;
}

let any = false;
for (const a of athletes) {
  const dir = join(OUT, a.slug);
  if (!existsSync(dir)) { console.log(`skip ${a.slug}: nothing generated yet`); continue; }
  const poses = readdirSync(dir)
    .filter((f) => f.endsWith(".png") && !f.startsWith("_") && !f.includes(".cutout") && !f.includes(".onblack"))
    .map((f) => f.replace(/\.png$/, ""))
    .filter((p) => !onlyPose || p === onlyPose);

  const reports: Report[] = [];
  for (const pose of poses) {
    const src = join(dir, `${pose}.png`);
    const cut = join(dir, `${pose}.cutout.png`);
    if (force || !existsSync(cut)) {
      execFileSync(PY, ["art-pipeline/lib/matte.py", src, cut, MODEL], { stdio: "inherit" });
    }
    const r = await grade(cut, src, pose);
    reports.push(r);
    // Preview on near-black: every finish is dark, so this is where a halo announces itself.
    const meta = await sharp(cut).metadata();
    await sharp({ create: { width: meta.width!, height: meta.height!, channels: 3, background: "#0a0a0a" } })
      .composite([{ input: cut }])
      .png()
      .toFile(join(dir, `${pose}.onblack.png`));
    any = true;
    const verdict = r.fails.length ? `FAIL  ${r.fails.join("; ")}` : "ok";
    console.log(
      `  ${verdict === "ok" ? "ok  " : "FAIL"} ${a.slug}/${pose}  cover ${(r.coverage * 100).toFixed(1)}%  ` +
      `margins ${r.margins.top}/${r.margins.right}/${r.margins.bottom}/${r.margins.left}  ` +
      `pieces ${r.islands}  soft ${(r.softEdge * 100).toFixed(2)}%  halo ${r.haloDistance}` +
      (r.fails.length ? `\n         ${r.fails.join("\n         ")}` : ""),
    );
  }
  if (reports.length) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "_cutout-report.json"), JSON.stringify({ model: MODEL, reports }, null, 2));
  }
}
if (!any) console.log("nothing to cut out — run gen-athlete.ts --stage poses first");
