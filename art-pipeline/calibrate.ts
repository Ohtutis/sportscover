#!/usr/bin/env tsx
/**
 * Measure the QA judge against human verdicts.
 *
 *   npx tsx art-pipeline/calibrate.ts
 *
 * The judge is only useful if it agrees with the person who has to sign off the print.
 * Its first version did not: it passed four frames the user had called completely wrong
 * and failed one the user had approved. Run this after ANY change to check.ts, and do not
 * trust `qa.ts --reroll` to run unattended until this reports full agreement.
 */
import { readFileSync, existsSync } from "node:fs";
import { finishBySlug } from "./finishes.js";
import { sportBySlug } from "./sports.js";
import { checkBackground } from "./check.js";
import { loadEnv, JUDGE_MODEL } from "./lib/gemini.js";

loadEnv();

interface Case { file: string; finish: string; sport: string; expected: "pass" | "fail"; why: string }
const cases: Case[] = JSON.parse(readFileSync("art-pipeline/labels.json", "utf8")).cases;

console.log(`judge ${JUDGE_MODEL}\n`);
let agree = 0, missed = 0, falseAlarm = 0, skipped = 0;

for (const c of cases) {
  if (!existsSync(c.file)) { console.log(`  SKIP ${c.sport} — ${c.file} is gone`); skipped++; continue; }
  const v = await checkBackground(c.file, finishBySlug(c.finish)!, sportBySlug(c.sport)!);
  const ok = v.verdict === c.expected;
  if (ok) agree++;
  else if (c.expected === "fail") missed++;
  else falseAlarm++;
  const failedIds = v.checks.filter((x) => !x.pass).map((x) => x.id).join(",") || "-";
  console.log(
    `  ${ok ? "  ok" : "MISS"}  ${c.sport.padEnd(13)} human=${c.expected}  judge=${v.verdict.padEnd(4)}  [${failedIds}]`,
  );
  if (!ok) console.log(`        human saw: ${c.why}`);
}

const graded = cases.length - skipped;
console.log(`\nagreement ${agree}/${graded}`);
if (missed) console.log(`  ${missed} bad frame(s) the judge would have let through — this is the dangerous direction`);
if (falseAlarm) console.log(`  ${falseAlarm} good frame(s) the judge would have re-rolled — wasteful but safe`);
