#!/usr/bin/env tsx
/**
 * Build the before/after sheet for one athlete, or the whole age ladder.
 *
 *   npx tsx art-pipeline/before-after.ts --athlete soccer-age-32
 *   npx tsx art-pipeline/before-after.ts --ladder
 *
 * WHAT IT IS FOR
 * The strongest section a site like this can have, because it is the only one that proves the
 * INPUT was ordinary — see README §24. Left: the four phone photos a parent would actually
 * send. Right: the four finished frames built from them. Nothing between them but the
 * pipeline.
 *
 * Reads from `out/approved/` when a frame has been approved and falls back to the working
 * directory otherwise, so a sheet can be made mid-review — but an unapproved frame is a
 * candidate, not a deliverable, and the caption says so.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { AGE_LADDER, athleteBySlug, type Athlete } from "./athletes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const WORK = "art-pipeline/out/athletes";
const APPROVED = "art-pipeline/out/approved";
const POSES = ["action3", "hero", "action2", "back"];

/** Approved wins; the working copy is the fallback. Returns null when neither exists. */
function frame(slug: string, name: string): string | null {
  const a = join(APPROVED, slug, `${name}.png`);
  if (existsSync(a)) return a;
  const w = join(WORK, slug, `${name}.png`);
  return existsSync(w) ? w : null;
}

const label = (text: string, w: number, h: number) =>
  Buffer.from(
    `<svg width="${w}" height="${h}"><text x="14" y="${h - 12}" font-family="-apple-system,Helvetica,sans-serif" ` +
      `font-size="${Math.round(h * 0.52)}" font-weight="600" fill="#fff">${text}</text></svg>`,
  );

async function sheet(a: Athlete, out: string) {
  const beforeDir = join(WORK, a.slug, "before");
  const before = existsSync(beforeDir)
    ? readdirSync(beforeDir).filter((f) => /^photo\d+\.png$/.test(f)).sort().map((f) => join(beforeDir, f))
    : [];
  const after = POSES.map((p) => frame(a.slug, p)).filter(Boolean) as string[];
  if (!before.length || !after.length) {
    console.log(`skip ${a.slug}: ${!before.length ? "no before photos" : "no finished frames"}`);
    return false;
  }

  const CELL = 300, BAR = 34, GAP = 22;
  const beforeH = Math.round(CELL * 4 / 3);   // phone photos are 3:4
  const afterH = Math.round(CELL * 3 / 2);    // poses are 2:3
  const rowH = Math.max(beforeH, afterH);
  const W = CELL * before.length + GAP + CELL * after.length;
  const H = BAR + rowH;

  const tiles = [
    ...(await Promise.all(before.map(async (p, i) => ({
      input: await sharp(p).resize(CELL, rowH, { fit: "cover" }).png().toBuffer(),
      left: i * CELL, top: BAR,
    })))),
    ...(await Promise.all(after.map(async (p, i) => ({
      input: await sharp(p).resize(CELL, rowH, { fit: "cover" }).png().toBuffer(),
      left: CELL * before.length + GAP + i * CELL, top: BAR,
    })))),
  ];

  const approved = POSES.every((p) => existsSync(join(APPROVED, a.slug, `${p}.png`)));
  await sharp({ create: { width: W, height: H, channels: 3, background: "#101010" } })
    .composite([
      ...tiles,
      { input: label(`BEFORE · ${before.length} phone photos`, CELL * before.length, BAR), left: 0, top: 0 },
      {
        input: label(
          `AFTER · ${a.firstName}, ${a.ageYears}${a.ladderLabel ? ` — ${a.ladderLabel}` : ""}${approved ? "" : "  (candidates, not yet approved)"}`,
          CELL * after.length, BAR,
        ),
        left: CELL * before.length + GAP, top: 0,
      },
    ])
    .png()
    .toFile(out);
  console.log(`  ${a.slug.padEnd(15)} -> ${out}${approved ? "" : "   [not yet approved]"}`);
  return true;
}

if (has("ladder")) {
  for (const a of AGE_LADDER) await sheet(a, `art-pipeline/out/_before-after-${a.slug}.png`);
} else {
  const a = athleteBySlug(flag("athlete"));
  if (!a) throw new Error("pass --athlete <slug> or --ladder");
  await sheet(a, flag("out", `art-pipeline/out/_before-after-${a.slug}.png`));
}
