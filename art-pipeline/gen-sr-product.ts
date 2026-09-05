#!/usr/bin/env tsx
/**
 * Product shots for the Senior Night listing.
 *
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-product.ts
 *
 * Eight of the twenty slides were white cards with a grid on them, so the listing read as
 * one long slab. These are the four ways a keepsake is actually seen: framed on a wall,
 * lying on a desk, sleeved in a collector binder, standing in a rigid case on a shelf.
 *
 * Every scene is generated with BLANK MATTE BLACK plates and the real exports are warped in
 * by lib/plates_composite.py — same reason as card_in_hand.py: the model draws card ART
 * well and card TYPE badly, and the type is ours. So: nothing else in the frame may be as
 * dark as a plate, or the compositor's occlusion mask eats it.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateImage, loadEnv, MODEL } from "./lib/gemini.js";

loadEnv();
const OUT = "art-pipeline/out/etsy-shots/senior-night";
mkdirSync(OUT, { recursive: true });

const RULES = [
  ``,
  `Hard requirements:`,
  `- Square format, 1:1. Photorealistic, shot on a fast prime, believable available light.`,
  `- The plate(s) described above are the ONLY pure-black shapes in the picture: flat, matte,`,
  `  no glare, no reflection, no glass sheen, no artwork, no writing, no texture.`,
  `- Every corner of every plate is visible and inside the picture. Nothing crops or covers a`,
  `  corner. Plates are close to rectangular on the sensor, tilted no more than about 12 degrees.`,
  `- Nothing else in the frame is dark: no black furniture, no black clothing, no black shadow`,
  `  as deep as the plate, no black frame moulding. Mid-tone and light materials only.`,
  `- No words, letters, numbers, logos or brand marks anywhere in the picture.`,
  `- No people, no hands, no faces.`,
].join("\n");

const scenes: { slug: string; prompt: string }[] = [
  {
    slug: "poster-on-wall",
    // 08 · what it looks like once it is up on the wall — the thing they are really buying
    prompt: [
      `An interior photograph of a bright American teenager's bedroom wall, late afternoon, warm`,
      `low sun raking across it. A large portrait picture frame hangs squarely on the wall,`,
      `18 x 24 inches, in pale natural oak with a wide white mat inside it.`,
      ``,
      `THE PLATE: the area inside the mat is COMPLETELY BLANK MATTE PURE BLACK, a flat black`,
      `rectangle, taller than wide, all four corners visible, no glass, no glare.`,
      ``,
      `The wall is warm off-white plaster. Below and around it, softly out of focus: the corner`,
      `of a pale wooden dresser, a cream-painted door frame, a folded varsity jacket in cream and`,
      `gold, a single trophy, string lights not switched on. Homely and lived-in, not a showroom.`,
      `The frame fills a little over half the picture height and is shot almost straight on, from`,
      `slightly below, so the wall recedes gently to one side.`,
    ].join("\n") + RULES,
  },
  {
    slug: "card-on-desk",
    // 12 · the card at rest, at true size, next to things that give it scale
    prompt: [
      `A close-up overhead photograph of a warm oak desk in daylight, shot at a slight angle from`,
      `above, very shallow depth of field.`,
      ``,
      `THE PLATE: one trading card lies flat on the desk, 2.5 x 3.5 inches, portrait, COMPLETELY`,
      `BLANK MATTE PURE BLACK — a flat black rectangle with sharp corners, all four visible, tilted`,
      `only slightly, sharply in focus, filling roughly a third of the picture.`,
      ``,
      `SCALE — this is the whole point of the shot. A plain ballpoint pen lies on the desk beside`,
      `the card, parallel to its long edge. The pen is 5.5 inches long and the card's long edge is`,
      `3.5 inches, so THE PEN IS CLEARLY LONGER THAN THE CARD IS TALL, by about half again. A`,
      `stack of two US quarter coins sits near the bottom corner for the same reason. If the card`,
      `looks bigger than a postcard, it is wrong.`,
      ``,
      `Around it, out of focus: a scatter of champagne-gold confetti, a cream and gold varsity`,
      `letterman sleeve laid across the top corner of the frame, a warm brass desk lamp glow from`,
      `the left. Nothing overlaps the card.`,
    ].join("\n") + RULES,
  },
  {
    slug: "card-in-binder",
    // 15 · it is a collectible: it goes in the binder with the rest of the season
    prompt: [
      `A close-up photograph, straight down onto an open collector's card binder lying on a pale`,
      `linen surface, soft north-window daylight.`,
      ``,
      `The right-hand page is a nine-pocket clear plastic sleeve page over a WHITE page insert. All`,
      `pockets are EMPTY and read as clear plastic over white — except the centre pocket.`,
      ``,
      `THE PLATE: in the centre pocket sits one trading card, portrait, COMPLETELY BLANK MATTE PURE`,
      `BLACK, a flat black rectangle, all four corners visible, square to the camera, sharply in`,
      `focus. It is the only dark object in the picture.`,
      ``,
      `The binder itself is light grey fabric. The left page falls away out of focus. A little of`,
      `the linen surface and a soft shadow show at the edges. Calm, collected, archival.`,
    ].join("\n") + RULES,
  },
  {
    slug: "card-in-case",
    // 18 · the 1-of-1 argument, made by an object rather than by a sentence
    prompt: [
      `A tight close-up photograph of a shelf in a home, shot from card height with a long lens and`,
      `very shallow depth of field, warm evening lamplight from the right.`,
      ``,
      `A single trading card stands upright on the shelf inside a clear rigid acrylic display case`,
      `(a card stand), the acrylic catching one soft highlight along its left edge only.`,
      ``,
      `THE PLATE: the card inside the case is COMPLETELY BLANK MATTE PURE BLACK, portrait, a flat`,
      `black rectangle, all four corners visible, facing the camera almost square, tilted no more`,
      `than 10 degrees, razor sharp. No reflection or glare falls across its face.`,
      ``,
      `Behind it, thrown well out of focus: a small gold trophy, a folded cream jersey, the warm`,
      `edge of a lamp, pale wood shelving. The card occupies most of the frame height.`,
    ].join("\n") + RULES,
  },
  {
    slug: "phone-in-hand",
    // 18 · the wallpaper where it actually lives: in their pocket
    prompt: [
      `A close-up photograph of a teenager's hand holding a modern smartphone upright, filling`,
      `most of the frame, shot over their shoulder in a warm bedroom in the evening. String`,
      `lights and a warm desk lamp glow softly out of focus behind; the corner of a cream and`,
      `gold varsity jacket hangs on a chair in the blurred background.`,
      ``,
      `THE PLATE: the phone's entire screen is COMPLETELY BLANK MATTE PURE BLACK, edge to edge`,
      `— a flat black rectangle, all four corners visible inside the phone's thin silver frame,`,
      `no glare, no reflections, no icons. The phone is nearly square to the camera, tilted no`,
      `more than 8 degrees. The phone body is light silver, NOT black.`,
      ``,
      `One hand only, five separated fingers, natural relaxed grip from the side and bottom so`,
      `the screen stays unobstructed.`,
    ].join("\n") + RULES.replace("- No people, no hands, no faces.", "- One hand may appear; no faces."),
  },
  {
    slug: "desk-monitor",
    // 18 · the desktop wallpaper on a real desk
    prompt: [
      `An interior photograph of a bright teenager's study desk by a window, daylight. A modern`,
      `thin-bezel widescreen desktop monitor stands on the pale oak desk, seen almost straight`,
      `on, filling well over half the frame width.`,
      ``,
      `THE PLATE: the monitor's entire screen is COMPLETELY BLANK MATTE PURE BLACK edge to edge`,
      `— a flat black 16:9 rectangle, all four corners visible inside the thin silver bezel, no`,
      `glare, no reflections. The monitor stand and bezel are light silver, NOT black.`,
      ``,
      `On the desk around it, softly out of focus: a small gold trophy, a cream varsity sleeve`,
      `over the chair, a white keyboard, a mug. Warm, lived-in, tidy.`,
    ].join("\n") + RULES,
  },
];

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
for (const s of scenes.filter((x) => only.length === 0 || only.includes(x.slug))) {
  const out = join(OUT, `${s.slug}.png`);
  const r = await generateImage({ prompt: s.prompt, aspectRatio: "1:1", imageSize: "2K", tag: `senior-night/${s.slug}` });
  writeFileSync(out, r.image);
  writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ model: MODEL, generatedAt: new Date().toISOString(), prompt: s.prompt }, null, 2));
  console.log(`ok ${out} (${(r.image.length / 1024) | 0} KB)`);
}
