#!/usr/bin/env tsx
/**
 * CHECK THE FROZEN SPEC AGAINST THE PHOTOGRAPHS IT CLAIMS TO COME FROM.
 *
 *   npm run art:spec:verify -- --athlete ice-hockey
 *
 * THE HOLE THIS FILLS, and it is the hole every wrong frame today fell through.
 *
 * There were two documents describing one kit: `_spec.json` (words) and the customer's own
 * photographs (images). Everything downstream was audited — the plate against the spec, the
 * poses against the spec, the plate against the photograph as of this morning — but NOTHING
 * ever audited the spec itself. So a line I typed by hand became the standard that everything
 * else was graded against, and when the line was wrong the whole chain obediently reproduced
 * it and every checker passed.
 *
 * It happened twice on one athlete. The hockey shirt: I wrote "a red edge to the collar and
 * ONE red band around each sleeve", and the photograph shows a red collar BAND and TWO bands
 * per sleeve, with the shoulder numbers RED rather than white. The gloves: the record said
 * "navy gloves", I wrote "navy with red trim at the cuff", and the photograph shows navy with
 * WHITE. Neither error was the model's. The customer found both by putting the two pictures
 * side by side — which is exactly what this does, before anything is generated from them.
 *
 * WHEN TO RUN IT: after `art:spec`, and again after ANY hand edit of `_spec.json`. It is one
 * judge call and no image generation, so it costs a fraction of a frame and it guards every
 * frame built afterwards.
 *
 * WHAT IT DOES NOT DO: it never edits the spec. A contradiction is reported with what the
 * photograph actually shows, and a person decides — the spec is a frozen human decision and
 * a judge does not get to overwrite one.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { athleteBySlug } from "./athletes.js";
import { generateJson, JUDGE_MODEL, loadEnv } from "./lib/gemini.js";
import { refFor } from "./lib/img.js";

loadEnv();

const argv = process.argv.slice(2);
const flag = (n: string, d = "") => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const a = athleteBySlug(flag("athlete"));
if (!a) throw new Error("pass --athlete <slug>");

const dir = join("art-pipeline/out/athletes", a.slug);
const specPath = join(dir, "_spec.json");
if (!existsSync(specPath)) throw new Error(`${specPath} does not exist — run art:spec first`);
const spec = JSON.parse(readFileSync(specPath, "utf8"));

const beforeDir = join(dir, "before");
const photos = existsSync(beforeDir)
  ? readdirSync(beforeDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort()
  : [];
if (!photos.length) throw new Error(`no photographs in ${beforeDir} — nothing to verify against`);

/** Every claim the spec makes about how this kit LOOKS, each as its own checkable line. */
const claims: { id: string; text: string }[] = [];
for (const r of spec.resolved ?? []) {
  const value = r.value || r.partial;
  // Hair and build are checked here too: they drift exactly like a garment does, and the
  // identity plate is built from them.
  if (value) claims.push({ id: r.item, text: value });
}
if (spec.crest?.use && spec.crest?.placement) {
  claims.push({ id: "crest placement", text: `The club crest sits ${spec.crest.placement}` });
}

const SCHEMA = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          // Description before verdict, the same trick the other rubrics use: a judge asked
          // "is this right?" says yes; a judge made to describe what it sees first notices.
          seen: { type: "string" },
          verdict: { type: "string", enum: ["confirmed", "contradicted", "not_visible"] },
          note: { type: "string" },
        },
        required: ["id", "seen", "verdict", "note"],
      },
    },
  },
  required: ["findings"],
};

const prompt = [
  `Images 1 to ${photos.length} are photographs of ONE athlete: ${photos.join(", ")}.`,
  `Below are written claims about what that athlete wears and how they look. Each was supposed`,
  `to have been read off these photographs. Your job is to check every one of them.`,
  ``,
  `For EACH claim, in this order:`,
  `- seen: describe what the photographs ACTUALLY show for that item, in your own words, before`,
  `  you judge anything. Be specific about colours, how many stripes or bands there are, where`,
  `  they sit, and what colour any number or badge is.`,
  `- verdict: "confirmed" if the claim matches the photographs in every detail it states;`,
  `  "contradicted" if ANY detail of it differs — a colour, a count, a position, a shape;`,
  `  "not_visible" if the photographs genuinely do not show that item.`,
  `- note: if contradicted, say plainly what the claim gets wrong and what the truth is.`,
  ``,
  `A claim that is MOSTLY right is CONTRADICTED. One wrong band or one wrong colour becomes a`,
  `printed card, so the standard is exact.`,
  `But if the photographs do not show that item AT ALL, the verdict is "not_visible" even when`,
  `the claim states details about it — an unverifiable claim is not a wrong one, and some of`,
  `them are deliberate decisions taken from the order form rather than readings of a photo.`,
  `Ignore wear, dirt, lighting and camera angle — those belong to the photograph, not the kit.`,
  `Ignore any deliberate note about manufacturer logos being left off.`,
  ``,
  ...claims.map((c) => `CLAIM "${c.id}": ${c.text}`),
].join("\n");

const images = await Promise.all(photos.map((f) => refFor(join(beforeDir, f), 1100)));

console.log(`judge    ${JUDGE_MODEL}`);
console.log(`verify   ${a.slug}: ${claims.length} claims against ${photos.length} photographs\n`);

interface Finding { id: string; seen: string; verdict: string; note: string }
const res = await generateJson<{ findings: Finding[] }>({ prompt, images, schema: SCHEMA });

const mark = (v: string) => (v === "confirmed" ? "ok  " : v === "contradicted" ? "WRONG" : "n/a ");
let wrong = 0;
for (const f of res.findings) {
  if (f.verdict === "contradicted") wrong++;
  console.log(`  ${mark(f.verdict)} ${f.id.padEnd(16)} ${f.verdict === "confirmed" ? "" : f.note}`);
  if (f.verdict !== "confirmed") console.log(`       ${" ".repeat(16)} photo shows: ${f.seen}`);
}

writeFileSync(join(dir, "_spec-audit.json"), JSON.stringify({ verifiedAt: new Date().toISOString(), photos, findings: res.findings }, null, 2));
console.log(`\n${wrong ? `${wrong} CONTRADICTED` : "all claims confirmed"} — ${join(dir, "_spec-audit.json")}`);
if (wrong) {
  console.log(`Fix the line in _spec.json by hand, then run this again. Nothing downstream is`);
  console.log(`worth generating until the spec agrees with the photographs.`);
  process.exit(1);
}
