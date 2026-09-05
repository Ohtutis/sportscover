#!/usr/bin/env tsx
/**
 * One-off: two clean-wall room backgrounds for the poster listing HERO.
 * The wall must be EMPTY — our poster object is composited on top in Figma.
 */
import { writeFileSync, existsSync } from "node:fs";
import { generateImage, loadEnv, imageModel } from "./lib/gemini.js";
loadEnv();

const OUT = "art-pipeline/out/etsy-shots";

const JOBS: { name: string; prompt: string }[] = [
  {
    name: "hero-bg-warm-clean",
    prompt:
      `A photograph of a teenage boy's bedroom in the evening: a wide EMPTY pale warm-grey wall ` +
      `filling most of the frame, lit warmly by a desk lamp from the right side, gentle light ` +
      `falloff so the left side of the wall is noticeably darker. Below the wall the edge of a made ` +
      `bed with a navy blanket, a basketball and a pair of sneakers on the wooden floor. ` +
      `THE WALL IS COMPLETELY EMPTY — no posters, no frames, no shelves, no decals, nothing on it. ` +
      `Interior photograph, phone camera look, soft natural depth of field. Square 1:1. ` +
      `No people. No text anywhere, no watermark, no logo.`,
  },
  {
    name: "hero-bg-dusk-window",
    prompt:
      `A photograph of a teenage athlete's bedroom at dusk: an EMPTY warm-beige wall taking up ` +
      `most of the frame, warm lamp glow from the right, and on the far right edge a window ` +
      `showing deep blue evening sky. A basketball and a sports duffel bag on the wooden floor ` +
      `by the bed. THE WALL IS COMPLETELY EMPTY — no posters, no frames, no shelves, nothing on it. ` +
      `Cozy cinematic mix of warm interior light and cool blue dusk, phone photograph, soft depth ` +
      `of field. Square 1:1. No people. No text anywhere, no watermark, no logo.`,
  },
  {
    name: "hero-bg-court-lowangle",
    prompt:
      `A cinematic photograph of an EMPTY indoor basketball court at night, camera low and close to ` +
      `the polished hardwood: warm amber wood grain and crisp painted boundary lines sweeping across ` +
      `the lower half of the frame, soft pools of overhead light reflecting on the varnish. ` +
      `THE LEFT THIRD OF THE FRAME FALLS INTO DEEP SHADOW, almost black. The far end of the gym is ` +
      `dark and out of focus. Moody, high contrast, warm amber against near-black. ` +
      `No people, no basketball, no hoop, no scoreboard. Square 1:1. ` +
      `No text anywhere, no numbers, no watermark, no logo.`,
  },
  {
    name: "hero-bg-hoop-haze",
    prompt:
      `A cinematic photograph inside a dark empty basketball arena: on the RIGHT SIDE of the frame a ` +
      `backboard and hoop with a white net, lit from above by hard spotlights cutting through thin ` +
      `atmospheric haze. THE LEFT HALF OF THE FRAME IS ALMOST COMPLETELY BLACK, empty darkness. ` +
      `Warm white light beams, dust in the air, deep shadows. No people, no crowd, no ball, ` +
      `no scoreboard. Square 1:1. No text anywhere, no numbers, no watermark, no logo.`,
  },
  {
    name: "hero-bg-gym-night",
    prompt:
      `A cinematic photograph of an empty high-school gymnasium at night seen from the sideline: ` +
      `wooden bleachers folded against the far wall, warm hardwood floor catching light from a few ` +
      `overhead lamps, most of the hall sinking into deep darkness. Shallow depth of field, the ` +
      `background softly out of focus. THE LEFT SIDE OF THE FRAME IS DARK AND EMPTY. ` +
      `Warm amber and deep charcoal only. No people, no ball, no banners. Square 1:1. ` +
      `No text anywhere, no numbers, no watermark, no logo.`,
  },
];

let total = 0;
for (const j of JOBS) {
  const out = `${OUT}/${j.name}.png`;
  if (existsSync(out)) { console.log(`skip     ${j.name} (exists)`); continue; }
  process.stdout.write(`gen      ${j.name} ... `);
  try {
    const r = await generateImage({ prompt: j.prompt, refs: [], aspectRatio: "1:1", retries: 1 });
    writeFileSync(out, r.image);
    writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ model: imageModel(), tokens: r.tokens, prompt: j.prompt, at: new Date().toISOString() }, null, 2));
    total += r.tokens;
    console.log(`ok (${r.tokens} tokens)`);
  } catch (e: any) {
    console.log(`FAILED: ${e.message?.slice(0, 140)}`);
  }
}
console.log(`\ntotal tokens this run: ${total}`);
