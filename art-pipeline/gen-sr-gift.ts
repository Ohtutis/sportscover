#!/usr/bin/env tsx
/**
 * The gift moment for the Senior Night listing.
 *
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-gift.ts
 *
 * A senior being handed the framed poster by family after the ceremony, with his card
 * in his other hand. The set is DIGITAL — the buyer prints it — so the scene shows a
 * print being given, never a parcel arriving.
 *
 * The frame and the card are generated BLANK MATTE BLACK and the real exports are warped
 * in by lib/plates_composite.py, for the reason in card_in_hand.py: the model draws card
 * art well and card TYPE badly, and the type is ours.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateImage, loadEnv, MODEL } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";

loadEnv();
const OUT = "art-pipeline/out/etsy-shots/senior-night";
mkdirSync(OUT, { recursive: true });

const prompt = [
  `The person in the attached image is Tui — a broad, powerfully built 18-year-old Pacific`,
  `Islander. Keep his face EXACTLY: same bone structure, same skin tone, same hair.`,
  ``,
  `A warm documentary photograph, taken in a school gym right after a SENIOR NIGHT ceremony.`,
  `Tui stands centre, still in his letterman jacket over his kit, laughing. His mother and`,
  `father stand with him, mid-hug — she is handing him a large FRAMED POSTER, holding it by the`,
  `frame with both hands, turned so the whole face of it points at the camera. He holds a`,
  `trading card in his free hand at chest height.`,
  ``,
  `THE FRAMED POSTER: a simple thin black wooden frame, portrait, about 18 x 24 inches. What is`,
  `inside the frame is COMPLETELY BLANK MATTE PURE BLACK — no artwork, no writing, no glass, no`,
  `glare, no reflection, a flat black rectangle with all four corners visible and none cropped`,
  `by the frame edge or by a hand.`,
  ``,
  `THE CARD: a real trading card, 2.5 x 3.5 inches — about THREE FINGER-WIDTHS wide, small`,
  `enough to sit between his thumb and fingertips. It is also COMPLETELY BLANK MATTE PURE BLACK,`,
  `turned squarely to the lens, all four corners visible, his thumb resting on the front face`,
  `near a bottom corner. It is NOT a tablet and NOT a picture frame.`,
  ``,
  `Behind them the gym is dark for the ceremony: warm ivory spotlights, champagne-gold confetti`,
  `settled on the floor, a soft out-of-focus crowd with phone lights. Emotional, proud, warm —`,
  `a family moment, not a product shot.`,
  ``,
  `Hard requirements:`,
  `- Square format, 1:1.`,
  `- The poster face and the card are the ONLY black rectangles in the picture, both perfectly`,
  `  flat matte black.`,
  `- No words, letters, numbers, logos or brand marks anywhere.`,
  `- Clothing is mid-tone or light: nothing else in frame may be as dark as the plates.`,
  `- Real hands: five separated fingers, natural grip, nothing deformed.`,
  `- Photorealistic, sharp, natural skin, believable available light.`,
].join("\n");

const ref = await refFor("art-pipeline/out/athletes/football/_identity.png");
const out = join(OUT, "gift-moment.png");
const r = await generateImage({ prompt, refs: [ref], aspectRatio: "1:1", imageSize: "2K", tag: "senior-night/gift" });
writeFileSync(out, r.image);
writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ model: MODEL, generatedAt: new Date().toISOString(), prompt }, null, 2));
console.log(`ok ${out} (${(r.image.length / 1024) | 0} KB)`);
