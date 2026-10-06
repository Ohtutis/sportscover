# seo/ — measurement for the SEO plan (docs/SEO-PLAN-GDE-2026-10.md)

Three things live here, none of them edits a page.

## 1. The weekly Search Console monitor — `npm run seo:monitor`

`scripts/seo/gsc-monitor.ts` reads Search Console for every URL with impressions (7 / 28 / 90 days),
joins the live sitemap as the denominator, stores a snapshot under `seo/history/<date>.json` (Search
Console keeps 16 months; we keep ours) and writes `seo/REPORT.md` with one verdict per URL: **CTR gap**,
**Refresh**, **Watch**, **Prune**, **Never seen**, plus a per-section alert and the young-page cohorts.
Prompt-shaped queries (7+ words) are appended to `seo/ai-panel/prompts-from-gsc.md` for the panel below.

It needs two environment variables (local `.env.local`, never committed):

```
GSC_SITE_URL=sc-domain:gamedayedition.com
GSC_SERVICE_ACCOUNT_FILE=/path/to/service-account.json
```

How the owner creates them (once, ~10 minutes):
1. Search Console → add a **Domain** property `gamedayedition.com` (DNS TXT record at the registrar).
   Add a second owner (a second Google account) as the plan says.
2. Google Cloud console → a project → enable the "Google Search Console API" → create a **service
   account** → create a JSON key → download it.
3. Search Console → Settings → Users and permissions → add the service account's email as **Full** or
   **Restricted** user (read is enough).
4. Run `npm run seo:monitor`. The floor (`--floor`, default 20 impressions) is deliberately low for a
   young site; raise it when a queue holds more than 30 pages.

Fail safe, fail loud: without credentials it exits 2 and touches nothing; zero rows for the whole
property exits 3 (a wrong property URL returns zero rows, not an error); a section down ≥ 20 % exits 1
so a scheduler notices. Run it every Monday; read `seo/REPORT.md`; commit the history files.

## 2. IndexNow after every deploy — automatic

`.github/workflows/indexnow.yml` waits until production serves the pushed commit (`/api/version`),
then `scripts/seo/indexnow.ts` reads the LIVE sitemap, keeps only URLs that return 200, and pings
IndexNow (Bing, Yandex, Naver, Seznam, Yep). The key is `lib/seo/indexnow.ts` and the key file is
served from `public/`. By hand: `npm run seo:indexnow -- --dry` to list, without `--dry` to send.
Google does not take IndexNow; it reads `/sitemap.xml` (submitted once in Search Console).

## 3. The AI-answer panel — monthly, by hand, free

`seo/ai-panel/questions.json` holds 30 questions buyers ask, in five tiers, each naming the page we
want cited. Once a month, ask each question on three engines (Google AI Mode / AI Overview, ChatGPT
with search, Perplexity) and record a row per engine in `seo/ai-panel/log.csv`:

```
date,engine,id,cited,named,cited_urls
2026-11-03,perplexity,buy-01,1,0,"https://www.gamedayedition.com/trading-cards; https://…"
```

`cited` = one of our URLs is among the sources; `named` = "Game Day Edition" appears in the answer.
Report the cited share and the named share **per engine**, never averaged, on a rolling four-run
window. Every gap gets exactly one action (a section on the target page, a new question page, a blog
brief, or off-site outreach where the answer rests only on review sites).
