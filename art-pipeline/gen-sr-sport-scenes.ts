#!/usr/bin/env tsx
/**
 * Scenes that make a per-sport Senior Night SET listing its own listing.
 *
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-sport-scenes.ts --only team-order
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-sport-scenes.ts --only gift-football
 *
 * TEAM ORDER is generated ONCE and reused by every sport: it is tubes, card stacks and a
 * shipping box — the shape of a booster-club order, not of a sport. Only the one poster lying
 * open in it is sport-specific, and that arrives as a warped plate, so a new sport costs a
 * composite and nothing else.
 *
 * The GIFT scene is per sport because senior night happens in that sport's venue: football is
 * handed over on the field under the lights, volleyball and cheer in the gym, soccer on the
 * pitch. Same plate discipline as gen-sr-gift.ts — the framed poster and the card are blank
 * matte black and the real exports are warped in afterwards.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { generateImage, loadEnv, MODEL } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";

loadEnv();
const OUT = process.env.SR_SCENES_DIR ?? "art-pipeline/out/etsy-shots/senior-night";
mkdirSync(OUT, { recursive: true });
const only = (() => { const i = process.argv.indexOf("--only"); return i > 0 ? process.argv[i + 1] : undefined; })();

const PLATE_RULES = [
  ``,
  `Hard requirements:`,
  `- Square format, 1:1. Photorealistic, believable available light.`,
  `- The plate(s) described above are the ONLY pure-black shapes in the picture: flat, matte, no`,
  `  glare, no reflection, no artwork, no writing, no texture.`,
  `- Every corner of every plate is visible and inside the picture; nothing crops or covers a corner.`,
  `- Corners are CUT SQUARE, never rounded.`,
  `- Nothing else in the frame is as dark as a plate.`,
  `- No words, letters, numbers, logos or brand marks anywhere.`,
].join("\n");

const JOBS: { slug: string; ref?: string; prompt: string; size?: "1K" | "2K" }[] = [
  {
    slug: "team-order",
    size: "2K",
    prompt: [
      `A photograph looking straight down at a pale oak table carrying A WHOLE TEAM'S ORDER, packed`,
      `and ready to hand over. Soft north-window daylight, honest and unstyled.`,
      ``,
      `A STACK OF SIX POSTERS lies in the left half of the frame, squared up and flat. Only the TOP`,
      `poster is face up; the five beneath it show as clean WHITE PAPER EDGES along two sides of the`,
      `stack, so it clearly reads as six sheets, not one. There is only ONE poster face showing in the`,
      `whole picture — every other poster is under it in the stack.`,
      ``,
      `THE PLATE: the face of the top poster is COMPLETELY BLANK MATTE PURE BLACK — a flat black`,
      `rectangle, taller than wide, every corner visible, nothing on top of it and nothing touching it.`,
      ``,
      `In the right half, ALL COMPLETELY INSIDE THE PICTURE with a margin of bare table around them:`,
      `SIX kraft-paper mailing tubes with white end caps in a neat row, SIX tidy stacks of trading`,
      `cards in two rows of three in front of them, and a plain kraft shipping box at the edge of`,
      `the frame. The card stacks are seen from above so only their top card shows, and every one of`,
      `those top cards is also blank matte pure black. It should read as a bulk order for a team:`,
      `many posters, many tubes, many cards, one box.`,
    ].join("\n") + PLATE_RULES,
  },
  {
    slug: "gift-football",
    ref: "art-pipeline/out/athletes/football/_identity.png",
    size: "2K",
    prompt: [
      `The person in the attached image is Tui — a broad, powerfully built 18-year-old Pacific`,
      `Islander. Keep his face EXACTLY: same bone structure, same skin tone, same hair.`,
      ``,
      `A warm documentary photograph taken ON AN AMERICAN HIGH-SCHOOL FOOTBALL FIELD at night, right`,
      `after a senior night ceremony: painted yard lines and hash marks underfoot, stadium floodlights`,
      `above, goalposts and a packed home stand thrown far out of focus behind. Tui stands centre in`,
      `his green football uniform with a letterman jacket over the shoulder pads, helmet under one arm,`,
      `laughing. His mother stands with him, handing him a large FRAMED POSTER, holding it by the frame`,
      `with both hands, turned so the whole face of it points at the camera.`,
      ``,
      `THE FRAMED POSTER: a simple thin pale-oak frame, portrait, about 18 x 24 inches. What is inside`,
      `the frame is COMPLETELY BLANK MATTE PURE BLACK — no artwork, no glass, no glare, a flat black`,
      `rectangle with all four corners visible and none cropped by the frame edge or by a hand.`,
      ``,
      `Champagne-gold confetti drifts in the floodlights. Emotional, proud, warm — a family moment on`,
      `the field, not a product shot.`,
      ``,
      `Real hands: five separated fingers, natural grip, nothing deformed.`,
    ].join("\n") + PLATE_RULES,
  },
  {
    slug: "gift-volleyball",
    ref: "art-pipeline/out/athletes/volleyball/_identity.png",
    size: "2K",
    prompt: [
      `The person in the attached image is Jaslene — a 17-year-old Filipina volleyball player, 5'10",`,
      `long-limbed with broad shoulders, black hair in a tight high ponytail, a round face with a small`,
      `mole below the right eye. Keep her face EXACTLY: same bone structure, same skin tone, same hair.`,
      ``,
      `A warm documentary photograph taken INSIDE AN AMERICAN HIGH-SCHOOL GYM right after a senior`,
      `night volleyball ceremony: polished hardwood court with painted lines underfoot, the net and its`,
      `posts a few steps behind, championship banners and a packed home bleacher thrown far out of`,
      `focus behind. Jaslene stands centre in her deep teal volleyball jersey with white trim, number`,
      `on the chest, a letterman jacket over her shoulders, laughing. Her mother stands with her,`,
      `handing her a large FRAMED POSTER, holding it by the frame with both hands, turned so the whole`,
      `face of it points at the camera.`,
      ``,
      `THE FRAMED POSTER: a simple thin pale-oak frame, portrait, about 18 x 24 inches. What is inside`,
      `the frame is COMPLETELY BLANK MATTE PURE BLACK — no artwork, no glass, no glare, a flat black`,
      `rectangle with all four corners visible and none cropped by the frame edge or by a hand.`,
      ``,
      `Champagne-gold confetti drifts in the gym lights. Emotional, proud, warm — a family moment on`,
      `the court, not a product shot.`,
      ``,
      `Real hands: five separated fingers, natural grip, nothing deformed.`,
    ].join("\n") + PLATE_RULES,
  },
  {
    slug: "gift-cheerleading",
    ref: "art-pipeline/out/athletes/cheerleading/_identity.png",
    size: "2K",
    prompt: [
      `The person in the attached image is Amara — a high-school senior cheerleader, 5'2", small and`,
      `strong through the shoulders, deep brown skin, black hair straightened into a high ponytail with`,
      `a big berry-coloured competition bow, a wide open smile with braces on the upper teeth. Keep her`,
      `face EXACTLY: same bone structure, same skin tone, same hair.`,
      ``,
      `A warm documentary photograph taken INSIDE AN AMERICAN HIGH-SCHOOL GYM right after a senior night`,
      `ceremony: polished hardwood court with painted lines underfoot, the basketball hoop and a packed`,
      `home bleacher thrown far out of focus behind, a run of championship banners high on the wall.`,
      `Amara stands centre in her berry and white cheer uniform (sleeveless shell top and pleated skirt),`,
      `a letterman jacket over her shoulders, laughing. Her mother stands with her, handing her a large`,
      `FRAMED POSTER, holding it by the frame with both hands, turned so the whole face of it points at`,
      `the camera.`,
      ``,
      `THE FRAMED POSTER: a simple thin pale-oak frame, portrait, about 18 x 24 inches. What is inside`,
      `the frame is COMPLETELY BLANK MATTE PURE BLACK — no artwork, no glass, no glare, a flat black`,
      `rectangle with all four corners visible and none cropped by the frame edge or by a hand.`,
      ``,
      `Champagne-gold confetti drifts in the gym lights. Emotional, proud, warm — a family moment on`,
      `the court, not a product shot.`,
      ``,
      `Real hands: five separated fingers, natural grip, nothing deformed.`,
    ].join("\n") + PLATE_RULES,
  },
  {
    slug: "gift-soccer",
    ref: "art-pipeline/out/athletes/soccer/_identity.png",
    size: "2K",
    prompt: [
      `The person in the attached image is Mateo — a high-school senior soccer player, 5'7", light and`,
      `springy, medium brown Mexican-American skin, thick black hair pushed back off the forehead, a`,
      `narrow face with thick dark eyebrows. Keep his face EXACTLY: same bone structure, same skin tone,`,
      `same hair.`,
      ``,
      `A warm documentary photograph taken ON AN AMERICAN HIGH-SCHOOL SOCCER PITCH at night, right after`,
      `a senior night ceremony: cut grass and a painted touchline underfoot, floodlights above, a goal`,
      `and a packed home stand thrown far out of focus behind. Mateo stands centre in his kelly green`,
      `soccer kit with white trim, the number 10 on the chest, a letterman jacket over his shoulders,`,
      `laughing. His mother stands with him, handing him a large FRAMED POSTER, holding it by the frame`,
      `with both hands, turned so the whole face of it points at the camera.`,
      ``,
      `THE FRAMED POSTER: a simple thin pale-oak frame, portrait, about 18 x 24 inches. What is inside`,
      `the frame is COMPLETELY BLANK MATTE PURE BLACK — no artwork, no glass, no glare, a flat black`,
      `rectangle with all four corners visible and none cropped by the frame edge or by a hand.`,
      ``,
      `Champagne-gold confetti drifts in the floodlights. Emotional, proud, warm — a family moment on`,
      `the pitch, not a product shot.`,
      ``,
      `Real hands: five separated fingers, natural grip, nothing deformed.`,
    ].join("\n") + PLATE_RULES,
  },
  {
    slug: "gift-baseball",
    ref: "art-pipeline/out/athletes/baseball/_identity.png",
    size: "2K",
    prompt: [
      `The person in the attached image is Casey — a high-school senior baseball player, 5'9", compact`,
      `and strong, fair skin heavily freckled across the nose, coppery red hair pushed up at the front by`,
      `his cap, a round face with a snub nose. Keep his face EXACTLY: same bone structure, same skin`,
      `tone, same hair.`,
      ``,
      `A warm documentary photograph taken ON AN AMERICAN HIGH-SCHOOL BASEBALL DIAMOND at night, right`,
      `after a senior night ceremony: the dirt of the infield and a chalk baseline underfoot, the`,
      `backstop and the dugout rail nearby, floodlights above, a packed home stand thrown far out of`,
      `focus behind. Casey stands centre in his burnt-orange baseball jersey with cream trim and the`,
      `number 7 on the chest, cap on, a letterman jacket over his shoulders, laughing. His mother stands`,
      `with him, handing him a large FRAMED POSTER, holding it by the frame with both hands, turned so`,
      `the whole face of it points at the camera.`,
      ``,
      `THE FRAMED POSTER: a simple thin pale-oak frame, portrait, about 18 x 24 inches. What is inside`,
      `the frame is COMPLETELY BLANK MATTE PURE BLACK — no artwork, no glass, no glare, a flat black`,
      `rectangle with all four corners visible and none cropped by the frame edge or by a hand.`,
      ``,
      `Champagne-gold confetti drifts in the floodlights. Emotional, proud, warm — a family moment on`,
      `the diamond, not a product shot.`,
      ``,
      `Real hands: five separated fingers, natural grip, nothing deformed.`,
    ].join("\n") + PLATE_RULES,
  },
];

for (const job of JOBS) {
  if (only && job.slug !== only) continue;
  const out = `${OUT}/${job.slug}.png`;
  if (existsSync(out)) { console.log(`= ${job.slug} — on disk`); continue; }
  const refs = job.ref ? [await refFor(job.ref)] : undefined;
  const r = await generateImage({ prompt: job.prompt, refs, aspectRatio: "1:1", imageSize: job.size ?? "2K", tag: `sr-scene/${job.slug}` });
  writeFileSync(out, r.image);
  writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ model: MODEL, prompt: job.prompt, at: new Date().toISOString() }, null, 2));
  console.log(`ok ${out} (${(r.image.length / 1024) | 0} KB)`);
}
