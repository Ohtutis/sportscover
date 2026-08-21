#!/usr/bin/env tsx
/**
 * PUT A FRAME NEXT TO THE PLATE IT MUST AGREE WITH, so the check is a LOOK and not a memory.
 *
 *   npm run art:diff -- --athlete cheerleading --frame back
 *   npm run art:diff -- --athlete cheerleading            # all four poses, one sheet each
 *
 * WHY THIS EXISTS. README §36 already said "diff the back frame against `_kit-back.png`, and
 * treat every printed mark as guilty until the plate shows it". It was written the same day
 * an invented number shipped on wrestling's back frame — and then the very next athlete's
 * back frame shipped an invented number too, because the rule was a good intention with no
 * mechanism behind it. I read the frame, remembered what the plate looked like, and my memory
 * was wrong. The customer caught both, one after the other: "the same mistake twice in a row —
 * you are checking it the wrong way."
 *
 * A rule that needs me to recall an image is not a check. This makes the comparison physical:
 * the frame and the plate land side by side in one picture, at the same height, and every mark
 * on the garment either has a twin on the right or does not exist.
 *
 * WHICH PLATE. A front pose is graded against `_kit.png`, the `back` pose against
 * `_kit-back.png` — a from-behind frame compared with the FRONT plate is how a mark that only
 * exists on the front (this kit's number, on the front of the right hip) gets waved through on
 * a surface that must be blank.
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { athleteBySlug } from "./athletes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const a = athleteBySlug(flag("athlete"));
if (!a) throw new Error("pass --athlete <slug>");

const dir = join("art-pipeline/out/athletes", a.slug);
const out = join(dir, "_diff");
const only = flag("frame");
const frames = (only ? [only] : ["hero", "action2", "action3", "back"]).filter((f) =>
  existsSync(join(dir, `${f}.png`)),
);
if (!frames.length) throw new Error(`no frames to diff in ${dir}`);
mkdirSync(out, { recursive: true });

const H = Number(flag("height", "1400"));

for (const frame of frames) {
  const plateName = frame === "back" ? "_kit-back" : "_kit";
  const platePath = join(dir, `${plateName}.png`);
  if (!existsSync(platePath)) {
    console.log(`skip ${frame}: ${platePath} does not exist`);
    continue;
  }
  const [left, right] = await Promise.all(
    [join(dir, `${frame}.png`), platePath].map((p) =>
      sharp(p).resize({ height: H }).toBuffer({ resolveWithObject: true }),
    ),
  );
  const gap = 24;
  const width = left.info.width + gap + right.info.width;
  const file = join(out, `${frame}-vs-${plateName}.png`);
  await sharp({ create: { width, height: H, channels: 3, background: "#000" } })
    .composite([
      { input: left.data, left: 0, top: 0 },
      { input: right.data, left: left.info.width + gap, top: 0 },
    ])
    .png()
    .toFile(file);
  console.log(`  ${frame.padEnd(8)} vs ${plateName.padEnd(9)} -> ${file}`);
}

console.log(
  `\nLook at each sheet and read the GARMENT, not the pose: every crest, number, band and\n` +
    `maker's mark on the left must have a twin on the right. A mark with no twin is invented,\n` +
    `whatever side of the body it is on — and a surface the plate shows blank must be blank.`,
);
