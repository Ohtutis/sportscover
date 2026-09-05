#!/usr/bin/env tsx
/**
 * One-change edit of a generated SCENE (not an athlete frame — that is art:fix).
 *
 *   GDE_BUDGET_EUR=32 npx tsx art-pipeline/fix-scene.ts --in scene.png --out scene.png --change "the number on her jersey reads 5"
 *
 * README §29 applies to scenes too: a re-roll re-dices the faces, the hands, the plate and the
 * light; an edit hands the finished frame back and moves one thing. The plate rules are repeated
 * so the edit cannot "helpfully" print something on the blank plate.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { generateImage, loadEnv, type RefImage } from "./lib/gemini.js";
loadEnv();
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const inp = arg("--in")!, out = arg("--out") ?? inp, change = arg("--change")!;
if (!inp || !change) throw new Error("--in and --change are required");
const ref: RefImage = { data: readFileSync(inp), mime: "image/png" };
const prompt =
  `Take image 1 exactly as it is — same people, same faces, same expressions, same pose, same clothing, ` +
  `same framing, same light, same background — and change ONE thing: ${change}. ` +
  `Every other pixel stays as it is. Any flat matte pure-black rectangle in the picture stays completely ` +
  `blank black: no artwork, no writing, no glare. No words, letters or logos are added anywhere.`;
if (out === inp) { let i = 1; while (existsSync(inp.replace(/\.png$/, `.v${i}.png`))) i++; copyFileSync(inp, inp.replace(/\.png$/, `.v${i}.png`)); }
const r = await generateImage({ prompt, refs: [ref], aspectRatio: "1:1", imageSize: "2K", tag: `fix-scene:${change.slice(0, 30)}` });
writeFileSync(out, r.image);
writeFileSync(out.replace(/\.png$/, ".fix.json"), JSON.stringify({ change, prompt, at: new Date().toISOString() }, null, 2));
console.log(`ok ${out} (${(r.image.length / 1024) | 0} KB)`);
