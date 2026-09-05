#!/usr/bin/env tsx
/**
 * Customer photo intake — the first stage of the per-order pipeline.
 *
 *   npx tsx art-pipeline/intake.ts --photos orders/1042/photos
 *
 * WHY THIS RUNS BEFORE ANYTHING IS SPENT
 * A customer sends whatever they have. The failures are predictable and every one of them
 * is cheap to detect and expensive to discover late — a team photo with twelve kids in it,
 * a face forty pixels wide, a motion-blurred phone shot, and the most common of all: four
 * photos taken from the same angle in the same minute. None of that is visible in the
 * generated poses until eight images have already been paid for and the face is subtly
 * wrong in all of them.
 *
 * Every rejection here has to be something the customer can ACT on. "Photo 3 has four
 * faces in it — send one with only <name>" is useful. "Validation failed" is not.
 *
 * Output: a JSON verdict plus the ranked list of photos to use as the identity anchor.
 * The next stage builds the identity plate from those, and from there the pipeline is the
 * same code that produced the demo roster — see README section 19.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const PY = flag("python", ".venv-matte/bin/python");
const DIR = flag("photos");
if (!DIR) throw new Error("pass --photos <dir>");
if (!existsSync(DIR)) throw new Error(`no such directory: ${DIR}`);

/** Minimum face size as a share of the frame. Below this the plate has nothing to work from. */
const MIN_FACE_SHARE = 0.008;
/** Minimum face box in pixels. A 90 px face upscales into a stranger. */
const MIN_FACE_PX = 180;
/**
 * ...OR ENOUGH DETAIL TO MAKE UP FOR BEING SMALL. Size alone was the only test, and it threw
 * away the most informative photograph in Order 03.
 *
 * Measured on that order — a professional match photographer's set, every frame excellent as a
 * PHOTOGRAPH:
 *
 *   portrait, ACCEPTED       256 px x sharpness 108 = 28
 *   match action, REJECTED   116 px x sharpness 430 = 50
 *
 * The rejected frame carries nearly twice the face detail of the one the gate trusted. A face
 * is not information because it is big; it is information because it has detail in it, and a
 * sharp small face can hold more than a soft large one.
 *
 * So the size bar keeps its job and gains an alternative: a face may also pass on DETAIL, if it
 * is still large enough to be a face at all. The bar is 40 — above the 28 of a photograph this
 * gate already accepts, and below the 50 of the one it should never have refused. It does NOT
 * admit the six-person huddle at 22.
 *
 * ONE THING THIS IS NOT: a predictor of how good the plate will be. Across three orders the
 * information scores run 45/42/16/9/6 for the best plate of the three (0.886) and 57/50/28/22
 * for the worst (0.773). It decides what is worth keeping, not what the result will be.
 */
const INFO_ENOUGH = 40;
const MIN_FACE_PX_IF_SHARP = 100;
/** Two photos this alike are the same shot twice and add no angle coverage. */
const DUPLICATE_ABOVE = 0.92;
/**
 * The same-person test, and it is NOT a pairwise one.
 *
 * The first version failed the set if ANY pair scored under 0.36, and on the first real
 * batch it flagged a genuine set of four photos of one child. Measured (2026-08-20, the
 * seven-year-old ladder set):
 *
 *   pairwise            0.322 – 0.551   (one pair below the line)
 *   leave-one-out       0.526 – 0.605   (spread of 0.08)
 *
 * The failing pair was a training shot with the head down and the face shaded against a
 * wide open laugh with the eyes squeezed shut — the two hardest conditions in the set. Worst
 * pair is a brittle statistic: two extreme but perfectly valid frames always look far apart,
 * and it gets worse with children, since ArcFace is trained mostly on adults.
 *
 * So the statistic changed, NOT the threshold — the distinction matters, because loosening a
 * gate to make a batch pass is exactly what README section 6 forbids. Each photo is now
 * compared against the MEAN of the others, which is both far more stable and the same thing
 * the pipeline does downstream (the identity anchor IS a mean). A real intruder is an
 * outlier and shows up plainly: 0.2 against everyone else's 0.55.
 */
const SAME_PERSON_BELOW = 0.36;
/**
 * Dark-lens gate. MEASURED on the first real order (2026-08-22), five photographs of one man:
 *
 *   bare eyes    0.766  0.824  0.844  0.965
 *   sunglasses   0.341
 *
 * 0.55 sits in the middle of a gap with no observations anywhere near it. Below the line the
 * eyes are behind something.
 *
 * WHY IT IS A REJECTION AND NOT A NOTE: ArcFace does not treat sunglasses as an occlusion. It
 * returns a confident detection and a usable embedding — of a face missing the feature that
 * carries most of its identity. On this very set that surfaced as "these do not all look like
 * the same person (0.57 vs the others' 0.80)", so the customer was being asked to check for a
 * sibling who does not exist, about a photo of himself. A wrong reason is worse than no
 * reason: it sends them looking in the wrong place.
 *
 * It is checked BEFORE the identity statistics, so an occluded face never gets a vote on who
 * the person is.
 */
const EYES_HIDDEN_BELOW = 0.55;
/** ...and a photo that sits this far under its peers is an outlier even if it clears the floor. */
const OUTLIER_MARGIN = 0.15;
const MIN_USABLE = 3;
/**
 * Angle coverage, and it is a SEPARATE question from "are these the same shot twice".
 *
 * MEASURED on Order 01 (2026-08-22). Yaw here is where the nose sits between the eyes,
 * scaled by half the eye distance: 0 is square to camera, ±1 is a hard three-quarter turn.
 *
 *   the four photographs   +0.12  +0.20  -0.18  +0.98
 *   the plate's side panel   -0.82 (Pro) / -0.71 (flash)
 *
 * Every photograph is either frontal or turned ONE way. The plate's second panel turns the
 * OTHER way, so that view had no evidence behind it and was invented — and it is exactly the
 * panel that scored worst against the customer's own face (0.725, against 0.830 and 0.784 for
 * the other two) and the one panel the customer picked out as not looking right.
 *
 * The duplicate test above cannot see this: those four photographs are not near-duplicates of
 * each other, so nothing complained. "Different from each other" is not "covers both sides".
 *
 * A NOTE rather than a rejection: a customer may simply not own a photograph from that side,
 * and the order should still proceed — with the limitation recorded, so a soft side panel is
 * a known consequence rather than a surprise.
 */
const TURNED = 0.35;
/**
 * THE SET NEEDS ONE GENUINELY SHARP PHOTOGRAPH, and until now nothing asked for it.
 *
 * Face SIZE was the only detail test here, and size is not detail. Measured across the two
 * real orders, over the photographs each set actually used (see sharpness() in lib/face.py):
 *
 *   Order 01   206  114   25   19     -> best identity plate 0.886, accepted by the customer
 *   Order 02    16   11    6    3     -> best identity plate 0.784, called inaccurate
 *
 * Order 02's photographs are the LARGER files — 5712x4284 against Order 01's phone frames —
 * and every one of them is soft. Big and blurry passed every check in this file.
 *
 * The rule is about the SET, not each photo: Order 01 also used two soft frames (25 and 19)
 * and still reached 0.886, because two sharp ones carried the identity and the soft ones only
 * added angles. So the requirement is that AT LEAST ONE anchor is sharp. 60 sits in the empty
 * gap between the two sets, well above Order 02's best (16) and below Order 01's second (114).
 */
const SHARP_ANCHOR = 60;

interface Face { bbox: number[]; score: number; embedding: number[]; eyeRatio: number | null; kps: number[][]; sharpness: number | null }
interface Probe { path: string; width?: number; height?: number; faces?: Face[]; error?: string }

const files = readdirSync(DIR)
  // kit.png is a DESIGNATION — a copy of whichever photo shows the real team strip. Counting
  // it as another photo double-weights that one in every identity statistic below.
  .filter((f) => !/^kit\./i.test(f))
  .filter((f) => [".jpg", ".jpeg", ".png", ".webp", ".heic"].includes(extname(f).toLowerCase()))
  .map((f) => join(DIR, f))
  .sort();

if (!files.length) throw new Error(`no images in ${DIR}`);

// Via a temp file, not stdout — see the note at the top of lib/face.py.
const tmp = join(tmpdir(), `intake-${process.pid}.json`);
execFileSync(PY, ["art-pipeline/lib/face.py", tmp, ...files], { stdio: "ignore" });
const probes: Probe[] = JSON.parse(readFileSync(tmp, "utf8"));
rmSync(tmp, { force: true });

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

interface Row {
  path: string;
  ok: boolean;
  reasons: string[];
  faceShare: number;
  facePx: number;
  score: number;
  bbox?: number[];
  embedding?: number[];
  /** Detail in the face crop; see SHARP_ANCHOR. */
  sharpness?: number | null;
  /** Re-admitted by the second pass once his face was identified among several. */
  rescued?: boolean;
  /** facePx x sharpness / 1000 — see INFO_ENOUGH. */
  info?: number;
  /** 0 square to camera, ±1 a hard three-quarter turn. See TURNED. */
  yaw?: number | null;
}

/** Where the nose sits between the eyes, scaled by half the eye distance. */
function yawOf(f: Face): number | null {
  const k = f.kps ?? [];
  if (k.length < 3) return null;
  const half = Math.abs(k[1][0] - k[0][0]) / 2;
  if (half < 1) return null;
  return (k[2][0] - (k[0][0] + k[1][0]) / 2) / half;
}

const rows: Row[] = probes.map((p) => {
  const reasons: string[] = [];
  if (p.error) return { path: p.path, ok: false, reasons: ["the file could not be opened"], faceShare: 0, facePx: 0, score: 0 };
  const faces = p.faces ?? [];
  if (!faces.length) {
    return { path: p.path, ok: false, reasons: ["no face found in this photo"], faceShare: 0, facePx: 0, score: 0 };
  }
  const f = faces[0];
  // OTHER PEOPLE IN THE FRAME ARE NORMAL AND MUST NOT BE A FAILURE.
  // The first version failed any photo with more than one face, and on the first real test
  // it rejected both sideline shots — a child in the foreground with teammates and parents
  // behind. That is precisely what a parent's best photos look like, so the rule was
  // throwing away the strongest input a customer has.
  //
  // What actually breaks the pipeline is AMBIGUITY: a team photo where six children are the
  // same size and nothing says which one is yours. So the test is relative, not a count —
  // fail only when the second face is close enough in size to be mistaken for the subject.
  if (faces.length > 1) {
    const a0 = (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]);
    const g = faces[1];
    const a1 = (g.bbox[2] - g.bbox[0]) * (g.bbox[3] - g.bbox[1]);
    if (a1 / a0 > 0.6) {
      reasons.push(
        `${faces.length} people in this photo and no clear subject — send one where the athlete is the closest person to the camera`,
      );
    }
  }
  const w = f.bbox[2] - f.bbox[0], h = f.bbox[3] - f.bbox[1];
  const facePx = Math.min(w, h);
  const faceShare = (w * h) / (p.width! * p.height!);
  const info = (facePx * (f.sharpness ?? 0)) / 1000;
  const smallButSharp = facePx >= MIN_FACE_PX_IF_SHARP && info >= INFO_ENOUGH;
  if (facePx < MIN_FACE_PX && !smallButSharp) {
    reasons.push(`the face is only ${Math.round(facePx)} px across and not sharp enough to make up for it — move closer, or send the original rather than a screenshot`);
  }
  // A small face that IS sharp is a legitimate anchor, so being far away stops being an
  // objection on its own — see INFO_ENOUGH.
  if (faceShare < MIN_FACE_SHARE && !smallButSharp) reasons.push("the athlete is too far away in the frame");
  if (f.score < 0.6) reasons.push("the face is unclear — likely blurred or badly lit");
  if (f.eyeRatio != null && f.eyeRatio < EYES_HIDDEN_BELOW) {
    reasons.push("the eyes are hidden — sunglasses, a visor or a shadow across them; send one where both eyes are visible");
  }
  return { path: p.path, ok: reasons.length === 0, reasons, faceShare, facePx, score: f.score, bbox: f.bbox, embedding: f.embedding, yaw: yawOf(f), sharpness: f.sharpness, info };
});

let usable = rows.filter((r) => r.ok && r.embedding);

/**
 * SECOND PASS: photographs rejected ONLY for ambiguity, re-admitted once we know which face
 * is his.
 *
 * "Six people and no clear subject" is a real problem when nothing in the set says who the
 * subject is. It stops being a problem the moment ONE unambiguous photograph exists, because
 * then the question "which of these faces is the athlete" has an arithmetic answer. Order 03
 * arrived with four photographs and one clean one: a match report, a team huddle, and an award
 * ceremony where he is shaking hands with the organiser — her face the same size as his. The
 * first pass cleared 1 of 4 and the order would have gone back to the customer.
 *
 * The distance and occlusion tests still apply, and they apply TO THE MATCHING FACE — a photo
 * only re-enters if HIS face in it is big enough, sharp enough and has visible eyes. What is
 * dropped is the ambiguity objection alone, because it has been answered.
 */
if (usable.length) {
  const seed = (() => {
    const m = usable[0].embedding!.map((_, d) => usable.reduce((s2, o) => s2 + o.embedding![d], 0) / usable.length);
    const n = Math.hypot(...m);
    return m.map((v) => v / n);
  })();
  for (const r of rows) {
    if (r.ok) continue;
    const ambiguityOnly = r.reasons.every((x) => x.includes("no clear subject"));
    if (!ambiguityOnly) continue;
    const probe = probes.find((p2) => p2.path === r.path);
    const faces = probe?.faces ?? [];
    let best: Face | null = null;
    let bestSim = -1;
    for (const f of faces) {
      const sim = dot(f.embedding, seed);
      if (sim > bestSim) { bestSim = sim; best = f; }
    }
    if (!best || bestSim < SAME_PERSON_BELOW) continue;
    // Re-check the tests that matter, on HIS face rather than the biggest one in the frame.
    const w = best.bbox[2] - best.bbox[0], h2 = best.bbox[3] - best.bbox[1];
    const px = Math.min(w, h2);
    if (px < MIN_FACE_PX) continue;
    if (best.eyeRatio != null && best.eyeRatio < EYES_HIDDEN_BELOW) continue;
    r.ok = true;
    r.reasons = [];
    r.embedding = best.embedding;
    r.bbox = best.bbox;
    r.facePx = px;
    r.faceShare = (w * h2) / (probe!.width! * probe!.height!);
    r.info = (px * (best.sharpness ?? 0)) / 1000;
    r.yaw = yawOf(best);
    r.sharpness = best.sharpness;
    r.rescued = true;
  }
  usable = rows.filter((r) => r.ok && r.embedding);
}

/**
 * BODY REFERENCES — photographs that fail as a face anchor and are still the most useful thing
 * in the set for one panel of the plate.
 *
 * Every test above grades a photograph on its FACE, so the only full-length shots a customer
 * sends are usually the ones that get rejected: stand far enough back to show someone standing
 * and their face is 174 px, they are wearing sunglasses, and their child is holding their hand.
 * All three of those disqualify a face anchor. NONE of them matters for a body.
 *
 * Measured across seventeen Order 02 plates, the panel with no evidence behind it:
 *
 *   panel 1, portrait      0.683
 *   panel 2, three-quarter 0.639   (-0.044)
 *   panel 3, FULL BODY     0.535   (-0.148)
 *
 * On Order 01, whose set included a full-length portrait, the same panel gave up only -0.04.
 * The plate is not failing to draw a body; it has never been shown one.
 *
 * THE TEST IS "IS ONE OF THESE FACES HERS", NOT "HOW MANY FACES ARE THERE". The first version
 * of this required a photograph rejected ONLY for distance, which threw away the best body
 * shot in the set — daylight, head to shoes, unmistakably her — because she had sunglasses on
 * and was holding a toddler's hand. Ambiguity about WHICH person is a real problem and it has
 * a real answer: match a face against the anchor. If one of them is her, the body is hers too.
 *
 * Ranked by sharpness, because a soft night-time street shot is a worse frame reference than a
 * crisp one, and the first attempt attached exactly that.
 */
const anchorMean = usable.length
  ? (() => {
      const m = usable[0].embedding!.map((_, d) => usable.reduce((s2, o) => s2 + o.embedding![d], 0) / usable.length);
      const n = Math.hypot(...m);
      return m.map((v) => v / n);
    })()
  : null;

const bodyRefs = rows
  .filter((r) => {
    if (r.ok || !r.embedding || !anchorMean) return false;
    // Small face means the body is probably in frame — that is what makes it a body shot.
    if (!(r.faceShare > 0 && r.faceShare < 0.02)) return false;
    // ...and it is HER body only if one of the faces in it is hers.
    return dot(r.embedding, anchorMean) >= SAME_PERSON_BELOW;
  })
  .sort((a, b) => (b.sharpness ?? 0) - (a.sharpness ?? 0));

// Angle coverage and identity consistency, both from the same pairwise similarities:
// a pair that is TOO similar is the same shot twice; a pair that is too dissimilar is a
// different child.
const notes: string[] = [];
const pairs: { a: string; b: string; sim: number }[] = [];
for (let i = 0; i < usable.length; i++) {
  for (let j = i + 1; j < usable.length; j++) {
    pairs.push({ a: usable[i].path, b: usable[j].path, sim: dot(usable[i].embedding!, usable[j].embedding!) });
  }
}
const near = pairs.filter((p) => p.sim > DUPLICATE_ABOVE);

// Leave-one-out: each photo against the mean of the others. See the note on
// SAME_PERSON_BELOW for why this replaced the pairwise test.
const loo = usable.map((r, i) => {
  const others = usable.filter((_, k) => k !== i).map((o) => o.embedding!);
  if (!others.length) return { path: r.path, sim: 1 };
  const m = others[0].map((_, d) => others.reduce((s, v) => s + v[d], 0) / others.length);
  const n = Math.hypot(...m);
  return { path: r.path, sim: dot(r.embedding!, m.map((v) => v / n)) };
});
const median = [...loo].sort((a, b) => a.sim - b.sim)[Math.floor(loo.length / 2)]?.sim ?? 1;
const far = loo.filter((x) => x.sim < SAME_PERSON_BELOW || x.sim < median - OUTLIER_MARGIN);
if (far.length) {
  notes.push(
    `these do not all look like the same person — check that no sibling or teammate got mixed in: ` +
    far.map((x) => `${x.path.split("/").pop()} (${x.sim.toFixed(2)} vs the others' ${median.toFixed(2)})`).join(", "),
  );
}
// One sharp anchor, or the plate will be built from mush. See SHARP_ANCHOR.
const sharpest = Math.max(0, ...usable.map((r) => r.sharpness ?? 0));
if (usable.length && sharpest < SHARP_ANCHOR) {
  notes.push(
    `every usable photo is SOFT (sharpest ${sharpest.toFixed(0)}, want ${SHARP_ANCHOR}+) — big files, but none of them holds fine detail in the face. ` +
    `One crisp, well-lit photo taken close up does more for the likeness than four more like these`,
  );
}

// Both sides, or name the one that is missing. See TURNED.
const yaws = usable.map((r) => r.yaw).filter((y): y is number => y != null);
const turnedLeft = yaws.some((y) => y <= -TURNED);
const turnedRight = yaws.some((y) => y >= TURNED);
if (yaws.length && !(turnedLeft && turnedRight)) {
  const span = `${Math.min(...yaws).toFixed(2)} … ${Math.max(...yaws).toFixed(2)}`;
  notes.push(
    !turnedLeft && !turnedRight
      ? `every photo faces the camera square on (${span}) — send two more, the head turned about 45° to one side in one and to the other side in the other, or the plate's side view is invented`
      : `no photo turned to the ${turnedLeft ? "RIGHT" : "LEFT"} (${span}) — the plate builds one panel from that side, so it will be the weakest of the three; one more photo with the head turned about 45° that way fixes it`,
  );
}

if (usable.length >= 2 && near.length === pairs.length) {
  notes.push("every photo is nearly the same shot — send at least one from a different angle, ideally turned to the side");
}

const verdict = usable.length >= MIN_USABLE && !far.length ? "ok" : "rejected";
const out = join(DIR, "_intake.json");
writeFileSync(out, JSON.stringify({
  verdict,
  usable: usable.map((r) => r.path),
  // Best first: a big, sharp, confidently-detected face makes the strongest anchor.
  anchorOrder: [...usable].sort((a, b) => b.faceShare * b.score - a.faceShare * a.score).map((r) => r.path),
  identity: loo.map((x) => ({ path: x.path, similarityToOthers: +x.sim.toFixed(3) })),
  sharpest: +sharpest.toFixed(0),
  // Not anchors — see bodyRefs. The identity stage attaches these for the full-length panel.
  bodyRefs: bodyRefs.map((r) => ({ path: r.path, bbox: r.bbox?.map((v) => Math.round(v)) })),
  // The face box in each cleared photograph, so the identity stage can crop to the head
  // instead of shrinking the whole frame. See faceRefFor in lib/img.ts.
  faces: usable.map((r) => ({ path: r.path, bbox: r.bbox?.map((v) => Math.round(v)) })),
  coverage: { turnedLeft, turnedRight, yaw: usable.map((r) => ({ path: r.path, yaw: r.yaw == null ? null : +r.yaw.toFixed(2) })) },
  rejected: rows.filter((r) => !r.ok).map((r) => ({ path: r.path, reasons: r.reasons })),
  notes,
}, null, 2));

console.log(`intake ${DIR}`);
for (const r of rows) {
  console.log(`  ${r.ok ? (r.rescued ? "ok* " : "ok  ") : "FAIL"} ${r.path.split("/").pop()}  face ${Math.round(r.facePx)} px (${(r.faceShare * 100).toFixed(1)}% of frame)${r.rescued ? "  — several people, his face identified by match" : ""}`);
  for (const reason of r.reasons) console.log(`       ${reason}`);
}
for (const n of notes) console.log(`  note ${n}`);
if (bodyRefs.length) {
  console.log(`  body ${bodyRefs.length} rejected as anchors, kept as FULL-LENGTH references (sharpest first): ${bodyRefs.map((r) => `${r.path.split("/").pop()} (${(r.sharpness ?? 0).toFixed(0)})`).join(", ")}`);
}
console.log(`\n${verdict.toUpperCase()} — ${usable.length} usable of ${rows.length}, need ${MIN_USABLE}`);
console.log(`-> ${out}`);
if (verdict !== "ok") process.exitCode = 1;
