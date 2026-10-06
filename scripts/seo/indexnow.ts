// IndexNow after a deploy (SEO master plan §8): the ping list is built from the LIVE sitemap, every URL
// is checked for a 200 on production first, and the key file must be served before anything is sent —
// so a draft, a future-dated page or a 404 is never announced (the plan's 158-URL mistake).
//
//   npx tsx scripts/seo/indexnow.ts                 # ping every 200 URL in the live sitemap
//   npx tsx scripts/seo/indexnow.ts --since 2026-10-01   # only sitemap rows with lastmod ≥ that date (rows without lastmod are kept)
//   npx tsx scripts/seo/indexnow.ts --dry           # list what would be sent, send nothing
//
// Exit codes: 0 sent (or dry), 2 key file not live / sitemap unreadable, 3 IndexNow refused.

import { INDEXNOW_ENDPOINT, INDEXNOW_KEY, INDEXNOW_KEY_PATH } from "../../lib/seo/indexnow";
import { CANONICAL_ORIGIN } from "../../lib/site";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const sinceIdx = args.indexOf("--since");
const since = sinceIdx >= 0 ? args[sinceIdx + 1] : undefined;
const host = new URL(CANONICAL_ORIGIN).host;

interface Row {
  loc: string;
  lastmod?: string;
}

async function text(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, { headers: { "user-agent": "gde-indexnow/1.0" }, redirect: "manual" });
  return { status: res.status, body: await res.text() };
}

function parseSitemap(xml: string): Row[] {
  const rows: Row[] = [];
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1]?.trim();
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1]?.trim();
    if (loc) rows.push({ loc, ...(lastmod ? { lastmod: lastmod.slice(0, 10) } : {}) });
  }
  return rows;
}

async function status(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: "HEAD", headers: { "user-agent": "gde-indexnow/1.0" }, redirect: "manual" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main(): Promise<number> {
  const keyUrl = `${CANONICAL_ORIGIN}${INDEXNOW_KEY_PATH}`;
  const key = await text(keyUrl);
  if (key.status !== 200 || key.body.trim() !== INDEXNOW_KEY) {
    console.error(`key file not live: ${keyUrl} → ${key.status} (deploy public${INDEXNOW_KEY_PATH} first)`);
    return 2;
  }
  const sitemap = await text(`${CANONICAL_ORIGIN}/sitemap.xml`);
  if (sitemap.status !== 200) {
    console.error(`sitemap unreadable: ${sitemap.status}`);
    return 2;
  }
  let rows = parseSitemap(sitemap.body);
  if (since) rows = rows.filter((r) => !r.lastmod || r.lastmod >= since);
  if (!rows.length) {
    console.log("nothing to ping");
    return 0;
  }

  // Only what returns 200 on production — checked in small parallel batches.
  const live: string[] = [];
  const dead: string[] = [];
  for (let i = 0; i < rows.length; i += 8) {
    const batch = rows.slice(i, i + 8);
    const codes = await Promise.all(batch.map((r) => status(r.loc)));
    batch.forEach((r, j) => (codes[j] === 200 ? live : dead).push(`${r.loc}${codes[j] === 200 ? "" : ` (${codes[j]})`}`));
  }
  if (dead.length) console.warn(`skipped ${dead.length} non-200 URL(s):\n  ${dead.join("\n  ")}`);
  console.log(`${live.length} live URL(s)${since ? ` changed since ${since}` : ""}`);
  if (dry) {
    console.log(live.join("\n"));
    return 0;
  }

  for (let i = 0; i < live.length; i += 10_000) {
    const urlList = live.slice(i, i + 10_000);
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: keyUrl, urlList }),
    });
    // 200 and 202 both mean accepted; 422/403 mean the key or the host is wrong.
    if (res.status !== 200 && res.status !== 202) {
      console.error(`IndexNow refused: ${res.status} ${await res.text()}`);
      return 3;
    }
    console.log(`IndexNow accepted ${urlList.length} URL(s) (${res.status})`);
  }
  return 0;
}

main().then((code) => process.exit(code));
