#!/usr/bin/env tsx
/**
 * Where the image money went, from the sidecars on disk.
 *
 *   npm run art:cost                  everything, grouped by day and by athlete
 *   npm run art:cost -- --since 2026-08-21
 *
 * WHY THIS EXISTS (2026-08-22): a month of spend had to be explained BACKWARDS from billing
 * graphs with 24 h latency, a spend-cap widget with 10 min latency and a card charge that
 * looked like a deposit. Meanwhile every generation already returned usageMetadata and the
 * CLI printed it — and threw it away. Now `tokens` is written into each sidecar and this
 * sums them. Cost is a fact on disk, not a reconstruction.
 *
 * The € column is an ESTIMATE at a per-image rate calibrated against two real invoices
 * (€242.31 over 764 generations), not a price list — see lib/budget.ts. Resolution does not
 * affect it: measured on Pro, 1K and 2K bill the same. Do not treat the output as an invoice.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { JUDGE_EUR, LEDGER, estimateImageEur, monthCap, monthTotal } from "./lib/budget.js";

/**
 * TWO SOURCES, AND THEY MUST NOT BE ADDED TOGETHER. Every generation now writes a ledger
 * line (lib/budget.ts) AND a sidecar, so summing both would double every recent frame.
 * The ledger is authoritative from its first entry onwards; sidecars cover everything
 * before that, which is the whole history up to 2026-08-22.
 */

const argv = process.argv.slice(2);
const i = argv.indexOf("--since");
const since = i >= 0 ? argv[i + 1] : "";

interface Row { date: string; model: string; size: string; tokens: number | null; athlete: string; eur?: number; }
const rows: Row[] = [];

function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    if (!name.endsWith(".json")) continue;
    let j: any;
    try { j = JSON.parse(readFileSync(p, "utf8")); } catch { continue; }
    // `size` is optional: the background and plate sweeps predate it and wrote none, which
    // is exactly why ~100 generations of the finish x sport matrix went uncounted.
    if (!j?.model) continue;                                   // not a generation sidecar
    const ts = String(j.generatedAt ?? j.fixedAt ?? "");
    const when = ts.slice(0, 10) || "(be datos)";
    if (since && when !== "(be datos)" && when < since) continue;
    if (ts && ts >= ledgerFrom) continue;                      // the ledger has this one
    const m = p.match(/out\/athletes\/([^/]+)\//);
    const bg = /out\/(backgrounds|plates|crests)\//.exec(p);
    rows.push({
      date: when,
      model: j.model,
      size: j.size ?? "2K",
      tokens: typeof j.tokens === "number" ? j.tokens : null,
      athlete: m ? m[1] : bg ? `(${bg[1]})` : "(kita)",
    });
  }
}
interface LedgerEntry { ts: string; kind: string; model: string; size?: string; tokens: number; eur: number; tag: string }
const ledger: LedgerEntry[] = existsSync(LEDGER)
  ? readFileSync(LEDGER, "utf8").split("\n").filter(Boolean).flatMap((l) => {
      try { return [JSON.parse(l) as LedgerEntry]; } catch { return []; }
    })
  : [];
// Everything from this instant on is the ledger's story; sidecars only fill in the past.
// Compared as a full instant, not a date: truncating to the day made the ledger's first
// entry swallow every sidecar written earlier that same day — 190 of them.
const ledgerFrom = ledger.length ? ledger.map((e) => e.ts).sort()[0] : "9999";

// approved/ holds copies of the same sidecars — counting them would double every frame.
// backgrounds/ and plates/ were missed on the first pass and are real spend: the finish x
// sport matrix is ~100 generations nobody was counting.
for (const d of [
  "art-pipeline/out/athletes",
  "art-pipeline/out/crests",
  "art-pipeline/out/backgrounds",
  "art-pipeline/out/plates",
]) if (existsSync(d)) walk(d);

// Per image, per model — see the note at the top of lib/budget.ts on why the token
// counter is not the meter. Resolution does not enter the price.
const eur = (r: Row) => (r.model === "judge" ? JUDGE_EUR : estimateImageEur(r.model, r.size));
const label = (m: string) =>
  m === "gemini-3-pro-image" ? "pro" : m === "judge" ? "judge" : m === "birefnet-general" ? "cutout" : "flash";

function table(label: string, key: (r: Row) => string) {
  const g = new Map<string, { n: number; measured: number; est: number }>();
  for (const r of rows) {
    const k = key(r);
    const v = g.get(k) ?? { n: 0, measured: 0, est: 0 };
    v.n++; if (r.tokens != null) v.measured++; v.est += r.eur ?? eur(r);
    g.set(k, v);
  }
  console.log(`\n${label}`);
  for (const [k, v] of [...g.entries()].sort()) {
    console.log(`  ${k.padEnd(30)} ${String(v.n).padStart(4)} gen   ~€${v.est.toFixed(2).padStart(7)}   (${v.measured}/${v.n} išmatuota)`);
  }
}

for (const e of ledger) {
  const when = e.ts.slice(0, 10);
  if (since && when < since) continue;
  const m = /(?:^|\/)([^/]+)\//.exec(e.tag);
  rows.push({
    date: when,
    model: e.kind === "judge" ? "judge" : e.model,
    size: e.size ?? "-",
    tokens: e.tokens || null,
    athlete: m ? m[1] : "(kita)",
    eur: e.eur,
  });
}

const total = rows.reduce((a, r) => a + (r.eur ?? eur(r)), 0);
console.log(`${rows.length} generacijų${since ? ` nuo ${since}` : ""}   ~€${total.toFixed(2)} viso (įvertis)`);
console.log(`šį mėnesį ~€${monthTotal().toFixed(2)} iš €${monthCap().toFixed(2)} (GDE_BUDGET_EUR)`);
table("PAGAL DIENĄ", (r) => `${r.date}  ${label(r.model)}/${r.size}`);
table("PAGAL ATLETĄ", (r) => r.athlete);
