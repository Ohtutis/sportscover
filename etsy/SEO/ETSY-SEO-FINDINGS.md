# Etsy SEO — measured findings

> **2026-08-28: the plan built on this evidence lives in `ETSY-SEO-MASTER-PLAN.md`** — per-listing
> titles/tags/openers, the keyword ownership map, launch calendar and product opportunities.
> That file also adds 15 newly measured terms (volleyball SN 850, senior gifts 5.5k High,
> football mom 22.5k Typical) and one correction: the "$18 cheer SN poster with 1.1k reviews"
> cited in §4 is a Canva TEMPLATE bundle, not a finished poster.

**Researched 2026-08-27** with Etsy's own keyword tool (screenshots in `etsy/SEO/screenshots/`)
plus live search checks. All figures are **US market, monthly**. `docs/ETSY-GROWTH-PLAYBOOK.md`
explains the *mechanism*; this file is the *evidence* and the decisions that follow from it.

Shop: **GameDayEdition** — `etsy.com/shop/GameDayEdition`.

---

## 1. Are we indexed?

**Etsy internal search — yes, partly** (checked with `&ship_to=US`, ~55 results scanned per query):

| Listing | Query | Position |
|---|---|---|
| Set `4562711454` | custom sports poster trading card set | **#4** |
| Basketball card `4562666649` | custom basketball trading card | **#7** |
| Basketball poster `4562700100` | custom basketball poster | **not found** (2 pages) |
| Basketball poster `4562700100` | personalized athlete poster from your photos | **not found** |

The poster listing is live and reachable directly, but did not surface for its own title phrase.
Check its Stats → search impressions; if still zero after a day, its title/tags need re-mining.

**Google / Bing — not yet.** `site:etsy.com GameDayEdition` returns nothing on either engine
(Bing shows only unrelated shops). Normal for a new shop; Etsy submits its own sitemaps and
nothing on our side speeds it up. External search is a rounding error next to Etsy's internal
search anyway — do not spend effort there.

**Research access rules** (learned the hard way): always append **`&ship_to=US`** or US sellers are
invisible from an EU IP; `WebFetch` is blocked on etsy.com, so use the in-app browser; per-listing
sales counts are not public.

## 2. The keyword map

### 2.1 Gold — high conversion, competition we can survive

| Term | Searches | Results | Conversion |
|---|---|---|---|
| custom baseball card | 1.1k | 44.4k | High |
| soccer banner | 745 | 17.5k | **Very high** |
| sports trading cards | 246 | 45.5k | **Very high** |
| custom basketball cards | 161 | 17.9k | **Very high** |
| senior year gifts | 1.5k | 65.4k | **Very high** |
| football banner | 984 | 37.6k | Typical |
| custom football card | 422 | 42.9k | Typical |

**Small and specific beats big and generic.** These convert because the searcher already wants a
custom, personalised thing — the words *custom* / *personalized* / an occasion do the filtering.

### 2.2 Dead ends — do not spend tag slots here

| Term | Why not |
|---|---|
| custom sports card | Low conversion, trend **−26.4 %** |
| basketball gifts | Very low conversion |
| sports gifts for boys | 53 searches, **−75 %** — the phrase is dying |
| team gifts | 1.3M results, median price **$4.50–5.50** (bracelets, candles) — wrong shelf |
| football cards / baseball cards (bare) | Intent mismatch: these shoppers want **Panini/Topps collectibles**, not a custom gift |

### 2.3 The "cards" cluster is genuinely small

baseball cards 2.9k · trading cards 2.8k · sports cards 2.7k · football cards 2.3k (**+9.7 %**) ·
basketball cards 1.1k. Most of the volume in that world is **accessories**, not cards:
card holder 15.5k · card box 13.2k · binder 8.3k.

So: the cards niche is a niche. That is not a mistake — it is where the product is defensible —
but the traffic ceiling is real, and it is the reason the poster/decor side matters.

### 2.4 Decor is one to two orders of magnitude bigger

wall art 413k · wall decor 215k · **dorm room decor 172k against only 380k results — an unusually
good ratio** · gift for him 49.2k · game room decor 5.2k · man cave decor 5k ·
**gym wall art 3.3k / 63.6k results** · basketball poster 1.3k / 21.5k · kids wall art 7.4k.

The poster listing should live on this shelf: *sports wall art, gym wall art, sports room decor,
game room decor, dorm room decor, boys room decor*.

### 2.5 Recipient and occasion clusters

personalized gifts for him 10.4k · football gifts for boys 1.6k / 33.7k · teen boy gifts 1.5k ·
coach gift 2.1k · senior year gifts 1.5k (Very high).

**Seasonality is the biggest single lever we found: senior night peaks Sept–Oct at up to 7.1k
searches versus ~1k in late August, and the ramp starts now.** Football and cheerleading are
autumn sports — their listings should be live before the peak, positioned on senior night, not on
"custom football card".

## 3. Price reality

Etsy's own medians for the terms we target: custom sports card **$21.60–26.40**,
basketball gifts $10.80–13.20, team gifts $4.50–5.50. Our prices: **$41.50 card / $49 poster /
$89 set** (after the LAUNCH30 sale).

We are 2–4× the category median, which is a legitimate position but it has to be *earned inside
the first two images*: from your photos, front + back, numbered + registered edition, proof before
delivery. With zero reviews, image 02 is doing the work a review count normally does.
See `etsy/LISTING-IMAGE-CANON.md`.

An entry tier around **$19–25** (one card, digital) would sit inside the category's natural buying
band and could upsell into the set — worth testing, not yet decided.

## 4. What the competition tells us

- **ChampionCustomCards — "Custom Baseball Full Team Set"**, priced per player (~$9.68/card). The
  team channel does not run through the `team gifts` tag; it runs through a *Full Team Set listing*.
- **TemplateLockerRoom** — senior banners sold as **10-packs** for a whole team.
- A **Cheer Senior Night Poster at $18 with 1.1k reviews** — proof that the cheer buyer is the
  senior-night parent, not a "cheerleading card" shopper.
- Etsy's own filter chips on the cards query — **Slabcase · Slab · Graded · For Kids** — are free
  intent data: this niche thinks in physical slabs. Relevant when the printed product ships.

## 5. Decisions taken from this research

1. **Tags follow the exact gold phrases**, not our internal vocabulary: `custom basketball cards`,
   `sports trading cards`, `custom baseball card`, `senior year gifts`, `custom football card`.
2. **The poster listing moves onto the decor shelf** (sports wall art / gym wall art / room decor).
3. **Football and cheerleading launch on senior night positioning**, ahead of the Sept–Oct peak,
   using the existing Senior Night (SR) style.
4. **Senior night banner** becomes a real product line — `soccer banner` Very high, `football
   banner` 984 searches, bestsellers at $19–36 with thousands of reviews, and for us it is a
   re-layout of the poster, not a new pipeline. Team 10-packs follow.
5. **Full Team Set** listing with per-player pricing (cards + poster) for the coach / team-mom
   channel.
6. **Graduation crossover tags** on every senior-positioned listing.
7. **Dropped:** a personalised pennant for kids' rooms — huge results count, very low conversion.

## 6. How to run the next round

The keyword tool gives a **limited number of searches per month**, so every query must open a
*different cluster*, never a synonym of one already spent. Spelling matters — a typo returns an
error and still costs a search.

Still unqueried and worth the next slots: `cheer gifts`, `senior night`, `custom hockey card`,
`sports mom`, `end of season gift`, `basketball wall art`, `personalized poster`.

Record every result here with searches / results / conversion / trend, so the table keeps growing
into a real map instead of a series of one-off screenshots.

## 7. Rules of thumb this session produced

- **Volume is not the target; matched intent is.** A 246-search term with Very high conversion
  beats a 2.3k-search term whose shoppers want Panini.
- **A term without `custom` / `personalized` / an occasion usually belongs to someone else's
  product.**
- **Check the median price of a term before adopting it** — a term whose shelf sells at $5 will
  bring browsers, not buyers.
- **Seasonal terms must be indexed before the ramp, not during the peak.**
- **Etsy internal search is the whole game**; Google indexing of our listings is a bonus we do not
  control and should not wait for.
- Once a listing has impressions, freeze title and tags for 30 days (see the growth playbook) —
  every edit restarts the learning.

---

## 8. 2026-08-31 — the shelf audit: bottom-up market size + why Search is still 0

Measured live (in-app browser, `&ship_to=US`, logged in — own-shop personalization may
inflate our positions; treat ranks as upper bounds).

### 8.1 Indexing re-check

| Query | Our listing | Position |
|---|---|---|
| custom football card (422/mo) | football card `4563878038` | **#3, organic** |
| custom basketball poster | basketball poster | **absent, 2 pages** |
| senior night gift athlete | SR set listing | **absent, page 1** |

30-day stats: 25 visits, **Etsy Search 0**, 15 listing views total, poster = 7 views.
Etsy's own Search Visibility tool: shop ✓, listings ✓, service standards = *"insights
after 5+ orders"* — the platform itself names orders as the gate.

**The diagnosis moved.** A listing sitting at #3 for its head term with zero search
*visits* is not an indexing problem — it is a **click problem**: visits are clicks, and
on that shelf we show **$35.57 (sale from $50.81), digital**, surrounded by **physical,
shipped** cards at $10.88–$30.24. The buyer comparing thumbnails sees a file priced above
printed-and-shipped. Nobody clicks the expensive file.

### 8.2 The shelf, priced (page 1, "custom football card")

$10.88 (Bestseller) · $12.10 · $15.43 · $16.38 (printed+sleeves+shipped) · $20.57 ·
$21.29 · $24.19 · $25.68 · $25.70 (Bestseller) · $30.24 ×2 (slab, Bestseller) · $32.47 ·
$36.15 · $36.42 · $83.85 (holo slab + COA). Median ≈ **$24, physical**.

### 8.3 Bottom-up market size — public shop sales, counted today

| Shop | Product | Price | Sales | Age | ≈/mo |
|---|---|---|---|---|---|
| ArtsypartyDesign (NY) | physical slab cards | $15–24 | **51.8k** | 6 yr | ~720 |
| VistaVogue (NV) | **digital templates** | $9–13 | 19.8k | 3 yr | ~550 |
| TheSlayer3D (IN) | 3D-printed cards | $12 | 1.8k | 2 yr | ~75 |
| **StickWithCharlotte (NC)** | slab cards | $30 | **1.4k** | **8 mo** | **~175** |
| ChampionCustomCards (AZ) | cards | $21 | 221 | 9 mo | ~25 |
| GameDayCards (NY) | cards | $10.88 | 200 | 18 mo | ~11 |
| SweetwaterShore (GA) | custom posters | $42 | 250 | 4 yr | **~5** |
| FOILMONSTER (CA) | premium slab + COA | $84 | 5 | 1 mo | ~5 |

Reading: visible niche ≈ **1.5–2k orders/mo ≈ $30–50k/mo GMV**. Small, real, and NOT
closed — **StickWithCharlotte: 1.4k sales in 8 months at $30, physical.** A new entrant
broke in this year at a premium-ish price. What it was NOT: digital. And the poster
paradox: SweetwaterShore owns the custom-poster SERP and sells ~5/mo — the custom-poster
shelf itself is low-demand, matching §2's keyword map.

### 8.3b Correction on the #3 reading (owner's question, 2026-08-31)

Three qualifiers the §8.1 table needs:

- **Etsy stats never show impressions.** "Views"/"Visits" are CLICKS. A listing can sit at
  #3 all month and read 0 in stats if nobody clicks — so "0 views" does not contradict the
  position; it measures the thumbnail+price against the shelf.
- **The listing is ~3 days old.** "custom football card" = **438 searches/30d (+45.7 %,
  season starting)** ≈ 15/day → only ~45 searches have happened since it went live. At a
  normal 1–3 % CTR that is 0–1 clicks. Zero is still inside noise.
- **Our #3 was measured logged in** — Etsy personalizes and may boost one's own shop.
  A stranger's page 1 may differ. There is no objective rank, only a distribution.

**Decision point: 2026-09-12** (~200 searches will have occurred). Views still ~0 → we are
not really surfacing for strangers → re-mine title/tags. Views appear but no orders → the
shelf/price diagnosis (§8.2) stands. Cleanest free test before that: one US `FIRST10`
contact screenshots their own page 1 for the query before buying.

### 8.4 What is actually missing (in order of evidence weight)

1. **A physical option.** Every shop with velocity ships a printed card; digital clears at
   $9–13 (templates), physical at $21–36. $41.99 digital is a combination no measured
   competitor survives on. TGC (US, $6.74/sealed pack, see memory/print suppliers) makes a
   ~$39–49 physical card+pack listing feasible with margin.
2. **Listings for the measured gold terms.** "custom baseball card" = 1.1k/mo, High
   conversion, our single best measured term — **no listing exists**. Ditto soccer (745
   Very High via banner), volleyball, softball. 7 listings cover a fraction of the map.
3. **5 orders.** Etsy's own tool says signals start there → FIRST10 outreach outranks any
   further tag work.
4. **Basketball poster retitle** — ~0 impressions means the 30-day freeze does not
   protect it; winners' pattern: "Custom Basketball Poster from Photo … Senior Night Gift".
5. Season: it is football + senior-night season NOW; basketball demand arrives Nov–Mar.
   The football card at #3 is the wedge — everything external should push it.
