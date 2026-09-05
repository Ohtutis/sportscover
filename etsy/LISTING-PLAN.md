# Etsy listing plan — how many listings, what they cost, what they share

Written 2026-08-24. Answers one question: **how many listings do we end up with, and what is
in each.** Prices from `listings/*.json`; image counts from `CREATIVE-BRIEF.md`.

## The two axes, and which one we duplicate on

Every listing sells the same production. There are two ways to make more of them:

- **By sport** — "custom baseball card", "custom hockey card". This is where the search volume
  is. A parent types their kid's sport, never a finish name.
- **By finish** — "Chrome All-Star card", "Heritage card". This is what
  **StickWithCharlotte does** (8 listings in the US top 30: King, Ace, Classic, Modern,
  Premier, Retro, plus two more) and it demonstrably ranks.

**We duplicate by sport and keep all six finishes inside every listing.** Our finish names are
ours alone — nobody searches them — whereas "custom softball card" is a query with real demand.
The six finishes stay in the personalisation box, which is also forced by Etsy's cap of two
variation properties (we spend both on package × turnaround, because those are the two that
change the price).

## Variations, identical on every personalised listing

| Property | Values | Changes price |
|---|---|---|
| **Package** | 3 tiers, named per listing | yes |
| **Turnaround** | Standard 3–5 days / Rush 24 h | yes, +$25 |
| Art finish | Stadium Night · Chrome All-Star · Fire & Smoke · Heritage · Signature Spotlight · Prism Rush | no — personalisation text |
| Sport | 17 | no — it is the listing |

Six offerings per listing (3 packages × 2 turnarounds).

## The listings

### Stage 1 — launch · **4 listings**

| # | Listing | Type | Photos | Floor → ceiling |
|---|---|---|---|---|
| 1 | Custom sports trading card, any sport | made-to-order digital | **20** | $24 → $84 |
| 2 | Custom sports poster, any sport | made-to-order digital | **10** | $29 → $89 |
| 3 | Senior night set | made-to-order digital | **10** | $39 → $104 |
| 4 | Sport wall art, non-personalised | **instant download** | 8 | $9 → $24 |

Listing 4 is the only one that can honestly be an Etsy instant download — the file is identical
for every buyer. It also costs nothing to make: it comes from the 96 backgrounds we already
have. It exists to catch decor traffic and cross-sell into listing 1.

### Stage 2 — per-sport cards · **+8 listings → 12 total**

Duplicates of listing 1, one per sport, starting with the eight with the most demand:
baseball, basketball, football, softball, soccer, ice hockey, volleyball, wrestling.
Same price ladder, same six offerings.

**Only 3 of the 20 photos change** (01, 02, 03 — the in-hand shots and the transformation, which
must show that sport's athlete). Frames 04–20 are shared unchanged. That is the whole economy:
**3 new images buys a listing.**

### Stage 3 — per-sport posters · **+8 listings → 20 total**

Same eight sports, duplicates of listing 2. Shares the poster image library; only the room
mockup and the transformation change.

### Stage 4 — the long tail · **+18 listings → 38 total**

The remaining nine sports (lacrosse, cheerleading, gymnastics, track & field, swimming, tennis,
golf, pickleball, skateboarding) as cards **and** posters. Add these only once stages 2–3 show
which sports actually convert — nine sports × two families is the point where admin starts to
cost real time.

### Stage 5 — sealed foil pack · **+1 listing → 39 total**

Blocked on a print sample. Physical, ships. ~12 photos. **Do not advertise below $99.**

---

## Totals

| Stage | New | Running total |
|---|---|---|
| 1 · launch | 4 | **4** |
| 2 · 8 sports, cards | 8 | **12** |
| 3 · 8 sports, posters | 8 | **20** |
| 4 · long tail, both families | 18 | **38** |
| 5 · pack | 1 | **39** |

**Ceiling is 39 listings.** Realistic near-term target is stage 3 — **20 listings** — which
covers the eight sports that carry the demand in both families.

---

## Digital only, or do we mix print in?

**Not in the same listing.** Three reasons, all of them practical:

1. A printed card needs a real shipping profile and transit time. It turns "Rush 24 h" — our
   clearest price ladder — into a seven-day wait, and the two cannot sit under one turnaround
   variation.
2. Frame 20 says **DIGITAL FILES ONLY — NOTHING SHIPS.** That frame is return-and-1-star
   insurance (`research/AUDIT.md`, finding 6). The moment one variant ships something, the
   frame is a lie and the protection is gone.
3. The physical sellers compete on print stock, slabs, sleeves and packaging —
   StickWithCharlotte sells a graded slab at $42 and a tear-open foil wrapper. That is a
   different operation, not a variation.

**But print is where the money is**, and the audit says so plainly: our $24 digital floor sits
against StickWithCharlotte's $30–66 physical ladder and 138 item reviews. So the answer is a
**separate physical listing**, not a mixed one:

| # | Listing | Type | Floor → ceiling | Blocked on |
|---|---|---|---|---|
| — | **Printed card, shipped** | physical, ships | ~$34 → ~$79 | a print supplier + the sealed-pack sample |

It also unblocks the two frames we cannot shoot today (01 and 02, the card in a hand), which is
the single strongest frame in the US card category. **One print run serves both listings:** the
photographs for the digital listing, and the product for the physical one.

Add it to the plan as **stage 4b**, after the per-sport rollout and alongside the pack.
Ceiling becomes **40 listings**, not 39.

## What is shared, and what is not

- **Shared across every card listing:** frames 04–20 (the method, the product, the deliverables,
  the delivery). Seventeen images built once.
- **Shared across every poster listing:** the interior mockups, the detail crop, the file list,
  the how-it-works and where-to-print frames.
- **Not shared:** frames 01–03 of each listing, the title, the tags, and the description's first
  line. Those are the SEO, and duplicating them verbatim is what makes Etsy treat listings as
  redundant.
- **Nothing is shared between the card family and the poster family except the athlete.** They
  are different visual languages — infographic versus interior — and mixing them is the most
  common way to look wrong in this niche (`research/AUDIT.md`, finding 2).

## Per-listing photo budget

| Family | Photos | Why |
|---|---|---|
| Card (listing 1 + per-sport) | **20** | The method frames 04–09 are unique to us and worth the slots. Platform max. |
| Poster (listing 2 + per-sport) | **10** | The category wins on quiet interiors; twenty infographic frames would fight it. |
| Senior night | **10** | Competitors run 3–5. Ten already doubles the field. |
| Wall art | 8 | Genuinely less to say — no athlete, no method, no personalisation. Padding would hurt. |
| Pack | ~12 | When it unblocks. |

Every listing gets **up to two videos** (3–15 s, square, silent). Three scripts exist — one per family.

## Work per new listing, once stage 1 is built

| Item | Effort |
|---|---|
| 3 new images (in-hand ×2, transformation) | needs one printed card in that sport |
| Title + 13 tags | ~20 min |
| Description | copy of the family template, first line swapped |
| Variations + personalisation | identical, copy |
| Photo-upload field | **by hand in Shop Manager, once per listing** — see `listings/README.md` |

The photo-upload field is the only step that cannot be scripted, and it is required for the
order flow to work at all. Budget it per listing, not per wave.
