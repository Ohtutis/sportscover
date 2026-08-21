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
import { crestPrompt, identityBackPrompt, identityFromPhotosPrompt, identityPlatePrompt, kitPlateBackPrompt, kitPlatePrompt, posePrompt, snapshotPrompt, snapshotWear } from "./prompts.js";
import { generateImage, loadEnv, imageModel } from "./lib/gemini.js";
import { isApproved } from "./approved.js";
import { hasFootwear, hasImplement } from "./kits.js";
import { checkKitPlate } from "./check-athlete.js";
import { bestPortrait, buildText, hairText, specCrestPlacement, specHair, specText } from "./spec.js";
import { revisionText } from "./revise.js";
import { refFor, contactSheet } from "./lib/img.js";

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
const MODEL = imageModel();

const who = flag("athlete");
const athletes: Athlete[] =
  !who || who === "all"
    ? ATHLETES
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
const hashOf = (prompt: string, refs: string[]) =>
  createHash("sha256")
    .update(`${MODEL}\n${size}\n${refs.map((r) => `${r}@${refDigest(r)}`).join("|")}\n${prompt}`)
    .digest("hex")
    .slice(0, 16);

const jobs: Job[] = [];
const wantCrest = stage === "crest" || stage === "all";
const wantSnapshots = stage === "snapshots";
const wantIdentity = stage === "identity" || stage === "all";
const wantKit = stage === "kit" || stage === "all";
const wantPoses = stage === "poses" || stage === "all";

for (const a of athletes) {
  const sport = sportBySlug(a.sport);
  if (!sport) throw new Error(`athlete ${a.slug} points at unknown sport "${a.sport}"`);
  const crest = crestBySlug(a.crest);
  if (!crest) throw new Error(`athlete ${a.slug} points at unknown crest "${a.crest}"`);

  const crestOut = join(OUT, "crests", `${crest.slug}.png`);
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

  if (wantCrest) {
    const prompt = crestPrompt(crest);
    jobs.push({ tag: `crest/${crest.slug}`, out: crestOut, prompt, refs: [], aspect: "1:1", hash: hashOf(prompt, []) });
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
    const photos = dir && existsSync(dir)
      ? readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort().map((f) => join(dir, f))
      : [];
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

    const prompt = (photos.length
      ? identityFromPhotosPrompt({ photoCount: photos.length, ageYears: a.ageYears, presents: a.presents, hair: specHairText, build: specBuildText })
      : identityPlatePrompt(a)) + revisionText(a.slug, "identity");
    jobs.push({
      tag: `${a.slug}/_identity`, out: identityOut, prompt, refs: photos,
      aspect: "4:3", hash: hashOf(prompt, photos),
    });

    // ...and the from-behind plate, which references the front one. Jobs run in order, so
    // the front plate is on disk by the time this needs it. See identityBackPrompt.
    const backPrompt = identityBackPrompt({ ...a, hair: specHairText || a.hair, build: specBuildText || a.build });
    jobs.push({
      tag: `${a.slug}/_identity-back`, out: identityBackOut, prompt: backPrompt,
      refs: [identityOut], aspect: "4:3", hash: hashOf(backPrompt, [identityOut]),
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
      ? readdirSync(beforeDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/^kit\./i.test(f))
          .sort().map((f) => join(beforeDir, f))
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
    const prompt = kitPlatePrompt(a, sport, { photoCount: photos.length, hasCrest, spec, kitPhotoIndex, crestPlacement }) + revisionText(a.slug, "kit");
    const refs = hasCrest ? [crestOut, ...ordered] : ordered;
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
      const prompt = posePrompt(a, sport, pose, crest, hasKitPhoto, spec, usePortrait, hair, build, useKitBack, crestPlacement) + revisionText(a.slug, pose.id);
      // The from-behind pose gets the from-behind plate as well — it is the only frame with
      // no face for the gate to check, so the reference has to do that work instead.
      // Order matters — the prompt names them as image 1, 2, 3...
      const refs = [identityOut, crestOut];
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

const fresh = jobs.filter((j) => {
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

// Strictly sequential. Each stage feeds the next (the crest and the plate are references
// for the poses), and the express key throws 429 at concurrency 2 anyway — see README s2.
for (const j of fresh) {
  try {
    const refs = [];
    for (const r of j.refs) {
      if (!existsSync(r)) throw new Error(`reference missing: ${r} — run the earlier stage first`);
      refs.push(await refFor(r));
    }
    const res = await generateImage({ prompt: j.prompt, refs, aspectRatio: j.aspect, imageSize: size, retries });
    mkdirSync(dirname(j.out), { recursive: true });
    const sidecar = JSON.stringify(
      { hash: j.hash, model: MODEL, size, refs: j.refs, generatedAt: new Date().toISOString(), prompt: j.prompt },
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
