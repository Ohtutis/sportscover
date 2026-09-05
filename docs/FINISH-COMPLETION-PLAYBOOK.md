# Finish completion playbook

How to take a finish from "section 01 only" to production-complete, the way **Fire & Smoke**
was completed on 2026-08-20. Read `docs/GAME-DAY-EDITION.md` first — especially
"Fire & Smoke — section 02 · PRINT READY BUILT", "Screen safe zones" and "Print templates".
This file is the executable checklist; that one is the rationale.

Figma file key: **`KzdEYF1UD9EnsczY8Kpyxi`**. Always load the `figma-use` skill before `use_figma`.

---

## 0 · Per-finish facts

| | Heritage | Signature Spotlight | Prism Rush |
|---|---|---|---|
| Page | `164:3` | `164:4` | `165:3` |
| Section 01 | `166:111` | `166:220` | `166:329` |
| Poster hero (V2, canonical) | **`190:253`** | **`190:319`** | **`190:379`** |
| Card FRONT (V2, canonical) | **`190:291`** | **`190:353`** | **`190:415`** |
| Card BACK (canonical) | **`166:180`** | **`166:289`** | **`166:398`** |
| Background image hash | `25305fe1…` | `499986b7…` | `1721839c…` |
| Style mode | `164:1` | `164:2` | `165:0` |
| styleCode | HE | SS | PR |
| Display / name font | Graduate | Space Grotesk Bold | **Audiowide** |
| Number + ghost font | Graduate | Space Grotesk | **Orbitron Black** |
| Supporting font | Archivo Narrow | Archivo | Chakra Petch |
| Stat VALUE font | Graduate | Space Grotesk | **Audiowide** (documented PR exception) |
| Foil | antique gold | **silver (keep CA's)** | iridescent cyan→magenta |
| Glows | amber | white | neon cyan / magenta |
| `style_glyph` | gold varsity chevrons | outline 4-point sparkles | prism triangles |

Get the exact hashes and current material paints by reading the finish's own hero nodes — do
not copy values from this table into paints blindly.

**Source to clone from: the Chrome All-Star page** (`103:2`), which is complete:

| Deliverable | CA node |
|---|---|
| Poster print export | `105:1218` |
| Print card FRONT / BACK | `141:10` / `141:38` |
| Pack flat | `142:2` |
| Certificate | `144:120` |
| Proof (watermarked) | `105:803` |
| Social ×9 | `105:23` `105:407` `105:134` `105:271` `105:186` `105:322` `105:460` `105:2` `105:9` |
| Wallpapers ×7 | `105:506` `105:553` `105:600` `105:768` `105:647` `105:702` `105:736` |
| Bonus | motion spec `144:3`, cutouts `144:100` `144:102` `144:116` `144:118`, sticker `144:106`, badge `144:111` |

Fire & Smoke equivalents (reference implementation to imitate): section 02 `276:2`,
03 `287:2`, 04 `287:3`, 05 `294:2`, proof `297:2`.

---

## 1 · Sections

Create four sections on the finish's page, copying section 01's fill, sized/placed like FS:

| Section | y | w × h | Frames at (x, y) inside the section |
|---|---|---|---|
| `02 · PRINT READY` | below section 01 | 15069 × 7675 | poster print (140, 260), card FRONT (5835, 260), card BACK (6871, 260), pack (7907, 260), certificate (10159, 260), proof (12929, 260) |
| `03 · SOCIAL` | +2600 below 02 | 12180 × 2320 | keep each CA frame's own x/y |
| `04 · WALLPAPERS` | +2600 below 03 | 16488 × 3196 | keep each CA frame's own x/y |
| `05 · DIGITAL BONUS` | below 04 | 12982 × 3022 | flip front (140,260), flip back (1110,260), motion spec (2080,260), cutouts (3800/5386/7006/8764, 260), sticker (10522,260), badge (12042,260) |

Rename every clone: `Chrome All-Star` → the finish name, `GDE_CA_` → `GDE_<CODE>_`.

---

## 2 · Print cards (816×1110)

Frame 816×1110, `fills=[]`, `clipsContent`, cornerRadius 0, export PNG @1x. Then:

1. **Bleed plates**, full 816×1110, in order, each carrying the *hero's own* paint:
   FRONT: `#card_bg (bleed)` + `scrim (bleed)`.
   BACK: `#card_bg (bleed)` + **`back_photo (bleed)`** + `photo_overlay (bleed)`.
   ✅ **Corrected 2026-08-20: every finish has a from-behind photo**, so the BACK always needs
   three plates. On HE/SS/PR it was hiding under an unnamed import layer — rename it
   `#back_photo` before you build.
2. **Clone the hero card**, `rescale(744/750)`, place at `x=36`, `y=(1110-h)/2` (= 34.2).
   **The clone keeps its own background layers** — that is what makes the trim area a pixel
   match. The plates exist only to fill the 36 px bleed margin.

## 3 · Poster print export (5475×7275)

Frame 5475×7275, frame fill = the poster's `#background` paint (covers the bleed seamlessly),
clone of the hero poster with `rescale(5400/1296)` and `fills=[]`, centred at 37.5/37.5.

---

## 4 · Pack, certificate, proof

Clone the CA node, then **re-materialise** — never leave a CA paint behind.

**Pack** (`142:2`): `base_gradient` → the finish's dark palette; `chrome_texture` → rename
`finish_texture`, image = the finish background hash, opacity ~0.5 with per-finish filters;
`glow_floodlight`/`glow_rim_*`/`vignette`/`scrim_global`/`scrim_front_seat` → the finish's
glow colour; every foil paint → the finish's foil ramp; `style_line_1`/`style_line_2` → the
finish name in the finish's DISPLAY font; `back_footer` copy → `GAME DAY EDITION\n<FINISH> · 2026`;
`style_glyph` trio → the finish's glyph, cloned from its hero card FRONT (sizes 30/40/30,
centres x 359.6 / 411.6 / 463.6 local, centre y 196).
`left_heading` is bound to `styleNameUpper` and fills itself — leave it.

**Proof the pack geometry before exporting** (script, not eyeballing): every content node must
sit inside safe box `x 165–1876, y 157–1404` **and** between its own panel's folds —
FRONT `605–1423`, right flap `1423–1815`, left flap `212–605`. Expect 31 nodes, 0 problems.
Flap text is centred on the *visible* panel: left flap local centre **408.5**, right flap **196**,
front **411.6**. After any font change, re-centre by measured width — never trust stored `x`.

**Certificate** (`144:120`): warm/neutral ground per finish (setting an explicit fill unbinds
that node only — it does not touch SN/CA), glow → finish colour, foil → finish ramp,
supporting font → finish supporting face, `#athlete_name` → finish NAME font **fitted to the
vertical gap above `#meta`, never to the box width** (fitting to width pushed the CA name to
309 px and straight through the meta line).

**Proof frame** (`105:803`): replace the three panels `proof_poster` / `proof_card_front` /
`proof_card_back` with clones of the finish's heroes rescaled to each panel's existing box;
sweep the surrounding chrome's fonts/colours; leave the white watermark tiles white.

---

## 5 · Social + wallpapers — sweep, don't re-clone

These are **derived layouts**, not copies of the hero: they reuse the poster's layer names with
their own composition. Clone each CA frame, then:

1. **Image hashes**: CA background `0956ffd5…` → the finish background; CA back photo
   `c5c5f76b…` → the finish's back photo if it has one. Athlete/logo/QR hashes stay.
2. **Atmosphere by layer name**: build a reference map from the finish's own hero poster
   (`#background`, `glow_main`, `glow_accent`, `vignette`, `flare_right`, `rim_center`,
   `rim_right`, `rim_left`, `scrim_bottom`, `text_scrim`, `#number`) and copy those paints onto
   any node with a matching name. This is the reliable path — it inherits the approved finish
   materials instead of inventing them.
3. **Unmatched nodes** (`backdrop`, `tint`, `glow`, `scrim_left`, …): map by ROLE onto the
   finish's palette sampled from its hero. A blanket hue formula is Fire & Smoke-specific —
   HE needs gold, **SS needs neutral/desaturated (it keeps silver + white)**, PR needs
   cyan/magenta. Do not port FS's `b > r + 0.04 → warm` rule to another finish unmodified.
4. **CA-only decorations**: delete `glint`, `star_ghost`, `chrome_panel`. Replace every STAR
   named `allstar_star` / `style_glyph` with the finish's glyph clone at the same centre and height.
5. **Ghost text** (`#number`, `#number_ghost`, `#surname_ghost`): the finish's NUMBER font, and
   its ghost treatment (HE 3D block + shadow clone, SS hairline outline, PR RGB split — the PR
   echo recipe is in the main doc and is **horizontal-only**, echoes BEHIND the main node).
6. **Frames that embed art** — grid 1 `poster_art`, grid/story 2–3 `card`, motion spec, proof —
   get a real hero clone rescaled to the existing box, not a swept CA copy.

### Font swaps always need a refit
Measure the real ratio with a throwaway text node (`Russo One` at 100 px vs the new face at
100 px, per string) — Anton SC needed **1.44×**, Passion One **1.42×**. Apply the ratio to every
swapped text, then **re-stack the lockup column bottom-anchored with the gaps scaled by the same
factor**, damped so the block never outgrows its frame: `damp = available / newBlockHeight`.
For fixed-width text, grow the size only until the natural width still fits the box.

### Foil substitution must be luminance-gated
Only near-neutral ramps averaging luminance **> 0.55** are silver foil. Darker neutral ramps are
**plates** — recolouring those is what turned the first FS sticker into a copper blob that
swallowed its own type.

---

## 6 · Screen safe zones (mandatory)

Add a hidden `TEMPLATE_GUIDES` frame to every wallpaper. **Art may bleed; type and marks may not.**

| Template | Canvas | `safe_zone` (hard) | Device zones to draw |
|---|---|---|---|
| Desktop | 3840×2160 | 300, 300 → 3540, 1830 | `ui_menu_bar` (0–60), `ui_dock` (1920+), `ui_icon_column` (x<420), `crop_21_9` (y 259–1901) |
| Phone lock | 1290×2796 | 90, 720 → 1200, 2400 | `ui_clock` (170–560), `ui_widgets` (560–700), `ui_actions` (2440–2620), `ui_home_indicator` (2700+) |
| Phone home | 1290×2796 | 90, 300 → 1200, 2400 | `ui_status`, `ui_icon_grid` (300–2400), `ui_dock` (2440+) |
| Tablet | 2048×2732 | 150, 220 → 1898, 2440 | `ui_status`, `ui_dock` (2500+) |

**Desktop also gets `focus_zone` = `576, 380 → 3264, 1780`** — the tier that survives *every*
common desktop aspect (5:4 crops 15 % per side, 21:9 crops 12.5 % top and bottom). All desktop
type and marks belong inside `focus_zone`, which yields symmetric ~600 px margins and reads
deliberate rather than stretched on ultrawide. Verify by actually cropping the exported PNG to
1.25 / 1.5 / 1.6 / 2.37 and looking at it.

Full-width centred text (`x 0, w = canvas`) must be narrowed to the safe width (e.g. x 90,
w 1110 on phones) so a long surname wraps inside the zone instead of running to the bezel.

⚠️ Also inherited from CA: `swipe_cue` (Grid 2 / Story 2) and `#style_season` (Story 3) ship with
centred boxes 216–342 px WIDER than the artboard. Re-box them to a ~5.5 % margin.
**But do not blanket-fix every overflowing centred box** — Heritage's `number_ghost_block_shadow`
is an offset 3D-block clone that is *meant* to hang past the edge at the ghost's full width.
Check for an offset-clone sibling first; flattening those broke 7 Heritage artboards and had to
be reverted one by one.

Finish with a geometric check: every TEXT / `Wordmark` / `accent_bar` / logo inside its box,
0 problems. Ghost art is exempt.

---

## 7 · Bonus die-cuts get a per-finish SILHOUETTE

Re-materialising CA's shapes is not enough — shape is what the eye reads first. Author new
`vectorPaths` on the existing `cut_contour` / `plate` / `foil_edge` / `chip_contour` /
`chip_plate` nodes, keeping their three concentric boxes so nothing else has to move.

- CA = chamfered octagon plate + hexagon badge. Fire & Smoke = ember banner + flame-crest disc.
- **Heritage** → pennant / trophy-plaque silhouette (notched swallowtail or a shield-footed
  plaque) — heraldic, symmetrical, gold.
- **Signature Spotlight** → minimal capsule / soft-rounded rectangle with a single cut corner —
  restraint is the identity; badge a plain disc with a hairline ring.
- **Prism Rush** → faceted crystal / angular prism shard — sharp diagonal facets, badge a
  rotated square or triangle-derived polygon.

Gotchas: Figma's `vectorPaths` parser **rejects commas** — write `C x1 y1 x2 y2 x y`. Keep the
path touching all four bounds of its box or the node's bbox and position shift. Check whether
any child (the badge's `GDE Shield`) now collides with the new silhouette and move it.

**The card border is NOT part of this** — one geometry for every finish, print-safe. Shape
variation applies to bonus die-cuts only.

**The GDE mark is not part of it either.** When you re-materialise a pack, certificate, badge or
proof, the sweep will happily recolour `brand_shield_foil`, `brand_wordmark_foil`,
`left_wordmark_foil`, `GDE Shield`, the `seal_*` group and the proof's `wm_tile` vectors. **They
must all stay the canonical silver ramp** (`1,1,1 / .78,.82,.87 / 1,1,1 / .68,.73,.80 / .93,.96,1`).
Exclude them from the sweep, or restore them afterwards and re-export. FS needed 74 nodes
restored, PR 14.

---

## 8 · Exports

| What | Where | How |
|---|---|---|
| Card FRONT/BACK, pack, certificate | `print-sources/output/<finish-folder>/GDE-<CODE>-…` | `get_screenshot` at native size → PIL `convert('RGB')` → save with `dpi=(300,300)` |
| Poster print | same folder, name contains `poster-` | same; ~33 MB, gitignored by that pattern |
| Sticker + badge | `exports/<finish-folder>/bonus/GDE-<CODE>-{sticker-name-number,badge-number}.png` | **`download_assets`** (honours the node's 2× transparent export settings). `get_screenshot` composites onto opaque white and CANNOT export transparency. Verify `im.getchannel('A').getextrema()` is `(0, 255)` |
| Card-flip faces | `card-flip/assets/<code>/card-{front,back}.png` (1500×2100) | `download_assets` on the flip frames, whose export settings are PNG @2× |

Folder names follow the existing pattern: `stadium-night`, `chrome-allstar`, `fire-and-smoke`
→ use `heritage`, `signature-spotlight`, `prism-rush`.

**Do not run `card-flip/render.sh`** when other builds may be running — every invocation writes
and deletes the shared `card-flip/out/frames/` directory, so two concurrent renders corrupt each
other. Export the faces and leave the render to the coordinating session.

---

## 9 · Verification before declaring done

- Screenshot every rebuilt artboard and actually look at it — the copper-plate and shrunken-
  lockup bugs were both invisible in the node data and obvious in the render.
- Pack fold/safe script: 0 problems.
- Wallpaper safe/focus script: 0 problems.
- Exported PNGs: correct pixel dimensions, `RGB` + 300 DPI for print, `RGBA` with real alpha for
  die-cuts.
- No `Russo One`, `Saira Condensed`, `Anton`, `Michroma` or `Inter` left anywhere on the page,
  and no CA image hash (`0956ffd5…`, `c5c5f76b…`) left in any fill.
