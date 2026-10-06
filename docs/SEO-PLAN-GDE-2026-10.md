# GDE SEO plan — 2026-10-06

The owner's SEO master plan (`/Users/a/Documents/Glass bricks claude files/SEO/SEO-Masterplan.md`, 2026-10-06) applied to
gamedayedition.com. This file is the working plan: what was built on 2026-10-06, the rules the build now enforces, the
measurement loop, the dated gates, the "not doing" list, and what only the owner can do. Read it with
`docs/SITE-BUILD-SPEC-2026-09.md` §8 (the spec's SEO section) and `docs/SITE-MASTER-PLAN-2026-09.md` §7 (the older canon); where
they disagree, this file wins.

## 0. The site in the master plan's terms

| Master plan | Here |
|---|---|
| Entity page (one thing and its facts) | `/sports/[sport]` — nine sports with a live listing, each from a fact row in `lib/seo/sport-facts.ts` |
| Grid (entity × facet) | NOT built: sport × finish has no demand (`lib/seo/intents.ts` refuses the phrase by rule); the finishes stay sections on `/trading-cards#finishes` |
| Hub with a comparison table | `/sports` (17 tiles; the number / crest / plain-back truth per sport), `/senior-night` (hub) |
| Occasion × entity | `/senior-night/[sport]` — nine spokes from `lib/seo/senior-night-facts.ts`, each in the measured word order |
| Money pages | `/free-proof` (the conversion), `/trading-cards`, `/posters`, `/complete-set`, `/banners`, `/senior-night`, `/christmas-gift`, `/teams` |
| Question layer | `/faq`, the per-page FAQ subsets, the blog (11 posts), the sport and spoke FAQs |
| Verdict up top, provenance | every fact row has a `verdict`; `head.searches` + `head.measured` record where the demand figure came from (Etsy Marketplace Insights, not Google — the proxy until Search Console has rows) |
| Tool with an honest "no" | the senior-night order-by calculator (`lib/capacity.ts`): "files only", "printed after the night", gift the digital first |
| Live data with a snapshot fallback | the Christmas order-by dates (`christmasDates(now)`), computed at render, hourly |
| Machine-readable facts | `/llms.txt` (pages, sport lines, every FAQ answer verbatim, the do-not-say firewall, how to cite), `/sitemap.xml` |
| Verified-absence list | `tests/forbidden-strings.test.ts` + `lib/seo/intents.ts` NEVER_TARGET |

The demand shape is **mixed**: a small head ("custom trading cards", "custom baseball card"), a sport × occasion grid with real
cells (senior night by sport, the mom shelf by month), and a question tail (photos, sizes, numberless sports). Most volume sits
in the seasonal engines: senior night (Sep–Oct, Jan, Apr), Christmas (Oct–Dec), spring baseball/softball (Mar–May).

## 1. Built on 2026-10-06

### Pages (every one answer-first, from a fact row, with BreadcrumbList; FAQPage only on visible Q&A)
- `/sports` + `/sports/{basketball,football,baseball,softball,soccer,ice-hockey,volleyball,wrestling,cheerleading}` — hub + nine
  sport pages. Head phrase per sport from `etsy/SEO/MASTER-KEYWORD-PLAN-2026-09-07.md` in the searcher's word order ("custom
  basketball cards" plural, "custom football card" singular; where no card head exists the gift door leads: "volleyball gifts",
  "cheer gifts", "custom softball", "custom hockey", "wrestling gifts", "soccer gifts"). Sections: what's on the card (front/back
  in that sport's words + the computed back line), the sport's photo traps, the season and its senior night, the card tiers,
  the sport's own questions, related pages and public demo cards.
- `/senior-night/{football,volleyball,soccer,cheerleading,basketball,wrestling,softball,baseball,ice-hockey}` — nine spokes.
  H1 in the measured word order ("SENIOR NIGHT VOLLEYBALL." vs "FOOTBALL SENIOR NIGHT."), the order-by calculator, when the
  night falls, the ritual, what the senior back carries, the night's photo notes, the SN banner where a listing exists, the
  sport's questions.
- `/banners` — the banner family: three printed sizes from `bannerTiers` + the file, eleven sport banner listings, eight senior
  night banner listings, Product JSON-LD.
- `/christmas-gift` — order-by dates computed from `christmasDates(now)`; the four products; by sport; gift the digital first.
- `/teams` — honest for today: email-first team setup, every family orders its own athlete through the free-proof form.
- Blog +4: Christmas gifts for athletes, winter senior night (Jan), how big is a trading card (a specific question), custom
  baseball cards complete guide. 11 posts total; every one keeps the link rule, one CTA, no price, no date promise.

### The keyword → URL map (`lib/seo/intents.ts`)
84 keywords, one owner each; a test fails on a second owner, on a never-target phrase, or on an F1 owner with no page. New
families: `/sports/*` own "custom <sport> card(s)" and the sport gift doors; `/senior-night/*` own both word orders of
"<sport> senior night"; `/banners` owns the banner family ("football banner" … "senior night banner"); `/christmas-gift` owns
"christmas gifts for athletes"; `/teams` owns the team-gift phrases. "senior banner" (no "night") stays never-targeted: on
Etsy it is the bucket-list / graduation template shelf.

### Honest dates
- Sitemap `lastmod` only where a table carries a real content date: blog posts (`publishedAt`/`updatedAt`), public card pages
  (`updatedAtOf`), sport pages and spokes (`updatedAt` in their fact row — bump it ONLY when a fact changes, never on a
  restyle). Static pages carry no lastmod (no history → omit, never invent). `tests/seo-infra.test.ts` asserts both.

### Build gates (fail, don't warn)
| Gate | Where |
|---|---|
| title ≤ 60 with suffix, description 50–155, one H1, canonical | `tests/seo.test.ts`, `tests/seo-infra.test.ts`, the page tests |
| sitemap symmetry (every F1 indexable page, every post, every public card, nothing else) | `tests/seo.test.ts`, `tests/seo-infra.test.ts` |
| truth lint (forbidden claims, no typed dollar amounts, no age word, US spelling) on sources AND rendered pages | `tests/forbidden-strings.test.ts`, `tests/blog.test.ts`, the page tests |
| one owner per keyword, never-target phrases, phase from the titles table | `tests/seo.test.ts` |
| facts, not name swaps: ≤ 20 % templated sentence shapes per page in a family, ≥ 12 own sentences | `tests/seo-families.test.ts` |
| fact-table hygiene: head phrase owned by its own page, art keys verified, no "their number" on numberless/wrestling rows, dates not in the future | `tests/seo-infra.test.ts` |
| internal links resolve (concrete pages, valid `[sport]` slugs, blog slugs, registry ids) | the page tests, `tests/blog.test.ts` |
| FAQ answers standalone-true; FAQPage once per page | the page tests |

### AI search (master plan §7)
- `/llms.txt` is generated from the same data as the pages: the key pages, every sport page and spoke with its verdict, every
  blog post, **every FAQ answer verbatim**, a **misquote firewall** ("Do not say …" — registered ≠ official/licensed, proof first
  ≠ immediate, square-cut, numberless sports, fictional athletes, 18 cards total), and how to cite.
- Robots: all crawlers allowed (search bots and training bots alike — a new brand needs to be cited, and the site has no
  secrets); the only disallows are `/api/`, `/go/`, `/etsy`, `/order/`, `/t/`, `/lp/`, `/registry/lookup`. Vercel, no Cloudflare,
  so no silent AI-bot block.
- Every FAQ item has a stable anchor; every sport question has an id (`#q-<sport>-…`).
- The AI-answer panel: `seo/ai-panel/questions.json` (30 questions, five tiers, each naming the page to be cited); run by hand
  monthly on three engines, logged per engine (cited and named are different numbers). Cost today 0.

### Measurement (master plan §8)
- Attribution: the free-proof request already stores `source` (landing path, referrer, utm). `components/EntryAttribution.tsx`
  now records the session's FIRST page in sessionStorage so the request can carry the entry page rather than `/free-proof`
  (the "/#early-access" trap). Integration step pending: `components/intake/model.ts` `captureSource` reads the stored entry
  when present (one line; waits for the form builder to finish).
- `npm run seo:monitor` — the weekly Search Console monitor (`scripts/seo/gsc-monitor.ts`): per-URL history under
  `seo/history/`, the live sitemap as denominator, one verdict per URL (CTR gap, Refresh, Watch, Prune, Never seen), section
  alerts (7 d vs previous 7 d), young cohorts, prompt-shaped queries → the panel. Fails loud without credentials.
- `npm run seo:indexnow` and `.github/workflows/indexnow.yml` — after every push to main, wait until `/api/version` serves the
  pushed commit, then ping IndexNow from the LIVE sitemap, 200s only. Google reads the sitemap itself.
- Vercel Analytics + Speed Insights already on every marketing page (cookieless; never on `/c`).

## 2. The rules this site keeps (the master plan's "rules on one screen", localised)
1. No fact table, no page. A new sport page needs a row in `sport-facts.ts`; a new spoke a row in `senior-night-facts.ts`.
2. A new URL needs its own demand: ~50+ Etsy/Google searches a month or 20+ Search Console impressions, or a specific question
   People Also Ask / our own queries show. Otherwise it is a section on an existing page.
3. Existing pages get first claim: before any new page, read `seo/REPORT.md`; a query a page already ranks 3–20 for becomes an
   H2 or FAQ there.
4. Specific beats general: "how big is a trading card", "can a cheerleader have a card with no number" over "what is a trading card".
5. Answer first; the verdict lives in the fact row, with its hedge inside it ("usually in October" is typical, never a promise).
6. Every number has a source that prints it: prices from `prices.ts`, clocks from `delivery.ts`, counts from `tiers.ts`, dates
   from `capacity.ts`. A missing fact is never a negative fact (no "doesn't" without the verified-absence list).
7. Dates are earned: `updatedAt` moves on a fact change only.
8. The build says no: the gates above, in CI, on every push.
9. Judge pages by what they earn: the sport pages and spokes are money pages (judged on free-proof requests by entry page);
   the blog and the FAQ earn visits, links and citations.

## 3. Not doing (with the reason — revisit only on a trigger)
| Lane | Why |
|---|---|
| `/styles/[finish]` ×6 | nobody searches a finish by name; would cannibalise the sport pages. Trigger: impressions for a finish name in Search Console. |
| Sport × finish pages | same; refused by rule in `intents.ts`. |
| Bare "<sport> cards" | the licensed-card shelf (Panini/Topps intent). |
| "personalized card" | greeting cards. |
| "senior banner" (no "night") | bucket-list / graduation template shelf. |
| Dance, track, band, lacrosse senior night | no product fit (no card listing); the sport banners for lacrosse/track exist and live on `/banners`. |
| `/blankets` | listings are drafts, prices are not in `prices.ts`; the intake sells it with "price confirmed on the proof". Trigger: the 11 blanket listings go live + prices land. |
| Paid keyword API studies | pre-revenue (cost discipline); the Etsy Marketplace Insights harvest (3,900 phrases) is the proxy until Search Console has rows. Trigger: the first 100 non-brand impressions. |
| hreflang / other markets | one market (US). |
| MCP server / open dataset | no data anyone wants to query. |
| Review markup | none until ≥ 5 real, consented reviews exist (spec §8). |

## 4. Dated gates (commit to them; check them)
| Date | Gate | If missed |
|---|---|---|
| 2026-10-13 | Search Console Domain property live, sitemap submitted, 5 key URLs inspected; Bing imported; first `npm run seo:monitor` run | nothing else matters until this is true |
| 2026-11-03 | ≥ 25 of the ~55 sitemap pages indexed (URL inspection / the monitor's "never seen" list shrinking) | inspect the never-seen URLs; check internal links reach them |
| 2026-11-17 | non-brand impressions trending up week over week on `/senior-night/*` or `/sports/*`; first AI-panel run logged | re-read the SERPs for the heads; retitle the losers to the adjacent intent |
| 2026-12-15 | first non-brand click on a sport page or spoke; first free-proof request whose entry page is one of them | scope down: fold the weakest spokes into the hub |
| 2027-01-15 | the winter spokes (basketball, wrestling, hockey) at position ≤ 20 for their head | refresh desk on those three |

## 5. Weekly / monthly loop
- **Monday:** `npm run seo:monitor` → read `seo/REPORT.md` → one action per queue line (title/description for CTR gap; a
  section for Refresh; nothing for Watch; merge/noindex for Prune; inspect Never seen). Commit `seo/history/`.
- **Every publish:** CI gates → merge → Vercel → IndexNow (automatic).
- **Monthly:** the AI-answer panel by hand (30 questions × 3 engines, ~40 min); sweep every changed figure across posts and
  llms (automatic — they read the tables); re-check the Etsy head phrases (`etsy/SEO` cadence).
- **Quarterly:** re-verify the fact rows (seasons, rituals, listing ids), export Search Console (16-month retention).

## 6. Owner actions (nothing else is blocked on these; the pages are live without them, the measurement is not)
1. **Search Console** (10 min): add the Domain property `gamedayedition.com` by DNS TXT, add a second owner, submit
   `https://www.gamedayedition.com/sitemap.xml`, inspect `/`, `/free-proof`, `/senior-night/volleyball`, `/sports/baseball`,
   `/banners`. Then either (a) create a Google Cloud service account with the Search Console API enabled, add its email to the
   property as a user and put the JSON at `GSC_SERVICE_ACCOUNT_FILE` for `npm run seo:monitor`, or (b) tell me and I'll walk
   through it with you — `seo/README.md` has the steps.
2. **Bing Webmaster Tools** (2 min): import from Search Console. IndexNow is already wired.
3. **Vercel env** (if you want the meta-tag route instead of DNS): `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`,
   `NEXT_PUBLIC_BING_SITE_VERIFICATION`, `NEXT_PUBLIC_PINTEREST_DOMAIN_VERIFY`, `NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION` —
   the root layout already prints whichever is set.
4. **Supabase + Resend** (from the free-proof handoff): unpause the project, bucket `athlete-submissions`, `RESEND_API_KEY`,
   redeploy — until then a submission falls back to email and no attribution row is stored.
5. **Blanket prices** into `lib/catalog/prices.ts` when the listings go live (then `/blankets` passes the new-URL rule).
6. **Etsy listing texts**: each sport's card/poster/SN listing description may link the matching site page for the
   informational modifiers (ideas, checklist, timeline, sizes) — the Etsy off-platform rule allows the link for fulfilment,
   not for the sale; keep the head phrase identical in both.

## 7. Where the numbers came from (provenance, never printed on a page)
`etsy/SEO/MASTER-KEYWORD-PLAN-2026-09-07.md` (Etsy Marketplace Insights, 30-day windows, dated per section),
`etsy/SEO/NICHE-REPORT-2026-08.md` (12-month curves), `etsy/SEO/ETSY-SEO-FINDINGS.md`. Treat every figure as Etsy demand
standing in for Google demand; the first Search Console export replaces them as the source of truth.
