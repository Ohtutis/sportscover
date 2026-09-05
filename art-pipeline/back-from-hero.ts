#!/usr/bin/env tsx
/**
 * The from-behind frame derived from the approved HERO — owner's call, order 4164205493:
 * "nugara pagal hero". No back plate: the hero already carries the kit, the ponytail, the body
 * and the lighting, and it is a picture, so nothing here is decided again from words.
 *
 *   npx tsx art-pipeline/back-from-hero.ts --athlete <slug> --brief "<pose from behind>"
 */
import { existsSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { generateImage, loadEnv } from "./lib/gemini.js";
import { athleteBySlug } from "./athletes.js";
import { kitFor } from "./kits.js";
import { realismFor, LIGHTING_RIG, NOT_PLASTIC } from "./prompts.js";
const argv = process.argv.slice(2);
const flag = (n: string, d = "") => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const slug = flag("athlete"); const a = slug ? athleteBySlug(slug) : undefined; if (!a) throw new Error("--athlete");
const brief = flag("brief"); if (!brief) throw new Error("--brief");
const DIR = join("art-pipeline/out/athletes", slug);
const hero = join(DIR, "hero.png"), kitBack = join(DIR, "_kit-back.png"), out = join(DIR, "back.png");
if (!existsSync(hero)) throw new Error("hero.png missing");
loadEnv();
const refs = [{ data: await sharp(hero).resize({ width: 2048, withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer(), mime: "image/jpeg" as const }];
const hasKB = existsSync(kitBack);
if (hasKB) refs.push({ data: await sharp(kitBack).resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer(), mime: "image/jpeg" as const });
const prompt = [
  `Image 1 is a finished photograph of one specific athlete, from the front.${hasKB ? ` Image 2 is the BACK of the exact garment they wear, laid flat.` : ""}`,
  ``,
  `Photograph THAT SAME ATHLETE from directly BEHIND, in the same studio, same backdrop, same`,
  `lighting rig, same distance and lens, full body in frame.`,
  `POSE: ${brief}`,
  ``,
  `Everything about the person comes from image 1 and is unchanged: the body — its height,`,
  `shoulders, limbs and build — the skin tone, the hair colour, and the hair worn exactly as`,
  `there: the same high ponytail, the same band, the same loose strands. The kit is the same`,
  `garment as image 1${hasKB ? `, and its back is exactly image 2 — same cut, same seams, same trim, and NOTHING printed on it: no number, no name, no crest, no lettering` : ""}. Same socks, same shoes, same wristbands, same racket.`,
  `STRICTLY from behind: no part of the face is visible — not in profile, not over a shoulder.`,
  ``, realismFor(a.ageYears), ``, LIGHTING_RIG, ``,
  `Hard requirements: one frame, photographic, sharp, no text, no watermark. Same aspect ratio as image 1 (2:3 portrait).`, NOT_PLASTIC,
].join("\n");
const res = await generateImage({ prompt, refs, aspectRatio: "2:3", imageSize: "2K", retries: 30, tag: `${slug}/back` });
const v = join(DIR, "_versions"); mkdirSync(v, { recursive: true });
if (existsSync(out)) { const n = readdirSync(v).filter((f) => /^back-\d+\.png$/.test(f)).length + 1; copyFileSync(out, join(v, `back-${n}.png`)); }
writeFileSync(out, res.image); writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ prompt, refs: [hero, ...(hasKB ? [kitBack] : [])], tokens: res.tokens, generatedAt: new Date().toISOString() }, null, 1));
console.log(`ok       ${out}   ${res.tokens} tokens`);
