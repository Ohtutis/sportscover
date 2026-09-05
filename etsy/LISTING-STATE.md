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

## Listing videos — THIRD generation planned (2026-09-05)

All 19 live listings (6 card · 6 poster · complete set · SN set · 5 SN sport sets) get a STORY +
CLOSE pair rebuilt from one storyboard per listing TYPE: **`etsy/VIDEO-STORYBOARDS-2026-09.md`**
(10 boards, shared beat library, per-sport cast, what is real vs composited, the owner's shooting
list). **Built 2026-09-05: one example per type — ten files named `<listing head title> - Video 1|2.mp4`** (§12 of the storyboards:
flat-screen photo pick, Veo wall clip generated but judge-failed → C1 ships on the live room scene,
SR flips rendered for football + cheer). **Later the same day: all 28 remaining videos rendered
(`render_types.py sport …`) and attached — every one of the 19 live listings now carries its
Video 1 (story, primary) + Video 2 (close); Etsy upload recipe in the storyboards §13.** Volleyball
SR art pulled (`vbl-sr-*`).

## Listing videos — second generation (2026-08-26/27)

All four listing videos now have STORY + CLOSE pairs where built: card story
(`GDE-etsy-01-card-story-1080.mp4`, owner-finished in CapCut as `Final version
Basketball.mov`), card close (`GDE-etsy-01-card-close-1080.mp4`), poster story + close
(`GDE-etsy-02-poster-{story,close}-1080.mp4`), complete set story + close
(`GDE-etsy-04-set-{story,close}-1080.mp4`, story carries baked-in captions). Plans:
`etsy/VIDEO-PLAN-0{1,2,3,4,5}-*.md`. Football (FS card / HE poster) and cheerleading (PR card / SS poster) card+poster
videos built 2026-08-27: `GDE-etsy-05-ftb-*`, `GDE-etsy-06-ftb-*`, `GDE-etsy-07-chr-*`,
`GDE-etsy-08-chr-*`, plus soccer/baseball/volleyball card pairs `GDE-etsy-09-soc-*`,
`GDE-etsy-10-bsb-*`, `GDE-etsy-11-vb-*` — **18 listing videos**. All six CARD listing rows
now have a story+close pair (`etsy/VIDEO-PLAN-07-CARD-ROWS.md`). None are attached on Etsy
yet — manual upload.

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

---

## Wave 2 started: baseball, soccer, volleyball (2026-08-28)

Finish split, so card and poster lead different finishes and we learn which converts
(memory: two-finishes-per-sport). All six finishes are now represented across the roster:

| Sport | Athlete | Figma file | CARD | POSTER | prefix |
|---|---|---|---|---|---|
| baseball | Casey Whitlock #7, Harlow Creek Larks | `tL9vfpIhC5esFbXcozgAlT` | Heritage | Stadium Night | BB |
| soccer | Mateo Herrera #10, Sunfield Kestrels | `zH80jD1o3jSMvFePyrtTG1` | Chrome All-Star | Fire & Smoke | SC |
| volleyball | Jaslene Ocampo #5, Fox Hollow Anchors | `S8kqmhvEB5QNG8sbjgxQnF` | Signature Spotlight | Prism Rush | VB |

(existing: football card Fire & Smoke / poster Heritage; cheerleading card Prism Rush /
poster Signature Spotlight; basketball Stadium Night.)

### Done
- **Card FRONT + BACK and poster exported** at 2x from each sport file for its lead finishes.
  Node ids are identical in every sport file (`docs/FIGMA-FILES.md`): FRONT SN `40:2` CA `190:136`
  FS `190:204` HE `190:291` SS `190:353` PR `190:415`; BACK `49:2 / 102:85 / 166:71 / 166:180 /
  166:289 / 166:398`; POSTER `38:2 / 190:93 / 190:167 / 190:253 / 190:319 / 190:379`.
- **Scene shots generated and judged** for all three (`art:etsy:sport`), then the defects fixed —
  see below.
- **In-hand composites built** for all three, real card warped into a black plate, no generation
  spent on the card itself: baseball aspect 0.699 / hand 6.2 %, soccer 0.708 / 4.6 %,
  volleyball 0.735 / 5.1 %, `plate-left` 0.00 % on all three.

### Still open for wave 2
Six listing sections in `JcQvsgIRiOQtuZcP3Q8dc9` (card + poster per sport), each a clone of the
cheerleading section: **836 nodes, 224 text nodes, 67 unique images** apiece. Then 20 slide
exports per listing (120 files), then the audit pass. The six-finish slides (08–11) need all six
card fronts and six posters per sport — baseball's are cloned in-file and 3 of 6 downloaded.

### Generator defects found and fixed this session
- **A chatty refusal killed a whole run.** The endpoint sometimes answers an image request with
  prose and `finishReason=STOP`; the throw ended a twelve-job run at job two. Now one retry, then
  skip that job and continue.
- **Third-party art on the walls** (baseball): the room came back with recognisable film and band
  posters and titled books. "No writing" never covered a *picture*. The walls are now specified
  bare, and the judge can fail on it.
- **The frame was a television** (soccer): a flat-screen TV on a dresser is a big dark rectangle,
  which is exactly what `etsy-poster-in-room.py` hunts for — our poster would have been pasted
  onto a TV. The frame is now described as a frame (moulding, no bezel, no stand, no cables).
- **Wrong sport's court markings** (volleyball hero-bg): basketball lines on a volleyball court.
  Regenerated.
- **`--only a,b,c` and `--skip a,b,c`** — building three sports meant 36 single-job invocations.
- `card-in-hand` and `athlete-holds-card` are **skipped by policy**: both ask the model to draw
  our card, which the black-plate compositor replaced. Never re-enable them.

---

## Stačių kampų ratas UŽBAIGTAS iki listingo (2026-09-02)

Pilna grandinė: šablonai (praeita naktis) → **nauji eksportai** → **papildomi failai** →
**sukeitimas listinge** (šis rytas).

1. **42 nauji eksportai** iš 6 sportų failų (lead FRONT+BACK + visi 6 finišų frontai každam),
   visi 750×1050 @1x. **Pikselių testas ant kiekvieno: visų 4 kampų alfa = 255** (stačias).
2. **5 kortelė-rankoje kompozitai perstatyti** su stačiu die. `card_in_hand.py` dabar turi
   `corner_bites`: senos nuotraukos laiko APVALIĄ plokštelę, tad kampuose plokštelės nėra —
   kampai užpiešiami priverstinai (auditas garantuoja, kad ten nėra pirštų). Kvadratai iš
   `plate_quad.py` matavimų, ne iš paieškos. Visi 5: plate-left 0.00 %.
3. **`01 · CARD LISTING` visos 6 sekcijos perjungtos į stačias korteles** — hash-swap pagal
   vardinius mazgus (`card_front`, `REAL card FRONT`, `REAL STADIUM…`) + propagacija pagal
   hash į visas replikas (proof, registered, screen, 08–11, 14, 17). Football 28, cheer 30,
   baseball 28, soccer 28, volleyball 31, basketball 4 + žr. žemiau. Naujoms sekcijoms kartu
   sudėti PLAKATAI (04 skaidrės, 18 kirpimų) ir tikri QR.
4. **SPĄSTAS, kuris būtų praslydęs:** basketball sekcija korteles piešia GYVAIS komponentais
   pačiame listingo faile (`#card_bg`+`card_border`), ne įkeltais PNG — o listingo failas
   nebuvo tarp 24 šablonų. Vardinis swap'as jame pagavo tik 3 mazgus iš ~30. Kampų taisymas
   paleistas ir LISTINGO FAILUI: 182 mazgai (01 CARD 41, 03b/03c po 25, 04 Complete set 34,
   _ASSETS 47…), `01 Dig` referencinis puslapis NELIESTAS.
5. Galutinis auditas: visose 6 sekcijose 0 kortelės mazgų su senu (apvaliu) hash'u.

### Liko (žinoma skola, netrukdo kampams)
- Naujų sekcijų SCENOS skaidrės (04 likeness, 05 kit, 06 four shots, 12 photos, 13 crest,
  hero before-nuotraukos ir fonas) dar rodo donoro (football/cheer) meną — medžiaga diske yra,
  reikia facecrop/studio_panel būvio ir įkėlimo.
- `02 · Digital POSTER LISTING` puslapio sekcijų swap'as — po savininko puslapio skėlimo.
- Print PNG (`print-sources/output/`), flip video ir bonus eksportai — perdaryti su stačiais
  kampais prieš fizinę spaudą (kortelių šablonai jau statūs, tik eksportai seni).

---

## Lockup centravimo auditas per visus failus (2026-09-02)

Klientas pagavo ant football CA fronto: vardas „nusokęs" į kairę. Priežastis — fitteris mažino
šriftą per-atletiškai, bet paliko ETALONO kairį kraštą: centravimas kortelėse yra POZICINIS
(tekstai auto-width), tad kiekvienas vardas, siauresnis už Marcus'o 455 px, sėdo kairiau centro.
Pagal lockup taisyklę centruojami tik CA ir HE.

**Praeita per visus 20 failų (18 sportų + etalonas + masteris), mechaninis matavimas cx=375±4:**
- CA vardas buvo nucentruotas beveik VISUR: golf +85, hokis +75, soccer-32 +68, football +64,
  cheer +61, skateboarding +38 … masteris –74. Etalonas pats –6 (sutvarkytas).
- Be-numerio sportuose (cheer, gym, swim, tennis, golf, pickleball×2) meta eilučių poslinkiai
  120–143 px lietė tik PASLĖPTĄ tuščią `#number` (w=0); matomi #position po pataisos matuojasi
  cx=375 visur (patikrinta cheer + swimming).
- PR pilno pločio vardas lipo per SPAUDOS safe zoną (x≤717): tennis 731, volleyball 726 —
  sumažinti kartu su aidais (aido šriftas = vardo, memory gde-prism-rush-echo).
- Ghost sluoksniai overflow testo nekliudomi („art may bleed, type may not" — ghost yra menas).

**Perexportuota ir sukeista listinge:** 8 pasikeitę frontai (CA ×6, CH-HE, VB-PR) + soccer lead
FRONT + soccer kortelė-rankoje perkompozituota. Page-wide hash swap 23 mazgai, senų hash'ų
likutis 0.

**Fitterio taisyklė ateičiai:** keisdamas fontSize CA/HE fronte, fitteris privalo perstatyti X
taip, kad cx=375 — mažinimas be re-centravimo ir buvo šitas defektas.

---

## Kortelė rankoje + paketų skaidrė perdaryta (2026-09-02, vėliau)

### Kortelė rankoje — trys tikri defektai, visi mechanizuoti
Klientas atsiuntė du kadrus: baseball su juoda dantyta juosta po nykščiu ir vardu, uždengtu
per pusę; volleyball su „monstriška" kortele (7 pirštų pločio).

1. **Plokštelės likutis UŽ kortelės krašto.** Kvadratas gali baigtis kelis px kortelės viduje
   (išvestinis apatinis kraštas, banguotas generuotas kraštas) — likęs plokštelės juodis spausdinasi
   kaip dantyta juosta. Dabar `card_in_hand.py` jį **ištrina**: siauras 25 px vainikas aplink die,
   tik GRYNAS juodis (<45), `cv2.inpaint`. **Pirmas bandymas buvo per platus** (121 px, riba +45)
   ir suėdė merginos tamsius plaukus už kortelės, užpiešdamas juos kortelės violetine — siaurinta.
2. **Nykštys ant VARDO juostos.** Naujas auditas matuoja būtent 58–82 % kortelės aukščio juostą
   (ten guli vardas): >10 % užstojimo = klaida. Skonio klausimas paverstas matavimu.
3. **Monstriškas dydis.** Riba sugriežtinta 6.0 → **4.5 piršto pločio**, žinutė liepia
   PERGENERUOTI, o ne „pažiūrėti". Kortelė yra 2.5×3.5 in — tiek ji ir turi atrodyti rankoje.

Kartu: `--quad` režime plokštelės kaukė imama iš **PLAČIAI išplėsto** stačiakampio (161 px), nes
kirpimas tiksliai iki kvadrato apakina likučių valytoją.

Pergeneruoti trys kadrai su `--hold chest` (+ nauja taisyklė prompte: **nykštys lieka apatiniame
kortelės penktadalyje**, nes vardas guli apatiniame trečdalyje). Baseball 3.7 pirštų, volleyball
ir cheerleading perdaryti; visi trys sukeisti listinge.

### CHOOSE YOUR PACKAGE — perdaryta pagal deko metrikas
Pirmas variantas buvo „iš akies". Dabar nuskaityta iš 17 skaidrės ir pakartota tiksliai:
kicker fs44 @y134 + oranžinė 64×3 juostelė @y184, antraštė fs114 @y240, poantraštė fs46 @y380,
apatinė eilutė fs34, `02 / 20` savo vietoje.

Turinys sodresnis (**po 8 punktus kiekviename**, aukščiai susilyginę): pridėta „True 2.5 × 3.5 in,
300 DPI", „Square-cut, true card size", „Numbered + registered", „Live registry page + QR",
„The real pack-rip moment". Juodas čipas = skaitmeninis, oranžiniai = spausdinti; ženkliukai
**MOST GIFTED** (24 kortelės) ir **COLLECTOR** (foil pakelis). Kainų skaidrėje NĖRA — jos keičiasi
su akcijomis, skaidrė ne. Perklonuota į visas 6 sekcijas.

### Basketball skaidrės
Sekcijos kortelių komponentai vadinami savaip, tad ankstesnis vardinis swap'as jų nepagavo —
dar 22 mazgai suapvalinti į stačius kampus (02/08/09/10/11 + Remake 02).

### Kortelė rankoje — kompozitorius perdarytas iš pagrindų (2026-09-01, vakaras)
Klientas priartino visus tris kadrus: *„pirštai išdarkyti arba kortelės gabaliukas išlindęs arba
nelygus kraštas"*. Po ~10 iteracijų (kampų užpildymas, likučių trynimas, keturkampio auginimas)
kiekviena pataisa atidengdavo kitą — ženklas, kad problema ne filtruose. **Klientas priminė
metodą, kuris jau veikė:** juoda plokštelė yra KAUKĖ; tikra kortelė piešiama TIK ten, kur buvo
juoda; ranka lieka viršuje savaime. `card_in_hand.py` buvo nuklydęs į „nusipiešiu savo siluetą ir
ginčijuosi su nuotrauka". Grąžinta, ir trys mechanizmai (die kaukė, kampų `corner_bites`, likučių
`inpaint`) tapo nereikalingi ir ištrinti.

Kas pakeista `art-pipeline/lib/card_in_hand.py`:
1. **`plate_pixels()` — histerezė, ne vienas slenkstis.** Plokštelė apšviesta: nuo šviesos
   nusisukęs kampas 20 lygių šviesesnis. Griežtas slenkstis jį išmesdavo → kortelė trumpesnė →
   **juoda „L" už kampo**, o auditas, skaitęs tą pačią per griežtą kaukę, tylėjo. Lygis imamas iš
   plokštelės vidurio, auginama į išorę, su atsitraukimu jei augimas pabėga į kambarį.
2. **`fit_containing()` — keturkampis iš KRAŠTINIŲ.** `minAreaRect` yra pasuktas stačiakampis, o
   plokštelė nuotraukoje — perspektyvinis keturkampis; `approxPolyDP` ant gaubto nukerta pirštų
   nukąstą kampą 100 px į vidų. Dabar kiekviena kraštinė fituojama iš savo vidurio su outlier'ių
   atmetimu, kampai = sankirtos, tada `push_out()` stumia kraštines į išorę, kol apima visą
   plokštelę. Stand-off nukrito 15 px → 2–4 px.
3. **Kaukė = plokštelė + du pataisymai.** Tarpas užpildomas, jei < 0.6 % kortelės (apvalintas
   kampas, blikas) ARBA neliečia krašto ir < 8 % (ranka VISADA įeina nuo krašto — taip atgaunamas
   ant plokštelės atspausdintas tekstas). Plius plonas+šviesus = spauda (21 px atidarymas).
4. **Auditas nebeklausia to paties, iš ko pastatyta kaukė.** Vietoj „ar liko plokštelės" (visada
   „ne") ir „ar šalia tamsu" (rėkia ant kiekvieno šešėlio) — **stand-off px**: kiek kortelės
   kraštinė stovi nuo artimiausio plokštelės pikselio, matuojant tik ten, kur plokštelė yra
   (pirštas nėra fito klaida).
5. **Dydžio liniuotė — VEIDAS.** Piršto plotis buvo skaičiuojamas iš uždengto ploto ir švariam
   kadrui grąžindavo 5–10 „pirštų". Dabar insightface: `card_w / face_w`, riba 0.30–1.05.

`gen-etsy-sport-shots.ts`:
- **Promptas pats sau prieštaravo:** draudė tekstą ir tuoj pat sakė, kad „vardas atspausdintas
  apatiniame trečdalyje" (paaiškinimas, kodėl nykštis žemai). Modelis tai perskaitė kaip nurodymą
  ir ant volleyball plokštelės atspausdino **ANNE** + punktyrinį rėmelį. Eilutė ištrinta, pridėtas
  atskiras draudimas rėmeliui/keylinei, ir judge tikrina.
- **`SMALL`** konstanta abiem laikymams: kortelė siauresnė už veidą (6.5 cm vs 15 cm). `reach`
  prašo užimti trečdalį kadro, ir modelis didino KORTELĘ, ne artino kamerą — keturi kadrai iš
  eilės 0.87–1.17 veido pločio.
- `chest`: ranka ties kortelės VIDURIU, kad apatinis trečdalis (vardas) liktų laisvas.

Rezultatas — visi penki perdaryti ir sukeisti listinge (`01 · CARD LISTING`, skaidrė 03):
| sportas | mazgas | stand-off | ranka dengia | dydis (veido) |
|---|---|---|---|---|
| baseball | `639:132` | 4.0 px | 4.0 % | 0.77 |
| volleyball | `639:1713` | 3.0 px | 2.1 % | 0.56 |
| cheerleading | `636:2616` | 4.0 px | 2.7 % | 0.63 |
| football | `636:1780` | 2.0 px | 4.1 % | 0.69 |
| soccer | `639:924` | 2.0 px | 3.8 % | 0.83 |

⚠️ Football ir volleyball plokštelių **automatinis radiklis pataiko pro šalį** (football's griebia
VEIDĄ, nes jis tamsesnis už foną) — abu daryti su `--quad`. Football: `--quad
860,1000,1230,1000,1230,1500,860,1500`.

### Kortelė rankoje — pikselinis pravažiavimas (2026-09-01, vėlu)
Klientas priartino iki 100 % ir rado juodus brūkšnelius ant pirštų, „dantytą" kraštą ir kabliuką
prie kampo. **Visi jie buvo mano piešti — originaliose nuotraukose tų vietų nėra.** Du bandymai
juos TRINTI (morfologinis uždarymas, inpaint, normalizuota konvoliucija) buvo klaida iš principo:
prieš trinant reikėjo patikrinti, ar nuotrauka juos turi. Neturėjo.

Keturios skirtingos taisyklės lipo už plokštelės ribų:
1. **Mažo tarpo užpildymas.** Keturkampis auginamas, kad APIMTŲ plokštelę, tad palei kiekvieną
   kraštą jo viduje lieka plaukelio storio piršto juostelė. Ji maža → buvo užpildoma kortelės menu,
   o kortelės apačia juoda. Dabar: tarpas, liečiantis kortelės kraštą, nėra kortelė — išimtis tik
   tikras apvalintas KAMPAS (mažas IR maždaug kvadratinis, ne 21×3).
2. **Minkštas kaukės kraštas.** `dilate + feather` uždėjo 3 px kortelės ant piršto. Kortelės
   kraštas prie piršto yra UŽSTOJIMAS ir turi būti kietas: alpha ties ranka nunulinama, feather
   lieka tik išoriniam kraštui prieš foną.
3. **Rašalo taisyklė.** Pikseliais — atidarymas nuvalo ir kiekvieno didelio tarpo 10 px KRAŠTĄ, o
   oda šviesi, tad rankos kraštas skaitėsi kaip rašalas. Komponentais — raidė, prilietusi nykštį,
   tampa storu bloku ir vardas lieka ant meno. Reikia abiejų: pikseliais + NEUTRALUMAS (spauda sat
   ≈ 2, oda ≈ 80) + `ink_zone` giliai kortelės viduje (spauda niekada nebūna prie krašto). Ta
   paskutinė sąlyga sustabdė šviesų pleištą, kuris spausdinosi kaip dantys soccer kortelės apačioje.
4. **Viena plaukelio juostelė sujungia visus tarpus į vieną komponentą.** Dėl jos pilkas spaudos
   blokas baseball plokštelės viduryje buvo sujungtas su nykščiu, skaitėsi kaip „įeina nuo krašto"
   ir liko nenudažytas — pilka juosta ant meno. Tarpai dabar vertinami `inner` (kortelė be savo
   kraštinio žiedo) ribose.

**Naujas auditas `bleed`**: didžiausias vientisas plotas, kuris kompozite TAMSUS, nuotraukoje buvo
ŠVIESUS, nėra plokštelė ir nėra giliai kortelės viduje. Riba 60 px. Būsena:

| sportas | bleed | stand-off | ranka dengia | dydis (veido) |
|---|---|---|---|---|
| football | 9 px | 4.0 px | 7.7 % | 0.70 |
| soccer | 0 px | 4.0 px | 8.6 % | 0.84 |
| baseball | 0 px | 4.3 px | 7.6 % | 0.78 |
| volleyball | 4 px | 5.0 px | 6.1 % | 0.57 |
| cheerleading | 4 px | 5.0 px | 7.5 % | 0.64 |

Visi penki praeina `--strict`; visi penki perkelti į `01 · CARD LISTING` skaidrę 03.

### Kortelė rankoje — kampai ir rėmelis (2026-09-01, naktis)
Klientas: *„remelio linijos nusikirpusios ir kortelės labiau rounded edge o ne square"*. Taip,
plokštelė nuotraukoje apvaliais kampais — bet ne todėl, kad nuotraukos senos: volleyball kadras
pergeneruotas tą patį vakarą jau su „SHARP SQUARE corners", ir kampas vis tiek apvalus. Modelis
kortelę piešia apvalią; promptu to patikimai neišspręsi.

**Priežastis mano pusėje: leidau plokštelei nuspręsti SILUETĄ.** Pakeista į priešingą klausimą —
kur RANKA; visa kita keturkampio viduje yra kortelė:

    gap  = rect & ~plate
    core = OPEN(gap, 17)          # nė vienas pirštas ne plonesnis; niekas kitas ne storas
    hand = dilate(core, 21) & gap
    paint = rect & ~hand

Viena eilutė pakeitė penkias euristikas (mažas tarpas, kampo „nick", rašalo slenkstis, sotis,
ink_zone) — kiekviena jų buvo ploto arba atstumo testas ir kiekviena kažkur klydo. Kampai išeina
statūs, nes kampas yra keturkampio viduje ir rankos ten nėra; rėmelio linija sveika dėl to paties.

Trys geometrijos detalės, be kurių tai neveikia:
- **Kraštinė fituojama į IŠORINĮ apvalkalą**, ne simetriškai. Klaida čia visada vienpusė: pirštas
  gali tik įsipjauti į plokštelę, niekada jos pratęsti. Simetriškas fitas dalinasi skirtumu su
  pirštais — soccer apačia pakrypo laipsniu, o tai vienam gale prigludę, kitam 15 px atotrūkis.
- **Kraštinė dedama ties 92-uoju procentiliu, ne ties maksimumu.** Nustumta iki labiausiai išsikišusio
  pikselio, ji visur kitur stovi 8–10 px nuo plokštelės, o tokia juosta pakankamai plati, kad
  rankos kaukės augimas išgraužtų joje įrantas — jos spausdinasi kaip dantukai po kortele.
- **Kontūras rasterizuojamas subpikseliu.** Sveikais pikseliais užpildytas daugiakampis laiptuoja
  (vienas laiptelis ~40 px), o feather kiekvieną laiptelį paverčia dantimi.

Feather vienpusis: minkštas prieš foną, kietas prieš pirštą.

| sportas | bleed | stand-off | frame | ranka dengia | dydis (veido) |
|---|---|---|---|---|---|
| football | 0 px | 3.0 px | 89 % | 4.3 % | 0.69 |
| soccer | 0 px | 3.0 px | 87 % | 4.4 % | 0.83 |
| baseball | 0 px | 3.0 px | 88 % | 4.3 % | 0.77 |
| volleyball | 0 px | 3.0 px | 91 % | 2.2 % | 0.56 |
| cheerleading | 0 px | 4.0 px | 85 % | 3.8 % | 0.63 |

`frame` = kortelės išorinio žiedo (ten guli keyline) nupiešta dalis; likutį dengia pirštas.
Visi penki praeina `--strict` ir įkelti į `01 · CARD LISTING` skaidrę 03.

## BASKETBALL (hero) — V3 auditas prieš keliant į Etsy (2026-09-01/02)

Sekcija `636:171` puslapyje `01 · CARD LISTING` (`636:170`). Pataisyta:

| skaidrė | kas buvo | kas dabar |
|---|---|---|
| HERO `636:1692` | `PRINTED + SHIPPED · FREE CERTIFICATE` įdėta kaip PLIKAS tekstas be piliulės ir gulėjo ant pirmos „before" nuotraukos | sava piliulė (`chip_printed`, r48 h96, kaip kitos dvi), tekstas sutrumpintas iki `PRINTED + SHIPPED FREE`, nuotraukų stulpelis 269→236 px ir pastumtas, wordmark'ui liko 42 px |
| 03 `636:172` | kortelė rankoje daryta SENUOJU kompozitoriumi (pasukta ~25°, smulki) | perdaryta nauja grandine (`--sport basketball --finish SN --hold chest`): bleed 0, stand-off 3 px, frame 87 %; kadras apkirptas 1700² → veidas ir kortelė didesni |
| 16 `636:208` | telefono antraštė „GAME DAY EDITION" 20 px ant 2000 px drobės — atsispausdina kaip mėšlas („GAMe unY EdiTiOn"); sertifikato parašas grynai skaitmeninis | 30 px, įskaitoma; parašas: „printed in every print package, or print it yourself"; `screen_card` kampai statūs |
| 17 `636:181` | oranžinė juosta „4 DOWNLOADS + 1 LIVE REGISTRY PAGE · PRINT PACKAGES SHIP FREE" NEĮTILPO ir buvo nukirsta iš abiejų galų | tekstas „4 DOWNLOADS + REGISTRY PAGE · PRINTS SHIP FREE", piliulė perdaryta pagal tekstą (1519×148), abi kortelės statūs kampai |
| 18 `636:1641` | antraštėje šiukšlė `·—`; ✗ ženklas ant TEIGIAMO teiginio; „FAST DELIVERY · 1-2 DAYS" (skaitmeninis terminas ant fiziškai siunčiamo listingo); 4 žingsnis tik apie failus | antraštė sutvarkyta; ✗ nuimtas; „DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7"; 4 žingsnis „Receive your files or package" |
| 20 `636:1051` | „SEVENTEEN SPORTS IN OUR SHOP." ir „ONE LISTING PER SPORT" — gyvi tik 8 listingai, 3 sportai | „SEVENTEEN SPORTS. ONE PROCESS." ir „OPEN OUR SHOP — ASK FOR ANY SPORT" |

Plius: 3 likę apvalūs kortelės mazgai (`636:200`, `636:201`, `636:233`) suvesti į statų kampą;
rėmelių vardai, kurie nebeatitiko turinio, pervadinti (`04 · We get the likeness right`,
`18 · How to order — digital or printed`, `02b · Front + back, numbered, registered`).

Mechaninis patikrinimas: **599 tekstai, 0 išeina už skaidrės ribų**; A5 sweep — nė vieno
„instant download / nothing ships / no physical item / 25 cards"; paketų skaidrė atitinka gyvas
variacijas (Digital 41.99 · 12 Printed 69.99 · 24 Printed 98.99 · Sealed Foil Pack 84.99).

### Liko (savininko sprendimai)
1. **DVI skaidrės pažymėtos `02 / 20`** — `02 · CHOOSE YOUR PACKAGE` ir `02b · Front + back`.
   Sekcijoje 21 rėmelis 20 vietų. Arba numeracija į `/ 21`, arba viena skaidrė iškrenta.
2. **Nė vienoje skaidrėje nėra ATSPAUSDINTO produkto nuotraukos** — viskas renderiai. Listingo
   viršutinės pakopos siunčia korteles; pirkėjas nemato, kaip atrodo tikras paketas.
3. **Nėra listingo video** (yra `GDE-etsy-01-card-*.mp4`, bet neprikabinti).
4. Eksportai — savininko.

### 16 + 17 sujungti į vieną skaidrę (2026-09-02)
Savininko pastaba: *„front and back mes nemažai jau šnekame, kad tai registruojama, tik niekur
neparodome. Nors tai didelis USP."* — 16 (`REGISTERED. VERIFIED ONLINE.`), 17 (`EVERYTHING YOU
GET.`) ir 02b (`FRONT + BACK. NUMBERED. REGISTERED.`) kartojo tą pačią istoriją trimis skaidrėmis.

Nauja skaidrė **`701:127` „MERGE 16+17 · Everything you get + registered"** sekcijoje `636:171`:

- **Keturi elementai vienoje eilėje, kiekvienas su parašu**: CARD FRONT · CARD BACK · CERTIFICATE ·
  **REGISTRY PAGE** (telefonas su tikru registro puslapiu, perkeltas iš 16). Parašai pridėti
  specialiai — neparašytas telefonas skaitosi kaip maketas, ne kaip tai, ką gauni.
- **Oranžinė juosta**: „4 DOWNLOADS + A LIVE REGISTRY PAGE · PRINTS SHIP FREE".
- **QR juosta iš 02b**: `UNIQUE CARD ID GDE-SN-BKB-2026-12` → `SCAN THE QR · THE CARD'S OWN PAGE`.
- **Poraštė** nebekartoja parašų: „PLUS A FLIP VIDEO FOR THEIR PHONE · EVERY FILE YOURS TO KEEP" —
  flip video vienintelis deliverable, kurio kadre nesimato.

Originalūs 16 ir 17 **palikti** (failo taisyklė: perdaroma kopijoje, originalas lieka palyginimui).

**Tai atlaisvina vietą:** jei 16+17 keičiami šia viena, sekcijoje lieka 20 rėmelių 20 vietų, ir
dviejų „02 / 20" problema išsisprendžia savaime. Numeraciją perbėgti reikės, kai savininkas
patvirtins, kurios skaidrės keliamos. **02b dabar dubliuoja QR juostą** — arba jis lieka kaip
ankstyvas „front + back" kabliukas be juostos, arba iškrenta.

### 16+17 pakeisti; kas pridėta, ko listinge nebuvo (2026-09-02)
- `636:208` ir `636:181` pervadinti į **`ZZ OLD ·`** ir paslėpti (projekto taisyklė: netrinam,
  kad palyginimas ir grąžinimas liktų nemokamas). Vietoje jų — `701:127`
  **`17 · Everything you get + registered`**. Sekcijoje lieka 20 matomų rėmelių.
- **Nauja eilutė, atsakanti „na ir kas?"** ties QR juosta: *„THE PAGE SHOWS THE ATHLETE, THE
  SEASON AND THE EDITION — PROOF IT IS THEIRS"*. Juosta iki šiol sakė, kad kortelė TURI ID ir
  puslapį, bet niekur nepasakė, kam jis reikalingas. Tai vienintelis teiginys pakuotėje, kurio
  konkurentas negali nukopijuoti, ir jo nebuvo nė vienoje skaidrėje.
- **Nuotraukų privatumas — skaidrė 12** (`706:127`): *„YOUR PHOTOS ARE USED ONLY TO MAKE YOUR
  ORDER — NEVER POSTED, NEVER SHARED."* Pažadas buvo TIK aprašyme, o Etsy pirkėjai aprašymų
  neskaito. Tėvai įkelia savo vaiko nuotraukas — tai vienintelė vieta, kur jie apie tai galvoja.

**Ko dar neįdėjau ir kodėl:** ant QR juostos stipriausia būtų atspausdinti TIKRĄ adresą
`gamedayedition.com/c/GDE-SN-BKB-2026-12` — tada registras nustoja būti teiginiu ir tampa
patikrinamas. Bet `app/c/[cardId]/page.tsx` vis dar pažymėtas PLACEHOLDER (hero renderis, reveal
video, wallpaper atsisiuntimas — TODO). Adresas ant listingo nuotraukos yra kvietimas nuskenuoti;
kol puslapis nebaigtas, tai kenkia labiau nei padeda. **Kai puslapis bus gyvas — tai pirmas
dalykas, kurį ten reikia pridėti.**

### 16+17 pakeisti; kas pridėta, ko listinge nebuvo (2026-09-02)
- `636:208` ir `636:181` pervadinti į **`ZZ OLD ·`** ir paslėpti (projekto taisyklė: netrinam,
  kad palyginimas ir grąžinimas liktų nemokamas). Vietoje jų — `701:127`
  **`17 · Everything you get + registered`**. Sekcijoje lieka 20 matomų rėmelių.
- **Nauja eilutė, atsakanti „na ir kas?"** ties QR juosta: *„THE PAGE SHOWS THE ATHLETE, THE
  SEASON AND THE EDITION — PROOF IT IS THEIRS"*. Juosta iki šiol sakė, kad kortelė TURI ID ir
  puslapį, bet niekur nepasakė, kam jis reikalingas. Tai vienintelis teiginys pakuotėje, kurio
  konkurentas negali nukopijuoti, ir jo nebuvo nė vienoje skaidrėje.
- **Nuotraukų privatumas — skaidrė 12** (`706:127`): *„YOUR PHOTOS ARE USED ONLY TO MAKE YOUR
  ORDER — NEVER POSTED, NEVER SHARED."* Pažadas buvo TIK aprašyme, o Etsy pirkėjai aprašymų
  neskaito. Tėvai įkelia savo vaiko nuotraukas — tai vienintelė vieta, kur jie apie tai galvoja.

**Ko dar neįdėjau ir kodėl:** ant QR juostos stipriausia būtų atspausdinti TIKRĄ adresą
`gamedayedition.com/c/GDE-SN-BKB-2026-12` — tada registras nustoja būti teiginiu ir tampa
patikrinamas. Bet `app/c/[cardId]/page.tsx` vis dar pažymėtas PLACEHOLDER (hero renderis, reveal
video, wallpaper atsisiuntimas — TODO). Adresas ant listingo nuotraukos yra kvietimas nuskenuoti;
kol puslapis nebaigtas, tai kenkia labiau nei padeda. **Kai puslapis bus gyvas — tai pirmas
dalykas, kurį ten reikia pridėti.**

### Basketball — nauja skaidrių eilė (2026-09-02)
Perdėliota ir perrenumeruota; rėmeliai kanvoje sudėti 5×4 tinkleliu ta pačia tvarka, kad
sekcija skaitytųsi kaip listingas. Auditas: 20 matomų rėmelių, numeriai 01–20, be dublikatų ir
be spragų.

| # | skaidrė | iš kur |
|---|---|---|
| 01 | HERO — the card, up front | — |
| 02 | Choose your package | 02 |
| 03 | Front + back, numbered, registered | buvo 02b (antras „02 / 20") |
| 04 | The kid on the card | 03 |
| 05 | One athlete, six finishes | **08 → pakelta** |
| 06 | Style pair — SN + CA | 09 |
| 07 | Style pair — FS + HE | 10 |
| 08 | Style pair — SS + PR | 11 |
| 09 | Everything you get + registered | naujoji (16+17) |
| 10 | You see it first | 15 |
| 11 | We get the likeness right | **04 → nuleista** |
| 12 | The kit, front and back | 05 |
| 13 | Four shots, measured | 06 |
| 14 | Every field is yours | 14 |
| 15 | What photos to send | 12 |
| 16 | Your club's crest | 13 |
| 17 | How to order — digital or printed | 18 |
| 18 | Every year, the same kid | **07 → nuleista** |
| 19 | Occasions | 19 |
| 20 | Sports cross-sell | 20 |

**Logika:** kas tai yra → ką gauni → kad tai tikrai jis → kaip veikia → pasitikėjimas → pirk dar.
Trys procesinės skaidrės (panašumas / apranga / keturi kadrai) stovėjo 04–06, t. y. anksčiau nei
pirkėjas iš viso pamatydavo, kad yra šeši finišai — procesas ramina, bet noro nesukuria. „Every
year, the same kid" yra pakartotinio pirkimo idėja ir atsakinėjo į klausimą, kurio pirkėjas dar
neuždavė; dabar ji stovi greta „Occasions".

**Dvi pastabos, matomos tik sudėjus visas 20 greta:**
1. **18 skaidrė vis dar rodo FUTBOLO (soccer) atletus** krepšinio listinge (senas skolos įrašas,
   dabar mažiau matomas, bet vis tiek netiesa).
2. **10 skaidrėje (proof) yra `POSTER 18×24"`**, o šis listingas plakatų neparduoda — variantai
   yra Digital / 12 Printed / 24 Printed / Sealed Foil Pack. Arba tai sąmoningas cross-sell į
   plakatų listingą, arba lūkesčio klaida; savininko sprendimas.

### 02 / 03 / 10 perdarytos (2026-09-02)

**02 · Choose your package — perdaryta į palyginimo tinklelį.** Keturi burbulai su po 8 punktus
30 px šriftu buvo siena, kurios prie 300 px niekas neskaito. Ir dar: stulpeliai ėjo nuo x 98 iki
1902, t. y. **už 4:5 saugios zonos (200–1800) — Etsy tinklelyje pirmas ir paskutinis paketas buvo
nukerpami**. Dabar: 8 eilutės × 4 stulpeliai, etiketės 36 px, varnelės 52 px, „24 PRINTED CARDS"
stulpelis su tyliu atspalviu, MOST GIFTED / COLLECTOR ženkliukai virš tinklelio. Viskas telpa
200–1800. Paskutinė eilutė **„Ready in": 1–2 DAYS / 5–7 DAYS / 5–7 DAYS / 2–3 WEEKS** — terminai
tapo palyginimo dalimi, ne smulkiu šriftu kažkur kitur. Seni stulpeliai paslėpti, ne ištrinti.

**03 · Front + back — QR juosta pakeista FIZINIAIS faktais.** Juosta dubliavo 09 skaidrę, tad
atlaisvinta vieta atiteko tam, ko listinge nebuvo NIEKUR: kaip atrodo atspausdinta kortelė.
`2.5 × 3.5 IN` (real trading-card size) · `BOTH SIDES` (printed edge to edge) · `UV COATED` (pro
photo stock) · `SQUARE-CUT` (no rounded corners). Kiekvienas faktas iš `docs/SUPPLIERS.md` (Bay
Photo Trader Cards, UV Coated ON, full-bleed) ir print specų (trim 744×1038 @300 = 2.48×3.46 in).
**Popieriaus gramatūros NEDĖJAU — jos dokumentuose nėra, o išgalvoti negalima.**

**10 · You see it first — pridėta GARANTIJA** (savininko sprendimas 2026-09-02):
`NOT RIGHT? WE REVISE IT — OR REFUND EVERY CENT`. Proof lapas sumažintas 10 %, juosta telpa
247–1753 (saugi zona). ⚠️ **Tai pažadas ant paveikslėlio — jis privalo atsirasti ir Etsy aprašyme
(šiuo metu jokio guarantee bloko copy pack'e NĖRA) ir būti vykdomas.**

### Pakelio skaičius — 18 IŠ VISO, ne 18 + 4 (2026-09-02)
Savininkas pagavo: matricoje buvo `18 + 4 FOIL`, o tai skaitosi kaip **22**. Kanonas
(`docs/ETSY-LISTINGS.md`, sprendimas 2026-08-25): **18 kortelių iš viso — 4 holografinės chase +
14 paprastų**, viena fiksuota receptūra. Ištaisyta į `18 (4 FOIL)`; ta pati klaida ištaisyta ir
paslėptame senajame stulpelyje, kad negrįžtų, jei jį kas nors atidengtų.

Kilmė: klaidą įnešiau statydamas `02 · CHOOSE YOUR PACKAGE` anksčiau šioje sesijoje
(„· 18 cards + 4 FOIL cards"), ir matrica ją paveldėjo. Kitur repo šito teksto nėra.

**`CLAUDE.md` buvo pasenęs** — sakė „Pack size is 10 cards, not 25" (2026-08-19). Atnaujinta į 18
su paaiškinimu, kad 7 mm apribojimas 18-os nedraudžia (18 × 0.32 mm = 5.8 mm).

⚠️ **Lieka neišspręsta ir tai svarbu prieš siunčiant pirmą pakelį:** `docs/ETSY-LISTINGS.md` jau
įspėja, kad **TGC pakelio veidas sako „10 COLLECTIBLE CARDS", o sertifikatas — 10**. Jei pakelis
su 18 kortelių išvyks su tokiu veidu, tai bus ta pati 25-kortelių klaida iš naujo. Skaičių reikia
nuimti nuo pakelio veido (vienas failas tarnauja abiem), o skaičius lieka listinge ir per-order
sertifikate.

### HERO sutvarkytas pagal kanoną (2026-09-02)
Savininkas: *„tie 3 kažkokie išsitaškę, visi panašūs… nuotraukos užspaustos ir game day užlipęs"*.

**Priežastis buvo mano klaida:** dedant trečią piliulę ir stumdant nuotraukas naudojau ABSOLIUČIAS
koordinates, o rėmelio vaikai yra santykiniai. Todėl `chip_printed` atsidūrė x 318 / y 911 (vietoj
260 / 860), nuotraukos nuslinko +58 x ir +55 y, ir jų apačia (1669) **užlipo ant wordmark'o**
(1656). Ta pati klaida, kaip statant sujungtą 09 skaidrę — abu kartus pagauta tik pažiūrėjus.

Sutvarkyta pagal `etsy/LISTING-IMAGE-CANON.md` §3 ir §7:
- **Visa kairė kolona ties x = 260**, piliulės vienodu 120 px žingsniu (620 / 740 / 860).
- **Hierarchija vietoj trijų vienodų**: oranžinė (`FROM YOUR PHOTOS`) → sidabrinis kontūras
  (`NUMBERED + REGISTERED`) → pilnavidurė tamsi (`PRINTED + SHIPPED FREE`).
- **VIENA didelė „before" nuotrauka 400×533**, 10 px baltas apvadas + šešėlis. Kanono §7 pasakyta
  tiesiai: dvi 269 px nuotraukos prie tikro tinklelio dydžio (~300 px) virsta dviem neįskaitomais
  taškais. Antra **paslėpta, ne ištrinta** — lygiai kaip kanonas ir numato.
- **Rodyklė iškelta į priekį** (buvo po kortele, matėsi tik kelmelis) ir rodo iš nuotraukos į
  produktą.
- **Wordmark ties x 260, y 1620** — kolonoje ir virš 240 px apatinio rezervo.

⚠️ **Nukrypimas nuo kanono, sąmoningas:** kanonas (§3) numato DVI piliules, mes turime tris —
trečioji neša V3 fizinę žinią (`PRINTED + SHIPPED FREE`), kurios kanonas dar nežinojo. Kanoną
reikės atnaujinti arba piliulę sujungti, jei savininkas nuspręs kitaip.

### Basketball — GALUTINĖ skaidrių eilė (2026-09-02)
Savininko sprendimo seka: **1–5 WHAT/VALUE · 6–10 CHOICE · 11–17 TRUST · 18–20 EXPANSION.**
Rėmeliai kanvoje sudėti **į vieną eilutę** (kaip football sekcijoje: y = 160, žingsnis 2280).
Auditas: 20 matomų rėmelių, viena eilutė, numeriai 01–20, rėmelių vardai sutampa su skaitikliais.

| # | skaidrė | iš kur |
|---|---|---|
| 01 | HERO | — |
| 02 | Choose your package | 02 |
| 03 | Everything you get + registered | **09 → 03** |
| 04 | Front + back, numbered, registered | 03 |
| 05 | The kid on the card | 04 |
| 06 | One athlete, six finishes | 05 |
| 07 | Style pair — SN + CA | 06 |
| 08 | Style pair — FS + HE | 07 |
| 09 | Style pair — SS + PR | 08 |
| 10 | Every field is yours | **14 → 10** |
| 11 | How to order — digital or printed | **17 → 11** |
| 12 | What photos to send | **15 → 12** |
| 13 | We get the likeness right first | 11 |
| 14 | One athlete, consistent in every shot | 13 |
| 15 | Their uniform, their number | 12 |
| 16 | Your club's crest | 16 |
| 17 | You approve it before it's final | **10 → 17** |
| 18 | One every season | 18 |
| 19 | Made for the moment | 19 |
| 20 | Seventeen sports | 20 |

**Du nukrypimai nuo savininko lentelės, sutarti:**
1. **16 ir 17 apkeisti.** Savininko variante TRUST blokas baigėsi „Your Club's Crest" — o tai
   „ko mes NEDARYSIME" skaidrė. Dabar blokas baigiasi **„tu patvirtini, arba grąžinam visus
   pinigus"**: paskutinis įspūdis prieš ekspansiją yra rizikos nulis, ne apribojimas.
2. **„What photos to send" pakelta iš 15 į 12**, iškart po „How to order" — 11 skaidrė sako
   „Send 4–10 photos", o 12 atsako „kokias". Anksčiau tarp klausimo ir atsakymo buvo keturios
   skaidrės. TRUST blokas dabar eina: užsakymas → nuotraukos → žmogus (panašumas, nuoseklumas) →
   apranga (uniforma, herbas) → patvirtinimas su garantija.

**Nepakeista sąmoningai:** 02–04 yra trys informacinės šviesaus fono skaidrės iš eilės, pirmas
žmogiškas kadras tik 05. Tai gali pasijusti plokščia karuselėje, bet 03–04–05 logika (vertė →
įrodymas → emocija) nuosekli. Jei kada matuosim swipe'us — **04↔05 apkeitimas yra pirmas dalykas,
kurį verta pabandyti.**

Senieji 16/17 (`ZZ OLD`) paslėpti ir nustumti į antrą liniją, kad netrukdytų skaitymo eilės.

### HERO — dvi „before" nuotraukos grąžintos (2026-09-02, savininko sprendimas)
Pataisymas ankstesniam įrašui: kanono §7 „viena didelė nuotrauka" **atšaukta savininko** — hero
turi rodyti **abu įvesties tipus: profilį (veidą) ir kadrą su žaidybine apranga**, nes būtent
pagal juos ir daromas darbas.

Ne senasis variantas (dvi mažos gretimos plytelės), o **persidengianti pora**: profilis 288×384
pasuktas −8°, aprangos kadras 352×470 pasuktas +3° priekyje, abu su 10 px baltu apvadu ir
šešėliu. Kampai persidengia, subjektai — ne. Aprangos kadras priekyje, nes būtent jis susieja su
kortele.

Kartu: wordmark nuleistas į y 1660 (kanonas rezervuoja tik apatinius 240 px, t. y. iki y 1760),
kad nuotraukoms liktų aukščio; poros kairysis kraštas patrauktas į x 209 — **4:5 kirpimas prasideda
ties 200**, o ankstesnis variantas siekė 188 ir būtų buvęs apkarpytas.

⚠️ **Sąžininga pastaba:** kanono §7 argumentas prieš dvi nuotraukas buvo išmatuotas — prie ~300 px
tinklelio dydžio jos virsta neįskaitomais taškais. Ši pora didesnė (288/352 vs 269) ir dėl
persidengimo skaitosi kaip VIENA „nuotraukų krūvelė", o ne kaip du atskiri kadrai — bet atskirų
veidų prie 300 px vis tiek neatskirsi. Tai priimtina, jei žinutė yra „dirbame iš jūsų nuotraukų",
o ne „žiūrėk į šitą veidą". Prieš keliant verta padaryti kanono squint testą: eksportuoti 2000 px
ir pažiūrėti sumažinus iki 300 px.

Antra nuotrauka (`636:1706`) nebe paslėpta — dabar matoma.

### 02 skaidrė — „ką realiai gauni" nuotraukos (2026-09-02, dirbama)
Savininkas: apatinė eilutė (`EVERY PACKAGE · BUILT FROM YOUR PHOTOS · …`) keičiama į **realius
kadrus, kaip atrodo kiekvienas paketas** — matytųsi ir kortelės, ir jų KIEKIS.

Metodas tas pats, kaip kortelė rankoje: scena generuojama su **tuščiomis matinėmis juodomis
plokštelėmis**, tikras eksportas įwarpinamas po to (`art-pipeline/gen-package-shots.ts` +
naujas `art-pipeline/lib/warp_onto.py`). `warp_onto.py` skiriasi nuo `card_in_hand.py` tuo, kad
keturkampis PADUODAMAS, o ne ieškomas — krūvelėje visos kortelės juodos, tad automatinis
radiklis fitintų visą krūvelę, ne viršutinę kortelę.

Padaryta 3 iš 4:
| stulpelis | kadras | failas |
|---|---|---|
| DIGITAL FILES | telefonas ant stalo, ekrane kortelė | `pkg-01-digital.png` |
| 12 PRINTED CARDS | vėduoklė iš 12 kortelių, viršutinė su tikru menu | `pkg-02-12-cards.png` |
| 24 PRINTED CARDS | dvi krūvelės, viršuje priekis ir nugara | `pkg-03-24-cards.png` |

**Liko SEALED FOIL PACK.** Savininkas leido naudoti tiekėjo (QPMN) mockup'us ir atsiuntė juos
pokalbyje — bet **įklijuotų pokalbio nuotraukų negaliu įrašyti į diską** (patikrinta: sesijos
scratchpad ir tasks katalogai tušti). Failus reikia įdėti į
`art-pipeline/out/etsy-shots/packages/supplier/` — tada uždėsiu mūsų pakelio dizainą
(`print-sources/output/stadium-night/GDE-SN-booster-pack-FLAT-2032x1560-300dpi.png`, priekinė
panelė x 605–1423) tuo pačiu `warp_onto.py`.

### 02 skaidrė — keturi realūs paketo kadrai (2026-09-02, BAIGTA)
Bendra eilutė `EVERY PACKAGE · BUILT FROM YOUR PHOTOS · …` paslėpta; jos vietoje **kiekvienas
stulpelis dabar turi savo nuotrauką** virš pavadinimo — matosi ir kaip atrodo, ir kiek jų yra.

| stulpelis | kadras | kilmė |
|---|---|---|
| DIGITAL FILES | telefonas ant stalo, ekrane kortelė | mūsų generuota scena + warp |
| 12 PRINTED CARDS | 12 kortelių vėduoklė, viršutinė su tikru menu | mūsų generuota scena + warp |
| 24 PRINTED CARDS | dvi krūvelės, viršuje priekis IR nugara | mūsų generuota scena + warp |
| SEALED FOIL PACK | ranka laiko foliją su mūsų Stadium Night dizainu | **QPMN mockup** (savininkas leido) + warp |

Nauji įrankiai: `art-pipeline/gen-package-shots.ts` (scenos su tuščiomis juodomis plokštelėmis) ir
`art-pipeline/lib/warp_onto.py`. Pastarasis skiriasi nuo `card_in_hand.py` tuo, kad **keturkampis
paduodamas, o ne ieškomas** — krūvelėje visos kortelės juodos, tad automatinis radiklis fitintų
visą krūvelę. `--multiply` režimas perkelia scenos šviesumą per meną: be jo folijos pakelis
atrodo kaip lipdukas, su juo dizainas seka raukšles ir blikus.

⚠️ **RADAU SKOLĄ, PATAISYTA TIK MOCKUP'E:** mūsų pakelio meno eilutė sako **„10 COLLECTIBLE
CARDS"** — būtent tai, apie ką įspėja `docs/ETSY-LISTINGS.md`. Listingo nuotraukai užlopiau
pikseliais į „18" (Barlow Medium, suspaustas iki originalaus pločio, nes kondensuoto Barlow
sistemoje nėra). **Spausdinimo failas `print-sources/output/*/GDE-*-booster-pack-FLAT-*.png` VIS
DAR sako 10** — jį reikia sutvarkyti Figmoje (finišų faile) ir pereksportuoti prieš pirmą fizinį
užsakymą. Ten pat savininkas nuspręs: „18 COLLECTIBLE CARDS" ar kanono siūlomas variantas be
skaičiaus.

Tiekėjo mockup'ai: `art-pipeline/out/etsy-shots/packages/supplier/` (`qpmn-hand-pack`,
`qpmn-hand-cards`, `qpmn-two-cards`, `qpmn-pack-and-card`).

### 02 skaidrės kadrai — antras ratas pagal savininko pastabas (2026-09-02)

| pastaba | kas padaryta |
|---|---|
| „DIGITAL geriau — PDF ekrane… ir telefono ekranėlis matosi" + „parodyk ir priekį ir galą" | scena pergeneruota: atidarytas nešiojamas su dokumentų langu, jame **DVI kortelės — priekis ir nugara** greta, plius telefonas šalia su ta pačia kortele |
| „prie 12 kortelių šone galima pavaizduoti nugarėles" | šoninė kortelė dabar guli veidu į viršų ir neša **kortelės NUGARĄ** |
| „problema su 12 ir 24 print kad kortelės apvaliais kampais" | žr. žemiau |
| „sealed foil pack labai matosi sidabriniai kampai" | dizaino keturkampis praplėstas iki pakelio silueto — sidabro liko tik ties pačiais užspaudimais |

**Dėl kampų — modelis jų statių NEPADARO.** Trys bandymai iš eilės (tuščia plokštelė, pakelio
panelė, krūvelės), įskaitant formuluotę „sharp 90-degree corners, like paper cut with a
guillotine". Todėl sprendimas perkeltas iš prompto į kompozitorių: **menas dabar dažomas iki pat
keturkampio krašto** (`warp_onto.py` be `--mask-dark`), ir kortelė tampa stati iš savo pačios
geometrijos, nesvarbu, kokią plokštelę nupiešė modelis. Veikia kiekvienai kortelei, kuri neša
meną. **Neuždažytos krūvelės kortelės vis dar apvalios** — jas matyti tik iš šono, kaip briaunų
juostą.

Plius: 24 kortelių scena pergeneruota **žiūrint tiksliai iš viršaus** — anksčiau kamera stovėjo
kampu, viršutinė kortelė buvo perspektyviai suplota, ir į ją įwarpintas menas atrodė kaip gulsčia
kortelė (aspect 1.18 vietoj 0.71). Dabar 0.70/0.71.

⏳ **Liko: „viskas turi atrodyti kaip vienuose namuose".** Trys kadrai ant to paties šviesaus ąžuolo,
o pakelis — ant balto tiekėjo fono. Sugeneruotas tuščias stalas (`pkg-table.png`) ir paleistas
BiRefNet iškirpimas, kad ranka su pakeliu atsidurtų ant to paties stalo. Iškirpimas CPU trunka
ilgai — kai baigsis, sudėsiu ir perkelsiu.

### 02 kadrai — trečias ratas (2026-09-02)
| pastaba | sprendimas |
|---|---|
| „iššoko iš ekrano" (telefonas) | keturkampiai nebe rankomis įvesti — **matuojama plokštelė** (`card_in_hand.plate_pixels` + `fit_containing` ant iškirpto lopo), o telefono ekranui grąžintas `--mask-dark`, nes telefono ekranas TIKRAI apvaliais kampais |
| „bet kas bet kur uždėta" (12) | scena pergeneruota **tiksliai iš viršaus**: krūvelė iš 12 + viena kortelė šalia; abu keturkampiai išmatuoti, menas dengia plokštelę tiksliai, be juodo apvado |
| „ar po jais neišeina įkišti, kad atrodytų tos pačios kortelės" | šalia gulinti kortelė dabar neša **NUGARĄ**, o krūvelės viršus — priekį: tas pats komplektas, abi pusės |
| „parodyk ant kompo ir priekį ir galą" | nešiojamo ekrane **dvi kortelės greta** dokumentų lange + ta pati kortelė telefone |
| „pakelis neatrodo natūraliai" | trys nauji `warp_onto.py` režimai: `--multiply` (scenos šviesa per meną), **`--displace`** (spauda seka folijos raukšles pagal šviesumo gradientą) ir **`--round`** (kaukės kampai suapvalinami iki maišelio kampo — kietas stačiakampis ant pagalvėlės buvo garsiausias „čia mockup'as" ženklas) |

**Kampų taisyklė galutinai:** promptas nepadeda (4 bandymai). Menas dažomas iki išmatuoto
keturkampio krašto, ir kortelė stati iš savo pačios geometrijos.

⏳ Vis dar liko: pakelis ant balto tiekėjo fono, o kiti trys ant ąžuolo stalo. Iškirpimas
(BiRefNet, `pack-cut.png`) tebesisuka fone; tuščias stalas jau sugeneruotas (`pkg-table.png`).

### 02 kadrai — galutinis metodas (2026-09-02)
Po kelių ratų nusistovėjo trys skirtingi metodai, po vieną kiekvienam daikto tipui:

1. **Folijos pakelis — per REFERENCE nuotraukas** (savininko atrastas būdas): mockup'as kaip 1
   nuotrauka, mūsų dizainas kaip 2, „paimk 1 tokį koks yra ir pakeisk vieną dalyką". Atrodo
   nufotografuota — spauda seka pagalvėlės išgaubimą ir folijos blikus.
   ⚠️ **Tekstą privalu tikrinti prie 100 %**: savininko kadre modelis perrašė „FIRST EDITION · 2025"
   (turi būti 2026) ir „GAMERSYEDITION.COM" vietoj gamedayedition.com. Todėl galutinis kadras yra
   HIBRIDAS: modelio scena (`examples/card in foil.jpeg`) + mūsų tikra panelė užwarpinta ant jos
   (`warp_onto.py --multiply --smooth 26 --round 14`). `--smooth` būtinas, nes bazėje jau yra
   spauda ir neišblukintas gain'as pertraukia seną tekstą kiaurai naują.
2. **12 ir 24 kortelės — surenkama KODU** (`art-pipeline/lib/card_spread.py`): tikslus kiekis,
   statūs kampai, tobulas menas ir valdomas priekio/nugaros miksas. Generuota vėduoklė yra viena
   juoda dėmė — keturkampių išmatuoti neįmanoma, o vedami iš akies jie krenta į akis.
   Savininko taisyklė: daugiau atverstų nei nugarėlių; 24 — viena atskira kortelė viršuje priekiu,
   pirma eilė miksuota su nugarėle dešinėje ant viršaus, apatinė eilė visa nugarėlėmis.
3. **Vienodas kadravimas** (`art-pipeline/lib/tile_crop.py`): subjektas išmatuojamas ir kvadratas
   iškerpamas su vienodu užpildu — keturios plytelės vienoje eilėje skaitomos kaip komplektas.

Naujas įrankis be to: `gen-package-shots.ts` `APPLY` konstanta — vienas promptas visiems
„uždėk dizainą ant mockup'o" darbams.

### 02 kadrai — BAIGTA (2026-09-02)
Galutinis miksas pagal savininką: **12** — vėduoklė iš 10 (visos priekiu) ir **dvi ištrauktos
žemiau: viena priekiu, viena nugara**, abi pilnai matomos. Vien vėduoklė nepalieka nė vienos
sveikos kortelės — kiekviena uždengia kitą, tad ištrauktos dvi neša skaitomumą, o vėduoklė kiekį.
**24** — viršutinė juosta vien priekiai, apatinė vien nugarėlės, plius viena atskira kortelė
viršuje priekiu. Abu surinkti `card_spread.py`, tad kiekis ir miksas tikslūs.

Piešimo eilė vėduoklėje eina IŠ DEŠINĖS Į KAIRĘ — kitaip ant viršaus atsiduria paskutinė, o ne
artimiausia kortelė, ir nė viena nelieka pilnai matoma.

**Pakelis**: savininko scena (`examples/card in foil.jpeg`) + mūsų tikra panelė. Kelios klaidos
pakeliui, visos užrašytos `warp_onto.py` komentaruose:
- `--mask-dark` čia NETINKA: bazėje jau yra spauda, o jos baltas tekstas yra šviesus, tad kaukė jį
  palieka ir senas tekstas persišviečia per naują.
- Platesnis keturkampis be kaukės — kampas išlenda už pakelio ant lango.
- Veikia **`--pack-mask`**: siluetas = keturkampis MINUS oda ir MINUS peršviesta fonas, tada skylės
  užpildomos (taip baltas tekstas grįžta kaip objekto dalis). Seka ir pakelio siaurėjimą į viršų.

Tekstas patikrintas prie 100 %: `18 COLLECTIBLE CARDS`, `FIRST EDITION · 2026`,
`GAMEDAYEDITION.COM` — visi teisingi (savininko generacijoje modelis buvo perrašęs 2025 ir
GAMERSYEDITION.COM).

## VISOS 6 SEKCIJOS SUVIENODINTOS PAGAL BASKETBALL ETALONĄ (2026-09-02)

Football, cheerleading, baseball, soccer, volleyball pravesti per tą patį receptą kaip basketball.
Kiekvienoje sekcijoje: 20 skaidrių, viena eilutė, numeracija 01–20, rėmelių vardai sutampa su
skaitikliais, 0 tekstų už kadro, 0 apvalių kortelės kampų, 0 pasenusių frazių.

| kas | visose 5 |
|---|---|
| 18/20 tekstai, `·—`, ✗ ant teigiamo teiginio, „FAST DELIVERY" | ištaisyta |
| „SEVENTEEN SPORTS IN OUR SHOP" / „ONE LISTING PER SPORT" | pakeista teisingais |
| nuotraukų privatumo eilutė (12) | pridėta |
| telefono antraštė 20 → 30 px | ištaisyta |
| statūs kortelių kampai | 25–27 mazgai kiekvienoje |
| HERO: trys piliulės ties x 260, persidengianti nuotraukų pora, rodyklė priekyje, wordmark | perdaryta |
| **09 → 03 „Everything you get + registered"** (16+17 sujungimas) | pastatyta kiekvienoje |
| 04 „Front + back" fizinių faktų eilutė vietoj dubliuotos QR juostos | pridėta |
| 17 „You approve it" garantijos juosta | pridėta |
| **02 CHOOSE YOUR PACKAGE** — palyginimo matrica + 4 paketo nuotraukos | perdaryta |
| eiliškumas ir viena eilutė kanvoje | perdėliota |

**Baseball ir soccer NETURĖJO „Front + back" skaidrės** — pastatyta klonuojant iš cheerleading ir
pakeičiant kortelių meną, QR ir kortelės ID (`GDE-HE-BSB-2026-07`, `GDE-CA-SOC-2026-10`).

Paketo nuotraukos kiekvienam sportui pagamintos `art-pipeline/lib/package_tiles.py` — tos pačios
trys bazinės scenos, keičiasi tik menas, tad visų šešių listingų eilė atrodo fotografuota vienoje
vietoje. Kiekvieno finišo pakelio panelė patikrinta: **18 COLLECTIBLE CARDS**.

### Svetimo meno auditas
Rastas ir ištaisytas: baseball ir soccer nešė **football** kadrus, volleyball — **cheerleading**.
Pakeista tikrais to sporto asset'ais: 14 skaidrės keturios pozos (`hero/action2/action3/back.fit`),
15 skaidrės aprangos plokštelės (`_kit.png`, `_kit-back.png`) ir referencinė atleto nuotrauka
(`_identity.png`).

⚠️ **Liko du svetimo meno atvejai, kuriems repo neturi asset'ų:**
1. **17 skaidrė (proof lapas)** — baseball ir soccer rodo football proof'ą, volleyball —
   cheerleading. Reikia per-sporto proof renderio iš to sporto Figma failo
   (`docs/FIGMA-FILES.md`: baseball `tL9vfpIhC5esFbXcozgAlT`, soccer `zH80jD1o3jSMvFePyrtTG1`,
   volleyball `S8kqmhvEB5QNG8sbjgxQnF`; proof mazgas `98:2` to finišo puslapyje).
2. **03 skaidrės sertifikatas** — ta pati problema. `print-sources/output/*/GDE-*-certificate-*.png`
   NETINKA: visi šeši vardija „NIA BROOKS" (krepšininkę), tad būtų ta pati klaida kita forma.

Abu reikalauja eksporto iš per-sporto Figma failų — vienintelis dalykas, kurio negalėjau padaryti
iš to, kas guli repo.

---

## 2026-09-02 — svetimo meno auditas UŽDARYTAS + du prarasti mazgai

### Ką rado pakartotinis auditas
Ankstesnis auditas buvo užterštas: BASEBALL sekcija buvo įkritusi į VOLLEYBALL vidų (sekcijos
persidengė po `resize`), tad hash'ų palyginimas grąžino šiukšles. Sutvarkius juostas (kiekviena
sekcija sava `y`, 22 vaikai) auditas parodė **daugiau svetimo meno, nei buvo užrašyta** — ne du
atvejus, o šešis:

| skaidrė | kas buvo svetima | baseball | soccer | volleyball |
|---|---|---|---|---|
| 01 HERO | fonas + **abi „before" nuotraukos** | football | football | cheerleading |
| 03 | sertifikatas | football | football | cheerleading |
| 12 | visos 8 plytelės (4 geros + 4 blogos) | football | football | cheerleading |
| 16 | klubo herbas | football | football | cheerleading |
| 17 | proof plakatas | football | football | cheerleading |

Blogiausias buvo **01 HERO**: „CUSTOM BASEBALL TRADING CARD" po dviem amerikietiško futbolo
nuotraukomis, ant futbolo aikštės fono. Pirmas listingo kadras rodė ne tą sportą.

### Kaip ištaisyta (viskas iš repo + per-sporto Figma failų)
- **fonas** — `art-pipeline/out/etsy-shots/<sport>/hero-bg.png` (buvo, tiesiog neprijungtas)
- **„before" nuotraukos** — `art-pipeline/out/athletes/<sport>/before/photo{1..4}.png`.
  Etalono tvarka: gale/kairėje portretas, priekyje veiksmo kadras. Geometrija sulygiuota su
  krepšiniu: (283,950) 288x384 rot −8 ir (399,1220) 305x408 rot 3 — klonai buvo su 352x470.
- **sertifikatas ir proof plakatas** — per-finišo mazgai to sporto faile, ne SN puslapio:
  baseball HE cert `305:780` / plakatas `190:253`; soccer CA cert `144:120` / `190:93`;
  volleyball SS cert `305:741` / `190:319`. Sertifikato ID dabar sutampa su kortele
  (`GDE-HE-BSB-2026-07`, `GDE-CA-SOC-2026-10`, `GDE-SS-VBL-2026-05`) ir su QR.
- **herbas** — `art-pipeline/out/crests/<slug>.cut.png`, įdėtas į 902x814 permatomą drobę, kad
  `FILL` nieko nenukirstų.
- **12 skaidrė** — vienas **spraitas** (4x2, 560 px langeliai) vienam sportui, plytelės rodo savo
  langelį per `scaleMode:"CROP"` + `imageTransform [[0.25,0,c*0.25],[0,0.5,r*0.5]]`.
  Taip 24 kėlimai virto 3. `PROFILE` plytelės kadravimas išmatuotas iš patvirtinto krepšinio
  kadro (veidas = **0.735** plytelės aukščio, viršus ties **0.214**) ir pritaikytas per
  insightface; soccer plokštelė nufotografuota arčiau, tad praplėsta `BORDER_REPLICATE` fonu.
- **antraštė** „✓ AT PRACTICE" → „✓ FACE, OTHER SIDE" visose penkiose klonuotose sekcijose
  (krepšinio etalone taip ir buvo; klonai nešė football tekstą, o nuotrauka jam neatitiko).

### Auditai po taisymo
- svetimo meno hash'ų auditas (be dydžio ribos): lieka tik **sąmoningai bendri** — 20 skaidrės
  17 sporto plytelės, 01 skaidrės scrim, 16 skaidrės „A LEAGUE MARK ✗" ir 18 skaidrės amžiaus
  eilė (ta pati ir krepšinio etalone).
- svetimų sporto žodžių tekstuose: **0** (tik 20 skaidrė, kur taip ir turi būti).
- teksto „išsiliejimo" matavimas (klonas + `textAutoResize=HEIGHT`): skaičiai **identiški visose
  šešiose sekcijose**, įskaitant etaloną → ne defektas, o fiksuotų dėžučių stilius.

### ⚠️ Ištrinti du mazgai — atkurti iš Figma version history
Valydamas kėlimo šiukšles filtravau pagal `type === "RECTANGLE"`, o kėlėjo paliktos šiukšlės buvo
`FRAME`. Todėl buvo ištrinti **du puslapio lygio stačiakampiai, priklausę savininkui**:
`Final version Basketball 1` (`636:2576`) ir `Second video for basketball 1` (`636:2593`) —
tie, kuriuos žymi likę užrašai `VIDEO 1` (−2625, 186) ir `Second video` (−2681, 1454) į kairę nuo
BASKETBALL sekcijos. Plugin API neturi `triggerUndo`, tad atkurti iš sesijos negalėjau.
**Atkūrimas: Figma → File → Show version history → versija prieš 2026-09-02 popietę.**
Taisyklė ateičiai: kėlėjo šiukšles trinti **tik pagal tikslų id**, ne pagal tipą ar vardą.

### Antras auditas: netinkamo TIPO asset'ai (hash'ų auditas jų nemato)
Hash'ų palyginimas sako tik „ar tas pats failas", ne „ar teisingas daiktas". Todėl paleistas
antras, stipresnis auditas: kiekvienam mazgui paimtas **natūralus nuotraukos kraštinių santykis**
(`getImageByHash(...).getSizeAsync()`) ir palygintas su tuo pačiu mazgu krepšinio etalone.
`CROP` užpildai praleidžiami — jie patys pasirenka langą, tad natūralus santykis nieko neįrodo.

Rado tai, ko akis būtų nepagavusi per hash'us:

| skaidrė | ką rodė BSB / SOC / VBL | ką turi rodyti |
|---|---|---|
| **13 „We get their likeness right first"** | visos 6 plytelės — **kortelės menas** | 4 kliento nuotraukos + `_identity.png` + `_identity-back.png` |
| **15 miniatiūra (1483,134)** | tapatybės plokštelė | kliento nuotrauka su apranga |
| **15 KIT PLATE · BACK (soccer)** | tapatybės plokštelė iš nugaros | nugarinė aprangos plokštelė |

Ištaisyta vienu spraitu vienam sportui (2240x2103, langeliai: 4x 560² plytelės, 2x 1120x837
plokštelės, 560x681 miniatiūra, 560x706 nugarinė apranga) — 22 kėlimai suspausti į 3.

**Soccer `_kit-back.png` sugeneruotas** (jo repo neturėjo — dėl to soccer buvo 7/8):
`npm run art:athlete -- --athlete soccer --stage kit --frame _kit-back`, €0.29, mėnesio suma
~€9.04 iš €25. Žalias marškinėlis su baltu „10", be ženklų — tinka. ⚠️ **Dar nepatvirtintas**
(`art:approve`), ir `--dry` vėliava NESUSTABDĖ generavimo — planavau tik peržiūrą.

Po taisymo santykių auditas BSB/SOC/VBL — **švarus**. Lieka tik FTB/CHR nuokrypiai
(13 skaidrės kvadratinės nuotraukos, 14/15 kitaip apkarpytos plokštelės) — patikrinta akimis,
atvaizduoja teisingai, tai stiliaus, ne turinio skirtumas.

### ⛔ RASTA, BET NETAISYTA: tikri prekės ženklai aprangos plokštelėse
`15 · KIT PLATE · FRONT` rodo **realių gamintojų ženklus** — ir tai NE klonų klaida, tai yra ir
patvirtintame krepšinio etalone:

| sportas | ženklas plokštelėje |
|---|---|
| basketball | Air Jordan siluetas su sparno/swoosh ženklu |
| baseball | **New Balance „N"** ant abiejų batų |
| volleyball | **Mizuno runbird** ant antkelių IR ant batų |
| soccer | **Nike swoosh** ant batų ir ant kamuolio |

Soccer atveju tą patį pasakė ir generatoriaus vertintojas: *„The shirt features Joma logos … making
this invented branding"*, `_kit-grade.json` = FAIL. **Swoosh matomas ir pozose** (`hero.png` batai
ir kamuolys), vadinasi jis yra ir kortelės mene.

Kodėl nepataisiau pats: `_kit` plokštelės yra **patvirtintos ir užrakintos**, jos yra pozų inkaras,
o pozos savo ruožtu yra kortelių ir spaudos failų šaltinis. Perrolinimas kaskaduoja į patvirtintą
meną — tai savininko sprendimas, ne mano. Pigiausias kelias, jei norima taisyti:
`npm run art:fix -- --athlete <slug> --frame _kit --change "plain unbranded boots, no maker marks"`
(keičia VIENĄ dalyką, senos versijos lieka), tada tas pats pozoms, kuriose ženklas matomas.

---

## 2026-09-02 (vakaras) — savininko pastabų ratas

Šešios pastabos iš peržiūros. Kas padaryta:

### 1. `18 · One every season` — nieko nedaryti
Amžiaus eilė yra **viena variacija visiems sportams** (savininko sprendimas). Ne defektas.

### 2. `04 · Front + back` — kortelės buvo apvalintais kampais
Tik **football** — jo 04 skaidrė nešė SENĄ eksportą (`384aa7`/`8add05`), o ne tą patį meną kaip
01/03/17 (`6f778a`/`788337`). Visų 32 kortelių PNG diske alfa kampuose = 255, t. y. failai
buvo tvarkingi; klaida buvo pasenęs paveikslėlis Figmoje. Patikrinta pikseliais po taisymo:
statūs kampai ir status vidinis keyline.

### 3. `06–09 · stiliai` — „front and back" rodė DU PRIEKIUS
Visose penkiose klonuotose sekcijose 07/08/09 poros turėjo **tą patį hash'ą** kairėje ir
dešinėje. Sutvarkyta pastačius **vieną autoritetingą kortelių lapą kiekvienam sportui**:
6 stiliai x (priekis + nugara) = 12 kortelių 4x3 tinklelyje (3000x3150, langelis 750x1050).
- football / cheerleading — iš disko (`FB-*`/`CH-*-card-FRONT|BACK.png`, visi šeši stiliai jau buvo)
- baseball / soccer / volleyball — **iš to sporto Figma failo**: eksportuota po 6 `01 · HERO &
  TEMPLATES` sekcijas (SN `145:9`, CA `145:4`, FS `166:2`, HE `166:111`, SS `166:220`,
  PR `166:329`) ir iškirpta pagal išmatuotus poslinkius (eksportas turi **40 px paraštę** iš
  kiekvienos pusės; kortelė visada 750x1050).
100 kortelės mazgų perjungti į `CROP` langelius. Tas pats lapas maitina ir 04, ir 06, ir 07–09,
tad pasenusio meno tokioje vietoje daugiau atsirasti negali.

### 4. `14 · One athlete` — nebuvo nei fono, nei atmesto kadro
Du defektai:
- **fonas**: baseball/soccer/volleyball naudojo `*.cutout.png` (permatomus), tad figūros
  kabojo ore. Pakeista neapdorotais kadrais su studijos fonu.
- **atmestas kadras**: etalone antra plytelė yra **REJECTED TAKE** su raudona juosta ir tikru
  balu; klonuose jos nebuvo, nors mazgai (raudona perdanga + tekstas) jau egzistavo — tiesiog
  paslėpti. Įjungti.
- **skaičiai buvo netikri**: visi keturi klonai rodė football skaičius (0.840/0.452/0.458).
  Pakeisti tikrais iš `_identity-gate.json`, o atmesto kadro balas išmatuotas
  `lib/pick_reject.py`:

| | hero | rejected | action3 |
|---|---|---|---|
| cheerleading | 0.556 | **0.317 FAIL** | 0.628 |
| baseball | 0.734 | **0.293 FAIL** | 0.514 |
| soccer | 0.729 | **0.228 FAIL** | 0.782 |
| volleyball | 0.652 | **0.281 FAIL** | 0.564 |

Kadravimas: jei poza netelpa į 0.470 plytelę (cheer špagatas, beisbolo smūgis), ji **įdedama su
fonu**, ne nukerpama — paraštė daroma kartojant krašto eilutę, tad fono gradientas ir grindys
tęsiasi be juostų.

⛔ **football neturi tikro atmesto kadro.** `reject-take.png` balas **0.546** — tai PRAEINA
(riba 0.36), ir `pick_reject.py` atsisako jį ženklinti atmestu; visi `_versions` kandidatai
taip pat praeina (0.40–0.86). Slaidas sako „MEASURED, NOT CLAIMED", tad praeinančio kadro
pavadinti atmestu negalima. Football lieka su keturiais PASS, kol bus sugeneruotas tikras
near miss (reikia balo tarp 0.15 ir 0.36).

### 5. `12 · What photos to send` — buvo pririšta prie to paties atleto
12 ir 13 skaidrės rodė TAS PAČIAS „before" nuotraukas. Dabar 12 naudoja **vieną bendrą,
anoniminį rinkinį visiems šešiems listingams** — jis repo jau gulėjo:
`out/etsy-shots/12a-send-front|12b-send-left|12c-send-right|12d-send-full` +
`12x-bad-blurred|distant|group|covered`. Vienas spraitas, aštuoni langeliai.
Antraštės pakeistos, kad atitiktų nuotraukas: **FACE, HEAD-ON · FACE FROM THE SIDE ·
FACE, OTHER SIDE · FULL BODY** (buvusi „IN THE KIT" neturėjo atitikmens bendrame rinkinyje;
aprangos nurodymas lieka 15 ir 16 skaidrėse).

### 6. Auditai po viso rato
- 06–09 dubliuotų priekis/nugara porų: **0**
- svetimo meno tarp sekcijų: tik sąmoningai bendri (20, 01 scrim, 16 league mark, 18 amžiaus eilė)
- visos 6 sekcijos: 22 vaikai, 20 skaidrių, sava juosta

---

## 2026-09-02 (vėlus vakaras) — telefonas ir 12 skaidrės pavyzdžiai

### Telefonas šalia kompiuterio (`02` skaidrės DIGITAL plytelė)
Kortelė buvo **ištempta per visą telefono ekraną** ir pasvirusi — matėsi nukirstas „GAME DAY
EDITION", o kraštas išeidavo už telefono. Dvi priežastys, abi ištaisytos
`art-pipeline/lib/package_tiles.py`:

1. **Kvadratas buvo neteisingas.** Senas `802,344,1009,349,1002,663,794,658` yra **215 px
   pločio**, o telefono stiklas — **151 px**. Kodėl: automatinis „tamsiausio ploto" fitas
   prijungia už telefono esančią tamsią lentyną, ir kvadratas išsipučia į dešinę. Naujas
   matavimas: kairė/dešinė kraštinės fitinamos **per eilutes**, viršus/apačia — **per vidurines
   kolonas** (kad iškirpa ir apvalūs kampai netemptų fito), tada 5 px į vidų ant stiklo.
   `PHONE_QUAD = "801,345,952,342,947,655,797,655"`, `PHONE_AR = 151/312`.
2. **Kortelė nėra ekrano formato.** Kortelė 0.714, ekranas 0.483 — bet kokia kortelė, warpinama
   į visą ekraną, bus suspausta 30 %. Dabar statoma **skaitytuvo puslapio** nuotrauka
   (`phone_page()`): tamsus readerio fonas, viršutinė juostelė, kortelė **tikru santykiu**,
   88 % pločio, su šešėliu ir paraštėmis. Warpinamas jau ekrano formato vaizdas, tad niekas
   nesitempia. Atrodo kaip PDF, atidarytas telefone.

Pridėta `--only {all,digital,12,24,pack}`, kad vieną plytelę būtų galima perdaryti neliečiant
trijų patvirtintų. Perdaryta visiems šešiems sportams.

### `12 · What photos to send` — pavyzdžiai pergeneruoti
Trys savininko pastabos:
- **abu trijų ketvirčių kadrai suko galvą į TĄ PAČIĄ pusę.** Priežastis prompte: „turned the
  OTHER way" yra **palyginimas**, o modelis neturi su kuo palyginti. Dabar kryptis nurodoma
  absoliučiai ir vaizdo terminais: *„HIS NOSE POINTS AT THE LEFT / RIGHT EDGE OF THE
  PHOTOGRAPH"*. Kadrai tikrai priešingi.
- **pilnas ūgis dabar su APRANGA** (mėlynas komplektas, numeris 23 ant krūtinės), ne pilki
  marškinėliai. Antraštė: „✓ FULL BODY IN THE KIT".
- **kitas žmogus** — baltaodis paauglys, nesusijęs nė su vienu listingo atletu.
Tapatybę neša `12a-send-front` (generuojamas be referencės), kiti trys ją nurodo kaip
referencę. Todėl `ref()` `gen-etsy-shots.ts` dabar **tingus** (`get data()`) — anksčiau visas
masyvas lūždavo dėl vieno mirusio kelio iš senos scratchpad sesijos.
Seni failai: `art-pipeline/out/etsy-shots/_versions-12/`.

### ✅✅ Prekės ženklai — galutinė taisyklė (savininkas, 2026-09-02)

> „Mes kopijuojame kit toks koks yra. Jei Nike, tai Nike. Bet turi atitikti — tik nepadaryti
> išgalvotų brandų, kurie neegzistuoja. **Logotipas yra aprangos sportinė dalis.**"

Ženklas **nėra defektas niekur** — nei plokštelėse, nei pozose, nei kortelėje. Sprendžia
**atitikimas**: draudžiamas tik ženklas, kurio kliento aprangoje nėra (išgalvotas arba ne tas).
Todėl soccer `_kit-grade.json` FAIL lieka teisingas — ant marškinėlių **Joma**, o atleto
nuotraukoje **Puma**; klaida yra „ne tas ženklas", ne „yra ženklas".

Air Jordan (basketball), New Balance (baseball), Mizuno (volleyball) ir Nike (soccer) aprangos
plokštelėse bei pozose — **tvarkoje, nieko taisyti nereikia**.

⚠️ **Mano brokas ir jo atitaisymas.** Prieš gaudamas šią taisyklę paleidau
`art:fix` visoms keturioms soccer pozoms ir nutryniau Nike nuo batų bei kamuolio (4 generacijos,
~€1.16). Tai buvo brokas: apranga nustojo atitikti. Grąžinta per
`npm run art:approve -- --athlete soccer --frame <f> --version N` (hero/action2/action3 → 2,
back → 3); visi keturi failai patikrinti md5 — sutampa su originalais. Išvestiniai
(`*.cutout.png`, `*.onblack.png`), kuriuos foninis `art:cutout` spėjo perdaryti iš taisytų
pozų, perstatyti iš atkurtų originalų. Į Figma sporto failą nebuvo įrašyta NIEKO, tad kortelės
menas ir spaudos failai nebuvo paliesti.


### `02 · Choose your package` — tipografija sulygiuota su etalonu
Football 02 buvo pastatyta anksčiau ir atskirai (`641:127`, kai kitos yra `672:*`), o likusios
keturios nuo jos paveldėjo. Skirtumai nuo krepšinio:

| | etalonas (BKB) | penki klonai |
|---|---|---|
| antraštė 114 px | **Anton Regular** | Space Grotesk Bold |
| stulpelių antraštės 36 px (8 vnt.) | **Anton Regular** | Space Grotesk Bold |
| „FOUR WAYS TO OWN IT" 44 px | Space Grotesk **Bold** | Medium |
| paantraštė 46 px | Space Grotesk **Bold** | Medium |

Sutvarkyta perkeliant iš etalono `fontName`, `fontSize`, `letterSpacing`, `lineHeight`,
`textAlignHorizontal` ir poziciją į kiekvieną atitinkamą mazgą (poravimas pagal x + artimiausią y).
Po to visų penkių tipografijos parašas **sutampa su BKB simbolis į simbolį**: 51 teksto mazgas,
0 šrifto/dydžio skirtumų.

⚠️ Vienas dalykas, kurį pakeliui sugadinau ir ištaisiau: primetus etalono x/y, trys plytelių
ženkliukai („PRINT READY", „MOST GIFTED", „COLLECTOR") nustojo centruotis ant savo piliulių —
piliulės kiekvienoje sekcijoje stovi kelis px kitaip. Todėl jie **centruojami ant savo piliulės**,
o ne statomi į etalono koordinates. Likę „pos off > 3px" auditą reiškia būtent tai ir yra teisinga.

---

## 2026-09-03 — trys nauji kortelių listingai GYVI

| Sportas | Etsy | SKU |
|---|---|---|
| **Baseball** | **4567592965** | `GDE-BSB-CARD-{DIG,P12,P24,PACK}` |
| **Volleyball** | **4567597109** | `GDE-VBL-CARD-*` |
| **Soccer** | **4567599879** | `GDE-SOC-CARD-*` |

Visi trys: 20 nuotraukų, Physical, keturi `Package` variantai su per-variantiniu processing,
„US Print Lab - Free Shipping", Simple 30 d. returns, Bay Photo + QPMN, sekcija Trading Cards,
kategorija Artist Trading Cards. Video nėra nė viename (savininko sprendimas — vėliau).
Turinys pagal `SEO/ready/<sportas>-card.md`.

### Metodas, kuris pasiteisino
**Kopijuok gyvą listingą, nekurk iš nulio.** „Copy" perneša kategoriją, tipą, visus keturis
variantus su kainomis ir processing profiliais, siuntimo profilį, returns policy, gamybos
partnerius ir penkis personalizacijos laukus. Lieka pakeisti tik nuotraukas, antraštę, aprašą,
žymas, dviejų laukų pavyzdžius ir SKU. Baseball darytas iš football, volleyball ir soccer — iš
baseball.

### Trys spąstai, rasti gyvai
1. **Instrukcijos tekste leidžiamas TIK VIENAS žodis didžiosiomis.** `e.g. .341 AVG | 6 HR |
   28 RBI` atmestas („Your instructions cannot contain more than 1 capital word"), Done lieka
   pilkas. Todėl statistikos santrumpos rašomos mažosiomis, o vienintelis didžiųjų žodis —
   `N/A`. Tai KEIČIA `LISTING-COPY-PACK.md` §PERSONALIZATION kanoninę formuluotę, kuri siūlė
   `68 TACKLES | 4 SACKS | ALL-DISTRICT`.
2. **Redagavimo pieštukas ir trynimo šiukšliadėžė yra greta** (x≈1339 ir x≈1373). Nukirtus pro
   šalį laukas dingsta be perspėjimo. Atkūrimas: **Add field → „Recently used"** — Etsy saugo
   anksčiau naudotus laukus, tad tiksli kopija grąžinama vienu paspaudimu; tada nutempk į vietą.
3. **Volleyball eksportai buvo 4000×4000** (2× iš Figmos), po 5–7 MB, ir netilpo į kėlimo ribą.
   Sumažinta iki 2000×2000, q92 be chroma subsamplingo — ~0.6 MB failas be matomo kokybės
   kritimo. Baseball keltas originalais (2000×2000 jau buvo).

### Gyva kortelių eilė dabar — visi šeši sportai
Basketball 4562666649 · Football 4563878038 · Cheerleading 4564284709 ·
Baseball 4567592965 · Volleyball 4567597109 · Soccer 4567599879

⚠️ **Liko trijų gyvų senbuvių title/tags redagavimas** pagal `SEO/ready/*.md` §0 — bet tik po
to, kai nauji trys bus suindeksuoti (30 d. užšaldymo taisyklė).

---

## 2026-09-03 — poster listingo auditas (dar netaisyta)

Pilnas auditas ir planas: **`etsy/POSTER-LISTING-PLAN.md`**. Trumpai: poster eilė Figmoje
(`02 · POSTER LISTING`, BASKETBALL `880:896`) vis dar pasakoja rugpjūčio „tik skaitmeninis"
istoriją, o gyvas listingas 4562700100 nuo V3 parduoda tris spausdintus dydžius. Trys
prieštaravimai: 18 skaidrė „NOTHING SHIPS"; 17 skaidrė žada tik 18×24, o parduodamas ir 30×40 XL,
kuriam **nėra nei nuotraukos, nei spaudos failo** (diske 5475×7275 ir 7200×10800, 9000×12000 nėra);
niekur nerodomas spausdintas plakatas kaip daiktas. Sprendimas dėl XL — pirmas žingsnis.

## 2026-09-03 · Poster listing (BASKETBALL, section `880:896`) — build pass after owner review

Built in Figma, all on page `880:895`. Nothing exported, nothing touched on the live listing 4562700100 yet.

- **01 hero `880:1845`** — before-photo PAIR in the card etalon's diagonal layout (`880:1921` 288×384 @283,950 + `880:1922`
  305×408 @399,1220, arrow re-seated at y≈1289); `poster_art_live` `880:1860` got depth (two drop shadows + 3 px white
  edge at 38%) so the print reads as an object, not a flat.
- **02 matrix `886:220`** — four tiles rebuilt: DIGITAL = new monitor scene (`pkg-digital-poster`, ONE page in the reader,
  phone shows the lock wallpaper; Figma hash `e442d6cb…`); 18×24 = the print lying FLAT beside the kraft tube with the
  certificate under its corner (`963536671…`) — the first take had the poster warped onto the curled sheet and the owner
  called it "makaronas": **never map a print onto a curled sheet, paint it flat**; 24×36 / 30×40 = `pkg_photo_2/3`
  (`901:175`, `901:240`) — the poster HUNG on the wall at gallery height (centre 58 in), person = the ruler (170 px = 69 in),
  top of the print above the head as in life. Old card-listing rectangles `886:309`/`886:310` removed by id.
- **03 EV `886:317`** — five objects at one height (500): 18×24 (bottom-aligned, to scale) · 24×36 · certificate (`911:187`,
  true 0.773) · phone with the lock wallpaper on `886:344` (`888a62b9…`, screen children hidden) · the print rolled (band
  crop of `963536671…`). Fact block is now three spec cards (`spec_card_1..3`: PAPER / PRINTED BY / SHIPPING) + a one-line
  closer "WALLPAPERS INCLUDED — PHONE, TABLET + DESKTOP". Paper swatch + arrow hidden, not deleted.
- **04 scale sheet `880:1926`** — posters staggered 170 / 520 / 700, three size pills in one row (`size_pill_30` cloned),
  loupe left-aligned to the margin, pose markers on the three figures (680,772 · 833,790 · 1036,740), loupe anchor on the
  18×24 face, footer band centred between wordmark and page number.
- Audit (`findAll` over the 20 frames): no digital-only / 10-card / 25 text left; shared hashes are the expected ones
  (poster art across 01/02/04/10/17, before photo 01/13, person 02/04, finish tiles 06↔07/08/09, 13↔15).
- **Tooling**: `package_tiles.py --product poster` now uses `SCENE_MONITOR` (single page quad + phone quad fitted by
  `fit_dark_quads`) and takes `--wallpaper`; `gen-package-shots.ts` has the `pkg-digital-poster` job.
- ⚠️ `upload_assets` with `nodeIds` landed on 886:308 / 886:307 but silently MISSED 911:187 and 886:344 (same page) —
  the POST said success and the fill stayed old. Always read the hash back and set the fill by hash.

**Next**: owner sign-off on 01–04 → export 20 slides → replace images on 4562700100 → description/title/tag edits per
`POSTER-LISTING-PLAN.md` §5 → propagate to FOOTBALL `880:2153` and CHEERLEADING `880:2991`.
- **2026-09-03, second owner pass on 02/03**: size tiles redone as ROOMS (owner: the person and the empty wall say
  nothing at a glance — "daryk tuos plakatus tiesiog erdveje"). Generated `room-18x24` (desk) / `room-24x36` (bed) /
  `room-30x40` (sofa), placeholder wiped and the print hung at measured true size with `art-pipeline/lib/hang_poster.py`
  (ppi from the furniture: 12.2 / 8.3 / 9.4), tiles cropped to one shared px-per-inch (bed 0.681, sofa 0.771 of frame).
  Hashes `1cd3c2f9…` (886:308), `2bb943c3…` (901:175), `dc89180e…` (901:240). EV "THE PRINT, ROLLED" `886:338` is now
  the packaging shot `pkg-tube-rolled` (`66a8aa25…`, kraft tube + white cap + rolled print, no artwork → nothing to warp).
  The flat-print-by-the-tube composite (`963536671…`) is no longer used on 02/03.

## 2026-09-03 · Poster row extended to all six sports

The basketball poster section is now the etalon; five sections were built from it on page `880:895`.
Nothing exported, nothing touched on any live listing.

| Sport | Section | Lead finish (poster) | Card lead | Athlete |
|---|---|---|---|---|
| Basketball | `880:896` | Stadium Night | Stadium Night | Marcus Ellison #12 |
| Football | `946:175` | Heritage | Fire & Smoke | Tui Fa'agata #54 |
| Cheerleading | `960:175` | Signature Spotlight | Prism Rush | Amara Boyd |
| Soccer | `969:175` | Fire & Smoke | Chrome All-Star | Mateo Herrera #10 |
| Volleyball | `969:1777` | Prism Rush | Signature Spotlight | Jaslene Ocampo #5 |
| Baseball | `969:3420` | Chrome All-Star | Heritage | Casey Whitlock #7 |

Every finish now leads exactly one poster listing, and no sport's poster shares its card's lead finish.

**How each section was built** (repeatable): clone the basketball section → swap per-sport image hashes
(football/cheer from their own archived poster sections, the other three by cloning slides 12–16 out of that
sport's CARD section, which keeps sprite CROP transforms intact) → flatten the eight live basketball poster
composites and fill them with the sport's flat lead-finish art → upload the package tiles, the six finish
posters, six room shots, the certificate and the phone wallpaper → text swap (sport, athlete, team, position,
card-ID prefix, lead finish) → face-measured crop for the "TRUE 300 DPI" loupe (`art-pipeline/lib/face_crop_box.py`).

**Old sections kept, renamed** `ARCHIVE 2026-09-03 · FOOTBALL (pre-rebuild)` (`880:2153`) and the same for
CHEERLEADING (`880:2991`). Delete them only after the new rows are exported and live.

### Three defects found and fixed while building
1. **The text swap renamed the style labels.** Mapping `STADIUM NIGHT → <lead finish>` also hit slides 06–09,
   where the six finishes are named on purpose, so "FIRE & SMOKE" sat above "SOFT SILVER FOIL". Labels restored
   from the etalon; the later sections skip slides 06–09 during the swap.
2. **Slide 17 showed trading cards in a POSTER listing.** The proof now shows poster + certificate + wallpaper,
   which is what a poster order actually delivers. Fixed on all six, basketball included.
3. **The refund line sat on the proof's own footer strip** on every section — moved to y 1706, clear of both.

### Open, and needing the owner's decision
- **No 2:3 poster art exists per sport.** 18×24 and 30×40 are both 3:4; 24×36 is 2:3 and only basketball has it
  (Stadium Night, Chrome All-Star, Fire & Smoke). Every 24×36 tile in the five new rows is a centre CROP of the
  3:4 art. Before a 24×36 print ships, that size needs its own composition per sport and finish.
- The scale sheet's ruler figure is not at the posters' px-per-inch on the basketball etalon either; the new
  sections match the etalon's look rather than re-deriving it.

### 2026-09-03, third owner pass on the poster row
- **Scale-sheet ruler is now the athlete FROM BEHIND on all six** (owner: like volleyball and baseball).
  Basketball, football, cheerleading and soccer took their own `back.cutout.png`. The ruler is scaled by
  **body height (head to feet), not image height** — a raised-arm pose (jump shot, celebration) is taller than
  the body, so scaling by the image would shrink the athlete and lie about the print size. Tool:
  `art-pipeline/lib/ruler_from_cutout.py` (crops to one 0.33-wide column so the six rulers read as one system,
  prints `body_h`); node height `H = 1540 · image_h / body_h`, feet on a shared floor line (bottom 2277,
  right edge 2046). Cheer's pom-poms had to be cropped above the head — a sliced pom reads as a floating blob.
- **Six interiors, one per finish**, replacing the three plain rooms on slides 07-09 (owner: too similar, and
  they did not show the poster in a matching interior). New `gen-package-shots.ts` jobs `int-SN` (navy bedroom),
  `int-CA` (pale grey living room), `int-FS` (brick garage gym), `int-HE` (green panelled study), `int-SS`
  (oak reading nook), `int-PR` (dark game room with an LED strip). Props are sport-neutral on purpose — the
  first SN take had a basketball on the rug, which is wrong in five of six listings.
  Applied to soccer, volleyball and baseball; football, cheerleading and basketball keep their own per-finish
  room mockups. Placeholder rectangles are found with the flat-region fit (`fit_placeholder.py`), then
  `hang_poster.py` wipes the placeholder and places the print by measurement.

### 2026-09-03, fourth owner pass
- **Ruler figures are now at TRUE scale.** They were 22% too tall: the sheet's posters run at 18.2 px/in, so a
  5'9" athlete is 1258 px of body, not the 1540 px inherited from the old node. Every ruler is now sized
  `H = 69 · ppi · image_h / body_h`, feet on the poster baseline, and the WHOLE figure is kept — a cropped arm
  reads as a defect (owner). Cheerleading's from-behind frame is a pom-pom celebration whose arms cannot fit
  above the baseline at true scale, so it got its own standing, arms-down ruler frame
  (`gen-package-shots.ts` job `ruler-cheer`, generated from her identity-back + kit plates). That frame is for
  the listing only — the athlete's approved 8-frame set is untouched.
- **Slide 05 is a lifestyle photograph now** (owner: a room with nobody in it says nothing). New jobs
  `life-<sport>` put the athlete at home in ordinary clothes — lacing a shoe, eating cereal, homework, oiling a
  glove — with a black placeholder on the wall behind, then `hang_poster.py` places that sport's lead-finish
  print. Built for cheerleading, soccer, volleyball and baseball. **Basketball and football keep their earlier
  room shots** (`ca2c4c…`, `288456…`) — the owner had already approved those, and the generated pair sat the
  print too close to the athlete's head.
  ⚠️ The first basketball attempt pulled `print-sources/output/stadium-night/GDE-SN-poster-TRIM` — that is the
  MASTER file's art and shows **Nia Brooks**, not Marcus. Poster art for a sport comes from that sport's own
  Figma file (basketball `fgueg7sV11zKnV1hir1Zsg`, node `38:2`), never from `print-sources/output/`.
- ⚠️ **The two ARCHIVE sections are gone from the page** (`880:2153` football, `880:2991` cheerleading). The
  football room shot survived only because a copy sits in `CHEER POSTER ART / upload plates`, and basketball's
  had to be recovered from page `02 · Digital POSTER LISTING`. Nothing else is known to be lost.
- **Slide 05, third take.** The generated lifestyle photos hung the print at head height and the two collided,
  and a flat paste stayed razor sharp on a photograph with shallow depth of field — which is exactly what reads
  as fake. Fixed in three moves: (1) `life2-<sport>` re-shoots the room with the person LOW and to one side and
  the print high on the opposite wall, with a wide gap; (2) `lifeart-<sport>` lets the model print our artwork
  onto that placeholder, which lands the room's light, softness and perspective; (3) `art-pipeline/lib/print_on_wall.py`
  keeps that light and throws the model's lettering away — it wipes the rectangle the render changed and puts
  OUR pixels back, multiplied by the render's low-frequency light field and softened to the wall's focus.
  **Step 3 is not optional**: the model re-spelled "THIS IS MY PITCH" as "PITEN" and "KESTRELS" as "AESTRELS",
  and on an earlier take "HERRERA" as "HAMRERA". Never ship type a model has redrawn.
- The cheer ruler needed the real matte (`art-pipeline/lib/matte.py`, BiRefNet) — a colour key left grey
  backdrop around her legs. It is slow to load; run it and wait rather than keying by hand.
- **Slide 05 prints are FRAMED** (owner, 2026-09-03): a slim matt black moulding with a narrow white mat, hung
  level with a shadow under the lower edge — it reads as a hero photograph rather than a poster taped to a wall.
  The frame and mat are photographed, not drawn: the `life2-<sport>` scene generates the framed picture with a
  black rectangle inside the mat, and `print_on_wall.py` replaces only that inner rectangle with our pixels.
  Basketball and football keep their earlier unframed room shots, as the owner asked — say so before matching them.
- ⚠️ **`png()` in `gen-package-shots.ts` was eager.** The JOBS array is built at module load, so deleting a
  `life2-*.png` in order to regenerate it made the whole file fail to parse — including the job that writes it.
  It is lazy now (a getter), the same fix `gen-etsy-shots.ts` already carries.
- **Slide 05, fourth and final take — the print is the HERO** (owner: weak compositions, poor rendering).
  One generation per sport instead of two, and no model pass over our type at all:
  `gen-package-shots.ts` job **`hero05-<sport>`** shoots the framed picture as the SUBJECT — upper two thirds,
  half the frame width, camera square to the wall — with the athlete as the second read, smaller, softer, to
  one side, never touching it; then **`art-pipeline/lib/frame_insert.py`** finds the black placeholder's FOUR
  CORNERS, perspective-warps our artwork to fill the mat exactly, and multiplies it by the light field read off
  the placeholder itself. Corners, not a bounding box: a frame photographed even slightly off-axis is a
  quadrilateral, and a rectangle fit leaves mat slivers down one side.
  This supersedes the `life2` + `lifeart` + `print_on_wall.py` route (kept in the file, no longer used for 05).
  Two prompt rules the model needs spelled out: the placeholder must be described as TALLER THAN WIDE in words
  (it returned squares twice), and "no other picture, poster or frame anywhere on any wall" (it hung its own).
- **Mat or no mat is a per-listing choice** (owner, 2026-09-03). The hero05 prompt asked for a generous white
  mat, which the owner questioned — a mat shrinks the art and reads as a print stuck on paper. Soccer and
  baseball were re-shot with **no mat**: the print runs edge to edge and fills the whole frame opening.
  Cheerleading and volleyball KEEP their matted versions (owner: leave them). So slide 05 now carries both
  looks on purpose; the `hero05-<sport>` prompt currently says NO MAT — put the mat sentence back if a future
  sport should match cheer or volleyball.


## 2026-09-03 · COMPLETE SET rebuilt as the V3 "hero max" listing (page `61:504`)

The 2026-08-25 plan was written for a digital-only set. The set has been LIVE as Physical since 2026-09-01
(4562711454: Digital Complete Set · Printed Set 12 cards + 18×24 + cert · Deluxe 24 cards + 24×36 + cert ·
Ultimate + sealed foil pack, 2–3 wks). The page now carries the same 20-slide spine as the approved poster row.

| # | Slide | Node | Origin |
|---|---|---|---|
| 01 | HERO — the whole set | `236:128` | kept (owner's hero); badge PRINTED / OR DIGITAL / FREE CERTIFICATE · FREE US SHIPPING |
| 02 | The card in hand. The poster on the wall. | `242:3349` | kept — the set's "product in life" slot (card row 02–03 / poster row 02) |
| 03 | Three sizes, to scale | `1079:333` | clone of the poster-row scale sheet (Marcus) |
| 04 | One athlete, six finishes | `228:213` | kept |
| 05 | Everything you get — counted | `240:127` | kept; eyebrow "YOUR SET — DIGITAL OR PRINTED", bonus badge 5→**6** (2+2+1+9+7+1+6 = 28) |
| 06 | Choose your package | `1079:169` | clone of the poster-row matrix; 4 set tiers, set tiles via `SET_TILES_DIR` |
| 07–09 | Style pairs | `228:407` `228:559` `228:728` | kept |
| 10 | Every field is yours | `228:901` | kept |
| 11 | How to order — digital or printed | `1079:623` | clone of the poster-row how-to; set copy |
| 12 | What photos to send | `226:394` | kept |
| 13 | We get the likeness right first | `226:292` | kept |
| 14 | One athlete, consistent in every shot | `226:351` | restored from the archive (the hero rows carry it at 14) |
| 15 | Their uniform, their number | `226:323` | kept |
| 16 | Your club's crest | `226:430` | kept |
| 17 | You approve it before it's final | `226:466` | kept + refund line |
| 18 | One every season | `1079:674` | clone of the shared age row |
| 19 | Made for the moment | `1089:169` | clone from the poster row; "One set turns the season…" |
| 20 | Seventeen sports | `226:230` | kept (the sport picker doubles as the cross-sell grid, as on the hero rows) |

**Order = the hero rows' order, slot for slot** (owner, 2026-09-03: the set had been laid out to my own logic;
the card and poster rows had since been re-sequenced — hero → product in life → scale/second view → six finishes →
everything you get → choose your package → style pairs → every field → how to order → photos → likeness →
consistency → uniform → crest → approve → one every season → made for the moment → seventeen sports).

Archived below the row at y 3000, renamed `ARCHIVE 2026-09-03 · …` (not deleted): Four sports · Where it lives ·
Registered · DIGITAL FILES ONLY — NOTHING SHIPS · Transformation · the object-EV clone (poster/cards/cert/phone +
print facts — worth a second look if a slot ever frees up). Sweep for digital-only / nothing ships /
instant download / "10 collectible" over the 20 live slides: **0 hits**.

**Set tiles** (`etsy/listing-images/04-complete-set/v3/tile-{printed,deluxe,ultimate}.jpg`): the Senior Night
recipe reused unchanged on the SR blank plate scenes — poster warped in exactly (`plates_composite`), cards and
pack printed by the model, poster pasted back. The pack front is the count-neutral `pack-front-panel.png`
(**18** cards); `print-sources/output/stadium-night/GDE-SN-booster-pack-FLAT` still says **10** and shows the
master's art — never use it on a listing. Both scripts now take `SET_TILES_DIR`; `sr_set_tiles.py` picks
`src/poster-2x3.png` for a 2:3 plate when it exists (basketball has one).

**Not done, on purpose:** nothing exported, nothing touched on the live listing. Next: owner sign-off → export
20 → replace images on 4562711454 → description/title per `etsy/SEO/` (title from the V3 handoff:
"Custom Sports Poster & Trading Card Set | Athlete Gift From Photos | Printed or Digital").

### 2026-09-03 · Complete Set — the three "missing" slides, folded back in without leaving the hero spine
- **07–09 are now two SPORTS per slide** (owner: how to say sports + finishes + both products at once): the finish
  pairs stay (SN+CA · FS+HE · SS+PR) but each row is a different sport in its poster-lead finish — basketball SN ·
  baseball CA / soccer FS · football HE / cheerleading SS · volleyball PR. Six sports, six finishes, poster + card
  front + back each, every finish exactly once; the sport name sits under each finish chip. Cards are the sport's
  own 12-card sprite (hash + CROP window copied from that sport's card row), posters the flat lead-finish art.
  The athlete-specific bonus minis (cutout · badge · sticker) on those slides are HIDDEN, not deleted — the bonus
  is shown properly on 05. "Four sports. Four art styles" is redundant now and stays archived.
- **05 counted carries the print facts** as one 34 px line under the pill (matte 189 g/m² poster · UV-coated card
  stock · tube + mailer · free US shipping) — the objects-EV slide stays archived.
- **18 = Where it lives — social & screens** (restored); "One every season" archived (owner's pick over 19).
- ⚠️ **Football card row defect, found and fixed in both places:** the football 12-card sprite (`01251d…`) has a
  ZOOMED Heritage back in its 4th column — the card row's own slide 08 showed it. Both the card row (`636:1927`)
  and the set (`228:671`) now carry the flat HE back exported from the football file (`166:180`, square corners,
  hash `3adc702b…`). The sprite cell itself is still wrong; anything else that crops it will show the defect.

### 2026-09-03 · Complete Set — opening re-cut to the hero rows' logic (owner: hero → what you get → emotion → styles → everything → package)
| # | Slide | Node | Change |
|---|---|---|---|
| 01 | HERO — the whole set | `236:128` | **new backdrop**: sport-neutral stadium tunnel at night (`gen-package-shots.ts` job `hero-bg-set`, budget raised to €30 for the one image) + the four athlete cut-outs re-composed on it (`v3/hero-plate-tunnel.jpg`, on `248:130`). The old blue-bokeh composites `image 2` `242:3399` and `image 1` `242:3396` are HIDDEN, not deleted. The product layers (poster, cards, certificate, phone, laptop) were separate all along and stay. |
| 02 | What you get — poster, cards, certificate | `1079:266` | restored objects-EV, re-pointed to **football/Heritage** so it continues the hero (poster `f6a08d`, HE front sprite crop, HE back `3adc70`, cert `8e49a4`, wallpaper `2d4ec7`) |
| 03 | The card in hand. The poster on the wall. | `242:3349` | emotion slot |
| 04 | **Six sports. Six finishes.** | `228:213` | was "One athlete, six finishes" (six Marcus cards, cramped): now six tiles = each sport's poster in its lead finish + that sport's card front overlapping; labels SPORT / FINISH |
| 05 | Everything you get — counted | `240:127` | print-facts line under the pill |
| 06 | Choose your package | `1079:169` | — |
| 07–20 | unchanged from the previous pass | | scale sheet `1079:333` archived (poster-only) |
Basketball now leads 05/06/10/13–17/18 only; hero (4 sports), 02 (football), 04 + 07–09 (six sports) carry the range.

### 2026-09-03 · Complete Set — Etsy thumbnail centring + final order (owner)
- **Hero re-centred for Etsy's 4:5 search crop** (safe zone x 200–1800, `LISTING-IMAGE-CANON.md`): headline/pill/sub
  now start at x 200, the PRINTED OR DIGITAL badge ends at 1800, the phone moved in from x 149, the laptop ends at
  1780, and the athlete plate was re-composed 10 % larger with every figure inside x 300–1826
  (`v3/hero-plate-tunnel.jpg`, hash `5e475b56…` on `248:130`).
- **02 and 04 said the same thing** (two product grids). Now: 02 = the objects (football), **04 = Where it lives —
  social & screens** (the set in real life), 05 = Six sports. Six finishes, 06 = package; **19 = Everything you get —
  counted** as the closing "there is a lot" beat, 20 = Seventeen sports. 18 = Made for the moment.
- **12 · What photos to send is the shared ANONYMOUS guide again** (clone of the poster row's `880:1161`, now
  `1108:169`); the Marcus version (`226:394`) is archived. Rule from `gde-listing-shared-vs-per-sport`: 12 never
  shows the listing's athlete, or 12 and 13 read as the same "before" photos.

### 2026-09-03 · slide 12 banner: the leading "C" was MISSING from the text itself
The photo-guide banner on `12 · What photos to send` read "LEAR FACE + CLEAR BODY" on the poster-row
etalon `880:1161` and on every clone made from it (football `946:440`, cheer `960:440`, Complete Set
`1108:169`, `184:1108`). It was not a clipping defect: the text node's characters literally started
with "LEAR" (a stray deletion on the etalon that every clone inherited). Restored with
`insertCharacters(0,"C")` on all five; the other 15 copies in the file were intact (`CLEAR`) and only
got `textAutoResize=WIDTH_AND_HEIGHT` + re-centred (visual centre unchanged, x 1000).
Rule: a clipped-looking first letter — read `characters` before touching the box.

## 2026-09-04 · SENIOR NIGHT master (`571:229`) + FOOTBALL (`936:129`) re-cut to the Complete Set V3 spine

Owner: "perdaryk senior night tų pačių skaidrių išdėstymą ir logiką pagal complete set". Both sections on page
`03 · SENIOR NIGHT Set` (`2:3`) now carry the V3 order (hero → what you get → emotion → where it lives → range →
package → product detail → every field → how to order → photos → process → made for the moment → counted → sports).
Retired slides are NOT deleted: section `ARCHIVE 2026-09-04 · SENIOR NIGHT master (pre-V3)` (`1138:127`, page y 5700).

| # | Master (any sport) | Node | Football (sport-locked) | Node |
|---|---|---|---|---|
| 01 | HERO — product group scaled 0.9 about (640,1900) so poster + certificate sit inside Etsy's 4:5 crop; counter ends at 1780 | `503:127` | same treatment | `936:130` |
| 02 | WHAT YOU GET — objects (clone of CS `1079:266`, football SR: poster `c30c3d`, front `84b1aa`, back `788926`, cert `fb0d58`, phone wallpaper `f36f08a5` uploaded) | `1138:132` | clone | `1152:127` |
| 03 | ONE LAST HOME GAME (gift handover, was 02) | `577:230` | gift on the field | `936:152` |
| 04 | WHERE IT LIVES — social & screens (clone of CS `226:732`; poster-on-wall `a2fefa`, phone-in-hand `cdcd74`, desk-monitor `16b117`, card-on-desk `1860ee`, all CROP) | `1138:199` | clone | `1152:194` |
| 05 | ANY SPORT. ONE EDITION. (clone of CS `228:213`: 5 SR sports poster + card front, tile 6 = "+12 MORE SPORTS") | `1138:233` | ONE SET PER SENIOR (team order, was 06) | `936:359` |
| 06 | CHOOSE YOUR PACKAGE (was 03) | `907:187` | was 03 | `936:160` |
| 07 | FOOTBALL + BASKETBALL — poster, front, back per row (clone of CS `228:559`) | `1138:271` | FOOTBALL + THE BACK (front/back + quote) | `1152:228` |
| 08 | VOLLEYBALL + SOCCER (clone of CS `228:559`) | `1138:395` | ONE SENIOR. ONE EDITION (case, was 09) | `936:495` |
| 09 | CHEERLEADING + THE BACK — row 2 = the senior quote block from old SN-08 (clone of CS `228:728`) | `1138:519` | NUMBERED. REGISTERED (was 10) | `936:506` |
| 10 | EVERY DETAIL IS YOURS (was 07) | `499:1606` | was 07 | `936:414` |
| 11 | HOW TO ORDER — chip now "SENIOR NIGHT HAS A DATE / files 1 week before · printed sets 2 weeks · sealed pack 3–4 weeks" (old 17 TIMING folded in) | `907:284` | same edit | `936:548` |
| 12 | WHAT PHOTOS TO SEND — anonymous guide (clone of poster-row `880:1161`) | `1138:646` | clone | `1152:359` |
| 13 | LIKENESS | `499:363` | | `936:636` |
| 14 | YOUR PHOTOS → THEIR EDITION (was 12) | `580:233` | | `936:600` |
| 15 | UNIFORM (was 14) | `499:394` | | `936:667` |
| 16 | CREST POLICY (was 19) | `499:1570` | | `936:960` |
| 17 | APPROVAL (was 16) | `499:1719` | | `936:731` |
| 18 | FOUR SENIORS (was 05 — the "made for the moment" beat) | `499:211` | | `936:352` |
| 19 | EVERYTHING YOU GET — counted (was 04); eyebrow "YOUR SET — DIGITAL OR PRINTED", bonus badge 5→**6** | `499:2061` | | `936:262` |
| 20 | SEVENTEEN SPORTS — picker copy from CS 20 (old "want just the card or poster" was false: 03b/03c are parked) | `499:217` | cross-sell to other SN sets (keep; gate: those listings are not live) | `936:996` |

Archived (master): SN-06-SPORTS `499:156`, SN-08-STORY `560:229`, SN-09-ONE-OF-ONE `556:229`, SN-10-REGISTRY `499:2019`,
SN-15-PHOTO-GUIDE `499:1534` (showed Tui = the listing's athlete), SN-17-TIMING `562:229`, SN-18-PRINT-SIZES `566:229`.
Archived (football): STORY `936:468`, TIMING `936:878`, SIZES `936:929`, old photo guide `936:695`.

Uploads (basketball SR art was not in the listing file): `sr-poster.png` → `53450e31…`, `sr-card-front.png` →
`0012ed26…`, `sr-card-back.png` → `a8eba559…`, `ftb-sr-wall-phone.png` → `f36f08a5…` (the `nodeIds` targeting missed
again — fills set by hash from the POST response).

**Traps that cost a round each (all mechanical now):**
- A `use_figma` run that throws is rolled back ENTIRELY — not only the failing line. Re-run the whole job, idempotently.
- `findAll` by `characters` after editing: snapshot `[node, characters]` first, or the chip you just renamed to
  "SOCCER" is matched by the next `^SOCCER$` lookup (label vs chip).
- Selecting "posters" by width picks nodes inside HIDDEN groups; filter by name (`^poster`, `^REAL`) + ancestor visibility.
- Text boxes: `resize()` AFTER `textAutoResize="HEIGHT"` resets it to NONE with a 10 px box. Resize first, then set HEIGHT.
  While those 10 px boxes existed the MCP screenshot of that slide failed ("unexpected error"); fixing them fixed it.
- The row-chip background is a RECTANGLE named `cert_badge` (540×68); refit = text width + 2×36, text x = rect x + 36.
- The sub line on 05 is Anton-sized: keep it under ~85 chars or it runs past x 1850.

Not done: nothing exported, nothing on Etsy touched (4564565764 live; 03d not published). Per-sport SN sets (volleyball,
baseball, cheerleading, soccer) are the next stage — see `docs/SENIOR-NIGHT-SET-PLAN.md` §3 for the per-sport debt
(certificate/social/wallpapers/bonus exist only for basketball and football; baseball has no SR art at all).

## 2026-09-04 · VOLLEYBALL Senior Night SET — section `1161:127` built (V3 spine), SR page in the volleyball file completed

**Volleyball file `S8kqmhvEB5QNG8sbjgxQnF`, page `Senior night` (`5019:146`)** — sections 02–05 now exist (they were
section 01 only): `01 · HERO & TEMPLATES` `5035:402` (the three masters wrapped), `02 · PRINT READY` `5035:403`,
`03 · SOCIAL` `5035:938`, `04 · WALLPAPERS` `5035:1323`, `05 · DIGITAL BONUS` `5035:1538`. Recipe = the football one
(SENIOR-NIGHT-PROGRESS.md §7/§9), scripted this time: clone the Prism Rush sections → replace every card/poster replica
with a clone of the SR masters (13 cards + 3 posters, found by `#card_bg`/`nameplate` + aspect) → sweep the derived
layouts: PR bg `87e893b3` → SR bg `f30116fe` (19 fills), PR fonts → Playfair Display Black / Oswald with a measured
refit (Audiowide ×1.18, Orbitron ×1.20, Chakra Petch ×1.20; 96 texts), cold paints → warm dark (lum < 0.32) or gold
(283 paints incl. strokes/effects), `*_echo_*`/rim/flare hidden (74), prism `style_glyph` deleted (15), PRISM RUSH →
SENIOR NIGHT (6), GDE mark gold (SR exception). Die-cuts came from the FOOTBALL file as SVG (`download_assets` svg →
`upload_assets` → vector tree; outlined type deleted and re-set as live Playfair/Oswald text with Jaslene's name/number):
sticker `5040:382`, badge `5040:387`. Count-neutral: pack `5035:566/574`, certificate `5035:628` (+ card id → SR, edition
→ SENIOR EDITION · 1 OF 1, class → 2026). QR: **all 9 QR nodes carried the basketball SN QR (`1f81f205`)** — replaced
by the new `GDE-SR-VBL-2026-05` QR (`850f08dc…`, registry entry added, `npm run qr:gen`).
Exports in `etsy/listing-images/03-senior-night/src/vlb-sr-*` (cert, social grid 1, phone/desktop wallpapers, sticker,
badge, flip front/back, proof, pack flat + count-neutral front panel). The MCP screenshot of the MotionSpec frame fails
(tiny 10 px texts inside the scaled card previews) — `exportAsync` works; not needed for the listing.

**Per-sport scenes** live in `art-pipeline/out/etsy-shots/senior-night-volleyball/` (`SR_SCENES_DIR` / `SET_TILES_DIR`
env overrides added to `sr_sport_scenes.py`, `gen-sr-sport-scenes.ts`, `gen-sr-package-shots.ts`; new
`lib/sr_scene_composite.py` = one plate by shape + `plates_composite.py`). No-cost composites: poster-on-wall,
card-on-desk, card-in-case, team-order (staged stack), phone-in-hand + desk-monitor (plate quads via `fit_plates.py`
/ the shape finder, wallpaper pre-cropped to the plate's aspect — the monitor plate is 1.445, not 16:9).
Generated (7 images, ≈ €1.3 at the ledger rate; monthly cap raised to €32 for these): `gift-volleyball` (gym, Jaslene +
mother; the model printed **7** on the jersey → fixed with the new `art-pipeline/fix-scene.ts` one-change edit, not a
re-roll), `sr-digital`, set tiles printed/deluxe/ultimate (2:3 plates get `src/poster-2x3.png` = side crop of the 3:4).

**Listing section**: clone of the football V3 section (`936:129` → `1161:127`, page y 8500) with 64 image fills swapped
by hash map (poster/front/back, cert, wallpapers, 4 before photos, identity + kit plates, crest, 7 scenes, 4 tiles,
die-cuts, 4 cutouts) + the 14 counted-slide thumbnails set as individual FILLs (the football atlas `d13ff0` is not
reusable across sports) + 10 text swaps (name, sport, #5, Outside, Fox Hollow Anchors, card id). JSON:
`etsy/listings/03e-volleyball-senior-night-set.json` (SKUs `GDE-VBL-SNSET-*`), not published.

## 2026-09-04 — poster row + set REBUILT LIVE (photos, copy, tags, SKUs) and three new poster listings

Done by Claude through the Chrome extension (owner's request: "tavo darbas pakeisti nuotraukas ir
sužiūrėti SEO tekstus"). Source images: `Exportai Etsy/<listing>/01…20.jpg` (Figma order after the
2026-09-02 reorder: HERO → WALL → SIZES → SIX FINISHES → EVERYTHING → PACKAGE → …), downscaled to
2000 px / q92 (~0.6 MB) before upload.

| Listing | Etsy ID | What changed |
|---|---|---|
| Cheerleading Poster | 4564287163 | 20 photos, title, V3.1 description (2 videos kept) |
| Football Poster | 4564301710 | 20 photos, title, V3.1 description |
| Basketball Poster | 4562700100 | 20 photos, title, V3.1 description, tags (5 out / 5 in per POSTER-LISTING-PLAN §5), SKUs `GDE-BBALL-POST-*` → `GDE-BKB-POST-*` (2 videos kept) |
| Complete Set (any sport) | 4562711454 | 20 photos, title (`… and Trading Card Set | Personalized Athlete Gift | Printed or Digital`), tags (8 out / 8 in), OUR PROMISE proof sentence + shipping timing line, SKUs `GDE-SET-*` → `GDE-ANY-SET-*` (1 video kept) |
| **Soccer Poster** | **4568359117** | NEW — copy of football, `GDE-SOC-POST-*`; the copied football video was removed in a second publish |
| **Volleyball Poster** | **4568365063** | NEW — copy of football, `GDE-VBL-POST-*` |
| **Baseball Poster** | **4568369175** | NEW — copy of football, `GDE-BSB-POST-*` |

Copy for every poster: `etsy/SEO/ready/v3-posters/<sport>-poster.md` (title 13 words no repeats,
13 tags, V3.1 description: digital = TWO files 18×24 + 24×36; 30×40 XL = printed package only;
OUR PROMISE with the proof/refund sentence; SHIPPING with 1–2 d digital / 5–7 d print — matches
slide 11). Personalization fields 4/5 per sport (one all-caps word max).

### Editor mechanics that worked (new listing editor, 2026-09)
- **Photo tiles**: the Delete icon is a `<button>` linked to a portaled tooltip via `aria-describedby`;
  find tooltips with text `Delete`, resolve `button[aria-describedby~=id]`, `closest('.le-media-grid__item')`,
  classify by `img.alt` (`Primary listing image` / `Edit Listing image N`; videos have no such alt —
  their delete tooltip reads `Delete video`). Click from the LAST tile backwards, 500 ms apart.
  "**Delete all**" (button, confirm dialog "Delete all photos and video?") wipes photos AND videos in one go.
- **Upload**: `input[name=listing-media-upload]` exists only while there is room; it is re-created after
  every batch → give it an `aria-label` (MutationObserver keeps re-labelling), `find` it, then
  `file_upload`. **≤10 MB per message** (the cap is per tool call/message, not per file) → 8 files ≈ 5 MB
  per call, 20 files = 3 calls. Files land in array order. Empty grid shows a different uploader
  (`input[type=file]` without name).
- **Title / description / SKU**: `form_input` on the textarea/inputs is accepted by React (unsaved-change
  counter increments). **Tags**: click the tag input, type the comma line, click **Add** — on one copy
  page typing did not register; setting `value` via the native setter + `input` event, then clicking
  Add, did.
- **Personalization instructions**: pencil is at x≈1338 (full-res), trash at x≈1374. Dialog's Done must
  be clicked INSIDE the visible `[role=dialog]` (JS: find Done there, `!disabled`, click); a stale
  Done ref or a coordinate click silently does nothing. Verify by counting the example string in
  `body.innerText` outside the dialog.
- **Copy**: the header "Copy" link opens a NEW tab at `/listing-editor/copy/<id>`; the copy carries
  photos, VIDEO, tags, variants, SKUs, personalization → delete the inherited video or it ships on the
  new sport. Publish = "Publish copy with changes" → fee dialog (USD 0.20) → "Publish".
- JS results must not contain URLs with query strings (the tool blocks them as "Cookie/query string data").

## 2026-09-04 · CHEERLEADING (`1168:127`) and SOCCER (`1168:1140`) Senior Night SET sections built — same recipe as volleyball

SR pages completed in the sport files (sections 02–05 + die-cuts + QR): **cheerleading** `XDd1HUvmnxW2YNEbA6nlNK`
page `4022:146` → sections `4034:403/938/1323/1538`, die-cuts `4036:382/387`, QR `GDE-SR-CHR-2026-01` (`60f02eeb…`);
**soccer** `zH80jD1o3jSMvFePyrtTG1` page `5015:146` → `5027:403/938/1323/1538`, die-cuts `5029:382/387`, QR
`GDE-SR-SOC-2026-10` (`978fb36d…`). Both had the basketball SN QR on all 9 QR nodes and CLASS OF **2029** on the
certificate — fixed. Cheer is numberless: the sticker seal and the medal carry the class year **26** (decision, not a
number the athlete owns). Registry entries added for both; `npm run qr:gen`.
Exports: `etsy/listing-images/03-senior-night/src/{chr,soc}-sr-*`. Scenes: `art-pipeline/out/etsy-shots/senior-night-{cheerleading,soccer}/`
(gift in the gym / on the pitch, digital tile, set tiles ×3, poster-on-wall, card-on-desk, case, team order, phone,
desktop). Listing sections = football V3 clone + 64 image swaps + 14 thumbs + 10 texts each (cheer: "#54 · OFF. LINE" →
"FLYER", pronouns → her). JSON: `03f-cheerleading-senior-night-set.json` (SKU `GDE-CHR-SNSET-*`),
`03g-soccer-senior-night-set.json` (`GDE-SOC-SNSET-*`). Not published. Generation spend for the three sports ≈ €4 at
the ledger rate (gift ×3 + one fix, digital ×3, set tiles ×9); monthly cap raised to €36 for these runs.

**Trap:** zsh does not word-split `$VAR` in `for f in $FILES` — the first upload loop POSTed one bogus request and
nothing else. Use `${=FILES}` (or bash). Two upload batches were lost to it before the fix.

## 2026-09-04 · BASEBALL Senior Night SET (`1170:127`) — SR page built from nothing, by transfer

Baseball had **no SR art at all**. Instead of re-theming its Prism Rush section 01 (that path never produces the
pennant frame, the plaque or the career-highs back), the three **volleyball SR masters were transferred** into the
baseball file `tL9vfpIhC5esFbXcozgAlT`, new page `Senior night` (`4100:146`):
1. `download_assets` SVG of the volleyball masters (12 MB each — over the 10 MB upload limit because Figma embeds every
   raster as base64) → the `<image>` elements were stripped to plain rects with a python regex (79–228 KB) → `upload_assets`
   as SVG → editable vector trees with **layer names intact** (`#background`, `#photo_main`, `nameplate`, `banner_*`…).
2. Each import was rebuilt into a real frame at artboard coordinates (the base `Vector` gives the origin; `Clip path
   group` wrappers unwrapped), outlined type + PR echoes deleted by name, Casey's images set by layer name (`#background`
   → the new baseball SR background `art-pipeline/out/backgrounds/senior-night/baseball.png` from `art:bg --finish
   senior-night --sport baseball`; `#photo_main/#photo_2/#photo_3/#back_photo` → the four baseball cutouts, which are
   the same 1696×2528 as every athlete's, so the plate geometry needed no change; `#team_logo` → crest; `#card_qr` → the
   new `GDE-SR-BSB-2026-07` QR). Effects/opacity/blend re-applied by name (hero_glow SCREEN, photo shadow 55/0.55/y24,
   sparkle shadows, card_border drop+inner shadow, stitch/banner opacities).
3. Live type recreated from a props dump of the volleyball masters (font/size/spacing/fill/box per text — three
   `use_figma` dumps of ~1.9 KB each) with Casey's strings (poster: ghost 7, ONE LAST HOME GAME, CASEY / WHITLOCK, meta
   row laid out sequentially; back: career highs AVG .341 / HR 6 / RBI 28 from the registry, profile, career line,
   quote, id). `WHITLOCK` at 149 px wrapped in 760 px → shrunk until it fits (never abbreviated).
Masters: poster `4103:146`, FRONT `4103:147`, BACK `4103:148`. Then the standard recipe: sections `4111:383/918/1303/1518`,
die-cuts `4114:259/264`, QR swap, class 2026. **Pack trap:** the baseball PR pack's `finish_texture` and `flap_pinstripe`
images are NOT the PR poster background hash, so the bg sweep left the pack neon — every non-logo image in a pack must be
re-pointed explicitly (fixed, pack re-exported, Ultimate tile regenerated with the count-neutral panel).
**Copy trap found late:** every PR-derived pack says "A single edition of ten." on the back panel — count-bearing. Fixed in
volleyball, cheer, soccer and baseball (`A single numbered edition.`); check football/basketball SR packs too.
Exports `etsy/listing-images/03-senior-night/src/bsb-sr-*`; scenes `art-pipeline/out/etsy-shots/senior-night-baseball/`
(gift on the diamond; the first composite left the plate black — `sr_scene_composite.py` with tol 0.2 found it).
JSON `03h-baseball-senior-night-set.json` (SKU `GDE-BSB-SNSET-*`), slide 20 copy "EVERY SPORT HAS ITS OWN SET" (spring
sport, not fall). Not published.

## 2026-09-04 (later) — Senior Night row LIVE: set rebuilt + five per-sport SN sets

Source images `Exportai Etsy/SN complete set|SN Football|SN volley|SN cheer|SN soccer|SN baseball/` (20 each,
owner's export; 01 HERO → 02 WHAT YOU GET → 03 EMOTION → 04 WHERE IT LIVES → …). Copy:
`etsy/SEO/ready/v3-sn/<sport>-sn-set.md` — V3.1 physical description: **28 files in every package**
(the live text had said "20 files in total" while slide 19 counts 28), OUR PROMISE proof/refund sentence,
1–2 d digital / 5–7 d print timing, print facts from slide 02 (189 g/m² matte, UV square-cut cards, tube +
rigid mailer), rush line under ORDER 5–7 DAYS. Per-sport: opener + `BUILT FOR <SPORT> SENIOR NIGHT`
section, no ANY SPORT list, no "Choose the sport" step.

| Listing | Etsy ID | Notes |
|---|---|---|
| Senior Night Set (any sport) | 4564565764 | 20 photos, title without `&`, description, SKUs `GDE-ANY-SNSET-*`; tags unchanged (A5) |
| Football SN Set | **4568844304** | copy of the set; "Choose your sport" field deleted (4 fields left); field 4 example kept (Millbrook) |
| Volleyball SN Set | **4568846696** | title leads `Senior Night Volleyball Gift` (High-conv order); field 4 = Fox Hollow Anchors |
| Cheer SN Set | **4568849272** | numberless copy; field 4 = Vale Prep Vanguard |
| Soccer SN Set | **4568841851** | field 4 = Sunfield Kestrels; tags re-added by typing after the index bug below |
| Baseball SN Set | **4568844985** | field 4 = Harlow Creek Larks; tags composed (not in the pack): baseball gift/mom/dad gift, baseball poster, custom baseball card + senior family |

Every per-sport SN listing still carries the copied **"Choose your art style" (6 options)** field — the
decided rule is SR-only (no art dropdown); owner scoped this pass to texts/tags/title/photos, so it was
left as-is. Decide and delete on all six in one pass if the rule stands.

### Two new traps
- **Never click several "Delete tag" buttons synchronously.** React applies the deletions by INDEX after
  the event loop; the new tags added right after were then removed from positions 0–7 (soccer: 13 → 5 at
  publish time). Delete tags one per `await`, or delete → wait → verify 0 → then add.
- The tag input keeps its value after a JS-setter add; typing into it appends and Etsy rejects the line
  ("cannot add the same tag more than once"). Select-all + Delete before typing.
- The editor scrolls an INNER container (`window.scrollY` stays 0) and the field rows have 4 px sr-only
  twins — pick the element with `getBoundingClientRect().height > 30` before `scrollIntoView`.

## 2026-09-04 — Re-audit round: square cards, fitted cutouts, stitch-free posters (all six SN sections)

Owner feedback on the football/volleyball sections: dashes visible on every poster, rounded cards
everywhere, the card in the acrylic case and the wallpapers in the phone/desk scenes "badly placed".

**Diagnosis**
- Dashes = the SR poster `stitch_line` decoration. Hidden on all six SR pages (4–5 nodes each).
- Rounded corners had TWO sources, neither of them the masters (their `cornerRadius` was already 0):
  1. the listing-file image nodes themselves — 3–38 px radii on the card- and poster-shaped rects
     (hero, 02 objects, 07 pairs, 09/10/14/17/19). Set to 0 on 89 card nodes + 70 poster nodes across
     M/F/V/C/S/B (`aspect 0.714±0.03` = card, `0.75±0.015` = poster; phone/desktop screens untouched).
  2. the composites — `plates_composite.py` masked the paste to the flat-dark PLATE, so the model's
     rounded plate corners and its edge wobble were cut into a square-cut print.
- The phone wallpaper was warped into a WRONG quad: `fit_plates` had returned a tilted rectangle for an
  upright screen. The real screen is the largest dark blob (minAreaRect), ar 0.473, fill 0.99.

**Fix (all reproducible)**
- `art-pipeline/lib/plates_composite.py`: spec items accept `"mask": "quad"` (paste the whole quad — for
  a plate nothing stands in front of) and `"expand": 1.045` (scale about the centroid); env
  `PLATES_MASK=quad` forces it for a whole run (used for the team-order stacks).
- `art-pipeline/lib/sr_replace.py <scene-dir> [names]` — measures the plate as the largest dark blob of the
  right aspect and re-places: card-in-case (quad, expand 1.045 → fills the sleeve window), card-on-desk
  (quad, saved spec as fallback), phone-in-hand (plate mask — the real screen has rounded corners,
  wallpaper centre-cropped to the plate aspect), desk-monitor (quad, 0.995), team-order (saved spec,
  quad). The case / desk / phone / monitor / poster-on-wall / team-order SCENES are the same file in
  all five sets (md5 equal), so the quads are identical; football (`senior-night/`) had no saved specs
  — volleyball's were copied.
- Posters re-exported stitch-free from the six sport files (1296×1728), resized into each set's
  `src/poster.png` (+ `poster-2x3` side crop) and `etsy/listing-images/03-senior-night/src/*-sr-poster.png`;
  poster-on-wall, team-order, gift and the set tiles (`sr_set_tiles.py` stage1 + `--finish`, no
  generation) re-run for all five sets. Cost: €0.
- 56 files uploaded in one `upload_assets` batch; **Figma `imageHash` == sha1 of the file bytes**, so the
  new hash is known before the POST and old→new swaps run by hash prefix over the six sections
  (M 24, F 17, V 16, C 17, S 17, B 10 fills + a second pass of 3-way poster rotation). The 56
  placeholder frames the uploads create on the current page were deleted by exact id.

**Poster ownership in the listing file (learned the hard way — node labels lie)**: the `card_BKB`/
`REAL CHROME` style names in the master are stale CS labels. By content: ftb `c30c3d1e`→`dbfdbfdd`,
vlb `40ce922c`→`f83a792b`, soc `4b373a1a`→`fc1a32eb`, bkb `53450e31` (Marcus Ellison, master 05/07 only)
→`5fcc73d4`, chr `ab8267c4`→`301557f6`, bsb `756891de`→`875cbf3a`. Card fronts: ftb 84b1aa64, vlb 2a5b7e93,
soc fb4f3a88, bkb 0012ed26, chr 543c7526, bsb 40703e80. The `e144b493` poster + `389bb5c2` cards pair that
sits in every section's 07 (and master 05/09) is a HIDDEN legacy "PRISM RUSH" pair from the CS clone — it
now carries the bkb poster file, invisible either way. Read ownership from `set_poster`/`set_card_front`
on each section's slide 1 and from a screenshot, never from a label: the first pass put the baseball poster
under the BASKETBALL label in the master row and the soccer poster on the volleyball section.

Not touched: slide-19 ATLAS thumbs (SR_g1… screenshots of the sport files, some include the poster
with the old stitch line at 200 px — regenerate with the next thumb pass), the master's own 03 gift scene
(`76553c34`, not football's). Nothing exported to Etsy; still awaiting "ok".

### Second pass (same day): "pereik SN listingus visus, liko su nekvadratinėm kortelėm"
Product changed from rounded to square-cut on 2026-09-01, so every SN listing must show square cards.
- **Vector**: 146 more card-shaped nodes (aspect 0.69–0.74, or clipping frames of card aspect holding an
  image) set to radius 0 on EVERY page except the reference page — 03b SN card, 03c SN poster, 03 Digital
  SN set, both 04 Complete-set pages and `_ASSETS` (SRC card frames r26, banners, archive).
- **Raster**: the card PNGs themselves still carried the old ROUNDED `card_border` keyline — every card
  export made before this session (ftb/vlb/chr/soc listing src, `sr-card-front/back` = basketball) and
  even `download_assets` exports made today (that export came back stale/cached: the API said
  `card_border r=0`, the live `get_screenshot` render was square, the download was rounded). Rule:
  **export cards with `get_screenshot` (live render, native 750×1050), not `download_assets`.**
  12 live renders (6 sports × front/back) replaced `src/card-*.png` in the five scene sets and
  `etsy/listing-images/03-senior-night/src/*-sr-front|back.png` + `sr-card-*.png`; case, card-on-desk,
  team-order and gift composites re-run; 32 uploads, swapped by hash on all pages
  (01 CARD LISTING 24, 03 SN set 147, 04 3, _ASSETS 11, 03b 11, 03c 10, 03 Digital SN 21).
  Old→new card hashes: ftb 84b1aa64→0cea7381 / 788926b6+cc75d3cd→8140ca99; vlb 2a5b7e93→43f96e98 /
  5536383b→e46e6556; chr 543c7526→191aa81a / de5a82c3→9b93b13f; soc fb4f3a88→f58397ab / 454e99b7→42ce9faf;
  bsb 40703e80→1063799b / be2e40c6→cb505402; bkb 0012ed26(+389bb5c2)→dcc791cf / a8eba559→9a280d66.
- Not re-generated: the set tiles' model-printed cards (keyline invisible at that size) and the digital
  tile; slide-19 thumbs. The SN keyline is a linear-gradient foil stroke (rose highlight at the corner is
  the ramp, not a colour error).

## 2026-09-04 — promo code GDE75 (was FAMILY75)

`GDE75` — 75 % off (FAMILY75 created first, deactivated unused the same hour — codes cannot be renamed, only deactivated) (Etsy's maximum for percentage codes is 75 %, minimum 5 %), whole shop, no order
minimum, **10 redemptions total**, active Sep 4 2026 5:00 PM → Nov 1 2026. Share URL
`https://gamedayedition.etsy.com/?coupon=GDE75`. Purpose: friends & family printed orders at/below
cost (18×24 printed poster → $17.79 vs ~$25 COGS; printed set → $23.29 vs ~$40) — the shop's first real
orders + reviews. The code applies on top of the 30 % sale price. Other live codes: FACEBOOK25 /
REDDIT25 ($25 off, 10 each, to Oct 31), auto offers CARTBACK15 / FAVORITE15 / THANKYOU10.
The new promo form has a **"Select listings"** step — codes CAN now be limited to chosen listings.

### Third pass: perspective, no white corner, mat kept (2026-09-04)
Owner, on the built sections: the card in the case "looks pasted, the top right needs skew to match the
holder"; the poster stack "still has that white corner"; on the gift shot "below the hands the white
passe-partout disappears".

All three were the same mistake in different clothes: a plate was described by a RECTANGLE.
- **`art-pipeline/lib/sr_quad.py` (new)** — `quad4()` returns the plate's four CORNERS
  (`approxPolyDP` on the flat-dark mask, eps ladder, 90% fill check). A plate seen at an angle is a
  trapezoid: the case plate is `701,583 1284,602 1344,1471 738,1485`, while `minAreaRect` gave
  `684,575 1316,545 1359,1479 728,1509` — a card warped into that sits square inside a receding holder,
  which is exactly "pasted on". Used for case, card-on-desk, poster-on-wall, gift and monitor; the
  upright phone screen keeps the rectangle (its corners are traced away by the rounded screen).
- **The mat**: the old gift quad ran past the plate at the bottom, so the poster covered the frame's white
  mat under the hands. The traced quad stops at the plate.
- **The white corner**: `paint_stack` subtracted a DILATED plate mask and eroded every sheet by 3 px,
  leaving white slivers and a white corner between the sheets. Now the back sheet is painted over the
  whole white footprint and the nearer sheets overpaint inside their own quads, so no bare paper can
  remain; the top poster still lands last, over its full quad. Near-white pixels inside the stack:
  volleyball 9.8k of 1.13M (paper edges catching light), football 2.1k.
- **Baseball gift** was pasting the poster into the night sky at the top-right corner: a flat dark
  poster-shaped region won on area. The gift plate is now chosen by shape AND must not touch the image
  border — a frame someone is holding never runs off the edge of the photograph.
- 25 rebuilt composites uploaded and swapped (27 fills in the 03 SENIOR NIGHT page); poster-on-wall and
  phone were byte-identical and were not re-uploaded. Generation cost: EUR 0.

## 2026-09-05 — SN photo refresh (all six) + a false-alarm diagnosis worth remembering

Owner re-exported all six Senior Night sets (`Exportai Etsy/SN FULL|SN Football|SN volley|SN cheer|
SN soccer|SN baseball`, 20 each; the any-sport folder is now **SN FULL**, was "SN complete set").
All 20 images replaced and published on: SN Set 4564565764, Football 4568844304, Volleyball
4568846696, Cheer 4568849272, Soccer 4568841851, Baseball 4568844985. Texts, tags, SKUs and
personalization untouched.

**Verified by pixels, not by counting:** live `il_680xN` for positions 1/10/20 vs the local
export → grayscale 128×128 RMS 0.6–0.8 on every listing (identical; ~0.7 is JPEG recompression).

⚠️ **The false alarm:** mid-way I concluded all six were "half old, half new" because roughly half
the image IDs started `8478…` and half `8526…`. **Etsy image IDs are sharded, not sequential** —
a single upload batch gets IDs from both ranges. The `8478…` images were the NEW files. Cheer was
re-done a second time on that wrong reading (no harm — same files, order preserved, hero intact).
Also learned: the editor DOM duplicates grid tiles, so counting `img` nodes is unreliable; use
Etsy's own `Add photos N remaining` text. Both rules are in the memory file.

## 2026-09-05 · SOFTBALL + WRESTLING Senior Night — SR pages built by transfer (both files)

Owner asked for two more sports across ALL THREE Senior Night listings (set + card + poster = 6 new
sections). Sports chosen from `etsy/SEO/NICHE-REPORT-2026-08.md` §6, owner confirmed: **softball**
(103/mo +130%, Typical conv, 4.9k/yr with an April peak — the spring engine beside baseball) and
**wrestling** (9/mo but 1.2k/yr with a January peak — Engine A's January echo). Hockey (697/yr) and
lacrosse (4/mo) were the runners-up; `track SN` is 0 and is listed as dead in the report.
⚠️ This reverses the 2026-09-03 decision recorded in `docs/SENIOR-NIGHT-PROGRESS.md` §16 ("03b/03c are
parked, Senior Night sells as SETS"). The owner re-opened card-only and poster-only for these sports.

**Backgrounds** `npm run art:bg -- --finish senior-night --sport softball,wrestling` (EUR 0.08, budget
raised to EUR 60 with the owner's approval; September stood at EUR 49.72 before this).
Softball = a diamond with home plate, both batter's boxes and a curved backstop; wrestling = a square
mat with the 9 m circle, passivity band and centre circle, bleachers behind. Both carry the SR twin
follow-spots, gold confetti, banners and a phone-lit crowd.

**Registry** `GDE-SR-SFB-2026-03` (Brooke Danner #3, Pitcher, Bell Hollow Wrens, ERA 1.42 / K 187 / W 18)
and `GDE-SR-WRS-2026-01` (Dawson Pryor #1, 126 lbs, Foundry Hill Forge, WINS 142 / PINS 61 / TD 388);
`npm run qr:gen` wrote both QR codes.

**Neither file had a Senior night page** (only 6 finish pages), so both went the BASEBALL route: the three
baseball SR masters exported as SVG, `<image>` stripped to rects (3.97 MB -> 80 KB), uploaded, rebuilt into
real frames at artboard coordinates, images set by layer name, effects re-applied, and every outlined
string re-set as live Playfair/Oswald text.

| | softball `OlFb7Clx6QqWIum6xdaG3p` | wrestling `fbQprOeTHrnzDGnUi1PzWH` |
|---|---|---|
| page | `5021:146` | `5027:146` |
| poster / FRONT / BACK | `5024:146` / `5030:146` / `5030:147` | `5029:146` / `5029:147` / `5029:148` |
| sections 02/03/04/05 | `5039:152` / `5039:687` / `5039:1072` / `5039:1287` | `5037:146` / `5037:641` / `5037:966` / `5037:1111` |

**Sweep** (same as volleyball, scripted): 16 PR replicas per file replaced with rescaled master clones
(7 FRONT, 6 BACK, 3 poster), PR background/photos/crest/QR re-pointed **by layer name** (safer than by
hash — wrestling's PR sections carried different cutout hashes than the repo files), 111 texts per file
converted off Audiowide/Orbitron/Chakra Petch to Playfair Display Black / Oswald with a measured refit,
~300 cold paints per file turned gold (lum >= 0.32) or warm dark (hue 32), 125 echo/rim/flare/glint/
style_glyph nodes hidden, and the count-bearing copy made neutral (pack "10 COLLECTIBLE CARDS" ->
"SEALED COLLECTOR PACK", "A single edition of ten." -> "A single numbered edition.", certificate
"limited run of 10 cards" -> "a single numbered Senior Night edition for this athlete").
Certificate class year was wrong in BOTH donors' clones (softball 2029, wrestling 2027) -> 2026; both
card ids were `GDE-SN-` (Stadium Night) -> `GDE-SR-`.

**New trap — the donor's own defect travels.** The baseball SR poster has a `nameplate > meta` group
holding two outlined bullet vectors that duplicate the live `dot` texts. In baseball they sit 11 px from
the live dots and read as a slightly doubled separator; with a shorter team name they separate and one
lands on the season digits. Hidden in both new files. ⚠️ **Still present in the baseball master and in
every listing image built from it** — fix there too.

Not done yet: exports, scenes/tiles, and the six listing sections.
