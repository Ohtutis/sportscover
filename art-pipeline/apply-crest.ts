#!/usr/bin/env tsx
/**
 * Composite the REAL crest onto a generated kit plate.
 *
 *   npx tsx art-pipeline/apply-crest.ts --athlete soccer-age-10 --x 0.55 --y 0.17 --w 0.10
 *
 * WHY THIS EXISTS
 * An image model has no paste. Every pixel it returns is drawn, so a crest supplied as a
 * reference comes back REDRAWN — close, and never identical. On the ten-year-old's plate the
 * shield proportions, the crest feathers and the beak all differ from the source file, and no
 * amount of prompting fixes that: it is a property of generation, not a failure of wording.
 *
 * For an invented demo crest, close is fine. For a CUSTOMER'S REAL CLUB BADGE it is not — a
 * parent recognises their own club's mark instantly, and an approximation of a real school's
 * crest is both wrong and someone else's trademark redrawn by us.
 *
 * So the same rule the whole pipeline runs on, applied one step further: anything that must be
 * EXACT cannot be generated. The shirt is generated with a blank chest and the crest is
 * composited here — real file, real pixels.
 *
 * Flat lay only. The garment lies flat and square to the camera, so a straight resize-and-place
 * is correct; there is no fabric curvature to warp around. Poses are the harder case and are
 * left alone deliberately — see the note at the bottom.
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { athleteBySlug } from "./athletes.js";
import { crestBySlug } from "./crests.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const a = athleteBySlug(flag("athlete"));
if (!a) throw new Error("pass --athlete <slug>");
const crest = crestBySlug(a.crest);
if (!crest) throw new Error(`athlete ${a.slug} points at unknown crest "${a.crest}"`);

const plate = flag("plate", `art-pipeline/out/athletes/${a.slug}/_kit.png`);
const crestPng = `art-pipeline/out/crests/${crest.slug}.png`;
const out = flag("out", plate.replace(/\.png$/, "-crested.png"));
if (!existsSync(plate)) throw new Error(`no kit plate at ${plate}`);
if (!existsSync(crestPng)) throw new Error(`no crest at ${crestPng} — run --stage crest`);

/** Placement as fractions of the plate, so it is resolution-independent. */
const x = Number(flag("x", "0.55"));
const y = Number(flag("y", "0.17"));
const w = Number(flag("w", "0.10"));

const meta = await sharp(plate).metadata();
const W = meta.width!, H = meta.height!;
const target = Math.round(W * w);

// The crest ships on white. Drop the white to transparency so only the mark lands on the
// shirt, then multiply so the fabric's shading and folds still read through it.
const badge = await sharp(crestPng)
  .resize(target, target, { fit: "inside" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { data, info } = badge;
for (let i = 0; i < data.length; i += info.channels) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  if (r > 242 && g > 242 && b > 242) data[i + 3] = 0;
}
const cut = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels as 4 } })
  .png()
  .toBuffer();

mkdirSync(dirname(out), { recursive: true });
await sharp(plate)
  .composite([{
    input: cut,
    left: Math.round(W * x - info.width / 2),
    top: Math.round(H * y - info.height / 2),
    blend: "multiply",
  }])
  .png()
  .toFile(out);

console.log(`crest   ${crest.slug} -> ${out}`);
console.log(`        placed at ${(x * 100).toFixed(0)}% / ${(y * 100).toFixed(0)}%, ${target}px wide, multiplied onto the fabric`);
console.log(`        this is the real file, pixel for pixel — not a redrawn approximation`);

/*
 * POSES ARE NOT DONE HERE, and that is a decision rather than an omission.
 *
 * On a pose the chest is curved, turned and lit from one side, so a flat paste reads as a
 * sticker. Doing it properly needs a mesh warp fitted to the torso, which is a real piece of
 * work. Three ways out, in order of how much they cost:
 *
 *   1. Accept the generated approximation on poses. The crest is three fingers wide there and
 *      the supporting cutouts sit at 45% opacity. Fine for the demo roster; NOT fine for a
 *      customer's real club badge.
 *   2. Composite in Figma. The layouts already carry a `#team_logo` slot, the artwork is
 *      placed there as a real asset, and Figma can warp it. This is probably the answer.
 *   3. Warp here with a fitted mesh. Correct, and the most expensive.
 */
