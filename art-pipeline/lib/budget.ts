/**
 * The spend guard. One ledger, one cap, enforced at the only place that can spend money.
 *
 * WHY THIS EXISTS (2026-08-22). A month that was expected to cost ~€200 came in near €400,
 * and nobody could see it happening: the AI Studio cap widget lags ~10 min, the Cloud
 * billing report lags up to 24 h, and its default chart is CUMULATIVE, so a bad day looks
 * like a gentle slope instead of a spike. By the time a graph shows the problem the images
 * are already bought. Watching harder was never going to work — the feedback arrives after
 * the money is gone.
 *
 * So the limit moved into the code. Every image and every judge call goes through
 * lib/gemini.ts, so a check there cannot be bypassed by starting a different CLI, and the
 * ledger is written from the same place the money is actually spent.
 *
 * Two independent limits, because they fail differently:
 *   GDE_BUDGET_EUR   (default 25)  calendar-month ceiling — the slow leak of many sessions
 *   GDE_RUN_CAP_EUR  (default 5)   one process — the runaway sweep that spends it all at once
 *
 * Both ABORT rather than warn. A warning printed into a 40-minute sweep is a warning nobody
 * reads. Raising a limit is deliberate and per-run:
 *
 *   GDE_RUN_CAP_EUR=12 npm run art:athlete -- --athlete football
 *
 * The € figures are ESTIMATES from a rate calibrated against two real invoices (see
 * README section 44), not a price list. They are close enough to stop a runaway and must
 * never be quoted as an invoice.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

export const LEDGER = process.env.GDE_LEDGER ?? "art-pipeline/out/_spend.jsonl";

/**
 * THE PUBLISHED PRICE LIST, not a reconstruction — looked up 2026-08-22 at
 * https://ai.google.dev/gemini-api/docs/pricing after three days of inferring rates
 * backwards from lagging dashboards. Every earlier constant in this file was wrong, and
 * wrong in both directions; this is what the pages actually say.
 *
 *   USD per 1M tokens          input   output
 *   gemini-3-pro-image          2.00   120.00 (images)
 *   gemini-3.1-flash-image      0.50    60.00 (images)
 *   gemini-3.1-pro-preview      2.00    12.00   (the judge, <=200k prompts)
 *
 * Output tokens per image, from the same page — and note the FIRST ROW, which is the
 * expensive lesson of this week stated by Google in one line:
 *
 *   gemini-3-pro-image      1K 1120   2K 1120   4K 2000
 *   gemini-3.1-flash-image  1K 1120   2K 1680   4K 2520
 *
 * On Pro, 1K and 2K bill the SAME 1120 tokens ($0.134 an image). Generating small to save
 * money saves exactly nothing there — which is what the probe measured before the price
 * list confirmed it. On flash the resolution does move the number, so 1K is genuinely
 * cheaper there and nowhere else.
 *
 * AND THE OTHER CORRECTION: flash is NOT an order of magnitude cheaper. At 2K it is $0.101
 * against Pro's $0.134 — about 25%. Two earlier estimates in this file (€0.04, then €0.01
 * "derived" from a dashboard reading) implied 8x and 50x. Both were arithmetic on top of a
 * Pro rate that was itself 2.5x too high, and they cancelled into nonsense. Choosing flash
 * over Pro is a QUALITY decision with a rounding error attached, not a cost strategy.
 *
 * Tiers 1/2/3 are RATE LIMITS, not price bands: the paid per-token price is the same.
 */
const USD = {
  "gemini-3-pro-image": { in: 2.0, out: 120.0 },
  "gemini-3.1-flash-image": { in: 0.5, out: 60.0 },
  "gemini-3.1-flash-lite-image": { in: 0.5, out: 30.0 },
  "gemini-3.1-pro-preview": { in: 2.0, out: 12.0 },
  "gemini-2.5-pro": { in: 1.25, out: 10.0 },
} as const;
const DEFAULT_USD = { in: 2.0, out: 120.0 };

/** Google bills this account in EUR. 1 EUR = 1.1687 USD on 2026-08-22. */
export const USD_TO_EUR = Number(process.env.GDE_USD_EUR ?? 0.8557);

/** Published output tokens per generated image, by model and size. */
const OUT_TOKENS: Record<string, number> = {
  "gemini-3-pro-image/1K": 1120,
  "gemini-3-pro-image/2K": 1120,
  "gemini-3-pro-image/4K": 2000,
  "gemini-3.1-flash-image/1K": 1120,
  "gemini-3.1-flash-image/2K": 1680,
  "gemini-3.1-flash-image/4K": 2520,
};

/**
 * Input a real job sends: a long prompt plus two or three reference images, each already
 * downsized to <=1024 px by `refFor`. Google prices an input image at $0.0011 (~550 tokens),
 * and these prompts run long, so ~4 500 tokens is the working figure. It is small next to
 * the output — which is the useful thing to know: trimming references saves cents, and NOT
 * generating saves euros.
 */
const EST_INPUT_TOKENS = 4500;

const rate = (model: string) => (USD as Record<string, { in: number; out: number }>)[model] ?? DEFAULT_USD;

/** Local, cost-free models must never show up as spend. */
const FREE = new Set(["birefnet-general"]);

/**
 * WHAT THIS ACCOUNT IS ACTUALLY BILLED, over what the price page predicts. Measured 2026-08-22
 * on the first day where every single call is known:
 *
 *   requests on the dashboard for Aug 22   29
 *   calls in this ledger + 4 earlier probes 29      <- nothing is unaccounted for
 *   predicted at published rates            EUR 2.83
 *   monthly counter moved (139.03 - 132.42) EUR 6.61
 *   factor                                  2.34x
 *
 * THE MECHANISM, confirmed the same day from the account's own token counters. Google's
 * dashboard reports, per request:
 *
 *                       billed output   usageMetadata says   published
 *   Nano Banana Pro          2 857            1 190             1 120
 *   Nano Banana 2            5 000            2 071             1 680
 *
 * That is 2.40x and 2.41x — against 2.34x derived independently from the monthly spend
 * counter. Three readings, two unrelated routes, one number. So this is not a tariff
 * difference and not a fitted fudge: THE BILL COUNTS ROUGHLY 2.4x MORE OUTPUT TOKENS THAN THE
 * API REPORTS IN usageMetadata. Pricing straight from `candidatesTokenCount` understates the
 * bill by that much, which is exactly how three days of estimates all came out low.
 *
 * The factor stays SEPARATE from the published constants above on purpose: those are what
 * Google states, and keeping the discrepancy in its own named number is what makes it visible
 * instead of buried inside a rate nobody can check. Re-derive it on any day where the ledger
 * holds every call — that is now every day.
 *
 * ⚠️ The dashboards lag badly and unevenly: on 2026-08-22 the request counter showed 29 calls
 * while "Requests per model" showed 13 of the same day's calls. Ratios above are per-request
 * averages over whatever subset had landed, which is why they are quoted to two figures and
 * not more.
 */
export const BILLING_FACTOR = Number(process.env.GDE_BILLING_FACTOR ?? 2.34);

export function priceEur(model: string, inTokens: number, outTokens: number): number {
  if (FREE.has(model)) return 0;
  const r = rate(model);
  return ((inTokens * r.in + outTokens * r.out) / 1e6) * USD_TO_EUR * BILLING_FACTOR;
}

/** What one image is expected to cost, before it is generated. */
export function estimateImageEur(model: string, size = "2K"): number {
  if (FREE.has(model)) return 0;
  const out = OUT_TOKENS[`${model}/${size}`] ?? OUT_TOKENS[`${model}/2K`] ?? 1120;
  return priceEur(model, EST_INPUT_TOKENS, out);
}

/** A grading call: a few downsized images in, a short JSON verdict out. */
export const JUDGE_EUR = priceEur("gemini-3.1-pro-preview", 4000, 800);

export interface SpendEntry {
  ts: string;
  kind: "image" | "judge";
  model: string;
  size?: string;
  /** Billed separately and at very different rates — see USD above. */
  inTokens?: number;
  outTokens?: number;
  /** Total, kept for the older entries that only recorded this. */
  tokens: number;
  eur: number;
  tag: string;
}

function readLedger(): SpendEntry[] {
  if (!existsSync(LEDGER)) return [];
  return readFileSync(LEDGER, "utf8")
    .split("\n")
    .filter(Boolean)
    .flatMap((l) => {
      try { return [JSON.parse(l) as SpendEntry]; } catch { return []; }
    });
}

/** Spend inside a calendar month, "YYYY-MM". Google's cap resets on the 1st (PST). */
export function monthTotal(month = new Date().toISOString().slice(0, 7)): number {
  return readLedger()
    .filter((e) => e.ts.startsWith(month))
    .reduce((a, e) => a + e.eur, 0);
}

let runTotal = 0;
export const runSpend = () => runTotal;

const num = (name: string, fallback: number) => {
  const v = process.env[name];
  const n = v == null || v === "" ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const monthCap = () => num("GDE_BUDGET_EUR", 25);
export const runCap = () => num("GDE_RUN_CAP_EUR", 5);

export class BudgetExceeded extends Error {}

/**
 * Called BEFORE money is spent. Throws BudgetExceeded, which the retry loops in gemini.ts
 * deliberately do not catch — a budget stop is not a transient failure to retry around.
 */
export function assertBudget(eur: number, tag: string) {
  const rc = runCap();
  if (runTotal + eur > rc) {
    throw new BudgetExceeded(
      `run cap reached: this run has spent ~€${runTotal.toFixed(2)}, "${tag}" would take it over €${rc.toFixed(2)}.\n` +
        `  Nothing was generated. Raise it deliberately for one run if that is what you want:\n` +
        `    GDE_RUN_CAP_EUR=${Math.ceil(rc * 2)} <the same command>`,
    );
  }
  const mc = monthCap();
  const spent = monthTotal();
  if (spent + eur > mc) {
    throw new BudgetExceeded(
      `monthly budget reached: ~€${spent.toFixed(2)} of €${mc.toFixed(2)} this month, "${tag}" would exceed it.\n` +
        `  Nothing was generated. See where it went:  npm run art:cost\n` +
        `  Raise it deliberately:  GDE_BUDGET_EUR=${Math.ceil(mc + 25)} <the same command>`,
    );
  }
}

/** Called AFTER a successful call, with the real token count when the API reported one. */
export function record(e: Omit<SpendEntry, "ts" | "eur"> & { eur?: number }) {
  // EXACT when the API reported both halves — which it always does. The ledger stopped
  // being an estimate the moment input and output were priced apart.
  const eur =
    e.eur ??
    (e.inTokens != null && e.outTokens != null
      ? priceEur(e.model, e.inTokens, e.outTokens)
      : e.kind === "judge"
        ? JUDGE_EUR
        : estimateImageEur(e.model, e.size));
  runTotal += eur;
  mkdirSync(dirname(LEDGER), { recursive: true });
  appendFileSync(LEDGER, JSON.stringify({ ts: new Date().toISOString(), ...e, eur: +eur.toFixed(4) }) + "\n");
}

/** One line for a CLI to print before it starts, so the price is known in advance. */
export function planLine(images: number, model: string, size = "2K"): string {
  const est = images * estimateImageEur(model, size);
  const spent = monthTotal();
  return (
    `plan: ${images} image${images === 1 ? "" : "s"} at ${model} ${size} ≈ €${est.toFixed(2)}` +
    `  |  this month ~€${spent.toFixed(2)} of €${monthCap().toFixed(2)}`
  );
}
