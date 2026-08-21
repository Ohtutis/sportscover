#!/usr/bin/env tsx
/**
 * Decide which way a frame faces, and mirror it if that is not the way it should face.
 *
 *   npx tsx art-pipeline/orient.ts --athlete soccer-age-10 --frame action3 --opposite-to action2
 *   npx tsx art-pipeline/orient.ts --athlete soccer-age-10 --frame action3 --face left
 *
 * WHY THIS IS NOT A PROMPT
 * Facing is geometry, and the whole pipeline has learned the same lesson from every other
 * angle: anything that must be exact cannot be left to text. The face comes from a plate, the
 * wardrobe from a plate, the badge from "apply it unchanged" — but the direction a body points
 * was still being requested in a sentence, buried among twenty others, competing with a pose
 * description that implies its own orientation. So it came back right sometimes. A lottery.
 *
 * Here it is arithmetic. insightface returns five landmarks; where the nose sits between the
 * two eyes says which way the head is turned, and `sharp().flop()` mirrors exactly if it is
 * turned the wrong way. No re-roll, no cost, no chance.
 *
 * ON MIRRORING AND THE CREST: a flip puts the badge on the wrong chest. It matters on the
 * hero, where the chest is square to camera and the crest is the clearest graphic in the
 * frame — so the hero is never flipped. On the two supports it is turned away, small, and
 * muted to 45% in the layout, which is why they are the frames this is for.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { athleteBySlug } from "./athletes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const PY = flag("python", ".venv-matte/bin/python");
const a = athleteBySlug(flag("athlete"));
if (!a) throw new Error("pass --athlete <slug>");
const dir = join("art-pipeline/out/athletes", a.slug);

interface Face { bbox: number[]; score: number; kps: number[][] }

/**
 * "left" | "right" | "square" from the landmarks.
 *
 * kps order is [left eye, right eye, nose, left mouth, right mouth] in IMAGE coordinates. On
 * a head turned to the viewer's right the nose sits right of the midpoint between the eyes;
 * turned left, it sits left of it. Normalised by the eye separation so it does not depend on
 * how big the face is in frame.
 */
function facingOf(path: string): { facing: string; offset: number } {
  const tmp = join(tmpdir(), `orient-${process.pid}.json`);
  try {
    execFileSync(PY, ["art-pipeline/lib/face.py", tmp, path], { stdio: "ignore" });
    const probe = JSON.parse(readFileSync(tmp, "utf8"))[0];
    const f: Face | undefined = probe?.faces?.[0];
    if (!f?.kps?.length) return { facing: "unknown", offset: 0 };
    const [le, re, nose] = f.kps;
    const mid = (le[0] + re[0]) / 2;
    const sep = Math.abs(re[0] - le[0]) || 1;
    const offset = (nose[0] - mid) / sep;
    // Below this the head is essentially square to the camera and either slot works.
    if (Math.abs(offset) < 0.12) return { facing: "square", offset };
    return { facing: offset > 0 ? "right" : "left", offset };
  } finally {
    rmSync(tmp, { force: true });
  }
}

const frame = flag("frame");
if (!frame) throw new Error("pass --frame <hero|action2|action3|back>");
const path = join(dir, `${frame}.png`);
if (!existsSync(path)) throw new Error(`no such frame: ${path}`);

const me = facingOf(path);
let want = flag("face");
const against = flag("opposite-to");
if (against) {
  const other = facingOf(join(dir, `${against}.png`));
  if (other.facing === "unknown") throw new Error(`could not read a face in ${against}`);
  want = other.facing === "left" ? "right" : other.facing === "right" ? "left" : "";
  console.log(`${against}  faces ${other.facing}  (nose offset ${other.offset.toFixed(2)})`);
}

console.log(`${frame}  faces ${me.facing}  (nose offset ${me.offset.toFixed(2)})`);

if (!want) { console.log("nothing to enforce — the reference frame is square to camera, either side works"); process.exit(0); }
if (me.facing === "unknown") { console.log("no face found — cannot decide, leaving it alone"); process.exit(0); }
if (me.facing === want || me.facing === "square") { console.log(`already correct (wanted ${want})`); process.exit(0); }

// Mirror. Exact, instant, free.
const buf = await sharp(path).flop().png().toBuffer();
const { writeFileSync, mkdirSync, copyFileSync, readdirSync } = await import("node:fs");
const vdir = join(dir, "_versions");
mkdirSync(vdir, { recursive: true });
const n = readdirSync(vdir).filter((f) => f.startsWith(`${frame}-`) && f.endsWith(".png")).length + 1;
copyFileSync(path, join(vdir, `${frame}-${n}-preflip.png`));
writeFileSync(path, buf);
console.log(`mirrored ${frame}: ${me.facing} -> ${want}   (previous kept as _versions/${frame}-${n}-preflip.png)`);
