#!/usr/bin/env tsx
/**
 * CHOOSE YOUR PACKAGE tiles for the three PRINTED tiers of the Senior Night SET.
 *
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-set-tiles.ts --stage scene   # 3 plate scenes
 *   .venv-matte/bin/python art-pipeline/lib/sr_set_tiles.py                   # poster warped in
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-set-tiles.ts --stage apply   # cards + pack printed
 *   .venv-matte/bin/python art-pipeline/lib/sr_set_tiles.py --finish          # poster pasted back, tiles
 *
 * A set tier is cards AND a poster (and, for Ultimate, the sealed pack) — a tile that shows only
 * a fan of cards sells the card listing, not the set. Every readable surface is generated as a
 * blank MATTE BLACK plate: the poster is warped in exactly (lib/plates_composite.py — its type is
 * ours and stays pixel-exact), then the cards and the pack front are printed by the same
 * "put image N onto the object, change nothing else" edit that made the card-listing tiles.
 * The poster region is pasted back from the warped scene after the edit, so the edit can never
 * redraw it.
 *
 * Two rules learned on the first pass: NOTHING may lie on the poster (a fan on its corner merges
 * into its plate and the fit has no edge to find), and the Ultimate tile is TWO edits, cards then
 * pack — one edit carrying both designs put the wrapper art on the card stacks.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { generateImage, loadEnv, type RefImage } from "./lib/gemini.js";

loadEnv();
// SET_TILES_DIR: the same recipe serves the Complete Set (basketball / Stadium Night) from another folder
const OUT = process.env.SET_TILES_DIR ?? "art-pipeline/out/etsy-shots/senior-night";
const SRC = `${OUT}/src`;
const stage = (() => { const i = process.argv.indexOf("--stage"); return i > 0 ? process.argv[i + 1] : "scene"; })();
const only = (() => { const i = process.argv.indexOf("--only"); return i > 0 ? process.argv[i + 1] : undefined; })();
const png = (p: string): RefImage => ({ data: readFileSync(p), mime: "image/png" });

const PLATE =
  `Every readable surface is a flat MATTE PURE BLACK rectangle — blank black stock, the deepest ` +
  `black in the picture, no sheen, no reflection, NOTHING printed on it: no picture, no text, no ` +
  `logo, no border. Corners are CUT SQUARE like paper from a guillotine, never rounded. Nothing ` +
  `else in the photograph may be as dark as the plates. `;
const SHOT =
  `Shot on a phone from directly above, perfectly perpendicular, natural window light, no studio ` +
  `lighting, no flash, no text overlay, no watermark, no logo anywhere, pale oak table. Square 1:1.`;

const SCENES = [
  {
    name: "set-printed",
    prompt:
      `A product photograph of a PRINTED KEEPSAKE SET laid out on a pale oak table. An 18 x 24 inch ` +
      `portrait poster lies FLAT and square to the camera filling the LEFT half of the frame, ` +
      `all four corners visible, NOTHING on top of it and nothing touching it. In the RIGHT half, on ` +
      `bare table and clearly separated from the poster by a strip of wood, a neat fan of TWELVE ` +
      `trading cards, each overlapping the next, with the card at the near end completely uncovered ` +
      `and flat, and below the fan a kraft-paper mailing tube with white end caps. ` + PLATE + SHOT,
  },
  {
    name: "set-deluxe",
    prompt:
      `A product photograph of a DELUXE KEEPSAKE SET laid out on a pale oak table. A large 24 x 36 ` +
      `inch portrait poster lies FLAT and square to the camera, filling the LEFT two thirds of ` +
      `the frame, all four corners visible, NOTHING on top of it and nothing touching it. In the RIGHT ` +
      `third, on bare table, clearly separated from the poster by a strip of wood, TWENTY-FOUR ` +
      `trading cards in three short overlapping rows, clearly many cards, with two cards lying ` +
      `completely uncovered at the near ends, and a kraft-paper mailing tube with white end caps ` +
      `below them. ` + PLATE + SHOT,
  },
  {
    name: "set-ultimate",
    prompt:
      `A product photograph of an ULTIMATE COLLECTOR SET laid out on a pale oak table. A large ` +
      `24 x 36 inch portrait poster lies FLAT and square to the camera, filling the LEFT two thirds, ` +
      `all four corners visible, NOTHING on top of it and nothing touching it. In the RIGHT third, on ` +
      `bare table and clearly separated from the poster by a strip of wood: TWENTY-FOUR trading cards ` +
      `in three short overlapping rows with two cards completely uncovered, and beside them a SEALED ` +
      `FOIL TRADING-CARD PACK 7 cm wide and 12.6 cm tall, crimped top and bottom, with a soft pillow ` +
      `bulge and fine creases catching the light; its whole front panel is one flat matte black ` +
      `rectangle, lying flat on the table. A kraft mailing tube lies below. It should look expensive ` +
      `and collectible. ` + PLATE + SHOT,
  },
];

const EXACT =
  `Reproduce all artwork EXACTLY as given: same layout, same wording, same letters, same colours, ` +
  `nothing redrawn, nothing re-spelled, nothing added or removed. The poster already carries its ` +
  `artwork — leave every pixel of it exactly as it is. No text anywhere except what the artwork ` +
  `images already contain. Square 1:1.`;

const CARDS_FAN =
  `Take image 1 exactly as it is — same camera, same crop, same poster, same fan of cards in the ` +
  `same positions, same tube, same table, same light — and change ONE thing: PRINT the artwork onto ` +
  `the black cards. The uncovered card at the near end of the fan carries IMAGE 2. Every other card ` +
  `carries IMAGE 3. Do not move, add or remove any card. ` + EXACT;
const CARDS_ROWS =
  `Take image 1 exactly as it is — same camera, same crop, same poster, same cards in the same ` +
  `positions, same sealed pack if there is one, same tube, same table, same light — and change ONE ` +
  `thing: PRINT the artwork onto the black CARDS only. The two completely uncovered cards carry ` +
  `IMAGE 2 and IMAGE 3 respectively. Every other card carries IMAGE 3. Do not move, add or remove ` +
  `any card. Do not touch the sealed pack. ` + EXACT;
const PACK_ONLY =
  `Take image 1 exactly as it is — same camera, same crop, same poster, same cards, same tube, same ` +
  `table, same light — and change ONE thing: print the artwork from IMAGE 2 onto the black front ` +
  `panel of the SEALED FOIL PACK, wrapping it over the pillow bulge and creases with the foil's ` +
  `sheen still catching the light. The cards and the poster already carry their artwork — leave ` +
  `every pixel of them exactly as it is. ` + EXACT;

const gen = async (prompt: string, refs: RefImage[], tag: string) =>
  (await generateImage({ prompt, refs, aspectRatio: "1:1", tag })).image;

for (const sc of SCENES) {
  if (only && sc.name !== only) continue;
  if (stage === "scene") {
    const out = `${OUT}/${sc.name}.png`;
    if (existsSync(out)) { console.log(`= ${sc.name} — on disk`); continue; }
    const r = await generateImage({ prompt: sc.prompt, aspectRatio: "1:1", imageSize: "2K", tag: `set-tile:${sc.name}` });
    writeFileSync(out, r.image);
    writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ prompt: sc.prompt, at: new Date().toISOString() }, null, 2));
    console.log(`ok ${out} (${(r.image.length / 1024) | 0} KB)`);
    continue;
  }
  const inp = `${OUT}/${sc.name}-poster.png`;          // the scene with the poster already warped in
  const out = `${OUT}/${sc.name}-real.png`;
  if (!existsSync(inp)) throw new Error(`${inp} missing — run lib/sr_set_tiles.py first`);
  if (existsSync(out)) { console.log(`= ${sc.name}-real — on disk`); continue; }
  const cards = [png(`${SRC}/card-front.png`), png(`${SRC}/card-back.png`)];
  if (sc.name === "set-printed") {
    writeFileSync(out, await gen(CARDS_FAN, [png(inp), ...cards], `set-tile:${sc.name}-real`));
  } else if (sc.name === "set-deluxe") {
    writeFileSync(out, await gen(CARDS_ROWS, [png(inp), ...cards], `set-tile:${sc.name}-real`));
  } else {
    const mid = `${OUT}/${sc.name}-cards.png`;
    if (!existsSync(mid)) writeFileSync(mid, await gen(CARDS_ROWS, [png(inp), ...cards], `set-tile:${sc.name}-cards`));
    writeFileSync(out, await gen(PACK_ONLY, [png(mid), png(`${SRC}/pack-front-panel.png`)], `set-tile:${sc.name}-pack`));
  }
  console.log(`ok ${out}`);
}
