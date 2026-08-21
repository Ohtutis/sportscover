#!/usr/bin/env tsx
/**
 * Accept ONE frame into the approved set.
 *
 *   npx tsx art-pipeline/approve.ts --athlete soccer-age-07 --frame _kit
 *   npx tsx art-pipeline/approve.ts --athlete soccer-age-07 --list
 *
 * WHY THIS EXISTS
 * The working directory is a scratchpad: every stage overwrites it, and a re-roll that comes
 * back worse takes the good frame with it. That happened repeatedly — frames the user had
 * accepted were destroyed by later runs, and there was nothing to go back to.
 *
 * So approval means two things at once: the frame is COPIED somewhere nothing writes to, and
 * its key goes into `approved.json`, which every generator and every re-roll already refuses
 * to touch. One approved, one locked, one safe.
 *
 * Frames: `_kit`, `_identity`, `_identity-back`, `hero`, `action2`, `action3`, `back`.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { athleteBySlug } from "./athletes.js";

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const has = (n: string) => argv.includes(`--${n}`);

const WORK = "art-pipeline/out/athletes";
const APPROVED = "art-pipeline/out/approved";
const LOCK = "art-pipeline/approved.json";

const slug = flag("athlete");
const a = slug ? athleteBySlug(slug) : undefined;
if (!a) throw new Error("pass --athlete <slug>");

const dest = join(APPROVED, a.slug);

// The pack, and what is still missing from it. `_identity-back` is only needed when the
// order includes the card back, so it is listed but not treated as a gap.
const PACK = ["_kit", "_kit-back", "_identity", "_identity-back", "hero", "action2", "action3", "back"];

if (has("list")) {
  const have = existsSync(dest) ? readdirSync(dest).filter((f) => f.endsWith(".png")).map((f) => f.replace(".png", "")) : [];
  const vdir = join(WORK, a.slug, "_versions");
  const versions = existsSync(vdir) ? readdirSync(vdir).filter((f) => f.endsWith(".png")) : [];
  console.log(`pack: art-pipeline/out/approved/${a.slug}`);
  for (const f of PACK) {
    const candidates = versions.filter((v) => new RegExp(`^${f}-\\d+\\.png$`).test(v)).length;
    const state = have.includes(f) ? "APPROVED" : candidates ? `${candidates} candidate(s), none chosen` : "not generated";
    console.log(`  ${have.includes(f) ? "x" : " "} ${f.padEnd(15)} ${state}`);
  }
  const missing = PACK.filter((f) => !have.includes(f));
  console.log(missing.length ? `\n${PACK.length - missing.length}/${PACK.length} approved — still open: ${missing.join(", ")}` : `\ncomplete — all ${PACK.length} frames approved`);
  process.exit(0);
}

const frame = flag("frame");
if (!frame) throw new Error('pass --frame <_kit|_identity|_identity-back|hero|action2|action3|back>');

// `--version N` approves an EARLIER take instead of whatever is currently in the working
// directory. This is the point of keeping versions: a re-roll that came back worse no longer
// costs anything, because the take that was right is still there and can simply be chosen.
// The chosen version is restored into the working file too, so every later stage that reads
// it — the poses read the kit plate — picks up the approved one.
const version = flag("version");
const src = version
  ? join(WORK, a.slug, "_versions", `${frame}-${version}.png`)
  : join(WORK, a.slug, `${frame}.png`);
if (!existsSync(src)) throw new Error(`nothing to approve: ${src} does not exist`);
if (version) {
  const live = join(WORK, a.slug, `${frame}.png`);
  const keep = join(WORK, a.slug, "_versions", `${frame}-restored-from-${version}.png`);
  if (existsSync(live)) copyFileSync(live, keep);
  copyFileSync(src, live);
  const vside = src.replace(/\.png$/, ".json");
  if (existsSync(vside)) copyFileSync(vside, live.replace(/\.png$/, ".json"));
  console.log(`restored ${frame}-${version} -> ${live}`);
}

mkdirSync(dest, { recursive: true });
copyFileSync(src, join(dest, `${frame}.png`));
const side = src.replace(/\.png$/, ".json");
if (existsSync(side)) copyFileSync(side, join(dest, `${frame}.json`));

// The same lock the background matrix uses. Generators and re-rolls both consult it.
const lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, "utf8")) : { approved: [] };
const key = `athlete/${a.slug}/${frame}`;
if (!lock.approved.includes(key)) lock.approved.push(key);
writeFileSync(LOCK, JSON.stringify(lock, null, 2) + "\n");

console.log(`approved ${a.slug}/${frame}`);
console.log(`  copied -> ${join(dest, `${frame}.png`)}`);
console.log(`  locked -> ${key}   (no generator or re-roll will overwrite it)`);
