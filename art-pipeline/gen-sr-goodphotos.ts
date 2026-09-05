#!/usr/bin/env tsx
/**
 * Four fresh "this is a good photo to send" examples for the Senior Night listing.
 *
 *   GDE_BUDGET_EUR=85 npx tsx art-pipeline/gen-sr-goodphotos.ts
 *
 * Slide 13 was showing the SAME four intake photos as slide 06, so the gallery said the
 * same thing twice. These are four different framings of the same athlete — the guidance
 * slide has to teach variety, which it cannot do with one repeated set.
 *
 * Identity plate goes in as the reference: it is still Tui, or the slide is a lie.
 * Before-photo rule (README): the imperfection belongs to the PHOTO, not to the life —
 * a parent sends their nicest snapshot, not a bad day.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateImage, loadEnv, MODEL } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";

loadEnv();
const OUT = "art-pipeline/out/etsy-shots/senior-night";
mkdirSync(OUT, { recursive: true });

const COMMON = [
  `The person in the attached image, photographed on a modern phone by a family member.`,
  `Keep his face EXACTLY: same bone structure, same skin tone, same hair. He is 18.`,
  `It looks like a real snapshot from a family camera roll — natural light, honest colour,`,
  `slight softness, no studio lighting, no retouching, no filter.`,
  `Square format, 1:1. No words, letters, numbers, logos or brand marks anywhere.`,
  `Nothing deformed: real hands with five separated fingers if hands are visible.`,
].join("\n");

const SHOTS: Record<string, string> = {
  "good-profile": [
    `A clean head-and-shoulders PROFILE: he is turned about three quarters toward the camera,`,
    `looking into the lens, smiling naturally. Indoors by a window in the late afternoon, plain`,
    `wall behind him, face evenly lit and completely unobstructed. He wears a plain crew-neck`,
    `t-shirt in a mid tone.`,
  ].join("\n"),
  "good-side": [
    `A SIDE-ON portrait: he stands in true profile to the camera, head level, looking ahead and`,
    `not at the lens, so the line of the nose, jaw and ear all read clearly. Outdoors on a school`,
    `path in soft overcast light, background thrown gently out of focus. Plain hoodie, hood down.`,
  ].join("\n"),
  "good-inkit": [
    `A FULL-BODY shot in the sports kit: he stands on the field in his American football uniform,`,
    `helmet held at his side in one hand, feet apart, head to feet all inside the frame with room`,
    `to spare. Late-afternoon sun, the field behind him. The kit is plain deep green and cream`,
    `with no writing and no marks of any kind.`,
  ].join("\n"),
  "good-halfbody": [
    `A HALF-BODY shot at home: he sits at the kitchen table after training, leaning on one arm,`,
    `laughing at something off camera, face fully visible. Warm indoor light, ordinary kitchen`,
    `behind him. He wears a plain zip hoodie.`,
  ].join("\n"),
};

const ref = await refFor("art-pipeline/out/athletes/football/_identity.png");
for (const [name, body] of Object.entries(SHOTS)) {
  const prompt = `${body}\n\n${COMMON}`;
  const out = join(OUT, `${name}.png`);
  const r = await generateImage({ prompt, refs: [ref], aspectRatio: "1:1", tag: `senior-night/${name}` });
  writeFileSync(out, r.image);
  console.log(`ok ${name} (${(r.image.length / 1024) | 0} KB)`);
}
