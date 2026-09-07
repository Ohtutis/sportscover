# Etsy showcase survey — `Exportai Etsy/` (2026-09-07)

Owner's ask: *"Explore all the Etsy listings and add to our website the best examples and showcases from there."*

`Exportai Etsy/` is git-ignored and lives only on the owner's Mac. It holds the **live, current** listing sets —
25 folders, 484 JPGs, every slide 4000 × 4000 (the three `Cover/` banners are 1600 × 400). It supersedes
`etsy/listing-images/`, which `ASSETS-LISTING.md` already flags as largely stale.

Result: **19 files converted under 20 new keys**, one key left `locate` for the owner. Everything the site now
shows from this folder is a **crop**; not one slide ships whole.

---

## 1. The rule this folder is governed by

Every slide in this set is a finished marketing tile. Each one carries baked type: a headline in the lower
left, the Game Day Edition wordmark under it, a slide number `NN / 20` in the lower right, and often a promise
("PRINTS SHIP FREE", "FAST DELIVERY · 1-2 DAYS", "OR REFUND EVERY CENT") or a count. None of that may reach the
site as a picture — the site states its own claims in HTML, where a test can read them.

So each usable slide is one of two shapes:

- **A full-bleed photograph with type burned into a corner.** The composition survives a bottom trim: the
  headline block starts at ~0.73 of the height on the card slides and ~0.68 on the wider ones, and the slide
  number sits below that. Trim → the photograph is clean.
- **A cream layout sheet with a photograph inset in it.** The inset panel is a real photograph and can be cut
  out of the sheet (`SN-05-TEAM`, `15 · You see it first`).

Everything else — comparison tables, callout diagrams, tile grids, step strips — is *layout*, and the site
already renders that as HTML (`Ledger`, `TierCard`, `StatusChip`, `ToScaleSheet`, the finish tiles). Converting
those would be trading a testable sentence for an untestable picture.

Crops are declared in `lib/assets.ts` as `crop: "box:<l>,<t>,<w>,<h>"` (fractions of the source) and recorded in
`public/images/.manifest.json`, so a reviewer can re-cut the same box instead of trusting a memory.

---

## 2. The 25 sets

| Set | Folder | Slides | Family |
| --- | --- | --- | --- |
| Card listings | `Card basketball`, `card baseball`, `card cheer`, `card football`, `card soccer`, `card volley` | 20 each | identical template, six sports |
| Poster listings | `basketball poster`, `baseball poster`, `football poster`, `soccer poster`, `Cheer poster`, `valley poster` | 20 each | identical template, six sports |
| Digital | `Digital card`, `Digital poster basketball`, `Digital complete all sports` | 20 each | digital-only variants |
| Complete set | `Full complete all sports` | 20 | the printed set |
| Senior Night | `SN FULL`, `SN Football`, `SN baseball`, `SN cheer`, `SN soccer`, `SN softball`, `SN volley`, `SN werstling` | 20 each | `SN-01…SN-20` template |
| Shop banner | `Cover` | 3 | 1600 × 400 Etsy cover |

Within a family the slide **numbers and titles are the same file for every sport** — only the athlete and the
room change. That is what makes the six-sport rows below possible.

---

## 3. Slide types, and what happened to each

Worked by TYPE. "Sports" says which folders carry that type.

### Photography — used

| Slide type | Sports | What it shows | Site already? | Verdict |
| --- | --- | --- | --- | --- |
| `02 · Their season, their wall` | all 6 poster listings | The athlete living in a room with the framed poster on the wall. Six different athletes, six different rooms, three sports on a bedroom wall and three in a living room. | Only `life.poster.room*` — one basketball room, one baseball room, both older | **USE** → `wall.basketball` `wall.baseball` `wall.football` `wall.soccer` `wall.cheerleading` `wall.volleyball` |
| `05 · The kid on the card` (`03` in `Digital card`) | 6 card listings + `Digital card` | The athlete grinning, holding up their own card. Bleachers, school hallway, kitchen table, brick wall, field bleachers, parking lot. | `life.card.hand` (one, older, no face) | **USE** → `moment.card.bleachers` `moment.card.hallway` `show.kid.baseball` `show.kid.cheerleading` `show.kid.soccer` `show.kid.volleyball` `show.kid.football` |
| `SN-03-EMOTION` | all 8 SN sets | Senior + parent holding the framed poster, confetti, stadium light. | `life.gift.moment` (football, pipeline render) | **USE** → `moment.senior.field` (baseball: the only version whose poster is complete above the headline) |
| `SN-05-TEAM` | 7 SN sport sets | Inset panel: a stack of posters, a row of tubes, six stacks of cards, the shipping box. | `life.team.order` (softball), `.baseball` | **USE** → `moment.team.senior` (football — the panel cut out of the sheet) |
| `SN-18-SENIORS` | all 8 SN sets | Four seniors in letterman jackets holding their cards, four framed posters on easels behind them, full gym. | no | **USE** → `show.senior.class` |
| `03 · The card in hand. The poster on the wall.` | `Digital complete all sports` | Two teammates in a bedroom, each holding their own card, a framed poster behind. | no | **USE** → `show.friends.cards` |
| `15 · You see it first` / `17 · You approve it` | `Digital card`, card listings | The watermarked proof sheet: poster + card front + card back, PROOF — NOT FINAL. | `home.proof` — but that is a **baseball Senior Night** proof, a different athlete from the site's demo card | **USE** → `show.proof.basketball` (`Digital card/15`; the card-listing version bakes a refund promise into an orange bar and is skipped) |
| `16 · Where it lives — social & screens` | `Digital poster basketball`, `Digital complete`, `Full complete`, `SN-04` | Right half: the artwork as the wallpaper on a desktop monitor. Left half: a mocked social feed on a phone. | `life.phone` (phone only) | **USE the right half** → `show.screens.desktop`. The mocked feed is not used — it imitates another company's interface. |

### Photography — not used

| Slide type | Sports | Verdict |
| --- | --- | --- |
| `01 · HERO` (card / poster / set / `SN-01`) | every set | **SKIP** — headline, feature pills and a before-photo strip baked over the art; the composition dies under any trim that removes them. Heroes are composed in code (GAPS #1, #7). |
| `SN-08-ONE-OF-ONE` | SN sport sets | **SKIP** — the card is photographed inside an acrylic slab. We do not ship a slab, and `life.card.case` already shows the display stand we do mention. |
| `18 · One every season` (age ladder 7 → 50) | card + poster listings | **SKIP** — five different people presented as one person ageing, and the meaning is entirely in the baked `AGE 7 … AGE 50` labels. Cropped, it is five strangers. |
| `20 · Seventeen sports` / `04 · Seventeen sports. Pick yours.` | most sets | **SKIP** — a labelled grid; the site renders 17 real tiles from `sport.*.front`. The two `locate` sports (pickleball, skateboarding) would need a card face, not a pose photo. |
| `13 · We get their likeness right first` | card + poster listings | **SKIP** — the same identity plates the site already ships as `how.gate.plate` / `.plate-back`. |
| `15 · Their uniform, their number` | card + poster listings | **SKIP** — the same kit plates as `how.gate.kit` / `.kit-back`. |
| `14 · One athlete, consistent in every shot` / `06 · Four shots, measured` | card + digital | **SKIP** — the four frames duplicate `how.gate.shots.1–4`, and the panel's value is its baked similarity scores (`0.558 PASS`, `0.287 REJECTED TAKE`). Those are numbers the site's copy does not state and cannot verify from an image. |
| `12 · What photos to send` / `SN-12-PHOTO-GUIDE` | every set | **SKIP** — a 4 + 4 pass/fail grid whose whole meaning is the baked ✓/✗ captions. The site already ships `photo-guide.panels` plus an HTML `PhotoChecklist`, which is the same idea in text a test can read. |
| `14 · Photo to final` (`SN-14`) | SN sets | **SKIP** — a before→after diagram; `BeforeAfter` does this in code from the real files. |
| `Cover/extra · cover*.jpg` | `Cover` | **SKIP** — 1600 × 400 Etsy shop banner, entirely baked type over a strip of athletes. Wrong shape and wrong content for any page. |

### Layout sheets — not used

All **SKIP**, all for the same reason: the site says it in HTML, where the truth lint and the price tests can read it.

| Slide type | Sports | Reason |
| --- | --- | --- |
| `02 · Choose your package` / `06` / `SN-06-PACKAGE` | every set | A comparison table with card counts and a sealed foil pack column. Counts and the pack are both out (GAPS #10, #12); the site has `TierCard` and `lib/catalog/prices.ts`. |
| `03 · Everything you get` / `05` / `SN-02` / `19 · Everything you get — counted` | every set | Deliverable ledgers with counts baked in ("28 FILES + 1 LIVE REGISTRY PAGE"). GAPS #10: this section is a `Ledger`. |
| `04 · Front + back, numbered, registered` | card listings | Spec pills over the pair. The pair is two `CardFace`s; the spec is HTML. Its older sibling is already denylisted. |
| `06 · One athlete, six finishes` / `04` / `05 · Six sports. Six finishes.` | most sets | The site renders `finish.*.front` tiles with real finish names. |
| `07 / 08 / 09 · Style pair` | every listing set | DESIGN §6.6: pair slides are never shown whole. |
| `10 · Every field is yours` / `SN-10-PERSONALIZATION` | every set | A callout diagram. DESIGN §10.3 already replaced the callout slide with HTML discs. |
| `11 · How to order` / `18 · Digital delivery` / `SN-11` | every set | Step strips carrying delivery promises ("DIGITAL IN 1-2 DAYS", "PRINTS SHIP FREE"). One delivery claim per page, and it comes from `chipSegment()`. |
| `16 · Your club's crest` / `SN-16-CREST-POLICY` | every set | A policy diagram (a crossed-out league mark beside an approved club crest). It is a sentence, not a picture. |
| `16 · Registered forever` / `SN-09-REGISTRY` / `18 · Registered. Verified online.` | digital + SN sets | Shows a certificate beside a phone rendering a registry page that is **not** the site's `/c/<id>` page. Shipping it would advertise a screen we do not serve. The certificate half is also blocked by GAPS #32. |
| `19 · Made for the moment` / `19 · OCCASIONS` | every set | A text grid of occasions. Pure copy. |
| `20 · Cross-sell` / `SN-20` | most sets | Etsy shop navigation. Meaningless off Etsy. |
| `SN-07-FRONT-BACK-QUOTE`, `SN-09-CHR-QUOTE`, `SN-05-SPORTS`, `02 · Four sports. Four art styles.` | SN + set listings | Labelled poster/card grids; the site's own tiles do this with real art. |

### Owner decision

| Slide type | Sports | Verdict |
| --- | --- | --- |
| `03 · Three sizes, to scale` | all 6 poster listings | **OWNER** → `scale.sizes` stays `locate`. Every one of the six versions draws **18 × 24, 24 × 36 and 30 × 40**. The site does not sell the third size — `GDE-ANY-POST-P3040` is `enabled: false` in `lib/catalog/prices.ts` — so the sheet would offer a size that cannot be ordered, and the size labels are the entire point of the picture, so they cannot be cropped away. Until a two-size version is exported, the page renders the `ToScaleSheet` SVG. The rest of the slide (the true-scale athlete, the "TRUE 300 DPI" pill, the print-it-yourself line) is baked type anyway. |

---

## 4. The keys

Every source below is `Exportai Etsy/<folder>/<file>`, 4000 × 4000. Crop is the box in fractions of the source.
Full provenance — source, sha256, output hash and the crop — is in `public/images/.manifest.json`.

| Key | Source slide | Crop | Out (px) | Status |
| --- | --- | --- | --- | --- |
| `wall.basketball` | `basketball poster/02 · Their season, their wall` | `box:0,0,1,0.75` | 1400 × 1050 | verified |
| `wall.baseball` | `baseball poster/02 · …` | `box:0,0,1,0.75` | 1400 × 1050 | verified |
| `wall.football` | `football poster/02 · …` | `box:0,0,1,0.75` | 1400 × 1050 | verified |
| `wall.soccer` | `soccer poster/02 · …` | `box:0,0,1,0.75` | 1400 × 1050 | verified |
| `wall.cheerleading` | `Cheer poster/02 · …` | `box:0,0,1,0.75` | 1400 × 1050 | verified |
| `wall.volleyball` | `valley poster/02 · …` | `box:0,0,1,0.75` | 1400 × 1050 | verified |
| `moment.card.bleachers` | `Card basketball/05 · The kid on the card` | `box:0,0,1,0.728` | 1400 × 1019 | verified |
| `moment.card.hallway` | `Digital card/03 · The kid on the card` | `box:0,0,1,0.728` | 1400 × 1019 | verified |
| `moment.senior.field` | `SN baseball/SN-03-EMOTION` | `box:0,0,1,0.665` | 1400 × 931 | verified |
| `moment.team.senior` | `SN Football/SN-05-TEAM` | `box:0.09,0.295,0.835,0.482` | 1400 × 808 | verified |
| `scale.sizes` | — | — | — | **locate** (owner) |
| `show.proof.basketball` | `Digital card/15 · You see it first` | `box:0.11,0.243,0.78,0.6` | 1400 × 1077 | verified |
| `show.senior.class` | `SN Football/SN-18-SENIORS` | `box:0,0,1,0.678` | 1400 × 949 | verified |
| `show.friends.cards` | `Digital complete all sports/03 · The card in hand. The poster on the wall.` | `box:0,0,1,0.678` | 1400 × 949 | verified |
| `show.screens.desktop` | `Digital poster basketball/16 · Where it lives — social & screens` | `box:0.517,0.297,0.404,0.396` | 1400 × 1372 | verified |
| `show.kid.baseball` | `card baseball/05 · The kid on the card` | `box:0,0,1,0.728` | 1400 × 1019 | verified |
| `show.kid.cheerleading` | `card cheer/05 · …` | `box:0,0,1,0.728` | 1400 × 1019 | verified |
| `show.kid.soccer` | `card soccer/05 · …` | `box:0,0,1,0.728` | 1400 × 1019 | verified |
| `show.kid.volleyball` | `card volley/05 · …` | `box:0,0,1,0.728` | 1400 × 1019 | verified |
| `show.kid.football` | `card football/05 · …` | `box:0,0,1,0.728` | 1400 × 1019 | verified |

Outputs live under `public/images/showcase/`. Largest file 143 KB, all WebP q82, none upscaled.

### Where each `show.*` key belongs

- `show.proof.basketball` — `/how-it-works` gate 5, and the home proof section. This is the proof for the
  athlete the rest of the site already shows (`GDE-SN-BKB-2026-12`); `home.proof` is a baseball Senior Night
  proof and belongs to somebody else, which is a small but real seam in the story.
- `show.senior.class` — `/senior-night`. Four seniors, four sports, four posters on easels: it is the
  whole-class idea in one photograph, which the page currently only asserts in text.
- `show.friends.cards` — `/complete-set`, or the home set section. The card in a hand and the poster on the
  wall in one frame, which is exactly what the set is.
- `show.screens.desktop` — the digital-files section on `/complete-set` or `/posters`: proof that the
  wallpaper deliverable is a real file that ends up on a real screen.
- `show.kid.*` — `/trading-cards`. With `moment.card.bleachers` these make a row of **six sports, six
  athletes, each holding their own card**. Nothing in HTML can do that.

---

## 5. Provenance — what was checked, and what was rejected

Every source was thumbnailed and looked at before conversion (~60 thumbnails, most of them contact sheets).

Rejected, and why:

- **Whole slides with baked marketing type** — every `01 · HERO`, every `NN / 20` slide number, every orange
  promise bar. This is the single largest category and the reason nothing here ships uncropped. Two specific
  near-misses: the card-listing proof slide (`17 · You approve it…`) bakes a refund promise into an orange bar
  under the artwork, so the digital-listing version was used instead; and the "social & screens" slide's left
  half mocks another company's feed interface, so only the right half was cut out.
- **Card counts** — `02 · Choose your package` (12 / 24 / 18-with-4-foil columns), `19 · Everything you get —
  counted` (a file tally), and the deliverable certificates. All skipped.
- **Sealed pack faces** — the collector column of every package table. No pack imagery in F1 at all (GAPS #12).
- **Certificates** — `Digital card/17`, `SN-09-REGISTRY`, `18 · Registered. Verified online.` Blocked by
  GAPS #32 regardless of what they print.
- **A registry page that is not ours** — the phone in the provenance slides renders an invented card page.
- **An acrylic slab** — `SN-08-ONE-OF-ONE`. We do not ship one.
- **Sizes we do not sell** — `03 · Three sizes, to scale`, in all six versions. See §3.
- **The pre-rename athlete (Nia Brooks, #23, Northside Wolves)** — searched for and not present anywhere in
  this export set. The roster here is Marcus Ellison, Casey Whitlock, Tui Fa'agata, Mateo Herrera, Amara Boyd,
  Jaslene Ocampo, Dawson Pryor and the softball senior. No real customers, no blank plates.
- **Rounded card faces** — not applicable: every card in these files is a *photograph* of a card, so it is
  typed `kind: "photo"`, not `"card"`. The corner audit and the 5 : 7 box are for card faces, and no card face
  came out of this folder. The card faces the site ships still come from the square-cut listing `src/` exports.
- **Scannable codes** — the card backs inside the proof sheet and the held cards carry printed codes. Checked:
  none of the written outputs decodes at shipping size, so no picture on the site points a phone anywhere.

## 6. Not converted, but worth knowing

- **`Digital card` and `Digital poster basketball` both carry an athlete-ageing strip** (`07 · Every year, the
  same kid`). If the owner ever wants a "one every season" section, that idea exists as art — but it needs
  labels, and labels belong in HTML, so it would have to be re-exported as five loose frames.
- **The `SN` template is identical across eight sports.** Any key taken from `SN Football` can be swapped for
  the same slide in `SN baseball`, `SN cheer`, `SN soccer`, `SN softball`, `SN volley`, `SN werstling` or
  `SN FULL` with the same crop box. That is how `moment.senior.field` (baseball) and `moment.team.senior`
  (football) came from different folders.
- **`Exportai Etsy/` is newer than `etsy/listing-images/`.** The room shots the site was using
  (`life.poster.room.wide`, `posters.room`) are earlier takes of the same compositions that `wall.basketball`
  now carries. They were left in place — swapping them is a page decision, not an asset one.
