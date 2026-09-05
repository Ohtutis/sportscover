# Etsy Growth Playbook — 0 → $10,000/month

> **Measured data lives in `etsy/SEO/ETSY-SEO-FINDINGS.md`** (2026-08-27): which terms we are
> indexed for, the keyword map with searches/results/conversion, price medians and the
> decisions taken from them. This file is the mechanism; that one is the evidence.


Written 2026-08-26, the day after launch (3 live listings, 0 orders, 0 Etsy Search visits).
Companion docs: `etsy/LISTING-STATE.md` (what's built), `docs/ETSY-LISTINGS.md` (listing
architecture), `etsy/research/` (market data). Prices per the locked ladder: digital
49/49/89, physical 69–129 (memory: ads only break even above ~$69 — advertise the set, not
the $49 items).

## How Etsy search actually ranks you

Every lever below maps to one of these factors:

1. **Query match** — title, tags, category, attributes. You only rank for phrases you
   literally contain.
2. **Listing quality score** — CTR from search, favorites, and above all **conversion
   rate**, accumulated *per listing* forever. A listing that converts climbs; one that gets
   impressions but no clicks sinks. This is why breadth beats endless optimization of 3
   listings: each new listing starts with a clean score and a temporary **new-listing
   recency boost**.
3. **Customer & market experience score** — reviews, completed profile/policies, no cases,
   message response time. Shop-wide.
4. **Personalization** — Etsy shows different results per buyer; there is no single
   "position #1". Judge progress by Search visits and orders, not by eyeballing rank.

Digital items skip the shipping-price factor entirely — an advantage.

**The core loop:** more listings → more lottery tickets in long-tail queries → first sales
→ conversion data + reviews → quality score rises → broader queries unlock → more sales.
External traffic that converts feeds the same loop. $10k/mo ≈ 112 orders at $89, or ~150
at a $65 mix ≈ **4–5 orders/day**. With 60+ listings that is 2–3 orders per listing per
month — an unremarkable number for a ranked shop in gift season.

## The one forbidden lever

Coordinated fake sales / bought reviews / self-purchases. Etsy's fraud model flags exactly
this on new shops: purchases with no browse pattern, buyer accounts with thin history,
review text that echoes the listing. Outcome is suspension + held funds, usually
unappealable in the first 90 days. Everything else in this playbook is legitimate,
including aggressively discounted sales to people you actually know — the line is: the
buyer genuinely wants the product and nobody scripts the review.

---

## Phase 0 — Close the promises (this week, before scaling traffic)

The listings already promise things the repo can't deliver. First orders will hit these.

- [ ] **24×36 poster path for all 6 finishes.** The 2:3 template exists; only SN/CA/FS have
      proof exports. Make the 4× export a one-command step per finish.
- [ ] **Regenerate stale bonus PNGs** — `exports/*/bonus/` sticker+badge and all four
      `exports/shared-cutouts/` still show Nia Brooks; Figma sources are correct.
- [ ] **Registry page** (`app/c/[cardId]`) — minimum shippable: card render + name +
      finish + season. It's promised in all three descriptions.
- [ ] **Update `etsy/LISTING-STATE.md`** — it still says "none are published".
- [ ] **Listing videos ×3** — flip videos exist in `card-flip/out/`; cut 8–12 s versions
      (their photos → rebuilt athlete → product), no audio needed. Video listings convert
      measurably better and video is a slot competitors mostly leave empty.
- [ ] **Shop featured video + 5 featured photos** (structure already planned in the
      2026-08-25 handoff).
- [ ] **Order-fulfillment dry run**: run one fake order end-to-end (intake → proof →
      delivery files) and time it. Target ≤ 30 min/order at current volume.

## Phase 1 — Listing blitz (weeks 1–4, the single biggest lever)

Templates make marginal listing cost ~1–2 h. Target **40–60 listings in 30 days**, then
100+ by Q4. Cadence: 2–3/day sustainable; don't dump 30 in one day (looks botlike, and
you want recency boosts spread over weeks).

**Matrix** — sport × product × occasion:

- Sports, in demand order: basketball, football, volleyball, soccer, baseball, softball,
  cheer, hockey, wrestling, then the rest. (Football roster is 6/8 and soccer 7/8 — finish
  them; they're the two biggest US markets.)
- Products: card, poster, complete set.
- Occasion variants as **separate listings** with their own titles/tags/hero:
  **Senior Night** (football senior night is *September–October* — this is the window,
  now), End of Season, Coach Gift, Christmas (build in October, rank by November),
  Graduation (spring).

**Rules for each listing:**

- Unique title, keyword-first, distinct phrase per listing (no near-duplicate titles —
  they cannibalize). Pattern: `Custom [Sport] [Product] [Occasion] | Personalized Athlete
  Gift From Your Photos | Digital Download`.
- All 13 tags, all multi-word, no words wasted repeating the title's exact phrases beyond
  the head terms. Mine tags from **Marketplace Insights first** (research before naming
  anything; always browse with `&ship_to=US`).
- Hero image swapped to that sport's athlete (all roster art exists), 4:5-safe crop, text
  ≥44 px, never "instant download".
- Reuse the 20-slide sets; swap hero + sport-specific slides only.
- Once a listing has impressions, **freeze title/tags for 30 days**. Iterate only on
  listings with impressions-but-no-clicks (hero problem) or clicks-but-no-sales (price/
  description problem).

## Phase 2 — First 10 sales and ~5 reviews (weeks 1–3, parallel)

Reviews gate everything; a shop with 0 reviews converts a fraction as well.

1. **Real network sales.** Offer the digital set at a deep honest discount (coupon code,
   50–70 % off) to people who actually have a young athlete — friends, teammates' parents,
   diaspora contacts in the US. They buy on Etsy themselves, from their own accounts,
   because they want it. Ask nothing about reviews; happy buyers of personalized kids'
   products review at a high rate on their own.
2. **Sports-parent communities.** US Facebook groups (team parents, senior night planning,
   sports mom groups), local club pages. Post as a maker with a launch offer — most groups
   allow this on promo days. This is the same demographic that buys.
3. **Etsy coupon** for favoriters/abandoners (Shop Manager can auto-send these) — Etsy's
   own tool, zero risk.
4. **Over-deliver on the first 10**: answer messages in minutes, proof same day, include a
   surprise extra file (wallpaper pack). After delivery, one polite message: "if you're
   happy with it, a review helps a small shop enormously" — allowed; incentivized reviews
   are not.

## Phase 3 — Paid traffic (start week 1, scale on data)

**Etsy Ads** — start $10–15/day, all listings on, digital-only so no shipping-cost drag:

- First 2 weeks are a *data purchase*: the search-terms report tells you real queries →
  feed them back into new listings' titles/tags (write new listings rather than editing
  frozen ones).
- After 100+ clicks/listing: kill ROAS < 1 on $49 items, keep the $89 set running even at
  break-even (review velocity + ranking momentum are worth it). Ads convert best after ~5
  reviews exist — expect week 1 to look bad; don't quit early.
- Scale winners toward $25–50/day once ROAS > 2.

**Offsite Ads**: under $10k lifetime revenue you may opt out (12 % fee on attributed
sales). Recommendation: **stay in** — 12 % of a $89 digital sale still carries ~85 %
margin, and it's free exposure until it converts.

**Pinterest — the sleeper channel for this exact product.** Sports-mom + gift-search
demographic lives there, and it's search-driven like Etsy but far less contested:

- Organic: every listing's hero + the per-finish room shots + flip-video stills, pinned to
  boards per sport/occasion ("Senior Night Ideas", "Basketball Gifts"), each pin linking
  to its listing. The 20-slide sets are a ready-made pin library — 200+ pins of existing
  art.
- Paid: $5–10/day on "senior night gift ideas", "basketball gifts for boys" etc. Pinterest
  CPCs in this niche are a fraction of Meta's.

**TikTok / IG Reels**: the card-flip videos + a "their photos → their edition" reveal
format is native content. Post 3–4/week; one semi-viral reveal video can outdo a month of
ads. Zero cost except cutting time.

**External traffic bonus**: off-Etsy visitors who buy raise the listing's conversion rate,
which raises organic Etsy rank — paid/social traffic compounds into free traffic.

## Phase 4 — Scale (months 2–4)

- **Seasonal calendar is the demand curve; ride it**: Sept–Oct senior night (football,
  soccer, volleyball, cheer) → Nov–Dec Christmas (build listings in October) → Feb–Mar
  winter senior night (basketball, hockey) → May–Jun graduation + end of season.
- **Price up, not down.** Once reviews exist, test the set at $99–119 (ads math works from
  ~$99). Add a "Deluxe" tier (rush 24 h delivery +$30; extra poses +$20). Personalized
  gift buyers are price-insensitive; underpricing reads as low quality.
- **Physical tier** via TGC (US, sealed pack $6.74): printed poster + sealed pack at
  $129–149. Physical AOV is what actually reaches $10k/mo fastest.
- **Star Seller** (messages <24 h, on-time delivery, ratings) — badge + measurable search
  benefit; digital delivery makes the shipping metric free.
- **Weekly dashboard** (15 min, same day each week): Search visits, CTR, conversion,
  revenue, top search terms, per-listing winners. Double the winners' variants; recut
  losers' heroes.

## Milestones

| When | Target | Meaning |
|---|---|---|
| Week 2 | first 3–5 sales, 2–3 reviews | loop is primed |
| Week 4 | 30+ listings, Etsy Search visits > direct | organic ranking has started |
| Month 2 | 20–30 orders (~$2k) | product-channel fit; scale ads |
| Month 3 | 60+ listings, 50+ orders (~$4–5k) | senior-night peak captured |
| Month 4–6 | physical tier + Q4 | $10k/mo path: ~90 digital + ~20 physical orders |

If week-4 search visits are still ~0: the problem is titles/tags (re-mine Marketplace
Insights); if visits exist but no sales: heroes/price/reviews. Diagnose before spending.
