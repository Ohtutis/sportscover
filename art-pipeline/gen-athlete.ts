#!/usr/bin/env tsx
/**
 * Generate an athlete: club crest -> identity plate -> the four poses.
 *
 *   npx tsx art-pipeline/gen-athlete.ts --athlete ice-hockey --stage crest
 *   npx tsx art-pipeline/gen-athlete.ts --athlete ice-hockey --stage identity
 *   npx tsx art-pipeline/gen-athlete.ts --athlete ice-hockey --stage poses
 *   npx tsx art-pipeline/gen-athlete.ts --athlete ice-hockey --stage all --dry-run
 *
 * THE CUSTOMER PATH — the same command with two extra steps:
 *
 *   --stage snapshots                    generate the ordinary "before" phone photos
 *   --stage identity --from-photos <dir> build the plate FROM photographs, not from words
 *
 * That second one IS the per-order tool. For a real order `<dir>` holds what the customer
 * uploaded; for the demo age ladder it holds the snapshots stage's output. Everything after
 * the plate — poses, cutout, both rubrics — is byte for byte the same code either way, which
 * is the entire reason the plate exists as a separate stage.
 *
 * THE STAGES ARE SEPARATE ON PURPOSE. The identity plate is this layer's version of the
 * empty set plate (README section 0): approve it ONCE, then every pose references it and
 * cannot drift. Running --stage all end to end without looking at the plate throws away
 * the only control there is over "the same face four times".
 *
 * Re-runs are free — each PNG has a .json sidecar with the prompt hash, same contract as
 * gen-backgrounds.ts. Output:
 *   out/crests/<crest>.png
 *   out/athletes/<athlete>/_identity.png
 *   out/athletes/<athlete>/<pose>.png
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ATHLETES, athleteBySlug, type Athlete } from "./athletes.js";
import { crestBySlug } from "./crests.js";
import { sportBySlug } from "./sports.js";
import { posesFor } from "./poses.js";
import { crestPrompt, identityBackPrompt, identityBodyPrompt, identityFromPhotosPrompt, identityPlatePrompt, kitPlateBackPrompt, kitPlatePrompt, posePrompt, snapshotPrompt, snapshotWear } from "./prompts.js";
import { generateImage, loadEnv, imageModel } from "./lib/gemini.js";
import { planLine } from "./lib/budget.js";
import { isApproved } from "./approved.js";
import { roleFile } from "./roles.js";
import { hasFootwear, hasImplement } from "./kits.js";
import { checkKitPlate } from "./check-athlete.js";
import { bestPortrait, buildText, hairText, specCrestPlacement, specHair, specText } from "./spec.js";
import { revisionText } from "./revise.js";
import { REF_PX, bodyRefFor, faceRefFor, refFor, contactSheet } from "./lib/img.js";

loadEnv();

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const OUT = "art-pipeline/out";
const force = has("force");
const dry = has("dry-run");
const stage = flag("stage", "all");
const size = flag("size", "2K");
const fromPhotos = flag("from-photos");
const snapshotCount = Number(flag("snapshots", "4"));
/**
 * How long to keep waiting on a busy key. The client's default is 7 tries, which with the
 * 60 s backoff cap is about three minutes of patience — and that is guaranteed to lose
 * whenever another session is running a background sweep on the same express key, because
 * a sweep holds it for half an hour. Three athlete runs were lost that way on 2026-08-20,
 * every image returning 429 RESOURCE_EXHAUSTED while the competing sweep landed its frames
 * one by one. Waiting costs nothing; giving up costs the whole run. 30 tries is roughly
 * half an hour of patience.
 */
const retries = Number(flag("retries", "30"));
/**
 * A photograph showing the athlete's REAL team kit, passed to every pose as a third
 * reference. Defaults to `before/kit.png` when it exists.
 *
 * HOW A REAL ORDER KNOWS WHICH PHOTO THIS IS: ask. Detecting "which of these four shows a
 * team uniform" is a vision-model call that costs money and can be wrong; a checkbox on the
 * order form — "which photo shows their team kit?" — is one click for the customer and
 * cannot be wrong. Do not build the clever version of this.
 */
const kitPhotoFlag = flag("kit-photo");
/**
 * Generate ONE pose instead of all four. Needed for the frame-at-a-time workflow: show it,
 * get it accepted or rejected, and only then move on. Regenerating four frames to fix one is
 * how approved work gets destroyed.
 */
const onlyPose = flag("pose");
/**
 * Build ONE named frame out of whatever the stage would build — `--frame _identity` on the
 * identity stage skips the from-behind plate. The retry loop in best-plate.ts needs this: it
 * re-rolls the front plate until it clears a threshold, and paying for the back plate on every
 * attempt would double the cost of the search for nothing.
 */
const onlyFrame = flag("frame");
/** Measured default for the identity plates — see Job.size. Overridable so it stays testable. */
const identitySize = flag("identity-size", "1K");
const MODEL = imageModel();

const who = flag("athlete");
const athletes: Athlete[] =
  !who || who === "all"
    ? ATHLETES.filter((a) => !a.order)      // real orders are never part of a sweep
    : who.split(",").map((s) => {
        const a = athleteBySlug(s.trim());
        if (!a) throw new Error(`unknown athlete "${s.trim()}" — have: ${ATHLETES.map((x) => x.slug).join(", ")}`);
        return a;
      });

interface Job {
  tag: string;
  out: string;
  prompt: string;
  refs: string[];
  aspect: string;
  hash: string;
  /** Crop these references to the head before sending — see faceRefFor. */
  crops?: Map<string, number[]>;
  /** ...and cut the head OFF these ones — see bodyRefFor. */
  bodyCrop?: Map<string, number[]>;
  /**
   * Per-frame resolution, defaulting to the run's --size.
   *
   * THE IDENTITY PLATES WENT TO 1K AND CAME BACK, same day, and the round trip is the lesson.
   *
   * The argument for 1K was measured and correct AT THE TIME: `refFor` capped every reference
   * at 1024 px, so a 2K plate reached the pose model as 1024x765 and the extra pixels never
   * left this machine. Then REF_PX moved to 2048 — and `resize` carries `withoutEnlargement`,
   * so a 1K plate does not grow to meet it. The pose was being handed 1200 px of anchor when
   * it could have had 2048. The saving was EUR 0.07 and the cost was the anchor.
   *
   * AND THEN THE MEASUREMENT DISAGREED, which is why the plates are 1K again. Same model, same
   * photographs, same anchor, same head crops — only the plate's own resolution moved:
   *
   *   plate at 1K   0.807   0.763
   *   plate at 2K   0.684   0.700
   *
   * The reasoning above was sound and the result went the other way, so the result wins. Two
   * rolls a side is thin — treat 1K as the measured default, not a settled fact, and re-run
   * `art:best` on both if it ever matters enough to be sure.
   *
   * A decision that depends on another constant still has to be revisited when that constant
   * moves; both are named here so the next person sees the link: REF_PX in lib/img.ts.
   *
   * The kit plates are 2K for a different reason: they are read at 4x for swooshes and crest
   * defects (README section 40), and 1K would hide exactly what that audit exists to find.
   */
  size?: string;
}

/**
 * The cache key, and it must include what the references CONTAIN, not just where they live.
 *
 * It used to hash the reference PATHS. So when the crest artwork was corrected, the kit
 * plate's key did not move — same path, same prompt — and the pipeline reported it cached and
 * kept the plate built from the old crest. The only way to push a change downstream was
 * `--force`, which rebuilds everything whether it was affected or not, and that is exactly the
 * waste it is supposed to prevent.
 *
 * Hashing the bytes of each reference makes the dependency real: correct the crest and the
 * kit plate rebuilds, which changes the kit plate, which rebuilds the poses — and nothing
 * else moves. `--force` goes back to being a last resort rather than routine.
 */
const refDigest = (path: string) => {
  try {
    return createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 12);
  } catch {
    return "missing";
  }
};
// EVERYTHING THAT CHANGES THE PICTURE HAS TO BE IN THE KEY. Two things were missing and both
// were found the same day, one after the other:
//
//   - the RESOLUTION, and it must be the job's own rather than the run's `--size`, or a cached
//     2K plate satisfies a job that asked for 1K and the pipeline reports it up to date;
//   - REF_PX, the size references are downsized to before sending. `refDigest` hashes the file
//     ON DISK, which does not move when the reference is sent four times larger — so the first
//     attempt to test 2048 px references returned "0 ok, 0 failed" and measured nothing.
const hashOf = (prompt: string, refs: string[], jobSize = size) =>
  createHash("sha256")
    .update(`${MODEL}\n${jobSize}\n${REF_PX}\n${refs.map((r) => `${r}@${refDigest(r)}`).join("|")}\n${prompt}`)
    .digest("hex")
    .slice(0, 16);

/**
 * The photographs intake actually cleared, when it has run on this folder.
 *
 * Without this the gate is decorative: `art:intake` rejected the sunglasses shot on Order 01
 * and the identity stage read the same directory straight off disk and fed it in anyway. A
 * verdict nothing downstream reads is not a verdict.
 */
function usablePhotos(dir: string): string[] {
  const all = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort().map((f) => join(dir, f));
  const verdict = join(dir, "_intake.json");
  if (!existsSync(verdict)) return all;
  try {
    const j = JSON.parse(readFileSync(verdict, "utf8")) as { usable?: string[] };
    if (!j.usable?.length) return all;
    // MATCH ON THE FILENAME, NOT THE PATH. The verdict stores the paths as they were when
    // `art:intake` ran, and an order folder that moves — or is reached through a symlink, which
    // is how a per-order directory lives under `orders/<etsy id>/` — makes every stored path a
    // miss. The filter then kept nothing, fell back to `all`, and quietly fed the pipeline the
    // photographs intake had REJECTED while printing "using 0 of 5". A silent fallback to the
    // unfiltered set is the one behaviour this function exists to prevent, so it matches on
    // basenames, which move with the file.
    const ok = new Set(j.usable.map((f) => f.split("/").pop()!));
    const kept = all.filter((f) => ok.has(f.split("/").pop()!));
    const dropped = all.length - kept.length;
    if (dropped) console.log(`intake   ${dir}: using ${kept.length} of ${all.length} photos (${dropped} rejected)`);
    return kept.length ? kept : all;
  } catch {
    return all;
  }
}

/**
 * Face boxes intake measured, keyed by photo path — so the identity stage can send a head
 * crop instead of a shrunken room. Empty when intake has not run, and then nothing changes.
 */
/** The full-length photograph intake kept for the body panel, if the set has one. */
function bodyPick(dir: string): { path: string; bbox?: number[] } | undefined {
  const verdict = join(dir, "_intake.json");
  if (!existsSync(verdict)) return undefined;
  try {
    const j = JSON.parse(readFileSync(verdict, "utf8")) as { bodyRefs?: { path: string; bbox?: number[] }[] };
    const pick = (j.bodyRefs ?? []).find((b) => b?.path && existsSync(b.path));
    if (pick) console.log(`body     ${pick.path.split("/").pop()} attached as the full-length reference (head cropped off)`);
    return pick;
  } catch {
    return undefined;
  }
}

function faceBoxes(dir: string): Map<string, number[]> {
  const out = new Map<string, number[]>();
  const verdict = join(dir, "_intake.json");
  if (!existsSync(verdict)) return out;
  try {
    const j = JSON.parse(readFileSync(verdict, "utf8")) as { faces?: { path: string; bbox?: number[] }[] };
    for (const f of j.faces ?? []) if (f.bbox?.length === 4) out.set(f.path, f.bbox);
  } catch { /* no boxes, no crops */ }
  return out;
}

const jobs: Job[] = [];
const wantCrest = stage === "crest" || stage === "all";
const wantSnapshots = stage === "snapshots";
const wantIdentity = stage === "identity" || stage === "all";
const wantKit = stage === "kit" || stage === "all";
const wantPoses = stage === "poses" || stage === "all";

for (const a of athletes) {
  const sport = sportBySlug(a.sport);
  if (!sport) throw new Error(`athlete ${a.slug} points at unknown sport "${a.sport}"`);
  // AN ORDER WITH NO LOGO IS NORMAL, NOT AN ERROR. crests.ts already says so — "if the
  // customer did not upload a logo the shirt ships plain, a guessed badge is worse than
  // none" — but the code still demanded one. An EMPTY crest slug now means exactly that. A
  // non-empty slug that does not resolve is still a mistake worth stopping for.
  const crest = a.crest ? crestBySlug(a.crest) : undefined;
  if (a.crest && !crest) throw new Error(`athlete ${a.slug} points at unknown crest "${a.crest}"`);

  // A path that cannot exist, so every `existsSync(crestOut)` below answers "no badge".
  const crestOut = crest ? join(OUT, "crests", `${crest.slug}.png`) : join(OUT, "crests", "__none__.png");
  const identityOut = join(OUT, "athletes", a.slug, "_identity.png");
  const identityBackOut = join(OUT, "athletes", a.slug, "_identity-back.png");
  const kitPlateOut = join(OUT, "athletes", a.slug, "_kit.png");
  const kitBackOut = join(OUT, "athletes", a.slug, "_kit-back.png");
  const kitPhoto = kitPhotoFlag || join(OUT, "athletes", a.slug, "before", "kit.png");
  // The frozen production decisions. Absent until `resolve-spec.ts` has run.
  const specPath = join(OUT, "athletes", a.slug, "_spec.json");
  const spec = existsSync(specPath) ? specText(specPath) : undefined;
  // The family's chosen likeness, attached to the hero only — see posePrompt's portraitRef.
  const portrait = existsSync(specPath) ? bestPortrait(specPath) : null;
  const portraitPath = portrait ? join(OUT, "athletes", a.slug, "before", portrait) : null;
  const hair = existsSync(specPath) ? hairText(specPath) : undefined;
  const build = existsSync(specPath) ? buildText(specPath) : undefined;
  // Where the badge sits, when the spec states it outright. The kit plate and every pose read
  // the SAME sentence — the plate used to hardcode the left chest while the spec placed it
  // centred, and the set then split between the two.
  const crestPlacement = existsSync(specPath) ? specCrestPlacement(specPath) : "";

  if (wantCrest && !crest) {
    console.log(`crest    ${a.slug}: no club badge on this order — the kit ships plain`);
  } else if (wantCrest && crest!.supplied) {
    // The customer's own artwork. Generating over it is not a re-roll, it is losing their file.
    if (!existsSync(crestOut)) throw new Error(`crest "${crest!.slug}" is marked supplied but ${crestOut} is missing — put the customer's logo there`);
    console.log(`crest    ${crest!.slug}: supplied by the customer, not generated`);
  } else if (wantCrest) {
    const prompt = crestPrompt(crest!);
    jobs.push({ tag: `crest/${crest!.slug}`, out: crestOut, prompt, refs: [], aspect: "1:1", hash: hashOf(prompt, []) });
  }
  if (wantSnapshots) {
    const first = join(OUT, "athletes", a.slug, "before", "photo1.png");
    // THE FACE ANCHOR IS A PORTRAIT, SO IT CARRIES NO BODY.
    // Snapshots 2-4 referenced photo1 and came back as one person with four different builds:
    // photo1 is a head-and-shoulders frame, so the face propagates and everything below the
    // collar is invented afresh each time. The match frame is the first full-length view, so
    // from the third snapshot on it becomes a second anchor — face from one, body from the
    // other. Same rule as everywhere else: what must not drift is carried by an image.
    const second = join(OUT, "athletes", a.slug, "before", "photo2.png");
    for (let i = 0; i < snapshotCount; i++) {
      // The scenario itself decides what they are wearing — home, match kit, training gear,
      // everyday. Scenario 2 is the match, and it is the one a real customer's photo would
      // show their actual team kit in, which the per-order tool has to be able to keep.
      //
      // Every snapshot after the first references the first, so the set is one child rather
      // than four. Jobs run strictly in order, so photo1 is on disk before photo2 needs it.
      const anchored = i > 0;
      const bodyAnchored = i > 1 && existsSync(second);
      const refs = anchored ? (bodyAnchored ? [first, second] : [first]) : [];
      // The match frame wears the club's real badge, so it is attached HERE rather than three
      // stages later at the kit plate — see snapshotPrompt. It goes last in the list, so the
      // face and body anchors keep the image numbers the prompt already names.
      const wantsCrest = snapshotWear(a.slug, i) === "kit" && existsSync(crestOut);
      if (wantsCrest) refs.push(crestOut);
      const prompt = snapshotPrompt(a, sport, i, anchored, bodyAnchored, wantsCrest ? refs.length : null);
      jobs.push({
        tag: `${a.slug}/before/photo${i + 1}`,
        out: join(OUT, "athletes", a.slug, "before", `photo${i + 1}.png`),
        prompt, refs, aspect: "3:4", hash: hashOf(prompt, refs),
      });
    }
  }

  if (wantIdentity) {
    // Two ways to build the anchor. From words for the sport-coverage roster, where no
    // photographs exist. From photographs for the age ladder and for every real order —
    // and that second path is the one the product actually runs on, so prefer exercising it.
    const dir = fromPhotos === "auto" ? join(OUT, "athletes", a.slug, "before") : fromPhotos;
    const anchors = dir && existsSync(dir) ? usablePhotos(dir) : [];
    // The full-length reference goes LAST, so the anchors keep the image numbers the prompt
    // already names, and the body sentence can point at one index. See bodyRefs in intake.ts.
    // A NAMED body photograph outranks intake's sharpness pick: intake chooses the sharpest of
    // the rejects, which is a good guess and still only a guess about which frame shows the
    // whole person standing. roles.ts lets the customer say it outright.
    const namedBody = dir ? roleFile(readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort().map((f) => join(dir, f)), "body") : undefined;
    const bodyRef = namedBody
      ? { path: namedBody, bbox: (dir ? bodyPick(dir) : undefined)?.path === namedBody ? bodyPick(dir!)?.bbox : undefined }
      : dir ? bodyPick(dir) : undefined;
    // THE FACE PLATE MUST NOT SEE THE BODY PHOTOGRAPH. It is there for proportions and intake
    // usually REJECTED it as a face anchor — Etsy order 4164205493's is a 52 px face in a
    // screenshot. Attached to a face-only sheet it is a fifth "photograph of this person" whose
    // face carries nothing, and the bodyIndex sentence that comes with it asks for a frame 3
    // this sheet does not have. That combination — a weak reference plus two contradictory
    // frame counts — returned a DIFFERENT WOMAN, scoring -0.020 against the customer's own
    // photographs. One job, one set of references, one frame count.
    const faceOnly = onlyFrame === "_identity-face";
    const photos = bodyRef && !faceOnly ? [...anchors, bodyRef.path] : anchors;
    if (dir && !photos.length) throw new Error(`--from-photos ${dir}: no images there — run --stage snapshots first`);

    // ONE DESCRIPTION OF THE HAIR FOR BOTH HALVES OF THE PLATE. The front read the frozen
    // spec and the back read the `athletes.ts` record, so on soccer-age-22 the front came
    // back with braids falling loose from the bun and the back with everything tied up —
    // two hairstyles in the one anchor the poses are drawn from, and the poses then flipped
    // between them. The spec is the frozen decision; the record is only the fallback for a
    // roster athlete who never had photographs.
    const specHairText = existsSync(specPath) ? specHair(specPath) : undefined;
    const specBuildText = existsSync(specPath)
      ? (JSON.parse(readFileSync(specPath, "utf8")).resolved?.find((r: { item: string }) => r.item === "build")?.value || undefined)
      : undefined;

    // NAMED ROLES BEAT GUESSES. When the customer has labelled their photographs — "Hero
    // portrait", "Hero side", "body" — those files decide which frame is built from what. A
    // folder with no named roles falls through to exactly the old behaviour. See roles.ts.
    const sidePhoto = roleFile(photos, "side");
    const sideIdx = sidePhoto ? photos.indexOf(sidePhoto) + 1 : undefined;
    const prompt = (photos.length
      ? identityFromPhotosPrompt({ photoCount: photos.length, ageYears: a.ageYears, presents: a.presents, hair: specHairText, build: specBuildText, bodyIndex: bodyRef && !faceOnly ? photos.length : undefined,
          sideIndex: sideIdx, part: onlyFrame === "_identity-face" ? "face" : undefined,
          // The customer's chosen likeness, named to the model rather than averaged away. Matched
          // on basename for the same reason the intake filter is — the verdict and the working
          // copy can sit in different folders. 1-based: the model counts attachments from one.
          portraitIndex: (() => {
            const named = roleFile(photos, "portrait");
            if (named) return photos.indexOf(named) + 1;
            const pick = portrait ? photos.findIndex((f) => f.split("/").pop() === portrait.split("/").pop()) : -1;
            return pick >= 0 ? pick + 1 : undefined;
          })() })
      : identityPlatePrompt(a)) + revisionText(a.slug, "identity");
    const identityFacePath = join(OUT, "athletes", a.slug, "_identity-face.png");
    jobs.push({
      tag: `${a.slug}/${onlyFrame === "_identity-face" ? "_identity-face" : "_identity"}`,
      out: onlyFrame === "_identity-face" ? identityFacePath : identityOut, prompt, refs: photos, size: identitySize,
      aspect: "4:3", hash: hashOf(prompt, photos, identitySize), crops: dir ? faceBoxes(dir) : undefined,
      bodyCrop: bodyRef?.bbox ? new Map([[bodyRef.path, bodyRef.bbox]]) : undefined,
    });

    // THE BODY PANEL IS ITS OWN FRAME — see identityBodyPrompt for the measurement that
    // justifies it. It references the APPROVED face plate, so it may only run once that plate
    // exists; `--frame _identity-body` is how it is asked for on its own.
    const identityBodyOut = join(OUT, "athletes", a.slug, "_identity-body.png");
    const bodyPrompt = identityBodyPrompt({
      ageYears: a.ageYears, presents: a.presents, hair: specHairText || a.hair,
      build: specBuildText || a.build, hasBodyPhoto: Boolean(bodyRef),
    });
    // Reference the FACE-ONLY plate when one exists. Handing the body job the full three-panel
    // sheet hands it the old body panel too, and the model copies what it is shown — which is
    // the thing this split exists to stop.
    const identityFaceOut = join(OUT, "athletes", a.slug, "_identity-face.png");
    const bodyRefs = [existsSync(identityFaceOut) ? identityFaceOut : identityOut, ...(bodyRef ? [bodyRef.path] : [])];
    // THE BODY PHOTOGRAPH GOES IN WHOLE HERE — no head crop.
    //
    // Cropping the head off is right for the three-panel plate, where that photograph sits
    // beside the face frames and a second face would compete with them. It is exactly wrong
    // for a dedicated body frame: height and the head-to-body ratio are the two things this
    // frame exists to copy, and NEITHER can be read from a picture with the head cut off. The
    // model was left to invent the one measurement it had been asked to reproduce, and did.
    // The face cannot leak in from it — image 1 is the approved face and the prompt says in as
    // many words that the face comes from image 1 and nothing else.
    jobs.push({
      tag: `${a.slug}/_identity-body`, out: identityBodyOut, prompt: bodyPrompt, refs: bodyRefs,
      size: identitySize, aspect: "9:16", hash: hashOf(bodyPrompt, bodyRefs, identitySize),
    });

    // ...and the from-behind plate, which references the front one. Jobs run in order, so
    // the front plate is on disk by the time this needs it. See identityBackPrompt.
    const backPrompt = identityBackPrompt({ ...a, hair: specHairText || a.hair, build: specBuildText || a.build });
    jobs.push({
      tag: `${a.slug}/_identity-back`, out: identityBackOut, prompt: backPrompt, size: identitySize,
      refs: [identityOut], aspect: "4:3", hash: hashOf(backPrompt, [identityOut], identitySize),
    });
  }
  if (wantKit) {
    // The wardrobe's anchor, and it sees ALL the customer's photographs rather than one.
    //
    // WHY ALL OF THEM: the athlete appears in different kit and different boots across a set —
    // black-and-orange in one frame, white in another — and with a single photo attached the
    // model cannot choose, so it picks arbitrarily and the choice changes every run. Given the
    // whole set it can weigh the evidence per item: take what is clearly visible, fall back to
    // the sport default for anything unclear or contradicted, and never invent.
    const beforeDir = join(OUT, "athletes", a.slug, "before");
    const photos = existsSync(beforeDir)
      ? usablePhotos(beforeDir).filter((f) => !/\/kit\.[^/]+$/i.test(f))
      : [];
    // No crest is a legitimate outcome, not an error: if the customer did not upload a logo,
    // or it is unclear, the shirt ships plain. A guessed badge is worse than none.
    const hasCrest = existsSync(crestOut);
    if (!spec) console.log(`WARN     ${a.slug}: no _spec.json — run resolve-spec.ts first, or the wardrobe is decided afresh every run`);
    // The match frame is the one a real customer would tick as "this photo shows their team
    // kit", and it is the same frame the crest was applied to. It goes FIRST among the
    // photographs so the prompt can name it, and it carries the garment's appearance.
    const kitFrame = photos.find((f) => /photo2\./i.test(f));
    const ordered = kitFrame ? [kitFrame, ...photos.filter((f) => f !== kitFrame)] : photos;
    const kitPhotoIndex = kitFrame ? (hasCrest ? 2 : 1) : undefined;
    /**
     * CLOSE CROPS OF THE SMALL MARKS, if the order has any: `before/kit-details/`.
     *
     * The chest wordmark copied correctly and the maker's mark on the shorts came back as
     * "XOND" — not because the evidence was missing, but because the whole frame was downsized
     * to REF_PX and a few millimetres of embroidery became a few pixels. Same fix as the face:
     * crop it and send it big. Anything dropped in that folder is attached at full reference
     * size and named in the prompt as an exact reference.
     */
    const detailDir = join(beforeDir, "kit-details");
    const details = existsSync(detailDir)
      ? readdirSync(detailDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort().map((f) => join(detailDir, f))
      : [];
    if (details.length) console.log(`details  ${details.length} close crops attached: ${details.map((d) => d.split("/").pop()).join(", ")}`);
    const prompt = kitPlatePrompt(a, sport, { photoCount: photos.length, hasCrest, spec, kitPhotoIndex, crestPlacement, detailNames: details.map((d) => d.split("/").pop()!.replace(/\.[^.]+$/, "").replace(/-/g, " ")) }) + revisionText(a.slug, "kit");
    const refs = [...(hasCrest ? [crestOut, ...ordered] : ordered), ...details];
    jobs.push({
      tag: `${a.slug}/_kit`, out: kitPlateOut, prompt, refs,
      aspect: "1:1", hash: hashOf(prompt, refs),
    });

    // ...and the same kit from behind, which the from-behind pose reads instead of inventing
    // the back of the shirt for itself. Jobs run in order, so the front plate is on disk by
    // the time this needs it — same arrangement as the two identity plates.
    const backPrompt = kitPlateBackPrompt(a, sport, { spec }) + revisionText(a.slug, "kit-back");
    jobs.push({
      tag: `${a.slug}/_kit-back`, out: kitBackOut, prompt: backPrompt, refs: [kitPlateOut],
      aspect: "1:1", hash: hashOf(backPrompt, [kitPlateOut]),
    });
  }

  if (wantPoses) {
    const { poses, provisional } = posesFor(sport);
    if (provisional) {
      console.log(`WARN     ${a.slug}: no hand-written pose set for ${sport.slug} — using the generic fallback (poses.ts). Do not ship it.`);
    }
    // Poses reference the KIT PLATE, not the raw photo — one clean image carrying the whole
    // wardrobe, so nothing about it is left for the model to decide. See kitPlatePrompt.
    const hasKitPhoto = existsSync(kitPlateOut);
    // THE PLATE IS GRADED BEFORE IT IS INHERITED. An unaudited plate poisons all four poses —
    // the runbook has said so since the pilot, and it was still only a sentence in a document,
    // so a plate the judge had already failed (branded footwear, and a shoe that was not a
    // cleat) was handed to the poses anyway and every frame came back wearing it. The grade is
    // written by the kit stage below; a human approval overrides it, because `art:approve` IS
    // the human saying they looked.
    const gradePath = join(OUT, "athletes", a.slug, "_kit-grade.json");
    if (hasKitPhoto && existsSync(gradePath) && !isApproved("athlete", `${a.slug}/_kit`)) {
      const g = JSON.parse(readFileSync(gradePath, "utf8"));
      if (g.verdict === "fail" && g.plateHash === refDigest(kitPlateOut)) {
        throw new Error(
          `${a.slug}: the kit plate FAILED its own audit — "${g.worstIssue}"\n` +
          `         Fix the plate before the poses inherit it:\n` +
          `           npm run art:fix -- --athlete ${a.slug} --frame _kit --change "<the one thing>"\n` +
          `         or accept it deliberately:\n` +
          `           npm run art:approve -- --athlete ${a.slug} --frame _kit`,
        );
      }
    }
    if (hasKitPhoto) console.log(`kit      ${a.slug}: wardrobe anchored on ${kitPlateOut}`);
    else console.log(`WARN     ${a.slug}: no kit plate — run --stage kit first, or boots and ball will drift between poses`);

    for (const pose of poses) {
      if (onlyPose && pose.id !== onlyPose) continue;
      // ONE ANCHOR FOR THE WHOLE SET. The hero briefly got the family's chosen portrait as an
      // extra reference and the others did not — so the hero was pulled towards that photo and
      // the rest towards the plate, and the three frames stopped being the same child. If the
      // plate does not look enough like the family's photo, fix the PLATE; never give one frame
      // an anchor its siblings lack.
      const usePortrait = false;
      // The from-behind frame is the only one that can read the back of the kit, so it is the
      // only one that gets that plate.
      const useKitBack = pose.id === "back" && existsSync(kitBackOut);
      // THE PLAY HAIRSTYLE REACHES THE POSES AND ONLY THE POSES. The plates are the person at
      // rest and must not inherit it — a face plate in a competition ponytail and a body panel
      // in loose hair is the same set falling apart, one panel at a time.
      const poseHair = a.hairPlay ? [hair, a.hairPlay].filter(Boolean).join(" ") : hair;
      // SPLIT PLATES WHEN THEY EXIST: the face sheet and the body frame go in as two separate
      // attachments, each named for one job. Falls back to the single composed sheet for the
      // roster athletes, who were built before the split.
      const faceP = join(OUT, "athletes", a.slug, "_identity-face.png");
      const bodyP = join(OUT, "athletes", a.slug, "_identity-body.png");
      const splitPlates = existsSync(faceP) && existsSync(bodyP);
      // TWO PORTRAITS AS TWO IMAGES, not one sheet. The plate stage sends every customer
      // photograph as a tight head crop and reaches 0.789; the pose stage sent the face sheet
      // whole — two faces sharing one 1200 px image with a gutter and shoulders, beside two
      // other pictures — and the same inputs returned 0.587 one roll and -0.058 the next. The
      // face is the product; it gets its own frame, twice.
      const faceCropP = [1, 2].map((i) => join(OUT, "athletes", a.slug, `_identity-face-${i}.png`));
      const faceCrops = splitPlates && faceCropP.every((f) => existsSync(f));
      const prompt = posePrompt(a, sport, pose, crest, hasKitPhoto, spec, usePortrait, poseHair, build, useKitBack, crestPlacement, splitPlates, faceCrops) + revisionText(a.slug, pose.id);
      // The from-behind pose gets the from-behind plate as well — it is the only frame with
      // no face for the gate to check, so the reference has to do that work instead.
      // Order matters — the prompt names them as image 1, 2, 3...
      // NO BADGE MEANS NO BADGE REFERENCE. posePrompt already renumbers its images when the
      // crest is absent (an order with no logo is normal), but the refs array still asked for
      // the file — so every pose on Order 02 died on "reference missing: crests/__none__.png".
      // The prompt and the attachments have to agree about how many images there are.
      const faceRefs = faceCrops ? faceCropP : [faceP];
      const refs = splitPlates
        ? (existsSync(crestOut) ? [...faceRefs, bodyP, crestOut] : [...faceRefs, bodyP])
        : (existsSync(crestOut) ? [identityOut, crestOut] : [identityOut]);
      if (hasKitPhoto) refs.push(kitPlateOut);
      // ...and the from-behind pose gets the from-behind plate last, since it is the only
      // frame with no face for the gate to check.
      if (pose.id === "back" && existsSync(identityBackOut)) refs.push(identityBackOut);
      if (usePortrait) refs.push(portraitPath!);
      // Last, so the prompt can call it "the LAST image attached".
      if (useKitBack) refs.push(kitBackOut);
      jobs.push({
        tag: `${a.slug}/${pose.id}`,
        out: join(OUT, "athletes", a.slug, `${pose.id}.png`),
        prompt,
        refs,
        aspect: "2:3",
        hash: hashOf(prompt, refs),
      });
    }
  }
}

// Same lock as the background matrix, same reason: the generator must not be able to
// replace something a human signed off. Keys are `athlete/<tag>` in approved.json, e.g.
// `athlete/ice-hockey/_identity`. The identity plate especially — once it is approved,
// every pose depends on it staying exactly as it is.
const locked = jobs.filter((j) => !force && isApproved("athlete", j.tag));
if (locked.length) {
  console.log(`locked   ${locked.length} approved: ${locked.map((j) => j.tag).join(", ")}`);
}

const wanted = onlyFrame ? jobs.filter((j) => j.tag.endsWith(`/${onlyFrame}`)) : jobs;
const fresh = wanted.filter((j) => {
  if (!force && isApproved("athlete", j.tag)) return false;
  if (force || !existsSync(j.out)) return true;
  const side = j.out.replace(/\.png$/, ".json");
  if (!existsSync(side)) return true;
  try { return JSON.parse(readFileSync(side, "utf8")).hash !== j.hash; } catch { return true; }
});

console.log(`model    ${MODEL}  (size ${size})`);
console.log(`stage    ${stage}`);
console.log(`jobs     ${jobs.length}, to build ${fresh.length} (${jobs.length - fresh.length} cached)\n`);

if (dry) {
  console.log(fresh.map((j) => `  ${j.tag}`).join("\n") || "  (nothing)");
  console.log(`\n--- sample prompt (${fresh[0]?.tag}) ---\n${fresh[0]?.prompt ?? ""}`);
  process.exit(0);
}

/**
 * NEVER OVERWRITE A FRAME WITHOUT KEEPING THE OLD ONE.
 *
 * Every stage wrote in place, so a regeneration that came back worse destroyed the good frame
 * and there was no way back. That happened repeatedly on the seven-year-old — frames the user
 * had approved were replaced by weaker rolls and simply could not be recovered, because the
 * only record of them was the file that had just been overwritten.
 *
 * `qa.ts` already keeps the best attempt WITHIN one re-roll loop. This is the same idea across
 * runs: the previous file moves to `_versions/<name>-<n>.png` before the new one lands, so any
 * earlier version can be restored by copying it back. Disk is cheap; a frame the customer
 * already approved is not.
 */
function nextVersion(out: string): { dir: string; base: string; n: number } {
  const dir = join(dirname(out), "_versions");
  mkdirSync(dir, { recursive: true });
  const base = out.split("/").pop()!.replace(/\.png$/, "");
  const used = readdirSync(dir)
    .map((f) => new RegExp(`^${base}-(\\d+)\\.png$`).exec(f)?.[1])
    .filter(Boolean)
    .map(Number);
  return { dir, base, n: (used.length ? Math.max(...used) : 0) + 1 };
}

/**
 * EVERY GENERATION IS A CANDIDATE, NOT A REPLACEMENT.
 *
 * The working file used to be the only copy, so each run destroyed the one before it and a
 * roll that came back worse took an approved frame with it. That happened repeatedly here.
 *
 * Now each result is written to `_versions/<frame>-<n>.png` as well, and the working file is
 * merely "the latest candidate". Nothing is ever lost, choosing an earlier take costs
 * nothing (`approve --version n`), and only the takes a human picks are copied into
 * `out/approved/` — the pack. Disk is free; a frame that was right is not.
 */
function saveCandidate(out: string, image: Uint8Array, sidecar: string) {
  const { dir, base, n } = nextVersion(out);
  writeFileSync(join(dir, `${base}-${n}.png`), image);
  writeFileSync(join(dir, `${base}-${n}.json`), sidecar);
  return n;
}

let failed = 0, tokens = 0;

// The price of the run, before it starts. A sweep that is about to cost €12 should say so
// while there is still a chance to stop it — the billing dashboards only say it a day later.
if (fresh.length) console.log(planLine(fresh.length, imageModel(), size));

// Strictly sequential. Each stage feeds the next (the crest and the plate are references
// for the poses), and the express key throws 429 at concurrency 2 anyway — see README s2.
for (const j of fresh) {
  try {
    const refs = [];
    for (const r of j.refs) {
      if (!existsSync(r)) throw new Error(`reference missing: ${r} — run the earlier stage first`);
      const headless = j.bodyCrop?.get(r);
      const box = j.crops?.get(r);
      refs.push(headless ? await bodyRefFor(r, headless) : box ? await faceRefFor(r, box) : await refFor(r));
    }
    const res = await generateImage({ prompt: j.prompt, refs, aspectRatio: j.aspect, imageSize: j.size ?? size, retries, tag: j.tag });
    mkdirSync(dirname(j.out), { recursive: true });
    const sidecar = JSON.stringify(
      // `tokens` is the billed output for THIS generation, straight from usageMetadata. It is
      // here so cost is a fact on disk next to every frame rather than a guess reconstructed
      // from a dashboard three days later — `npm run art:cost` sums these. (2026-08-22: a month
      // of spend had to be explained backwards from billing graphs; never again.)
      { hash: j.hash, model: imageModel(), size: j.size ?? size, tokens: res.tokens, refs: j.refs, generatedAt: new Date().toISOString(), prompt: j.prompt },
      null, 2,
    );
    const v = saveCandidate(j.out, res.image, sidecar);
    writeFileSync(j.out, res.image);
    writeFileSync(j.out.replace(/\.png$/, ".json"), sidecar);
    tokens += res.tokens;
    console.log(`  ok   ${j.tag}  -> _versions/${j.out.split("/").pop()!.replace(/\.png$/, "")}-${v}.png  (${(res.image.length / 1024) | 0} KB)`);
  } catch (e) {
    failed++;
    console.log(`  FAIL ${j.tag}  ${(e as Error).message}`);
  }
}

/**
 * THE KIT STAGE GRADES ITS OWN OUTPUT.
 *
 * `qa-athletes.ts` could always grade a plate, but only when somebody ran it, and the one
 * plate that most needed it — the wardrobe every pose copies — was the one nobody ran it on.
 * A judge call is a fraction of the price of an image and a fraction again of the price of
 * four poses built on a bad plate, so it is not a step worth leaving to memory.
 *
 * It only REPORTS. The verdict is written next to the plate and the poses stage reads it;
 * nothing is deleted, nothing is re-rolled automatically. A re-roll is a fresh roll of the
 * dice, and rolling the dice to fix one item is the failure this whole pass exists to stop.
 */
if (wantKit && !dry) {
  for (const a of athletes) {
    const kitPlateOut = join(OUT, "athletes", a.slug, "_kit.png");
    if (!existsSync(kitPlateOut)) continue;
    const sport = sportBySlug(a.sport)!;
    const crest = crestBySlug(a.crest);
    const crestOut = crest ? join(OUT, "crests", `${crest.slug}.png`) : undefined;
    const specPath = join(OUT, "athletes", a.slug, "_spec.json");
    try {
      // The same frame the plate was BUILT from — photo2 by convention, the one a real
      // customer ticks as "this shows their team kit".
      const kitPhoto = join(OUT, "athletes", a.slug, "before", "photo2.png");
      const v = await checkKitPlate({
        sport,
        platePath: kitPlateOut,
        crestPath: crestOut && existsSync(crestOut) ? crestOut : undefined,
        kitPhotoPath: existsSync(kitPhoto) ? kitPhoto : undefined,
        hasImplement: hasImplement(a),
        hasFootwear: hasFootwear(a),
        spec: existsSync(specPath) ? specText(specPath) : undefined,
        crestSupplied: crest?.supplied,
        hasKitPhotos: existsSync(join(OUT, "athletes", a.slug, "before")),
      });
      writeFileSync(
        join(OUT, "athletes", a.slug, "_kit-grade.json"),
        JSON.stringify({ ...v, plateHash: refDigest(kitPlateOut), gradedAt: new Date().toISOString() }, null, 2),
      );
      if (v.verdict === "pass") {
        console.log(`\ngrade    ${a.slug}/_kit PASS`);
      } else {
        console.log(`\ngrade    ${a.slug}/_kit FAIL — ${v.worstIssue}`);
        for (const c of v.checks.filter((x) => !x.pass)) console.log(`         - ${c.id}: ${c.note}`);
        console.log(`         The poses will refuse this plate until it is fixed or approved.`);
      }
    } catch (e) {
      console.log(`\ngrade    ${a.slug}/_kit could not be graded: ${(e as Error).message}`);
    }
  }
}

for (const a of athletes) {
  const beforeDir = join(OUT, "athletes", a.slug, "before");
  const before = existsSync(beforeDir)
    ? readdirSync(beforeDir).filter((f) => f.endsWith(".png")).sort()
        .map((f) => ({ path: join(beforeDir, f), label: `${a.slug} before/${f.replace(".png", "")}` }))
    : [];
  const built = [
    ...before,
    ...["_identity", "_identity-back", "_kit", "_kit-back", "hero", "action2", "action3", "back"]
      .map((id) => ({ path: join(OUT, "athletes", a.slug, `${id}.png`), label: `${a.slug} ${id}` })),
  ].filter((x) => existsSync(x.path));
  if (built.length > 1) {
    const sheet = join(OUT, `_contact-sheet-${a.slug}.png`);
    await contactSheet(built, sheet, Math.min(5, built.length));
    console.log(`\ncontact sheet -> ${sheet}`);
  }
}

console.log(`\n${fresh.length - failed} ok, ${failed} failed, ${tokens} tokens`);
