# Poster listing — audit and rebuild plan (basketball etalon first)

**2026-09-03.** The card listing was rebuilt around one idea: the buyer picks a PACKAGE, and every
slide either earns that decision or proves we can deliver it. The poster row in
`02 · POSTER LISTING` (`880:895`, section BASKETBALL `880:896`) still tells the **digital-only
story from August** — while the live listing (4562700100) has been selling three printed sizes
since the V3 rollout. This is the gap, slide by slide, and the order to close it in.

Sources checked live: the 20 poster frames, the live listing's title / tags / variants /
description / custom options, the print files on disk, `LISTING-IMAGE-CANON.md` §5–§10.

---

## 1 · Three contradictions between the images and what is actually sold — fix these first

| # | The image says | The listing sells | Consequence |
|---|---|---|---|
| **A** | Slide 18: **"DIGITAL FILES ONLY — NOTHING SHIPS"**, "✗ NO PHYSICAL ITEM SHIPS WITH THIS LISTING" | 18×24, 24×36 and 30×40 **printed posters, shipped free** | A buyer who reads the gallery believes the opposite of the variant they are about to pay $58–$110 for. Item-not-as-described in either direction. |
| **B** | Slide 17 "Everything you get": **"POSTER 18×24"** only; slide 02 scale sheet: **two** sizes | Variants: Digital · 18×24 · 24×36 · **30×40 XL ($155.99 base)** | The XL tier is sold with **no image showing it, no scale for it, and — checked on disk — no 30×40 print file exists** (`print-sources/output/*`: 5475×7275 for 18×24 everywhere, 7200×10800 for 24×36 only in 3 finishes, nothing at 9000×12000). |
| **C** | Nothing in the gallery shows a **printed poster as an object** — paper, tube, the certificate that ships with it | Every printed tier promises "premium matte stock", free tracked shipping and a printed Certificate | The card listing carries its physical price on slide 04 ("2.5 × 3.5 in · UV coated · square-cut") and the package photos on 02. The poster listing has no equivalent — the printed tiers are asking $58–$110 on words alone. |

**Decision needed on the 30×40 XL tier before any image is built for it.** Either it stays and
gets a real file (the V3.3a rule already written into `docs/ETSY-LISTINGS.md`: separate upscale
to ~6000×8000+, face QA at 4×, first XL order under a support watch) plus a scale/room image —
or it is **hidden** until then. Selling a size with no deliverable and no picture is the one
thing README §11 forbids ("never promise a deliverable we cannot ship"). Recommendation: hide it
now, re-enable when the file and the image exist. The plan below shows both branches.

---

## 2 · The poster buyer's flow — how it differs from the card buyer's

The card buyer's question is *"is this really my kid, and is it a real card?"* The poster
buyer's question is **"how big, where does it go, and printed or file?"** — the SIZE is the
purchase decision, and the wall is the context. So the poster gallery must answer, in order:

1. **What is this?** — hero (same recipe: one big before photo, arrow, sport surface).
2. **Which package?** — the matrix, with a real photo of each tier. This is where the price lives.
3. **What exactly arrives?** — per package: files vs. tube, sizes, certificate.
4. **How big is it, really?** — to scale, against a person (already built, and true to 24.8 px/in).
5. **How does it look in a room?** — the room shot (built; canon says vary it per sport).
6. **Will it look like my kid / in the right kit?** — the proof chain, cloned from the card listing.
7. **How do I order, what do I send, what can I set?**
8. **What if it's wrong?** — proof + refund promise.
9. **Why now, and what else?** — occasions, seasons, other sports.

That is the card listing's order with slides 02–05 re-cut for the size decision. Keeping the
two galleries parallel is deliberate: a buyer who opens both listings meets one shop, not two.

---

## 3 · The new 20 — basketball etalon

Numbering is the gallery position. **Source** = which existing frame it comes from; **Card twin**
= the card-listing slide it mirrors, so it can be cloned rather than designed.

| # | Slide | Source | Card twin | Action |
|---|---|---|---|---|
| 01 | HERO — the poster, up front | `880:1845` | 01 | **Rework pills.** Keep the one-big-photo + arrow recipe. Replace `FROM YOUR PHOTOS` / `6 STYLES` with the card hero's three: `PRINTED OR DIGITAL` · `18×24 · 24×36` · `6 STYLES`. Add the white-hairline chip the card hero uses on dark surfaces. |
| 02 | CHOOSE YOUR PACKAGE | — | 02 | **NEW — clone the card matrix.** Rows: files 18×24 + 24×36 · wallpapers + social · printed on matte stock · certificate · free US shipping tracked · ready in. Columns = the live variants. Four **real photos** above the columns (see §4). |
| 03 | EVERYTHING YOU GET — per package + the print | `880:1650` | 03 | **Rework.** Today it counts a digital set and says "POSTER 18×24". Becomes: the poster at both sizes, the certificate, the wallpapers/social set — and the **printed object**: tube, matte sheet, certificate in the tube. Footer fixes the size claim. |
| 04 | TWO SIZES, TO SCALE | `880:1926` | 04 | **Keep** — best slide in the row (true scale, ruler seated by the head). Retitle chip `PRINT IT YOUR WAY` → `PRINTED BY US, OR PRINT IT YOURSELF`. If XL stays: add the third silhouette at 24.8 px/in (30×40 = 744×992 px). |
| 05 | THEIR SEASON. THEIR WALL. | `880:897` | 05 | **Keep.** Canon debt stands: vary the room per sport (desk / hallway / trophy shelf / propped on a bed). |
| 06 | ONE ATHLETE, SIX FINISHES | `880:1041` | 06 | Keep. |
| 07–09 | Style pairs | `880:1073/1103/1132` | 07–09 | Keep. **Audit both posters per pair are the named finishes** — the card row had "front and back" pairs that were two fronts; posters have no back, but the same duplicate-hash audit applies. |
| 10 | EVERY FIELD IS YOURS | `880:1233` | 10 | Keep. |
| 11 | HOW TO ORDER — digital or printed | `880:1677` | 11 | **Rework — contradiction A.** Clone the card's 11: four steps, `DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7`, `PRINT PACKAGES SHIP FREE WITH TRACKING`. Delete `NOTHING SHIPS`. |
| 12 | WHAT PHOTOS TO SEND | `880:1161` | 12 | **Swap to the shared set** — same sprite hash `9fea04c7…` as all six card sections, same four captions. Today it is Marcus again, so 12 and 13 repeat photos exactly as they did on the card row. |
| 13 | WE GET THEIR LIKENESS RIGHT FIRST | `880:906` | 13 | Keep (already correct: 4 photos + both identity plates). |
| 14 | ONE ATHLETE, CONSISTENT | `880:965` | 14 | **Add the rejected take** — clone the card row's tile 2 (red tint, `REJECTED TAKE`, red FAIL chip). Basketball's near miss and its measured score already exist on the card side (0.287). |
| 15 | THEIR UNIFORM. THEIR NUMBER. | `880:937` | 15 | Keep. |
| 16 | YOUR CLUB'S CREST | `880:1197` | 16 | Keep. |
| 17 | YOU APPROVE IT BEFORE IT'S FINAL | `880:1353` | 17 | **Add the refund band** `NOT RIGHT? WE REVISE IT — OR REFUND EVERY CENT`. The live description already carries the print-reprint promise; the proof-stage sentence is on the card row only. |
| 18 | ONE EVERY SEASON | `880:1008` | 18 | Keep (shared age row; one variation for all sports). |
| 19 | MADE FOR THE MOMENT | `880:1728` | 19 | Keep. |
| 20 | SEVENTEEN SPORTS | `880:1783` | 20 | Keep. |
| — | *It goes on the wall and on every screen* | `880:1619` | — | **Drop.** Its two facts (social post, desktop wallpaper) move into 02's digital tile and 03's file list. A gallery slot is too expensive to say a bundled extra twice. |

Two things the card row taught, both apply here: **fix typography in the etalon and propagate**
(the card 02 matrix was Anton + Space Grotesk; the poster clone must be built from the same
component, not re-typed), and **one authoritative sprite per slide** where several sections share
art (12, 18, 20).

---

## 4 · The four package photographs — the part that needs generating

Same method as the card packages (`art-pipeline/lib/package_tiles.py`, memory
`gde-product-tiles`): three base scenes shot once, only the artwork changes per sport, so the
whole shop's package row looks photographed in one sitting.

| Tile | Scene | Build |
|---|---|---|
| **Digital files** | The existing laptop-and-phone desk (`pkg-digital.png`) — the poster open in the reader, the phone showing the wallpaper. | `phone_page()` already fits a document into the phone at true aspect; add a poster branch (0.75) next to the card branch (0.714). Laptop page quads are already measured. |
| **18×24 printed** | A poster **in the tube, half drawn out**, matte sheet curling, the A4 certificate beside it, on the oak table (`pkg-table.png`). | One generated scene with a **blank matte-black sheet** (the card-in-hand rule: generate the object empty, warp the real art on with `warp_onto.py --mask-dark`). Tube + certificate are props, no type to garble. |
| **24×36 printed** | The same sheet flat on the table, corner lifted, next to the 18×24 for size — or on a wall with the ruler person. | Reuse the scale-sheet ruler (`ruler-person.png`, 24.8 px/in) so the two printed tiles and slide 04 agree on size to the pixel. |
| **30×40 XL** *(only if the tier stays)* | Same wall scene, larger. | Needs the 9000×12000 file first (V3.3a). Until then this column reads `COMING SOON` — or the column is not there. |

All four tiles are cropped by `tile_crop.py` to one fill fraction so the row reads as a set.

---

## 5 · The listing copy — what to change on 4562700100 (title/tags = one 30-day commitment)

Everything below was read live on 2026-09-03.

**Title now** `Custom Basketball Poster | Personalized Athlete Wall Art From Photos | Printed or Digital`
**Title after** `Custom Basketball Poster | Personalized Athlete Wall Art | Sports Room Decor | Printed or Digital`
— drops `From Photos` (not a search term, README house rule) for `Sports Room Decor`, the decor
cluster the copy pack already assigns to posters. 13 words, no repeats.

**Tags now (13):** `custom basketball` · `basketball gift` · `athlete gift` · `team gift` ·
`end of season gift` · `basketball poster` · `custom sports poster` · `personalized poster` ·
`basketball wall art` · `athlete poster` · `custom sports art` · `digital poster` · `photo sports poster`
**Out (5):** `custom basketball` (truncated, no phrase) · `personalized poster` · `custom sports art`
· `digital poster` (the listing is not digital-only any more) · `photo sports poster`
**In (5):** `sports wall art` · `gym wall art` · `sports room decor` · `boys room decor` ·
`game room decor` — the measured decor shelf (`basketball wall art` 2.3k, `football wall art` 2.2k
pattern), already in `LISTING-COPY-PACK.md` §B2.

**Description:** the V3 blocks are there (CHOOSE YOUR PACKAGE, certificate, OUR PROMISE, SHIPPING)
— two edits only: (1) OUR PROMISE gets the proof-stage sentence *"you approve a proof before
anything is finalized. If we cannot reach a result you are happy with, we refund every cent"*
in front of the reprint sentence, to match slide 17; (2) if XL is hidden, remove the
`30x40 XL STATEMENT POSTER` line. Description edits are free of the 30-day freeze.

**SKUs:** live are `GDE-BBALL-POST-*`; the registry code is `BKB`. Same `FBALL`→`FTB` problem as
the football card — fix when the listing is open for the title.

**Custom option 5** is `Headline / short message` here (posters have no stats) — correct, keep.
Its instruction contains `This is my court` — one capital word, so it passes the rule found on
2026-09-03.

---

## 6 · Order of work

1. **Decide XL** (§1 C-branch). Everything in 02/03/04 depends on whether there are three
   printed sizes or two.
2. **Slides 11 and 03** — the two contradictions. Rework in Figma; these are copy changes on
   existing frames, no generation. Export and replace on the live listing the same day
   (images are not frozen).
3. **Slide 02 matrix + the four package photos** (§4) — the only generation in the plan
   (two scenes: tube-and-certificate, sheet-on-table/wall; ~€0.60).
4. **Slides 12, 14, 17** — clone from the card row (shared sprite, rejected take, refund band).
5. **Hero pills** and the slide-04 chip.
6. **Drop old 16**, renumber, run the three audits the card row now has: duplicate-hash on 06–09,
   natural-aspect vs. etalon, "foreign sport" text scan.
7. **Title/tags edit** (§5) — after the three new card listings have indexed; description edits
   any time.
8. Then propagate to FOOTBALL (`880:2153`) and CHEERLEADING (`880:2991`) exactly as the card
   row was propagated: clone, swap art from the sport's Figma file, per-sport room scene.
