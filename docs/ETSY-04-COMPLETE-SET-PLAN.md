# Etsy listing 04 · Digital COMPLETE SET (all sports) — build plan

Written 2026-08-25 with the two finished listings open as reference. **This file is the
executable brief**: a second session (Sonnet) should be able to build the whole page from it
without re-deriving anything. Copy canon stays `docs/ETSY-COPY.md`, roster/price canon stays
`docs/ETSY-LISTINGS.md`, and the state of pages 01–02 stays `etsy/LISTING-STATE.md`.

**Total AI-generation spend for this page: €0.** Every pixel already exists — in the Figma
sport files, in `exports/`, or in the two finished listing pages. Nothing here needs Gemini.

---

> **2026-09-03 — superseded in part.** Sections 0, 1.5–1.6, 4 and 13 describe a DIGITAL-ONLY set. The set went
> live as Physical with four tiers on 2026-09-01 and the page was rebuilt to the poster row's V3 spine on
> 2026-09-03 — the current 20-slide map is in `etsy/LISTING-STATE.md` ("COMPLETE SET rebuilt") and
> `etsy/SLIDE-NODE-MAP.md`. Sections 5–8 (assets, athletes, the 28-file inventory) still hold.

## 0 · What this listing is

| | |
|---|---|
| Listing | **Complete set**, wave 1 item #11 in `docs/ETSY-LISTINGS.md` |
| Price | **$89** (list at full price, 20 % launch sale → shows ~$71) |
| Category | Prints → **Digital Prints** · Digital · Made To Order · Who made it: I did |
| Sport | **the only listing where sport is a picker** (16 named + Other) |
| Buyer gets | everything in the $49 card listing **+** everything in the $49 poster listing **+** the bonus die-cuts sold in no other listing |
| Figma page | `04 · Digital Complete set ( all sports )` — **already exists, empty**, id `61:504` |
| Slides | **20** (Etsy maximum), 2000×2000 each |

The one job of the page: make $89 obviously better than $49 + $49 = $98 — cheaper **and** more,
never "a $9 discount".

---

## 1 · Decisions, locked before the build starts

1. **The 20-slide spine of pages 01 and 02 is the design system.** Same 2000×2000 frames, same
   Anton/Space Grotesk ramp, same orange furniture, same `NN / 20` counter, same corner
   brackets, same GDE wordmark bottom-left. Look and feel does not change — content does.
2. **Sport picker = 16 named + "Other".** The 17th roster slot (`other-sport`, skateboarding)
   is exactly that catch-all. If the buyer picks Other, the sport arrives in the text field —
   which is why field 5 carries the instruction.
3. **Two list pickers, not one:** Sport (17) and Style (6). Both are custom options, not
   variations — Etsy digital listings have no variations at all.
4. **The mix is deliberate but bounded.** Range slides (01, 03, 20) carry non-basketball
   athletes; product slides that need many small assets (18, 19) stay on Marcus/basketball,
   whose assets are already in the Etsy file and on disk. **One frame is always one athlete,
   one kit, one crest** — mixing sports *inside* a frame is a truth defect, mixing them
   *across* frames is the point.
5. **No dollar figures on any image.** The 20 % launch sale would contradict a printed price the
   day it starts, and a price on an image has to be maintained forever. The value is said
   structurally: *both listings in one, plus the bonus that is not sold separately.*
6. **No "instant download" anywhere** — this is made-to-order digital (hero rule 5).
7. **The file count is verified before it is printed.** Section 8 gives the audited number and
   the exact 27 artboards behind it. Re-`ls` before it goes on slide 19.

---

## 2 · Build target

- File `JcQvsgIRiOQtuZcP3Q8dc9` ("Etsy listing templates"), page **`61:504`**.
- Frames named exactly `NN · Title`, 2000×2000, `y = 0`, **`x = (n − 1) × 2280`**
  → 0, 2280, 4560, 6840, 9120, 11400, 13680, 15960, 18240, 20520, 22800, 25080, 27360, 29640,
  31920, 34200, 36480, 38760, 41040, 43320. (Page 02 uses exactly this grid; page 01 drifts at
  slides 05–06 — copy page 02's numbers, not page 01's.)
- Lithuanian production notes go on the canvas **below** each artboard, never inside it.
- Source PNGs for this page: `etsy/listing-images/04-complete-set/` (+ `src/` for raw exports
  pulled out of the sport files, + `_alternates/` for rejected takes, same convention as 02).

### Design tokens — the `Etsy` variable collection in this file (8 vars, one mode)

| Variable | Hex | Use |
|---|---|---|
| `ink` | `#0C0E12` | headline type, dark plates |
| `ink-soft` | `#1A1E26` | step tiles, dark bars |
| `paper` | `#FFFFFF` | — |
| `paper-warm` | `#F1EFE9` | the light ground of every "explain" slide |
| `accent` | `#FF6B2B` | pills, brackets, counter, step numbers — **furniture only** |
| `foil` | `#C8CDD6` | the GDE mark, always; never a team or finish colour |
| `ok` | `#1E7A5E` | tick column on the ✓/✗ frame |
| `no` | `#C03230` | cross column on the ✓/✗ frame |

Fonts in use on the listing chrome: **Anton Regular** (headlines) and **Space Grotesk
Bold / Medium** (eyebrow, sub, labels). Load them with the canonical recipe before any text
edit; the card/poster art carries its own per-finish fonts and must not be retyped.

---

## 3 · Reference: every slide of pages 01 and 02, by node id

⚠️ **Frame names on page 01 lie.** The `215:xxxx` block on page 01 (slides 04–07, 12, 13, 15, 18)
was cloned from page 02 and kept page 02's names — e.g. `215:2438` is named "04 · The poster,
full view" but contains the identity-plate step. **Screenshot before you clone; never trust the
name.**

| # | Page 01 · CARD | Page 02 · POSTER | Content (verified) |
|---|---|---|---|
| 01 | `31:2` | `184:127` | hero — card in gym / poster on wall |
| 02 | `19:38` | `184:150` | transformation, `NOT A FILTER` stamp |
| 03 | `19:17` | `184:191` | the kid with the product |
| 04 | `215:2438` | `184:200` | **STEP ONE · likeness** — 4 phone photos → identity plates F+B |
| 05 | `215:2470` | `184:231` | the kit, front and back |
| 06 | `215:2499` | `184:265` | four shots, measured (cosine gate) |
| 07 | `215:2543` | `184:308` | the age ladder |
| 08 | `43:2` | `184:341` | one athlete, six finishes (cards / posters) |
| 09 | `43:183` | `184:534` | style pair — SN + CA (+ room, on page 02) |
| 10 | `43:321` | `184:686` | style pair — FS + HE |
| 11 | `43:476` | `184:855` | style pair — SS + PR |
| 12 | `215:2579` | `184:1108` | what photos to send (✓/✗) |
| 13 | `215:2616` | `184:1144` | your club's crest, never a league mark |
| 14 | `57:303` | `184:1180` | every field is yours (leader lines) |
| 15 | `215:2653` | `184:1293` | you see it first — the watermarked proof |
| 16 | `20:123` **registry** | `184:1559` **social & screens** | the one slide the two pages do NOT share |
| 17 | `20:67` | `184:1619` | everything you get (per family) |
| 18 | `215:2932` | `184:1646` | digital delivery — nothing ships |
| 19 | `135:128` | `184:1697` | occasions |
| 20 | `26:2` | `184:1752` | seventeen sports grid |

Helper mockup frames live off-canvas at `y ≈ −2400` on both pages (`20-hand-blank-card`,
`crest-cedar-ridge`, `m16-phone`, `m16-monitor`, …). Reuse them; do not rebuild them.

---

## 4 · The 20 slides of listing 04

`REUSE` = clone the frame, change the counter and at most one line of copy.
`MERGE` = clone one parent and drop in the other family's artwork.
`NEW`  = built from scratch out of existing pixels.

| # | Slide | Source | Work |
|---|---|---|---|
| 01 | **HERO — the whole set** | **NEW** (ground from page 01 hero, art transferred) | L |
| 02 | **Seventeen sports. Pick yours.** | REUSE `26:2` — re-caption only | S |
| 03 | **Two athletes. Two sports.** | **NEW** | L |
| 04 | Transformation — photos → poster **and** cards | MERGE `184:150` + card art | M |
| 05 | Step one · likeness | REUSE `215:2438` (fix one word) | S |
| 06 | The kit, front and back | REUSE `215:2470` | S |
| 07 | Four shots, measured | REUSE `215:2499` | S |
| 08 | One athlete, six finishes | MERGE `43:2` + poster strip | M |
| 09 | Style pair — Stadium Night + Chrome All-Star | MERGE `184:534` + that finish's cards | M |
| 10 | Style pair — Fire & Smoke + Heritage | MERGE `184:686` + cards | M |
| 11 | Style pair — Signature Spotlight + Prism Rush | MERGE `184:855` + cards | M |
| 12 | What photos to send | REUSE `215:2579` | S |
| 13 | Your club's crest | REUSE `215:2616` | S |
| 14 | Every field is yours | MERGE `57:303` + poster inset | M |
| 15 | You see it first — the proof | REUSE `215:2653` | S |
| 16 | Where it lives — social & screens | REUSE `184:1559` | S |
| 17 | Registered. Verified online. | REUSE `20:123` | S |
| 18 | **Only in the complete set** — the bonus | **NEW** | M |
| 19 | **Everything you get — counted** | MERGE `20:67` + `184:1619` | L |
| 20 | Digital delivery — nothing ships | REUSE `215:2932` (fix one word) | S |

**11 of 20 slides are near-free reuse.** The build is really four frames (01, 03, 18, 19) plus
five merges.

**Dropped from the parents, on purpose:** the age ladder (`215:2543`) and OCCASIONS
(`135:128`). Both are good frames; neither answers "why $89". Keep them as bench: if a planned
frame fails, swap one in rather than shipping 19 slides. When the first real review arrives it
replaces **slide 03** (the brief's social-proof rule — a review beats a range frame).

### On-image copy — set it, do not rewrite it

| # | Eyebrow | Headline | Sub / footer |
|---|---|---|---|
| 01 | badge `DIGITAL EDITION · PERSONALIZED FILE` | `CUSTOM POSTER` / `+ TRADING CARD SET` | pill `THE WALL. THE CARD. THE WHOLE SEASON.` · strip `POSTER · CARDS · SOCIAL · WALLPAPERS · CERTIFICATE` |
| 02 | `ONE LISTING, ANY SPORT` | `SEVENTEEN SPORTS. PICK YOURS.` | `Choose your sport in the options above — or Other, and tell us.` · bottom bar `YOUR SPORT IS A DROP-DOWN, NOT A SEARCH` |
| 03 | `ANY SPORT` | `ONE PROCESS. EVERY SPORT.` | `Two athletes, two sports — the same complete set.` · column labels `ICE HOCKEY` / `GYMNASTICS` |
| 04 | `FROM YOUR PHOTOS` | `NOT A FILTER.` / `BUILT FROM SCRATCH.` | `Their photos in. Poster, front and back out.` |
| 05 | `STEP ONE` | `WE GET THEIR LIKENESS RIGHT FIRST.` | `Face, hair, build and proportions — locked before anything is made.` ← **the parent says "before the poster is created"; that is the word to change** |
| 08 | `SIX MATERIALS` | `ONE ATHLETE. SIX FINISHES.` | `Your whole set is built in the one you choose.` |
| 14 | `YOUR DETAILS` | `EVERY FIELD IS YOURS.` | `Name, number, position, team, stats, class year — on the card and on the poster.` |
| 18 | `NOT SOLD SEPARATELY` | `ONLY IN THE COMPLETE SET.` | `Die-cut sticker, number badge and four transparent cutouts of your athlete.` |
| 19 | `YOUR COMPLETE DIGITAL SET.` | `EVERYTHING YOU GET.` | `27 files and one live page. Counted, not implied.` · pill `POSTER + CARDS + SOCIAL + SCREENS + BONUS` |
| 20 | `HOW TO ORDER` | `DIGITAL FILES ONLY — NOTHING SHIPS.` | `FULLY CUSTOMIZED · ONE OF ONE — Built from your photos, this **edition** exists once.` ← parent says "this card exists once" |

Type floors (measured, non-negotiable): **captions ≥ 44 px, chrome ≥ 34 px** at 2000×2000.

---

## 5 · The four frames that are actually new

### Slide 01 · HERO — the whole set

The single most important frame; build it first and check it at 200 px before anything else.
**Decided 2026-08-25: the hero carries two sports, football leading — Tui Fa'agata (football)
in the foreground, Amara Boyd (cheerleading) behind him.** Football has the strongest US search
volume of the fall sports; cheerleading is wave-1 priority #3. Both athletes' finished card and
poster art were screenshotted and audited before this decision (see the note below) — nothing
about either is missing or needs a re-roll.

- **Ground:** Tui's own `before/photo*.png`, blurred and darkened — the same treatment page 01's
  hero uses. **Pick the frame that shows him in the game kit**, not a hoodie or a car snapshot.
- **Foreground set** (Tui, football, Stadium Night — the finish his file's canonical hero is
  built in): poster standing ~1150 px tall at left of centre; card FRONT and card BACK angled
  toward each other in front of its lower right, ~70 px gap; certificate ~35 % scale, tucked
  behind the poster's right edge so only its seal and signature line show. **The certificate
  belongs in this frame** — it ships with the card listing AND the complete set (confirmed
  2026-08-25), never with the poster-only listing, so showing it here is honest.
- **Second set, background:** Amara's poster + card FRONT (cheerleading, Stadium Night) at
  ~60 % scale, cropped by the right edge, opacity ~0.85 — two sports readable, one set legible.
- **Headline** top-left, Anton, white with drop shadow (never a colour taken from the photo).
- **Orange pill** under it; **DIGITAL EDITION badge** top-right, right edge landing at x 1800.
- **Bottom strip** as in the table above.
- **No die-cuts on this frame** — they would belong to a different athlete than the set shown.
  They get slide 18.

**Football sign-off note.** `docs/ATHLETE-ROSTER-HANDOFF.md` §18 lists football as "6/8 — two
frames never approved," but the two open items are the `_identity` / `_identity-back` plates
(never signed off as a roster-completeness formality), not the hero/kit/poster/card art used
here — those six frames (`hero`, `action2`, `action3`, `back`, `_kit`, `_kit-back`) are already
in `approved.json`. Visual audit 2026-08-25 of `hero.png`, the built poster (`38:2`) and card
FRONT (`40:2`) in the football sport file confirms: plain black cleats (the Adidas-logo defect
in the 2026-08-20 QA report predates the currently-approved frame and is gone), no league mark,
crest and number consistent with `_kit.png`. **Safe to use for this listing's hero as-is.**

### Slide 03 · Two athletes. Two sports.

Two vertical columns, hard-split at x = 1000, `paper-warm` ground.
Each column: that athlete's poster (large), their card FRONT below-left, one social tile
below-right, a label bar in `ink` with the sport, and a small line of what they got
(`POSTER · 2 CARDS · 9 SOCIAL · 7 WALLPAPERS · CERTIFICATE · BONUS`).
**Different sports, different finishes, different genders, different ages** — that is the
frame's whole argument. Nothing crosses the centre line.

### Slide 18 · Only in the complete set

`paper-warm` ground, the bonus laid out as product:
`GDE-SN-sticker-name-number.png` large at left (die-cut edge visible against the light ground),
`GDE-SN-badge-number.png` beside it, and the four cutouts (`exports/shared-cutouts/`) as a row
of transparent figures across the bottom with a subtle contact shadow.
Orange pill: `NOT IN THE CARD LISTING. NOT IN THE POSTER LISTING.`
This is the frame that justifies the price; do not let it become a texture study.

### Slide 19 · Everything you get — counted

The merge of `20:67` (cards + certificate + flip video) and `184:1619` (poster + social +
wallpapers). Layout: poster large at left, card FRONT/BACK + certificate stacked centre, the 9
social tiles as a 3×3 contact sheet top-right, the 7 wallpapers as a strip bottom-right, the
bonus three items in a small orange-bordered box labelled `ONLY HERE`, the flip video as a
play-marked still.
The number goes in the sub line, **after** section 8's `ls` is re-run.

---

## 6 · The sport mix — who appears where

| Slide | Athlete | Sport | Finish | Why |
|---|---|---|---|---|
| 01 hero, foreground | **Tui Fa'agata** #54, Millbrook Bison | **football** | Stadium Night | wave-1 #1 by search volume; hero/kit/card/poster art audited clean 2026-08-25 (see slide 01 note) |
| 01 hero, background | **Amara Boyd**, Vale Prep Vanguard | **cheerleading** | Stadium Night | wave-1 #3; maroon kit reads distinctly against football's green, ghost surname `BOYD`, female-led — visibly a second sport, not a recolour |
| 03 left | **Nolan Reid** #17, Northgate Anvils | ice hockey | Fire & Smoke | numbered team sport, winter |
| 03 right | **Sofia Marchetti**, Willow Bend Swifts | gymnastics | Heritage | numberless, 13, individual sport — the widest possible contrast |
| 04, 05, 06, 12, 13, 14, 15, 18, 19 | Marcus Ellison | basketball | Stadium Night | assets already placed and on disk; changing them buys nothing |
| 08–11 | Marcus Ellison | basketball | all six | the finish comparison must hold the athlete constant or it compares nothing |
| 02, 20 | all 17 | all | — | the grid already exists |

Five athletes appear across the 20 slides (football, cheerleading, ice hockey, gymnastics,
basketball) plus the full 17-sport roster grid at 02/20 — enough range that no single sport
reads as "the real product" and the rest as filler.

---

## 7 · Cross-file asset transfer — the only tricky mechanic

Figma cannot `clone()` across files. The proven route (see `docs/FIGMA-FILES.md` rule 1):

1. `download_assets` on the node in the **sport file** → short-lived PNG URL.
2. `curl -L -o etsy/listing-images/04-complete-set/src/<sport>-<finish>-<what>.png "<url>"`.
3. `upload_assets` into `JcQvsgIRiOQtuZcP3Q8dc9` → returns an **`imageHash`**.
4. In `use_figma`: `fills = [{ type: 'IMAGE', imageHash, scaleMode: 'FILL' }]` on a frame sized
   to the artwork's own ratio (poster 1296×1728 = 3:4, card 750×1050 = 5:7).
5. **Delete the temporary frames `upload_assets` leaves on the canvas.** Every time.

Node ids are identical in every sport file; **each finish is a different page**, so
`getNodeByIdAsync` returns `null` until that page is loaded — a null here means wrong page, not
missing node.

| Finish | Card FRONT | Card BACK | Poster | Certificate |
|---|---|---|---|---|
| Stadium Night | `40:2` | `49:2` | `38:2` | `79:2` (SN page only) |
| Chrome All-Star | `190:136` | `102:85` | `190:93` | — |
| Fire & Smoke | `190:204` | `166:71` | `190:167` | — |
| Heritage | `190:291` | `166:180` | `190:253` | — |
| Signature Spotlight | `190:353` | `166:289` | `190:319` | — |
| Prism Rush | `190:415` | `166:398` | `190:379` | — |

| Sport needed | File key |
|---|---|
| football (Tui) | `rnOtXNBGu5VmumfldAhtNO` |
| cheerleading (Amara) | `XDd1HUvmnxW2YNEbA6nlNK` |
| ice-hockey (Nolan) | `uvGQg19b8hLDwq2Jc9vBvB` |
| gymnastics (Sofia) | `XY2YSoPYTgdSdrkNMgOgKo` |
| basketball (Marcus) | `fgueg7sV11zKnV1hir1Zsg` |

**Transfer budget: 11 assets, and only 11.** Hero — football poster `38:2`, card FRONT `40:2`,
card BACK `49:2`, certificate `79:2` from the football file (4); cheerleading poster `38:2`,
card FRONT `40:2` from the cheerleading file (2, background set only needs poster + FRONT, not
BACK or its own certificate). Slide 03 — hockey poster `190:167` + FRONT `190:204`, gymnastics
poster `190:253` + FRONT `190:291` (4). Nothing else leaves a sport file: slides 08–11 merge
frames that already sit on pages 01 and 02, and an in-file `clone()` across pages costs nothing.
Everything else is already local:
`exports/*/bonus/*.png`, `exports/shared-cutouts/*.png`,
`print-sources/output/<finish>/GDE-*-{card,certificate,poster}-*.png`,
`etsy/listing-images/02-basketball-poster/*` (social tiles, wallpaper strip, phone + monitor
mockups), `card-flip/out/GDE_*_CardFlip_*.mp4` for the video still.

Before transferring, **screenshot the source node** — one look confirms the file carries that
athlete's art and the right finish.

---

## 8 · What the buyer actually receives — 27 files + 1 live page

Audited 2026-08-25 against the artboards of `fgueg7sV11zKnV1hir1Zsg`, page *Stadium Night*.
⚠️ `etsy/CREATIVE-BRIEF.md` says "26 files" — that is an arithmetic slip in the brief, not a
different inventory. The list below is the count that may go on an image.

| Group | Files | What |
|---|---|---|
| Poster | 1 | `PRINT EXPORT · Poster` 5475×7275 @300 dpi (18×24 + bleed) |
| Cards | 2 | `PRINT · Card FRONT` + `BACK`, 816×1110 @300 dpi |
| Certificate | 1 | `PRINT · Certificate of Authenticity` 2550×3300 |
| Social | 9 | Grid 1–3 (1080×1350), Story 1–3 (1080×1920), ReelCover, Profile picture (1080×1080), Cover banner (1500×500) |
| Wallpapers | 7 | Phone home, Phone lock, iPad (2048×2732), Desktop (3840×2160) + three clean versions |
| Bonus | 6 | name+number sticker, number badge, 4 transparent cutouts |
| Video | 1 | the rendered card-flip MP4 |
| **Total** | **27** | plus **1 live registry page** at `/c/<cardId>`, opened by the QR on the card back |

**Not deliverables** (production sources — do not count them): `PACK · … FLAT`,
`GDE_*_Proof_Watermarked`, `CardFlip_Front/Back/MotionSpec`.

**Which of those are exclusive to this listing:** the poster, 7 wallpapers and 9 social files are
not in the card listing; the cards, flip video, certificate and registry QR are not in the
poster listing; the **sticker, badge and 4 cutouts are in no other listing at all**. That is the
$89 argument, and it is true as written.

**Certificate scope — decided 2026-08-25.** The certificate ships with the **card listing** and
the **complete set**; it does **not** ship with the poster-only listing. This matches what
slide 17 of the built card listing (`20:67`) already shows, so no rework there. It also confirms
the hero (slide 01) is honest to show the certificate — it belongs to the set being sold.
`etsy/listings/01-digital-trading-card.json` currently files it under "FULL DIGITAL SET adds"
(one of listing 01's internal package tiers, not a separate listing) — leave that as is; it does
not contradict this decision.

---

## 9 · The listing itself — `etsy/listings/04-complete-set.json`

Create it in the same shape as `01-digital-trading-card.json`, with these values.

**Title** — 115 chars, limit 140:
```
Custom Sports Poster & Trading Card Set | Personalized Athlete Gift From Your Photos | Any Sport | Digital Download
```

**Tags (13)** — the 10 shared from `docs/ETSY-COPY.md` plus three set tags, all ≤20 chars:
`custom trading card` · `personalized poster` · `youth sports gift` · `sports trading card` ·
`senior night gift` · `custom sports art` · `digital download` · `athlete gift` · `team gift` ·
`end of season gift` · **`sports gift set`** · **`poster and card set`** · **`any sport gift`**

**Etsy fields:** `price 89.00` · `quantity 999` · `type` digital · `when_made` made_to_order ·
`who_made` i_did · taxonomy Art & Collectibles → Prints → **Digital Prints** ·
processing 2–5 days · no shipping profile.

**Custom options — all five slots:**

| # | Field | Type | Req | Notes |
|---|---|---|---|---|
| 1 | **Sport** | List · **17** | ✓ | Basketball, Football, Baseball, Softball, Soccer, Ice Hockey, Volleyball, Lacrosse, Wrestling, Cheerleading, Gymnastics, Track & Field, Swimming, Tennis, Golf, Pickleball, **Other (write it below)** |
| 2 | **Style** | List · 6 | ✓ | Stadium Night · Chrome All-Star · Fire & Smoke · Heritage · Signature Spotlight · Prism Rush |
| 3 | **Athlete photos** | File upload · 10 | ✓ | ⚠️ **cannot be created by API — add by hand in Shop Manager, once**. Instruction: *"4 to 10 photos — the more angles, the better the likeness."* |
| 4 | **Athlete name** | Text | ✓ | |
| 5 | **Team, number & position** | Text | ✓ | instruction ends: *"If you chose Other for sport, write the sport here."* |

**Description skeleton** — sections in this order, wording lifted from listing 01 except where
marked new:

1. One-line opener: *Everything we make for your athlete in one order — the poster, the cards,
   the screens, the certificate, and the bonus die-cuts that are not sold in any other listing.*
2. `WHAT YOU GET — 27 FILES + 1 LIVE PAGE` — the six groups from section 8, spelled out. **new**
3. `ONLY IN THIS LISTING` — sticker, badge, 4 cutouts. **new**
4. `ANY SPORT` — the 16 named + *"if yours is not there, choose Other and write it in the box —
   we build it."* **new**
5. `HOW YOUR SET IS MADE — OUR 6-STEP PROCESS` — verbatim from listing 01, "card" → "set".
6. `HOW TO ORDER` — 5 steps, step 1 becomes *"Choose your sport and your art style above"*.
7. `PHOTOS THAT WORK BEST` — from listing 01, with its photo-count line corrected to **4–10**.
8. `SIX ART STYLES` — verbatim.
9. `AI DISCLOSURE` — the exact block from `docs/ETSY-COPY.md`, unedited.
10. `GOOD TO KNOW` — no league marks · 17 sports · digital only, nothing ships · photos deleted
    on request.

**Photo count — decided 2026-08-25: 4 to 10 photos, everywhere.** This replaces the repo's two
conflicting numbers (About text / listing 01's upload field said 3–5; listing 01's description
said 3–10). Fix both in the same pass as this build: `docs/ETSY-COPY.md` "ABOUT YOUR PHOTOS",
`etsy/listings/01-digital-trading-card.json` (description text and the `labeled_upload`
question's `max_allowed_files` → 10 and its instructions), and this listing's own copy/field.

**Alt text**: Etsy accepts 500 chars per image and we have never used it. Write one line per
slide from that slide's own content (not the title) while the frames are fresh.

**Videos** (2 slots, 3–15 s, square, silent — audio is stripped by Etsy): the flip video needs a
**1080×1080** target added to `card-flip/render.sh` first. Not a publish blocker; do it after
the 20 images exist.

---

## 10 · Traps — every one of these has already cost a session

1. **Page 01's frame names do not match their content.** Screenshot, then clone.
2. **The `NN / 20` counter is inside every cloned frame.** Renumbering all 20 is a step, not an
   afterthought; a page with three slides saying `17 / 20` looks broken.
3. **The 4:5 crop eats 10 % off each side.** Everything that must survive lives inside
   **x 200–1800**. Check every frame in both crops.
4. **Text colour may never come from a photo.** White + drop shadow on the hero; orange only as
   a graphic rule. (Measured: orange on a gym wall = 1.76:1 → the fix reads 8.51:1.)
5. **Style strings must come from the `Style` collection, per node.** If a cloned card carries
   live bindings, pin the mode on the **frame**, never the page — a literal breaks the link and
   a Chrome All-Star card silently renders "STADIUM NIGHT".
6. **`rescale()`, not `resize()`** when scaling artwork — `resize` crops children under
   `clipsContent`.
7. **`setCurrentPageAsync` at most once per `use_figma` call**; use `page.loadAsync()` and fan
   multi-page work out into parallel calls.
8. **`upload_assets` leaves temp frames** on the canvas. Delete them.
9. **The GDE mark is silver `#C8CDD6` — never orange, never a team colour, never the finish's
   own foil.** Orange is website-and-listing-furniture only.
10. **No league marks anywhere, including in mockups** — that includes any device mockup that
    might carry a platform logo. The fake social post is deliberately platform-less.
11. **A number on a listing image is a promise.** Re-`ls` before slide 19 gets its count.
12. **Do not re-render the flip videos, do not touch pages 01–02** except the two flagged copy
    fixes (page 01 slide 04's "before the poster is created", and listing 01's 3–10 photos).

---

## 11 · Order of work

1. **Skeleton.** 20 empty 2000×2000 frames on `61:504` at the x-grid, named, `placeholder = true`.
   Verify with `get_metadata`, then clear placeholders as each is filled.
2. **The 11 reuse slides** (02, 05, 06, 07, 12, 13, 15, 16, 17, 20 + the counter pass). One
   `use_figma` call per two or three frames, screenshot after each. This alone gets the page to
   "looks finished".
3. **The 9 asset transfers** (section 7), all into `src/`, uploaded in one batch.
4. **Slide 01 hero.** Build, then look at it at 200 px and in the 4:5 crop before continuing.
5. **Slide 03**, then **18**, then **19** — the three remaining new frames.
6. **The five merges** (04, 08, 09, 10, 11, 14).
7. **Copy pass:** counter numbers, the two changed words, caption floors, contrast check.
8. **`etsy/listings/04-complete-set.json`** + alt text.
9. **Export** the 20 PNGs to `etsy/listing-images/04-complete-set/` as `NN-<slug>.png`.
10. Update `etsy/LISTING-STATE.md` and tick listing #11 in `docs/ETSY-LISTINGS.md`.

Steps 1–2 are worth doing first even if the rest slips: the page is publishable-looking after
two hours of clone work, and every later step improves rather than unblocks.

---

## 12 · Definition of done

- [ ] 20 frames, 2000×2000, correct grid, correct names, counters `01 / 20` … `20 / 20`
- [ ] every frame legible at 200 px; nothing vital outside x 200–1800 in the 4:5 crop
- [ ] captions ≥ 44 px, chrome ≥ 34 px
- [ ] one athlete / one kit / one crest per frame; no invented number, no league mark
- [ ] GDE mark silver everywhere; orange only on furniture
- [ ] no price, no "instant download", no platform logo anywhere
- [ ] slide 19's count matches a fresh `ls` of the delivered folder
- [ ] `04-complete-set.json` written, 5 custom options specified, Sport list = 16 + Other
- [ ] 20 PNGs exported to `etsy/listing-images/04-complete-set/`
- [ ] `etsy/LISTING-STATE.md` updated with what is built and what is not

**Manual, cannot be scripted:** the photo-upload field in Shop Manager (once per listing —
without it the order flow does not work at all), and downloading buyer photos after each sale.

---

## 13 · Decisions — settled 2026-08-25

1. **Hero lead: football + cheerleading, both.** Tui Fa'agata (football) foreground, Amara Boyd
   (cheerleading) background. Football's finished hero/kit/card/poster art was audited and is
   clean — see the note under slide 01 in section 5.
2. **Certificate ships with the card listing and the complete set; not with the poster listing.**
3. **Photo count: 4 to 10, everywhere** — copy, upload field, `max_allowed_files`.
4. **Second video: deferred.** Ship this listing with the existing flip video alone; the
   1080×1080 stills-slideshow video is a later pass, not a publish blocker.
