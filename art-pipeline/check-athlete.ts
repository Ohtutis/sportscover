// QA for generated athletes.
//
// Split of responsibility with cutout.ts: anything with a formula (cropping, detached
// limbs, matte fringe) is arithmetic there. What is left here is what only a pair of eyes
// can answer — is this the same person, does it look like a photograph of a real teenager,
// is the pose the one that was asked for, is the crest still the crest.
//
// `identity_match` is the check this whole layer exists for, and a vision model saying
// "yes, looks similar" is NOT a guarantee. For the per-order tool it must be backed by a
// numeric face-embedding distance (ArcFace/InsightFace cosine, gated at a threshold),
// because "keep the customer's face" is a promise, not a preference. The judge is the
// right tool for the demo roster and the wrong one to bet a paid order on.

import type { Sport } from "./sports.js";
import type { Athlete } from "./athletes.js";
import type { Pose } from "./poses.js";
import { hasBackNumber, kitFor } from "./kits.js";
import { generateJson } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";

export interface Check { id: string; pass: boolean; note: string }
export interface AthleteVerdict {
  verdict: "pass" | "fail";
  checks: Check[];
  worstIssue: string;
  observations?: { person: string; pose: string; backdrop: string; chest: string };
}

export const ATHLETE_CHECK_IDS = [
  "identity_match",
  "hair_matches",
  "age_correct",
  "build_correct",
  // Only graded on athletes aged 12 and under; the rubric omits it otherwise and the id is
  // filtered out below so a missing answer cannot count against an adult.
  "child_proportions",
  "kit_correct",
  "not_plastic",
  "kit_clean",
  "crest_placement",
  "not_overheated",
  "pose_correct",
  "camera_correct",
  "facing_correct",
  "frame_complete",
  "clean_backdrop",
  "gear_correct",
  "crest_fidelity",
  "no_league_mark",
  "no_stray_text",
  "render_quality",
] as const;

const SCHEMA = {
  type: "object",
  properties: {
    // Same trick as check.ts: force a description before a verdict. A judge asked
    // "is this the same person?" says yes almost every time; a judge made to describe
    // the nose, the brow and the jaw first starts noticing when they changed.
    observations: {
      type: "object",
      properties: {
        person: { type: "string" },
        pose: { type: "string" },
        backdrop: { type: "string" },
        chest: { type: "string" },
      },
      required: ["person", "pose", "backdrop", "chest"],
    },
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", enum: [...ATHLETE_CHECK_IDS] },
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

/**
 * THE JUDGE MUST READ THE SAME DOCUMENT THE GENERATOR DID.
 *
 * `kit_correct` used to compare every frame against `kitFor(a)` — the SPORT DEFAULT — while
 * the generator was working from the frozen spec, which describes the athlete's actual kit.
 * So the judge failed frames for not matching a document the generator had never seen, the
 * re-roll loop kept firing, and each new roll was rejected for the same impossible reason.
 * That single mismatch caused most of the churn on this athlete.
 */
function rubric(a: Athlete, sport: Sport, pose: Pose, spec?: string): string {
  const isBack = pose.id === "back";
  return [
    `Image 1 is a reference sheet of one person. Image 2 is a generated photograph that is`,
    `supposed to show THAT SAME PERSON playing ${sport.name}. Image 3 is the club crest that`,
    `is supposed to be on the chest of the jersey in image 2.`,
    ``,
    `FIRST describe, in observations, without judging:`,
    `- person: the face in image 2 — nose shape, brow, jawline, hair, apparent age, build.`,
    `  If the face is not visible (a from-behind shot), say so and describe build and hair.`,
    `- pose: what the body is actually doing, and where the camera is relative to it.`,
    `- backdrop: everything behind and under the athlete.`,
    `- chest: what is printed on the chest of the jersey, described as if to someone who`,
    `  cannot see it.`,
    ``,
    `THEN answer every check. Fail anything you are not sure about.`,
    ``,
    `identity_match — is image 2 the same person as image 1? Compare the nose, the brow,`,
    `  the jaw, the hairline and the hair colour, the skin tone. A generically similar`,
    `  teenager is a FAIL: this must read as the same individual.`,
    isBack
      ? `  The face is hidden here, so judge build, hair colour and hairline at the neck only.`
      : `  The face must be visible enough to judge. If it is hidden, fail this.`,
    `hair_matches — is the HAIR the same as image 1: same colour, same length, same cut, same`,
    `  fringe, falling the same way? Judge this on its own and strictly. The numeric identity`,
    `  check used alongside this rubric crops to the face and cannot see hair at all, so a`,
    `  restyled head passes every other test and still looks wrong to the person who knows them.`,
    `age_correct — does this read as ${a.age.split(",")[0]}? An adult professional is a FAIL.`,
    `build_correct — does the body match: ${a.build}?`,
    ...(a.ageYears <= 12
      ? [
          `child_proportions — does this read as a CHILD rather than a small adult? The head`,
          `  must be large relative to the body, the forehead high, the neck short, the limbs`,
          `  short with no adult muscle definition. An adult body scaled down is a FAIL, and it`,
          `  is the most common way this age goes wrong. The kit should also sit loose and`,
          `  slightly too big; a perfectly tailored kit on a small child is a FAIL.`,
        ]
      : []),
    `kit_correct — is the uniform exactly this: ${spec ?? kitFor(a)}? A different jersey design — contrast`,
    `  shoulders or sleeves that should not be there, a missing or extra stripe, a different`,
    `  cut — is a FAIL even when the colours are right. All three front poses are composited`,
    `  into one poster, so the kit must be the same garment in every shot.`,
    `kit_clean — this is a PREMIUM shot. The kit, footwear and any ball must be clean and`,
    `  unmarked: no mud, no grass stains, no dirt, no sweat marks on fabric, no scuffing, no`,
    `  tears, no fading. FAIL for any of them. Note the athlete themselves MAY look like they`,
    `  have been playing — damp hair, a light warmth in the face. That is not a failure.`,
    // This used to say "on the LEFT CHEST" full stop, and it failed the football set three
    // times for a crest the kit description deliberately places centred high — which is where
    // the athlete's own photograph shows it. The rubric must grade against the settled
    // decision, not against one sport's convention.
    `crest_placement — the crest sits where the kit description above places it, and it is`,
    `  SMALL, roughly three fingers wide, the way a real team badge sits. If that description`,
    `  says nothing about placement, the left chest is correct. A crest blown up across the`,
    `  middle of the shirt is a FAIL even when the artwork itself is right.`,
    `not_overheated — is the face a natural colour? A deep red, blotchy or overheated-looking`,
    `  face is a FAIL: it stops the frame reading as premium and it measurably hurts the`,
    `  identity match.`,
    `not_plastic — does this look like a real photograph of a real person? FAIL it for any of:`,
    `  airbrushed or poreless skin, a waxy or plastic sheen, hair rendered as one smooth mass,`,
    `  a perfectly symmetric face, flawless teeth, a 3D-render or video-game look, an`,
    `  over-retouched beauty-filter finish. This is the single most important check.`,
    `pose_correct — is the athlete doing this: ${pose.action}?`,
    `camera_correct — is the camera here: ${pose.camera}?`,
    `facing_correct — is the athlete facing this way: ${pose.facing}? The three front frames are`,
    `  assembled into one composition, so a support that faces outwards instead of inwards`,
    `  breaks the layout no matter how good the frame is on its own.`,
    `frame_complete — ${pose.mustShow}. Anything touching or crossing a frame edge is a FAIL,`,
    `  including the end of a stick, the top of a helmet and the blade of a skate.`,
    `clean_backdrop — the test is NOT "is it pretty", it is "will this survive being cut out".`,
    `  FAIL for anything a matte cannot remove or that will corrupt the edge: a set, a rink,`,
    `  ice, a crowd, another person, spray, snow, particles, smoke, a strong floor-to-wall`,
    `  seam crossing the body, or a long cast shadow stretching away across the backdrop.`,
    `  A soft contact shadow tight under the feet is ACCEPTABLE — the matte removes it, and`,
    `  failing every frame for it hides the defects that actually matter.`,
    `gear_correct — is the athlete wearing and holding correct ${sport.name} equipment`,
    `  (${sport.gear}), worn the way it is really worn?`,
    isBack
      ? `crest_fidelity — this is a from-behind shot, so the chest is not visible. If a crest`
        + `  appears on the BACK of the jersey it must match image 3 exactly; if no crest is`
        + `  visible at all, PASS this check. Never fail it merely for the chest being hidden —`
        + `  that is the shot working as intended.`
      : `crest_fidelity — is the mark on the chest the SAME mark as image 3: same outline shape,`
        + `  same figure inside it, same colours? A redrawn, simplified, mirrored, recoloured or`
        + `  garbled version is a FAIL. Any lettering added to it is a FAIL.`,
    // A LEAGUE MARK IS NOT A TEXT DEFECT and was slipping through as one. `no_stray_text`
    // asks about letters and `crest_fidelity` asks whether the chest badge matches ours — an
    // NFL shield on a collar is neither, so both passed it. It gets its own check because it
    // is the one defect here that is a legal problem rather than an aesthetic one.
    `no_league_mark — is there any real-world league, federation or professional club emblem`,
    `  anywhere in the frame — an NFL shield, an NBA, MLB, NHL, FIFA, UEFA, Premier League,`,
    `  NCAA or Olympic mark, a national federation badge, a real club's crest — on the jersey,`,
    `  the collar, the helmet, a sleeve, a sock, a ball or a boot? Any is a FAIL, however small,`,
    `  however well drawn. The only badge that may appear is the crest in image 3.`,
    // The back frame is graded against what this sport's shirt ACTUALLY carries. Asking for a
    // number the kit does not have taught the judge to pass an invented one — see
    // hasBackNumber in kits.ts, and README §36.
    isBack && !hasBackNumber(a)
      ? `no_stray_text — this sport does NOT number the back of the shirt, so the back must be`
        + `  PLAIN: any number, name, club, sponsor or lettering across the shoulders is a FAIL,`
        + `  however well drawn. A number belongs only where the kit description explicitly puts`
        + `  it. A manufacturer's wordmark is allowed on any item the kit description says the`
        + `  athlete's own equipment really carries one. Any other text anywhere is a FAIL.`
      : isBack
      ? `no_stray_text — the number ${a.jerseyNumber} across the upper back is expected and must be`
        + `  legible and correct, and a manufacturer's wordmark is allowed on any item the kit`
        + `  description says the athlete's own equipment really carries one. Any OTHER text,`
        + `  letters, words, sponsor or brand mark anywhere is a FAIL.`
      : `no_stray_text — apart from the chest crest, the squad number where the kit description`
        + `  puts it, and any manufacturer's wordmark the kit description says the athlete's own`
        + `  equipment really carries, there must be no text, letters, numbers, sponsor marks or`
        + `  brand logos anywhere. Anything else is a FAIL.`,
    `render_quality — sharp, correct anatomy, correct number of fingers and limbs, no melted`,
    `  equipment, no motion blur, no compression or generation artefacts.`,
    ``,
    `Answer every check listed above, by its id.`,
    `worstIssue: the one thing most worth fixing, in a sentence. "none" if it all passes.`,
  ].join("\n");
}

export async function checkAthletePose(opts: {
  athlete: Athlete;
  sport: Sport;
  pose: Pose;
  /** The frozen spec, when there is one — see the note on `rubric`. */
  spec?: string;
  imagePath: string;
  platePath: string;
  crestPath: string;
}): Promise<AthleteVerdict> {
  const [plate, img, crest] = await Promise.all([
    refFor(opts.platePath),
    refFor(opts.imagePath),
    refFor(opts.crestPath, 512),
  ]);
  const raw = await generateJson<AthleteVerdict>({
    prompt: rubric(opts.athlete, opts.sport, opts.pose, opts.spec),
    images: [plate, img, crest],
    schema: SCHEMA,
  });
  // A partial answer must not score as a pass — see the same bug in check.ts.
  const byId = new Map(raw.checks.map((c) => [c.id, c]));
  const wanted = ATHLETE_CHECK_IDS.filter(
    (id) => id !== "child_proportions" || opts.athlete.ageYears <= 12,
  );
  const checks: Check[] = wanted.map(
    (id) => byId.get(id) ?? { id, pass: false, note: "judge did not answer this check" },
  );
  return { ...raw, checks, verdict: checks.every((c) => c.pass) ? "pass" : "fail" };
}

/** Judge complaints, folded back into the prompt for a re-roll. Same idea as check.ts. */
export function retryHint(v: AthleteVerdict): string {
  const bad = v.checks.filter((c) => !c.pass);
  if (!bad.length) return "";
  return [
    ``,
    `The previous attempt was rejected for these reasons — fix all of them:`,
    ...bad.map((c) => `- ${c.id}: ${c.note}`),
  ].join("\n");
}


/* ------------------------------------------------------------------------- *
 * THE SET AUDIT
 *
 * A per-image rubric cannot see the defect that matters most on a printed card: the four
 * poses disagreeing with each other. Boots came back navy, grey-green, black and olive
 * across one set; one frame put white socks on a green kit; three frames carried three
 * different balls. Every one of those passed its own per-image grading, because nothing was
 * wrong with any single picture.
 *
 * So consistency is graded where it lives — across the whole set at once. Run this FIRST,
 * before re-rolling anything: it says which frames actually disagree, so only those are
 * regenerated instead of the whole set being thrown away on a hunch.
 * ------------------------------------------------------------------------- */

export const SET_CHECK_IDS = [
  "same_person",
  "same_kit",
  "same_footwear",
  "same_equipment",
  "same_lighting",
  "same_condition",
] as const;

export interface SetVerdict {
  verdict: "pass" | "fail";
  checks: (Check & { offending?: string[] })[];
  observations?: { footwear: string; equipment: string; kit: string };
  worstIssue: string;
}

const SET_SCHEMA = {
  type: "object",
  properties: {
    observations: {
      type: "object",
      properties: {
        footwear: { type: "string" },
        equipment: { type: "string" },
        kit: { type: "string" },
      },
      required: ["footwear", "equipment", "kit"],
    },
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", enum: [...SET_CHECK_IDS] },
          pass: { type: "boolean" },
          note: { type: "string" },
          // Which frames disagree, so the caller re-rolls those and not the whole set.
          offending: { type: "array", items: { type: "string" } },
        },
        required: ["id", "pass", "note"],
      },
    },
    worstIssue: { type: "string" },
  },
  required: ["observations", "checks", "worstIssue"],
};

export async function checkAthleteSet(opts: {
  athlete: Athlete;
  sport: Sport;
  /** In a fixed order; the labels are what the judge names when reporting a disagreement. */
  poses: { id: string; path: string }[];
}): Promise<SetVerdict> {
  const images = await Promise.all(opts.poses.map((p) => refFor(p.path, 640)));
  const labels = opts.poses.map((p, i) => `image ${i + 1} = ${p.id}`).join(", ");
  const prompt = [
    `These ${opts.poses.length} images are meant to be one photo shoot of ONE athlete on ONE`,
    `day: ${labels}.`,
    `Three of them are composited side by side onto a printed trading card and a poster, so`,
    `anything that changes between them reads as a mistake.`,
    ``,
    `FIRST describe, in observations, without judging — and describe each image separately so`,
    `differences become visible:`,
    `- footwear: the colour and style of the shoes in EACH image, one by one.`,
    `- equipment: the ball or implement in EACH image, one by one, including its colours.`,
    `- kit: the shirt, shorts and socks in EACH image, one by one — and for the shirt always`,
    `  state the sleeve length and the collar, because those change most easily.`,
    ``,
    `THEN answer each check. For any check that fails, list in "offending" the ids of the`,
    `frames that differ from the majority — those are the only ones worth regenerating.`,
    ``,
    `same_person — the same individual in every frame: same face, hair, build and age.`,
    `same_kit — identical shirt, shorts and socks in every frame: same colours, same design,`,
    `  same trim, same sock colour, and the SAME CUT. Compare the sleeve length deliberately —`,
    `  long sleeves in one frame and short in another is the same athlete in two different`,
    `  shirts and is a FAIL, as is a collar or piping that changes between frames.`,
    `same_footwear — identical shoes in every frame: same colour, same style. This is the one`,
    `  that fails most often, so compare them deliberately rather than at a glance.`,
    `same_equipment — the same ball or implement in every frame that contains one: same`,
    `  colours, same pattern. A white ball in one frame and a white-and-blue ball in another`,
    `  is a FAIL.`,
    `same_lighting — the same light in every frame: same direction, same hardness, same colour`,
    `  temperature, same backdrop tone.`,
    `same_condition — everything equally clean across the set. One dirty boot among clean ones`,
    `  is a FAIL.`,
    ``,
    `worstIssue: the single thing most worth fixing, in a sentence. "none" if the set agrees.`,
  ].join("\n");

  const raw = await generateJson<SetVerdict>({ prompt, images, schema: SET_SCHEMA });
  const byId = new Map(raw.checks.map((c) => [c.id, c]));
  const checks = SET_CHECK_IDS.map(
    (id) => byId.get(id) ?? { id, pass: false, note: "judge did not answer this check" },
  );
  return { ...raw, checks, verdict: checks.every((c) => c.pass) ? "pass" : "fail" };
}


/* ------------------------------------------------------------------------- *
 * THE KIT PLATE AUDIT
 *
 * The wardrobe anchor was the one artefact with no auditor, and it produced the worst single
 * frame of the whole pilot: a badge that was not the club's crest at all, carrying invented
 * lettering; flat fashion sneakers instead of soccer cleats; no socks and no ball in a layout
 * that lists both as mandatory. Every pose then inherits whatever that plate says, so an
 * unaudited plate poisons the entire set downstream.
 *
 * This runs FIRST, before the set audit and before any pose grading.
 * ------------------------------------------------------------------------- */

export const KIT_CHECK_IDS = [
  "all_items_present",
  // Graded only when the athlete's own kit photograph exists — filtered out of the verdict
  // otherwise, the same way `child_proportions` is for adults.
  "matches_kit_photo",
  "crest_correct",
  "no_league_mark",
  "no_text_anywhere",
  "no_branding",
  "footwear_correct_for_sport",
  "clean_and_new",
  "flat_lay",
] as const;

export interface KitVerdict {
  verdict: "pass" | "fail";
  checks: Check[];
  observations?: { items: string; badge: string; footwear: string };
  worstIssue: string;
}

const KIT_SCHEMA = {
  type: "object",
  properties: {
    observations: {
      type: "object",
      properties: { items: { type: "string" }, badge: { type: "string" }, footwear: { type: "string" } },
      required: ["items", "badge", "footwear"],
    },
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", enum: [...KIT_CHECK_IDS] },
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

/**
 * THE AUDITOR MUST SEE THE PHOTOGRAPH THE PLATE WAS COPIED FROM.
 *
 * It used to grade the flat lay against the spec TEXT and the crest artwork only, so it could
 * catch a missing sock and an invented swoosh and was structurally blind to the only question
 * that matters for a customer's own strip: does this garment match their actual kit? The
 * ice-hockey plate passed with a navy laced collar where the photograph has a red band, one
 * sleeve band where it has two, and the wrong number colour — and the customer, who simply
 * put the two images side by side, found all three in seconds. The judge could not, because
 * it was only ever given one of them.
 *
 * (The first attempt at this fix died half-applied in a batch-edit crash, and nothing
 * noticed: the option was silently ignored by tsx and the grade kept running without the
 * photo. Hence the runtime error that exposed it. Patches to a checker deserve the same
 * suspicion as frames.)
 */
export async function checkKitPlate(opts: {
  sport: Sport;
  platePath: string;
  crestPath?: string;
  /** The athlete's own kit photograph — the thing the plate is supposed to reproduce. */
  kitPhotoPath?: string;
  /** False for sports with no ball or implement at all — see hasImplement in kits.ts. */
  hasImplement?: boolean;
  /** False for sports performed barefoot — see hasFootwear in kits.ts. */
  hasFootwear?: boolean;
  /** The frozen spec text, so the plate is graded against the decisions it was given. */
  spec?: string;
  /**
   * TRUE when the crest is the customer's own uploaded artwork rather than one of the
   * wordless demo marks. Real clubs put their name in their badge, so `no_text_anywhere`
   * failed the first real order for a crest that is CORRECT — and would fail most of them.
   * The rule it enforces (invented lettering is the pipeline's most reliable defect) is
   * about text the MODEL made up; text that arrived in the customer's file is evidence the
   * badge was reproduced, not a defect.
   */
  crestSupplied?: boolean;
  /**
   * TRUE when the athlete's own photographs are attached to the plate prompt. Their kit is
   * then a thing to REPRODUCE rather than invent, and `no_text_anywhere` — written for a
   * roster where every letterform would be made up — stops applying to what they show.
   * Order 03's plate was failed for carrying "MadLamb", which is what is on his shirt.
   */
  hasKitPhotos?: boolean;
}): Promise<KitVerdict> {
  const images = [await refFor(opts.platePath, 900)];
  if (opts.crestPath) images.push(await refFor(opts.crestPath, 512));
  const hasCrest = Boolean(opts.crestPath);
  const hasPhoto = Boolean(opts.kitPhotoPath);
  if (opts.kitPhotoPath) images.push(await refFor(opts.kitPhotoPath, 1024));
  const photoIndex = images.length;

  const prompt = [
    `Image 1 is a flat lay of a complete ${opts.sport.name} kit.`,
    hasCrest ? `Image 2 is the club crest that is supposed to be printed on that shirt.` : ``,
    hasPhoto
      ? `Image ${photoIndex} is a photograph of the athlete WEARING their real kit — the`
        + ` garments image 1 is supposed to reproduce.`
      : ``,
    ``,
    `FIRST describe, without judging:`,
    `- items: every separate item you can see in image 1, listed.`,
    `- badge: whatever is printed on the shirt — its shape, what is inside it, its colours, and`,
    `  any lettering at all, quoted exactly. Say "none" if the shirt is plain. Also name any`,
    `  manufacturer's logo you can see anywhere in the frame, on any item.`,
    `- footwear: the shoes — their colour, their shape, and what the SOLE looks like.`,
    ``,
    ...(opts.spec ? [`The kit was specified as follows:`, opts.spec, ``] : []),
    `THEN answer every check. Fail anything you are not sure about.`,
    ``,
    ...(hasPhoto
      ? [
          `matches_kit_photo — compare image 1 against image ${photoIndex} ITEM BY ITEM and`,
          `  answer for each before you decide: the COLLAR (its shape and its colour), the`,
          `  SLEEVES (any band or trim, how many, how wide, where they sit), the placket, the`,
          `  HEM, the CREST (its size, its colour treatment and WHICH SIDE of the chest it`,
          `  sits on), the NUMBER (its colour, its style and every place it appears, including`,
          `  which side), the pants or shorts — INCLUDING THEIR LENGTH: full-length trousers`,
          `  returned as shorts, or the reverse, is a FAIL and it has already slipped past this`,
          `  check once — the belt, the footwear and any headwear. A`,
          `  difference in ANY of them is a FAIL — say which one in the note. Ignore lighting,`,
          `  angle, wear and dirt; ignore items the photograph simply does not show.`,
        ]
      : []),
    opts.sport.onePiece
      ? `all_items_present — are ALL of these in frame and fully visible: the ONE-PIECE garment`
        + ` (${opts.sport.onePiece.split(" — ")[0]})${opts.hasFootwear === false ? "" : `, both socks, both shoes`}${opts.hasImplement === false ? "" : `, and the ball or implement of ${opts.sport.name}`}?`
        + (opts.hasFootwear === false ? ` This sport is performed BAREFOOT: there are no socks and no shoes to lay out, and a shoe in this frame would be a FAIL rather than a missing item.` : ``)
        + ` A separate shirt and separate shorts in place of the one-piece garment is a FAIL, and`
        + ` so is a missing item — the poses read the wardrobe from this image, so anything absent`
        + ` gets invented.`
      : `all_items_present — are ALL of these in frame and fully visible: shirt, shorts`
        + `${opts.hasFootwear === false ? "" : `, both socks, both shoes`}${opts.hasImplement === false ? "" : `, and the ball or implement of ${opts.sport.name}`}?`
        + (opts.hasFootwear === false ? ` This sport is performed BAREFOOT: there are no socks and no shoes to lay out, and a shoe in this frame would be a FAIL rather than a missing item.` : ``)
        + ` A missing item is a FAIL — the poses read the wardrobe from this image, so anything`
        + ` absent gets invented.`,
    // THE SPORT'S OWN EXTRA ITEMS WERE NEVER GRADED. football's plate is specified to carry
    // the helmet AND the shoulder pads; the pads were missing from it and this check passed
    // the plate anyway, because it only ever asked about the five generic items. The poses
    // then had no pads to copy and drew an unpadded torso in all four frames. Whatever
    // `plateItems` names is exactly as required as the shirt.
    ...(opts.sport.plateItems
      ? [`  This sport's plate must ALSO show ${opts.sport.plateItems} — a separate, fully`,
         `  visible item in the frame. Missing or hidden under another garment is a FAIL.`]
      : []),
    // Only for sports that HAVE footwear — see hasFootwear in kits.ts.
    ...(opts.hasFootwear === false
      ? []
      : [`  The two shoes must be shown from DIFFERENT VIEWS: one from directly above and one turned`,
         `  onto its side showing its profile and outsole. Both from above is a FAIL — the poses then`,
         `  have to guess the profile, and a guessed boot is how a set stops matching itself.`]),
    `  DUPLICATES ARE ALSO A FAIL: exactly ONE of each garment the sport actually has. A second`,
    `  shirt laid under the first, or a spare pair of shorts, makes the plate ambiguous about`,
    `  which garment the poses should copy.`,
    hasCrest
      ? `crest_correct — is the badge on the shirt THE SAME MARK as image 2: same outline shape,`
        + `  same figure inside? A different badge, a real-world club or national crest, or an`
        + `  invented one is a FAIL no matter how good it looks.`
        + (hasPhoto
          ? ` COLOURS: real clubs often print their crest on a garment in a single colour, so`
            + ` judge the colour treatment against the kit PHOTOGRAPH (image ${photoIndex}), not`
            + ` against the artwork file — if the athlete's own shirt carries a one-colour`
            + ` application, a one-colour application in the same tones is CORRECT, and`
            + ` reproducing the file's full colours would be the error.`
          : ` COLOURS: identical to image 2.`)
      : `crest_correct — the shirt must be PLAIN. Any badge, crest, monogram or mark at all is a`
        + `  FAIL: none was supplied, and inventing one is the failure being guarded against.`,
    `no_league_mark — is there any real-world league, federation or professional club emblem`,
    `  anywhere in the frame — an NFL shield, an NBA, MLB, NHL, FIFA, UEFA, Premier League,`,
    `  NCAA or Olympic mark, a national federation badge, a real club's crest — on the shirt,`,
    `  the collar, the helmet, the pads, a sock, the ball or a shoe? Any is a FAIL, however`,
    `  small. These are somebody else's registered marks and this kit is not theirs.`,
    // THE SAME CONTRADICTION THE PLATE PROMPT ALREADY FIXED, left standing in the judge. The
    // prompt says "the squad number appears ONLY if the kit description calls for it"; this
    // check said any number at all is a FAIL, so the first ice-hockey plate was failed for
    // carrying the 17 its own specification demands on both shoulders. A rubric that grades
    // against a different document than the generator was given is the churn README §6 warns
    // about — and it is exactly what the football set was previously failed for.
    // THE EXCEPTION COUNT WAS A LIE AND THE JUDGE BELIEVED IT. This block said "TWO EXCEPTIONS"
    // and then listed four, so a plate carrying exactly the lettering its own photographs show
    // was failed three runs in a row. A prompt that contradicts itself is decided by whichever
    // half the model trusts, and here it trusted the number.
    ...(opts.hasKitPhotos
      ? [`no_text_anywhere — THE ATHLETE'S OWN PHOTOGRAPHS ARE ATTACHED, so this check is not`,
         `  "is there text" but "does the text match the photographs". Lettering that appears on`,
         `  the kit in those photographs — the club name across the chest, the squad number, a`,
         `  maker's wordmark — is CORRECT and PASSES, spelled and placed as it is there. FAIL only`,
         `  text that appears in NONE of the photographs: an invented sponsor, a slogan, a second`,
         `  number, a care label, a woven neck label, a watermark. Misspelled versions of real`,
         `  lettering fail too — "XOND" where the garment says RIND is invented text.`]
      : [
    `no_text_anywhere — is there any lettering, any word, any club name, any player name, any`,
    `  manufacturer name, any label, on ANY item? Even small or partly legible. Any is a FAIL.`,
    `  TWO EXCEPTIONS, both only where the specification above allows them. First, the SQUAD`,
    `  NUMBER: if the kit description calls for a number on the chest, the back or the`,
    `  shoulders, that number in that place is CORRECT and passes. Second, a MANUFACTURER'S`,
    `  WORDMARK on an item the specification says the athlete's own equipment really carries —`,
    `  that is their own gear appearing as it is, and it passes on that item and no other.`,
    ]),
    ...(opts.crestSupplied
      ? [`  FOURTH EXCEPTION: the club crest in image 2 is the customer's own`,
         `  uploaded artwork and it CARRIES LETTERING. Any words INSIDE the crest are correct and`,
         `  pass — judge them under crest_correct instead, where the question is whether they`,
         `  match image 2. Only lettering OUTSIDE the crest fails this check.`]
      : []),
    `  Any OTHER number, word or mark, anywhere else, fails.`,
    `no_branding — this is about INVENTED branding, not branding as such. An item the`,
    `  specification describes from the athlete's own photographs may carry the manufacturer's`,
    `  mark it really has; that is their clothing. FAIL only when a brand device — a swoosh,`,
    `  three stripes, a cat, a jumpman, a trefoil, a wordmark — appears on an item the`,
    `  specification says came from the sport DEFAULT, because nobody supplied that garment and`,
    `  the mark was fabricated. These carry no letters, so the text check above misses them.`,
    `footwear_correct_for_sport — are these genuinely ${opts.sport.name} shoes, judged by the`,
    `  SOLE? Flat casual sneakers or trainers where the sport needs a studded, spiked or`,
    `  sport-specific outsole is a FAIL even when the colour is right.`,
    `clean_and_new — is everything immaculate: no dirt, no stains, no scuffing, no wear?`,
    `flat_lay — shot from directly overhead on a plain surface, items laid flat and separate,`,
    `  with no person, no mannequin, no hanger and no props? If the kit includes long trousers,`,
    `  they must be laid at FULL LENGTH with both legs extended straight and the hems visible —`,
    `  pants folded or arranged to read as knee-length are a FAIL, because the poses copy the`,
    `  garment's length from this image.`,
    ``,
    `worstIssue: the single thing most worth fixing, in a sentence. "none" if it all passes.`,
  ].filter(Boolean).join("\n");

  const raw = await generateJson<KitVerdict>({ prompt, images, schema: KIT_SCHEMA });
  const byId = new Map(raw.checks.map((c) => [c.id, c]));
  const wanted = KIT_CHECK_IDS.filter((id) => id !== "matches_kit_photo" || hasPhoto);
  const checks = wanted.map(
    (id) => byId.get(id) ?? { id, pass: false, note: "judge did not answer this check" },
  );
  return { ...raw, checks, verdict: checks.every((c) => c.pass) ? "pass" : "fail" };
}
