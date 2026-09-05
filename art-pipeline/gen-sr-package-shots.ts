#!/usr/bin/env tsx
/**
 * The four CHOOSE YOUR PACKAGE tiles for the Senior Night SET listing.
 *
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-package-shots.ts [--only sr-12]
 *
 * Same method as gen-package-shots.ts and for the same reason: the plate scenes
 * (pkg-digital / pkg-12 / pkg-24 / the supplier's hand-held pack) were generated ONCE with
 * blank black surfaces, and the finished artwork is handed to the model as PIXELS —
 * "print image 2 onto the object in image 1, change nothing else". The type arrives as an
 * image and is never described in words, so it comes back intact.
 *
 * Inputs live in art-pipeline/out/etsy-shots/senior-night/src/ (exported from the football
 * Senior Night page): poster.png, card-front.png, card-back.png, pack-front-panel.png.
 * The pack panel must be the COUNT-NEUTRAL export — the wrapper used to read "10 COLLECTIBLE
 * CARDS" and the pack holds 18.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { generateImage, loadEnv, type RefImage } from "./lib/gemini.js";

loadEnv();
// SR_SCENES_DIR: per-sport working dir (senior-night-<sport>)
const OUT = process.env.SR_SCENES_DIR ?? "art-pipeline/out/etsy-shots/senior-night";
const SRC = `${OUT}/src`;
const PLATES = "art-pipeline/out/etsy-shots/packages";
const only = (() => { const i = process.argv.indexOf("--only"); return i > 0 ? process.argv[i + 1] : undefined; })();
const png = (p: string): RefImage => ({ data: readFileSync(p), mime: "image/png" });

const EXACT =
  `Reproduce all artwork EXACTLY as given: same layout, same wording, same letters, same ` +
  `colours, nothing redrawn, nothing re-spelled, nothing added or removed. No text anywhere ` +
  `except what the artwork images already contain. Square 1:1.`;

const JOBS = [
  {
    name: "sr-digital",
    refs: () => [png(`${PLATES}/pkg-digital.png`), png(`${SRC}/poster.png`), png(`${SRC}/card-front.png`), png(`${SRC}/card-back.png`)],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same desk, same laptop, same phone, ` +
      `same light — and change ONE thing: fill the black rectangles with artwork. The LEFT black ` +
      `page on the laptop screen shows IMAGE 2 (a portrait poster). The RIGHT black page on the ` +
      `laptop screen shows IMAGE 3. The phone screen shows IMAGE 4. Keep the screen reflections ` +
      `and the room's light on the glass. ` + EXACT,
  },
  {
    name: "sr-12",
    refs: () => [png(`${PLATES}/pkg-12.png`), png(`${SRC}/card-front.png`), png(`${SRC}/card-back.png`)],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same fan of cards in the same ` +
      `positions, same table, same light, same shadows — and change ONE thing: PRINT the artwork ` +
      `onto the cards. The card at the near end of the fan, the one that is completely uncovered, ` +
      `carries the artwork from IMAGE 2. Every other card in the fan carries the artwork from ` +
      `IMAGE 3. Do not move, add or remove any card. ` + EXACT,
  },
  {
    name: "sr-24",
    refs: () => [png(`${PLATES}/pkg-24.png`), png(`${SRC}/card-front.png`), png(`${SRC}/card-back.png`)],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same two rows of cards in the same ` +
      `positions, same table, same light, same shadows — and change ONE thing: PRINT the artwork ` +
      `onto the cards. The two cards that lie completely uncovered carry the artwork from IMAGE 2 ` +
      `and IMAGE 3 respectively. Every other card carries the artwork from IMAGE 3. Do not move, ` +
      `add or remove any card. ` + EXACT,
  },
  {
    name: "sr-pack",
    refs: () => [png(`${PLATES}/supplier/qpmn-hand-pack.png`), png(`${SRC}/pack-front-panel.png`)],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same scale, same hand, same lighting, ` +
      `same background, same shadows — and change ONE thing: print the artwork from image 2 onto the ` +
      `product. It wraps the foil pouch the way a printed wrapper does, following the pillow bulge ` +
      `and the creases, with the foil's own sheen still catching the light over it. ` + EXACT,
  },
];

for (const job of JOBS) {
  if (only && job.name !== only) continue;
  const out = `${OUT}/${job.name}.png`;
  if (existsSync(out)) { console.log(`= ${job.name} — on disk, skipping`); continue; }
  const refs = job.refs();
  for (const r of refs) if (!r.data.length) throw new Error(`${job.name}: empty ref`);
  console.log(`> ${job.name} …`);
  const r = await generateImage({ prompt: job.prompt, refs, aspectRatio: "1:1", tag: `pkg-sr:${job.name}` });
  writeFileSync(out, r.image);
  writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ prompt: job.prompt, at: new Date().toISOString() }, null, 2));
  console.log(`ok ${out} (${(r.image.length / 1024) | 0} KB)`);
}
