#!/usr/bin/env tsx
/**
 * The Senior Night celebration scene for the complete-set listing.
 *
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-scene.ts
 *
 * THE PEOPLE ARE OURS. Four identity plates go in as references and the prompt maps each
 * one to a position, because the whole product rests on "this is your athlete, not a
 * stock face" — a scene with invented seniors would advertise the opposite.
 *
 * Every card and every poster is generated as a BLANK MATTE PURE BLACK plate; the real
 * exports are warped in afterwards (README: the model draws card ART well and card TYPE
 * badly, and the card is the product).
 *
 * Card SIZE is a stated requirement, not a hope: a GDE card is 2.5 x 3.5 in and a finger
 * is about 0.8 in, so a real card in a real hand is roughly THREE FINGER-WIDTHS across.
 * The first take came back with plates the size of tablets.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateImage, loadEnv, MODEL } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";

loadEnv();
const OUT = "art-pipeline/out/etsy-shots/senior-night";
mkdirSync(OUT, { recursive: true });

const CAST = [
  { slug: "football", name: "Tui", note: "a broad, powerfully built Pacific Islander boy" },
  { slug: "cheerleading", name: "Amara", note: "a Black girl with braided hair" },
  { slug: "soccer", name: "Mateo", note: "a lean Latino boy" },
  { slug: "volleyball", name: "Jaslene", note: "a tall Filipina girl" },
];

const prompt = [
  ...CAST.map((c, i) => `Image ${i + 1} is ${c.name} — ${c.note}. Keep this face EXACTLY.`),
  ``,
  `Put these FOUR REAL PEOPLE together in one warm documentary photograph of SENIOR NIGHT at an`,
  `American high school, on the gym floor right after the ceremony.`,
  ``,
  `LEFT TO RIGHT they stand shoulder to shoulder: ${CAST.map((c, i) => `${c.name} (image ${i + 1})`).join(", ")}.`,
  `Each face must be the face from its reference image — same bone structure, same skin tone, same`,
  `hair. They are 18 years old, mid-celebration: laughing, arms around each other, genuinely happy.`,
  `They wear school letterman jackets and warm-ups over their kit, deep green and cream.`,
  ``,
  `EACH of the four holds up ONE TRADING CARD toward the camera at chest height, portrait.`,
  `SIZE IS CRITICAL: a trading card is 2.5 x 3.5 inches — about THREE FINGER-WIDTHS wide. It must`,
  `sit comfortably between the thumb and the fingertips of one hand, small like a playing card.`,
  `It is NOT a tablet, NOT a book, NOT a picture frame. If it is wider than the person's palm it`,
  `is wrong.`,
  `Every card is COMPLETELY BLANK MATTE PURE BLACK — no artwork, no writing, no logo, no glare,`,
  `no reflection, a flat black rectangle. The thumb rests ON the front face near a bottom corner`,
  `so it reads as held, the card is turned squarely to the lens, and all four of its corners are`,
  `visible and not cropped by the frame or by another person.`,
  ``,
  `BEHIND them, on the low stage, stand FOUR large framed posters on wooden easels, evenly spaced,`,
  `angled slightly toward the camera — one for each senior. Each poster is also COMPLETELY BLANK`,
  `MATTE PURE BLACK inside its frame: no artwork, no writing, flat black, no glass, no glare. They`,
  `are portrait, about 18 x 24 inches, all four corners of each fully visible, and they sit behind`,
  `the people without being hidden by them.`,
  ``,
  `The gym is dark for the ceremony: warm ivory-white spotlights from above, fine champagne-gold`,
  `confetti drifting and settled on the floor, a deep out-of-focus crowd in the stands glittering`,
  `with phone lights. Warm, emotional, premium — the last home game.`,
  ``,
  `Hard requirements:`,
  `- Square format, 1:1.`,
  `- The four held cards and the four poster plates are the ONLY black rectangles in the picture,`,
  `  and every one of them is perfectly flat matte black.`,
  `- No words, letters, numbers or logos anywhere in the picture.`,
  `- Clothing is mid-tone or light: nothing else in frame may be as dark as the plates.`,
  `- Real hands: five separated fingers, natural grip, nothing deformed.`,
  `- Photorealistic, sharp, natural skin, believable available light.`,
].join("\n");

const refs = [];
for (const c of CAST) refs.push(await refFor(`art-pipeline/out/athletes/${c.slug}/_identity.png`));

const out = join(OUT, "celebration-seniors.png");
const r = await generateImage({ prompt, refs, aspectRatio: "1:1", imageSize: "2K", tag: "senior-night/scene-seniors" });
writeFileSync(out, r.image);
writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ model: MODEL, generatedAt: new Date().toISOString(), cast: CAST.map(c => c.slug), prompt }, null, 2));
console.log(`ok ${out} (${(r.image.length / 1024) | 0} KB)`);
