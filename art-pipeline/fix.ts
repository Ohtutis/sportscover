#!/usr/bin/env tsx
/**
 * CHANGE ONE THING IN A FINISHED FRAME, and change nothing else.
 *
 *   npm run art:fix -- --athlete football --frame _kit \
 *     --change "both cleats are high-top American football cleats whose collar rises above the ankle"
 *   npm run art:fix -- --athlete football --frame action3 --change "..." --dry-run
 *
 * WHY THIS EXISTS — the defect that cost the most, and it was a process defect, not a model one.
 *
 * Every other command in this pipeline GENERATES: it hands the model a set of references and a
 * description, and the model draws a new picture. That is right for a frame that does not exist
 * yet and catastrophic for one that does, because a generation is an independent roll of the
 * dice — everything not nailed to a reference image is decided again, differently.
 *
 * So a plate that was correct in every respect but the boots was re-rolled to fix the boots, and
 * it came back with the boots right, the club crest replaced by a real league mark, and the
 * jersey a different length. Fix one, break two. Three rounds of that and the good frame is
 * gone, and the only thing that saved it was that versions are kept.
 *
 * An EDIT is a different request: the finished frame is the reference, and the instruction is
 * "return this image, unchanged, except for X". The model has nothing to invent because the
 * answer to every other question is already in front of it. That is the same principle the rest
 * of the pipeline runs on — anything that must not drift is carried by an IMAGE — applied to
 * the one case where it was never applied: the frame being corrected is itself the anchor.
 *
 * WHEN TO USE WHICH
 *   `art:athlete --stage <s>`  the frame does not exist, or the DESIGN of it is wrong
 *   `art:fix --frame <f>`      the frame is right except for one item
 *   `art:revise` + re-run      the note is a standing decision that must survive future runs
 *
 * `art:revise` and this are not the same thing and the difference matters: a revision note
 * changes the PROMPT, so the next full generation still obeys it — but it is still a full
 * generation. This changes the PIXELS of one frame and nothing about the recipe. Anything that
 * must survive a rebuild belongs in `_spec.json` or in a revision note as well as here.
 *
 * Nothing is lost either way: the previous file is copied into `_versions/` first, exactly as
 * every other stage does, and `art:approve --version N` puts any of them back for free.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { athleteBySlug } from "./athletes.js";
import sharp from "sharp";
import { generateImage, imageModel, loadEnv } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";
import { NO_REAL_WORLD_MARKS } from "./prompts.js";

loadEnv();

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const OUT = "art-pipeline/out/athletes";
// The four "before" frames are editable too. They are generated for the demo roster, so a
// defect in one (a competition bow worn at home) is ours to correct — and correcting it by
// re-rolling would re-dice the FACE that the whole set is anchored on. For a real order these
// files are the customer's own photographs and are never touched.
const FRAMES = ["_kit", "_kit-back", "_identity", "_identity-face", "_identity-body", "_identity-back",
  "hero", "action2", "action3", "back",
  "before/photo1", "before/photo2", "before/photo3", "before/photo4"];

const slug = flag("athlete");
const a = slug ? athleteBySlug(slug) : undefined;
if (!a) throw new Error("pass --athlete <slug>");

const frame = flag("frame");
if (!FRAMES.includes(frame)) throw new Error(`--frame must be one of: ${FRAMES.join(", ")}`);

const change = flag("change");
if (!change) throw new Error('pass --change "<the one thing to change>"');

/**
 * A REFERENCE FOR THE CHANGE — "leave everything as it is, just make the sleeves look like
 * THIS". The customer asked for it in those words, and they were right: describing a garment
 * detail in prose is the failure this whole pipeline is built to avoid, and an edit is the
 * one place it had crept back in. The frame being corrected is image 1; this is image 2, and
 * it decides only what the named change looks like.
 */
const refPath = flag("ref");
if (refPath && !existsSync(refPath)) throw new Error(`--ref ${refPath} does not exist`);

const faceSheetPath = join(OUT, slug!, "_identity-face.png");
const pinFaceForPrompt = existsSync(faceSheetPath) && !frame.startsWith("_identity");

const dry = has("dry-run");
const size = flag("size", "2K");
const retries = Number(flag("retries", "30"));

const live = join(OUT, a.slug, `${frame}.png`);
if (!existsSync(live)) throw new Error(`${live} does not exist — generate the frame before fixing it`);

/**
 * THE EDIT INSTRUCTION, and every line of it is load-bearing.
 *
 * "Keep everything else the same" is not enough on its own: a model handed an image and a
 * change re-renders the whole frame and drifts everywhere it was not looking. What holds it
 * still is naming what "everything else" MEANS — position, scale, colour, lighting, the
 * background, the badge and where it sits — because each named thing is one fewer thing being
 * decided again. Same rule as the rest of the pipeline: a relative instruction does nothing,
 * a named object works.
 */
const prompt = [
  refPath
    ? `Image 1 is a finished photograph. Image 2 is a REFERENCE PHOTOGRAPH. Return image 1`
      + ` again with exactly ONE change, and take that change from image 2.`
    : `Image 1 is a finished photograph. Return THAT SAME PHOTOGRAPH again with exactly ONE change.`,
  ``,
  `THE ONE CHANGE: ${change}`,
  ...(refPath
    ? [
        ``,
        `IMAGE 2 DECIDES WHAT THAT CHANGE LOOKS LIKE, and nothing else about image 1. Copy from`,
        `it only the thing named above — its shape, its colour, its proportions and where it`,
        `sits — exactly as image 2 shows it. Do NOT copy image 2's lighting, background, angle,`,
        `framing, condition or any other item in it, and do not let it change anything in image`,
        `1 that the line above does not name.`,
      ]
    : []),
  ``,
  `EVERYTHING ELSE IS IDENTICAL — this is a correction to a finished picture, not a new`,
  `picture of the same subject. Unchanged, item for item:`,
  `- the same framing, the same crop, the same camera position and the same distance`,
  `- every item in exactly the same place, at exactly the same size and the same angle`,
  `- the same colours, the same fabric, the same materials, the same wear and condition`,
  `- the same lighting, the same shadows, the same background surface and its exact tone`,
  `- every badge, crest, number and marking identical: same artwork, same size, same position`,
  `- the same body, face, hair and pose if a person is in frame`,
  ``,
  `Do not redesign anything. Do not tidy anything up. Do not improve the composition, the`,
  `lighting or the styling. Do not add an item and do not remove one. If something is not`,
  `named in THE ONE CHANGE above, it comes back exactly as it is in image 1 — including`,
  `anything you would personally have drawn differently.`,
  ...(refPath
    ? [
        ``,
        // The first reference-driven edit came back with the corrected jersey AND a strip of
        // the reference photograph's rink floor along the bottom, in a taller canvas. An edit
        // is not a collage: say so, and pin the aspect ratio below as well, because a prompt
        // alone does not decide the canvas.
        `THE OUTPUT IS IMAGE 1 AND ONLY IMAGE 1 — the same picture, the same canvas, the same`,
        `edges. NO part of image 2 appears in it: not its background, not its floor or wall,`,
        `not its people, not a band or strip of it anywhere along any edge.`,
      ]
    : []),
  ...(pinFaceForPrompt
    ? [
        ``,
        `THE LAST IMAGE IS THE APPROVED FACE of the person in image 1 — two close portraits of`,
        `them, already signed off. Their face in the output is THAT face: the same features, the`,
        `same eye spacing, the same nose, the same mouth, the same hairline and the same`,
        `expression at rest, at whatever size and angle image 1 shows it. It is attached because`,
        `an edit re-renders the whole frame and a face drifts every time it is only described.`,
        `Nothing else about that image is used: not its framing, not its crop, not its lighting,`,
        `and it never appears in the output.`,
      ]
    : []),
  ``,
  NO_REAL_WORLD_MARKS,
  ``,
  `Same resolution and same aspect ratio as image 1. Photographic and sharp throughout.`,
].join("\n");

if (dry) {
  console.log(`--- ${a.slug}/${frame} (dry run)\n`);
  console.log(prompt);
  process.exit(0);
}

/** Same guard every other stage uses: the file being replaced is kept first. */
function keepPrevious(out: string) {
  const dir = join(dirname(out), "_versions");
  mkdirSync(dir, { recursive: true });
  const base = out.split("/").pop()!.replace(/\.png$/, "");
  const n = readdirSync(dir).filter((f) => new RegExp(`^${base}-\\d+\\.png$`).test(f)).length + 1;
  copyFileSync(out, join(dir, `${base}-${n}.png`));
  return n;
}

// The frame is the reference, so it goes in at the highest fidelity the request will carry.
// The default 1024 px `refFor` is sized for "show the model what a thing looks like"; an edit
// has to reproduce it, and detail the reference lost is detail the edit invents.
const ref = await refFor(live, 2048);
const changeRef = refPath ? await refFor(refPath, 1400) : null;

console.log(`model    ${imageModel()}  (size ${size})`);
console.log(`fixing   ${a.slug}/${frame}`);
console.log(`change   ${change}\n`);

/**
 * KEEP THE CANVAS. The frame being fixed already has the right shape — square for a plate,
 * 2:3 for a pose — and a request without an aspect ratio lets the model pick one, which it
 * duly did the first time a reference image was attached (it returned a taller frame with a
 * band of the reference's floor along the bottom). Read the shape off the file rather than
 * asking for it, so this is right for every frame without a flag.
 */
const meta = await sharp(live).metadata();
const ratio = (meta.width ?? 1) / (meta.height ?? 1);
const aspect = Math.abs(ratio - 1) < 0.05 ? "1:1"
  : Math.abs(ratio - 2 / 3) < 0.05 ? "2:3"
  : Math.abs(ratio - 3 / 4) < 0.05 ? "3:4"
  : Math.abs(ratio - 4 / 3) < 0.05 ? "4:3"
  : undefined;

// THE FACE IS PINNED ON EVERY EDIT, and it took three edits in a row to see why it must be.
//
// An edit re-renders the whole frame; "the same face" in the unchanged list is a sentence, and
// a sentence loses to a picture that is not there. Measured on Etsy order 4164205493, against
// the customer's own photographs, where nothing about the face was ever being changed:
//
//   body panel, proportions edit      0.597 -> 0.526
//   hero, wardrobe edit               0.587 -> 0.410
//
// The approved face sheet costs one attachment and turns "keep the face" into the same kind of
// instruction as everything else here: carried by an image. It is attached LAST so the change
// reference keeps the number the prompt already gives it.
const faceRef = pinFaceForPrompt ? await refFor(faceSheetPath, 1400) : null;
const refsOut = [ref, ...(changeRef ? [changeRef] : []), ...(faceRef ? [faceRef] : [])];
const res = await generateImage({ prompt, refs: refsOut, aspectRatio: aspect, imageSize: size, retries });
const kept = keepPrevious(live);
writeFileSync(live, res.image);
writeFileSync(
  live.replace(/\.png$/, ".json"),
  JSON.stringify({ model: imageModel(), size, tokens: res.tokens, fixedAt: new Date().toISOString(), change, from: `_versions/${frame}-${kept}.png`, prompt }, null, 2),
);

console.log(`ok       ${live}   (${res.tokens} tokens)`);
console.log(`previous kept as _versions/${frame}-${kept}.png`);
console.log(`\nLook at it. Then either:`);
console.log(`  npm run art:approve -- --athlete ${a.slug} --frame ${frame}                 # accept it`);
console.log(`  npm run art:approve -- --athlete ${a.slug} --frame ${frame} --version ${kept}   # put the old one back`);
