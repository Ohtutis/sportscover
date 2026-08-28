# Figma files — keys and node IDs

Written 2026-08-24. These were **not recorded anywhere** until now;
`docs/SPORT-TEMPLATES-HANDOFF.md` only said "user hands over the fileKey". Losing them meant
no sweep, fix or audit could run across the roster. Keep this file current.

## Per-sport hero files

Each is a duplicate of the master, so **node IDs are identical in every one of them** —
verified on swimming, 2026-08-24. That is what makes a cross-file sweep possible with one
`use_figma` call per file and no page switching.

| Sport | File key |
|---|---|
| basketball | `fgueg7sV11zKnV1hir1Zsg` |
| baseball | `tL9vfpIhC5esFbXcozgAlT` |
| softball | `OlFb7Clx6QqWIum6xdaG3p` |
| football | `rnOtXNBGu5VmumfldAhtNO` |
| soccer | `zH80jD1o3jSMvFePyrtTG1` |
| soccer-age-07 | `4JGr9hrEtuWagNsNtsv6A5` |
| soccer-age-10 | `qSecMWPII1AhSo10Zqc2te` |
| soccer-age-22 | `NBv5eM1QLDY8HrRjPqtGI2` |
| soccer-age-32 | `XTYIl3tQo6mmJEk9zz6l2H` |
| soccer-age-50 | `BJb5hA92cxhZwikIMvC55i` |
| ice-hockey | `uvGQg19b8hLDwq2Jc9vBvB` |
| volleyball | `S8kqmhvEB5QNG8sbjgxQnF` |
| lacrosse | `ht5qbsHqdLwrucR8jxN33H` |
| wrestling | `fbQprOeTHrnzDGnUi1PzWH` |
| cheerleading | `XDd1HUvmnxW2YNEbA6nlNK` |
| gymnastics | `XY2YSoPYTgdSdrkNMgOgKo` |
| track-field | `AEVgCm4JVM30ehFRXUYLI6` |
| swimming | `1ibGmpI2tNk9Y8BNxksjdf` |
| tennis | `udIDp5epiIj0O0pz29ESvG` |
| golf | `WG1WMjewMMUD4HSbxcuWU8` |
| pickleball | `sz6zikv15PalwJX7x05uiQ` |
| pickleball-youth | `VZAWW7RurndHMq8diFLzx3` |
| other-sport (skateboarding) | `MHbRjpDkZ5AJw8PUR7sgou` |

## Other files

| File | Key | What it is |
|---|---|---|
| GDE — HERO | `fRKQzJg5tot9JzikJOHXAG` | the master the sport files were duplicated from |
| GDE — Old | `KzdEYF1UD9EnsczY8Kpyxi` | the original build. **Its athlete is Nia Brooks**, who has no identity or kit plate. Do not take card art from here. |
| Etsy listing templates | `JcQvsgIRiOQtuZcP3Q8dc9` | the listing frames. `01 · CARD LISTING` is the live one. |
| GDE Marketing — Etsy listings | `1OY82q4dMEMbM7QenC3lb4` | created 2026-08-24, then superseded — the work stayed in the file above. Safe to delete. |
| Order 03 | `iLHCW0lDPPYW5BNpriGL8r` | Žilvinas Rubliauskas, Mad Lamb #51, basketball — Stadium Night only (single page). Filled 2026-08-26. |

## Node IDs — identical across FILES, but each finish is its own PAGE

⚠️ Clarified 2026-08-24. "Identical in every sport file" is true, but only compares like with
like: **each finish is a separate page**, and the six pages have different node IDs. A file
opens on page 1 (`0:1`, Stadium Night), so `getNodeByIdAsync('190:136')` returns `null` until
you `await figma.setCurrentPageAsync(...)` onto the Chrome All-Star page. A null here means
*wrong page*, not *missing node*.

Every sport file has the same 6 pages: Stadium Night, Chrome All-Star, Fire & Smoke, Heritage,
Signature Spotlight, Prism Rush. The basketball master additionally has `06 · ETSY LISTING`.

Canonical versions per `docs/GAME-DAY-EDITION.md`: **Stadium Night = V1, the other five = V2.**

| Finish | Card FRONT | Card BACK | Poster |
|---|---|---|---|
| Stadium Night | `40:2` | `49:2` | `38:2` |
| Chrome All-Star | `190:136` | `102:85` | `190:93` |
| Fire & Smoke | `190:204` | `166:71` | `190:167` |
| Heritage | `190:291` | `166:180` | `190:253` |
| Signature Spotlight | `190:353` | `166:289` | `190:319` |
| Prism Rush | `190:415` | `166:398` | `190:379` |

Also on the Stadium Night page: certificate `79:2`, watermarked proof `98:2`,
print card FRONT `121:2` / BACK `121:27`, pack flat `125:2`, poster print export `90:2`.

## Rules that make cross-file work possible

1. **Pixels CAN leave Figma — through `download_assets`, not `exportAsync`.** Corrected
   2026-08-24; the previous entry here said the opposite and was wrong.
   - ✅ `download_assets` returns short-lived URLs: an `export` PNG **and `svgAssets`** (vectors
     for icon/logo layers). `curl -L -o` saves them to disk with no size limit. This is how
     `exports/brand/GDE-etsy-shop-icon-1000x1000.png` was produced from the shield vector.
   - ❌ `exportAsync` inside `use_figma` still truncates at ~20 KB, so a 600 KB card JPG will
     not come back that way.
   - Practical split: **single assets (logo, icon, mark) → `download_assets`**; **compositions
     that must contain a real card or poster → build inside a file that has them via `clone()`**.
2. **`resize()` on a frame does not scale its children** — with `clipsContent` on, the contents
   get cropped instead. Use **`rescale()`** for proportional scaling.
3. **`use_figma` may call `setCurrentPageAsync` at most once per invocation.** For multi-page
   work, fan out: one call per page, all emitted in the same message.


## Lockup alignment — THE RULE (settled 2026-08-24, swept across all 24 files)

The recurring "number and position are not centred with the name" defect had **two independent
causes**, and fixing only one of them is why it kept coming back.

**Cause 1 — fixed-width text children.** Inside a `meta` / `style_meta` row, a child such as
`#position` or `#season` had `textAutoResize: 'HEIGHT'` (a fixed 170 px box) while its ink was
only ~80 px wide. With the row set to `CENTER`, Figma centres the **box**, so the visible ink
sits left of centre by half the dead space. Measured on the Chrome All-Star social card: ink
centre 329 vs card centre 380 — **51 px left**, exactly what the eye saw.
→ **Every TEXT child of these rows must be `WIDTH_AND_HEIGHT` (hug).** This is the user's own
"hug content" fix, and it is universal — there is no case where a fixed box is correct here.

**Cause 2 — alignment is a property of the FINISH, not a global constant.**

| | Card lockup | Poster lockup |
|---|---|---|
| Stadium Night | LEFT | LEFT |
| **Chrome All-Star** | **CENTRED** | LEFT |
| Fire & Smoke | LEFT | LEFT |
| **Heritage** | **CENTRED** | **CENTRED** |
| Signature Spotlight | LEFT | LEFT |
| Prism Rush | LEFT | LEFT |

Chrome All-Star and Heritage cards are centred; **Heritage is the only finish whose poster is
also centred.** A blanket rule in either direction breaks half the roster.

### How to derive the target without guessing

- **Poster rows** (parent is the `nameplate` auto-layout): read `#athlete_name.textAlignHorizontal`.
  Poster names are FILL-width, so their `textAlign` is meaningful. `CENTER` → `CENTER`, else `MIN`.
- **Card rows** (parent is the card frame, `layoutMode: 'NONE'`): `textAlign` is **useless** — every
  card name is HUG + LEFT and is centred by *position*, not by alignment. Read the finish instead,
  from `#style_name.characters` inside the same card ("CHROME ALL-STAR", "HERITAGE", …), and look it
  up in the table. This also works on cloned cards where the page name says nothing.

### Geometry that goes with each target

- `MIN` card rows → `layoutSizingHorizontal = 'HUG'`, keep `x` at the left margin. Left-packed and
  immune to text growth.
- `CENTER` card rows → keep `FIXED`, and re-centre the row on the host: `x = (hostW - rowW) / 2`.
- Poster rows are `FILL` children — set `primaryAxisAlignItems` only, never touch width.

### Two traps

- **Do not judge a card lockup by measuring where the name sits.** Prism Rush's name is 639 px on a
  750 px card, so a LEFT-anchored name at margin 56 lands dead centre by coincidence. Geometry says
  "centred", the design says "left". Only `#style_name` is reliable.
- **`04 · WALLPAPERS` has no `meta`/`style_meta` rows at all** — wallpapers carry art plus minimal
  type, so this defect never existed there. Nothing to sweep; do not go looking for it.

## Sweep status — COMPLETE (2026-08-24)

All **24 files** (23 sport files + `GDE — HERO` master) swept across **every page**, including
`06 · ETSY LISTING` in the basketball master. Sections 01–05 all covered: hero, print, proof,
social and the CardFlip replicas.

- **0 rows with fixed-width children remain** (174 rows re-checked in basketball alone).
- **0 rows with an unidentifiable finish** — the `#style_name` signal resolved every case.
- Every file converged to the identical distribution per page: SN 20 MIN · CA 4 MIN + 18 CENTER ·
  FS 22 MIN · HE 22 CENTER · SS 22 MIN · PR 22 MIN. That uniformity is itself the proof that the
  sport files are true duplicates.

**`page.loadAsync()` makes this cheap.** All pages of one file can be processed in a single
`use_figma` call — `setCurrentPageAsync` is the thing limited to once per call, and it is not
needed when you load pages explicitly. This turned a 138-call sweep into 24.

## Prism Rush chromatic split & style glyph — THE RULE (settled 2026-08-24)

Prism Rush is the only finish with `*_echo_magenta` / `*_echo_cyan` layers. Three separate
defects lived here, all of them invisible until a long surname made them obvious.

### 1. Echo font size must equal its base — always

`#athlete_name` in a poster `nameplate` is `FILL` + `textAutoResize: 'HEIGHT'`, so the fitter
**shrinks it** to fit the width. The echoes are `ABSOLUTE` + `FIXED`, so the fitter never touches
them. Result: the name shrank 15.6 % and the coloured copies did not — measured ratio **1.185**
in every replica while the hero sat at 1.000. That is why the surname looked "splattered" and the
first name did not.

**It only shows up when the surname is long enough to trigger the fit.** 13 of 24 files were
affected (baseball, football, soccer, lacrosse, gymnastics, track-field, swimming, tennis,
pickleball, other-sport, soccer-age-07/10/50); the other 11 happened to have short names and were
accidentally correct. **This recurs every time an athlete's name changes** — re-run the match.

Correct rule: `echo.fontSize = base.fontSize`, read live. `first_echo_*` → `#first_name`,
`name_echo_*` → `#athlete_name`.

### 2. The split geometry comes from the CARD, not the poster

The card had the good treatment all along; the poster had a different, worse one:

| | magenta dx | cyan dx | dy |
|---|---|---|---|
| **Card (canonical)** | **+0.065 em** | **−0.065 em** | **0** |
| Poster (was) | +0.017 | −0.063 | **−0.094** |

Colours and opacities were already identical (`#FF59E5` @ 0.5, `#4DEBFF` @ 0.5) — only offsets
differed. The poster's split was **asymmetric and pushed up**, so the coloured copies sat above
the white glyphs instead of beside them. Applied the card's numbers to every poster nameplate:

```
echo.x = base.x ± 0.065 * base.fontSize
echo.y = base.y                    // no vertical offset, ever
```

### 3. `style_glyph` sits ABOVE the headline

The three `style_glyph` polygons are children of the **poster frame**, siblings of `nameplate` —
not inside it. So nothing keeps them attached when the nameplate moves, and in every replica they
had drifted **below** the headline by a normalised −83.5 (hero was +6.5 above).

Rule, normalised to the 1296-wide hero poster (`k = host.width / 1296`):

```
glyphBottom = headlineTop - 6.5 * k
glyphLeft   = headlineLeft + 2 * k
```

### Sweep status — COMPLETE (2026-08-24)

All 24 files: **16 echo nodes + 12 glyph nodes each**. Four nameplates per file (hero poster,
print poster 5400, proof_poster, social poster_art). Verified visually on the baseball print
poster at 5400 px.

**Do not "fix" the other echo families.** `number_echo_*` (→ `#number` / `#number_ghost`),
`surname_echo_*` (→ `#surname_ghost`), `athlete_name_echo_*` and `first_name_echo_*` were all
measured at ratio 1.000 across all 96 pairs and are correct as designed.

## Vignette softening — Heritage + Signature Spotlight only (2026-08-24)

**The values were never per-finish.** All six finishes carried the identical vignette:
`0 → a 0` · `0.72 → a 0` · `1 → a 0.42`. It read as a harsh spotlight only on **Heritage** and
**Signature Spotlight**, because those two have the brightest, warmest backgrounds — the dark
corners have something to contrast against. On Stadium Night / Prism Rush the same gradient is
invisible. **User decision: soften only those two; leave the other four untouched.**

**The defect was the curve shape, not the strength.** Three stops with the middle one at
`0.72 → alpha 0` means the centre 72 % of the frame is completely untouched and the whole falloff
is crammed into the last 28 % — a visible ring, not a vignette.

New curve (6 stops, eased, peak reduced to 60 % of its old value):

| position | 0 | 0.35 | 0.60 | 0.78 | 0.90 | 1.00 |
|---|---|---|---|---|---|---|
| alpha × peak | 0 | 0.05 | 0.18 | 0.42 | 0.70 | 1.00 |

Posters: peak `0.42 → 0.252`. Pack flat (warm-tinted, its own pattern): `0.76 → 0.456`.
`gradientTransform` is left alone — it controls the spread, and it was never the problem.

**The script is ratio-based (`newPeak = oldPeak × 0.6`), so it is NOT naturally idempotent.**
It carries a guard: a gradient whose stop positions already match the 6-point curve is skipped.
Do not remove that guard — running twice without it would soften to 0.15.

Swept: all 24 files, `Heritage` + `Signature Spotlight`, 15 vignettes per page → **720 total**.

## Senior Night (SR) — the seventh style, added 2026-08-27

**Every sport file gets a `Senior night` PAGE**, cloned from that file's Prism Rush section 01 and
re-themed by name (not by id — a fresh page has fresh ids). Built so far:

| Sport | File key | Page | Poster | Card FRONT | Card BACK |
|---|---|---|---|---|---|
| basketball | `fgueg7sV11zKnV1hir1Zsg` | `2304:566` | `2304:618` | `2304:664` | `2304:568` |
| football | `rnOtXNBGu5VmumfldAhtNO` | `4052:155` | `4052:156` | `4052:202` | `4052:237` |
| cheerleading | `XDd1HUvmnxW2YNEbA6nlNK` | `4022:146` | `4022:147` | `4022:193` | `4022:228` |
| soccer | `zH80jD1o3jSMvFePyrtTG1` | `5015:146` | `5015:147` | `5015:193` | `5015:228` |
| volleyball | `S8kqmhvEB5QNG8sbjgxQnF` | `5019:146` | `5019:147` | `5019:193` | `5019:228` |

⚠️ **Only BASKETBALL has SR sections 02–05** (print, social, wallpapers, digital bonus). The other
four carry section 01 only — poster + card FRONT/BACK. Build the rest per order, or before the
sport picker is used at scale.

Backgrounds come from the pipeline like any other finish: `senior-night` is now a real entry in
`art-pipeline/finishes.ts` (ref `print-sources/senior-night/senior-night-background.png`), so
`npm run art:bg -- --finish senior-night --sport <slug>` builds any remaining sport.

### Three traps this build found (they will bite the next sport too)

1. **The stat echoes on the card BACK are named `stat_value`, not `*_echo_*`.** Hiding nodes whose
   NAME matches /echo/ leaves three identical values stacked ~6–12 px apart, and the tile reads
   "312" as "302". The fix that works on any file: inside each stat tile keep the LAST
   `stat_value` in z-order (the master is drawn on top of its echoes), hide the rest, then
   re-centre the survivor's INK in the tile with `absoluteRenderBounds`.
2. **Figma renames a text layer to its own content.** After `n.characters = "SENIOR SEASON"` the
   layer's `name` is no longer `"SEASON"`, so any later `lab.name === "SEASON"` test silently
   fails. Capture the name in a local before mutating.
3. **A poster ghost number cannot be moved inside an INSTANCE** (`relative-transform` is not
   overridable). Hide the instance's `#number` and draw a fresh Playfair ghost on the poster
   instead, then seat it by measuring `absoluteRenderBounds` — Playfair's ascender means the ink
   sits ~390 px below the text box top at 880 px.
