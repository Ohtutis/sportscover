// The weekly Search Console monitor (SEO master plan §8 "the weekly monitor"). Reads every URL with
// impressions for the last 7, 28 and 90 days, stores a dated snapshot under seo/history/, joins the live
// sitemap as the denominator (a page that never earned an impression is invisible to Search Console and
// shows up here as "never seen"), and writes ONE report, seo/REPORT.md, with one verdict per URL:
//
//   CTR gap   — impressions ≥ floor in 28 days, position ≤ 20, CTR under a third of the site's own median
//               for that position band (falls back to a generic curve while a band has < 200 impressions)
//   Refresh   — impressions ≥ floor at positions 8–20 (striking distance: improve the content)
//   Watch     — first seen < 28 days ago; no verdict yet
//   Prune     — known ≥ 90 days with zero impressions in the last 28
//   Never seen — in the sitemap, no row in 90 days (indexing problem or no demand)
//
// plus a per-section alert (7-day impressions down ≥ 20 % from the previous 7, from ≥ 200), the young
// cohorts (median impressions / position at 14, 28, 56 days by section) and the prompt-shaped queries
// (≥ 7 words) for the AI-answer panel. It never edits a page.
//
// Credentials: a Google service account with READ access to the Search Console property.
//   GSC_SITE_URL            e.g. sc-domain:gamedayedition.com (a Domain property) or https://www.gamedayedition.com/
//   GSC_SERVICE_ACCOUNT     the service-account JSON (the file's contents) — or GSC_SERVICE_ACCOUNT_FILE=<path>
// Fail safe, fail loud: no credentials → exit 2 and the queues are untouched; a run that returns zero
// rows for the whole property → exit 3 (a wrong site URL returns zero rows, not an error).
//
//   npx tsx scripts/seo/gsc-monitor.ts                # today
//   npx tsx scripts/seo/gsc-monitor.ts --floor 20     # impressions floor for the queues (default 20 — recalibrate as the site grows: each queue should hold 10–30 pages)
//   npx tsx scripts/seo/gsc-monitor.ts --end 2026-11-01

import { createSign } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { CANONICAL_ORIGIN } from "../../lib/site";

const ROOT = process.cwd();
const HISTORY_DIR = path.join(ROOT, "seo", "history");
const REPORT = path.join(ROOT, "seo", "REPORT.md");
const PAGES_FILE = path.join(HISTORY_DIR, "pages.json");
const PROMPTS_FILE = path.join(ROOT, "seo", "ai-panel", "prompts-from-gsc.md");

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const FLOOR = Number(flag("--floor") ?? 20);
const END = flag("--end") ?? new Date().toISOString().slice(0, 10);

interface Row {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}
interface PageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}
interface Known {
  firstSeen: string;
  lastSeen: string;
}

/* ---------- dates ---------- */
const daysAgo = (iso: string, n: number): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};
// Search Console data lags 2–3 days: every window ends three days before END.
const endDate = daysAgo(END, 3);
const win = (days: number) => ({ startDate: daysAgo(endDate, days - 1), endDate });
const daysBetween = (a: string, b: string): number => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

/* ---------- auth: service-account JWT → access token, no SDK ---------- */
function serviceAccount(): { client_email: string; private_key: string } | null {
  const inline = process.env.GSC_SERVICE_ACCOUNT;
  const file = process.env.GSC_SERVICE_ACCOUNT_FILE;
  try {
    const raw = inline ?? (file ? fs.readFileSync(file, "utf8") : "");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string };
    return parsed.client_email && parsed.private_key ? { client_email: parsed.client_email, private_key: parsed.private_key } : null;
  } catch {
    return null;
  }
}

const b64url = (s: string | Buffer): string => Buffer.from(s).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

async function accessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const signature = b64url(signer.sign(sa.private_key));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claim}.${signature}` }),
  });
  if (!res.ok) throw new Error(`token: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

/* ---------- Search Console ---------- */
async function query(token: string, site: string, body: Record<string, unknown>): Promise<Row[]> {
  const rows: Row[] = [];
  for (let startRow = 0; ; startRow += 25_000) {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ ...body, rowLimit: 25_000, startRow, dataState: "final" }),
    });
    if (!res.ok) throw new Error(`searchAnalytics: ${res.status} ${await res.text()}`);
    const page = ((await res.json()) as { rows?: Row[] }).rows ?? [];
    rows.push(...page);
    if (page.length < 25_000) break;
  }
  return rows;
}

const toPages = (rows: Row[]): PageRow[] => rows.map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));

/* ---------- sitemap as the denominator ---------- */
async function sitemapUrls(): Promise<string[]> {
  try {
    const xml = await (await fetch(`${CANONICAL_ORIGIN}/sitemap.xml`)).text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  } catch {
    return [];
  }
}

/* ---------- the site's own CTR curve, by position band ---------- */
const band = (position: number): string => (position < 1.5 ? "1" : position < 3.5 ? "2-3" : position < 5.5 ? "4-5" : position < 10.5 ? "6-10" : position < 20.5 ? "11-20" : "21+");
/** A generic curve: only ever a candidate finder, and it overstates (master plan §8). */
const GENERIC_CTR: Record<string, number> = { "1": 0.27, "2-3": 0.12, "4-5": 0.06, "6-10": 0.03, "11-20": 0.01, "21+": 0.003 };
const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0;
};
const isBrandLed = (page: string): boolean => page === `${CANONICAL_ORIGIN}/` || page.startsWith(`${CANONICAL_ORIGIN}/about`) || page.startsWith(`${CANONICAL_ORIGIN}/contact`);
const sectionOf = (page: string): string => {
  const p = page.replace(CANONICAL_ORIGIN, "");
  const first = p.split("/").filter(Boolean)[0] ?? "";
  if (!first) return "/";
  if (first === "c") return "/c (card pages)";
  if (first === "senior-night") return p.split("/").length > 2 ? "/senior-night/[sport]" : "/senior-night";
  return `/${first}`;
};

/* ---------- main ---------- */
async function main(): Promise<number> {
  const site = process.env.GSC_SITE_URL;
  const sa = serviceAccount();
  if (!site || !sa) {
    console.error(
      "Search Console credentials missing — set GSC_SITE_URL (sc-domain:gamedayedition.com) and GSC_SERVICE_ACCOUNT (the service-account JSON) or GSC_SERVICE_ACCOUNT_FILE. The queues were NOT touched.",
    );
    return 2;
  }
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(PROMPTS_FILE), { recursive: true });
  const token = await accessToken(sa);

  const [d7, prev7, d28, d90, queries28] = await Promise.all([
    query(token, site, { ...win(7), dimensions: ["page"] }),
    query(token, site, { startDate: daysAgo(endDate, 13), endDate: daysAgo(endDate, 7), dimensions: ["page"] }),
    query(token, site, { ...win(28), dimensions: ["page"] }),
    query(token, site, { ...win(90), dimensions: ["page"] }),
    query(token, site, { ...win(28), dimensions: ["query", "page"] }),
  ]);
  const totals = { d7: toPages(d7), prev7: toPages(prev7), d28: toPages(d28), d90: toPages(d90) };
  const total90 = totals.d90.reduce((n, r) => n + r.impressions, 0);
  if (!totals.d90.length) {
    console.error(`zero rows for ${site} in 90 days — a wrong site URL returns zero rows, not an error. The queues were NOT touched.`);
    return 3;
  }

  // History: the snapshot, and first/last-seen per URL (Search Console keeps 16 months; we keep ours).
  const snapshot = { site, fetchedAt: new Date().toISOString(), endDate, windows: totals, queries28: queries28.map((r) => ({ query: r.keys[0], page: r.keys[1], clicks: r.clicks, impressions: r.impressions, position: r.position })) };
  fs.writeFileSync(path.join(HISTORY_DIR, `${endDate}.json`), JSON.stringify(snapshot, null, 1));
  const known: Record<string, Known> = fs.existsSync(PAGES_FILE) ? (JSON.parse(fs.readFileSync(PAGES_FILE, "utf8")) as Record<string, Known>) : {};
  const sitemap = await sitemapUrls();
  for (const url of [...sitemap, ...totals.d90.map((r) => r.page)]) {
    known[url] = known[url] ? { ...known[url], lastSeen: endDate } : { firstSeen: endDate, lastSeen: endDate };
  }
  fs.writeFileSync(PAGES_FILE, JSON.stringify(known, null, 1));

  // The site's own CTR by band (brand-led pages and the page itself left out, ≥ 200 impressions per band).
  const nonBrand = totals.d28.filter((r) => !isBrandLed(r.page));
  const expectedCtr = (row: PageRow): { expected: number; source: "site" | "curve" } => {
    const b = band(row.position);
    const peers = nonBrand.filter((r) => r.page !== row.page && band(r.position) === b);
    const impressions = peers.reduce((n, r) => n + r.impressions, 0);
    return impressions >= 200 ? { expected: median(peers.map((r) => r.ctr)), source: "site" } : { expected: GENERIC_CTR[b], source: "curve" };
  };

  // Verdicts.
  const by28 = new Map(totals.d28.map((r) => [r.page, r]));
  const age = (url: string): number => (known[url] ? daysBetween(known[url].firstSeen, endDate) : 0);
  const ctrGap: string[] = [];
  const refresh: string[] = [];
  const watch: string[] = [];
  const prune: string[] = [];
  const neverSeen: string[] = [];
  const lost = (r: PageRow, expected: number) => Math.round(r.impressions * Math.max(0, expected - r.ctr));
  for (const r of [...nonBrand].sort((a, b) => b.impressions - a.impressions)) {
    if (age(r.page) < 28) {
      watch.push(`- ${r.page} — ${r.impressions} impr, pos ${r.position.toFixed(1)}, ${age(r.page)} d old`);
      continue;
    }
    if (r.impressions >= FLOOR && r.position <= 20) {
      const { expected, source } = expectedCtr(r);
      if (r.ctr < expected / 3) ctrGap.push(`- ${r.page} — ${r.impressions} impr, pos ${r.position.toFixed(1)}, CTR ${(r.ctr * 100).toFixed(2)} % vs ${(expected * 100).toFixed(2)} % (${source}), ~${lost(r, expected)} clicks lost`);
    }
    if (r.impressions >= FLOOR && r.position >= 8 && r.position <= 20) refresh.push(`- ${r.page} — ${r.impressions} impr, pos ${r.position.toFixed(1)}, ${r.clicks} clicks`);
  }
  for (const url of sitemap) {
    const row = by28.get(url);
    if (!row && age(url) >= 90) prune.push(`- ${url} — known ${age(url)} d, 0 impressions in 28 d`);
    if (!totals.d90.some((r) => r.page === url)) neverSeen.push(`- ${url} — in the sitemap, no row in 90 d (${age(url)} d known)`);
  }

  // Section alerts and cohorts.
  const sum = (rows: PageRow[], f: (r: PageRow) => boolean) => rows.filter(f).reduce((n, r) => n + r.impressions, 0);
  const sections = [...new Set([...totals.d7, ...totals.prev7, ...sitemap.map((u) => ({ page: u }))].map((r) => sectionOf(r.page)))].sort();
  const alerts: string[] = [];
  const sectionLines = sections.map((s) => {
    const now7 = sum(totals.d7, (r) => sectionOf(r.page) === s);
    const before7 = sum(totals.prev7, (r) => sectionOf(r.page) === s);
    const drop = before7 >= 200 && now7 < before7 * 0.8;
    if (drop) alerts.push(s);
    return `| ${s} | ${before7} | ${now7} | ${drop ? "DOWN ≥ 20 %" : ""} |`;
  });
  const cohortLines = [14, 28, 56].map((d) => {
    const cohort = totals.d90.filter((r) => age(r.page) >= d && age(r.page) < d + 14);
    if (!cohort.length) return `| ${d} d | 0 | – | – | – |`;
    return `| ${d} d | ${cohort.length} | ${median(cohort.map((r) => r.impressions))} | ${median(cohort.map((r) => r.position)).toFixed(1)} | ${cohort.filter((r) => r.clicks > 0).length} |`;
  });

  // Prompt-shaped queries → the AI-answer panel.
  const prompts = queries28.filter((r) => r.keys[0].split(/\s+/).length >= 7).sort((a, b) => b.impressions - a.impressions).slice(0, 50);
  if (prompts.length) {
    fs.appendFileSync(PROMPTS_FILE, `\n## ${endDate}\n\n${prompts.map((r) => `- "${r.keys[0]}" → ${r.keys[1]} (${r.impressions} impr, pos ${r.position.toFixed(1)})`).join("\n")}\n`);
  }

  const top = [...totals.d28].sort((a, b) => b.clicks - a.clicks).slice(0, 15);
  const report = [
    `# Search Console monitor — ${endDate}`,
    "",
    `Property \`${site}\` · windows end ${endDate} (data lags 2–3 days) · floor ${FLOOR} impressions · ${sitemap.length} sitemap URLs · ${totals.d90.length} URLs with impressions in 90 d · ${total90} impressions in 90 d.`,
    "",
    "Read as trends, never as a day; a section under eight weeks old is judged on its daily trend and page ages, not on this table (master plan §8).",
    "",
    "## Section alert (7 d vs previous 7 d)",
    "",
    "| Section | previous 7 d | last 7 d | |",
    "|---|---|---|---|",
    ...sectionLines,
    "",
    alerts.length ? `**ALERT:** ${alerts.join(", ")} fell 20 % or more.` : "No section fell 20 % or more.",
    "",
    "## Young cohorts (pages under 90 days)",
    "",
    "| Age | pages | median impr (90 d) | median position | pages with a click |",
    "|---|---|---|---|---|",
    ...cohortLines,
    "",
    `## CTR gap (${ctrGap.length}) — rewrite the title and description first`,
    "",
    ...(ctrGap.length ? ctrGap : ["- none"]),
    "",
    `## Refresh (${refresh.length}) — striking distance, improve the content`,
    "",
    ...(refresh.length ? refresh : ["- none"]),
    "",
    `## Watch (${watch.length}) — under 28 days old`,
    "",
    ...(watch.length ? watch : ["- none"]),
    "",
    `## Prune (${prune.length}) — merge, improve or noindex`,
    "",
    ...(prune.length ? prune : ["- none"]),
    "",
    `## Never seen (${neverSeen.length}) — in the sitemap, no impression in 90 days`,
    "",
    ...(neverSeen.length ? neverSeen : ["- none"]),
    "",
    "## Top pages by clicks (28 d)",
    "",
    "| Page | clicks | impressions | CTR | position |",
    "|---|---|---|---|---|",
    ...top.map((r) => `| ${r.page.replace(CANONICAL_ORIGIN, "")} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(2)} % | ${r.position.toFixed(1)} |`),
    "",
    `Prompt-shaped queries (≥ 7 words) this run: ${prompts.length} → seo/ai-panel/prompts-from-gsc.md`,
    "",
  ].join("\n");
  fs.writeFileSync(REPORT, report);
  console.log(report);
  if (alerts.length) {
    console.error(`section alert: ${alerts.join(", ")}`);
    return 1;
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`monitor failed — the queues were NOT touched: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(2);
  });
