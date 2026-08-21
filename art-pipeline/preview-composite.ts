#!/usr/bin/env tsx
/**
 * Drop a cutout onto a finish background — the end-to-end sanity check.
 *
 *   npx tsx art-pipeline/preview-composite.ts --athlete ice-hockey --finish stadium-night
 *   npx tsx art-pipeline/preview-composite.ts --athlete ice-hockey --pose hero --finish all
 *
 * This is NOT the poster. Figma owns layout, type and per-finish grading. This exists to
 * answer one question the two halves of the pipeline cannot answer separately: does a
 * cutout lit by the fixed neutral rig actually sit inside a finish, or does it read as a
 * sticker? If it reads as a sticker on the dark finishes, the fix is the rig in
 * prompts.ts (LIGHTING_RIG), not the layout.
 *
 * Output: out/_preview-<athlete>-<pose>-<finish>.png
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { athleteBySlug, ATHLETES } from "./athletes.js";
import { FINISHES, finishBySlug } from "./finishes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const a = athleteBySlug(flag("athlete", ATHLETES[0]?.slug ?? ""));
if (!a) throw new Error("pass --athlete");
const finishes = flag("finish", "all") === "all" ? FINISHES : [finishBySlug(flag("finish"))!];
const dir = join("art-pipeline/out/athletes", a.slug);
const poses = flag("pose")
  ? [flag("pose")]
  : readdirSync(dir).filter((f) => f.endsWith(".cutout.png")).map((f) => f.replace(".cutout.png", ""));

/** Where the athlete sits in frame. Feet near the bottom, head short of the top. */
const HEIGHT_FRACTION = 0.82;
const FEET_AT = 0.97;

for (const finish of finishes) {
  const bgPath = join("art-pipeline/out/backgrounds", finish.slug, `${a.sport}.png`);
  if (!existsSync(bgPath)) { console.log(`skip ${finish.slug}: no ${a.sport} background yet`); continue; }
  const bg = sharp(bgPath);
  const { width: BW = 0, height: BH = 0 } = await bg.metadata();

  for (const pose of poses) {
    const cut = join(dir, `${pose}.cutout.png`);
    if (!existsSync(cut)) continue;

    // Trim to the subject so scaling is driven by the athlete, not by empty margin.
    const trimmed = await sharp(cut).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
    const th = trimmed.info.height, tw = trimmed.info.width;
    const targetH = Math.round(BH * HEIGHT_FRACTION);
    const targetW = Math.round((tw / th) * targetH);
    const layer = await sharp(trimmed.data).resize(targetW, targetH).png().toBuffer();

    const top = Math.round(BH * FEET_AT) - targetH;
    const left = Math.round((BW - targetW) / 2);
    const out = `art-pipeline/out/_preview-${a.slug}-${pose}-${finish.slug}.png`;
    await bg
      .composite([{ input: layer, top: Math.max(0, top), left: Math.max(0, left) }])
      .png()
      .toFile(out);
    console.log(`  -> ${out}`);
  }
}
