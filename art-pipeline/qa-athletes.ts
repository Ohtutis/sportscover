#!/usr/bin/env tsx
/**
 * Grade generated athlete poses against the same rules their prompts were built from.
 *
 *   npx tsx art-pipeline/qa-athletes.ts --athlete ice-hockey
 *   npx tsx art-pipeline/qa-athletes.ts --athlete ice-hockey --reroll --max-attempts 3
 *
 * Writes out/athletes/<athlete>/_qa-report.json. --reroll regenerates failures with the
 * judge's own complaints appended to the prompt, and KEEPS THE BEST ATTEMPT, not the last
 * (a re-roll is a fresh roll of the dice — see the same note in qa.ts).
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";

/** Same guard as gen-athlete.ts: a re-roll must never destroy the frame it replaces. */
function keepPrevious(out: string) {
  if (!existsSync(out)) return;
  const dir = join(dirname(out), "_versions");
  mkdirSync(dir, { recursive: true });
  const base = out.split("/").pop()!.replace(/\.png$/, "");
  const n = readdirSync(dir).filter((f) => f.startsWith(`${base}-`)).length + 1;
  copyFileSync(out, join(dir, `${base}-${n}.png`));
}
import { dirname, join } from "node:path";
import { ATHLETES, athleteBySlug, type Athlete } from "./athletes.js";
import { crestBySlug } from "./crests.js";
import { sportBySlug } from "./sports.js";
import { posesFor } from "./poses.js";
import { posePrompt } from "./prompts.js";
import { hasFootwear, hasImplement } from "./kits.js";
import { checkAthletePose, checkAthleteSet, checkKitPlate, retryHint, type AthleteVerdict } from "./check-athlete.js";
import { kitPlatePrompt } from "./prompts.js";
import { specText } from "./spec.js";
import { readdirSync } from "node:fs";
import { generateImage, loadEnv, imageModel, JUDGE_MODEL } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";
import { isApproved } from "./approved.js";

loadEnv();

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const OUT = "art-pipeline/out/athletes";
const reroll = has("reroll");
// APPROVED WORK IS NOT RE-GRADED unless --all is passed. The judge re-grading frames a human
// had already signed off was pure spend: every full run re-billed ~5 vision calls per athlete
// to produce "stale FAILs" the README §16 told everyone to ignore — the worst of both worlds,
// paid for AND disbelieved. A locked frame cannot be re-rolled anyway (approve.ts), so grading
// it again can change nothing. --all restores the old behaviour for a deliberate full audit.
const gradeAll = has("all");
const maxAttempts = Number(flag("max-attempts", "3"));
const size = flag("size", "2K");
// See the note on `retries` in gen-athlete.ts — a re-roll must outlast a competing sweep.
const retries = Number(flag("retries", "30"));

const who = flag("athlete");
const athletes: Athlete[] =
  !who || who === "all" ? ATHLETES : who.split(",").map((s) => athleteBySlug(s.trim())!);
const onlyPose = flag("pose");

console.log(`judge ${JUDGE_MODEL}   generator ${imageModel()}\n`);

/**
 * The arithmetic verdict from cutout.ts, folded into the judge's.
 *
 * WHY: on the pilot the judge FAILED `hero` for a cropped skate and stick on one run and
 * PASSED the byte-identical file on the next, while `cutout.ts` measured a right-edge
 * margin of exactly 0 px both times. A vision model is not stable on geometry; a bounding
 * box is. So anything the matte can prove wins over anything the judge felt.
 *
 * Requires the cutout to be newer than the pose it describes — a stale report is worse
 * than none, because it would fail a frame that has already been re-rolled.
 */
function matteFails(dir: string, pose: string, posePath: string): string[] | "stale" | null {
  const file = join(dir, "_cutout-report.json");
  if (!existsSync(file)) return null;
  try {
    if (statSync(file).mtimeMs < statSync(posePath).mtimeMs) return "stale";
    const r = JSON.parse(readFileSync(file, "utf8")).reports?.find((x: { pose: string }) => x.pose === pose);
    return r ? (r.fails as string[]) : null;
  } catch {
    return null;
  }
}

let graded = 0, passed = 0;

for (const a of athletes) {
  const sport = sportBySlug(a.sport)!;
  const crest = crestBySlug(a.crest)!;
  const platePath = join(OUT, a.slug, "_identity.png");
  const crestPath = join("art-pipeline/out/crests", `${crest.slug}.png`);
  if (!existsSync(platePath)) { console.log(`skip ${a.slug}: no identity plate`); continue; }

  const { poses } = posesFor(sport);
  const report: Record<string, unknown> = {};

  // THE KIT PLATE IS AUDITED BEFORE ANYTHING ELSE.
  // Every pose inherits the wardrobe from it, so a bad plate poisons the whole set and no
  // amount of pose re-rolling can recover it. See checkKitPlate for what it produced unguarded.
  const kitPath = join(OUT, a.slug, "_kit.png");
  const specPath = join(OUT, a.slug, "_spec.json");
  const spec = existsSync(specPath) ? specText(specPath) : undefined;
  const useCrest = !spec || JSON.parse(readFileSync(specPath, "utf8")).crest?.use;
  if (existsSync(kitPath) && !gradeAll && isApproved("athlete", `${a.slug}/_kit`)) {
    console.log(`  KIT  ${a.slug}  approved — not re-graded (pass --all to force)`);
    report._kit = { verdict: "approved", skipped: true };
  } else if (existsSync(kitPath)) {
    // hasImplement/hasFootwear MUST be passed here too. gen-athlete.ts passes them and this
    // file did not, so the SAME plate that the build graded PASS came back FAIL from the
    // standalone judge: swimming's flat lay was failed for "missing shoes, socks and a sport
    // implement" on a barefoot sport with no implement, in a note that went on to say the spec
    // calls for bare feet (2026-08-22). That is precisely the failure hasFootwear was added to
    // stop — a rubric that fails correct work teaches everyone to ignore the rubric.
    const kitFlags = { hasImplement: hasImplement(a), hasFootwear: hasFootwear(a) };
    let kv = await checkKitPlate({ sport, platePath: kitPath, crestPath: useCrest ? crestPath : undefined, spec, ...kitFlags });
    let kAttempts = 1;
    while (reroll && kv.verdict === "fail" && kAttempts < maxAttempts) {
      kAttempts++;
      console.log(`  reroll ${a.slug}/_kit (attempt ${kAttempts}) — ${kv.worstIssue}`);
      const photos = existsSync(join(OUT, a.slug, "before"))
        ? readdirSync(join(OUT, a.slug, "before")).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/^kit\./i.test(f)).sort()
            .map((f) => join(OUT, a.slug, "before", f))
        : [];
      const refs = [];
      if (useCrest) refs.push(await refFor(crestPath, 512));
      for (const ph of photos) refs.push(await refFor(ph));
      const r = await generateImage({
        prompt: kitPlatePrompt(a, sport, { photoCount: photos.length, hasCrest: Boolean(useCrest), spec })
          + retryHint(kv as unknown as AthleteVerdict),
        refs, aspectRatio: "1:1", imageSize: size, retries,
      });
      keepPrevious(kitPath);
      writeFileSync(kitPath, r.image);
      kv = await checkKitPlate({ sport, platePath: kitPath, crestPath: useCrest ? crestPath : undefined, spec, ...kitFlags });
    }
    console.log(`  KIT  ${a.slug}  ${kv.verdict === "pass" ? "ok" : "FAIL — " + kv.worstIssue}`);
    for (const c of kv.checks.filter((x) => !x.pass)) console.log(`       ${c.id}: ${c.note}`);
    report._kit = { verdict: kv.verdict, attempts: kAttempts, worstIssue: kv.worstIssue, failed: kv.checks.filter((c) => !c.pass).map((c) => c.id), observations: kv.observations };
    if (kv.verdict === "fail") {
      console.log(`  >> the wardrobe anchor is wrong; poses generated from it will inherit that. Fix the plate before grading poses.`);
    }
  }

  // THE SET AUDIT RUNS SECOND.
  // Per-image grading cannot see the defect that ruins a printed card — the four frames
  // disagreeing with each other. Auditing the set first also says WHICH frames disagree, so
  // only those get re-rolled instead of the whole set being thrown away on a hunch.
  const onDisk = poses
    .map((p) => ({ id: p.id, path: join(OUT, a.slug, `${p.id}.png`) }))
    .filter((p) => existsSync(p.path));
  const offenders = new Set<string>();
  const allPosesApproved = onDisk.length > 0 && onDisk.every((p) => isApproved("athlete", `${a.slug}/${p.id}`));
  if (!gradeAll && allPosesApproved && !onlyPose) {
    console.log(`  SET  ${a.slug}  all frames approved — not re-audited (pass --all to force)`);
    report._set = { verdict: "approved", skipped: true };
  } else if (onDisk.length > 1 && !onlyPose) {
    try {
      const set = await checkAthleteSet({ athlete: a, sport, poses: onDisk });
      console.log(`  SET  ${a.slug}  ${set.verdict === "pass" ? "consistent" : "INCONSISTENT — " + set.worstIssue}`);
      for (const c of set.checks.filter((x) => !x.pass)) {
        console.log(`       ${c.id}: ${c.note}${c.offending?.length ? `  [${c.offending.join(", ")}]` : ""}`);
        for (const o of c.offending ?? []) offenders.add(o.replace(/\.png$/, ""));
      }
      report._set = {
        verdict: set.verdict, worstIssue: set.worstIssue,
        failed: set.checks.filter((c) => !c.pass).map((c) => c.id),
        offending: [...offenders], observations: set.observations,
      };
    } catch (e) {
      console.log(`  SET  ${a.slug}  ERROR ${(e as Error).message.slice(0, 120)}`);
    }
  }

  for (const pose of poses) {
    if (onlyPose && pose.id !== onlyPose) continue;
    const path = join(OUT, a.slug, `${pose.id}.png`);
    if (!existsSync(path)) continue;
    const tag = `${a.slug}/${pose.id}`;
    const locked = isApproved("athlete", tag);
    if (locked && !gradeAll) {
      console.log(`  SKIP ${tag}  approved — not re-graded (pass --all to force)`);
      report[pose.id] = { verdict: "approved", skipped: true };
      continue;
    }
    graded++;

    let v: AthleteVerdict;
    try {
      v = await checkAthletePose({ athlete: a, sport, pose, imagePath: path, platePath, crestPath, spec });
    } catch (e) {
      console.log(`  ERROR ${tag}  ${(e as Error).message.slice(0, 120)}`);
      report[pose.id] = { verdict: "error", worstIssue: (e as Error).message.slice(0, 200) };
      continue;
    }

    if (offenders.has(pose.id)) {
      v.checks.push({ id: "set_consistency", pass: false, note: "this frame disagrees with the rest of the set" });
      v.verdict = "fail";
      if (v.worstIssue === "none" || !v.worstIssue) v.worstIssue = "disagrees with the rest of the set";
    }

    const matte = matteFails(join(OUT, a.slug), pose.id, path);
    if (matte === "stale") {
      console.log(`  note  ${tag}: cutout report is older than the pose — re-run art:cutout for the matte checks`);
    } else if (matte?.length) {
      v.checks.push(...matte.map((m) => ({ id: "matte_geometry", pass: false, note: m })));
      v.verdict = "fail";
      if (v.worstIssue === "none" || !v.worstIssue) v.worstIssue = matte[0];
    }

    const score = (x: AthleteVerdict) => x.checks.filter((c) => !c.pass).length;
    let best: { image: Uint8Array; verdict: AthleteVerdict; attempt: number } =
      { image: readFileSync(path), verdict: v, attempt: 1 };
    let attempts = 1;

    while (reroll && !locked && v.verdict === "fail" && attempts < maxAttempts) {
      attempts++;
      console.log(`  reroll ${tag} (attempt ${attempts}) — ${v.worstIssue}`);
      const refs = [await refFor(platePath), await refFor(crestPath)];
      const r = await generateImage({
        prompt: posePrompt(a, sport, pose, crest) + retryHint(v),
        refs,
        aspectRatio: "2:3",
        imageSize: size,
        retries,
      });
      mkdirSync(dirname(path), { recursive: true });
      keepPrevious(path);
      writeFileSync(path, r.image);
      v = await checkAthletePose({ athlete: a, sport, pose, imagePath: path, platePath, crestPath, spec });
      if (score(v) < score(best.verdict)) best = { image: r.image, verdict: v, attempt: attempts };
    }

    if (best.attempt !== attempts) {
      writeFileSync(path, best.image);
      v = best.verdict;
      console.log(`  kept  ${tag}  attempt ${best.attempt} of ${attempts} — later rolls scored worse`);
    }

    const failed = v.checks.filter((c) => !c.pass);
    report[pose.id] = {
      verdict: v.verdict, attempts, worstIssue: v.worstIssue,
      failed: failed.map((c) => c.id), observations: v.observations, approved: locked,
    };
    if (v.verdict === "pass") {
      passed++;
      console.log(`  PASS ${tag}${attempts > 1 ? `  (after ${attempts} attempts)` : ""}`);
    } else {
      console.log(`  FAIL ${tag}${locked ? " [approved — not re-rolled]" : ""}  ${v.worstIssue}`);
      for (const f of failed) console.log(`       ${f.id}: ${f.note}`);
    }
  }

  const out = join(OUT, a.slug, "_qa-report.json");
  writeFileSync(out, JSON.stringify({ judge: JUDGE_MODEL, generator: imageModel(), gradedAt: new Date().toISOString(), report }, null, 2));
  console.log(`  -> ${out}`);
}

console.log(`\n${passed}/${graded} passed`);
