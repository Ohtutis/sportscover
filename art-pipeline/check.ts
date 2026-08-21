// Automated QA for generated art.
//
// The generator is not reliable enough to trust cell by cell: the same prompt can
// keep the set and lose the floor rule, or nail the floor and shrink the prop to
// nothing. So every image is graded by a vision model against the SAME rules the
// prompt was built from, and anything that fails is re-rolled. This is what makes
// a 102-cell matrix runnable without eyeballing all 102.

import type { Finish } from "./finishes.js";
import type { Sport } from "./sports.js";
import { generateJson } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";
import { referenceFor, hasPlate } from "./refs.js";

export interface Check { id: string; pass: boolean; note: string }
export interface Verdict {
  verdict: "pass" | "fail";
  checks: Check[];
  worstIssue: string;
  observations?: { floor: string; foreignMarkings: string; prop: string };
}

/**
 * Every id the rubric asks for. `checks.every(pass)` is vacuously true on an empty or
 * partial array, so a judge that answered with three checks scored a clean pass on a
 * ten-check rubric. Any id missing from the answer is now itself a failure.
 */
export const CHECK_IDS = [
  "no_people",
  "no_text",
  "set_matches_reference",
  "venue_correct",
  "surface_rule",
  "sport_readable",
  "prop_scale",
  "prop_grounded",
  "prop_placement",
  "layout_correct",
  "court_correct",
  "centre_clear",
  "render_quality",
] as const;

const SCHEMA = {
  type: "object",
  properties: {
    // Forced to look before judging. Without this the judge answered "pass" to
    // everything — it passed four frames the user called completely wrong.
    observations: {
      type: "object",
      properties: {
        floor: { type: "string" },
        // Enumerated separately because a summary answer hides mixtures: the judge read
        // the real lane curves on the track frame, answered "running track", and never
        // mentioned the basketball key still printed across the same floor.
        foreignMarkings: { type: "string" },
        prop: { type: "string" },
      },
      required: ["floor", "foreignMarkings", "prop"],
    },
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", enum: [...CHECK_IDS] },
          pass: { type: "boolean" },
          note: { type: "string" },
        },
        required: ["id", "pass", "note"],
      },
    },
    worstIssue: { type: "string" },
  },
  required: ["observations", "checks", "worstIssue"],
};


/** The rubric. Ids must stay stable — they are what the re-roll hint keys off. */
function rubric(finish: Finish, sport: Sport, plate: boolean): string {
  // Must branch exactly as backgroundPrompt does — on the finish OR the sport. Golf and
  // swimming carry needsRealSurface (a mirror floor cannot be a pool or a putting green),
  // so grading them by the studio rule failed an approved pool frame for "replacing the
  // studio floor with water" — the one thing its prompt had asked for.
  const realSurface = finish.keepsRealSurface || sport.needsRealSurface === true;
  // Mirrors backgroundPrompt's outdoorStudio branch exactly.
  const outdoorStudio =
    Boolean(finish.venueBased) && sport.venue !== "indoor" && !realSurface;
  // finish.materialNote REPLACES sport.material in the prompt (Heritage renders every
  // surface in its mid-century form), so grading against sport.material failed a correct
  // vintage wooden tennis court for "not being a blue hard court" — the exact modern
  // surface its prompt forbade.
  const surfaceRule = outdoorStudio
    ? `surface_rule — this sport is played OUTDOORS, so the ground is correctly the real ` +
      `outdoor playing surface (turf, dirt, track), NOT this finish's indoor floor. Do NOT ` +
      `fail it for showing grass, dirt or track instead of a studio or arena floor — that is ` +
      `what its prompt asked for. Fail only if the surface is bright and daylight-coloured ` +
      `instead of graded dark into the finish` +
      (finish.materialNote ? `, per this rule: ${finish.materialNote}` : ``) + `.`
    : realSurface
    ? (finish.materialNote
        ? `surface_rule — the ground shows the surface ${sport.name} is played on, rendered ` +
          `to this finish's rule: ${finish.materialNote}. Judge it against THAT, never ` +
          `against the sport's modern-day surface — a wooden floor or a cinder track here is ` +
          `CORRECT, not a defect.`
        : `surface_rule — the ground shows ${sport.material},`) +
      ` at life scale (markings run out past the frame edges, NOT a miniature of the whole ` +
      `field seen end to end).` +
      (finish.keepsRealSurface
        ? ``
        : ` This sport is a deliberate exception: it is allowed to replace the studio floor` +
          ` with its real surface, graded dark and colour-matched to the set. Do NOT fail it` +
          ` for that — only fail if the surface is bright, daylight-lit or pasted in.`)
    : `surface_rule — the floor is STILL ${finish.floor}, as dark as image 1. The sport ` +
      `markings are only faint etched/inlaid lines in it. FAIL if a real playing surface ` +
      `was laid on top (white ice, green grass, brown dirt, any natural surface colour), ` +
      `or if the whole field is visible end to end like a scale model.`;

  return [
    plate
      ? `Image 1 is the EMPTY SET PLATE for the "${finish.name}" finish: the approved set `
        + `with a completely bare, unmarked floor. It is the set only — it deliberately `
        + `contains NO sport markings and NO equipment, and it is not a basketball court.`
      : `Image 1 is the approved reference for the "${finish.name}" finish.`,
    `Image 2 is a newly generated background for ${sport.name} in that same finish.`,
    `It will be used as a poster background with an athlete cutout composited over the`,
    `centre, so judge it as a background, not as a standalone picture.`,
    ``,
    `FIRST, in "observations", describe literally what you see in image 2 — do not judge yet:`,
    `- floor: what markings are actually drawn on the floor? Name the sport they belong to.`,
    `  If they are a basketball key, three-point arc and centre circle, say basketball, even`,
    `  though this image is supposed to be ${sport.name}.`,
    `- foreignMarkings: list EVERY marking on the floor that does not belong to`,
    `  ${sport.name} — a basketball key, a three-point arc, a centre circle, lines that`,
    `  merely echo the set's own hexagons. Look at the whole floor, top to bottom, not just`,
    `  the part that supports your first answer. Write "none" only if there are truly none.`,
    `- prop: what equipment is present, where it sits in the frame, and how big it is`,
    `  relative to the frame. If you cannot find any ${sport.name} equipment, say so.`,
    ``,
    `THEN grade each check, using your own observations as the evidence.`,
    ``,
    `Be strict. A "pass" means this could be printed and sold without a customer noticing`,
    `anything wrong. Most generated frames are NOT good enough — expect to fail them. If`,
    `the floor markings belong to a different sport, or the equipment is missing, tiny, or`,
    `pushed out of the playing area, that is a fail, not a minor note.`,
    ``,
    finish.crowdInSet
      ? `- no_people — no athlete, performer or discernible individual anywhere on the`
        + ` playing surface or in the foreground. The distant, heavily out-of-focus crowd`
        + ` in the stands IS part of this finish's set — it is expected, not a violation.`
      : `- no_people — no humans, figures, mannequins, crowds or person-shaped silhouettes`
        + ` anywhere.`,
    `- no_text — no words, lettering, logos, watermarks or sponsor/brand marks anywhere.`,
    `  Numbers that are a genuine part of the playing surface — football yard numbers, lane`,
    `  numbers on a track or a pool deck — are CORRECT and must NOT be failed.`,
    ...(finish.venueBased && sport.venue !== "indoor"
      ? [
          `- set_matches_reference — judge ONLY the palette, the colour grade, the quality and`,
          `  direction of the light, and the material feel. This sport is played outdoors, so`,
          `  the ARCHITECTURE IS DELIBERATELY DIFFERENT from image 1: an open sky, an open-air`,
          `  stadium or open ground instead of the reference's indoor arena is CORRECT and must`,
          `  never be failed here. The venue itself is judged by venue_correct, not by this`,
          `  check. Fail only if the palette, grade or light no longer belong to this finish.`,
        ]
      : [
          `- set_matches_reference — same materials, lighting direction, camera height,`,
          `  perspective, colour grade and overall composition as image 1. The floor markings`,
          `  and the ${sport.name} equipment are the ONLY things that are supposed to differ.`,
        ]),
    `  Judge the structures and the lighting here, never the floor — the floor has its own`,
    `  checks below, and image 1's floor is not the answer key for it.`,
    ...(finish.venueBased && sport.venue !== "indoor"
      ? [
          sport.venue === "open"
            ? `- venue_correct — ${sport.name} is NOT an arena sport. FAIL if there is any`
              + ` arena, stadium, grandstand, seating or roof anywhere in the frame. It must`
              + ` be open ground under open sky.`
            : `- venue_correct — ${sport.name} is played outdoors, so this must be an`
              + ` OPEN-AIR stadium: open sky overhead and no indoor roof or ceiling. FAIL if`
              + ` it is an enclosed indoor arena.`,
        ]
      : [`- venue_correct — the venue matches the reference's own; pass unless it has been`
         + ` changed into a different kind of building.`]),
    `- ${surfaceRule}`,
    `- sport_readable — a viewer can tell within a second that this is ${sport.name}, from`,
    `  the markings and the ${sport.props}. FAIL if the floor markings belong to a`,
    `  different sport, or if the only ${sport.name} cue is something small in the`,
    `  far background.`,
    `- prop_scale — the ${sport.props} is at believable real-world size`,
    `  (${sport.propScale}). FAIL if it is inflated to fill the frame, OR so small/faint`,
    `  that it is easy to miss.`,
    `- prop_grounded — its base clearly meets the floor, and the WHOLE silhouette is`,
    `  inside the frame with clear space around it. FAIL if it floats; FAIL if any part of`,
    `  it runs off or touches the left, right or top edge; FAIL if it is hidden behind the`,
    `  foreground structures. Half a net at the frame edge is a fail even if the visible`,
    `  half looks correct.`,
    sport.propPlacement === "centre"
      ? `- prop_placement — this equipment is used in the middle of play, so it must sit in`
        + ` the MIDDLE of the playing area, set back from camera. Judge this on ONE thing:`
        + ` where the object's own centre point falls across the frame width. PASS if that`
        + ` centre lies anywhere in the middle third. FAIL only if it lies in the left or`
        + ` right third, or if the equipment is missing entirely. How far the object extends`
        + ` towards a side, and how far back it stands, are not this check — a wide net or`
        + ` goal reaching across much of the frame is correct.`
      : `- prop_placement — this belongs at the edge of the field, so it must sit off to one`
        + ` side with the centre left open. FAIL if it blocks the centre.`,
    `- layout_correct — the equipment and the markings line up correctly with each other`,
    `  and with the camera. The correct arrangement is: ${sport.layout}. Check the`,
    `  RELATIONSHIP, not just the presence: is the net/goal actually standing ON the line it`,
    `  belongs to, or floating somewhere unrelated to the lines under it? Is it square to`,
    `  the camera or skewed at an angle the real sport never uses? Does the seating sit`,
    `  outside the playing boundary rather than on it? FAIL on any of these, even if every`,
    `  individual object looks well made.`,
    `- court_correct — the markings are the real, complete geometry of a ${sport.name}`,
    `  playing area (${sport.markings}), drawn in correct proportion and correct perspective`,
    `  on the ground plane. FAIL if they are generic lines, a partial or invented pattern,`,
    `  the wrong sport's court, or a whole miniature field seen end to end instead of a`,
    `  life-scale fragment.`,
    `  The set's own structures and the highlights they cast or reflect in the mirror floor`,
    `  are the FINISH, not markings — hexagon edges, glints and reflections are expected and`,
    `  must never be counted against this check. Fail on set-shaped lines only when they`,
    `  have replaced the sport's geometry rather than sitting under it.`,
    `  FAIL if anything you listed in foreignMarkings is on this floor: markings from two`,
    `  different sports on one floor is a failure even when the ${sport.name} lines are`,
    `  present and correct. A leftover basketball key beside real lane lines is NOT a minor`,
    `  note — the customer sees both.`,
    `- centre_clear — a full-body athlete composited over the centre would still read`,
    `  clearly. Background equipment standing in the middle distance is fine, since the`,
    `  athlete covers it; FAIL only on foreground clutter that would collide with them.`,
    `- render_quality — photorealistic and sharp, no melted geometry, no impossible`,
    `  structures, no obvious AI artefacts.`,
    ``,
    `Return one entry per check id above. In worstIssue, name the single biggest problem`,
    `in one short sentence, or "none" if everything passes.`,
  ].join("\n");
}

/**
 * How many independent judgements to take per image. The judge is a vision model and is
 * NOT deterministic even at temperature 0 — the same track-field frame (basketball lines,
 * microscopic blocks) graded fail on one run and pass on the next. A single sample is a
 * coin toss on the borderline cells, and a false PASS is the expensive direction: it ships
 * a wrong frame to print. So take several votes and fail a check if ANY vote failed it.
 * A false alarm only costs one re-roll; grading costs a fraction of a cent either way.
 *
 * Default 1, because the judge is now gemini-2.5-pro, which reproduces all 9 human
 * verdicts single-shot (calibrate.ts). Voting was what made the weak flash judge usable;
 * keep the knob for a new finish whose frames sit on the borderline — `ART_QA_VOTES=3`.
 */
export const VOTES = Number(process.env.ART_QA_VOTES ?? 1);

export async function checkBackground(
  imagePath: string,
  finish: Finish,
  sport: Sport,
  votes = VOTES,
): Promise<Verdict> {
  // The SAME reference the generator used — see refs.ts. Grading against finish.ref
  // while generating from the plate made the judge reward the basketball court.
  const refPath = referenceFor(finish);
  // 1024 px, not 768: the sport markings are faint inlay lines and the props sit in the
  // mid-distance, so at 768 the judge simply could not see what it was grading. Grading
  // costs a fraction of a cent — never trade accuracy for it.
  const [ref, img] = await Promise.all([refFor(refPath, 1024), refFor(imagePath, 1024)]);
  const prompt = rubric(finish, sport, hasPlate(finish));
  const rounds = await Promise.all(
    Array.from({ length: Math.max(1, votes) }, () =>
      generateJson<{
        checks: Check[];
        worstIssue: string;
        observations: { floor: string; foreignMarkings: string; prop: string };
      }>({ prompt, images: [ref, img], schema: SCHEMA }),
    ),
  );

  // Strict merge: a check survives only if EVERY vote passed it. An id no vote answered
  // is a failure, not a pass — `checks.every(pass)` is vacuously true on a short array.
  const checks: Check[] = CHECK_IDS.map((id) => {
    const seen = rounds.map((r) => r.checks.find((c) => c.id === id)).filter(Boolean) as Check[];
    if (!seen.length) {
      return { id, pass: false, note: "no vote answered this check — treated as a failure" };
    }
    const bad = seen.find((c) => !c.pass);
    return bad ?? seen[0];
  });

  const firstFailing = rounds.find((r) => r.checks.some((c) => !c.pass));
  return {
    verdict: checks.every((c) => c.pass) ? "pass" : "fail",
    checks,
    worstIssue: (firstFailing ?? rounds[0]).worstIssue,
    observations: rounds[0].observations,
  };
}

/** Turn a failed verdict into an extra instruction for the re-roll. */
export function retryHint(v: Verdict): string {
  const failed = v.checks.filter((c) => !c.pass);
  if (!failed.length) return "";
  return [
    ``,
    `The previous attempt was rejected. Fix these specific problems, and change nothing else:`,
    ...failed.map((c) => `- ${c.id}: ${c.note}`),
  ].join("\n");
}
