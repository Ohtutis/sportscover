#!/usr/bin/env tsx
/**
 * One more portrait of an APPROVED face, at a named angle — so refine-face has a reference at
 * the angle a pose actually shows.
 *
 *   npx tsx art-pipeline/face-angle.ts --athlete <slug> --name profile-right \
 *       --angle "full profile, the nose pointing toward the RIGHT edge of the frame" --want-yaw 1.5
 *
 * WHY: the face sheet holds two angles, straight-on and three-quarter. refine-face copies
 * likeness only when the pose's angle matches a reference — hero (yaw 0.80) went 0.482 -> 0.685,
 * action2 in profile (yaw 1.54) went 0.391 -> 0.240 with the same portraits. What is not in a
 * picture gets invented; this puts the missing angle in a picture. The output is measured and
 * mirrored if the model turned the head the wrong way — a mirrored face is the same face.
 */
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { generateImage, loadEnv } from "./lib/gemini.js";
import { athleteBySlug } from "./athletes.js";
import { realismFor, LIGHTING_RIG, PLATE_BACKDROP, NOT_PLASTIC } from "./prompts.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const slug = flag("athlete"); const a = slug ? athleteBySlug(slug) : undefined; if (!a) throw new Error("pass --athlete");
const name = flag("name"); const angle = flag("angle"); if (!name || !angle) throw new Error("pass --name and --angle");
const wantYaw = Number(flag("want-yaw", "0"));
const PY = flag("python", ".venv-matte/bin/python");
const DIR = join("art-pipeline/out/athletes", slug);
const faces = [1, 2].map((i) => join(DIR, `_identity-face-${i}.png`)); if (!faces.every(existsSync)) throw new Error("need _identity-face-1/2.png");
const out = join(DIR, `_identity-face-${name}.png`);
loadEnv();
const refs = [];
for (const f of faces) refs.push({ data: await sharp(f).jpeg({ quality: 90 }).toBuffer(), mime: "image/jpeg" as const });
const prompt = [
  `Images 1 and 2 are two approved portraits of ONE specific person — straight on and three-quarter.`,
  ``,
  `Produce ONE more portrait of THAT SAME PERSON from the same shoot: head and shoulders, close,`,
  `against the same plain backdrop, in the same grey t-shirt, with the hair worn exactly as in`,
  `the two portraits — but with the head turned as follows: ${angle}.`,
  ``,
  `THIS IS THE SAME FACE SEEN FROM A NEW ANGLE, not a new face: the same bone structure, the`,
  `same nose, jaw, brow and ear, the same skin and its marks, the same expression at rest.`,
  `Lips together. Nothing idealised, nothing softened.`,
  ``, realismFor(a.ageYears), ``, LIGHTING_RIG, ``,
  `Hard requirements:`, `- ${PLATE_BACKDROP}`,
  `- ONE frame only, no panels, no gutter, no border, no text, no watermark.`, NOT_PLASTIC,
].join("\n");
const res = await generateImage({ prompt, refs, aspectRatio: "3:4", imageSize: "2K", retries: 30, tag: `${slug}/_identity-face-${name}` });
writeFileSync(out, res.image);
// measure the yaw the way intake does; mirror if the head went the other way
const tmp = join(tmpdir(), `fa-${process.pid}.json`);
execFileSync(PY, ["art-pipeline/lib/face.py", tmp, out], { stdio: "ignore" });
const det = (JSON.parse(readFileSync(tmp, "utf8"))[0]?.faces ?? [])[0];
const k = det?.kps ?? [];
let yaw = k.length >= 3 ? (k[2][0] - (k[0][0] + k[1][0]) / 2) / (Math.abs(k[1][0] - k[0][0]) / 2) : 0;
if (wantYaw && Math.sign(yaw) !== Math.sign(wantYaw) && Math.abs(yaw) > 0.2) {
  writeFileSync(out, await sharp(res.image).flop().png().toBuffer()); yaw = -yaw;
  console.log(`mirrored  the head turned the other way; flipped so yaw matches (${yaw.toFixed(2)})`);
}
writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ prompt, angle, yaw, generatedAt: new Date().toISOString() }, null, 1));
console.log(`ok       ${out}   yaw ${yaw.toFixed(2)} (wanted ${wantYaw})   ${res.tokens} tokens`);
