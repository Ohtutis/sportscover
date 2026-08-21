#!/usr/bin/env tsx
/**
 * Resolve one athlete's PRODUCTION SPEC and freeze it to disk.
 *
 *   npx tsx art-pipeline/resolve-spec.ts --athlete soccer-age-07
 *   npx tsx art-pipeline/resolve-spec.ts --athlete soccer-age-07 --force
 *
 * WHY THIS EXISTS
 * Until now the wardrobe decisions were made INSIDE an image generation: the model looked at
 * the customer's photos and picked a boot. That is a decision nobody can see, nobody can
 * correct, and — worst of all — one the model makes again from scratch on every run. Two
 * runs, two different boots, and the "consistent" set quietly becomes a random mix.
 *
 * So the decisions become DATA. This stage looks at the photographs once, records what it can
 * actually see per item, resolves each against the sport default, and writes `_spec.json`.
 * Everything downstream reads that file. Re-running does not re-decide; a human can open it
 * and correct a line; and two months later the same athlete still gets the same boots.
 *
 * THE RULE IT IMPLEMENTS, from the user:
 *   - clearly visible and the photos agree  -> use what they actually wear
 *   - not visible, unclear, or contradicted -> the sport default, never a guess
 *   - the LOGO is different: unclear, absent or mismatched -> OMIT it entirely. No default,
 *     no approximation. A guessed club mark is worse than a plain shirt.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ATHLETES, athleteBySlug, type Athlete } from "./athletes.js";
import { sportBySlug, type Sport } from "./sports.js";
import { crestBySlug } from "./crests.js";
import { kitFor, setConstants } from "./kits.js";
import { generateJson, loadEnv, JUDGE_MODEL } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";

loadEnv();

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);
const OUT = "art-pipeline/out/athletes";
const force = has("force");

/**
 * What gets resolved item by item.
 *
 * HAIR AND BUILD ARE IN THIS LIST, and neither is a wardrobe item — it is here because it drifts exactly
 * like one and nothing else catches it. The identity plate is built from all the photographs
 * at once and it quietly re-styled the hair: a straight fringe in the source became a
 * textured cut with a cowlick, every pose inherited that from the plate, and the numeric gate
 * stayed silent because ArcFace crops to the face and never sees hair at all. A parent looking
 * at the result sees it immediately. So the hair gets pinned from the photographs, like
 * everything else that must not move.
 */
const ITEMS = ["hair", "build", "shirt", "shorts", "socks", "footwear", "equipment"] as const;

interface Observation {
  item: string;
  /** "clear" = visible and the photos agree. Anything else falls back to the default. */
  visibility: "clear" | "partial" | "unclear" | "absent";
  /** Only meaningful when visibility is "clear". */
  description: string;
  /** Which photo it was read from, so a human can check the call. */
  seenIn: string;
}

interface SpecAnswer {
  observations: Observation[];
  /** Raised when the photographs plainly disagree with the colour on the order form. */
  colourConflict: { conflict: boolean; seenColour: string; note: string };
  crest: { visible: boolean; legible: boolean; note: string };
}

const SCHEMA = {
  type: "object",
  properties: {
    observations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string", enum: [...ITEMS] },
          visibility: { type: "string", enum: ["clear", "partial", "unclear", "absent"] },
          description: { type: "string" },
          seenIn: { type: "string" },
        },
        required: ["item", "visibility", "description", "seenIn"],
      },
    },
    // The two authorities can disagree, and when they do the pipeline must not pick a winner.
    colourConflict: {
      type: "object",
      properties: {
        conflict: { type: "boolean" },
        seenColour: { type: "string" },
        note: { type: "string" },
      },
      required: ["conflict", "seenColour", "note"],
    },
    crest: {
      type: "object",
      properties: {
        visible: { type: "boolean" },
        legible: { type: "boolean" },
        note: { type: "string" },
      },
      required: ["visible", "legible", "note"],
    },
  },
  required: ["observations", "colourConflict", "crest"],
};

/**
 * TWO THINGS THE PHOTOGRAPHS ARE NOT ALLOWED TO DECIDE.
 *
 * COLOUR comes from the order form. A child appears in a green match kit, a blue training
 * top and a grey hoodie across four photographs, and on the first run the resolver picked
 * the blue — correctly, by its own rule, because that was the largest and sharpest garment.
 * But the club's colour is a fact the customer typed in, not something to be inferred from
 * whichever photo happened to be closest. The photographs settle the CUT and the details;
 * the form settles the colour.
 *
 * MATCH KIT, NEVER TRAINING. Practice tops, bibs, warm-ups and school PE kit are not the
 * team strip, however clearly they are photographed.
 */
function prompt(sport: Sport, names: string[], a: Athlete): string {
  return [
    `These ${names.length} photographs are of one athlete: ${names.map((n, i) => `image ${i + 1} = ${n}`).join(", ")}.`,
    `They were taken on different days, so the athlete may be wearing different things in each.`,
    ``,
    `Your job is to report what is ACTUALLY VISIBLE, one item at a time. You are not designing`,
    `anything and you are not filling gaps — a confident answer about something you cannot`,
    `really see is the one failure that matters here.`,
    ``,
    `TWO CONSTRAINTS BEFORE YOU START, and they override what is easiest to see:`,
    `1. THE TEAM COLOUR IS ${a.colorName.toUpperCase()} (${a.primaryColor}). It comes from the`,
    `   order form and it is a fact, not a guess. A garment in any other colour is NOT this`,
    `   team's kit — it is training gear, school kit or everyday clothing. Describe the kit in`,
    `   the team colour, and if none of the photographs shows it clearly, say so rather than`,
    `   describing something else.`,
    `2. MATCH KIT ONLY. If the photographs show both a match strip and training gear —`,
    `   a practice top, a bib, a warm-up shirt — describe the MATCH strip, even when the`,
    `   training gear is bigger, sharper or in more of the frames.`,
    ``,
    `For each of: hair, build, shirt, shorts, socks, footwear, equipment (the ball or implement`,
    `of ${sport.name}) — report:`,
    `For BUILD describe the BODY as it actually is, factually and without flattering it: overall`,
    `height relative to their age, how heavy or light they are, the width of the shoulders`,
    `relative to the hips, how much muscle definition is visible in the arms and legs, whether`,
    `they are soft or lean through the middle. Be accurate rather than kind — a body reported`,
    `slimmer or heavier than it is becomes a picture of somebody else.`,
    `For HAIR describe the CUT and how it falls, not just the colour: length, whether there is`,
    `a fringe and whether it is straight or textured, where it parts, whether it lies flat or`,
    `sticks up. Hair is the thing a parent recognises first and it is the easiest to get subtly`,
    `wrong, so be specific.`,
    `- visibility:`,
    `    "clear"   = you can see it well AND the photographs that show it agree about it`,
    `    "partial" = visible but small, cropped, blurred, or only in one frame`,
    `    "unclear" = you can tell it is there but not what colour or design it is`,
    `    "absent"  = not in any photograph`,
    `  If two photographs show DIFFERENT versions of the same item — different boots, a`,
    `  different shirt — that is NOT "clear". Say "partial", pick the ONE that is largest and`,
    `  sharpest, and name it in seenIn.`,
    `  DESCRIBE ONLY THAT ONE. Do not mention the alternative, do not write "a different pair`,
    `  is worn in another photo", do not offer a choice. This description is handed straight to`,
    `  an image generator as an instruction, and a description naming two options puts the`,
    `  decision back in its hands — which is the exact thing this stage exists to prevent.`,
    `  One item, described as though it were the only one.`,
    `- description: what it actually looks like. Colour first, then CUT, then design details.`,
    `  For the shirt the cut MUST include the sleeve length and how the sleeves are worn —`,
    `  "long sleeves pushed up to the elbows" is a different shirt from "short sleeves", and`,
    `  leaving it out is how the same athlete ends up in two different shirts across a set.`,
    `  Also name the collar and any piping. One or two sentences.`,
    `  Leave this empty unless visibility is "clear" or "partial".`,
    `- seenIn: which image you are reading it from, or "none".`,
    ``,
    `Then, separately: does what you see CONTRADICT the stated team colour?`,
    `- conflict: true only when a real MATCH kit is clearly visible in a colour that is not`,
    `  ${a.colorName}. Training gear in another colour is not a conflict — that is normal.`,
    `- seenColour: the colour of that match kit, or "none".`,
    `- note: one sentence on what you saw.`,
    ``,
    `Then, separately, the club crest or badge on the shirt:`,
    `- visible: is there a badge on the shirt at all?`,
    `- legible: can you make out its actual shape and colours well enough that someone could`,
    `  reproduce it? Be strict. A green smudge on a green shirt is NOT legible.`,
    `- note: one sentence on what you can and cannot make out.`,
  ].join("\n");
}

const who = flag("athlete");
const athletes: Athlete[] =
  !who || who === "all" ? ATHLETES : who.split(",").map((s) => athleteBySlug(s.trim())!);

for (const a of athletes) {
  const sport = sportBySlug(a.sport)!;
  const dir = join(OUT, a.slug);
  const specPath = join(dir, "_spec.json");
  if (existsSync(specPath) && !force) {
    console.log(`locked   ${a.slug}: _spec.json already exists — it is the production truth.`);
    console.log(`         To change one decision, EDIT THE LINE in that file. Do not re-resolve.`);
    continue;
  }
  if (existsSync(specPath) && force) {
    // --force re-runs the judge, and the judge is not deterministic: on this athlete a second
    // resolve turned "black cleats with an orange pattern" into "grey or light-coloured
    // cleats", the kit plate rebuilt from it, and a decision the user had accepted was gone.
    // A frozen spec that gets re-frozen is not frozen. Correct a line by hand instead.
    console.log(`WARN     ${a.slug}: --force DISCARDS the frozen spec and asks the judge again.`);
    console.log(`         The judge is not deterministic — accepted decisions will change.`);
    console.log(`         To correct one item, edit that line in _spec.json instead.`);
  }

  const beforeDir = join(dir, "before");
  const photos = existsSync(beforeDir)
    ? readdirSync(beforeDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/^kit\./i.test(f)).sort()
    : [];

  let answer: SpecAnswer | null = null;
  if (photos.length) {
    const images = await Promise.all(photos.map((f) => refFor(join(beforeDir, f), 900)));
    answer = await generateJson<SpecAnswer>({ prompt: prompt(sport, photos, a), images, schema: SCHEMA });
  }

  // Resolve. "clear" wins; everything else falls back to the sport default, and the fallback
  // is recorded so the reason for every item is visible in the file.
  const defaults = `${kitFor(a)}\n${setConstants(a)}`;
  const resolved = ITEMS.map((item) => {
    const o = answer?.observations.find((x) => x.item === item);
    // "clear" is required to ADOPT an item. But a "partial" sighting still often settles the
    // cut — a sleeve length is readable long before a colour or a trim detail is — and
    // throwing that away is what put the athlete in long sleeves on the kit plate and short
    // sleeves in the poses. So partial evidence is kept as a note attached to the default.
    const useObserved = o?.visibility === "clear" && o.description.trim().length > 0;
    const partialNote = o?.visibility === "partial" && o.description.trim().length > 0 ? o.description.trim() : "";
    return {
      item,
      source: useObserved ? "photos" : "default",
      value: useObserved ? o!.description.trim() : "",
      partial: partialNote,
      why: !answer ? "no photographs supplied"
        : !o ? "the reviewer did not report this item"
        : useObserved ? `clearly visible in ${o.seenIn}`
        : `${o.visibility} in the photographs — falling back to the sport default`,
    };
  });

  // The crest is the one item with no fallback. Absent or illegible means OMIT.
  const declared = crestBySlug(a.crest);
  const crestUsable = Boolean(answer?.crest.visible && answer.crest.legible);
  const crest = {
    // The demo roster carries an in-house crest, which is ours and always usable. A real
    // order only has one if the customer uploaded it AND it reads.
    use: Boolean(declared) || crestUsable,
    slug: declared?.slug ?? null,
    fromPhotos: crestUsable,
    note: answer?.crest.note ?? "no photographs to read a badge from",
  };

  // A DISAGREEMENT IS ESCALATED, NOT RESOLVED.
  // The order form says one colour and every photograph shows a match kit in another. Either
  // could be right — an away strip, a mistyped field, a favourite colour entered instead of
  // the team's — and choosing wrongly means reprinting a poster. So the pipeline records the
  // conflict and stops being clever: a human asks the customer which it is.
  const conflict = answer?.colourConflict?.conflict
    ? { ...answer.colourConflict, formColour: a.colorName, resolvedBy: null as string | null }
    : null;
  if (conflict) {
    console.log(`  ASK      colour conflict: the form says ${a.colorName}, the photographs show ${conflict.seenColour}.`);
    console.log(`           ${conflict.note}`);
    console.log(`           Confirm with the customer, then set crest/colour by hand. Do NOT guess.`);
  }

  const spec = {
    athlete: a.slug,
    colourConflict: conflict,
    /**
     * WHICH PHOTOGRAPH THE FACE ANSWERS TO.
     *
     * The hero is the frame a customer returns to when they say "my child does not look like
     * that". So it does not just reference the identity plate — it references the one
     * photograph the family considers the best likeness, expression and all. Defaults to the
     * largest, sharpest face; EDIT THIS LINE when the parent picks a different one, which is
     * the sort of judgement no ranking should be making on their behalf.
     */
    bestPortrait: photos[0] ?? null,
    sport: sport.slug,
    generatedAt: new Date().toISOString(),
    judge: JUDGE_MODEL,
    source: { photos, formFields: { firstName: a.firstName, lastName: a.lastName, jerseyNumber: a.jerseyNumber, team: a.team, ageYears: a.ageYears, primaryColor: a.primaryColor, secondaryColor: a.secondaryColor } },
    resolved,
    crest,
    defaults,
  };
  writeFileSync(specPath, JSON.stringify(spec, null, 2));

  console.log(`spec     ${a.slug}  ->  ${specPath}`);
  for (const r of resolved) {
    console.log(`  ${r.source === "photos" ? "photo  " : "default"} ${r.item.padEnd(10)} ${r.value || "(sport default)"}   — ${r.why}`);
  }
  console.log(`  ${crest.use ? "crest  " : "OMITTED"} crest      ${crest.note}`);
}
