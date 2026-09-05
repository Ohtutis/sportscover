# Etsy — shop copy, paste-ready

Written 2026-08-24, when the shop was opened. Everything a listing or shop field needs, in the
exact wording that was approved. **Paste from here, do not re-improvise** — the tagline, About
and the disclosure block are meant to say the same thing everywhere.

The operational roster — every decided listing with prices and live-status checkboxes — is
`docs/ETSY-LISTINGS.md`; this file holds the copy and the rules.

Shop: **GameDayEdition** · `gamedayedition.etsy.com` · login `editiongameday@gmail.com`
Locked at setup: language **English**, shop country **Lithuania**, currency **USD**,
bank country **Lithuania** (payouts convert USD→EUR, 2.5%).

---

## Tagline — 53/55

```
Custom sports posters & trading cards from your photo
```

Chosen over `Personalized sports posters & trading card gifts`. "youth" was dropped
deliberately: the roster covers every age, including adult athletes.

---

## About → Headline — 113/150

```
One athlete, one edition — custom posters and collectible trading cards built from the photos you already have.
```

## About → Your story — ~2 200/5 000

```
Game Day Edition started with a simple observation: kids who love their sport end up with hundreds of photos on a phone and nothing on their wall.

So that is what we make. You send the photos you already have — a few clear shots of your athlete. We design a poster and a set of collectible trading cards around them: their name, their number, their team colors, their season. Then we print them properly, on real card stock with rounded corners, the way a card is supposed to feel in a kid's hand.

WHAT MAKES IT DIFFERENT

This is not a template with a photo dropped in. Every piece is composed for the athlete in it — the crop, the light, the type, the color. Six finishes, each with its own materials and mood, from a floodlit stadium at night to high-contrast chrome. Seventeen sports, from basketball and football to gymnastics, wrestling and pickleball.

HOW IT IS MADE

Each piece is designed here, not pulled off a shelf. We use AI imaging tools as part of the creative process, and every composition, likeness, spelling, color and detail is reviewed and finished by a person before it reaches you. If it does not look like your athlete, it does not ship.

Nothing goes to print until you have seen it. You get a proof first. If something is wrong — the number, the spelling, the crop — it gets fixed before anything is printed.

ABOUT YOUR PHOTOS

We ask for 4 to 10 photos and nothing else. No date of birth, no home address, no school name. Your athlete's photos are used for your order and for nothing else. They are never posted, shared, or used to promote this shop unless you give permission separately, after the work is done.

And if the photos you have are not strong enough to do the job well, we will tell you before you pay, not after.

WHO IT IS FOR

Senior nights. End-of-season gifts. Grandparents who want something for the wall that is not a school portrait. First-year players and last-year players. Adults who still compete.

INDEPENDENT STUDIO

Game Day Edition is an independent custom design studio. We are not affiliated with any professional league, team, school, or trading-card company, and we do not reproduce protected team or league marks.
```

---

## Every listing — "About this listing"

**The answer differs between digital and physical listings.** Fulfilment is print-on-demand
through a third-party service, so physical items have a production partner and digital ones
do not.

| Question | DIGITAL download | PHYSICAL (print-on-demand) |
|---|---|---|
| Who made it? | **I did** | **Another company or person** |
| What is it? | A finished product | A finished product |
| When was it made? | Made to order | Made to order |

Choosing *Another company or person* is what makes Etsy ask you to attach a **production
partner** — that prompt is the disclosure, and it is the point. It does **not** mean you are
reselling: you remain the designer, and Etsy allows print-on-demand for your own original
designs. What it does not allow is an undeclared partner, or reselling generic catalogue goods
you did not design.

Add the partner once at Settings → **Partners you work with**, then attach it to every physical
listing. Fill in the name here when it is registered: `________________`.

**The partner's identity stays private.** Its business name and location go to Etsy for review
and are not displayed to buyers — nobody can trace your printer and order around you. So there
is no commercial cost to declaring it, only the five minutes of the form. Skipping it, on the
other hand, is one of the most common ways print-on-demand shops get suspended, and a
suspension lands while your money is still sitting in the new-shop Payment Reserve and the
printer has already been paid.

If the wording in Etsy's form is ambiguous, use this test instead of guessing: **the correct
answer is the one that makes Etsy ask you to attach a production partner.**

## Every listing — disclosure block, paste at the end of the description

Etsy requires the seller to be the creative force **and** to disclose the use of AI tools. The
art here is generated through `art-pipeline/` (Gemini via Vertex), so this is not optional.

```
HOW IT'S MADE
Every piece is designed by me from the photos you send. AI imaging tools are
part of my creative process, and every composition, likeness, spelling, color
and detail is reviewed and finished by hand before it reaches you. Nothing is
printed until you approve a proof.
```

---

## The "PDF digital" variation inside physical listings — seen, understood, deliberately NOT copied

Competitors (e.g. VPowwer, "Personalized sports poster from photo", USD 10.37+) put a cheap
"PDF digital" variation inside a physical poster listing. What it buys them: the search card
shows the lowest variation price ($10.37 vs the real A1 at $64.27 — the bait mechanic, ~6×),
and one listing concentrates all traffic and conversion signal. What it costs: the PDF order is
technically a physical order — misleading "arrives by" dates, shipped-without-tracking, and an
automatic loss on any "item not received" case; it is also miscategorization Etsy tolerates but
does not promise to.

**Decision 2026-08-24: do not copy while the shop is new.** A star seller absorbs one dispute;
a day-old shop that already tripped a risk filter once does not. Our clean equivalents: the $43
digital card listing is the cheap search price, the $49 single-card variation is the physical
one. **Revisit after ~20 sales and a review base** — at that point it becomes an ordinary A/B
question rather than an account risk.

## Three rules that close shops

1. **No email address, website, or "message me to order" anywhere a buyer sees before
   purchase** — not in a listing, not in the shop announcement, not in a pre-sale message.
   Etsy reads that as pulling the transaction off-platform. `hello@gamedayedition.com` belongs
   on invoices, on the site, and in supplier mail — never in the Etsy storefront.
2. **Declare the Production Partner** (Settings → Partners you work with) before any *physical*
   listing goes live, and attach it to each such listing. This is not optional here — fulfilment
   is print-on-demand through a third party, which is exactly the case the rule exists for. A US
   printer producing your original design is allowed; an undeclared one is the most common
   new-shop suspension. Digital listings do not need it.
   Because the printer ships from the US, set the **shipping profile origin to the printer's US
   postal code**, not to Lithuania — that is what gives US buyers domestic delivery estimates
   and no customs. Shop country stays Lithuania; the two are separate fields.
3. **Offsite Ads** — opt out while annual revenue is under $10,000. It is on by default and
   costs 15% of an attributed order, on top of the ~10% Etsy already takes.

## Assets

- Shop icon: `exports/brand/GDE-etsy-shop-icon-1000x1000.png` — flat white shield on brand navy
  `#172C50`, built from the Figma vector `65:3`, legible at 50 px.
- Shop video: `card-flip/out/GDE_*_CardFlip_1080x1350.mp4` — 5.0 s, 1080×1350, silent, within
  Etsy's 5–15 s limit. User wants a better one rendered before it goes up.


---

# Listing architecture — FINAL PLAN (2026-08-24)

**54 listings at full build. 36 published now, 18 gated on the POD test order.**

⚠️ **Corrected 2026-08-24: Etsy digital listings do not support variations at all** ("Variations
are unavailable for digital items"). Digital = one listing, one price. Package tiers therefore
become separate digital listings — which doubles search coverage, because the card listing and
the poster listing live in different categories with different keywords.

| Wave | Listings | Count | Category | Price | When |
|---|---|---|---|---|---|
| 1 | Sport × digital CARD | 17 | Trading Card Games (Digital) | $49 | now, 2–3 days, seasonal order |
| 1 | Sport × digital POSTER | 17 | Prints → Digital Prints | $49 | now |
| 1 | Complete set (sport = picker) | 1 | Digital Prints | $89 | now |
| — | ~~Senior night set~~ PARKED → future Special Edition | — | — | — | later |
| 2 | Sport × physical (6 variations) | 17 | Trading Card Games | $59–129 | after POD test + partners declared |
| 2 | Senior night × physical | 1 | Trading Card Games | $59–129 | same gate |

Launch pricing: list at full price with a **20% launch sale** (search then shows ~$39/$39/$71
struck through — the market data shows half of all results run sales and buyers expect them).
The old $69 card+poster digital tier is folded into the $89 complete set; card+poster combos
exist only as physical variations.

## The two axes — and the rule that keeps them clean

**Sport is the SEARCH axis → one listing per sport. Package is the PRICE axis → variations
inside the listing.** Never invert them.

- A sport listing is **sport-locked**: no sport picker inside it. Photos, title and tags are all
  one sport; a picker would break the photo-truth, the per-sport conversion data, and the tag
  targeting. A buyer who wants another sport clicks to that sport's listing — that is what the
  shop page is for. The **Other Sport** listing is the catch-all (sport arrives via the text
  field there).
- **Style is always a picker** (6 finishes, custom option list) — nobody searches by finish.
- **Senior night is an OCCASION listing** — the one place where sport IS a picker (list of 17),
  because the search phrase is "senior night gift", not the sport. Do not add more occasion
  listings until this one proves itself.

## Digital listing (per sport)

Type: **Digital** + **Made To Order** · Who made it: I did · one price per listing (no
variations possible).

- CARD listing — **$49**: card FRONT + BACK files, the **card-flip video** (1080×1350 MP4,
  doubles as the listing video), and a **registry entry** — the card carries a QR to its
  digital-twin page. Card-first photos, card keywords.
- POSTER listing — **$49**: the 18×24 poster file + **phone wallpaper + social graphics**.
  Poster-first photos, poster keywords.
- COMPLETE SET — **$89**: everything from both listings **plus the exclusive digital bonus
  die-cuts** (name+number sticker + number badge, per finish in `exports/*/bonus/`) — sold
  nowhere else, so the set is "cheaper AND more", not a $9 discount.
- SENIOR NIGHT — **PARKED 2026-08-25**, moved out of wave 1 to become its own Special Edition
  physical product later (see `docs/ETSY-LISTINGS.md`). As a $99 near-copy of the complete set
  it was a duplicate listing; as a real edition it is worth building. Must be live by September
  to catch the Sept–Nov season.

  Sport is a picker only in the Complete set listing.

**Delivery:** Digital + Made To Order means files are delivered AFTER purchase through the
order page (buyer downloads from Purchases) — no instant-download file needed at publish time
and no instructions-PDF workaround. Put the "what happens next / proof in 24 h" explanation in
the photo set instead (slot 6).

Custom options (all 5 slots):

| # | Field | Type | Required |
|---|---|---|---|
| 1 | Style | List · 6 | ✓ |
| 2 | Athlete images | File upload · **10 files** (matches the About promise of 4–10) | ✓ |
| 3 | Athlete name | Text | ✓ |
| 4 | Team & colors | Text | ✓ |
| 5 | Number & position | Text | — |

## Physical listing (per sport)

Category: Trading Card Games (or Collectibles → Trading Cards) · Type: **Physical** ·
Who made it: **Another company or person** + production partner attached · Shipping profile
origin: the printer's US ZIP.

**Digital-inclusion rule: each tier includes the digital files OF WHAT YOU BOUGHT; only the top
tier includes the complete digital set.** (A cheap tier bundling the full set would undercut the
$99 digital listing.) The cross-sell runs both ways: the digital listing links to the print
edition and vice versa.

Variations (market-checked 2026-08-24, live Etsy search with ship_to=US):

Two poster sizes, both **3:4** — the template's ratio (1296×1728). 12×16 is a plain downscale
of the existing 18×24 export; **12×18 / 24×36 are 2:3 and would need per-order recomposition —
rejected** (24×36 possible later as a premium with its own template).

```
12x16 poster           $69   COGS ~$15 shipped
18-card sealed pack    $79   COGS ~$19 — fixed foil recipe (e.g. 4 foil chase + 14 standard)
18x24 poster           $89   COGS ~$20 shipped
Pack + 12x16 poster   $109   COGS ~$25
Pack + 18x24 poster   $129   COGS ~$30 (incl. COMPLETE digital set)
```
ONE pack config only (2026-08-25): no single card, no 10-card option — edition carries the
exclusivity, count carries the value, one config carries the workflow.

Floor rule: 12×16 never below $59 — a physical poster within ~$10 of the $49 digital poster
file kills the digital listing. Poster COGS checked 2026-08-24: the big-three POD (Printify /
Printful / Gelato) land 18×24 at ~$15–22 shipped US, 12×16 at ~$12–18; Printful's public
catalog starts Enhanced Matte at €6.65 (smallest size). Margins 70–85% at every tier.

Market context: template cards with sleeve/case sell at $16–24, slab singles $27–37; composed
from-your-photos posters (the real comps: BuffaloRojoDesign $81, AnythingPhotos $95.59,
SlateGraphix $59) sell at **$59–96**. A sealed personalized booster pack has no direct
competitor under $90 — it is the moat product. Every physical tier sits above its digital
counterpart ($69>49 poster, $79>49 card, $129>89 set) so the ladders never cross. Poster COGS is an
estimate until the POD test order prices it.

**Buyer-facing variation spec** (option names ≤20 chars — the Etsy limit; each line of the
description repeats what every tier contains, so the gift buyer never has to guess):

| Variation name (chars) | $ | In the box | Digital included |
|---|---|---|---|
| `12x16 poster` (12) | 69 | rolled in a tube | poster file + wallpaper + socials |
| `18-card sealed pack` (19) | 79 | sealed pack, foil chase cards mixed in — the real booster-opening experience | card files + flip video + registry QR |
| `18x24 poster` (12) | 89 | rolled in a tube | poster file + wallpaper + socials |
| `Pack + 12x16 poster` (19) | 109 | the 18-card pack + poster | card pack + poster pack |
| `Pack + 18x24 poster` (19) | 129 | 18-card pack AND the big poster | the COMPLETE digital set incl. bonus die-cuts |

Gift framing in the description: every physical tier is gift-ready as shipped (sealed pack /
toploader / tube), buyers can add Etsy's gift message at checkout, and nothing prints until the
proof is approved — so the gift arrives right, not fast-and-wrong. Delivery estimate comes from
the US printer's ZIP (domestic, no customs).

**Poster sizes: 12×16 and 18×24 only (both 3:4, one artwork).** The print pipeline is built
for 18×24 (5475×7275 @300dpi); 12×16 is a downscale. 24×36 is 2:3 → per-order recomposition →
later, if ever. Single cards ship in a toploader — say so in the
listing; the $16 segment includes protection and buyers expect it.

Pack size is **10 cards** (2026-08-19 decision) — never write 25 anywhere on Etsy.

Custom options: same 5 as digital.

## Senior night listings (digital now, physical in wave 2)

Same variations as the sport listings. Custom options (5-slot limit forces combining):

| # | Field | Type |
|---|---|---|
| 1 | Sport | List · 17 |
| 2 | Style | List · 6 |
| 3 | Athlete images | File upload · 10 |
| 4 | Athlete name | Text |
| 5 | Team, number & position | Text (combined) |

## Title + tag template (delta per sport = 2 words in the title, 3–4 tags)

```
CARD:   Custom {S} Trading Card | Personalized Athlete Gift From Your
        Photos | Digital Download | Sports Keepsake
POSTER: Custom {S} Poster | Personalized Sports Wall Art From Your
        Photos | Digital Download | Athlete Gift
```
("youth" deliberately absent — the shop serves all ages; "youth sports gift" survives only as
one of the shared TAGS, where it targets a buyer segment without excluding adults.)

Shared tags (10): custom trading card · personalized poster · youth sports gift · sports
trading card · senior night gift · custom sports art · digital download · athlete gift ·
team gift · end of season gift
Per-sport tags (3 each): the roster table in `docs/ETSY-LISTINGS.md` (all ≤20 chars).

## Launch sequence

1. **Place the POD test order for yourself TODAY** — it gates all 18 physical listings AND its
   photos are the product shots those listings need. One order, two jobs.
2. Publish digital listings over 2–3 days, seasonal order: **football, cheerleading, soccer,
   volleyball** first (US fall season, senior nights Sept–Nov), then the rest; **basketball
   polished and pinned before November**.
3. Pin the 4 featured listings: football, cheerleading, volleyball, senior night.
4. When the test order arrives: declare the production partner, photograph the physical
   product, publish wave 2.

## Photo set — the real bottleneck (10 slots, one template reused per sport)

1 card FRONT hero · 2 poster · 3 six-finish style grid · 4 card BACK · 5 phone wallpaper ·
6 how-it-works steps · 7 photo requirements · 8 proof-first promise · 9 sizes & formats ·
10 pack/brand shot. Build once in Figma, swap the sport art per listing.


---

# Figma prep — the listing photo templates (build once, swap sport art)

Home for these: the **Etsy listing templates file `JcQvsgIRiOQtuZcP3Q8dc9`** (`01 · CARD
LISTING` already exists there). Add sections 02–04. Every slide is 2000×2000 (Etsy square),
sport art lives in swappable slots; per-sport delta is the art + 2 words.

**Shared slides (S1–S5, reused by every listing):**
- S1 six-finish style grid (one card, all 6 materials)
- S2 how-it-works: upload photos → proof in 24 h → approve → files/print
- S3 photo requirements (4–10 photos, the intake rules, good vs bad examples)
- S4 what-you-get file map (per listing type — three variants of one layout)
- S5 QR / digital-twin explainer (phone scanning the card back → registry page)

**02 · CARD LISTING (digital $49):** hero card FRONT · card BACK · S1 · S5 · before/after
(customer photos → finished card) · S2 · S3 · S4-card · sport hero slot · listing VIDEO = the
existing 5 s flip MP4.

**03 · POSTER LISTING (digital $49):** framed 18×24 room mockup · poster close-up · S1 ·
wallpaper-on-phone mockup · social-formats mockup · before/after · S2 · S3 · S4-poster ·
sport hero slot.

**04 · SET LISTING ($89):** composite everything-shot · bonus die-cuts slide (sticker+badge,
"only in the set") · best of 02+03 · S2 · S3 · S4-set. Senior night reuses 04 with occasion
copy.

**05 · PHYSICAL (wave 2):** slots for real POD photos — sealed pack in hand · single card in
toploader · poster unrolled/framed · scale shot — plus S1/S2/S3 and the price-tier table slide.

## ⚠️ New wave-1 dependency: the digital-twin page

The $49 card listing SELLS the registry ("QR on the back → its own page"). That page is
`app/c/[cardId]` — today a placeholder on a site whose header still says **Cover Moment** with
`hello@covermoment.co`. Before the first card sale, minimum scope: rebrand `app/site-config.ts`
strings + make `/c/[cardId]` show the card front/back, flip video and edition line. The QR on
every sold card points there; a placeholder breaks the promise the listing just charged for.


## Poster POD suppliers — shortlist and the test plan (2026-08-24)

**Pack supplier decision 2026-08-25: QPMN** (qpmarketnetwork.com — the supplier the 2032×1560
fin-seal pack templates were built for). Quote: pack ~$18 + €8.54 shipping to NY ≈ **$28 COGS
shipped**; production 3–4 working days + 7–10 working days transport ≈ **2.5 weeks to the
buyer**. TGC stays on record ($21.39 all-in: $13.33 + $6.48 + $1.58 fees) but its Regular queue quoted
a SIX-WEEK ship date — incompatible with gift deadlines; QPMN is ~$6–7 dearer and 5× faster. At $79 the pack still nets
~$41 after Etsy fees + conversion (~52%).

Consequences: **"ships from USA" no longer applies to packs** — set the Etsy shipping-profile
origin honestly; combo tiers ship from two origins (pack QPMN, poster US POD) → profile follows
the slower component and the description discloses separate packages. **Check whether QPMN also
prints 12×16 / 18×24 posters** — one supplier would collapse the two-origin problem entirely.
Verify the chosen QPMN method provides tracking; untrackable never ships to a customer.

Posters otherwise need a second supplier → **two production partners declared** (QPMN + the
poster printer).

| Candidate | Strength | Note |
|---|---|---|
| Printify | cheapest (US network: Sensaria/Jondo) | quality depends on the chosen print provider |
| Printful | widest paper/frame range | priciest of the three |
| Gelato | paper specialist, prints closest to the buyer | mid-priced |

Their Etsy integrations are built for fixed designs — irrelevant here, every order is a unique
file. Flow: proof approved → manual order with the customer's file → ships US-domestic.

**Printful posters, priced live in the dashboard 2026-08-31** (Enhanced Matte Paper
Poster (in), prices incl. 21 % LT VAT — US-shipped orders are ex-VAT, so ~-17 %):

| Size | Price (incl VAT) | ~ex-VAT |
|---|---|---|
| 12×18 | €12.28 | ~€10.15 |
| 16×20 | €12.96 | ~€10.71 |
| **18×24 (our poster)** | **€14.19** | **~€11.73 ≈ $12.70** |
| 24×36 | €19.69 | ~€16.27 |

US shipping (their public rate card): posters **€4.69 first + €2.10 each additional**;
fulfillment 2–5 bd + US delivery 3–4 bd ≈ **5–9 business days door-to-door**, US
facilities, tracked. So an 18×24 poster delivered in the US ≈ **€16–17 (~$18) all-in,
~1.5 weeks** — no account juggling, native Etsy integration, and the same order could
carry poster + (later) other Printful items. Premium Luster variant exists from €7.65 if
the matte test print looks flat. Framed 18×24 exists (from €17.29 base) as a future tier.

**Test wave (one pass, three parcels):** the same 18×24 from Printify AND Gelato + the TGC
pack. Yields: real COGS, a quality verdict, and all the physical-listing photos.

## TGC real quotes (2026-08-24, from the configured game)

| Config | COGS | Note |
|---|---|---|
| 10 plain cards, sealed pack | $6.64 | bulk each $3.53 |
| **10 FOIL cards, sealed pack** | **$9.84** | bulk each $4.97 — **the launch product**: +$3.20 buys "real holographic foil cards", on-brand for the finishes |
| 18 mixed (foil deck + plain deck) | $12.83 | later option (hero foil + rest plain) |

Weight 0.84–1.09 oz, prints in Madison WI. Pack COGS ~$19 shipped → ~76% margin at $79.

**⚠️ TGC timeline reality (checkout, 2026-08-25):** Regular production quoted a ship date SIX
WEEKS out (Aug 25 → Oct 5), and the cheap USPS Ground option is "NOT trackable, 14–30 days".
Two iron rules from this: (1) **untrackable shipping never, on any customer order** — an Etsy
dispute without tracking is an automatic loss and voids Seller Protection; (2) **Regular
production is incompatible with gift orders** — senior-night gifts have a date. The test order
must answer: rush-production cost per order (if ~$10–15, fold into COGS and state honest
processing time) — otherwise a faster card printer is needed and TGC stays only as the
sealed-pack source with an honestly long lead time. Etsy processing time is always set to the
realistic WORST case.

## Card printers — fast US alternatives (researched 2026-08-31)

The TGC/QPMN problem is SPEED, not price. Two mainstream US trade printers do standard
2.5"×3.5" trading cards per-order, fast, and ship to any address (dropship = the buyer's
address on the order):

| Service | Min | Price signal | Production | Notes |
|---|---|---|---|---|
| **GotPrint** (Burbank CA) | 50 | **$11.99 / 50**, 14pt gloss | 2–6 bd + 2–6 bd ship | raised foil on 16pt matte (silver/gold/rose); cheapest per order |
| **UPrinting** (LA) | 25 | $31.01 / 250 ($0.12 ea); qty-25 needs their calculator (~$15–20 expected) | **1–6 bd** turnaround | **Raised HOLOGRAPHIC foil** — closest to the finish identity; free file proof |
| Snapshot (makesnapshots.com, Des Moines IA) | 1 | $17.99 single **incl. magnetic case**, free US ship | **2–3 bd** | ⚠️ this is a consumer COMPETITOR, not a trade printer — useful as a price/speed benchmark: their $17.99-with-case-in-5-days is what our printed tier competes with |
| Shuffled Ink (Orlando) | 15 decks | deck-oriented | 2–8 wk | wrong shape for per-order |

**2026-08-31, second pass — PRO PHOTO LABS solve the small-quantity problem.** The trade
printers above want 25–50 copies; the labs that serve US youth-sports PHOTOGRAPHERS print
"trader cards" in sets of 8–12 per athlete, in ONE day:

| Lab | Product | Price | Production | Notes |
|---|---|---|---|---|
| **Bay Photo** (Santa Cruz CA) | set of 8, 2.5×3.5, **double-sided** | **$7.45** ($8.30 UV-coated; 12 for $8.70) | **1 business day** | orders via Bay ROES app; custom layouts possible; drop-ship to confirm |
| **WHCC Sports** (MN) | trader cards 2.5×3.5 | **$5** | ~1–2 bd (typical WHCC) | **white labeling explicitly offered**; PhotoDay integration |
| Mpix (consumer arm of Miller's) | sets of 12 | n/a on page | ships 1–2 days | template-driven, consumer checkout |

Both pro labs need a **free professional account**. COGS picture: ~$7.45 + ~$6 ship ≈
**$13–14 for 8 double-sided cards, ~1 week door-to-door** — vs QPMN $28/2.5wk, TGC 6wk.
An order shipping a small STACK of the athlete's own card also reads as generous, not as a
workaround. Caveats: photo-press stock (130lb smooth), not TCG-snap cardstock, and **no
holographic foil** — UPrinting raised-holo remains the premium upgrade path; sealed pack
stays QPMN/TGC.

**2026-08-31, third pass — HOLOGRAPHIC at small quantities.** Who can do holo/foil per-order:

| Service | Holo option | Min | Price signal | Speed | Catch |
|---|---|---|---|---|---|
| **QPMN** (our pack supplier) | 8 foil effects: Fireball, Shard, Holo Shard, Gold Dot, Holo Dot, Gold, Holographic, Silver | **1** | tiered table in catalog (booster ex.: ~$14.69 @50) | ~2.5 wk (HK) | **has ETSY INTEGRATION for automated fulfillment** — order flows to them automatically |
| MPC (same family) | holographic front/back, cold foil | 1 deck | $16.95/deck holo | ~2.5 wk (HK) | same as QPMN, consumer UI |
| Snapshot (Iowa) | holographic cards | 1 | $17.99 single, free ship | **2–3 bd, ~1 wk door** | THEIR templates only (photo upload), no full-bleed custom art confirmed, no dropship program, consumer competitor |
| UPrinting (LA) | raised holographic foil | 25 | qty-25 via calculator | 1–6 bd | min 25 |
| PremiumCards.net | 16pt holo foil | 50 | — | — | min 50 |
| TGC (WI) | real foil cards | 1 pack | $9.84/foil pack | **6 wk Regular** | rush unquoted |

The structural answer: **speed and holo live at different suppliers.** Fast tier = Bay/WHCC
(1 bd, no holo). Holo tier = QPMN (no MOQ, Etsy-integrated, honest ~3 wk processing) —
and since QPMN is already the pack supplier, holo cards + sealed pack can ship as ONE
QPMN parcel. Next step: log into the QPMN catalog, configure one holo card + US address,
read the Tiered Price Table and delivery estimate — that closes the last unknown.

**2026-08-31, PhotoDay/WHCC catalog walked live** (logged-in studio panel, "Sample - WHCC
Price Sheet", shipping type **Drop** — drop-ship is the default model). Lab base costs seen:

| Product | Base cost | Note |
|---|---|---|
| **12 Trading Cards, double-sided, UV** | **$5.00** | $0.42/card — cheapest found anywhere; "player stats entered upon ordering" = THEME product, full-bleed question still open |
| 8x10 photo print (Kodak luster) | $1.50 | |
| 10x13 / 11x14 | $2.44 / $3.00 | sizes to 8x12, 10x20, 10x30, 12x18 exist in picker |
| 16x20 | $23.00 | jump suggests mounted/premium — verify |
| **2x3 ft vinyl BANNER, 13oz, grommets** | **$26.00** (default retail $104) | category goes 2x2 → 4x8 ft — **this is the senior-night banner product**; "soccer banner" 745/mo Very High + "football banner" 984/mo now have a fulfillment path |
| Buttons $3.50 · Magnets $3.00 · Acrylic keychain $3–4 · 8x10 acrylic $27 | | upsell shelf |

PhotoDay fee ≈ 10% of retail; markup is ours to set (0 for self-orders). Remaining unknowns
unchanged: full-bleed custom theme (Custom Themes menu exists in Store), shipping cost at
checkout, and international test delivery. Poster 18x24 not yet confirmed in the picker.

**PhotoDay drop-ship rates to the US** (read from the price sheet's Shipping Rates tab,
2026-08-31 — flat per-order tiers, buyer-facing, ALL tracked):

| Tier | Price | Door-to-door (incl. lab processing) | PO box |
|---|---|---|---|
| Economy | $5.95 | 8–10 business days | yes |
| Priority | $10.95 | **5–6 days** | no |
| Express | $18.95 | **4–5 days** | no |

Full per-order economics, 12 double-sided UV trader cards: **$10.95 lab-side on Economy
(~2 wk), $15.95 on Priority (~1 wk)** — tracked either way, so the no-tracking rule is
satisfied at every tier. Express $23.95 beats every same-speed alternative found
(Snapshot $17.99 buys ONE card; this is twelve). Caveat: table may be per-sheet defaults —
confirm banners don't carry a surcharge at checkout.

**2026-09-01, Bay Photo checked (account GAMEDAYEDITION #726003 exists, my.bayphoto.com).**
Their web ordering catalog has NO trader cards — at Bay they are ROES/Sports-ordering
products too (separate Bay ROES app; there is also "Bay Designer" web tool, unverified for
traders). But the policy page settles the economics:

- **No minimum order fee** stated for Bay orders.
- **US shipping: Economy $3.99 (3–10 d), Standard $7.99 (2–5 d), USPS First from $1.49**
  (up to 11x14 — a card set qualifies).
- **Drop shipping FREE and explicitly WHITE-LABEL**: "generic packaging, no invoices or
  anything that identifies Bay Photo as the producer."

Solo-set picture if the trader product takes custom jpgs like WHCC's does:
**$7.45 (8 double-sided) + $1.49–3.99 ship ≈ $9–11.50 per order, unbranded, ~1 bd
production.** That is the best single-set economics found anywhere. Two things Bay ROES
must confirm: (1) a design-your-own/full-bleed trader product exists (analogue of WHCC's
"Traders from jpgs"); (2) no sports-order minimum hides in the cart (a "13 copies of the
same image" rule surfaced in search results, context unclear). One Bay ROES session
answers both.

**2026-09-01, BANNERS SETTLED — WHCC ROES "Image Only Add ons" → Banners.** Pure
image-only product (no themes, no nodes): our file fills the canvas, grommet dots and
safe guides shown in preview. Full price grid: 2×2 €17 · **3×2 €26** · 4×2 €28 · 5×2 €35 ·
6×2 €42 · **3×4 €42** · 4×4 €56 · 6×3 €63 · 6×4 €83 · 8×3 €83 · 8×4 €112. Retail mapping:
3×2 = the core senior-night banner ($69–79), 3×4 = large ($99), 6×3 = team banner ($129+).
A banner alone clears WHCC's $25 minimum. File specs: ~100 dpi at size (3×2 → ~3600×2400),
type ≥3" from edges (grommet/hem zone) — "art may bleed, type may not". Open their
"Sizing Guidelines" info tile once before building the Figma banner masters.
Printful confirmed to carry NO banners (search returns table runners/calendars only).

**2026-09-01, can Bay carry EVERYTHING? Checked — cards yes, posters probably not, one
gap to measure.** Owner decision the same day: **QPMN keeps ONLY the sealed foil pack.**

- Bay web ordering (order.bayphoto.com, silver-halide Photo Prints): sizes go to 48×96 and
  include 18×24 and 24×36, but **12×18 already prices at $13.19** — photo-lab product,
  poster-shelf loser vs Printful (18×24 ≈ €14 incl VAT). Bay production: prints under 30"
  = 1 day; press printed cards 1–2 days.
- **The one number still worth reading: Bay ROES → Schools/Sports/Events catalog → its own
  PRINTS list at 16×20 / 18×24 / 20×30 / 24×36.** (The cheap €1.50-8×10 sports list seen
  earlier was WHCC's ROES, not Bay's.) If Bay sports 18×24 lands ≤ ~€12, poster+card
  bundles consolidate into ONE Bay parcel — one shipment instead of Bay+Printful two,
  saving ~$5/bundle and arriving together. If not: posters stay Printful, and a
  card+poster bundle ships as two parcels (disclose in the listing).
- Working map after the owner's QPMN decision: **solo cards + small prints → Bay · posters
  → Printful (pending the Bay sports-price check) · banners/$25+ bundles → WHCC ROES ·
  sealed foil pack → QPMN (only this).**

**2026-09-01, Bay ROES verified by the owner — SOLO-SET CHANNEL SETTLED.** Bay ROES →
Schools/Sports/Events → Trader Cards → **"Design Your Own"** took our full-bleed HE
front+back exactly like WHCC's product. Cart facts: Set of 8 €7.45 / Set of 12 €8.70;
130 lb Smooth, **UV Coated +€0.86**; paper upgrades Glossy/Silk +11 %, Fuji Pearl +40 %;
Color Correction €0.17/file (default ON); rush 50 %/100 % of production; **minimum charge
$7** (not $25). Trim note on canvas: "cards are trimmed by ~1/8" — our 816×1110 bleed
geometry previewed clean.

**Option decisions for our orders:** Color Correction **OFF, always** — our files are
finished, color-graded art; lab correction could shift a finish's look (this is the print
version of "the proof is approved, nobody touches it after"). UV Coated **ON** (+€0.86 —
handled product, richer blacks). Everything else off: no retouching, no rush (production
is already ~1 bd), no individual packaging (solo orders go to one buyer anyway), paper
stays default until the sample says otherwise.

**Solo-set economics, final: set of 12 UV ≈ €9.56 + $1.49–3.99 USPS ≈ $12–14 shipped,
white-label, ~1 bd production.** Supplier map is now: solo cards → Bay; banners + $25+
bundles → WHCC ROES; posters → Printful; sealed pack → QPMN.

**2026-09-01, PhotoDay single-set verdict: NO.** Walked the whole studio flow live (job
"GDE Orders" created, WHCC price sheet attached): the trading-card product is **theme-driven
end to end** — Product Themes asks for their designs' colorways, the buyer's "photo" is
placed INSIDE their graphics, and the Custom Themes builder covers Memory Mates only. Our
full-bleed card cannot ship through PhotoDay's standard path. One unlock worth ONE email:
WHCC's themes page advertises "create your own custom graphics" — ask PhotoDay/WHCC support
whether a studio-supplied full-bleed trader theme can be added; if yes, the $5+ship
no-minimum channel opens after all.

Meanwhile the single-set channel candidates are: (a) **ROES direct with the $25 min** —
works today, full-bleed proven, ~$33–35/solo order, ~$18–20 margin at the $59 tier;
(b) **Bay Photo** — $7.45/set-of-8 double-sided, no dollar minimum found (their "13 copies"
rule reads as a volume-print rule, unconfirmed for trader sets), and they have WEB ordering
("Sports & Events Online") with no Java — needs an account + one test order to settle.

**2026-09-01, ROES WORKS — the full-bleed question is CLOSED.** The owner launched WHCC
Sports+Events ROES; the **"Traders from jpgs"** product took our exact print files
(`GDE-HE-card-FRONT/BACK-816x1110-300dpi.png`) with no theme interference: 12 double-sided
cards, **€5.00**. Two catches, both navigable:

- **$25 minimum per Sports & Events order** (direct ROES only). PhotoDay consumer checkout
  has NO minimum — that is exactly what PhotoDay exists for. So: **single-buyer card order →
  PhotoDay** ($5 + $5.95–10.95 ship); **ROES direct → only when the order naturally clears
  $25** (banner tier ~$26, multi-product bundles) with no PhotoDay fee.
- "Individually Packaged" forces Next-Package-Group/CSV submission — for a one-set order
  pick **Bulk Packaged**.
- ROES print prices confirm posters DON'T come from WHCC: 16×20 €23, 24×30 €51.75,
  24×36 €71.25 — Printful's €14–20 wins by 3–5×. Small prints are cheap though
  (8×10 €1.50, 12×18 €4.05) — bundle fillers.

**The $25 test order should be a sample kit, not waste**: 2 card sets in two finishes
(€10) + 8×10 (€1.50) + 11×14 (€3) + 12×18 (€4.05) + 10×20 (€3.75) + 10×13 (€2.44)
≈ €24.7 — one shipment to the US contact, quality verdict on every product class at once.

**QPMN pack price corrected by the owner, 2026-08-31: ~$15 sealed pack + ~$9 shipping ≈
$24 all-in** (older $28 figure stands corrected). Still ~2.5 wk and still the only sealed
wrapper — so the tier split holds: sealed pack = QPMN (Etsy-integrated), loose printed
cards fast = PhotoDay/WHCC ($10.95–15.95 for 12, tracked, ~1–2 wk).

**What they cannot do: the sealed booster wrapper.** Only TGC and QPMN make the pack. So the
supplier split follows the tiers: **"Printed card shipped" tier → GotPrint or UPrinting**
(a stack of 25–50 copies of the athlete's card, front+back, ~$12–20 COGS + shipping, ~1–1.5
weeks all-in, honest US origin); **sealed-pack tier → QPMN** (validated, 2.5 wk) until TGC
rush is quoted. Open questions for a test order: exact qty-25 price + shipping at checkout,
whether packing slips are neutral (no printer branding), and real door-to-door days.

**TGC pack facts that affect the Figma assets:**
- Pack template = **face only, exactly 975×1350**. The repo's 2032×1560 fin-seal flat is the
  QPMN format — does not apply at TGC. A TGC face variant is needed per finish.
- **No white ink on booster packs** — every white element prints as bare silver foil. Good for
  the GDE mark (it is silver by rule), but ALL white type comes out metallic; approve the proof
  deliberately.
- Pack back is bare silver — like real Topps/Panini boosters; frame it as authenticity.
- Decks need BACK images too; the game cannot be added to cart until every component is
  uploaded and **Proof All** approved (the "meta error" on add-to-cart = unproofed components).

---

# Video hooks — the opening line bank (owner's, 2026-08-26)

Listing and social videos play **muted and mid-scroll**, so the first line has one job:
name the parent's problem before it names the product. These are the owner's own hooks —
use them verbatim, and write new ones in the same register (problem first, transformation
second, product third). They are for the FIRST 1–2 seconds; the rest of the script is in
`etsy/VIDEO-PLAN-01-CARD.md`.

**Camera-roll family** — the strongest, because every buyer recognises it instantly:

- `YOUR CAMERA ROLL IS FULL OF THESE.` → 3–4 real game photos flashed fast →
  `WE TURN THEM INTO THIS.` → reveal the card/poster.
- `DON'T LET THEIR SEASON STAY ON YOUR PHONE.` — the sharpest parent hook: it states the
  loss, not the feature.
- `THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.` — the premium/brand-led version of
  the same idea; best on the set and poster listings.

**Transformation family** — pair a plain phone photo with a hard cut to the finished piece:

- `THIS STARTED AS A PHONE PHOTO.` → cut to the premium result. The clearest
  before/after in one line.
- `WHAT IF THEIR GAME PHOTOS LOOKED LIKE THIS?` — curiosity-led; softer, good for
  Pinterest/Reels where the scroll is slower.

**Anti-template family** — separates us from the AI-template shops on Etsy:

- `NOT A TEMPLATE. NOT A FILTER.` → +0.5 s → `BUILT AROUND YOUR ATHLETE.`

Rules that apply to all of them: no sale %, no dates (the video outlives the promo);
≥44 px type on a plate over photography; every line ≥1.2 s on screen; US spelling.

## First physical orders — feedback loop (max cool support), 2026-09-01

No self-test orders (we are in LT); the first real buyer is the QA. Three messages, EN,
sent via Etsy Messages. Tone: maker, not corporation. Never tie anything to a review.

**1. At order (same hour):**
> Hey! Thanks for ordering — you're one of the very first to get the printed edition, and
> I want it to be perfect. I'll send your proof for approval before anything prints, and
> your cards ship from our professional lab partner in California with tracking. If
> ANYTHING about the print isn't right when it arrives — corner, color, anything — I
> reprint it free, no questions. You keep both.

**2. When it ships:**
> Your cards are printed and on the way — tracking: {LINK}. Small ask, zero obligation:
> when they arrive, I'd genuinely love to know what you think of the print quality —
> we're perfectionists about this and real-world eyes beat lab specs.

**3. ~2 days after delivery:**
> Did they arrive safe? Honest impressions welcome — good or bad, it directly shapes what
> we do next. And if you'd be up for snapping a quick photo of the cards in hand, I'd
> love to see them out in the world. (If you're happy for us to show it to future
> customers, say the word — with or without names, your call.)

Rules: the review is never mentioned in the same message as the photo ask; a separate
plain "a review helps a small shop enormously" note may go later, unattached to anything.
Photo usage only with explicit permission, and credit/anonymity is the customer's choice.
