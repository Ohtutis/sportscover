# Etsy listing state — what is built, what is not

Written 2026-08-25. Updated 2026-08-26: **all three listings are LIVE on Etsy** (card $49,
poster $49, complete set $89; whole-shop LAUNCH30 sale to ~2026-09-26). Listing videos are
built (see below) but not yet attached in Shop Manager.

👉 **`etsy/LISTING-IMAGE-CANON.md` (2026-08-27) is the canon for the listing IMAGES** —
safe zones, the hero rules, what image 02 must prove, the sport-surface background system
and the true-scale rule. Read it before touching any listing image.

Figma file: **`JcQvsgIRiOQtuZcP3Q8dc9`** ("Etsy listing templates"). One page per listing, 20
slides each (Etsy's maximum), numbered `NN / 20`. Card artwork comes from the basketball
template **`fgueg7sV11zKnV1hir1Zsg`** (Marcus Ellison) — never from the master, which still
holds its Nia Brooks placeholder.

⚠️ **Two separate stale-export bugs found and worked around while building listing 04** — not
design defects, but files on disk that never got re-exported after the athlete was corrected:
`exports/stadium-night/bonus/GDE-SN-sticker-name-number.png` + `GDE-SN-badge-number.png`, and
all four `exports/shared-cutouts/GDE-cutout-*.png` files, still show the old placeholder athlete
(Nia Brooks #23) even though the live Figma source nodes are correct (Marcus Ellison #12).
Listing 04's own art was fixed by re-pulling directly from Figma; the files under `exports/`
are not yet fixed — flagged as a separate task, not done in this pass.

---

## 01 · Digital CARD LISTING — complete, 20/20

| Slide | Note |
|---|---|
| 03 · The kid on the card | the real Stadium Night BKB front warped into the boy's hand |
| 07 · Every year, the same kid | five ages rebuilt on ONE shared backdrop, one floor line, honest heights |
| 08–11 · finishes and style pairs | each card carries its own finish name; `meta` / `style_meta` rebuilt to the canonical geometry |
| 14 · Every field is yours | `COLOUR` → `COLOR` (US listing) |
| 15 · You see it first | back-card `#number_ghost` at 40 % |
| 18 · Digital delivery | fingerprint badge, `FULLY CUSTOMIZED · ONE OF ONE`; fixed `PROCEES` and `CUSTOMISED` |
| 20 · Sports cross-sell | shop CTA now names the shop and says what to tap |

The card-flip videos exist (`card-flip/out/GDE_*_CardFlip_*.mp4`) but are **not** part of these
20 images.

## Listing videos — second generation (2026-08-26/27)

All four listing videos now have STORY + CLOSE pairs where built: card story
(`GDE-etsy-01-card-story-1080.mp4`, owner-finished in CapCut as `Final version
Basketball.mov`), card close (`GDE-etsy-01-card-close-1080.mp4`), poster story + close
(`GDE-etsy-02-poster-{story,close}-1080.mp4`), complete set story + close
(`GDE-etsy-04-set-{story,close}-1080.mp4`, story carries baked-in captions). Plans:
`etsy/VIDEO-PLAN-0{1,2,3,4,5}-*.md`. Football (FS card / HE poster) and cheerleading (PR card / SS poster) card+poster
videos built 2026-08-27: `GDE-etsy-05-ftb-*`, `GDE-etsy-06-ftb-*`, `GDE-etsy-07-chr-*`,
`GDE-etsy-08-chr-*` — 12 listing videos total. None are attached on Etsy yet — manual
upload.

## Listing videos — built 2026-08-26, in `etsy/listing-videos/`

1080×1080, 30 fps, no audio, readable without sound; still slides with a slow zoom +
0.4 s crossfades; card/set videos carry a square-cropped segment of the SN card flip.

| File | For listing | Length | Sequence |
|---|---|---|---|
| `GDE-etsy-01-card-1080.mp4` | 01 card | 10.8 s | photos → transformation → card flip → six finishes → hero |
| `GDE-etsy-02-poster-1080.mp4` | 02 poster | 11.2 s | photos → transformation → hero → six finish rooms (0.7 s cuts) → wallpapers strip |
| `GDE-etsy-04-set-1080.mp4` | 04 set | 10.4 s | photos → hero → card flip → only-in-the-set → everything counted |

⚠️ While building these, the **SN card-flip videos turned out to be stale** — still showing
Nia Brooks #23. `card-flip/out/GDE_SN_CardFlip_1080x1350.mp4`, `_1080x1920.mp4` and
`_540.gif` were re-rendered 2026-08-26 with Marcus Ellison #12 (source: the 750×1050
`marcus-sn-card-*.png` in `etsy/listing-images/04-complete-set/src/`, lanczos-upscaled to
1500×2100 in `card-flip/assets/marcus-sn/`). **The other five finishes' flip videos
(CA/FS/HE/PR/SS) still show Nia** — regenerate before using any of them in a listing; each
needs that finish's Marcus card front/back at 2× first.

Build scripts for the listing videos live in the session scratchpad only (ffmpeg one-shots);
the recipe above + `card-flip/render.sh` is enough to reproduce.

---

## 02 · Digital POSTER LISTING — built, 20/20, with three known gaps

Cloned from the card page so both share one frame, type ramp and rhythm.

**Done**

| Slide | Note |
|---|---|
| 01 · HERO | bare wall, poster ~70 % of the height, athlete in profile looking at it |
| 02 · Transformation | claim rebuilt as a dark stamp (`NOT A FILTER` / `BUILT FROM SCRATCH`); the flat pill's text was 643 px wide on a 460 px plate |
| 03 · The kid and the poster | three frames in a row — two in-game action posters either side, his in the middle |
| 08 | six finishes as six posters |
| 09–11 | per finish: the poster, and the same poster hung in a room of that finish's mood |
| 14 · Every field is yours | poster centred and scaled to 858×1144; all ten leader lines re-pointed; `STLYE` → `STYLE` |
| 15 | back-card ghost number at 40 % |
| 16 · Social & screens | phone shows a generic feed post built around our 1080×1350 file; monitor shows the 3840×2160 wallpaper |
| 17 · Everything you get | poster · social post · social story · a strip of the three real wallpaper files — **no cards** |

**Gaps — do not treat this listing as shippable until these close**

1. **Slide 15 still shows the CARD front and back.** The labels correctly say `CARD FRONT` /
   `CARD BACK`; renaming them without swapping the artwork was tried and reverted, because a
   `POSTER` label over a card image is worse than an honest card image. Needs poster visuals.
2. **Slides 04, 05, 06, 12, 13, 18, 19 are inherited unchanged** from the card listing. Several
   are genuinely product-neutral (photo guidance, crest, occasions, cross-sell); 04 and 05 are
   not, and still describe a card.
3. **The 2:3 poster exists as a template only.** Six 2:3 frames are built in the basketball file
   at 1800×2700 (4× export → 7200×10800 = true 300 DPI at 24×36). Only Stadium Night, Chrome
   All-Star and Fire & Smoke have been exported, and those are proofs of the athlete in the
   template — not products. `etsy/listings/02-digital-poster.json` carries a `_gate` field
   spelling this out: the copy already promises two ratios.

---

## Assets on disk

- `etsy/listing-images/02-basketball-poster/` — hero, room shot, six per-finish rooms, the two
  slide-16 device mockups, the social files and the wallpaper strip
- `etsy/listing-images/02-basketball-poster/_alternates/` — **every** earlier take, kept on
  purpose, with a README saying which was rejected and why
- `print-sources/output/<finish>/GDE-*-BKB-poster-2to3-7200x10800-300dpi.png` — the 2:3 proofs
  (gitignored, like every poster PNG)

## Scripts

- `art-pipeline/figma/etsy-poster-in-room.py` — warps a real poster/wallpaper/social file into a
  generated EMPTY frame or screen. Prints the detected opening's aspect on every run; if it is
  not ≈ the target, it found a television, a window or a poster lying on a desk
- `art-pipeline/figma/etsy-fake-social-post.py` — wraps one of our social files in generic feed
  chrome (no platform name, no platform logo)
- `art-pipeline/figma/etsy-s03-card-inpaint.py` — the card-in-hand composite
- `art-pipeline/figma/etsy-s07-backdrop.py` / `etsy-s07-panels.py` — the age row

---

## 04 · Digital COMPLETE SET listing — built, 20/20

Figma page `04 · Digital Complete set ( all sports )` (`61:504`). Built per
`docs/ETSY-04-COMPLETE-SET-PLAN.md`. **11 of 20 slides are direct/near-direct reuse** of the
card and poster listings' shared process slides (05–07, 12, 13, 15, 16, 17, 20 unchanged;
08–11, 14 carry a light copy or caption edit); **4 slides are new** (01, 03, 18, 19).

| Slide | State |
|---|---|
| 01 · HERO | new — Tui Fa'agata (football, foreground) + Amara Boyd (cheerleading, background), poster + cards + certificate sliver, DIGITAL EDITION badge |
| 02 | reused from the card listing's slide 20 (sports grid), recaptioned |
| 03 · Two athletes, two sports | new — Nolan Reid (ice hockey) + Sofia Marchetti (gymnastics), two-column layout |
| 04–07, 12, 13, 15 | reused from the shared process slides, counter renumbered; 04 headline edited to "poster and cards" |
| 08, 09–11, 14 | reused from the card listing's finish/field slides, small caption additions noting the poster ships too |
| 16, 17 | reused: 16 from the poster listing (social & screens), 17 from the card listing (registered/QR) |
| 18 · Only in the complete set | new — sticker + badge + 4 cutouts, "NOT IN THE CARD LISTING. NOT IN THE POSTER LISTING." pill |
| 19 · Everything you get — counted | new — poster + cards + certificate + social + wallpapers + bonus box, "27 FILES + 1 LIVE REGISTRY PAGE" footer |
| 20 | reused from the card listing's slide 18 (digital delivery), "this edition exists once" wording |

**Decisions locked 2026-08-25** (see plan section 13): hero leads with football + cheerleading;
certificate ships with the card listing and the complete set, not the poster listing; photo
count is 4–10 everywhere (fixed in `docs/ETSY-COPY.md` and `etsy/listings/01-digital-trading-card.json`
in the same pass); second video deferred.

**File count on slide 19: 27 files + 1 live page** (audited against the real artboards in the
basketball Stadium Night file — `etsy/CREATIVE-BRIEF.md`'s "26" was an arithmetic slip).

## Assets on disk — 04 complete set

- `etsy/listing-images/04-complete-set/` — the 20 exported slide PNGs, `NN-slug.png`
- `etsy/listing-images/04-complete-set/src/` — the raw cross-file transfers (football, cheer,
  ice-hockey, gymnastics poster/card art; Marcus's Stadium Night poster/card/certificate; the
  corrected sticker/badge/cutout PNGs pulled directly from Figma to work around the stale
  `exports/` files)

## Listing JSON

`etsy/listings/04-complete-set.json` — title, tags, description, personalization fields (Sport
list · 17, Style list · 6, photo upload · 10, name, team/number/position), $89, digital /
made-to-order. Same three manual-only caveats as listing 01 (photo-upload field, no buyer-photo
API access, no send-message endpoint) — see `etsy/listings/README.md`.

---

## FOOTBALL — card + poster, built 2026-08-27

The first sport pair after basketball, and the template for the remaining fifteen. Athlete:
**Tui Fa'agata, #54, Millbrook Bison** (`art-pipeline/out/athletes/football/`). Art comes from
the football hero file **`rnOtXNBGu5VmumfldAhtNO`**.

**The pair leads with two DIFFERENT finishes on purpose** — card = **Fire & Smoke**, poster =
**Heritage** — so the shop can learn which one converts. Slides 08–11 still show all six in
both listings. Repeat this per sport: pick the two finishes that suit the sport and split them
across the pair.

### Where things live
- Figma `JcQvsgIRiOQtuZcP3Q8dc9`, page `01 · Digital CARD LISTING` → section **FOOTBALL**;
  page `02 · Digital POSTER LISTING` → section **FOOTBALL**. Each page now also has a
  **BASKETBALL** section, a `_SOURCES / mockup plates` section and (on the card page) two
  upload-plate sections. **Sections are how sports are separated inside one page** — one
  section per sport, not one page per sport.
- Exports: `etsy/listing-images/01-football-card/` and `02-football-poster/`, `NN-slug.png`,
  2000×2000. Working art in each `src/`.
- Listing JSON: `etsy/listings/01-football-card.json`, `02-football-poster.json`.

### What was generated, and what was not
Only SIX scene photographs are sport-specific and had to be generated
(`npm run art:etsy:sport -- --sport football --finish FS`, output in
`art-pipeline/out/etsy-shots/football/`): `hero-bg-dusk`, `athlete-holds-blank`,
`bad-blurred`, `bad-too-far`, `bad-group`, `bad-face-covered`, plus `p-hero-wall`,
`p-three-frames`, `p-room-lead` for the poster listing and one `reject-take`.
Everything else came from files that already existed — the six room plates
(`art-pipeline/out/etsy-shots/p-room-*.png`) are sport-neutral and were REUSED with the
football posters warped in.

### Three tools were written for this and serve every remaining sport
- `art-pipeline/lib/card_in_hand.py` — the photograph is generated holding a **BLANK** plate
  and the real card is warped in afterwards. The model reproduces card artwork well and card
  TYPE badly ("MILLBROOK BISON" came back as "MELLROCOK BTODA"), and the card is the product.
  It **audits itself**: plate coverage, leftover plate colour in a ring around the card,
  detected aspect, how much of the card the hand covers, and whether any card CORNER is
  neither drawn nor covered. `--strict` exits non-zero. Plate and hand are separated by
  **chroma** (skin sits in a narrow Cr/Cb band; a grey plate and a grey shirt do not) — every
  brightness-based rule failed, because a shadowed corner of a grey plate is as dark as a finger.
- `art-pipeline/lib/studio_panel.py` — slide 06's four pose panels are four separate
  generations and arrived with four different backdrops. The backdrop is now drawn once and
  every cutout placed on it, so what the panels share is real.
- `art-pipeline/lib/facecrop.py` — crops an intake photo to a slide's aspect without cutting
  the face off. Figma's FILL crops from the centre; parents' photos never put the face there.

### ⚠️ `upload_assets` does not reliably place fills on a non-current page
Uploading with `nodeIds` worked on the card page and silently did **not** apply on the poster
page — the POST returned `success:true` and the node kept its old image. The reliable route,
and the one to use from now on: upload onto **plate rectangles on the page you are on**, read
the plugin `imageHash` back with `use_figma`, then assign fills by hash. Note the upload
endpoint's `imageHash` is a DIFFERENT id space from the plugin's — never compare the two.

### Fixed in the football hero file while building (affects all six finishes)
- The card-back ghost number was 0.05–0.55 effective opacity depending on finish. Chrome
  All-Star, Fire & Smoke and Prism Rush were brought down to **0.20**, matching Stadium Night;
  Prism Rush's two echoes to 0.15. Heritage and Signature Spotlight were already quieter and
  were left alone.
- The athlete trio overflowed the card border (the flanking poses were sliced mid-body). Fixed
  at the shared athlete component, so all six finishes corrected at once.

### Also fixed, in BOTH the basketball and football sections
Two typos that are live on the shop today: `THE SEASON THEY JUSY PLAYED` → `JUST`, and
`LEAR FACE + CLEAR BODY` → `CLEAR FACE`.

### Known gaps
1. **No listing videos** for either football listing.
2. **Slide 07 (the age row) still shows soccer athletes** in both football listings. The slide's
   own claim is "any sport, any age", so it is honest, but it is not football.
3. Slide 15 on the POSTER listing still shows the card front/back under `CARD FRONT` /
   `CARD BACK` labels — the same known gap the basketball poster listing has.

---

## CHEERLEADING — card listing, built 2026-08-27

Athlete **Amara Boyd, Vale Prep Vanguard, FLYER** — **numberless**, so the card ghost is the
SURNAME and the card id is `GDE-PR-CHR-2026-00`. Art from `XDd1HUvmnxW2YNEbA6nlNK`.
Lead finish **Prism Rush** (poster listing, when built, should lead with Signature Spotlight).

Figma: page `01 · Digital CARD LISTING` → section **CHEERLEADING**. Exports in
`etsy/listing-images/01-cheerleading-card/`. Listing JSON `etsy/listings/01-cheerleading-card.json`.
Measured gate: hero 0.556 · reject **-0.002** · action3 0.628 · back no face.

### The recipe, now that it has been run twice
This is the whole per-sport procedure. It took a long session for football and about an hour
for cheerleading.

1. **Clone the section.** `section.clone()` on the card page, rename it for the sport, then walk
   the source and the clone in lockstep to get an old-id → new-id map. Every node id in the
   clone is stable from then on, so one map drives the whole build.
2. **Pull the sport's art** from its hero file — 6 card FRONTS, 6 BACKS, the lead poster, the
   lead certificate. `get_screenshot` at the node's natural size is enough for anything shown
   under ~550 px; use `download_assets` at scale 2 only for the lead finish.
3. **Prepare the athlete's own files** — `lib/facecrop.py` for the intake photos,
   `lib/studio_panel.py` for the four pose panels, a padded copy of `_kit.png`/`_kit-back.png`,
   and the crest from `out/crests/<crest>.cut.png`.
4. **Generate the scene shots**: `npm run art:etsy:sport -- --sport <slug> --finish <XX>`.
   Every one is graded by the judge; regenerate only what fails, and change the PROMPT rather
   than re-rolling.
5. **Measure a reject.** `reject-take` is generated WITHOUT the identity plate — that is how
   drift really happens — and scored with `lib/face.py`. Football measured 0.070, cheerleading
   -0.002. **Never label a frame REJECTED without a number under the threshold to show for it.**
6. **Composite the card into the hand**: `lib/card_in_hand.py`, which audits itself.
7. **Upload onto plates, then assign by hash** — see the football section for why placement
   with `nodeIds` cannot be trusted on a page that is not current.
8. **Text**: athlete name, the `position · team` line, both card ids, the slide-01 headline, and
   the three gate numbers on slide 06.

### Two detector lessons, both now in `lib/card_in_hand.py`
- A cheer gym is full of neutral grey — floor, walls, a grey T-shirt — so a saturation mask
  merges the blank plate into half the picture. The fallback searches **band by band in
  brightness** and keeps the blob that fills its own bounding rectangle like a card does.
- Football's plate was found by Canny; cheerleading's was not, because its edges had almost no
  contrast against a bright gym. Both paths are needed; the script refuses rather than
  guessing, which is what caught this.

---

## 2026-08-27 (later) — audit pass over football + cheerleading before upload

Every slide of both listings was read at a size where the type is legible, not as thumbnails.
Nine defects were found; all are fixed. Worth knowing which kinds of thing slipped through, since
the same kinds will slip through on the next fifteen sports:

| # | Defect | Where | Why it mattered |
|---|---|---|---|
| 1 | Prism Rush stat values read **55 / 22 / 88** | cheerleading + football PR card BACK | The chromatic-split echoes were offset 26–32 px instead of 0.065 em (~3 px), so each digit read as two. A buyer would have read "Level 55". Fixed at the source cards by re-seating both echoes off the CREAM master value, identified by fill colour — sorting by x picked the wrong master on two-digit numbers. |
| 2 | **Brand marks** — Under Armour, Lotto and a swoosh on three of the five age-row kits | slide 07, **all four** sections incl. the LIVE basketball ones | A trademark reproduced on a live listing. Inpainted out; the shirts now carry only the club crest. |
| 3 | Card in slide 03 was **9.1 finger-widths wide** (cheer) and 6.3 (football) | slide 03 | It read as a prop, not a trading card. Both photos regenerated with the card sized against the hand AND held toward the lens, so it is both believable and readable. |
| 4 | The card listings said "One **poster** turns the season…" | slides 04, 06, 07, 19 in all three card sections | The card listing describing a poster. Fixed in basketball too. |
| 5 | Side posters read **"HOME"**, kit was navy not forest green | football POSTER slide 03 | Readable words inside our own artwork, and the wrong club colours. Regenerated. |
| 6 | Cheer card id printed `-01` but the listing text said `-00` | cheer slides 15, 16 | Two different ids for one card. The card is right; the text was wrong. |

### The auditor now checks size, because it did not
`lib/card_in_hand.py` measured placement but not SCALE, and a perfectly placed card can still be
the size of a tablet. It now measures the card against the hand: a GDE card is 2.5 in wide and a
finger about 0.8 in, so a real card in a real hand is roughly **3 finger-widths** across. It also
gained a `--quad` escape hatch for the takes where neither detector can separate a charcoal plate
from a same-tone shirt — the refusal message had promised one for a while.

**Caveat recorded in the file:** when the grip shows only fingertips the measure over-reads. Treat
a failure as "go and look", not as proof.

### Still open for these two listings
1. **Cheerleading has no POSTER listing** — card only.
2. **No listing videos** for either sport.
3. Both heroes still carry two small before-photos rather than the one big one the canon asks for.

---

## The card-in-hand shot: BLACK plate + mask (2026-08-27, second rewrite)

The grey-plate version of `lib/card_in_hand.py` was thrown away. It generated a grey blank and
then tried to *work out* which pixels were fingers — colour distance, saturation, skin chroma,
distance transforms. Every one of those is a guess, and each failed in its own way: a shadowed
corner of a grey plate is as dark as a finger (so the corner got sliced off in a straight line),
a grey T-shirt behind a grey plate merges with it (so the region grew into the shirt), and a
thumb across the corner was either painted over — the card stopped looking held — or cut into
the artwork.

**The plate is now generated MATTE PURE BLACK, and then there is nothing to work out:**

    the black pixels ARE the card's visible area
    anything inside the card that is NOT black IS in front of it

That is the mask a retoucher would have pulled by hand twenty years ago, and it carries the
thumb's true silhouette, the gaps between fingers and the die's rounded corners for free —
because it is a photograph of exactly those things. No colour model, no per-photo thresholds.

The card is warped into the quad recovered from the **convex hull** of the black region, since
fingers only ever cut inward.

### Three bugs the rewrite had to fix, all worth remembering
1. **A thumb can eat a whole CORNER**, and then the hull has no corner to recover: the polygon
   fit returns a four-sided shape with one edge sloping across the bite and the card is warped
   into a wedge. The card's aspect ratio is the one thing known for certain, so it is the
   referee — take the polygon fit and the min-area rectangle, keep whichever is closer to
   0.714, and if it is still off, rebuild the rectangle at the card's true shape.
2. **Orientation was never checked.** `min/max` proportions are identical for a portrait card
   and a landscape mat, so a band of shadow was accepted and the artwork laid down sideways.
   The card is held portrait: its long side must be within 40 degrees of vertical.
3. **OpenCV's rect angle applies to the WIDTH axis**, so the long side of a `h >= w` rect is at
   `angle + 90`, not `angle`. Getting that backwards rotated the card 90 degrees, twice, in two
   different places.

Also: "leftover plate" is measured against the plate's own mask, not against "anything dark" —
dark hair crossing the card's rectangle is not the plate, and counting it made the audit cry
wolf on a composite that was clean.

**The grip is part of the brief now.** The prompt asks for the thumb ON the front face across
the bottom-left corner, so the card reads as held rather than presented; the mask puts it in
front automatically.

Football and cheerleading slide 03 were both rebuilt this way and both pass `--strict`:
aspect 0.713/0.714, plate-left 0.00%, hand covering 9-10% of the card.

---

## CHEERLEADING poster + the reveal/room rotations (2026-08-27, late)

**All four listings for the first two sports now exist**: football card (Fire & Smoke), football
poster (Heritage), cheerleading card (Prism Rush), cheerleading poster (Signature Spotlight).
Each pair deliberately splits its two finishes across card and poster.

### Two rotations, so seventeen listings do not look like one listing
Both live in `gen-etsy-sport-shots.ts`, keyed by a stable hash of the sport slug, so a re-run
gives the same scene and neighbouring sports differ.

- **`REVEALS`** — slide 03, the card in the hand. The first two takes were both a grey T-shirt
  against a blurred pitch, because the identity plate is shot in a grey T-shirt and the model
  copies what it is shown. The outfit and the setting are now directed: football gets a heather
  hoodie on the bleachers at dusk, cheerleading a light denim jacket in the gym.
  **Every outfit in the table is light or mid-tone, and that is not taste** — the blank plate is
  pure black so the mask is exact, which only holds while the card is the darkest thing in
  frame. A navy hoodie in front of a car's dark interior made the plate unfindable at every
  threshold.
- **`ROOMS`** — the poster listing's "in the room" slide. Three framed posters in a row is one
  idea, not the idea. Football keeps the three-in-a-row wall; cheerleading gets the poster
  leaning on a dresser, not yet hung, with her kit and pom-poms on the floor.

### The rejected take must be a NEAR MISS
Customer, 2026-08-27: a reject that is obviously a different child advertises how badly the
model can fail, which is the opposite of what the slide is for. `lib/pick_reject.py` now scores
candidates and names the highest-scoring frame that still FAILS — the near miss.

- **Cheerleading** shows **0.325** against the 0.36 threshold: the same age, build, skin tone and
  kit, a different face. It reads as a careful process catching a subtle drift.
- **Football has no rejected take at all.** With age, build and skin tone pinned, six generated
  drift frames all scored 0.54–0.62, i.e. they PASSED, and the whole version history has nothing
  under 0.36 either. So its slide 06 shows four approved frames with their real numbers and no
  red panel. Relabelling a passing frame "REJECTED" would invent the one thing the slide sells.

### Registry and QR codes
`lib/registry/cards.ts` now carries every id the listing images print — `GDE-SN-BKB-2026-12`,
`GDE-FS-FTB-2026-54`, `GDE-HE-FTB-2026-54`, `GDE-PR-CHR-2026-01` — and `npm run qr:gen` has
written the PNGs. `STYLE_CODES` gained Heritage / Signature Spotlight / Prism Rush and lost the
dropped Neon Future and Vintage Card. **The QR on image 02 is real: those pages must render
before the listings go live.**

### Still open
1. No listing videos for any of the four.
2. The cheerleading poster's slide-15 card id is written `GDE-SS-CHR-2026-01`, but only the
   PR card exists in the registry — add the SS row before publishing, or the QR story is
   inconsistent for that one line.
3. Both heroes still carry two small before-photos rather than the one large one the canon asks
   for — they match basketball as it stands, so they are consistent, just not to the written canon.

---

## Poster listings brought onto the basketball sequence (2026-08-27, latest)

Customer: "the sequence must be like the basketball poster — change it and match the styles."
Both poster listings now open the same way basketball does: **hero → scale sheet → room**.

- **Hero** cloned from `386:511` for each sport: its own playing surface as the background (the
  hero-bg shots already generated for slide 01 of the card listings were reused — no new spend),
  its own lead poster, its own before-photo, its own headline. Frames `460:169` (football) and
  `460:250` (cheerleading); exported as `01-hero-v3.png`.
- **Scale sheet** cloned from `386:529`. Frames `455:169` and `455:396`; exported as
  `02-two-sizes-to-scale.png`. The old `01-hero.png` and `02-transformation.png` are superseded
  and stay on disk unused.

### How the scale was actually set, because the canon note was stale
The canon records 21.42 px/in from a person 1478 px tall. The sheet on the canvas today is not
that: its own posters measure 595 px for 24 in and 892 px for 36 in, i.e. **24.8 px/in**, and the
basketball ruler measures ~1699 px rendered for 69 in, which agrees. So 24.8 is the number, and
the note is the stale one.

**The ruler is the athlete cut from their own hero WALL shot, at a 5 ft 9 in reference height.**
Two corrections landed here, in this order:

1. *The wrong cutout.* The rulers were first taken from the studio kit poses. Those have the arms
   out — helmet, pom-poms — so cropping them to the frame lopped the arms off, and a uniform read
   as a fourth poster rather than as a person in a room. The ruler is now matted out of
   `art-pipeline/out/etsy-shots/<sport>/p-hero-wall.png`: the same athlete, standing in profile,
   in the casual clothes the customer already sees earlier in the listing.
2. *The wrong height, and the wrong anchor.* Drawing each athlete at their real stature makes the
   sheets incomparable — a 24x36 next to a 5 ft 2 in flyer reads as 58 % of a person, next to a
   6 ft 1 in lineman as 49 %, and the sheet's whole job is to say how big the print is. Basketball
   never did that: its ruler is **1709 px = 69 in x 24.8**, a 5 ft 9 in reference figure. All three
   sheets now use `H = 1711`, seated by the HEAD at `y = 470` and right-aligned to `x = 1935`, with
   `clipsContent = true` so the legs run off the bottom edge the way basketball's do. Seating by
   the FEET instead is what pushed a 6 ft 1 in athlete's head through the top rule.

Verified on the canvas: all three sheets carry `Frame 446x595` (24.77 px/in) and
`poster_24x36 594x892` (24.77 px/in), so poster and ruler agree to two decimals everywhere.

The 300 DPI loupe is aimed by FRACTION of the poster, and the anchor square on the 18x24 is
placed from the same fraction, so the two always point at the same spot.

### Two more things the customer caught
- **The two side posters in the three-frame wall were identical.** The prompt now names them
  separately: the left a wide view from high up, the right a tight crop of the surface markings.
- **The athlete was forever lacing a shoe.** `ACTIONS` is now a rotation of ordinary weekday
  things — reading, writing, a laptop, packing a bag, drinking at the window, texting. Football
  packs a bag; cheerleading writes at a desk.

---

## Three defects the customer caught on the poster listings (2026-08-27, latest)

### 1. The intake photos were stretched
`12 · What photos to send` on all three POSTER listings used `scaleMode: CROP` with basketball's
`imageTransform`. Those numbers were fitted to basketball's 1792x2400 originals; football and
cheerleading feed the slide **760x760 squares already cropped by `art-pipeline/lib/facecrop.py`**,
so the same numbers stretched the three "good" tiles **1.34x wide** and squeezed the before-photo
by **27 %**. Basketball itself measured clean, which is why nothing flagged it — the defect is born
in the CLONE, not in the original.

Fixed by putting all five tiles on `FILL` with no transform, which is what a pre-cropped source
wants and what both CARD listings already used.

**The check, after any clone:** `distort = ((t[0][0]*srcW)/(t[1][1]*srcH)) / (node.w/node.h)`
must be `1.000`.

### 2. Seven of ten callouts ended in nothing
`14 · Every field is yours` had **10 leader lines and 3 dots** on all three poster listings —
basketball's original included, so football and cheerleading inherited it. Several lines also
pointed near their element rather than at it (the STYLE GLYPH dot sat in empty court above the
sparks).

All three slides rebuilt: every line now terminates in a dot **on** the thing it names. Because the
poster art is a FLATTENED image with no child nodes to snap to, each target was measured by
exporting the art node alone, finding its dark rectangle, and overlaying a grid in FRAME
coordinates (`frame = NX + (px-ax)/aw*NW`). Lines are re-aimed with
`relativeTransform = [[dx,-dy,x0],[dy,dx,y0]]`, keeping the label end fixed.

Two traps worth keeping: the label order top-to-bottom must match the target order top-to-bottom or
the lines cross over the artwork; and a low-resolution grid reads about **20 px high** — the first
pass put the POSITION / TEAM / SEASON dots just above their text.

### 3. "300 DPI" said nothing at the moment of choosing
The `09/10/11 · Style pair` slides printed `300 DPI` under each finish pill — identical under all
six, so it could not help anyone pick one, and slide 02 already proves 300 DPI with a loupe. The
subline now names the **material**, which is how this project defines a finish:

| Finish | Subline |
|---|---|
| Stadium Night | SOFT SILVER FOIL |
| Chrome All-Star | MIRROR CHROME |
| Fire & Smoke | EMBER + ASH |
| Heritage | AGED GOLD |
| Signature Spotlight | ONE CLEAN BEAM |
| Prism Rush | NEON PRISM |

The CARD listings' pair slides say `front and back` instead — that one is left alone, because it
describes the two thumbnails actually shown rather than repeating a spec.

### Re-exported
`02-football-poster/` and `02-cheerleading-poster/`: `12-photos.png`, `14-every-field.png`,
`09-pair-sn-ca.png`, `10-pair-fs-he.png`, `11-pair-ss-pr.png`.

⚠️ **Basketball's poster listing is fixed in Figma but not on disk** — that folder holds an older,
shorter export set with no `12/14/09/10/11` files, so the LIVE basketball listing still carries the
stretched photos, the dot-less callouts and the six "300 DPI" lines. Export and re-upload those
five before calling basketball done.

### 4. Cheerleading's room shot was a diptych
`03 · The kid and the poster` was one image split across a hard seam — the dresser in the top
half, Amara writing in the bottom. The generator had returned `p-three-frames` as a two-panel
picture: the prompt names a wall scene AND a person doing something, which is two subjects, and
the model is free to answer with two pictures. Football and basketball happened to come back as
one room, so nothing caught it.

Three things now protect every remaining sport, all in `gen-etsy-sport-shots.ts`:
- **`ONE_FRAME` + `ONE_FRAME_CHECK`** — the single frame is its own sentence ("NOT a diptych, NOT
  a split screen … no dividing line, no seam") and the judge can fail on it.
- **No glass in the frame.** "No glare, no reflection" was already in the prompt and still lost to
  a window placed opposite the frame; the opening is now specified as bare matte board with no
  window or lamp facing it, because a reflective plate cannot be masked for the poster warp.
- **The kit is blank.** "No writing anywhere in the picture" did not stop a club name in script
  across a uniform on the floor — a garment is where lettering wants to go, so the ban names the
  garment. Painting the word out afterwards was tried and abandoned: `cv2.inpaint` over a 233x103
  region of jersey left a pale smear that reads worse than the word did (kept in
  `rejects/p-three-frames-inpaint-smear.png`).

`etsy-poster-in-room.py` gained **`--region=x0,y0,x1,y1`**: the quad scorer rewards area, so the
desk chair (0.852 aspect, 8 % of the picture) beat the frame opening and the poster was pasted
across the whole room. Naming where the frame is beats re-tuning a scorer six other rooms already
depend on. With the region the opening measures 0.747 against a wanted 0.750.

The slide's lockup also read `THEIR SEASON. / THEIR WALL.` while the poster leans on a chest of
drawers — changed to `THEIR ROOM.` for this sport. Rebuilt: `src/mock-03-room.png` and
`03-kid-and-poster.png`.

---

## Football card art + slide 03 rebuilt the mechanical way (2026-08-27, late)

Customer caught two things on the football card listing and set the method for the second:

### 1. The left player's hands read as one deformed cluster
`action3` had both open hands overlapping — each hand alone was correct (5 fingers), but the right
hand's fingers crossed the left forearm, and at card scale the overlap reads as an AI-hands
defect. Fixed with `art:fix` (one change, frame kept), gate re-run (cosine 0.421, green),
cutout re-matted with `--force` — **`art:cutout` skips an existing cutout silently; after any
`art:fix` the re-matte must be forced or the card keeps compositing the OLD take** (this nearly
shipped: the first re-upload was byte-identical to the Aug-22 cutout and Figma dedupes by hash).

Propagation: the athlete photos live in TWO components (`Athlete / AIR`, `Athlete / TIGHT`) in the
football file `rnOtXNBGu5VmumfldAhtNO` — swapped `#photo_3` there + 6 direct fills. ⚠️ The five
`Card · <finish> — FRONT` frames at page level are HIDDEN V1 leftovers still carrying the
basketball etalon's photos — the real cards are `FRONT V2` (visible, component-driven). Do not
edit the hidden ones (I did, harmlessly, before finding V2).

Export gotchas, all hit in one evening: a hidden frame exports as a 1x1 PNG; `download_assets`
ignores `scale` (clone + `rescale(2)`, export the clone, delete it); a clone loses the page's
pinned Style mode — re-pin `Style -> Fire & Smoke` on the clone or the footer exports saying
STADIUM NIGHT.

### 2. "Uzdek tikros korteles mask" — the in-hand card is never drawn
The old slide-03 card was model-drawn from a reference: border gone, left edge smeared orange.
Rule, same as the poster's: **the model draws an empty black plate; the real card PNG is warped in
by `lib/card_in_hand.py`** — real rounded-corner mask, thumb occlusion from the plate itself
(non-black inside the quad = in front), light transfer, self-audit. The blank-plate shot
(`athlete-holds-blank.png`) already existed, so the rebuild cost zero generations:
quad aspect 0.714, plate-left 0.00 %, card 3.3 finger-widths, all corners visible.

Rebuilt: `src/FB-FS-card-FRONT.png` (1500x2100, fixed hands), `src/s03-athlete-holds-card.png`
(composite), `03-kid-on-the-card.png` (slide). ⚠️ Still carrying the OLD action3: the other four
finish FRONTs' exports, the print PNG (`276:3`), flip videos and any slide that embeds the FS
front (01-hero, 02-front-back-registered, 06-four-shots, 15/16). Re-export before publishing.

---

## 03 · Digital SENIOR NIGHT — built 2026-08-27, 20/20

The occasion listing (search phrase = "senior night gift"; sport is a picker). Built by cloning
the complete-set 20-slide spine onto page `03 · Digital SENIOR NIGHT` (`2:3`) and re-theming to
the **Senior Night (SR) gold edition** (basketball file `fgueg7sV11zKnV1hir1Zsg`, page
"Senior night"). Exports: `etsy/listing-images/03-senior-night/`, JSON
`etsy/listings/03-senior-night.json` ($99 — above the $89 set on purpose; senior buyer is the
least price-sensitive).

- **01 HERO rebuilt TWICE**: the set-clone hero broke the canon (badge in the heart zone, type
  above y200, no big before→after). Rebuilt by cloning the canonical basketball card hero
  `355:429` — canonical left column + before photos + arrow — with the FULL SET piled right
  (SR poster lead, card front/back, certificate sliver, phone) on the confetti-gym bg. The
  first full-set attempt scattered the products edge to edge; the fix was the set-pile
  arrangement. Superseded set-clone kept on-page at x=-2500.
- **02 Every senior. Every sport.** — the four-sports slide now mixes the four senior-season
  sports: FOOTBALL (Fire & Smoke, Tui), CHEERLEADING (Signature Spotlight, Amara),
  SOCCER (Heritage, Mateo), VOLLEYBALL (Prism Rush, Jaslene). Football/cheer art pulled from
  their hero files by node id (identical across files).
- **05/15/16/19 replicas swapped to flat SR images** — those slides carried live SN card/poster
  vector replicas; each was replaced by a rect filled with the SR export at the replica's exact
  bounds (parent-of-`#card_bg` method), so callout geometry survived.
- **18 Registered** — phone screen shows the SR card; id `GDE-SR-BKB-2026-12` added to
  `lib/registry/cards.ts` (+ `Senior Night: "SR"` in STYLE_CODES) and `npm run qr:gen` wrote the
  real QR. The /c/ page must render before publishing.
- Gates carried in the JSON `_gate`: SR flip video not rendered; slide 03's card-in-hand photo
  still shows the SN card; 07/13/14 are shared process slides.

### Cheerleading in-hand: the fit itself missed, and the audit could not see it
The customer caught the corner line missing on the cheerleading in-hand card. Root cause was not
the art: the dark gym background touched the black plate, the merged blob pulled the fitted quad
**~50 px low**, so the card was painted low — a strip of raw plate survived ABOVE it and the
card's own top strip (inner border line, corner arc) was never painted. `plate-left` showed
0.00 % because it only tested INSIDE the fitted rect.

Fixes, both in `lib/card_in_hand.py` + this run:
- **Audit band outside the rect**: plate pixels surviving within 80 px around the fitted card now
  fail strict mode ("plate sticks out … the fit missed; measure the plate and pass --quad").
- **Relight is luminance-only**: the per-channel quadratic could push blue +30 % / red −20 %,
  which turned the cream name violet on the dusk football shot. One gain surface, clamp 0.90–1.12.
- Cheerleading re-composited with a measured `--quad` (edges fitted only on thumb-free segments;
  pure-black <45 threshold separates plate from dark background). Football re-verified under the
  new band test — clean.
- Cheerleading slide 03 had NO photo at all (just guides + lockup); photo inserted, the two 6 px
  construction guides hidden (they only became visible once a photo sat behind them).

---

## THREE Senior Night listings — 03 set / 03b card / 03c poster (2026-08-27, later)

The Senior Night line now mirrors the split the regular line already uses (04 set / 01 card /
02 poster), so the three are distinct products rather than re-titled duplicates.

| Page | Figma page id | Price | Exports | JSON |
|---|---|---|---|---|
| `03 · Digital SENIOR NIGHT` (set) | `2:3` | $99 | `etsy/listing-images/03-senior-night/` | `03-senior-night.json` |
| `03b · SENIOR NIGHT — CARD` | `522:127` | $49 | `03b-senior-night-card/` | `03b-senior-night-card.json` |
| `03c · SENIOR NIGHT — POSTER` | `525:127` | $49 | `03c-senior-night-poster/` | `03c-senior-night-poster.json` |

Both variants are 20-slide clones of the set page; only the slides that would otherwise LIE were
rebuilt, and the rest are the shared Senior Night process slides.

- **Slide 02 now shows four REAL Senior Night sets** — football (Tui), cheerleading (Amara),
  soccer (Mateo), volleyball (Jaslene), all in the gold SR style, replacing the old mixed-finish
  columns. That is what made the listing honest: it claims one style across every sport, so it
  has to show one style across every sport.
- **Card variant**: hero shows card FRONT + BACK only; slide 02 shows a big front with the back
  inset in its dark top-right corner; slide 19 drops the POSTER and SENIOR SET BONUS panels and
  reflows the rest — **20 files + 1 live page**.
- **Poster variant**: hero shows the poster alone; slide 02 posters only; **slide 18 was rebuilt
  from the registry slide into the print story** (no card, no certificate, so no QR claim); slide
  19 keeps poster/social/wallpapers — **18 files, no registry page**.

### The slide-19 reflow, for whoever does this next
Slide 19 is seven flat panels, not seven groups. Collect each panel by the CENTRE of every child
inside its slot rectangle, then hide or translate the collection as a unit. Two things cost a
rebuild here: the slot arrays are `[x0, y0, x1, y1]` and must be compared as such (comparing
`[x0, x1, y0, y1]` silently matches nothing), and the row-2 panels run to **y ≈ 1620**, not 1335 —
bound them too tightly and the captions and thumbnails stay behind while the card and label move.
