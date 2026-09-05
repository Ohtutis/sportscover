#!/usr/bin/env tsx
/**
 * Refine the FACE of a finished pose against the approved face plate — at head-crop scale.
 *
 *   npx tsx art-pipeline/refine-face.ts --athlete <slug> --frame hero [--context 1.6] [--dry-run]
 *
 * WHY THIS EXISTS (Etsy order 4164205493, 2026-09-04)
 * Every whole-frame edit of a pose cost likeness — 0.587 -> 0.410, 0.597 -> 0.526 — and pinning
 * the face plate as an extra reference did not recover it. A full-body frame renders the face
 * at a few hundred pixels inside a 1696x2528 canvas, and an edit re-renders the whole canvas:
 * the face is one small thing among many, and it is re-invented each time.
 *
 * So the edit is done where the face is LARGE. The head is cut out as a square, sent beside
 * the two approved portraits, returned with only the face changed, and pasted back under a
 * feathered mask. Nothing outside the head is touched, and inside it the reference and the
 * target are the same scale for the first time.
 */
import { existsSync, mkdirSync, readdirSync, copyFileSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { generateImage, loadEnv } from "./lib/gemini.js";
import { athleteBySlug } from "./athletes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const has = (n: string) => argv.includes(`--${n}`);
const slug = flag("athlete"); if (!slug || !athleteBySlug(slug)) throw new Error("pass --athlete <slug>");
const frame = flag("frame", "hero");
const context = Number(flag("context", "1.6"));
const PY = flag("python", ".venv-matte/bin/python");
const DIR = join("art-pipeline/out/athletes", slug);
const live = join(DIR, `${frame}.png`);
const faces = [1, 2].map((i) => join(DIR, `_identity-face-${i}.png`));
if (!existsSync(live)) throw new Error(`${live} missing`);
if (!faces.every(existsSync)) throw new Error(`need ${faces.join(" and ")} — split the face sheet first`);
// (faces[] stays as the minimum; the pool below may hold more angles)

loadEnv();

// 1. where the face is
const tmp = join(tmpdir(), `rf-${process.pid}.json`);
execFileSync(PY, ["art-pipeline/lib/face.py", tmp, live], { stdio: "ignore" });
const det = JSON.parse(readFileSync(tmp, "utf8"))[0]?.faces ?? [];
if (!det.length) throw new Error("no face found in the frame");
// FRONTAL FACES ONLY. Measured on order 4164205493: a near-frontal hero went 0.482 -> 0.685,
// a three-quarter-turned action2 went 0.391 -> 0.240 (the plate's cheek moles came back as a
// cluster of dots on a profile) and a downcast action3 did not move. The portraits are
// straight-on and three-quarter; past that angle the edit maps skin, not likeness. Refuse
// rather than degrade — a refusal costs nothing, a bad edit costs a version and a roll.
// Same yaw as intake.ts yawOf(): where the nose sits between the eyes, scaled by half the eye
// distance. 0 is frontal, a true profile runs past 1. Calibrated on this order against the
// customer's photographs: hero 0.80 (0.482 -> 0.685, helped), action3 0.63 (0.341 -> 0.335,
// nothing — that face is turned DOWN, which yaw does not see), action2 1.54 (0.391 -> 0.240,
// hurt: the plate's cheek moles came back as a cluster of dots on a profile). So the gate is
// on yaw only, and a downcast face still needs the eye: measure after, keep the better take.
const big = det.sort((a: any, b: any) => (b.bbox[2]-b.bbox[0])*(b.bbox[3]-b.bbox[1]) - (a.bbox[2]-a.bbox[0])*(a.bbox[3]-a.bbox[1]))[0];
const k = big.kps ?? [];
const yaw = k.length >= 3 && Math.abs(k[1][0] - k[0][0]) > 2 ? Math.abs((k[2][0] - (k[0][0] + k[1][0]) / 2) / (Math.abs(k[1][0] - k[0][0]) / 2)) : 0;
// PICK THE REFERENCES BY ANGLE. Every `_identity-face-*.png` (the two sheet panels plus any
// angle portraits from face-angle.ts) is measured the same way; the two whose SIGNED yaw is
// nearest the pose's go in. The gate is now the distance to the nearest reference, not the
// absolute angle — a profile is fine if a profile portrait exists.
const signedYaw = k.length >= 3 && Math.abs(k[1][0] - k[0][0]) > 2 ? (k[2][0] - (k[0][0] + k[1][0]) / 2) / (Math.abs(k[1][0] - k[0][0]) / 2) : 0;
const yawOfFile = (f: string) => { const t = join(tmpdir(), `rfy-${process.pid}-${Math.random().toString(36).slice(2)}.json`); execFileSync(PY, ["art-pipeline/lib/face.py", t, f], { stdio: "ignore" }); const d = (JSON.parse(readFileSync(t, "utf8"))[0]?.faces ?? [])[0]; const kk = d?.kps ?? []; return kk.length >= 3 ? (kk[2][0] - (kk[0][0] + kk[1][0]) / 2) / (Math.abs(kk[1][0] - kk[0][0]) / 2) : 0; };
const pool = readdirSync(DIR).filter((f) => /^_identity-face-[^.]+\.png$/.test(f)).map((f) => join(DIR, f));
const override = flag("refs") ? flag("refs").split(",") : null;
const ranked = (override ?? pool).map((f) => ({ f, y: yawOfFile(f) })).sort((p, q) => Math.abs(p.y - signedYaw) - Math.abs(q.y - signedYaw));
const chosen = ranked.slice(0, 2);
const gap = Math.abs(chosen[0].y - signedYaw);
console.log(`angle    pose yaw ${signedYaw.toFixed(2)} — refs: ${chosen.map((c) => `${c.f.split("/").pop()} (${c.y.toFixed(2)})`).join(", ")}`);
const GAP_MAX = Number(flag("gap-max", "0.5"));
if (gap > GAP_MAX && !override) { console.log(`skip     nearest portrait is ${gap.toFixed(2)} away in yaw (> ${GAP_MAX}); make one with face-angle.ts first`); process.exit(0); }
const [x0, y0, x1, y1] = big.bbox as number[];
const meta = await sharp(live).metadata(); const W = meta.width!, H = meta.height!;
const fw = x1 - x0, fh = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
const half = Math.max(fw, fh) * context;
const left = Math.max(0, Math.round(cx - half)), top = Math.max(0, Math.round(cy - half));
const right = Math.min(W, Math.round(cx + half)), bottom = Math.min(H, Math.round(cy + half));
const cw = right - left, ch = bottom - top;
console.log(`face     ${Math.round(fw)}x${Math.round(fh)} px at (${Math.round(cx)},${Math.round(cy)}) — head crop ${cw}x${ch}`);

// 2. the crop, upscaled so the model works at portrait scale
const SEND = 1024;
const crop = await sharp(live).extract({ left, top, width: cw, height: ch }).resize(SEND, SEND, { kernel: "lanczos3" }).jpeg({ quality: 92 }).toBuffer();
const refs = [{ data: crop, mime: "image/jpeg" as const }];
for (const c of chosen) refs.push({ data: await sharp(c.f).jpeg({ quality: 90 }).toBuffer(), mime: "image/jpeg" as const });

const prompt = [
  `Image 1 is a close crop of a finished photograph: one person's head and shoulders, mid-action.`,
  `Images 2 and 3 are two approved portraits of THAT SAME PERSON, seen from angles close to image 1's.`,
  ``,
  `Return image 1 again with exactly ONE change: the FACE becomes the face in images 2 and 3.`,
  `Same bone structure, same proportions, same set and spacing of the eyes, same brows, same`,
  `nose, same mouth, same jaw, same skin and its marks. It is the same person, drawn properly.`,
  ``,
  `EVERYTHING ELSE IS IDENTICAL to image 1: the angle the head is turned, where the eyes look,`,
  `the expression's intensity, the hair and how it is tied, any headband or wristband, the`,
  `collar, the lighting direction and colour, the shadows, the background tone, the crop and`,
  `the canvas. Do not copy the portraits' framing, lighting, hairstyle or expression — only`,
  `who the face is. Photographic and sharp. Output is image 1 and only image 1, same square canvas.`,
].join("\n");

if (has("dry-run")) { console.log(prompt); process.exit(0); }

const res = await generateImage({ prompt, refs, aspectRatio: "1:1", imageSize: "2K", retries: 30, tag: `${slug}/${frame}:face` });

// 3. paste back under a feathered ellipse centred on the face
const back = await sharp(res.image).resize(cw, ch, { kernel: "lanczos3" }).png().toBuffer();
const rx = Math.round(cw * 0.42), ry = Math.round(ch * 0.46);
const svg = `<svg width="${cw}" height="${ch}"><defs><radialGradient id="g" cx="50%" cy="48%" r="50%"><stop offset="72%" stop-color="white" stop-opacity="1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><ellipse cx="${cw/2}" cy="${ch*0.48}" rx="${rx}" ry="${ry}" fill="url(#g)"/></svg>`;
const mask = await sharp(Buffer.from(svg)).png().toBuffer();
const patch = await sharp(back).joinChannel(await sharp(mask).extractChannel(0).toBuffer()).png().toBuffer();

// keep the previous take, then write
const vdir = join(DIR, "_versions"); mkdirSync(vdir, { recursive: true });
const n = readdirSync(vdir).filter((f) => new RegExp(`^${frame}-\\d+\\.png$`).test(f)).length + 1;
copyFileSync(live, join(vdir, `${frame}-${n}.png`));
const out = await sharp(live).composite([{ input: patch, left, top }]).png().toBuffer();
writeFileSync(live, out);
writeFileSync(join(DIR, `_${frame}-face-crop-before.png`), await sharp(live).extract({ left, top, width: cw, height: ch }).png().toBuffer());
console.log(`ok       ${live}   (${res.tokens} tokens)   previous kept as _versions/${frame}-${n}.png`);
