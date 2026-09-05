# Senior Night (SR) — progress

**Started 2026-08-27.** The seventh style, and the first **occasion-led** one: it is not a material
invented for the shelf, it is the ceremony that actually happens on an American senior night — the
last home game, house lights down, gold confetti, the crowd holding up phones.

Why it exists: senior-night searches peak **Sept–Oct at ~7.1k vs ~1k in late August**
(`etsy/SEO/ETSY-SEO-FINDINGS.md`), and the buyer is the least price-sensitive in the shop — a fixed
date, a final season. The listings have to be live and indexed **by September**.

---

## 1 · The style

| | |
|---|---|
| Name / code | **Senior Night** · `SR` (`SN` was already Stadium Night) |
| Palette | champagne gold `#D9B36A` + ivory `#F4EDE0` on warm near-black |
| Typography | **Playfair Display Black** (display) + **Oswald** (supporting) — used by no other finish |
| Signature glyph | a **mortarboard with a tassel**. The stars were dropped: they already belong to Chrome All-Star's listing |
| Card frame | **banner-pennant** — gold hanging rod, grommets, stitched dashed border, swallowtail bottom, and the athlete breaking out over the frame |
| Headline | `ONE LAST HOME GAME` |
| Card ID | `GDE-SR-<SPORT>-2026-<number>` |

**The card back is different on purpose** — this is what a senior buys that a season card cannot give:
CAREER HIGHS instead of season stats, a `FR 2023 · SO 2024 · JR 2025 · SR 2026` progression line,
`SENIOR SEASON 2025-26` / `CLASS OF 2026`, the athlete's **senior quote** set in Playfair Italic, a
signature line, and a `SENIOR EDITION · 1 OF 1` stamp.

## 2 · Art — DONE for 5 sports

`senior-night` is a real entry in `art-pipeline/finishes.ts`, so backgrounds come off the same
conveyor as every other finish:

```bash
npm run art:bg -- --finish senior-night --sport <slug>
```

Reference: `print-sources/senior-night/senior-night-background.png` (the approved basketball take).
Seven basketball candidates were generated first; **E "Confetti Storm"** won — the earlier
"C Legacy Deep" was too dark to see people in.

| Sport | Background | Figma page |
|---|---|---|
| basketball | ✅ | `2304:566` — **sections 01–05 complete** |
| football | ✅ | `4052:155` — **sections 01–05 complete** (2026-08-28) |
| cheerleading | ✅ | `4022:146` — section 01 |
| soccer | ✅ | `5015:146` — section 01 |
| volleyball | ✅ | `5019:146` — section 01 |

Node IDs per sport: `docs/FIGMA-FILES.md`.

Three backgrounds needed a second roll, and each fix became a rule rather than a re-dice:
soccer read as an ordinary floodlit night match (the finish now says **the house lights are OUT**);
cheerleading arrived with a judges' podium and rows of chairs (`prompts.ts` now names the furniture
for every propless sport, which also protects gymnastics and wrestling); football's goalposts were
cropped and off-centre.

**Total AI spend on Senior Night art: ~€2.75 across 18 generations.**

## 3 · Listings — THREE, mirroring the regular line

The regular line already splits 04 set / 01 card / 02 poster, so the same split here makes three
distinct products rather than re-titled duplicates — the exact risk that got Senior Night parked in
`docs/ETSY-LISTINGS.md` in the first place.

| Page | Figma | Price | Contents | JSON |
|---|---|---|---|---|
| `03 · Digital SENIOR NIGHT` | `2:3` | **$99** | 28 files + live registry page | `etsy/listings/03-senior-night.json` |
| `03b · SENIOR NIGHT — CARD` | `522:127` | **$49** | 20 files + live registry page | `03b-senior-night-card.json` |
| `03c · SENIOR NIGHT — POSTER` | `525:127` | **$49** | 18 files, no registry | `03c-senior-night-poster.json` |

20 slides each, 2000×2000. Exports: `etsy/listing-images/03-senior-night/`,
`03b-senior-night-card/`, `03c-senior-night-poster/` (gitignored — regenerate from Figma).

- **Slide 02 shows four REAL Senior Night sets** — Tui (football), Amara (cheer), Mateo (soccer),
  Jaslene (volleyball). It used to show four different finishes, while the listing claims one style
  for every sport. A listing that claims one style has to show one style.
- **Card variant**: hero is card front + back; slide 19 drops the poster and set-bonus panels.
- **Poster variant**: hero is the poster alone; **slide 18 was rebuilt from the registry slide into
  the print story**, because a poster ships no card and no certificate, so it cannot promise a QR.
- The hero follows the canon in `etsy/LISTING-IMAGE-CANON.md`: canonical left column, one big
  before-photo and arrow, nothing in the heart or play-button zones.

## 4 · Open — read before publishing

1. **SR sections 02–05 exist only in the BASKETBALL file.** Football, cheerleading, soccer and
   volleyball have section 01 (poster + card FRONT/BACK) only. The listings promise social files
   and wallpapers, so these must be built per order — or before the sport picker is used at scale.
2. **`/c/GDE-SR-BKB-2026-12` must render** — the QR on images 16/18 is real and scannable from the
   search grid. The id and `Senior Night: "SR"` are in `lib/registry/cards.ts`; `npm run qr:gen` has
   written the PNG.
3. **SR card-flip video not rendered** — `card-flip/render.sh STYLE=SR`. All three descriptions
   promise it for the card and set listings.
4. **Slide 03's card-in-hand photo still shows the Stadium Night card** — regenerate through
   `art-pipeline/lib/card_in_hand.py`.
5. **24×36 is promised in the poster copy.** The 2:3 SR frame exists in basketball at 1800×2700;
   export at 4× for true 300 DPI before the first delivery.
6. No listing videos for any of the three.

## 5 · Traps this build paid for

Written up in full in `docs/FIGMA-FILES.md`; the short version:

- **Card-back stat echoes are named `stat_value`, not `*_echo_*`.** Hiding by `/echo/` leaves three
  identical values stacked ~6–12 px apart and "312" reads as "302". Keep the LAST one in z-order
  and re-centre its ink.
- **Figma renames a text layer to its own content.** After `characters = "SENIOR SEASON"` the layer
  is no longer named `SEASON`, so a later `name ===` test silently fails. Capture the name first.
- **You cannot move a node inside an INSTANCE** (`relative-transform` is not overridable). Hide the
  instance's `#number` and draw the ghost on the poster instead — and seat it by measuring
  `absoluteRenderBounds`, because Playfair's ascender puts the ink ~390 px below the box top at 880 px.
- **`upload_assets` places a plate on the current page**; read the plugin-side `imageHash` back and
  assign fills by hash. The upload endpoint's hash is a different id space.
- A stray upload plate left on the poster silently covered the athletes — check a frame's children
  after any upload.

---

## 6 · Full audit of the SET listing (2026-08-28)

Read at a size where the type is legible, not as thumbnails.

| # | Slide | Verdict |
|---|---|---|
| 01 | HERO — the set | ✅ keep |
| 02 | Every senior. Every sport. | ✅ keep — four real SR sets |
| 03 | The card in hand / poster on wall | ⚠️ **duplicates the hero's job**, and it is two friends in a bedroom — not senior night |
| 04 | Seventeen sports. Pick yours. | ⚠️ **becomes the LAST slide**: redirect to the shop for other sports and styles |
| 05 | Transformation | ⚠️ needs senior-night flavour |
| 06 | Step one · likeness | ✅ process, style-agnostic |
| 07 | The kit, front and back | ✅ process |
| 08 | Four shots, measured | ✅ process — the strongest trust slide we have |
| 09 | One athlete, six finishes | ❌ **KILL** — this listing carries ONE style |
| 10 | Style pair — SN + CA | ❌ KILL |
| 11 | Style pair — FS + HE | ❌ KILL |
| 12 | Style pair — SS + PR | ❌ KILL |
| 13 | What photos to send | ✅ keep |
| 14 | Your club's crest | ✅ keep |
| 15 | Every field is yours | ✅ keep — already SR gold |
| 16 | You see it first (proof) | ✅ keep — already SR |
| 17 | Where it lives — social & screens | ❌ **DEFECT: shows Stadium Night blue art** in a gold listing |
| 18 | Registered. Verified online. | ✅ keep — already SR |
| 19 | Everything you get — counted | ✅ keep |
| 20 | Digital files only / how to order | ✅ keep, moves up one |

**Four slots freed by killing 09–12**, plus 03 to re-purpose. The six-finish slides were not just
redundant, they contradicted the listing: a Senior Night listing sells ONE style, and slide 09's
own subline offered "any of the six classic finishes".

### The sport: FOOTBALL, not baseball
Baseball is a **spring** sport in US high schools — wrong season for an autumn senior night. The
fall sports are football, volleyball, soccer, cross country and cheer. Football is the biggest
(~1M participants), senior night is a football institution (Friday nights, Oct–Nov), and our own
keyword work already says to launch football and cheerleading on senior-night positioning ahead of
the Sept–Oct peak. **The set listing leads on football (Tui Fa'agata, #54, Millbrook Bison)**, with
the girls' fall sports carried by the range slides so half the market still sees itself.

### The new 20 (planned)
1 HERO · 2 the senior-night scene (3+ friends with their cards, matching posters on stage) ·
3 every senior every sport · 4 **each sport its own night** (sport-specific SR backgrounds) ·
5 **limited edition — Class of 2026 collection** · 6 transformation · 7 likeness · 8 kit ·
9 four shots measured · 10 what photos · 11 crest · 12 every field · 13 **the card back: four-year
career + senior quote** · 14 proof · 15 social & screens (rebuilt on SR art) · 16 registered ·
17 everything you get · 18 **timing — senior night is on the calendar** · 19 how to order ·
20 **other sports and styles → the shop**.

---

## 7 · Football SR set finished (2026-08-28) — and what the sweeps got wrong

Football now has the complete Senior Night set: print cards with bleed, poster print export,
pack, certificate, watermarked proof, 9 social files, 7 wallpapers and the digital bonus.
Verified mechanically: **0 cold (Prism) paints and 0 leftover style names remain on the page.**

**The GDE mark is GOLD on Senior Night** — a deliberate exception to the "the mark is always
silver foil, never the finish's foil" rule, decided by the customer. It applies to Senior Night
only; the other six finishes keep silver.

Getting there took four wrong passes, and each one is worth remembering because the next sport
will offer the same traps:

1. **A blunt "replace cold colours with gold" sweep destroys dark panels.** Navy *is* cold, so the
   card-flip MotionSpec's background turned into gold foil. The rule that works: cold **and dark**
   (luminance < 0.32) becomes the same darkness made warm; cold **and bright** becomes gold.
2. **Prism art also hides in FRAME fills, not just in `#background`.** The print-export poster kept
   its neon because the wrapper frame itself carried the image while the nested `#background` was
   hidden. Sweep image fills by node, not by layer name.
3. **`#card_bg` must be re-asserted explicitly.** A generic image sweep gave every card the arena
   photo as its background. Named layers need named values — heuristics are for finding problems,
   not for fixing them.
4. **Deduping "identical numeric siblings" hid a real value.** `2026` legitimately appears twice on
   the card back (senior season and class of), so the dedupe treated the pair as chromatic echoes
   and hid one. Echo detection must also require the twins to be within ~6 % of the host's width.
5. **A brand mark is a vector inside a frame.** Setting fills on the *frame* painted a gold
   rectangle over the wordmark. Paint the vectors; clear the container.
6. **A style name can be split across two text layers** (`PRISM` / `RUSH` on the pack), so a
   single-node find-and-replace misses it.

7. **Echo tolerance must fit the container, not the card.** Deduping stat values with a tolerance
   of 6 % of the *host* width works on a 750 px card but not inside a 207 px stat tile, where the
   echoes sit 12–18 px apart. Inside a `stat` tile there is only ever one real value: keep the
   top-most and hide the rest, no distance test.
8. **Every card replica is now a CLONE of the master card**, not a re-themed copy. The print cards,
   proof, social and card-flip frames were built from the Prism card and so never had the
   banner-pennant frame — the printed card would not have matched the digital one. Cloning is the
   only thing that keeps them identical.
9. **A 816×1110 print frame is 0.735 wide-to-tall and a card is 0.714**, so a tolerance of 0.03
   swallows the print frame whole and destroys its bleed geometry. Rebuild print frames explicitly:
   816×1110 clipping frame, bleed rectangle at y −16, card clone at 744 px, square corners.
10. **The cards carry the arena, not flat black** (customer, 2026-08-28). `#card_bg` takes the
    finish background image; the scrim and the overlay keep the type readable.

## 8 · The die-cuts are Senior Night shapes now (2026-08-28)

The bonus die-cuts inherited Prism Rush's silhouette — a chamfered plate and a diamond — which is
exactly the thing the canon says must change per finish, because the silhouette *is* part of the
finish identity. Both were rebuilt natively:

- **Sticker → a hanging pennant.** Gold rod with three grommets across the top, stitched dashed
  inner border, swallowtail notch cut into the right edge, the surname in Playfair gold foil and a
  `SENIOR NIGHT · CLASS OF 2026` line beneath it. The number sits in a **wax seal** that overlaps
  the notch, so the seal reads as the thing holding the ribbon.
- **Badge → a ceremony medal.** A struck disc with a 36-bead rope ring, the mortarboard cap above
  the number, `CLASS OF 2026` under a short foil rule, and two ribbon tails below the disc.

Both carry a white keyline (`cut_contour`) and a drop shadow, so the die line is visible for
cutting. Built in football and basketball — the only two sports with a section 05 so far; any new
sport gets them from the same code.

## 9 · Re-propagating after a hand edit (the repeatable job)

The three masters on the football Senior Night page are the source of truth. Edit them by hand,
then re-clone every replica from them — **never re-theme a replica in place**, or the printed card
stops matching the digital one.

| Master | Node |
|---|---|
| Poster · Senior Night hero — V2 | `4052:156` |
| Card · Senior Night — FRONT V2 | `4052:202` |
| Card · Senior Night — BACK (info) | `4052:237` |

**Find the replicas mechanically**, do not keep a hand-written list — ids change every time they are
re-cloned. A replica is a frame that

- contains a direct child named `#card_bg` and has an aspect within 0.02 of **0.714** → a CARD, or
- contains a direct child named `nameplate` and has an aspect within 0.02 of **0.75** → a POSTER.

It is a BACK card when it has a descendant named `#back_photo` or `stats`. Today that finds 13
cards and 3 posters across sections 02, 03 and 05; the wallpapers are their own layouts and must
not be touched.

⚠️ **Keep the aspect tolerance at 0.02.** The 816×1110 print wrapper is 0.735 against a card's
0.714, so a tolerance of 0.03 swallows the wrapper and destroys its bleed geometry.

To replace: clone the master, `insertChild` at the replica's index, `rescale(w / master.width)`,
restore x/y/rotation/name, set `cornerRadius = 0` for the two print cards, then remove the old node.

## 10 · The set listing rebuilt on football (2026-08-28)

**Slide 03 is now the listing's emotional hero**: four of OUR seniors — Tui (football), Amara
(cheer), Mateo (soccer), Jaslene (volleyball) — celebrating on the gym floor, each holding their
own card, with their four posters on easels behind them.

Two rules made it real rather than stock:

1. **The people are ours, measured.** The four identity plates go in as references and each face
   is scored against its own anchor with ArcFace: **Tui 0.724 · Amara 0.572 · Mateo 0.480 ·
   Jaslene 0.473**, all well over the 0.36 line. A scene with invented seniors would advertise the
   opposite of what this shop sells.
2. **The cards and posters are the real exports, warped in.** Every card and poster is generated
   as a blank matte black plate and composited afterwards by
   `art-pipeline/lib/plates_composite.py` — the same reason `card_in_hand.py` exists: the model
   draws card ART well and card TYPE badly, and the card is the product. The new tool takes a list
   of quads, pulls the occlusion mask from the photograph itself (inside the quad, flat dark pixels
   ARE the plate; a thumb is not), and carries the room's light onto the art.

**Card size is a stated requirement.** The first take came back with plates the size of tablets;
the prompt now says a trading card is 2.5 x 3.5 in — about three finger-widths — and that if it is
wider than the palm it is wrong.

### Structure now
The four six-finish / style-pair slides are **deleted** — a listing that sells ONE style cannot
show six — and `Seventeen sports` moved to the END as the redirect to the shop. Sixteen slides are
laid out in story order; **four slots are free** for: each sport's own background, the limited
Class of 2026 edition, the card back (four-year career + senior quote), and the senior-night
calendar. Numbering is re-run once all twenty exist.

## 11 · The final 20 for the complete-set listing (locked 2026-08-28)

Football leads; basketball is gone from the listing. Order, and the job each slide does:

| # | Slide | Its one job |
|---|---|---|
| 1 | HERO — the set | what is this |
| 2 | Every senior. Every sport. | four real SR sets, one style |
| 3 | Four seniors. Four last home games. | the night itself — our four athletes, their real cards |
| 4 | Each sport gets its own night | the gold ceremony on YOUR surface, not a filter |
| 5 | Class of 2026, stamped into the set | scarcity, dated edition, die-cuts |
| 6 | The senior quote | how deep the personalisation goes |
| 7 | Step one · likeness | it will look like my kid |
| 8 | The kit, front and back | the uniform is rebuilt, not pasted |
| 9 | Four shots, measured | the trust slide — real ArcFace numbers |
| 10 | What photos to send | what the buyer must do |
| 11 | Your club's crest | their school, no league marks |
| 12 | Every field is yours | what is personalised |
| 13 | You see it first | proof before delivery |
| 14 | Ready before the night | the date is fixed — timing |
| 15 | Two sizes, to scale | how big it actually is |
| 16 | Where it lives — social & screens | it is not only a print |
| 17 | Registered. Verified online. | provenance, the real QR |
| 18 | Everything you get — counted | the inventory |
| 19 | How to order | the mechanics |
| 20 | More in our shop | card-only, poster-only, other styles |

Slides 4, 5, 6, 14 and 15 are new; the four six-finish slides they replace were deleted because a
one-style listing cannot show six. The scale sheet (15) is cloned from the poster listings so it
inherits the true 24.8 px/in rule rather than re-deriving it.

## 12 · Audit before showing, not after (2026-08-28)

Four rounds of defects reached the customer that a machine should have caught: stale card exports
that were still flat black, a "REJECTED TAKE" panel carrying another athlete's numbers, leftover
Prism art in the print files, basketball names inside the inventory slide. **The customer is not
the test suite.** Two auditors now exist and are run before any listing is shown:

- `art-pipeline/figma/audit-listing.js` — paste as the `code` of `use_figma`. Per slide it reports
  forbidden words (another athlete, another finish, known typos, "six finishes" in a one-style
  listing), a counter that disagrees with the slide's position, text running off the artboard, and
  empty image slots.
- `art-pipeline/figma/audit-exports.py` — run over the exported folder. Checks the count is 20,
  every file is 2000x2000, none is blank, and no two neighbours are near-identical (the signature
  of a stale export).

Three traps the auditors themselves taught:

1. **Slides can live inside a SECTION.** Reading `page.children` returned "0 slides, 0 issues",
   which is indistinguishable from a clean run. Discovery must use `findAll`.
2. **A clipped node is not an overflow.** The inventory slide legitimately crops card replicas, so
   the overflow rule has to skip anything with a clipping ancestor.
3. **Word boundaries matter.** `/LEAR FACE/` matches "CLEAR FACE" and reported the corrected copy
   as a typo.

The stale-export defect has a root cause worth naming: **a re-export is required after every art
change, and the listing points at uploaded copies, not at the live nodes.** When a master changes,
re-export, re-upload, re-point — or the listing keeps selling the old picture.

## 13 · The flow audit — what the sequence was doing wrong (2026-08-28)

Pulling every slide's eyebrow and headline into one list is its own audit, and it showed the
listing was saying the same thing three times:

- **02** EVERY SENIOR. EVERY SPORT. · **04** EACH SPORT GETS ITS OWN NIGHT · **20** CARD ONLY.
  POSTER ONLY. EVERY SPORT.

Slide 04 was redundant the moment slide 02 started showing four sports each on their own surface,
so 04 was deleted and its point moved into 02's subline ("the same gold ceremony, lit on their own
field, court or mat"). The freed slot went to the beat the listing did not have at all: **the gift
being handed over**.

The second problem was rhythm — seven consecutive process slides in the middle. Two product slides
(what is personalised, the senior quote) moved ahead of the process block, so the arc now runs:

**hook → the night → the gift → range → scarcity → what is personalised → depth → how it is made
(3) → what you must do (2) → approval → timing → size → screens → provenance → inventory → order →
shop.**

### The gift slide
Tui being handed the framed poster by his parents, his card in his other hand. The frame and the
card were generated as blank matte black plates and the real exports warped in, same as slide 02.
The copy is deliberately "PRINT IT. FRAME IT. GIVE IT TO THEM." — the set is digital, so the scene
shows a print being given, never a parcel arriving.

## 14 · Sales-flow refactor (2026-08-28, customer brief)

Not a redesign — the visual system, type, colour, grid and artwork are untouched. The listing was
becoming technical too early and hid its strongest conversion slide until position 18.

**What moved:** `EVERYTHING YOU GET` from 18 to **03**; `REGISTERED` to **09**, right after the
one-of-one claim; `HOW TO ORDER` from 19 to **10**; the crest/trademark slide to **19**, where
objection-handling belongs.

**What was deleted:** the similarity-score slide (`0.840 / 0.452 / 0.421`). Benchmark numbers mean
nothing to a buyer and make a keepsake read as an AI experiment.

**What replaced it (SN-11):** a photo-to-final slide — four ordinary phone photos on the left, one
orange arrow, the finished poster and card on the right. Built from the hero's own layout, so it
inherits the brand system rather than inventing one.

**One delivery claim only.** `FAST DELIVERY · 1–2 DAYS` contradicted the day-by-day timeline, so
the order slide now says `FIRST PROOF IN 1–2 DAYS` and the timeline owns the rest.

Frames are named `SN-01-HERO` … `SN-20-CROSS-SELL` and the counters were re-run.

### Three layout rules the refactor forced into the auditor
Rewriting a headline longer than the one it replaces breaks layout in ways a word-level check never
sees. All three are now in `audit-listing.js`:

1. **Text overlapping text**, measured on `absoluteRenderBounds` — a text box's declared height is
   often 10 px while its ink is 300 px, so box geometry proves nothing.
2. **Text hidden behind an image** — the hero headline grew and slid under the poster. The rule
   counts how much of a text's ink is covered by nodes drawn after it; over 30 % is a defect.
3. **Text past the artboard edge, even when the frame clips it.** The first version skipped
   clipping frames entirely, which is backwards: clipping is what hides the overflow.

A fourth lesson has no rule: setting `characters` on a `WIDTH_AND_HEIGHT` text makes it grow into
one long line instead of wrapping. Any rewritten supporting line needs `textAutoResize = "HEIGHT"`
and an explicit width.

## 15. Listing 03 — the 2026-08-29 pass (product photography + leftovers)

**Why:** the listing read as one long slab — 13 of 20 slides were the same light card-grid — and
three slides still carried Stadium Night basketball art.

**Product shots** (`art-pipeline/gen-sr-product.ts`, run with `GDE_BUDGET_EUR=85`): four scenes
generated with BLANK MATTE BLACK plates and composited by `lib/plates_composite.py` —
poster framed on a bedroom wall, card on a desk, cards in a nine-pocket collector binder, card
in an acrylic case on a shelf. They replaced:

| slide | was | is |
|---|---|---|
| SN-08 | ONE-OF-ONE, a light grid that said nothing | the card in its case on a shelf |
| SN-10 | a four-step panel duplicating SN-16 | three of the same card in a binder — "it's a file, print as many as you like" |
| SN-17 | a cluttered scale slide (floating face, a cut-off person as a ruler, pose markers) | poster-on-wall + card-on-desk with the two size pills |

**SN-11** was moved off the dark arena backdrop onto the light system: it was reading as a second
hero. **SN-05** headline went 76 -> 106 to match the other light slides; SN-06 98 -> 106. SN-09 and
SN-20 were left at 86/88 because 106 collides with their layouts — that is checked mechanically,
not assumed.

**Leftovers removed from SN-03.** The tile art was Stadium Night basketball: the bonus row, the
card-flip strip and all 14 social/wallpaper thumbnails, carrying a ghost number reading **12** in
16 places, plus 8 clone frames sitting off the artboard. All now come from the real football SR
exports (`rnOtXNBGu5VmumfldAhtNO`, sections 03/04/05), shipped as ONE atlas image with per-thumb
CROP transforms so it costs a single upload.

**Card placement.** `art-pipeline/lib/fit_plates.py` (new) fits plate quads by searching only
position, size and rotation at a FIXED aspect — a card is 0.714, a poster 0.75. Quads read off a
coordinate grid by eye put the cards half off the hands twice; this does not. SN-04's four seniors
now hold their OWN cards (football / cheer / soccer / volleyball), 80-94% plate coverage; SN-02's
poster fills its frame at 99.4%.

**Registry.** `GDE-SR-FTB-2026-54` added to `lib/registry/cards.ts` — the QR printed on the card
back and on the listing images resolves to it. `npm run qr:gen` regenerated 8 codes.

### Readability, measured
`art-pipeline/figma/audit-readability.py` hides every text, renders each slide, and measures WCAG
contrast against the WORST 15% of the pixels behind each line. Rendering the whole section does
not work — the exporter caps the image at 1024 px on its long side, so a 44240 px strip comes back
as mush. Render slides one at a time.

Real placement defects found and fixed: SN-08's footer sat on a bright shelf (2.37:1, now on a
gradient floor), SN-01/02/04/11 gained the scrim the photo slides are supposed to carry.

**What the meter still fails is the brand itself, and that is a decision for the owner, not a bug:**
* `#FF6B2B` orange text on the cream ground measures **2.2-2.5:1** (counters, kickers, the arrow).
* White text on an orange pill measures **2.84:1**.
Both are the established look and appear across the whole shop. Options, if we ever want them to
pass: darken the orange to about `#C9410F` on light grounds only (4.6:1, same hue family), or set
ink instead of white on orange pills (5.2:1). Informational lines were moved to ink already
(SN-10's spec line, SN-17's subline and kicker); decorative marks were left alone.

### The blue line in the Figma view is not in the artwork
Scanned every node for blue fills, strokes and underlines: **0**. Scanned the rendered slides and
the source photographs: **0 blue pixels**. It is the editor's selection outline and does not export.

## 16. Listing 03 is a SET with four packages (2026-09-03)

The owner resolved the plan conflict: Senior Night sells as SETS (any-sport master + per-sport
sport-locked sets), not as card-only / poster-only listings; 03b/03c are parked. The master page
was re-cut for the package decision — the full slide map, what changed and the gates are in
`docs/SENIOR-NIGHT-SET-PLAN.md` (§2 for the twenty, §4 for status). The listing JSON now mirrors
the live four-variant listing 4564565764 (`etsy/listings/03-senior-night.json` → `variants`).
